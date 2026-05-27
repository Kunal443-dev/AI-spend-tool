"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Audit = void 0;
const mongoose_1 = require("mongoose");
const ToolInputSchema = new mongoose_1.Schema({
    toolId: { type: String, required: true },
    planId: { type: String, required: true },
    monthlySpend: { type: Number, required: true },
    seats: { type: Number, required: true },
    primaryUsage: { type: String, required: true },
    activeUsageRate: { type: Number }
}, { _id: false });
const RecommendationSchema = new mongoose_1.Schema({
    toolId: { type: String, required: true },
    type: { type: String, required: true },
    severity: { type: String, required: true },
    confidence: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    currentCost: { type: Number, required: true },
    optimizedCost: { type: Number, required: true },
    savings: { type: Number, required: true }
}, { _id: false });
const AuditSchema = new mongoose_1.Schema({
    slug: { type: String, required: true, unique: true, index: true },
    companyName: { type: String, required: true },
    industry: { type: String, required: true },
    teamSize: { type: Number, required: true },
    useCase: { type: String, required: true },
    tools: [ToolInputSchema],
    results: {
        totalCurrentMonthlySpend: { type: Number, required: true },
        totalOptimizedMonthlySpend: { type: Number, required: true },
        totalMonthlySavings: { type: Number, required: true },
        totalYearlySavings: { type: Number, required: true },
        benchmark: {
            spendPerDev: { type: Number, required: true },
            industryAveragePerDev: { type: Number, required: true },
            comparisonMessage: { type: String, required: true }
        },
        recommendations: [RecommendationSchema],
        aiSummary: { type: String, required: true }
    }
}, { timestamps: true });
exports.Audit = (0, mongoose_1.model)('Audit', AuditSchema);
