# LLM Prompt Engineering & System Instructions

This document explains how AI-generated audit summaries are created inside the AI Spend Audit platform.

---

## 1. Prompt System

The platform uses the `gemini-1.5-flash` model through the official Google Generative AI SDK.

The backend dynamically builds prompts using company details, spending data, and detected inefficiencies. The AI is instructed to behave like a startup CFO and product advisor, helping generate professional and business-focused summaries.

The generated response is intentionally kept short so it fits cleanly inside the dashboard UI without requiring markdown rendering or additional formatting.

---

## 2. Prompt Engineering Strategy

The prompts are designed to keep outputs structured, reliable, and concise.

Key techniques used:
- Defining a clear business-oriented AI role
- Providing exact spending and savings calculations
- Limiting response length
- Preventing markdown, links, or bullet points
- Keeping summaries action-oriented and easy to read

This helps reduce hallucinations and keeps generated reports consistent across different audits.

---

## 3. Fallback System

If the Gemini API is unavailable or no API key is configured, the backend automatically switches to a rule-based fallback system.

Instead of relying on AI generation, the application creates summaries directly from audit results and detected inefficiencies. This ensures the platform continues working even during API failures or offline execution.

The fallback system can generate:
- Optimization success summaries
- Waste detection summaries
- Savings-focused recommendations based on pricing inefficiencies

This approach keeps the application reliable, lightweight, and fully functional without depending entirely on external AI services.