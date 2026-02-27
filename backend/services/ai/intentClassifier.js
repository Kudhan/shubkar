const aiService = require('./groqService');

/**
 * Intent Classifier
 * Determines the user's goal from their message.
 * 
 * REASONING: Unified chat requires a way to route messages to specific features.
 * Instead of complex regex, we use the LLM to understand context and intent.
 */
const classifyIntent = async (message, history = []) => {
    const historyText = history.map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join('\n');
    const prompt = `
        You are an intent classifier for "SHUBAKAR", an event planning platform.
        Classify the user's LATEST message into exactly one of these categories:
        
        1. EVENT_PLANNING: User wants to plan a budget, breakdown costs, or organize an event.
        2. VENDOR_SEARCH: User is looking for specific vendors (photographers, caterers, venues, etc.) or asking for recommendations.
        3. SITE_NAVIGATION: User is explicitly asking to navigate to a page like their dashboard, profile, timeline, checkout, or to create an event.
        4. GENERAL_HELP: User is asking general event questions, how to use the site generally, or is just chatting.

        ${historyText ? `Recent Conversation Context:\n${historyText}\n` : ''}
        Latest User Message: "${message}"

        Return ONLY the category name in uppercase without any extra text or numbering.
    `;

    try {
        const response = await aiService.generateContent(prompt);
        // Sometimes the AI might append periods or spaces or "4. GENERAL_HELP", so we clean it.
        const intent = response.replace(/[^A-Za-z_]/g, '').trim().toUpperCase();

        const validIntents = ['EVENT_PLANNING', 'VENDOR_SEARCH', 'SITE_NAVIGATION', 'GENERAL_HELP'];
        return validIntents.includes(intent) ? intent : 'GENERAL_HELP';
    } catch (error) {
        console.error("Intent Classification Error:", error);
        return 'GENERAL_HELP'; // Safely fallback
    }
};

module.exports = { classifyIntent };
