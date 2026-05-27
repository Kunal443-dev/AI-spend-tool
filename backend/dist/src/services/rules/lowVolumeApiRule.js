"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lowVolumeApiRule = void 0;
exports.lowVolumeApiRule = {
    id: 'low_volume_api',
    title: 'Low Volume API Mismatch',
    severity: 'low',
    condition: (context) => {
        return context.tools.some(tool => {
            const isSub = tool.planId === 'plus' || tool.planId === 'pro';
            const isLowUsage = tool.activeUsageRate !== undefined && tool.activeUsageRate > 0 && tool.activeUsageRate < 20;
            return (tool.toolId === 'chatgpt' || tool.toolId === 'claude') && isSub && isLowUsage;
        });
    },
    recommendation: (context) => {
        const recs = [];
        context.tools.forEach(tool => {
            const isSub = tool.planId === 'plus' || tool.planId === 'pro';
            const isLowUsage = tool.activeUsageRate !== undefined && tool.activeUsageRate > 0 && tool.activeUsageRate < 20;
            if ((tool.toolId === 'chatgpt' || tool.toolId === 'claude') && isSub && isLowUsage) {
                const currentCost = tool.monthlySpend;
                // Assume API cost of $2.00 per active seat based on low token usage
                const optimizedCost = Math.max(1, 2 * tool.seats);
                const savings = currentCost - optimizedCost;
                if (savings > 0) {
                    recs.push({
                        toolId: tool.toolId,
                        type: 'api_switch',
                        severity: 'low',
                        confidence: 0.7,
                        title: `Switch Low-Usage ${tool.toolId.toUpperCase()} Seats to API Key`,
                        description: `You reported an active usage rate of only ${tool.activeUsageRate}% for your ${tool.toolId.toUpperCase()} seats. Instead of paying a flat $20/month per seat, switch to a pay-as-you-go API key integrated with a free frontend client (e.g., Chatbox or LibreChat). You will only pay for the exact tokens consumed.`,
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
