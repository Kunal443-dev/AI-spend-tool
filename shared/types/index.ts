export type PrimaryUsage = 'coding' | 'writing' | 'research' | 'analytics' | 'mixed';

export interface ToolInput {
  toolId: string;         
  planId: string;         
  monthlySpend: number;
  seats: number;
  primaryUsage: PrimaryUsage;
  activeUsageRate?: number; 
}

export interface AuditContext {
  companyName: string;
  industry: string;
  teamSize: number;
  useCase: string;
  tools: ToolInput[];
}

export interface RecommendationResult {
  toolId: string;
  type: 'downgrade_plan' | 'consolidate_tools' | 'optimize_seats' | 'api_switch' | 'inactive_seats';
  severity: 'low' | 'medium' | 'high';
  confidence: number; 
  title: string;
  description: string;
  currentCost: number;
  optimizedCost: number;
  savings: number;
}

export interface BenchmarkResult {
  spendPerDev: number;
  industryAveragePerDev: number;
  comparisonMessage: string;
}

export interface AuditReport {
  id?: string;
  slug: string;
  companyName: string;
  industry: string;
  teamSize: number;
  useCase: string;
  tools: ToolInput[];
  results: {
    totalCurrentMonthlySpend: number;
    totalOptimizedMonthlySpend: number;
    totalMonthlySavings: number;
    totalYearlySavings: number;
    benchmark: BenchmarkResult;
    recommendations: RecommendationResult[];
    aiSummary: string;
  };
  createdAt: Date;
}

export interface PublicAuditReport {
  slug: string;
  industry: string;
  teamSize: number;
  useCase: string;
  tools: Omit<ToolInput, 'activeUsageRate'>[];
  results: {
    totalCurrentMonthlySpend: number;
    totalOptimizedMonthlySpend: number;
    totalMonthlySavings: number;
    totalYearlySavings: number;
    benchmark: BenchmarkResult;
    recommendations: RecommendationResult[];
    aiSummary: string;
  };
  createdAt: Date;
}

export interface LeadInput {
  email: string;
  name: string;
  company: string;
  consentToContact: boolean;
  hp_name?: string; // Honeypot field
}
