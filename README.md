# AI-Powered Intelligent Complaint Classification & Management System

An enterprise-grade, hackathon-ready customer support intelligence platform. The system ingests customer grievances in **English** and **Tamil**, automatically analyzes and classifies them with sub-second latency using **Groq API LLMs**, determines urgency/priority and emotional sentiment, routes the complaint to the appropriate department, prevents duplicates, and drafts empathetic resolution replies.

---

## 🌟 Key Features

1. **AI Automated Complaint Intake & Analysis**:
   - Classifies complaints into controlled categories (*Payment, Delivery, Product, Refund, Account, Technical, Service, Other*).
   - Gauges priority severity (*Low, Medium, High, Critical*) with automatic visual escalation warnings.
   - Detects customer sentiment (*Positive, Neutral, Negative, Angry*).
   - Generates executive summaries, recommended staff actions, and instant draft responses.
   - Outputs a confidence score ($0.0 - 1.0$).

2. **Multilingual NLP (English + Tamil)**:
   - Understands native Tamil complaints (e.g., *"என்னோட order இன்னும் வரல. 10 நாள் ஆகுது."*) and maps them accurately into English structured JSON.

3. **Lightweight Duplicate Detection**:
   - Detects recurring complaints based on duplicate Order/Transaction IDs, customer email cross-checks, and fuzzy text similarity matching.
   - Displays clear alert banners indicating the original ticket reference.

4. **AI-Powered Customer Reply Assistant**:
   - Generates contextual, polite, and empathetic responses tailored to the complaint.
   - Allows administrators to inject custom instructions/tone and edit before copying or sending.

5. **Executive SaaS Analytics Dashboard**:
   - High-level metric cards: Total Complaints, Pending Action, High/Critical count, Resolved, Duplicates, and Average AI Confidence.
   - Real-time charts for Category distribution, Priority urgency, Sentiment breakdown, and Departmental routing.
   - Priority attention feed highlighting angry or critical tickets requiring immediate escalation.

6. **Interactive Complaint Management**:
   - Search by keyword, title, description, email, or order ID.
   - Filter by category, priority, sentiment, and resolution status.
   - Update lifecycle state: `Pending` $\rightarrow$ `In Progress` $\rightarrow$ `Resolved`.

7. **Resilient Architecture**:
   - Zero hardcoding of API keys.
   - Graceful fallback: If the Groq API key is omitted or experiences rate limits, an intelligent local rule-based heuristic analyzer takes over seamlessly so demonstrations never fail.
   - One-click demo seed button to instantly populate realistic edge-case grievances.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    User["Customer / Support Agent"] -->|Submit Complaint / Web UI| Frontend["React + Vite + Tailwind CSS"]
    Frontend -->|REST API Requests| Backend["FastAPI Backend (Python)"]
    
    subgraph AI Intelligence Layer
        Backend -->|Prompt & Complaint Text| GroqService["Groq Service (groq-sdk)"]
        GroqService -->|Inference (Llama 3.3 70B / 8B)| GroqCloud["Groq Cloud API"]
        GroqCloud -->|Structured JSON Output| GroqService
        GroqService -.->|Fallback Heuristics if Offline| Backend
    end

    subgraph Data & Verification Layer
        Backend -->|Similarity & Duplicate Check| DupDetector["difflib Duplicate Engine"]
        Backend -->|ORM Queries & CRUD| SQLAlchemy["SQLAlchemy ORM"]
        SQLAlchemy -->|Persistence| SQLite[("SQLite DB: complaints.db")]
    end

    Backend -->|JSON Responses & Analytics| Frontend
