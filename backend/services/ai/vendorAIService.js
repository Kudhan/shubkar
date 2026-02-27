const aiService = require('./groqService');
const VendorProfile = require('../../models/VendorProfile');

/**
 * Vendor AI Service
 * Combines AI extraction with deterministic database queries.
 * 
 * DESIGN DECISION: We never let AI query the database directly. 
 * AI extracts filters -> System queries DB -> AI explains the results.
 */
const recommendVendors = async (userMessage, history = []) => {
    const historyText = history.map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join('\n');
    // 1. Extract filters using AI
    const extractionPrompt = `
        ${historyText ? `Recent Conversation:\n${historyText}\n` : ''}
        Latest User Message: "${userMessage}"
        
        Extract search filters for event vendors in India based on the current context and latest message.
        
        Return ONLY a JSON object:
        {
            "category": "string or null (Photographer, Caterer, Venue, Decorator, etc.)",
            "city": "string or null",
            "budgetMax": number or null,
            "keywords": ["tag1", "tag2"]
        }
    `;

    try {
        const filters = await aiService.generateJSON(extractionPrompt);
        
        // 2. Query MongoDB (Deterministic logic)
        const query = {};
        if (filters.category) {
            // Check if services array contains the category
            query.services = { $in: [new RegExp(filters.category, 'i')] };
        }
        if (filters.city) {
            query['location.city'] = new RegExp(filters.city, 'i');
        }
        if (filters.budgetMax) {
            query['priceRange.min'] = { $lte: filters.budgetMax };
        }

        const vendors = await VendorProfile.find(query).limit(5).select('companyName services location rating priceRange description');

        // 3. Let AI explain why these were picked or provide context
        let aiAdvice = "";
        if (vendors.length > 0) {
            const explanationPrompt = `
                I found these vendors for a user looking for "${userMessage}":
                ${JSON.stringify(vendors.map(v => v.companyName))}

                Briefly explain in 2 sentences why these options are good or what the user should look for next.
            `;
            aiAdvice = await aiService.generateContent(explanationPrompt);
        } else {
            aiAdvice = "No direct matches found. Try broadening your search terms or budget.";
        }

        return {
            filters,
            vendors,
            aiAdvice: aiAdvice.trim()
        };
    } catch (error) {
        console.error("Vendor AI Service Error:", error);
        throw error;
    }
};

module.exports = { recommendVendors };
