"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toolOverlapRule = void 0;
exports.toolOverlapRule = {
    id: 'tool_overlap',
    title: 'Redundant Tool Overlap',
    severity: 'high',
    condition: (context) => {
        const hasCursor = context.tools.some(t => t.toolId === 'cursor');
        const hasCopilot = context.tools.some(t => t.toolId === 'copilot');
        const hasChatGPT = context.tools.some(t => t.toolId === 'chatgpt');
        const hasClaude = context.tools.some(t => t.toolId === 'claude');
        const codingOverlap = hasCursor && hasCopilot;
        const cursorChatOverlap = hasCursor && (hasChatGPT || hasClaude) &&
            context.tools.some(t => t.toolId === 'cursor' && t.primaryUsage === 'coding');
        const chatOverlap = hasChatGPT && hasClaude;
        return codingOverlap || cursorChatOverlap || chatOverlap;
    },
    recommendation: (context) => {
        const recs = [];
        const toolsMap = new Map(context.tools.map(t => [t.toolId, t]));
        const cursor = toolsMap.get('cursor');
        const copilot = toolsMap.get('copilot');
        const chatgpt = toolsMap.get('chatgpt');
        const claude = toolsMap.get('claude');
        if (cursor && copilot && cursor.primaryUsage === 'coding' && copilot.primaryUsage === 'coding') {
            const savings = copilot.monthlySpend;
            recs.push({
                toolId: 'copilot',
                type: 'consolidate_tools',
                severity: 'high',
                confidence: 0.9,
                title: 'Consolidate Cursor and GitHub Copilot',
                description: `Your developers are using both Cursor and GitHub Copilot for coding. Cursor has built-in code completion and chat that duplicates Copilot's features. We recommend canceling Copilot for these seats.`,
                currentCost: cursor.monthlySpend + copilot.monthlySpend,
                optimizedCost: cursor.monthlySpend,
                savings
            });
        }
        if (cursor && cursor.primaryUsage === 'coding') {
            if (chatgpt && chatgpt.primaryUsage === 'coding') {
                const savings = chatgpt.monthlySpend;
                recs.push({
                    toolId: 'chatgpt',
                    type: 'consolidate_tools',
                    severity: 'medium',
                    confidence: 0.8,
                    title: 'Consolidate ChatGPT into Cursor',
                    description: `You have seats for both Cursor and ChatGPT Plus/Team assigned to coding. Cursor allows querying GPT-4 directly within the IDE using built-in chat. You can cancel ChatGPT for these developers.`,
                    currentCost: cursor.monthlySpend + chatgpt.monthlySpend,
                    optimizedCost: cursor.monthlySpend,
                    savings
                });
            }
            if (claude && claude.primaryUsage === 'coding') {
                const savings = claude.monthlySpend;
                recs.push({
                    toolId: 'claude',
                    type: 'consolidate_tools',
                    severity: 'medium',
                    confidence: 0.85,
                    title: 'Consolidate Claude into Cursor',
                    description: `Your developers have Claude subscriptions. Since Cursor integrates Claude 3.5 Sonnet directly in the editor, separate Claude seats for coders are redundant.`,
                    currentCost: cursor.monthlySpend + claude.monthlySpend,
                    optimizedCost: cursor.monthlySpend,
                    savings
                });
            }
        }
        if (chatgpt && claude &&
            (chatgpt.primaryUsage === 'writing' || chatgpt.primaryUsage === 'research' || chatgpt.primaryUsage === 'mixed') &&
            (claude.primaryUsage === 'writing' || claude.primaryUsage === 'research' || claude.primaryUsage === 'mixed')) {
            const keepClaude = claude.primaryUsage === 'writing';
            const keepTool = keepClaude ? claude : chatgpt;
            const dropTool = keepClaude ? chatgpt : claude;
            const currentCost = chatgpt.monthlySpend + claude.monthlySpend;
            const optimizedCost = keepTool.monthlySpend;
            const savings = dropTool.monthlySpend;
            recs.push({
                toolId: dropTool.toolId,
                type: 'consolidate_tools',
                severity: 'medium',
                confidence: 0.75,
                title: `Consolidate ${chatgpt.toolId.toUpperCase()} and ${claude.toolId.toUpperCase()}`,
                description: `Your team uses both ChatGPT and Claude for ${keepTool.primaryUsage}. Consolidating onto a single platform (keeping ${keepTool.toolId.toUpperCase()}) will simplify workflows and save subscription costs.`,
                currentCost,
                optimizedCost,
                savings
            });
        }
        return recs;
    }
};
