from typing import Optional, Union, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.schemas.complaint_schema import DashboardStatsResponse, CustomerDashboardStatsResponse, DashboardAnalyticsResponse
from app.services.analytics_service import analytics_service
from app.utils.auth import get_current_user_optional, require_admin

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Retrieve overview metrics (Admin sees global, Customer sees own tickets)."""
    if current_user and current_user.role == "customer":
        return analytics_service.get_customer_stats(db, customer_id=current_user.id, customer_email=current_user.email)
    
    return analytics_service.get_dashboard_stats(db)

@router.get("/analytics", response_model=DashboardAnalyticsResponse)
def get_dashboard_analytics(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Retrieve categorized breakdowns for dashboard charts (ADMIN ONLY)."""
    return analytics_service.get_dashboard_analytics(db)
