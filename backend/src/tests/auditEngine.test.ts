import { describe, it, expect } from 'vitest';
import { runAudit } from '../services/auditEngine';
import { AuditContext } from '../../../shared/types';

describe('AI Spend Audit Engine Calculations', () => {
  it('should detect seat overprovisioning (Claude Team with 2 seats)', () => {
    const mockContext: AuditContext = {
      companyName: 'Acme Software',
      industry: 'Software Engineering',
      teamSize: 2,
      useCase: 'Engineering',
      tools: [
        {
          toolId: 'claude',
          planId: 'team', 
          monthlySpend: 150,
          seats: 2,
          primaryUsage: 'coding',
          activeUsageRate: 100
        }
      ]
    };

    const results = runAudit(mockContext);
    
  
    const seatRec = results.recommendations.find(r => r.type === 'optimize_seats');
    expect(seatRec).toBeDefined();
    
    
    expect(seatRec?.savings).toBe(110);
    expect(results.totalMonthlySavings).toBe(110);
  });

  it('should detect developer tool overlap (Cursor Pro + GitHub Copilot)', () => {
    const mockContext: AuditContext = {
      companyName: 'Test Devs',
      industry: 'Tech',
      teamSize: 5,
      useCase: 'Engineering',
      tools: [
        {
          toolId: 'cursor',
          planId: 'pro',
          monthlySpend: 100, 
          seats: 5,
          primaryUsage: 'coding'
        },
        {
          toolId: 'copilot',
          planId: 'individual',
          monthlySpend: 50,
          seats: 5,
          primaryUsage: 'coding'
        }
      ]
    };

    const results = runAudit(mockContext);
    const overlapRec = results.recommendations.find(r => r.type === 'consolidate_tools');
    expect(overlapRec).toBeDefined();
    expect(overlapRec?.toolId).toBe('copilot');
    
    
    expect(overlapRec?.savings).toBe(50);
  });

  it('should detect enterprise inflation for small teams', () => {
    const mockContext: AuditContext = {
      companyName: 'Small Firm',
      industry: 'Consulting',
      teamSize: 5,
      useCase: 'General',
      tools: [
        {
          toolId: 'chatgpt',
          planId: 'enterprise',
          monthlySpend: 300, 
          seats: 5,
          primaryUsage: 'mixed'
        }
      ]
    };

    const results = runAudit(mockContext);
    const enterpriseRec = results.recommendations.find(r => r.type === 'downgrade_plan');
    expect(enterpriseRec).toBeDefined();
    
    
    expect(enterpriseRec?.savings).toBe(150);
  });

  it('should detect inactive seats based on usage rate', () => {
    const mockContext: AuditContext = {
      companyName: 'Waste LLC',
      industry: 'Marketing',
      teamSize: 10,
      useCase: 'Writing',
      tools: [
        {
          toolId: 'chatgpt',
          planId: 'plus',
          monthlySpend: 200,
          seats: 10,
          primaryUsage: 'writing',
          activeUsageRate: 50 
        }
      ]
    };

    const results = runAudit(mockContext);
    const inactiveRec = results.recommendations.find(r => r.type === 'inactive_seats');
    expect(inactiveRec).toBeDefined();
    
    // Remove 5 inactive seats. Savings = 5 * $20 = $100.
    expect(inactiveRec?.savings).toBe(100);
  });

  it('should calculate industry benchmark messages accurately', () => {
    const mockContext: AuditContext = {
      companyName: 'Heavy AI User',
      industry: 'Software Engineering',
      teamSize: 2,
      useCase: 'Engineering',
      tools: [
        {
          toolId: 'chatgpt',
          planId: 'plus',
          monthlySpend: 400, 
          seats: 2,
          primaryUsage: 'mixed'
        }
      ]
    };

    const results = runAudit(mockContext);
    expect(results.benchmark.spendPerDev).toBe(200);
    expect(results.benchmark.industryAveragePerDev).toBe(120); 
    expect(results.benchmark.comparisonMessage).toContain('67% higher than average');
  });
});
