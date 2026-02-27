const Groq = require("groq-sdk");
const dotenv = require("dotenv");

dotenv.config();

/**
 * Groq Service
 * This service handles all direct communication with the Groq API.
 * We use llama-3.3-70b-versatile as it is fast and powerful.
 */
class GroqService {
    constructor() {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            console.error("CRITICAL: GROQ_API_KEY is not defined in environment variables.");
        }
        this.groq = new Groq({ apiKey });
        this.model = "llama-3.3-70b-versatile";
    }

    /**
     * Generate content from a prompt
     * @param {string} prompt - The engineered prompt
     * @param {Array} history - Previous messages
     * @returns {Promise<string>} - The raw text response
     */
    async generateContent(prompt, history = []) {
        try {
            const chatCompletion = await this.groq.chat.completions.create({
                messages: [
                    ...history,
                    { role: "user", content: prompt }
                ],
                model: this.model,
            });
            return chatCompletion.choices[0]?.message?.content || "";
        } catch (error) {
            console.error("Groq API Error:", error);
            throw new Error("Failed to communicate with AI service.");
        }
    }

    /**
     * Generate structured JSON from a prompt
     * @param {string} prompt - Prompt that explicitly asks for JSON
     * @param {Array} history - Previous messages
     * @returns {Promise<Object>} - Parsed JSON object
     */
    async generateJSON(prompt, history = []) {
        try {
            // Add a hint to always return valid JSON
            const systemPrompt = "You are a helpful assistant that only responds in valid JSON.";
            const chatCompletion = await this.groq.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    ...history,
                    { role: "user", content: prompt }
                ],
                model: this.model,
                response_format: { type: "json_object" }
            });
            
            const text = chatCompletion.choices[0]?.message?.content || "";
            return JSON.parse(text);
        } catch (error) {
            console.error("Groq JSON Error:", error);
            // Fallback: manually try to extract JSON if response_format fails or isn't perfect
            try {
                const text = await this.generateContent(prompt);
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                const cleanJson = jsonMatch ? jsonMatch[0] : text;
                return JSON.parse(cleanJson);
            } catch (fallbackError) {
                console.error("Fallback JSON Parsing Error:", fallbackError);
                throw new Error("AI returned invalid structured data.");
            }
        }
    }
}

module.exports = new GroqService();
