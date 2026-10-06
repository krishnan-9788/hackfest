import os
import datetime
from sqlalchemy import text
from sqlalchemy.orm import Session
from dotenv import load_dotenv

load_dotenv()

from app.database.database import engine, Base, SessionLocal
from app.models.complaint import Complaint
from app.models.user import User
from app.utils.auth import get_password_hash

def init_database():
    """Initializes tables in SQLite database and runs safe schema migrations."""
    Base.metadata.create_all(bind=engine)

    # Safe column migration if table already exists
    with engine.connect() as conn:
        try:
            if engine.dialect.name == "sqlite":
                result = conn.execute(text("PRAGMA table_info(complaints)")).fetchall()
                col_names = [row[1] for row in result]
            else:
                result = conn.execute(text(
                    "SELECT column_name FROM information_schema.columns WHERE table_name = 'complaints'"
                )).fetchall()
                col_names = [row[0] for row in result]

            if col_names and "customer_id" not in col_names:
                conn.execute(text("ALTER TABLE complaints ADD COLUMN customer_id INTEGER"))
                conn.commit()
        except Exception as e:
            print(f"Schema check notice: {e}")

    # Initialize default admin user and demo customer user
    db = SessionLocal()
    try:
        init_default_users(db)
    finally:
        db.close()

def init_default_users(db: Session):
    admin_email = os.getenv("ADMIN_EMAIL", "admin@complaintintel.com").strip().lower()
    admin_password = os.getenv("ADMIN_PASSWORD", "Admin@ComplaintIntel2026").strip()

    # Check Admin Account
    admin_user = db.query(User).filter(User.email == admin_email).first()
    if not admin_user:
        admin_user = User(
            name="System Administrator",
            email=admin_email,
            password_hash=get_password_hash(admin_password),
            role="admin",
            phone="+1 800 555 0199"
        )
        db.add(admin_user)
        print(f"Created default Administrator account: {admin_email}")

    # Check Demo Customer Account (Ramesh Kumar)
    demo_cust_email = "ramesh@example.com"
    demo_cust = db.query(User).filter(User.email == demo_cust_email).first()
    if not demo_cust:
        demo_cust = User(
            name="Ramesh Kumar",
            email=demo_cust_email,
            password_hash=get_password_hash("Test@12345"),
            role="customer",
            phone="+91 98765 43210"
        )
        db.add(demo_cust)
        print(f"Created default Customer account: {demo_cust_email}")

    db.commit()

