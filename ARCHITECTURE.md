## System Architecture Design

The AI Spend Audit application follows a clean client-server architecture using:

Frontend: React.js, Vite, TypeScript, Tailwind CSS
Backend: Node.js, Express.js, TypeScript
Database: MongoDB with Mongoose

The frontend communicates with Express APIs, while MongoDB stores audit reports and lead data.

A shared types layer (shared/types/index.ts) is used by both frontend and backend to avoid type mismatches and keep development consistent.

The audit system is built using a modular rule engine where each optimization check is separated into its own rule file like:

seatOverprovisionRule
toolOverlapRule
inactiveSeatsRule

This makes the system easier to maintain and scale.

For privacy, public report APIs return a sanitized version of audit data that excludes sensitive fields like company name, usage metrics, and lead information.

To support social media previews, the backend dynamically injects Open Graph meta tags into index.html for routes like /report/:slug.

Basic abuse protection is implemented using:

Rate Limiting to restrict excessive requests
Honeypot Fields to block automated spam bots silently