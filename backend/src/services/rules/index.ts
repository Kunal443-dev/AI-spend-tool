import { AuditContext, RecommendationResult } from '../../../../shared/types';
import { seatOverprovisionRule } from './seatOverprovisionRule';
import { toolOverlapRule } from './toolOverlapRule';
import { enterpriseInflationRule } from './enterpriseInflationRule';
import { lowVolumeApiRule } from './lowVolumeApiRule';
import { inactiveSeatsRule } from './inactiveSeatsRule';

export interface AuditRule {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high';
  condition: (context: AuditContext) => boolean;
  recommendation: (context: AuditContext) => RecommendationResult[];
}

export const RULES: AuditRule[] = [
  seatOverprovisionRule,
  toolOverlapRule,
  enterpriseInflationRule,
  lowVolumeApiRule,
  inactiveSeatsRule
];
