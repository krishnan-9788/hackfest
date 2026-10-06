import sys
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_tests():
    print("=== Testing FastAPI Complaint Intelligence API ===")

    # 1. Health
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[PASS] 1. Health Check:", res.json())

    # 2. Seed / Initial complaints check
    res = client.get("/api/complaints")
    assert res.status_code == 200, f"Get complaints failed: {res.text}"
    complaints = res.json()
    print(f"[PASS] 2. Initial Complaints: Found {len(complaints)} records")

    # 3. Dashboard Stats
    res = client.get("/api/dashboard/stats")
    assert res.status_code == 200, f"Dashboard stats failed: {res.text}"
    print("[PASS] 3. Dashboard Stats:", res.json())

    # 4. Dashboard Analytics
    res = client.get("/api/dashboard/analytics")
    assert res.status_code == 200, f"Dashboard analytics failed: {res.text}"
    print(f"[PASS] 4. Analytics Breakdown: {len(res.json()['by_category'])} categories, {len(res.json()['by_priority'])} priorities")

    # 5. Create New Complaint (English Payment issue)
    payload_en = {
        "customer_name": "Meera Raman",
        "customer_email": "meera.raman@example.com",
        "title": "Double deducted from credit card for flight ticket",
        "description": "I tried booking flight order #FL-8812 and the page refreshed with error, but Rs 15,000 was deducted twice from my credit card! This is urgent!",
        "order_id": "FL-8812"
    }
    res = client.post("/api/complaints", json=payload_en)
    assert res.status_code == 201, f"Create complaint failed: {res.text}"
    created = res.json()
    print(f"[PASS] 5. Created Complaint #{created['id']}: Category={created['category']}, Priority={created['priority']}, Sentiment={created['sentiment']}")

    # 6. Test Duplicate Detection (Same order ID)
    payload_dup = {
        "customer_name": "Meera Raman",
        "customer_email": "meera.raman@example.com",
        "title": "Followup on duplicate debit for flight",
        "description": "Still have not received refund for Rs 15000 flight FL-8812",
        "order_id": "FL-8812"
    }
    res = client.post("/api/complaints", json=payload_dup)
    assert res.status_code == 201, f"Duplicate test failed: {res.text}"
    dup_res = res.json()
    assert dup_res["is_duplicate"] == True, "Failed to detect duplicate order ID"
    print(f"[PASS] 6. Duplicate Detection: is_duplicate={dup_res['is_duplicate']}, reason={dup_res['duplicate_reason']}")

    # 7. Create New Complaint in Tamil
    payload_ta = {
        "customer_name": "சுரேஷ் மணி",
        "customer_email": "suresh.m@example.com",
        "title": "பார்சல் வரவில்லை",
        "description": "என்னோட order இன்னும் வரல. 10 நாள் ஆகுது. customer support phone எடுத்தா cut பண்ணுறாங்க.",
        "order_id": "ORD-TA-101"
    }
    res = client.post("/api/complaints", json=payload_ta)
    assert res.status_code == 201, f"Tamil complaint failed: {res.text}"
    ta_res = res.json()
    print(f"[PASS] 7. Tamil Complaint Analysis: Category={ta_res['category']}, Priority={ta_res['priority']}, Department={ta_res['department']}")

    # 8. Status update
    res = client.put(f"/api/complaints/{created['id']}/status", json={"status": "In Progress"})
    assert res.status_code == 200
    assert res.json()["status"] == "In Progress"
    print(f"[PASS] 8. Status Update: Updated ticket #{created['id']} to In Progress")

    # 9. Generate AI reply
    res = client.post(f"/api/complaints/{created['id']}/generate-reply", json={"custom_instruction": "Mention reference number RTGS-990"})
    assert res.status_code == 200
    reply_res = res.json()
    assert "generated_reply" in reply_res and len(reply_res["generated_reply"]) > 20
    print(f"[PASS] 9. AI Reply Generation: Generated {len(reply_res['generated_reply'])} chars")

    print("\n>>> ALL BACKEND API & AI INTEGRATION TESTS PASSED 100%! <<<\n")

if __name__ == "__main__":
    run_tests()
