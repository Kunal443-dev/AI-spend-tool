# Testing Strategy & Documentation

This document explains the testing setup and validation strategy used in the AI Spend Audit platform.

---

# 1. Testing Framework

The backend testing environment uses:
- **Vitest** for running unit and integration tests
- **Supertest** for testing Express API routes

Vitest was chosen because it is lightweight, fast, and works well with TypeScript. Supertest allows API testing without running the server on an actual port, making tests cleaner and easier to manage.

---

# 2. Implemented Test Suites

Test files are located inside:

```txt
backend/src/tests/