```

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons.
- **Backend**: Python 3.11+, FastAPI, Uvicorn, Pydantic v2.
- **AI / LLM**: Groq Cloud API (`llama-3.3-70b-versatile` / `llama-3.1-8b-instant`).
- **Database**: SQLite with SQLAlchemy ORM.
- **Duplicate Engine**: Python `difflib` token sequence matching & Order ID indices.

---

## 📁 Folder Structure

```
hack fest/
├── backend/
│   ├── app/
│   │   ├── database/
│   │   │   ├── database.py       # SQLAlchemy engine & session factory
│   │   │   └── init_db.py        # Table initialization & demo seed data
│   │   ├── models/
│   │   │   └── complaint.py      # Complaint database model definition
│   │   ├── routes/
│   │   │   ├── complaint_routes.py # CRUD, filtering, reply generator, & seed
│   │   │   ├── dashboard_routes.py # Overview metrics & chart analytics
│   │   │   └── health_routes.py    # Health & AI connection status
│   │   ├── schemas/
│   │   │   └── complaint_schema.py # Pydantic request/response validation
│   │   ├── services/
│   │   │   ├── analytics_service.py # Aggregations for dashboard visualizations
│   │   │   ├── complaint_service.py # Business logic & duplicate check
│   │   │   └── groq_service.py      # Groq API integration & resilient parser
│   │   ├── utils/
│   │   │   └── prompts.py           # Structured prompts for Groq LLM
│   │   └── main.py                  # FastAPI entry point & CORS configuration
│   ├── .env.example                 # Template for environment variables
│   └── requirements.txt             # Backend dependencies
├── database/
│   └── complaints.db                # SQLite database file
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AnalysisResult.jsx   # AI classification & recommendations card
│   │   │   ├── ComplaintCard.jsx    # Card view item for grid mode
│   │   │   ├── ComplaintForm.jsx    # Intake form with 1-click test presets
│   │   │   ├── ComplaintTable.jsx   # Rich table with search, sort & filters
│   │   │   ├── LoadingSpinner.jsx   # Loading state spinner
│   │   │   ├── Navbar.jsx           # Top header with live status & demo seed
│   │   │   ├── PriorityBadge.jsx    # Priority, sentiment, & status badges
│   │   │   ├── Sidebar.jsx          # SaaS menu & system status sidebar
│   │   │   └── StatsCard.jsx        # Key metric indicator cards
│   │   ├── pages/
│   │   │   ├── ComplaintDetails.jsx # Detailed view, status updater & reply tool
│   │   │   ├── Complaints.jsx       # Complaints management list/grid
│   │   │   ├── Dashboard.jsx        # Executive intelligence dashboard
│   │   │   └── NewComplaint.jsx     # Intake portal page
│   │   ├── services/
│   │   │   └── api.js               # Frontend API client
│   │   ├── App.jsx                  # Main application container
│   │   ├── index.css                # Global Tailwind CSS definitions
│   │   └── main.jsx                 # React root mount
│   ├── package.json                 # Frontend dependencies & scripts
│   ├── tailwind.config.js           # Tailwind theme configuration
│   └── vite.config.js               # Vite config with backend proxy
├── run.bat                          # One-click Windows runner
├── .gitignore                       # Git ignore file
└── README.md                        # Documentation
```

---

## 🚀 Setup & Installation

### Prerequisites
- Python 3.10+ installed
- Node.js 18+ and npm installed
- Groq API Key (Free tier available at [console.groq.com](https://console.groq.com))

---

### Step 1: Configure Environment Variables

Navigate to the `backend/` directory, copy `.env.example` to `.env`, and provide your Groq API key:

```bash
cd backend
copy .env.example .env
```

Edit `backend/.env`:
```ini
GROQ_API_KEY=gsk_your_actual_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
PORT=8000
HOST=0.0.0.0
```

> **Note**: If `GROQ_API_KEY` is not provided or invalid, the system automatically activates its built-in rule-based heuristic classifier, ensuring your demo never breaks!

---

### Step 2: Backend Setup & Execution

Open a terminal:

```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Initialize database & seed sample records
python -m app.database.init_db

# Start FastAPI server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at:
- API Root: `http://localhost:8000`
- Interactive Swagger UI: `http://localhost:8000/docs`
- Health Endpoint: `http://localhost:8000/api/health`

