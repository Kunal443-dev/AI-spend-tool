"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const Audit_1 = require("../models/Audit");
vitest_1.vi.mock('../models/Audit', () => {
    const mockAuditInstance = {
        slug: 'acme-software-abc123',
        companyName: 'Acme Software',
        industry: 'Software Engineering',
        teamSize: 5,
        useCase: 'Engineering',
        tools: [
            { toolId: 'chatgpt', planId: 'plus', monthlySpend: 100, seats: 5, primaryUsage: 'coding' }
        ],
        results: {
            totalCurrentMonthlySpend: 100,
            totalOptimizedMonthlySpend: 100,
            totalMonthlySavings: 0,
            totalYearlySavings: 0,
            benchmark: {
                spendPerDev: 20,
                industryAveragePerDev: 120,
                comparisonMessage: 'Efficient'
            },
            recommendations: [],
            aiSummary: 'Stack is optimized.'
        },
        createdAt: new Date(),
        save: vitest_1.vi.fn().mockResolvedValue(true)
    };
    // Mock constructor function
    const MockAuditConstructor = vitest_1.vi.fn().mockImplementation(function (data) {
        return {
            ...mockAuditInstance,
            ...data,
            save: vitest_1.vi.fn().mockResolvedValue(true)
        };
    });
    // Attach static methods
    MockAuditConstructor.findOne = vitest_1.vi.fn();
    return {
        Audit: MockAuditConstructor
    };
});
vitest_1.vi.mock('../models/Lead', () => {
    const mockLeadInstance = {
        save: vitest_1.vi.fn().mockResolvedValue(true)
    };
    const MockLeadConstructor = vitest_1.vi.fn().mockImplementation(function (data) {
        return {
            ...mockLeadInstance,
            ...data,
            save: vitest_1.vi.fn().mockResolvedValue(true)
        };
    });
    return {
        Lead: MockLeadConstructor
    };
});
vitest_1.vi.mock('../services/emailService', () => {
    return {
        sendAuditReportEmail: vitest_1.vi.fn().mockResolvedValue('real_smtp')
    };
});
(0, vitest_1.describe)('AI Spend Audit API Endpoints', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)('should create a new audit and generate calculations', async () => {
        const response = await (0, supertest_1.default)(app_1.default)
            .post('/api/audits')
            .send({
            companyName: 'Acme Software',
            industry: 'Software Engineering',
            teamSize: 5,
            useCase: 'Engineering',
            tools: [
                { toolId: 'chatgpt', planId: 'plus', monthlySpend: 100, seats: 5, primaryUsage: 'coding' }
            ]
        });
        (0, vitest_1.expect)(response.status).toBe(201);
        (0, vitest_1.expect)(response.body).toHaveProperty('slug');
        (0, vitest_1.expect)(response.body.companyName).toBe('Acme Software');
    });
    (0, vitest_1.it)('should block submissions with honeypot fields', async () => {
        const response = await (0, supertest_1.default)(app_1.default)
            .post('/api/audits')
            .send({
            companyName: 'Acme Software',
            industry: 'Software Engineering',
            teamSize: 5,
            useCase: 'Engineering',
            tools: [],
            hp_name: 'bot-spammer' // Honeypot field filled
        });
        (0, vitest_1.expect)(response.status).toBe(400);
        (0, vitest_1.expect)(response.body).toHaveProperty('error', 'Invalid submission');
    });
    (0, vitest_1.it)('should return a sanitized, public-safe report for GET /report/:slug', async () => {
        const mockAudit = {
            slug: 'acme-software-abc123',
            companyName: 'Acme Software', // Private info
            industry: 'Software Engineering',
            teamSize: 5,
            useCase: 'Engineering',
            tools: [
                { toolId: 'chatgpt', planId: 'plus', monthlySpend: 100, seats: 5, primaryUsage: 'coding' }
            ],
            results: {
                totalCurrentMonthlySpend: 100,
                totalOptimizedMonthlySpend: 100,
                totalMonthlySavings: 0,
                totalYearlySavings: 0,
                benchmark: { spendPerDev: 20, industryAveragePerDev: 120, comparisonMessage: 'Efficient' },
                recommendations: [],
                aiSummary: 'Clean'
            },
            createdAt: new Date()
        };
        // Setup findOne mock
        Audit_1.Audit.findOne.mockResolvedValue(mockAudit);
        const response = await (0, supertest_1.default)(app_1.default).get('/api/audits/acme-software-abc123');
        (0, vitest_1.expect)(response.status).toBe(200);
        // Sanitized checks
        (0, vitest_1.expect)(response.body).not.toHaveProperty('companyName'); // Company name MUST NOT be present
        (0, vitest_1.expect)(response.body).toHaveProperty('slug', 'acme-software-abc123');
        (0, vitest_1.expect)(response.body).toHaveProperty('industry', 'Software Engineering');
        (0, vitest_1.expect)(response.body.tools[0]).not.toHaveProperty('activeUsageRate'); // Anonymized usage
    });
    (0, vitest_1.it)('should capture a lead and trigger email sending', async () => {
        const mockAudit = {
            _id: 'auditId123',
            slug: 'acme-software-abc123',
            companyName: 'Acme Software',
            industry: 'Software Engineering',
            teamSize: 5,
            useCase: 'Engineering',
            tools: [],
            results: { totalMonthlySavings: 100, recommendations: [], aiSummary: 'test' },
            createdAt: new Date()
        };
        Audit_1.Audit.findOne.mockResolvedValue(mockAudit);
        const response = await (0, supertest_1.default)(app_1.default)
            .post('/api/leads')
            .send({
            auditSlug: 'acme-software-abc123',
            email: 'test@acme.com',
            name: 'John Doe',
            company: 'Acme Software',
            consentToContact: true
        });
        (0, vitest_1.expect)(response.status).toBe(201);
        (0, vitest_1.expect)(response.body).toHaveProperty('message', 'Report sent successfully.');
    });
    (0, vitest_1.it)('should block lead capture with invalid email', async () => {
        const response = await (0, supertest_1.default)(app_1.default)
            .post('/api/leads')
            .send({
            auditSlug: 'acme-software-abc123',
            email: 'invalid-email',
            name: 'John Doe',
            company: 'Acme Software'
        });
        (0, vitest_1.expect)(response.status).toBe(400);
        (0, vitest_1.expect)(response.body).toHaveProperty('error', 'Invalid email address format');
    });
    (0, vitest_1.it)('should block lead capture with honeypot field', async () => {
        const response = await (0, supertest_1.default)(app_1.default)
            .post('/api/leads')
            .send({
            auditSlug: 'acme-software-abc123',
            email: 'test@acme.com',
            name: 'John Doe',
            company: 'Acme Software',
            hp_name: 'spam-bot'
        });
        (0, vitest_1.expect)(response.status).toBe(400);
        (0, vitest_1.expect)(response.body).toHaveProperty('error', 'Invalid submission');
    });
});
