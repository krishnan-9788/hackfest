import datetime
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime
from app.database.database import Base

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    customer_id = Column(Integer, nullable=True, index=True)
    customer_name = Column(String(100), nullable=False)
    customer_email = Column(String(150), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    order_id = Column(String(100), nullable=True, index=True)

    # AI Analysis Fields
    category = Column(String(50), nullable=False, default="Other", index=True)
    priority = Column(String(20), nullable=False, default="Medium", index=True)
    department = Column(String(100), nullable=False, default="Customer Service", index=True)
    sentiment = Column(String(20), nullable=False, default="Neutral", index=True)
    summary = Column(Text, nullable=True)
    suggested_action = Column(Text, nullable=True)
    suggested_response = Column(Text, nullable=True)
    confidence = Column(Float, nullable=False, default=0.85)

    # Status & Management
    status = Column(String(30), nullable=False, default="Pending", index=True)  # Pending, In Progress, Resolved
    
    # Duplicate Detection
    is_duplicate = Column(Boolean, default=False, index=True)
    duplicate_of_id = Column(Integer, nullable=True)
    duplicate_reason = Column(String(255), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)
