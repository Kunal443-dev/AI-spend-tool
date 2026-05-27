"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuditBySlug = exports.createAudit = void 0;
const Audit_1 = require("../models/Audit");
const auditEngine_1 = require("../services/auditEngine");
const aiService_1 = require("../services/aiService");
// Helper to generate a URL-safe unique slug
const generateSlug = (companyName) => {
    const cleanStr = companyName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    const rand = Math.random().toString(36).substring(2, 8);
    return `${cleanStr || 'audit'}-${rand}`;
};
const createAudit = async (req, res) => {
    try {
        const { companyName, industry, teamSize, useCase, tools, hp_name } = req.body;
        // Honeypot validation - reject bots
        if (hp_name && hp_name.trim() !== '') {
            console.warn('Honeypot field triggered. Suspected bot submission.');
            return res.status(400).json({ error: 'Invalid submission' });
        }
        if (!companyName || !industry || !teamSize || !useCase || !tools || !Array.isArray(tools)) {
            return res.status(400).json({ error: 'Missing required audit parameters' });
        }
        const context = {
            companyName,
            industry,
            teamSize: Number(teamSize),
            useCase,
            tools
        };
        // Calculate audit results
        const auditResults = (0, auditEngine_1.runAudit)(context);
        // Call Gemini API for AI summary
        const aiSummary = await (0, aiService_1.generateAiSummary)(context, auditResults);
        const slug = generateSlug(companyName);
        const newAudit = new Audit_1.Audit({
            slug,
            companyName,
            industry,
            teamSize: context.teamSize,
            useCase,
            tools,
            results: {
                ...auditResults,
                aiSummary
            }
        });
        await newAudit.save();
        return res.status(201).json(newAudit);
    }
    catch (error) {
        console.error('Error creating audit:', error);
        return res.status(500).json({ error: 'Internal server error during audit generation' });
    }
};
exports.createAudit = createAudit;
const getAuditBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const audit = await Audit_1.Audit.findOne({ slug });
        if (!audit) {
            return res.status(404).json({ error: 'Audit report not found' });
        }
        // Public sanitization: Remove private details like company name to ensure anonymity
        const publicReport = {
            slug: audit.slug,
            industry: audit.industry,
            teamSize: audit.teamSize,
            useCase: audit.useCase,
            // Map tools to omit active usage rate (optional)
            tools: audit.tools.map(t => ({
                toolId: t.toolId,
                planId: t.planId,
                monthlySpend: t.monthlySpend,
                seats: t.seats,
                primaryUsage: t.primaryUsage
            })),
            results: audit.results,
            createdAt: audit.createdAt
        };
        return res.status(200).json(publicReport);
    }
    catch (error) {
        console.error('Error fetching audit:', error);
        return res.status(500).json({ error: 'Internal server error retrieving report' });
    }
};
exports.getAuditBySlug = getAuditBySlug;
