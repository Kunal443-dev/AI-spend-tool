import { vi, describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app';
import { Audit } from '../models/Audit';

vi.mock('../models/Audit', () => {
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
    save: vi.fn().mockResolvedValue(true)
  };

  // Mock constructor function
  const MockAuditConstructor = vi.fn().mockImplementation(function(data) {
    return {
      ...mockAuditInstance,
      ...data,
      save: vi.fn().mockResolvedValue(true)
    };
  });

  // Attach static methods
  (MockAuditConstructor as any).findOne = vi.fn();

  return {
    Audit: MockAuditConstructor
  };
});

vi.mock('../models/Lead', () => {
  const mockLeadInstance = {
    save: vi.fn().mockResolvedValue(true)
  };
  const MockLeadConstructor = vi.fn().mockImplementation(function(data) {
    return {
      ...mockLeadInstance,
      ...data,
      save: vi.fn().mockResolvedValue(true)
    };
  });
  return {
    Lead: MockLeadConstructor
  };
});

vi.mock('../services/emailService', () => {
  return {
    sendAuditReportEmail: vi.fn().mockResolvedValue('real_smtp')
  };
});

describe('AI Spend Audit API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a new audit and generate calculations', async () => {
    const response = await request(app)
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

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('slug');
    expect(response.body.companyName).toBe('Acme Software');
  });

  it('should block submissions with honeypot fields', async () => {
    const response = await request(app)
      .post('/api/audits')
      .send({
        companyName: 'Acme Software',
        industry: 'Software Engineering',
        teamSize: 5,
        useCase: 'Engineering',
        tools: [],
        hp_name: 'bot-spammer' // Honeypot field filled
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Invalid submission');
  });

  it('should return a sanitized, public-safe report for GET /report/:slug', async () => {
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
    (Audit.findOne as any).mockResolvedValue(mockAudit);

    const response = await request(app).get('/api/audits/acme-software-abc123');

    expect(response.status).toBe(200);
    // Sanitized checks
    expect(response.body).not.toHaveProperty('companyName'); // Company name MUST NOT be present
    expect(response.body).toHaveProperty('slug', 'acme-software-abc123');
    expect(response.body).toHaveProperty('industry', 'Software Engineering');
    expect(response.body.tools[0]).not.toHaveProperty('activeUsageRate'); // Anonymized usage
  });

  it('should capture a lead and trigger email sending', async () => {
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
    (Audit.findOne as any).mockResolvedValue(mockAudit);

    const response = await request(app)
      .post('/api/leads')
      .send({
        auditSlug: 'acme-software-abc123',
        email: 'test@acme.com',
        name: 'John Doe',
        company: 'Acme Software',
        consentToContact: true
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'Report sent successfully.');
  });

  it('should block lead capture with invalid email', async () => {
    const response = await request(app)
      .post('/api/leads')
      .send({
        auditSlug: 'acme-software-abc123',
        email: 'invalid-email',
        name: 'John Doe',
        company: 'Acme Software'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Invalid email address format');
  });

  it('should block lead capture with honeypot field', async () => {
    const response = await request(app)
      .post('/api/leads')
      .send({
        auditSlug: 'acme-software-abc123',
        email: 'test@acme.com',
        name: 'John Doe',
        company: 'Acme Software',
        hp_name: 'spam-bot'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Invalid submission');
  });
});
