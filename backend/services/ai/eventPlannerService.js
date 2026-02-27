const aiService = require('./groqService');

/**
 * Event Planner Service
 * Handles the logic for extracting event details and generating budget recommendations.
 * 
 * PROMPT ENGINEERING: We use few-shot prompting and explicit JSON formatting instructions
 * to ensure Gemini returns deterministic data for our UI.
 */
const planEvent = async (userMessage, history = []) => {
    const historyText = history.map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join('\n');
    const prompt = `
        You are an expert Indian Event Planner for the "SHUBAKAR" platform.
        Analyze the user's latest request ${historyText ? `in the context of the recent conversation` : ''} and provide a detailed event plan and budget breakdown.
        
        ${historyText ? `Recent Conversation:\n${historyText}\n` : ''}
        Latest User Request: "${userMessage}"

        Return ONLY a JSON object with the following structure:
        {
            "eventType": "string (e.g., Wedding, Birthday, Corporate)",
            "city": "string (detected city or 'Standard')",
            "guestCount": number,
            "totalBudget": number,
            "budgetBreakdown": [
                { "category": "Venue", "amount": number, "percentage": number, "note": "string" },
                { "category": "Catering", "amount": number, "percentage": number, "note": "string" },
                { "category": "Decor", "amount": number, "percentage": number, "note": "string" },
                { "category": "Photography", "amount": number, "percentage": number, "note": "string" },
                { "category": "Miscellaneous", "amount": number, "percentage": number, "note": "string" }
            ],
            "advice": ["Tip 1", "Tip 2", "Tip 3"],
            "summary": "Short summary of the plan"
        }

        Constraints:
        - Numbers only for currency (INR).
        - Percentages must sum to 100.
        - Be realistic for the Indian market.
    `;

    try {
        return await aiService.generateJSON(prompt);
    } catch (error) {
        console.error("Event Planner Service Error:", error);
        throw error;
    }
};

module.exports = { planEvent };
