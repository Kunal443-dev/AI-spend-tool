"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enterpriseInflationRule = void 0;
const pricing_1 = require("../../config/pricing");
exports.enterpriseInflationRule = {
    id: 'enterprise_inflation',
    title: 'Enterprise Plan Inflation',
    severity: 'high',
    condition: (context) => {
        return context.tools.some(tool => {
            const plan = (0, pricing_1.getPlanDetails)(tool.toolId, tool.planId);
            if (!plan || !plan.metadata?.isEnterprise)
                return false;
            return tool.seats < 20;
        });
    },
    recommendation: (context) => {
        const recs = [];
        context.tools.forEach(tool => {
            const plan = (0, pricing_1.getPlanDetails)(tool.toolId, tool.planId);
            if (!plan || !plan.metadata?.isEnterprise)
                return;
            if (tool.seats < 20) {
                let teamPlanId = 'team';
                if (tool.toolId === 'cursor')
                    teamPlanId = 'business';
                if (tool.toolId === 'copilot')
                    teamPlanId = 'business';
                if (tool.toolId === 'gemini')
                    teamPlanId = 'business';
                const teamPlan = (0, pricing_1.getPlanDetails)(tool.toolId, teamPlanId);
                if (!teamPlan)
                    return;
                const currentCost = tool.monthlySpend;
                const optimizedCost = teamPlan.monthlyPricePerSeat * tool.seats;
                const savings = currentCost - optimizedCost;
                if (savings > 0) {
                    recs.push({
                        toolId: tool.toolId,
                        type: 'downgrade_plan',
                        severity: 'high',
                        confidence: 0.85,
                        title: `Downgrade ${tool.toolId.toUpperCase()} from Enterprise to Team/Business`,
                        description: `Your team size (${tool.seats} seats) is well below the typical 20+ seat threshold that warrants custom Enterprise pricing. Migrating to the standard ${teamPlan.planName} tier ($${teamPlan.monthlyPricePerSeat}/seat) will save you $${savings}/mo while retaining 95% of team features.`,
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
