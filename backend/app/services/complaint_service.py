import difflib
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc

from app.models.complaint import Complaint
from app.schemas.complaint_schema import ComplaintCreate
from app.services.groq_service import groq_service

class ComplaintService:
    def detect_duplicate(self, db: Session, complaint_in: ComplaintCreate) -> Tuple[bool, Optional[int], Optional[str]]:
        """Lightweight text and metadata duplicate detection using difflib and order ID matching."""
        # Check 1: Same Order ID if provided
        if complaint_in.order_id and complaint_in.order_id.strip():
            order_match = db.query(Complaint).filter(
                Complaint.order_id == complaint_in.order_id.strip()
            ).order_by(desc(Complaint.created_at)).first()
            if order_match:
                return True, order_match.id, f"Matching Order/Transaction ID #{order_match.order_id} (Complaint #{order_match.id})"

        # Check 2: Same customer email + text similarity > 65%
        if complaint_in.customer_email:
            email_complaints = db.query(Complaint).filter(
                Complaint.customer_email == complaint_in.customer_email.lower().strip()
            ).all()
            for comp in email_complaints:
                source_text = f"{comp.title} {comp.description}".lower()
                target_text = f"{complaint_in.title} {complaint_in.description}".lower()
                ratio = difflib.SequenceMatcher(None, source_text, target_text).ratio()
                if ratio >= 0.65:
                    return True, comp.id, f"High similarity ({int(ratio * 100)}%) from same customer email (Complaint #{comp.id})"

        # Check 3: Global high similarity across recent complaints (> 85%)
        recent_complaints = db.query(Complaint).order_by(desc(Complaint.created_at)).limit(50).all()
        for comp in recent_complaints:
            source_text = f"{comp.title} {comp.description}".lower()
            target_text = f"{complaint_in.title} {complaint_in.description}".lower()
            ratio = difflib.SequenceMatcher(None, source_text, target_text).ratio()
            if ratio >= 0.85:
                return True, comp.id, f"Near-identical text similarity ({int(ratio * 100)}%) with Complaint #{comp.id}"

        return False, None, None

    def create_complaint(
        self,
        db: Session,
        complaint_in: ComplaintCreate,
        customer_id: Optional[int] = None,
        customer_name: Optional[str] = None,
        customer_email: Optional[str] = None
    ) -> Complaint:
        """Analyzes, checks for duplicates, and saves a new complaint."""
        final_name = (customer_name or complaint_in.customer_name or "Anonymous Customer").strip()
        final_email = (customer_email or complaint_in.customer_email or "customer@example.com").lower().strip()

        # Ensure complaint_in has the emails for duplicate checking
        complaint_in.customer_name = final_name
        complaint_in.customer_email = final_email

        # 1. AI Analysis via Groq
        analysis = groq_service.analyze_complaint(
            title=complaint_in.title,
            description=complaint_in.description,
            order_id=complaint_in.order_id,
            customer_name=final_name
        )

        # 2. Duplicate detection
        is_dup, dup_id, dup_reason = self.detect_duplicate(db, complaint_in)

        # 3. Create model record
        complaint = Complaint(
            customer_id=customer_id,
            customer_name=final_name,
            customer_email=final_email,
            title=complaint_in.title.strip(),
            description=complaint_in.description.strip(),
            order_id=complaint_in.order_id.strip() if complaint_in.order_id else None,
            category=analysis["category"],
            priority=analysis["priority"],
            department=analysis["department"],
            sentiment=analysis["sentiment"],
            summary=analysis["summary"],
            suggested_action=analysis["suggested_action"],
            suggested_response=analysis["suggested_response"],
            confidence=analysis["confidence"],
            status="Pending",
            is_duplicate=is_dup,
            duplicate_of_id=dup_id,
            duplicate_reason=dup_reason
        )

        db.add(complaint)
        db.commit()
        db.refresh(complaint)
        return complaint

    def get_complaints(
        self,
        db: Session,
        customer_id: Optional[int] = None,
        customer_email: Optional[str] = None,
        search: Optional[str] = None,
        category: Optional[str] = None,
        priority: Optional[str] = None,
        status: Optional[str] = None,
        sentiment: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Complaint]:
        query = db.query(Complaint)

        # Customer role scoping: only see their own tickets
        if customer_id is not None or customer_email is not None:
            clauses = []
            if customer_id is not None:
                clauses.append(Complaint.customer_id == customer_id)
            if customer_email is not None:
                clauses.append(Complaint.customer_email == customer_email.lower().strip())
            query = query.filter(or_(*clauses))

        if search:
            search_term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Complaint.title.ilike(search_term),
                    Complaint.description.ilike(search_term),
                    Complaint.customer_name.ilike(search_term),
                    Complaint.customer_email.ilike(search_term),
                    Complaint.order_id.ilike(search_term),
                    Complaint.department.ilike(search_term)
                )
            )

        if category and category != "All":
            query = query.filter(Complaint.category == category)

        if priority and priority != "All":
            query = query.filter(Complaint.priority == priority)

        if status and status != "All":
            query = query.filter(Complaint.status == status)

        if sentiment and sentiment != "All":
            query = query.filter(Complaint.sentiment == sentiment)

        return query.order_by(desc(Complaint.created_at)).offset(skip).limit(limit).all()

    def get_complaint_by_id(self, db: Session, complaint_id: int) -> Optional[Complaint]:
        return db.query(Complaint).filter(Complaint.id == complaint_id).first()

    def update_complaint_status(self, db: Session, complaint_id: int, new_status: str) -> Optional[Complaint]:
        complaint = self.get_complaint_by_id(db, complaint_id)
        if not complaint:
            return None
        complaint.status = new_status
        db.commit()
        db.refresh(complaint)
        return complaint

    def generate_reply_for_complaint(
        self,
        db: Session,
        complaint_id: int,
        custom_instruction: Optional[str] = None
    ) -> Optional[str]:
        complaint = self.get_complaint_by_id(db, complaint_id)
        if not complaint:
            return None

        reply = groq_service.generate_reply(
            customer_name=complaint.customer_name,
            title=complaint.title,
            description=complaint.description,
            category=complaint.category,
            department=complaint.department,
            priority=complaint.priority,
            suggested_action=complaint.suggested_action or "Review complaint",
            custom_instruction=custom_instruction
        )
        return reply

complaint_service = ComplaintService()
