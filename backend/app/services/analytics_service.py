from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from app.models.complaint import Complaint

class AnalyticsService:
    def get_dashboard_stats(self, db: Session) -> Dict[str, Any]:
        total = db.query(Complaint).count()
        if total == 0:
            return {
                "total_complaints": 0,
                "pending_complaints": 0,
                "in_progress_complaints": 0,
                "resolved_complaints": 0,
                "high_critical_complaints": 0,
                "avg_confidence": 0.0,
                "duplicate_count": 0
            }

        pending = db.query(Complaint).filter(Complaint.status == "Pending").count()
        in_progress = db.query(Complaint).filter(Complaint.status == "In Progress").count()
        resolved = db.query(Complaint).filter(Complaint.status == "Resolved").count()
        high_critical = db.query(Complaint).filter(Complaint.priority.in_(["High", "Critical"])).count()
        duplicate_count = db.query(Complaint).filter(Complaint.is_duplicate == True).count()
        avg_conf = db.query(func.avg(Complaint.confidence)).scalar() or 0.0

        return {
            "total_complaints": total,
            "pending_complaints": pending,
            "in_progress_complaints": in_progress,
            "resolved_complaints": resolved,
            "high_critical_complaints": high_critical,
            "avg_confidence": round(float(avg_conf), 2),
            "duplicate_count": duplicate_count
        }

    def get_customer_stats(self, db: Session, customer_id: Optional[int], customer_email: Optional[str]) -> Dict[str, Any]:
        clauses = []
        if customer_id is not None:
            clauses.append(Complaint.customer_id == customer_id)
        if customer_email is not None:
            clauses.append(Complaint.customer_email == customer_email.lower().strip())

        query = db.query(Complaint)
        if clauses:
            query = query.filter(or_(*clauses))
        else:
            return {
                "my_complaints": 0,
                "pending_complaints": 0,
                "in_progress_complaints": 0,
                "resolved_complaints": 0
            }

        total = query.count()
        pending = query.filter(Complaint.status == "Pending").count()
        in_progress = query.filter(Complaint.status == "In Progress").count()
        resolved = query.filter(Complaint.status == "Resolved").count()

        return {
            "my_complaints": total,
            "pending_complaints": pending,
            "in_progress_complaints": in_progress,
            "resolved_complaints": resolved
        }

    def get_dashboard_analytics(self, db: Session) -> Dict[str, Any]:
        # By Category
        cat_query = db.query(Complaint.category, func.count(Complaint.id)).group_by(Complaint.category).all()
        by_category = [{"name": cat or "Other", "count": count} for cat, count in cat_query]

        # By Priority
        prio_query = db.query(Complaint.priority, func.count(Complaint.id)).group_by(Complaint.priority).all()
        order = {"Critical": 1, "High": 2, "Medium": 3, "Low": 4}
        by_priority = sorted(
            [{"name": prio or "Medium", "count": count} for prio, count in prio_query],
            key=lambda x: order.get(x["name"], 5)
        )

        # By Sentiment
        sent_query = db.query(Complaint.sentiment, func.count(Complaint.id)).group_by(Complaint.sentiment).all()
        by_sentiment = [{"name": sent or "Neutral", "count": count} for sent, count in sent_query]

        # By Department
        dept_query = db.query(Complaint.department, func.count(Complaint.id)).group_by(Complaint.department).all()
        by_department = [{"name": dept or "Customer Service", "count": count} for dept, count in dept_query]

        return {
            "by_category": by_category,
            "by_priority": by_priority,
            "by_sentiment": by_sentiment,
            "by_department": by_department
        }

analytics_service = AnalyticsService()
