from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.models.complaint import Complaint
from app.schemas.complaint_schema import (
    ComplaintCreate,
    ComplaintResponse,
    ComplaintStatusUpdate,
    GenerateReplyRequest,
    GenerateReplyResponse
)
from app.services.complaint_service import complaint_service
from app.services.groq_service import groq_service
from app.utils.auth import get_current_user_optional, require_admin

router = APIRouter(prefix="/complaints", tags=["Complaints"])

@router.post("", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
def create_complaint(
    complaint_in: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Receives complaint, triggers Groq AI analysis, checks duplicates, stores in DB."""
    try:
        cust_id = current_user.id if current_user else None
        cust_name = current_user.name if current_user else complaint_in.customer_name
        cust_email = current_user.email if current_user else complaint_in.customer_email

        complaint = complaint_service.create_complaint(
            db=db,
            complaint_in=complaint_in,
            customer_id=cust_id,
            customer_name=cust_name,
            customer_email=cust_email
        )
        return complaint
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process and analyze complaint: {str(e)}"
        )

@router.get("", response_model=List[ComplaintResponse])
def get_complaints(
    search: Optional[str] = Query(None, description="Search keyword in title, description, email, order ID"),
    category: Optional[str] = Query(None, description="Filter by category"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    status: Optional[str] = Query(None, description="Filter by status"),
    sentiment: Optional[str] = Query(None, description="Filter by sentiment"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Retrieve filtered list of complaints (Customers only see their own tickets)."""
    cust_id = None
    cust_email = None

    if current_user and current_user.role == "customer":
        cust_id = current_user.id
        cust_email = current_user.email

    return complaint_service.get_complaints(
        db=db,
        customer_id=cust_id,
        customer_email=cust_email,
        search=search,
        category=category,
        priority=priority,
        status=status,
        sentiment=sentiment,
        skip=skip,
        limit=limit
    )

@router.get("/{complaint_id}", response_model=ComplaintResponse)
def get_complaint(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Retrieve full details of a single complaint with strict customer isolation."""
    complaint = complaint_service.get_complaint_by_id(db, complaint_id)
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Complaint #{complaint_id} not found")

    # If customer, verify ownership
    if current_user and current_user.role == "customer":
        is_owner = (
            (complaint.customer_id is not None and complaint.customer_id == current_user.id) or
            (complaint.customer_email.lower().strip() == current_user.email.lower().strip())
        )
        if not is_owner:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You do not have permission to view this customer's ticket."
            )

    return complaint

@router.put("/{complaint_id}/status", response_model=ComplaintResponse)
def update_status(
    complaint_id: int,
    update_data: ComplaintStatusUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Update complaint status (ADMIN ONLY: Pending -> In Progress -> Resolved)."""
    complaint = complaint_service.update_complaint_status(db, complaint_id, update_data.status)
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Complaint #{complaint_id} not found")
    return complaint

@router.post("/{complaint_id}/generate-reply", response_model=GenerateReplyResponse)
def generate_reply(
    complaint_id: int,
    req: Optional[GenerateReplyRequest] = None,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Generate an AI-powered polite response for customer correspondence (ADMIN ONLY)."""
    custom_instruction = req.custom_instruction if req else None
    reply = complaint_service.generate_reply_for_complaint(db, complaint_id, custom_instruction)
    if not reply:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Complaint #{complaint_id} not found")

    return GenerateReplyResponse(
        complaint_id=complaint_id,
        generated_reply=reply,
        model=groq_service.primary_model if groq_service.is_configured() else "Heuristic Resolution Generator"
    )

@router.post("/seed/demo-data", status_code=status.HTTP_200_OK)
def seed_demo_data(db: Session = Depends(get_db)):
    """Seed sample complaints for hackathon demonstration."""
    from app.database.init_db import seed_sample_complaints
    seeded_count = seed_sample_complaints(db)
    return {
        "message": f"Successfully seeded {seeded_count} demo complaints covering various scenarios.",
        "count": seeded_count
    }
