"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlanDetails = exports.PRICING_CATALOG = void 0;
exports.PRICING_CATALOG = {
    chatgpt: {
        toolName: "ChatGPT",
        toolId: "chatgpt",
        plans: [
            { planId: "free", planName: "Free", monthlyPricePerSeat: 0, sourceUrl: "https://openai.com/chatgpt/pricing", verifiedAt: "2026-05-20" },
            { planId: "plus", planName: "Plus", monthlyPricePerSeat: 20, sourceUrl: "https://openai.com/chatgpt/pricing", verifiedAt: "2026-05-20" },
            { planId: "team", planName: "Team", monthlyPricePerSeat: 30, minSeats: 2, sourceUrl: "https://openai.com/chatgpt/pricing", verifiedAt: "2026-05-20", metadata: { hasIndividualEquivalent: "plus" } },
            { planId: "enterprise", planName: "Enterprise", monthlyPricePerSeat: 60, minSeats: 50, sourceUrl: "https://openai.com/chatgpt/pricing", verifiedAt: "2026-05-20", metadata: { isEnterprise: true } }
        ]
    },
    claude: {
        toolName: "Claude",
        toolId: "claude",
        plans: [
            { planId: "free", planName: "Free", monthlyPricePerSeat: 0, sourceUrl: "https://www.anthropic.com/claude", verifiedAt: "2026-05-20" },
            { planId: "pro", planName: "Pro", monthlyPricePerSeat: 20, sourceUrl: "https://www.anthropic.com/claude", verifiedAt: "2026-05-20" },
            { planId: "team", planName: "Team", monthlyPricePerSeat: 30, minSeats: 5, sourceUrl: "https://www.anthropic.com/claude", verifiedAt: "2026-05-20", metadata: { hasIndividualEquivalent: "pro" } },
            { planId: "enterprise", planName: "Enterprise", monthlyPricePerSeat: 60, minSeats: 50, sourceUrl: "https://www.anthropic.com/claude", verifiedAt: "2026-05-20", metadata: { isEnterprise: true } }
        ]
    },
    cursor: {
        toolName: "Cursor",
        toolId: "cursor",
        plans: [
            { planId: "hobby", planName: "Hobby", monthlyPricePerSeat: 0, sourceUrl: "https://www.cursor.com/pricing", verifiedAt: "2026-05-20" },
            { planId: "pro", planName: "Pro", monthlyPricePerSeat: 20, sourceUrl: "https://www.cursor.com/pricing", verifiedAt: "2026-05-20" },
            { planId: "business", planName: "Business", monthlyPricePerSeat: 40, sourceUrl: "https://www.cursor.com/pricing", verifiedAt: "2026-05-20" }
        ]
    },
    copilot: {
        toolName: "GitHub Copilot",
        toolId: "copilot",
        plans: [
            { planId: "individual", planName: "Individual", monthlyPricePerSeat: 10, sourceUrl: "https://github.com/features/copilot/plans", verifiedAt: "2026-05-20" },
            { planId: "business", planName: "Business", monthlyPricePerSeat: 19, sourceUrl: "https://github.com/features/copilot/plans", verifiedAt: "2026-05-20" },
            { planId: "enterprise", planName: "Enterprise", monthlyPricePerSeat: 39, sourceUrl: "https://github.com/features/copilot/plans", verifiedAt: "2026-05-20", metadata: { isEnterprise: true } }
        ]
    },
    gemini: {
        toolName: "Gemini",
        toolId: "gemini",
        plans: [
            { planId: "free", planName: "Free", monthlyPricePerSeat: 0, sourceUrl: "https://gemini.google.com/pricing", verifiedAt: "2026-05-20" },
            { planId: "advanced", planName: "Advanced", monthlyPricePerSeat: 20, sourceUrl: "https://gemini.google.com/pricing", verifiedAt: "2026-05-20" },
            { planId: "business", planName: "Business", monthlyPricePerSeat: 20, sourceUrl: "https://gemini.google.com/pricing", verifiedAt: "2026-05-20" },
            { planId: "enterprise", planName: "Enterprise", monthlyPricePerSeat: 30, sourceUrl: "https://gemini.google.com/pricing", verifiedAt: "2026-05-20", metadata: { isEnterprise: true } }
        ]
    },
    openai_api: {
        toolName: "OpenAI API",
        toolId: "openai_api",
        plans: [
            { planId: "pay_as_you_go", planName: "Pay-as-you-go", monthlyPricePerSeat: 0, sourceUrl: "https://openai.com/api/pricing", verifiedAt: "2026-05-20", metadata: { isApi: true } }
        ]
    },
    anthropic_api: {
        toolName: "Anthropic API",
        toolId: "anthropic_api",
        plans: [
            { planId: "pay_as_you_go", planName: "Pay-as-you-go", monthlyPricePerSeat: 0, sourceUrl: "https://www.anthropic.com/api", verifiedAt: "2026-05-20", metadata: { isApi: true } }
        ]
    },
    gemini_api: {
        toolName: "Gemini API",
        toolId: "gemini_api",
        plans: [
            { planId: "pay_as_you_go", planName: "Pay-as-you-go", monthlyPricePerSeat: 0, sourceUrl: "https://ai.google.dev/pricing", verifiedAt: "2026-05-20", metadata: { isApi: true } }
        ]
    }
};
const getPlanDetails = (toolId, planId) => {
    const tool = exports.PRICING_CATALOG[toolId];
    if (!tool)
        return null;
    return tool.plans.find(p => p.planId === planId) || null;
};
exports.getPlanDetails = getPlanDetails;
