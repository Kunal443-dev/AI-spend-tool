"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAiSummary = void 0;
const generative_ai_1 = require("@google/generative-ai");
const generateAiSummary = async (context, results) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.log('GEMINI_API_KEY is not configured. Using rule-based fallback generator.');
        return generateFallbackSummary(context, results);
    }
    try {
        const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `
You are a senior startup CFO and product architect. Write a professional, punchy, and action-oriented audit summary paragraph (approx 3-4 sentences, max 100 words) analyzing this company's AI spending.
    
Company Context:
- Name: ${context.companyName}
- Industry: ${context.industry}
- Team Size: ${context.teamSize}
- Primary Use Case: ${context.useCase}

Spend Data:
- Current Monthly Spend: $${results.totalCurrentMonthlySpend}
- Optimized Monthly Spend: $${results.totalOptimizedMonthlySpend}
- Monthly Savings: $${results.totalMonthlySavings} (Yearly: $${results.totalMonthlySavings * 12})

Identified Inefficiencies:
${results.recommendations.map(r => `- ${r.title}: ${r.description} (Savings: $${r.savings}/mo)`).join('\n')}

Guidelines:
1. Speak directly to the company leadership.
2. Focus on capital efficiency, highlighting the exact percentage savings.
3. Be professional and constructive.
4. Do NOT use markdown links, headers, or bullet points in your output. Just return a single clean text paragraph.
`;
        const response = await model.generateContent(prompt);
        const text = response.response.text();
        return text.trim();
    }
    catch (error) {
        console.error('Failed to generate AI summary using Gemini API:', error);
        return generateFallbackSummary(context, results);
    }
};
exports.generateAiSummary = generateAiSummary;
const generateFallbackSummary = (context, results) => {
    const savingsPercent = results.totalCurrentMonthlySpend > 0
        ? Math.round((results.totalMonthlySavings / results.totalCurrentMonthlySpend) * 100)
        : 0;
    if (results.totalMonthlySavings === 0) {
        return `An audit of ${context.companyName || 'your organization'} indicates a highly optimized AI spend stack. Your current monthly spend of $${results.totalCurrentMonthlySpend} represents efficient utilization of resources across your team of ${context.teamSize} members. We recommend continuing with your current tools and plans, and running another review in 6 months as team needs evolve.`;
    }
    const primaryIssues = results.recommendations.map(r => r.type);
    const uniqueIssues = Array.from(new Set(primaryIssues));
    let issueText = 'subscription inefficiencies';
    if (uniqueIssues.includes('consolidate_tools') && uniqueIssues.includes('optimize_seats')) {
        issueText = 'a combination of redundant developer tool licenses and seat overprovisioning';
    }
    else if (uniqueIssues.includes('consolidate_tools')) {
        issueText = 'overlapping subscriptions across different AI chat and development platforms';
    }
    else if (uniqueIssues.includes('optimize_seats') || uniqueIssues.includes('inactive_seats')) {
        issueText = 'unutilized or inactive seat allocations across team accounts';
    }
    else if (uniqueIssues.includes('downgrade_plan')) {
        issueText = 'unnecessary enterprise-tier billing or premium plans for a small team size';
    }
    return `An audit of ${context.companyName || 'your organization'} in the ${context.industry || 'general'} sector reveals that you are overspending on AI tooling by approximately $${results.totalMonthlySavings}/month (representing a ${savingsPercent}% savings rate). This waste is primarily driven by ${issueText}. Implementing our recommended consolidations and tier downgrades will immediately optimize your monthly spend from $${results.totalCurrentMonthlySpend} down to $${results.totalOptimizedMonthlySpend} without impacting your team's day-to-day productivity.`;
};
