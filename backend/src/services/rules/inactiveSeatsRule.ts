import { AuditRule } from './index';
import { RecommendationResult } from '../../../../shared/types';
import { getPlanDetails } from '../../config/pricing';

export const inactiveSeatsRule: AuditRule = {
  id: 'inactive_seats_detection',
  title: 'Inactive / Unused Seats',
  severity: 'medium',
  condition: (context) => {
    return context.tools.some(tool => {
      const isApi = tool.planId === 'pay_as_you_go';
      const hasUsageRate = tool.activeUsageRate !== undefined && tool.activeUsageRate < 100;
      return !isApi && tool.seats > 1 && hasUsageRate;
    });
  },
  recommendation: (context) => {
    const recs: RecommendationResult[] = [];
    context.tools.forEach(tool => {
      const isApi = tool.planId === 'pay_as_you_go';
      const hasUsageRate = tool.activeUsageRate !== undefined && tool.activeUsageRate < 100;
      
      if (!isApi && tool.seats > 1 && hasUsageRate) {
        const usageRate = tool.activeUsageRate ?? 100;
        const activeSeats = Math.max(1, Math.ceil((usageRate / 100) * tool.seats));
        const inactiveSeatsCount = tool.seats - activeSeats;
        
        if (inactiveSeatsCount > 0) {
          const plan = getPlanDetails(tool.toolId, tool.planId);
          if (!plan) return;
          
          const costPerSeat = plan.monthlyPricePerSeat || (tool.monthlySpend / tool.seats);
          const currentCost = tool.monthlySpend;
          const savings = inactiveSeatsCount * costPerSeat;
          const optimizedCost = currentCost - savings;
          
          recs.push({
            toolId: tool.toolId,
            type: 'inactive_seats',
            severity: 'medium',
            confidence: 0.9,
            title: `Remove ${inactiveSeatsCount} Inactive ${tool.toolId.toUpperCase()} Seats`,
            description: `Your reported active usage rate for ${tool.toolId.toUpperCase()} is ${usageRate}%, meaning only ${activeSeats} of your ${tool.seats} seats are actively utilized. Removing the ${inactiveSeatsCount} unutilized seat subscriptions will cut costs immediately without affecting productivity.`,
            currentCost,
            optimizedCost,
            savings
          });
        }
      }
    });
    return recs;
  }
};
