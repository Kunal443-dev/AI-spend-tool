"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const auditEngine_1 = require("../services/auditEngine");
(0, vitest_1.describe)('AI Spend Audit Engine Calculations', () => {
    (0, vitest_1.it)('should detect seat overprovisioning (Claude Team with 2 seats)', () => {
        const mockContext = {
            companyName: 'Acme Software',
            industry: 'Software Engineering',
            teamSize: 2,
            useCase: 'Engineering',
            tools: [
                {
                    toolId: 'claude',
                    planId: 'team', // Claude Team has a 5-seat minimum, meaning they pay for 5 seats ($150)
                    monthlySpend: 150,
                    seats: 2,
                    primaryUsage: 'coding',
                    activeUsageRate: 100
                }
            ]
        };
        const results = (0, auditEngine_1.runAudit)(mockContext);
        // Check if recommendations contain seat optimization
        const seatRec = results.recommendations.find(r => r.type === 'optimize_seats');
        (0, vitest_1.expect)(seatRec).toBeDefined();
        // Switch to individual Pro accounts (2 seats * $20 = $40). Savings = $150 - $40 = $110.
        (0, vitest_1.expect)(seatRec?.savings).toBe(110);
        (0, vitest_1.expect)(results.totalMonthlySavings).toBe(110);
    });
    (0, vitest_1.it)('should detect developer tool overlap (Cursor Pro + GitHub Copilot)', () => {
        const mockContext = {
            companyName: 'Test Devs',
            industry: 'Tech',
            teamSize: 5,
            useCase: 'Engineering',
            tools: [
                {
                    toolId: 'cursor',
                    planId: 'pro',
                    monthlySpend: 100, // 5 seats * $20
                    seats: 5,
                    primaryUsage: 'coding'
                },
                {
                    toolId: 'copilot',
                    planId: 'individual',
                    monthlySpend: 50, // 5 seats * $10
                    seats: 5,
                    primaryUsage: 'coding'
                }
            ]
        };
        const results = (0, auditEngine_1.runAudit)(mockContext);
        const overlapRec = results.recommendations.find(r => r.type === 'consolidate_tools');
        (0, vitest_1.expect)(overlapRec).toBeDefined();
        (0, vitest_1.expect)(overlapRec?.toolId).toBe('copilot');
        // Recommend canceling Copilot. Savings = $50.
        (0, vitest_1.expect)(overlapRec?.savings).toBe(50);
    });
    (0, vitest_1.it)('should detect enterprise inflation for small teams', () => {
        const mockContext = {
            companyName: 'Small Firm',
            industry: 'Consulting',
            teamSize: 5,
            useCase: 'General',
            tools: [
                {
                    toolId: 'chatgpt',
                    planId: 'enterprise',
                    monthlySpend: 300, // 5 seats * $60/seat
                    seats: 5,
                    primaryUsage: 'mixed'
                }
            ]
        };
        const results = (0, auditEngine_1.runAudit)(mockContext);
        const enterpriseRec = results.recommendations.find(r => r.type === 'downgrade_plan');
        (0, vitest_1.expect)(enterpriseRec).toBeDefined();
        // Switch to Team plan ($30/seat * 5 = $150). Savings = $300 - $150 = $150.
        (0, vitest_1.expect)(enterpriseRec?.savings).toBe(150);
    });
    (0, vitest_1.it)('should detect inactive seats based on usage rate', () => {
        const mockContext = {
            companyName: 'Waste LLC',
            industry: 'Marketing',
            teamSize: 10,
            useCase: 'Writing',
            tools: [
                {
                    toolId: 'chatgpt',
                    planId: 'plus',
                    monthlySpend: 200, // 10 seats * $20/seat
                    seats: 10,
                    primaryUsage: 'writing',
                    activeUsageRate: 50 // 5 seats inactive
                }
            ]
        };
        const results = (0, auditEngine_1.runAudit)(mockContext);
        const inactiveRec = results.recommendations.find(r => r.type === 'inactive_seats');
        (0, vitest_1.expect)(inactiveRec).toBeDefined();
        // Remove 5 inactive seats. Savings = 5 * $20 = $100.
        (0, vitest_1.expect)(inactiveRec?.savings).toBe(100);
    });
    (0, vitest_1.it)('should calculate industry benchmark messages accurately', () => {
        const mockContext = {
            companyName: 'Heavy AI User',
            industry: 'Software Engineering',
            teamSize: 2,
            useCase: 'Engineering',
            tools: [
                {
                    toolId: 'chatgpt',
                    planId: 'plus',
                    monthlySpend: 400, // $200 per dev (huge spend)
                    seats: 2,
                    primaryUsage: 'mixed'
                }
            ]
        };
        const results = (0, auditEngine_1.runAudit)(mockContext);
        (0, vitest_1.expect)(results.benchmark.spendPerDev).toBe(200);
        (0, vitest_1.expect)(results.benchmark.industryAveragePerDev).toBe(120); // Software threshold
        (0, vitest_1.expect)(results.benchmark.comparisonMessage).toContain('67% higher than average');
    });
});
