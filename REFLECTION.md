# Engineering Reflection & Mentorship Notes

This document highlights some of the key engineering decisions, tradeoffs, and development approaches used while building the AI Spend Audit platform.

---

# 1. Monorepo Structure

The project uses a monorepo-style setup where the frontend, backend, and shared types exist inside the same workspace.

A shared `types` directory helps both the React frontend and Express backend use the same interfaces, reducing duplication and preventing type mismatches.

The main challenge with this approach was configuring TypeScript and Vite to properly resolve shared paths outside their default workspace directories.

---

# 2. Lightweight Open Graph Injection

Instead of using heavy SSR frameworks like Next.js, the backend directly injects Open Graph meta tags into the compiled `index.html` file for public report pages.

This approach keeps the application lightweight while still allowing social platforms like Twitter, Slack, and LinkedIn to generate proper preview cards.

The solution is simple, fast, and avoids additional hosting or rendering costs.

---

# 3. Modular Rule Engine

The audit engine is built using independent rule modules instead of one large business logic file.

Each optimization rule is isolated inside its own file and follows a shared `AuditRule` interface. This makes the system easier to scale and maintain whenever new pricing rules or AI tools need to be added.

One challenge was preventing multiple rules from calculating duplicate savings for the same tool. This was solved inside the main engine by merging and validating savings results carefully.

---

# 4. API Reliability & Fallbacks

The application does not fully depend on external AI APIs.

If the Gemini API becomes unavailable or rate-limited, the backend automatically switches to a local rule-based summary generator. This ensures the platform continues working normally without breaking the user experience.

The fallback system still produces meaningful and professional audit summaries based entirely on calculated savings and detected inefficiencies.