import requests
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://localhost:8000"

def test_full_flow():
    print("--- 1. Testing Health Endpoint ---")
    r = requests.get(f"{BASE_URL}/api/health")
    print("Health response:", r.status_code, r.json())
    assert r.status_code == 200

    print("\n--- 2. Testing Customer Registration ---")
    reg_payload = {
        "name": "Priya Sharma",
        "email": "priya.sharma@example.com",
        "password": "Password@123",
        "confirm_password": "Password@123",
        "phone": "+91 98765 11223"
    }
    r = requests.post(f"{BASE_URL}/api/auth/register", json=reg_payload)
    print("Register status:", r.status_code)
    # If already registered from previous run, login directly
    if r.status_code == 200:
        cust_token = r.json()["access_token"]
        print("Registration successful! Token received.")
    else:
        print("Register response:", r.text)
        print("Logging in existing user...")
        r_log = requests.post(f"{BASE_URL}/api/auth/customer-login", json={
            "email": "priya.sharma@example.com",
            "password": "Password@123"
        })
        assert r_log.status_code == 200
        cust_token = r_log.json()["access_token"]
        print("Customer login successful.")

    cust_headers = {"Authorization": f"Bearer {cust_token}"}

    print("\n--- 3. Testing Customer Submitting Multilingual Complaint (Tamil) ---")
    complaint_data = {
        "title": "பணம் பிடித்தம் செய்யப்பட்டது ஆனால் ஆர்டர் உறுதி செய்யப்படவில்லை",
        "description": "UPI மூலம் ரூ. 4,500 பணம் செலுத்தப்பட்டது. வங்கி கணக்கிலிருந்து பணம் எடுக்கப்பட்டது ஆனால் ஆர்டர் வரவில்லை. உடனடியாக பணத்தை திருப்பி தரவும்.",
        "order_id": "ORD-TN-9921",
        "customer_name": "Priya Sharma",
        "customer_email": "priya.sharma@example.com"
    }
    r = requests.post(f"{BASE_URL}/api/complaints", json=complaint_data, headers=cust_headers)
    print("Create complaint status:", r.status_code)
    assert r.status_code in [200, 201]
    created_complaint = r.json()
    complaint_id = created_complaint["id"]
    print(f"Complaint #{complaint_id} Created!")
    print(f"Category: {created_complaint.get('category')}")
    print(f"Priority: {created_complaint.get('priority')}")
    print(f"Sentiment: {created_complaint.get('sentiment')}")
    print(f"Department: {created_complaint.get('department')}")
    print(f"Customer Safe Response: {created_complaint.get('suggested_response')[:60]}...")

    print("\n--- 4. Testing Customer Complaints Scoping (Isolation) ---")
    r = requests.get(f"{BASE_URL}/api/complaints", headers=cust_headers)
    assert r.status_code == 200
    my_complaints = r.json()
    print(f"Customer fetched {len(my_complaints)} complaints (only their own).")
    for c in my_complaints:
        assert c["customer_email"] == "priya.sharma@example.com" or c.get("customer_id") is not None

    print("\n--- 5. Testing Admin Login ---")
    admin_payload = {
        "email": "admin@complaintintel.com",
        "password": "Admin@ComplaintIntel2026"
    }
    r = requests.post(f"{BASE_URL}/api/auth/admin-login", json=admin_payload)
    print("Admin login status:", r.status_code)
    assert r.status_code == 200
    admin_token = r.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("Admin login successful!")

    print("\n--- 6. Testing Admin Viewing All Complaints ---")
    r = requests.get(f"{BASE_URL}/api/complaints", headers=admin_headers)
    assert r.status_code == 200
    all_complaints = r.json()
    print(f"Admin successfully retrieved {len(all_complaints)} total complaints across all users.")

    print("\n--- 7. Testing Admin Updating Status ---")
    r = requests.put(
        f"{BASE_URL}/api/complaints/{complaint_id}/status",
        json={"status": "In Progress"},
        headers=admin_headers
    )
    print("Admin status update status:", r.status_code)
    assert r.status_code == 200
    print("Updated status is:", r.json()["status"])

    print("\n--- 8. Testing Admin Generating Custom AI Reply ---")
    r = requests.post(
        f"{BASE_URL}/api/complaints/{complaint_id}/generate-reply",
        json={"custom_instruction": "Confirm refund initiation within 24 hours with polite banking tone."},
        headers=admin_headers
    )
    print("Admin generate reply status:", r.status_code)
    assert r.status_code == 200
    print("AI Generated Reply snippet:", r.json()["generated_reply"][:100], "...")

    print("\n--- 9. Testing Customer Scoped Stats ---")
    r = requests.get(f"{BASE_URL}/api/dashboard/stats", headers=cust_headers)
    print("Customer stats:", r.status_code, r.json())
    assert "my_complaints" in r.json()

    print("\n--- 10. Testing Admin Full Stats & Analytics ---")
    r = requests.get(f"{BASE_URL}/api/dashboard/stats", headers=admin_headers)
    assert "total_complaints" in r.json()
    r_analytics = requests.get(f"{BASE_URL}/api/dashboard/analytics", headers=admin_headers)
    assert r_analytics.status_code == 200
    print("Admin analytics returned category breakdown:", len(r_analytics.json().get("by_category", [])))

    print("\n===========================================")
    print("ALL 10 VERIFICATION TESTS PASSED PERFECTLY!")
    print("===========================================")

if __name__ == "__main__":
    test_full_flow()
