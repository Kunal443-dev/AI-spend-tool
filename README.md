# AI Spend Audit Web Application

AI Spend Audit is a full-stack web application designed to help companies identify unnecessary spending across modern AI tools like ChatGPT, Claude, Cursor, Copilot, and Gemini.

The platform analyzes company AI subscriptions, detects pricing inefficiencies, and generates optimization recommendations with estimated savings reports.

---

# Tech Stack

### Frontend
- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose

### Testing & Security
- Vitest
- Supertest
- express-rate-limit
- Honeypot spam protection

---

# Project Structure

- `/frontend` → React client application
- `/backend` → Express API server and audit engine
- `/shared/types` → Shared TypeScript interfaces
- `ARCHITECTURE.md` → System design and backend flow
- `PRICING_DATA.md` → AI tool pricing catalog

---

# Local Setup

## Prerequisites
- Node.js v18+
- MongoDB local instance or MongoDB Atlas URI

---

## Install Dependencies

### Backend
```bash
cd backend
npm install