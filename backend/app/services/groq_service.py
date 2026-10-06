import os
import json
import logging
import re
from typing import Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Validated enum choices
VALID_CATEGORIES = ["Payment", "Delivery", "Product", "Refund", "Account", "Technical", "Service", "Other"]
VALID_PRIORITIES = ["Low", "Medium", "High", "Critical"]
VALID_SENTIMENTS = ["Positive", "Neutral", "Negative", "Angry"]
VALID_DEPARTMENTS = ["Payment Support", "Delivery Support", "Technical Support", "Customer Service", "Refund Team", "Account Support"]

class GroqService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY", "").strip()
        self.primary_model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        self.fallback_model = "llama-3.1-8b-instant"
        self.client = None
        self._init_client()

    def _init_client(self):
        # Refresh API key from env in case it was updated
        self.api_key = os.getenv("GROQ_API_KEY", "").strip()
        if self.api_key and self.api_key != "your_groq_api_key_here":
            try:
                from groq import Groq
                self.client = Groq(api_key=self.api_key)
                logger.info("Groq client initialized successfully.")
            except Exception as e:
                logger.error(f"Failed to initialize Groq client: {e}")
                self.client = None
        else:
            self.client = None
            logger.warning("GROQ_API_KEY is not set or using placeholder. Fallback heuristics will be active if needed.")

    def is_configured(self) -> bool:
        return self.client is not None

    def check_connection(self) -> tuple[bool, str]:
        """Verify real connectivity to Groq API."""
        self._init_client()
        if not self.client:
            return False, "AI Fallback Mode Active"
        try:
            # Quick lightweight models check
            self.client.models.list()
            return True, "Groq AI Connected"
        except Exception as e:
            logger.warning(f"Groq connectivity check failed: {e}")
            return False, "AI Fallback Mode Active"

    def clean_json_string(self, content: str) -> str:
        """Strip markdown fences, code blocks, or leading/trailing text."""
        content = content.strip()
        # Remove ```json ... ``` or ``` ... ```
        fence_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", content)
        if fence_match:
            return fence_match.group(1).strip()
        
        # If wrapped between first { and last }
        brace_match = re.search(r"(\{[\s\S]*\})", content)
        if brace_match:
            return brace_match.group(1).strip()
            
        return content

    def analyze_complaint(self, title: str, description: str, order_id: Optional[str] = None, customer_name: Optional[str] = None) -> Dict[str, Any]:
        """Analyzes a complaint using Groq LLM with structured JSON output and fallback resilience."""
        self._init_client()
        from app.utils.prompts import SYSTEM_COMPLAINT_ANALYSIS_PROMPT, build_complaint_user_prompt

        user_content = build_complaint_user_prompt(title, description, order_id, customer_name)

        if self.client:
            candidate_models = list(dict.fromkeys([self.primary_model, self.fallback_model, "llama-3.3-70b-versatile", "llama-3.1-8b-instant", "llama3-70b-8192", "llama3-8b-8192", "mixtral-8x7b-32768"]))
            for model in candidate_models:
                try:
                    response = self.client.chat.completions.create(
                        messages=[
                            {"role": "system", "content": SYSTEM_COMPLAINT_ANALYSIS_PROMPT},
                            {"role": "user", "content": user_content}
                        ],
                        model=model,
                        temperature=0.1,
                        response_format={"type": "json_object"}
                    )
                    raw_text = response.choices[0].message.content
                    cleaned_text = self.clean_json_string(raw_text)
                    data = json.loads(cleaned_text)
                    validated = self._validate_and_sanitize(data, description)
                    logger.info(f"Groq analysis succeeded with model {model}")
                    return validated
                except Exception as e:
                    logger.warning(f"Groq API error with model {model}: {e}")

        logger.info("Using intelligent local heuristic fallback for complaint analysis.")
        return self._heuristic_analysis(title, description, order_id)

    def _validate_and_sanitize(self, data: Dict[str, Any], raw_text: str) -> Dict[str, Any]:
        """Enforces schema standards and valid controlled vocabulary."""
        # Category
        category = str(data.get("category", "Other")).strip().title()
        if category not in VALID_CATEGORIES:
            # Map close matches
            cat_lower = category.lower()
            if "deliver" in cat_lower or "ship" in cat_lower:
                category = "Delivery"
            elif "pay" in cat_lower or "card" in cat_lower or "charge" in cat_lower:
                category = "Payment"
            elif "refund" in cat_lower or "money back" in cat_lower:
                category = "Refund"
            elif "account" in cat_lower or "login" in cat_lower or "password" in cat_lower:
                category = "Account"
            elif "tech" in cat_lower or "bug" in cat_lower or "crash" in cat_lower:
                category = "Technical"
            elif "product" in cat_lower or "defect" in cat_lower or "quality" in cat_lower:
                category = "Product"
            else:
                category = "Service"

        # Priority
        priority = str(data.get("priority", "Medium")).strip().capitalize()
        if priority not in VALID_PRIORITIES:
            priority = "Medium"

        # Department
        department = str(data.get("department", "Customer Service")).strip()
        if department not in VALID_DEPARTMENTS:
            dept_map = {
                "Payment": "Payment Support",
                "Refund": "Refund Team",
                "Delivery": "Delivery Support",
                "Product": "Customer Service",
                "Technical": "Technical Support",
                "Account": "Account Support",
                "Service": "Customer Service",
                "Other": "Customer Service"
            }
            department = dept_map.get(category, "Customer Service")

        # Sentiment
        sentiment = str(data.get("sentiment", "Neutral")).strip().capitalize()
        if sentiment not in VALID_SENTIMENTS:
            sentiment = "Negative"

        # Confidence
        try:
            confidence = float(data.get("confidence", 0.90))
            confidence = max(0.1, min(1.0, round(confidence, 2)))
        except (ValueError, TypeError):
            confidence = 0.88

        summary = data.get("summary") or f"Customer reporting an issue regarding {category.lower()}."
        suggested_action = data.get("suggested_action") or f"Review complaint details and route to {department}."
        suggested_response = data.get("suggested_response") or "Thank you for contacting us. We are looking into your complaint and will update you shortly."

        return {
            "category": category,
            "priority": priority,
            "department": department,
            "sentiment": sentiment,
            "summary": summary,
            "suggested_action": suggested_action,
            "suggested_response": suggested_response,
            "confidence": confidence
        }

    def _heuristic_analysis(self, title: str, description: str, order_id: Optional[str]) -> Dict[str, Any]:
        """Intelligent local fallback analyzer if Groq API is unavailable or unconfigured."""
        text = f"{title} {description}".lower()

        # Tamil keywords check
        is_tamil = any(ord(char) >= 0x0B80 and ord(char) <= 0x0BFF for char in text)

        # Keyword mapping
        if is_tamil:
            if "order" in text or "வரல" in text or "வந்தது" in text or "delivery" in text:
                category = "Delivery"
                department = "Delivery Support"
                priority = "High" if ("10" in text or "நாள்" in text or "நாட்கள்" in text) else "Medium"
                sentiment = "Negative"
                summary = "Customer reporting delayed delivery in Tamil."
                suggested_action = "Investigate shipment status and contact local delivery partner."
                suggested_response = "வணக்கம். உங்கள் ஆர்டர் தாமதத்திற்கு மன்னிக்கவும். எங்கள் குழு உடனடியாக நிலைமையை சரிபார்த்து உங்களை தொடர்பு கொள்ளும். (We apologize for the delay. Our team will verify the shipment status shortly.)"
            elif "பணம்" in text or "refund" in text or "திரும்ப" in text or "காசு" in text:
                category = "Refund"
                department = "Refund Team"
                priority = "High"
                sentiment = "Negative"
                summary = "Customer requesting refund in Tamil."
                suggested_action = "Verify transaction records and initiate refund processing."
                suggested_response = "வணக்கம். உங்கள் பணம் திரும்பப் பெறுதல் கோரிக்கை பெறப்பட்டது. எங்கள் கணக்கு குழு இதனை ஆய்வு செய்து வருகிறது."
            else:
                category = "Service"
                department = "Customer Service"
                priority = "Medium"
                sentiment = "Neutral"
                summary = "Customer query received in Tamil language."
                suggested_action = "Assign to Tamil speaking customer support agent."
                suggested_response = "வணக்கம். உங்கள் புகாருக்கு நன்றி. எங்கள் வாடிக்கையாளர் சேவை குழு விரைவில் உங்களை தொடர்பு கொள்ளும்."
            return {
                "category": category,
                "priority": priority,
                "department": department,
                "sentiment": sentiment,
                "summary": summary,
                "suggested_action": suggested_action,
                "suggested_response": suggested_response,
                "confidence": 0.89
            }

        # English analysis
        if any(w in text for w in ["fraud", "hacked", "stolen", "illegal", "lawyer", "police", "danger", "urgent", "emergency"]):
            priority = "Critical"
        elif any(w in text for w in ["unacceptable", "terrible", "disaster", "angry", "worst", "ridiculous", "immediately"]):
            priority = "High"
        elif any(w in text for w in ["delay", "waiting", "broken", "failed", "missing"]):
            priority = "Medium"
        else:
            priority = "Low"

        # Sentiment
        if any(w in text for w in ["furious", "angry", "worst", "scam", "cheat", "sue", "unacceptable"]):
            sentiment = "Angry"
        elif any(w in text for w in ["disappointed", "unhappy", "bad", "wrong", "delay", "broken", "problem", "error", "failed"]):
            sentiment = "Negative"
        elif any(w in text for w in ["thank", "appreciate", "helpful", "good", "pleased"]):
            sentiment = "Positive"
        else:
            sentiment = "Neutral"

        # Category & Department
        if any(w in text for w in ["refund", "money back", "reimbursement", "return money"]):
            category = "Refund"
            department = "Refund Team"
            action = "Check payment gateway records and initiate refund approval."
            response = "We have received your refund request. Our finance team is reviewing your transaction and will process eligible refunds within 3-5 business days."
        elif any(w in text for w in ["charge", "payment", "debited", "credit card", "upi", "double charged", "deducted", "transaction"]):
            category = "Payment"
            department = "Payment Support"
            action = "Audit transaction logs with payment gateway provider."
            response = "We apologize for the billing concern. Our payment specialists are investigating the transaction and will ensure any erroneous charges are reversed."
        elif any(w in text for w in ["delivery", "courier", "shipping", "tracking", "late", "arrived", "package", "dispatch"]):
            category = "Delivery"
            department = "Delivery Support"
            action = "Trace consignment with logistics partner and update ETA."
            response = "We apologize for the shipping delay. We have contacted our courier partner for an expedited status update and will notify you as soon as possible."
        elif any(w in text for w in ["login", "password", "otp", "account", "profile", "locked", "email"]):
            category = "Account"
            department = "Account Support"
            action = "Verify customer identity and send secure credential reset link."
            response = "We understand you are experiencing difficulty accessing your account. Our security team will assist you in restoring account access safely."
        elif any(w in text for w in ["bug", "crash", "error", "server", "app", "website", "glitch", "technical", "api"]):
            category = "Technical"
            department = "Technical Support"
            action = "Log bug report in engineering ticket queue with diagnostic logs."
            response = "Thank you for alerting us to this technical issue. Our engineering team has been notified and is working to deploy a fix."
        elif any(w in text for w in ["damaged", "broken", "quality", "product", "defective", "item", "size", "color"]):
            category = "Product"
            department = "Customer Service"
            action = "Request photo proof of damaged product and initiate replacement."
            response = "We are very sorry that the item you received did not meet quality standards. We will gladly arrange a replacement or return."
        else:
            category = "Service"
            department = "Customer Service"
            action = "Contact customer to gather further information and resolve query."
            response = "Thank you for reaching out. We have logged your complaint and our customer experience team will be in touch shortly."

        summary = f"Customer reported an issue regarding {title.lower()}."
        return {
            "category": category,
            "priority": priority,
            "department": department,
            "sentiment": sentiment,
            "summary": summary,
            "suggested_action": action,
            "suggested_response": response,
            "confidence": 0.85
        }

    def generate_reply(
        self,
        customer_name: str,
        title: str,
        description: str,
        category: str,
        department: str,
        priority: str,
        suggested_action: str,
        custom_instruction: Optional[str] = None
    ) -> str:
        """Generates an empathetic and professional customer reply using Groq."""
        self._init_client()
        from app.utils.prompts import SYSTEM_REPLY_GENERATOR_PROMPT, build_reply_user_prompt

        user_content = build_reply_user_prompt(
            customer_name, title, description, category, department, priority, suggested_action, custom_instruction
        )

        if self.client:
            candidate_models = list(dict.fromkeys([self.primary_model, self.fallback_model, "llama-3.3-70b-versatile", "llama-3.1-8b-instant", "llama3-70b-8192", "llama3-8b-8192", "mixtral-8x7b-32768"]))
            for model in candidate_models:
                try:
                    response = self.client.chat.completions.create(
                        messages=[
                            {"role": "system", "content": SYSTEM_REPLY_GENERATOR_PROMPT},
                            {"role": "user", "content": user_content}
                        ],
                        model=model,
                        temperature=0.3
                    )
                    reply_text = response.choices[0].message.content.strip()
                    if reply_text:
                        return reply_text
                except Exception as e:
                    logger.warning(f"Groq reply generation error with {model}: {e}")

        # Fallback professional reply
        return (
            f"Dear {customer_name},\n\n"
            f"Thank you for contacting us regarding your complaint: \"{title}\".\n\n"
            f"We sincerely apologize for the inconvenience and frustration this has caused you. "
            f"Your issue has been prioritized as {priority} and transferred directly to our {department}.\n\n"
            f"Our team has already initiated the following action: {suggested_action}. "
            f"We are actively working on resolving this matter and will provide you with a comprehensive update shortly.\n\n"
            f"If you have any additional details to share, please reply directly to this message.\n\n"
            f"Warm regards,\n"
            f"{department}\n"
            f"Customer Care Team"
        )

# Global singleton
groq_service = GroqService()