---

### Step 3: Frontend Setup & Execution

Open a separate terminal:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

Frontend application will open at:
- Web Dashboard: `http://localhost:5173`

---

### ⚡ Quick Start on Windows (`run.bat`)

Double-click `run.bat` in the root folder or execute in command prompt:

```cmd
run.bat
```

This script automatically verifies dependencies, initializes the SQLite database, seeds demonstration data, and opens both the backend and frontend dev servers.

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check & Groq connection status |
| `POST` | `/api/complaints` | Submit complaint, triggers AI analysis & duplicate check |
| `GET` | `/api/complaints` | Fetch complaints with search, category, priority, and status filters |
| `GET` | `/api/complaints/{id}` | Retrieve full details of a specific complaint |
| `PUT` | `/api/complaints/{id}/status` | Update resolution status (`Pending`, `In Progress`, `Resolved`) |
| `POST` | `/api/complaints/{id}/generate-reply` | Generate AI customer resolution response |
| `POST` | `/api/complaints/seed/demo-data` | Populate database with sample hackathon demo complaints |
| `GET` | `/api/dashboard/stats` | Retrieve aggregate metrics for overview cards |
| `GET` | `/api/dashboard/analytics` | Retrieve breakdown counts for dashboard charts |

---

## 📝 Example Complaint & AI Output

### Example 1: English Complaint
**User Input**:
```json
{
  "customer_name": "Rajesh Kumar",
  "customer_email": "rajesh.k@example.com",
  "title": "Amount debited twice during UPI payment",
  "description": "I attempted to purchase order #ORD-9921 using UPI. The transaction failed on the screen, but Rs. 4,500 was deducted twice from my bank account. Please refund immediately.",
  "order_id": "ORD-9921"
}
```

**Groq AI Analysis Output**:
```json
{
  "category": "Payment",
  "priority": "High",
  "department": "Payment Support",
  "sentiment": "Negative",
  "summary": "Customer charged twice for a failed UPI transaction of Rs. 4,500 on order #ORD-9921.",
  "suggested_action": "Audit payment gateway logs with bank provider and release duplicate debit.",
  "suggested_response": "Dear Rajesh, we apologize for the payment discrepancy. We have verified the duplicate charge and initiated an automatic refund of Rs. 4,500 to your bank account, which should reflect in 2-3 business days.",
  "confidence": 0.94
}
```

---

### Example 2: Tamil Multilingual Input
**User Input**:
```json
{
  "customer_name": "Priya Murugan",
  "customer_email": "priya.m@example.com",
  "title": "ஆர்டர் இன்னும் வரல",
  "description": "என்னோட order இன்னும் வரல. 10 நாள் ஆகுது. customer support phone எடுத்தா cut பண்ணுறாங்க.",
  "order_id": "ORD-8412"
}
```

**Groq AI Analysis Output**:
```json
{
  "category": "Delivery",
  "priority": "High",
  "department": "Delivery Support",
  "sentiment": "Angry",
  "summary": "Customer reported 10-day delivery delay in Tamil and unhelpful phone support.",
  "suggested_action": "Escalate to courier hub manager and assign Tamil support agent to contact customer.",
  "suggested_response": "We apologize for the 10-day delay with your shipment. Our logistics supervisor is expediting your parcel and an agent will call you today with an exact delivery window.",
  "confidence": 0.91
}
```

---

## 🔮 Future Improvements

1. **Automated Email Dispatch**: Directly transmit AI-generated replies via SendGrid or AWS SES upon admin approval.
2. **Audio/Voice Complaint Support**: Ingest audio grievances using Groq Whisper API for speech-to-text before complaint classification.
3. **Omnichannel Ingestion**: Connect WhatsApp Business API and Zendesk/Freshdesk webhooks.
4. **SLA Breach Warnings**: Automated cron jobs to flag complaints breaching 24h or 48h response SLAs.
