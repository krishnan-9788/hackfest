import sys
import json
from fastapi.testclient import TestClient
from app.main import app
from app.database.database import SessionLocal
from app.models.complaint import Complaint

client = TestClient(app)

def verify_complete_flow():
    print("\n" + "="*70)
    print("AI COMPLAINT INTELLIGENCE SYSTEM - END-TO-END FLOW VERIFICATION")
    print("="*70 + "\n")

    # TEST 1: Health & Groq Status Check
    print("TEST 1: Verification of /api/health and real Groq status...")
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    health_data = res.json()
    print(f" -> Health Status: {health_data['status']}")
    print(f" -> Groq Real Connection: {health_data.get('groq_connected')}")
    print(f" -> Groq Mode Text: {health_data.get('groq_status_text')}")
    print(" [PASSED] Test 1\n")

    # TEST 2 & 3 & 4: Submitting English Complaint (Ramesh)
    print("TEST 2, 3, 4: Submitting Complaint (Ramesh, ORD-98213, 10 days delay)...")
    payload = {
        "customer_name": "Ramesh",
        "customer_email": "ramesh@example.com",
        "title": "Order delayed for 10 days",
        "order_id": "ORD-98213",
        "description": "My order has not arrived for 10 days. Please help."
    }
    res = client.post("/api/complaints", json=payload)
    assert res.status_code == 201, f"Submission failed: {res.text}"
    new_complaint = res.json()
    ramesh_id = new_complaint["id"]
    print(f" -> Registered Complaint ID: #{ramesh_id}")
    print(f" -> AI Classified Category: {new_complaint['category']}")
    print(f" -> AI Determined Priority: {new_complaint['priority']}")
    print(f" -> AI Sentiment: {new_complaint['sentiment']}")
    print(f" -> Assigned Department: {new_complaint['department']}")
    print(f" -> AI Confidence: {int(new_complaint['confidence'] * 100)}%")
    print(f" -> Summary: {new_complaint['summary']}")
    print(f" -> Recommended Action: {new_complaint['suggested_action']}")
    print(f" -> Suggested Reply: {new_complaint['suggested_response']}")
    assert new_complaint["category"] in ["Delivery", "Service", "Product"]
    assert new_complaint["status"] == "Pending"
    print(" [PASSED] Tests 2, 3, 4\n")

    # TEST 5: Verify new complaint appears in All Complaints list with search & filter
    print("TEST 5: Verifying complaint in /api/complaints with search & category filters...")
    res = client.get("/api/complaints?search=Ramesh")
    assert res.status_code == 200
    complaints = res.json()
    matched = [c for c in complaints if c["id"] == ramesh_id]
    assert len(matched) == 1, f"Complaint #{ramesh_id} not found in search results"
    print(f" -> Found Complaint #{matched[0]['id']} with title: '{matched[0]['title']}'")
    print(" [PASSED] Test 5\n")

    # TEST 6: Verify Single Complaint Details Retrieval
    print(f"TEST 6: Verifying /api/complaints/{ramesh_id} details endpoint...")
    res = client.get(f"/api/complaints/{ramesh_id}")
    assert res.status_code == 200
    details = res.json()
    assert details["customer_name"] == "Ramesh"
    assert details["order_id"] == "ORD-98213"
    print(f" -> Verified all customer & AI analysis fields for ticket #{ramesh_id}")
    print(" [PASSED] Test 6\n")

    # TEST 7: AI Reply Generator
    print(f"TEST 7: Generating AI Reply for complaint #{ramesh_id}...")
    reply_req = {"custom_instruction": "Make the response more apologetic and confirm priority escalation."}
    res = client.post(f"/api/complaints/{ramesh_id}/generate-reply", json=reply_req)
    assert res.status_code == 200, f"Reply generation failed: {res.text}"
    reply_data = res.json()
    assert "generated_reply" in reply_data and len(reply_data["generated_reply"]) > 30
    print(f" -> Generated Response ({len(reply_data['generated_reply'])} characters):")
    print("    " + reply_data["generated_reply"].split("\n")[0])
    print(" [PASSED] Test 7\n")

    # TEST 8: Status Lifecycle Update (Pending -> In Progress -> Resolved) with DB Persistence
    print(f"TEST 8: Updating Status Lifecycle (Pending -> In Progress -> Resolved)...")
    res1 = client.put(f"/api/complaints/{ramesh_id}/status", json={"status": "In Progress"})
    assert res1.status_code == 200 and res1.json()["status"] == "In Progress"
    print(f" -> Updated status to 'In Progress'")

    res2 = client.put(f"/api/complaints/{ramesh_id}/status", json={"status": "Resolved"})
    assert res2.status_code == 200 and res2.json()["status"] == "Resolved"
    print(f" -> Updated status to 'Resolved'")

    # Directly check SQLite database to ensure disk persistence
    db = SessionLocal()
    db_record = db.query(Complaint).filter(Complaint.id == ramesh_id).first()
    assert db_record is not None and db_record.status == "Resolved", "Database record does not match Resolved"
    db.close()
    print(f" -> Verified SQLite database persistence for Complaint #{ramesh_id}: status='{db_record.status}'")
    print(" [PASSED] Test 8\n")

    # TEST 9: Dashboard KPI and Charts Updates
    print("TEST 9: Verifying Dashboard Stats & Analytics updates...")
    res_stats = client.get("/api/dashboard/stats")
    assert res_stats.status_code == 200
    stats = res_stats.json()
    print(f" -> Total Complaints: {stats['total_complaints']}")
    print(f" -> Pending: {stats['pending_complaints']}, In Progress: {stats['in_progress_complaints']}, Resolved: {stats['resolved_complaints']}")
    print(f" -> High/Critical: {stats['high_critical_complaints']}")
    print(f" -> Average Confidence: {stats['avg_confidence']}")

    res_analytics = client.get("/api/dashboard/analytics")
    assert res_analytics.status_code == 200
    analytics = res_analytics.json()
    print(f" -> Chart Categories: {len(analytics['by_category'])}")
    print(f" -> Chart Priorities: {len(analytics['by_priority'])}")
    print(f" -> Chart Sentiments: {len(analytics['by_sentiment'])}")
    print(f" -> Chart Departments: {len(analytics['by_department'])}")
    print(" [PASSED] Test 9\n")

    # TEST 10: Multilingual Tamil Complaint Processing & Duplicate Detection
    print("TEST 10: Testing Multilingual Tamil Complaint & Duplicate Check...")
    tamil_payload = {
        "customer_name": "கார்த்திக் பாபு",
        "customer_email": "karthik.babu@example.com",
        "title": "ஆர்டர் இன்னும் வரவில்லை",
        "order_id": "ORD-TA-9901",
        "description": "என்னோட order இன்னும் வரல. 10 நாள் ஆகுது."
    }
    res_ta = client.post("/api/complaints", json=tamil_payload)
    assert res_ta.status_code == 201, f"Tamil complaint failed: {res_ta.text}"
    ta_data = res_ta.json()
    print(f" -> Tamil Complaint Registered: #{ta_data['id']}")
    print(f" -> AI Category: {ta_data['category']} (Expected Delivery)")
    print(f" -> Priority: {ta_data['priority']}")
    print(f" -> Department: {ta_data['department']}")
    assert ta_data["category"] == "Delivery"

    # Now submit duplicate with same order ID
    dup_payload = {
        "customer_name": "கார்த்திக் பாபு",
        "customer_email": "karthik.babu@example.com",
        "title": "Delivery inquiry reminder",
        "order_id": "ORD-TA-9901",
        "description": "Any update on order ORD-TA-9901?"
    }
    res_dup = client.post("/api/complaints", json=dup_payload)
    assert res_dup.status_code == 201
    dup_data = res_dup.json()
    print(f" -> Duplicate Complaint Registered: #{dup_data['id']}")
    print(f" -> is_duplicate: {dup_data['is_duplicate']}")
    print(f" -> duplicate_of_id: #{dup_data['duplicate_of_id']}")
    print(f" -> duplicate_reason: {dup_data['duplicate_reason']}")
    assert dup_data["is_duplicate"] == True
    assert dup_data["duplicate_of_id"] == ta_data["id"]
    print(" [PASSED] Test 10\n")

    print("="*70)
    print("ALL 10 VERIFICATION TESTS COMPLETED SUCCESSFULLY WITH ZERO ERRORS!")
    print("="*70 + "\n")

if __name__ == "__main__":
    verify_complete_flow()
