from fastapi import APIRouter
from app.services.groq_service import groq_service

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check():
    connected, status_text = groq_service.check_connection()
    return {
        "status": "healthy",
        "service": "AI-Powered Complaint Intelligence API",
        "groq_configured": groq_service.is_configured(),
        "groq_connected": connected,
        "groq_status_text": status_text,
        "model": groq_service.primary_model
    }