def seed_sample_complaints(db: Session) -> int:
    """Populates database with realistic sample complaints for hackathon demo."""
    # Find Ramesh or demo customer ID to link
    ramesh = db.query(User).filter(User.email == "ramesh@example.com").first()
    ramesh_id = ramesh.id if ramesh else None

    sample_records = [
        {
            "customer_id": ramesh_id,
            "customer_name": "Ramesh Kumar",
            "customer_email": "ramesh@example.com",
            "title": "Order delayed for 10 days",
            "description": "என்னோட order இன்னும் வரல. 10 நாள் ஆகுது. customer support phone எடுத்தா cut பண்ணுறாங்க. உடனே அனுப்ப ஏற்பாடு பண்ணுங்க.",
            "order_id": "ORD-98213",
            "category": "Delivery",
            "priority": "High",
            "department": "Delivery Support",
            "sentiment": "Angry",
            "summary": "Customer reported 10-day delivery delay in Tamil for order ORD-98213.",
            "suggested_action": "Contact delivery courier manager and expedite shipment.",
            "suggested_response": "Dear Ramesh, we sincerely apologize for the 10-day delay. We have contacted our courier hub to prioritize your delivery today.",
            "confidence": 0.93,
            "status": "In Progress",
            "is_duplicate": False,
            "duplicate_of_id": None,
            "created_at": datetime.datetime.utcnow() - datetime.timedelta(hours=14)
        },
        {
            "customer_id": None,
            "customer_name": "Rajesh Kumar",
            "customer_email": "rajesh.k@example.com",
            "title": "Amount debited twice during UPI payment",
            "description": "I attempted to purchase order #ORD-9921 using UPI. The transaction failed on the screen, but Rs. 4,500 was deducted twice from my HDFC bank account. Please refund the duplicate transaction immediately.",
            "order_id": "ORD-9921",
            "category": "Payment",
            "priority": "High",
            "department": "Payment Support",
            "sentiment": "Negative",
            "summary": "Customer charged twice for single failed transaction via UPI.",
            "suggested_action": "Audit payment gateway logs with HDFC PG and release duplicate debit.",
            "suggested_response": "Dear Rajesh, we apologize for the payment discrepancy. We have verified the duplicate charge and initiated an automatic refund of Rs. 4,500 to your bank account, which should reflect in 2-3 business days.",
            "confidence": 0.94,
            "status": "In Progress",
            "is_duplicate": False,
            "duplicate_of_id": None,
            "created_at": datetime.datetime.utcnow() - datetime.timedelta(days=1, hours=3)
        },
        {
            "customer_id": None,
            "customer_name": "Vikram Malhotra",
            "customer_email": "vikram.m@example.com",
            "title": "THIS IS UNACCEPTABLE! FRAUDULENT SERVICE!",
            "description": "I have been waiting 3 weeks for my refund after returning item #ORD-7710. Your executive promised it would take 48 hours. If I do not get my ₹12,000 back today, I will file an official complaint in consumer court and on social media!",
            "order_id": "ORD-7710",
            "category": "Refund",
            "priority": "Critical",
            "department": "Refund Team",
            "sentiment": "Angry",
            "summary": "Customer threatening consumer court over delayed ₹12,000 refund for 3 weeks.",
            "suggested_action": "High-priority finance clearance; manually trigger IMPS refund transfer within 2 hours.",
            "suggested_response": "Dear Vikram, we deeply regret the severe delay in your refund processing. Your refund of ₹12,000 has been flagged as critical and is being expedited via instant IMPS transfer today. A transaction receipt will be sent shortly.",
            "confidence": 0.97,
            "status": "Pending",
            "is_duplicate": False,
            "duplicate_of_id": None,
            "created_at": datetime.datetime.utcnow() - datetime.timedelta(hours=6)
        },
        {
            "customer_id": None,
            "customer_name": "Ananya Sharma",
            "customer_email": "ananya.s@example.com",
            "title": "Payment deducted again for same order",
            "description": "I submitted a complaint earlier for ORD-9921 where 4500 was deducted twice. Still seeing pending status in bank app.",
            "order_id": "ORD-9921",
            "category": "Payment",
            "priority": "High",
            "department": "Payment Support",
            "sentiment": "Negative",
            "summary": "Follow-up complaint regarding duplicate debit on order ORD-9921.",
            "suggested_action": "Link to existing ticket #1 and send status update to customer.",
            "suggested_response": "Dear Ananya, we have merged this with your ongoing ticket for ORD-9921. The refund is currently processing with your bank.",
            "confidence": 0.89,
            "status": "Pending",
            "is_duplicate": True,
            "duplicate_of_id": 1,
            "duplicate_reason": "Matching Order/Transaction ID #ORD-9921 (Complaint #1)",
            "created_at": datetime.datetime.utcnow() - datetime.timedelta(hours=2)
        },
        {
            "customer_id": None,
            "customer_name": "David Miller",
            "customer_email": "david.miller@example.com",
            "title": "500 Internal Server error during checkout step",
            "description": "Every time I enter shipping address and proceed to payment page, web application crashes with error 500. Tried Chrome and Firefox with cache cleared.",
            "order_id": None,
            "category": "Technical",
            "priority": "Medium",
            "department": "Technical Support",
            "sentiment": "Neutral",
            "summary": "User facing consistent 500 error on shipping address submission.",
            "suggested_action": "Inspect web server access logs for address validation exception.",
            "suggested_response": "Hello David, thank you for reporting this technical bug. Our engineering team is reviewing the server logs to deploy an immediate patch for this checkout issue.",
            "confidence": 0.93,
            "status": "In Progress",
            "is_duplicate": False,
            "duplicate_of_id": None,
            "created_at": datetime.datetime.utcnow() - datetime.timedelta(days=2)
        },
        {
            "customer_id": None,
            "customer_name": "Karthik Subramanian",
            "customer_email": "karthik.s@example.com",
            "title": "Delivered wrong size and damaged box",
            "description": "I ordered UK Size 10 running shoes, but the parcel contained UK Size 7 with the original packaging completely torn. Requesting quick exchange.",
            "order_id": "ORD-5540",
            "category": "Product",
            "priority": "Medium",
            "department": "Customer Service",
            "sentiment": "Negative",
            "summary": "Customer received incorrect shoe size with torn packaging.",
            "suggested_action": "Schedule free reverse pickup and dispatch correct UK Size 10 item.",
            "suggested_response": "Dear Karthik, we are very sorry for the dispatch error. We have arranged a courier pickup for tomorrow and dispatched the correct UK Size 10 pair.",
            "confidence": 0.92,
            "status": "Resolved",
            "is_duplicate": False,
            "duplicate_of_id": None,
            "created_at": datetime.datetime.utcnow() - datetime.timedelta(days=3)
        }
    ]

    added = 0
    for record in sample_records:
        exists = db.query(Complaint).filter(Complaint.title == record["title"]).first()
        if not exists:
            comp = Complaint(**record)
            db.add(comp)
            added += 1

    db.commit()
    return added

if __name__ == "__main__":
    init_database()
    db = SessionLocal()
    try:
        count = seed_sample_complaints(db)
        print(f"Database initialized and seeded {count} sample complaints.")
    finally:
        db.close()
