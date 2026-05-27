import { AuditRule } from './index';
import { RecommendationResult } from '../../../../shared/types';
import { getPlanDetails } from '../../config/pricing';

export const seatOverprovisionRule: AuditRule = {
  id: 'seat_overprovision',
  title: 'Seat Overprovisioning (Plan Minimums)',
  severity: 'medium',
  condition: (context) => {
    return context.tools.some(tool => {
      const plan = getPlanDetails(tool.toolId, tool.planId);
      if (!plan || !plan.minSeats) return false;
      return tool.seats < plan.minSeats;
    });
  },
  recommendation: (context) => {
    const recs: RecommendationResult[] = [];
    context.tools.forEach(tool => {
      const plan = getPlanDetails(tool.toolId, tool.planId);
      if (!plan || !plan.minSeats) return;
      
      if (tool.seats < plan.minSeats) {
        const minSeats = plan.minSeats;
        
        let altPlanId = plan.metadata?.hasIndividualEquivalent || 'pro';
        if (tool.toolId === 'chatgpt') altPlanId = 'plus';
        
        const altPlan = getPlanDetails(tool.toolId, altPlanId);
        if (!altPlan) return;
        
        const currentCost = tool.monthlySpend;
        const optimizedCost = altPlan.monthlyPricePerSeat * tool.seats;
        const savings = currentCost - optimizedCost;
        
        if (savings > 0) {
          recs.push({
            toolId: tool.toolId,
            type: 'optimize_seats',
            severity: 'medium',
            confidence: 0.95,
            title: `Optimize ${tool.toolId.toUpperCase()} Subscription Setup`,
            description: `You are paying for the Team plan which enforces a ${minSeats}-seat pricing minimum, but you only have ${tool.seats} seats configured. Consolidating into ${tool.seats} individual ${altPlan.planName} accounts will maintain access while saving money.`,
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
