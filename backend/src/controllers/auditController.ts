import { Request, Response } from 'express';
import { Audit } from '../models/Audit';
import { runAudit } from '../services/auditEngine';
import { generateAiSummary } from '../services/aiService';
import { AuditContext, PublicAuditReport } from '../../../shared/types';

const generateSlug = (companyName: string): string => {
  const cleanStr = companyName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  const rand = Math.random().toString(36).substring(2, 8);
  return `${cleanStr || 'audit'}-${rand}`;
};

export const createAudit = async (req: Request, res: Response) => {
  try {
    const { companyName, industry, teamSize, useCase, tools, hp_name } = req.body;

   
    if (hp_name && hp_name.trim() !== '') {
      console.warn('Honeypot field triggered. Suspected bot submission.');
      return res.status(400).json({ error: 'Invalid submission' });
    }

    if (!companyName || !industry || !teamSize || !useCase || !tools || !Array.isArray(tools)) {
      return res.status(400).json({ error: 'Missing required audit parameters' });
    }

    const context: AuditContext = {
      companyName,
      industry,
      teamSize: Number(teamSize),
      useCase,
      tools
    };

    const auditResults = runAudit(context);

    const aiSummary = await generateAiSummary(context, auditResults);
    
    const slug = generateSlug(companyName);

    const newAudit = new Audit({
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
  } catch (error: any) {
    console.error('Error creating audit:', error);
    return res.status(500).json({ error: 'Internal server error during audit generation' });
  }
};

export const getAuditBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const audit = await Audit.findOne({ slug });

    if (!audit) {
      return res.status(404).json({ error: 'Audit report not found' });
    }

    const publicReport: PublicAuditReport = {
      slug: audit.slug,
      industry: audit.industry,
      teamSize: audit.teamSize,
      useCase: audit.useCase,
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
  } catch (error) {
    console.error('Error fetching audit:', error);
    return res.status(500).json({ error: 'Internal server error retrieving report' });
  }
};
