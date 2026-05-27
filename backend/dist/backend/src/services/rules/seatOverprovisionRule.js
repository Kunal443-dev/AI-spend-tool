"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seatOverprovisionRule = void 0;
const pricing_1 = require("../../config/pricing");
exports.seatOverprovisionRule = {
    id: 'seat_overprovision',
    title: 'Seat Overprovisioning (Plan Minimums)',
    severity: 'medium',
    condition: (context) => {
        return context.tools.some(tool => {
            const plan = (0, pricing_1.getPlanDetails)(tool.toolId, tool.planId);
            if (!plan || !plan.minSeats)
                return false;
            return tool.seats < plan.minSeats;
        });
    },
    recommendation: (context) => {
        const recs = [];
        context.tools.forEach(tool => {
            const plan = (0, pricing_1.getPlanDetails)(tool.toolId, tool.planId);
            if (!plan || !plan.minSeats)
                return;
            if (tool.seats < plan.minSeats) {
                const minSeats = plan.minSeats;
                let altPlanId = plan.metadata?.hasIndividualEquivalent || 'pro';
                if (tool.toolId === 'chatgpt')
                    altPlanId = 'plus';
                const altPlan = (0, pricing_1.getPlanDetails)(tool.toolId, altPlanId);
                if (!altPlan)
                    return;
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
