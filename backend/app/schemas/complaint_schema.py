from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field

class ComplaintCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200, description="Complaint title")
    description: str = Field(..., min_length=5, description="Full complaint text (supports English or Tamil)")
    order_id: Optional[str] = Field(None, max_length=100, description="Optional order or transaction ID")
    customer_name: Optional[str] = Field(None, max_length=100, description="Customer name (optional if authenticated)")
    customer_email: Optional[EmailStr] = Field(None, description="Customer email (optional if authenticated)")

class AIAnalysisResult(BaseModel):
    category: str
    priority: str
    department: str
    sentiment: str
    summary: str
    suggested_action: str
    suggested_response: str
    confidence: float

class ComplaintStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(Pending|In Progress|Resolved)$")

class GenerateReplyRequest(BaseModel):
    custom_instruction: Optional[str] = None
    tone: Optional[str] = "Professional and Empathetic"

class GenerateReplyResponse(BaseModel):
    complaint_id: int
    generated_reply: str
    model: str

class ComplaintResponse(BaseModel):
    id: int
    customer_id: Optional[int] = None
    customer_name: str
    customer_email: str
    title: str
    description: str
    order_id: Optional[str] = None
    category: str
    priority: str
    department: str
    sentiment: str
    summary: Optional[str] = None
    suggested_action: Optional[str] = None
    suggested_response: Optional[str] = None
    confidence: float
    status: str
    is_duplicate: bool
    duplicate_of_id: Optional[int] = None
    duplicate_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DashboardStatsResponse(BaseModel):
    total_complaints: int
    pending_complaints: int
    in_progress_complaints: int
    resolved_complaints: int
    high_critical_complaints: int
    avg_confidence: float
    duplicate_count: int

class CustomerDashboardStatsResponse(BaseModel):
    my_complaints: int
    pending_complaints: int
    in_progress_complaints: int
    resolved_complaints: int

class CategoryCount(BaseModel):
    name: str
    count: int

class PriorityCount(BaseModel):
    name: str
    count: int

class SentimentCount(BaseModel):
    name: str
    count: int

class DepartmentCount(BaseModel):
    name: str
    count: int

class DashboardAnalyticsResponse(BaseModel):
    by_category: List[CategoryCount]
    by_priority: List[PriorityCount]
    by_sentiment: List[SentimentCount]
    by_department: List[DepartmentCount]
