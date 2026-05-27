import { AuditContext, RecommendationResult, BenchmarkResult } from '../../../shared/types';
import { RULES } from './rules';

export const runAudit = (context: AuditContext) => {
  const totalCurrentMonthlySpend = context.tools.reduce((sum, tool) => sum + tool.monthlySpend, 0);
  
  const recommendations: RecommendationResult[] = [];
  RULES.forEach(rule => {
    if (rule.condition(context)) {
      const recs = rule.recommendation(context);
      recommendations.push(...recs);
    }
  });

  
  const savingsPerTool: Record<string, number> = {};
  recommendations.forEach(rec => {
    const currentMax = savingsPerTool[rec.toolId] || 0;
    if (rec.savings > currentMax) {
      savingsPerTool[rec.toolId] = rec.savings;
    }
  });

  const totalMonthlySavings = Object.values(savingsPerTool).reduce((sum, savings) => sum + savings, 0);
  const totalOptimizedMonthlySpend = Math.max(0, totalCurrentMonthlySpend - totalMonthlySavings);
  const totalYearlySavings = totalMonthlySavings * 12;

 
  const benchmark = calculateBenchmark(context.industry, context.teamSize, totalCurrentMonthlySpend);

  return {
    totalCurrentMonthlySpend,
    totalOptimizedMonthlySpend,
    totalMonthlySavings,
    totalYearlySavings,
    benchmark,
    recommendations
  };
};

const calculateBenchmark = (industry: string, teamSize: number, currentSpend: number): BenchmarkResult => {
  const size = Math.max(1, teamSize);
  const spendPerDev = Math.round(currentSpend / size);
  

  let industryAveragePerDev = 50; 
  const ind = industry.toLowerCase();
  if (ind.includes('software') || ind.includes('tech') || ind.includes('engine') || ind.includes('develop')) {
    industryAveragePerDev = 120;
  } else if (ind.includes('market') || ind.includes('design') || ind.includes('media') || ind.includes('write')) {
    industryAveragePerDev = 80;
  } else if (ind.includes('consulting') || ind.includes('finance') || ind.includes('business')) {
    industryAveragePerDev = 60;
  }

  let comparisonMessage = '';
  if (spendPerDev > industryAveragePerDev) {
    const percentHigher = Math.round(((spendPerDev - industryAveragePerDev) / industryAveragePerDev) * 100);
    comparisonMessage = `Your team spends approximately $${spendPerDev}/dev/month on AI tooling. Teams of similar size in your industry typically spend ~$${industryAveragePerDev}/dev/month. That is ${percentHigher}% higher than average.`;
  } else if (spendPerDev === industryAveragePerDev) {
    comparisonMessage = `Your team spends approximately $${spendPerDev}/dev/month on AI tooling, which aligns perfectly with your industry average of $${industryAveragePerDev}/dev/month.`;
  } else {
    const percentLower = Math.round(((industryAveragePerDev - spendPerDev) / industryAveragePerDev) * 100);
    comparisonMessage = `Your team is highly efficient, spending $${spendPerDev}/dev/month on AI tooling compared to the industry average of $${industryAveragePerDev}/dev/month (${percentLower}% lower).`;
  }

  return {
    spendPerDev,
    industryAveragePerDev,
    comparisonMessage
  };
};
