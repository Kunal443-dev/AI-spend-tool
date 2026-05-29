import axios from 'axios';
import { AuditContext, AuditReport, LeadInput, PublicAuditReport } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const submitAudit = async (data: AuditContext & { hp_name?: string }): Promise<AuditReport> => {
  const response = await api.post('/api/audits', data);
  return response.data;
};

export const fetchAuditReport = async (slug: string): Promise<PublicAuditReport> => {
  const response = await api.get(`/api/audits/${slug}`);
  return response.data;
};

export const submitLead = async (data: LeadInput & { auditSlug: string }): Promise<{ message: string; previewUrl?: string }> => {
  const response = await api.post('/api/leads', data);
  return response.data;
};
