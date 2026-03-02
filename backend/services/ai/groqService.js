const Groq = require("groq-sdk");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

/**
 * Advanced AI Service
 * Features:
 * 1. Primary: Groq (Llama 3.3) for speed.
 * 2. Fallback: Google Gemini for reliability under load.
 * 3. Caching: Simple memory cache for identical queries to save API limits.
 * 4. Robust JSON Parsing: Handles markdown code blocks and malformed outputs.
 */
class AdvancedAIService {
    constructor() {
        this.cache = new Map();
        this.cacheTTL = 1000 * 60 * 60; // 1 hour cache

        const groqApiKey = process.env.GROQ_API_KEY;
        if (!groqApiKey) console.error("CRITICAL: GROQ_API_KEY is missing.");
        this.groq = new Groq({ apiKey: groqApiKey });
        this.groqModel = "llama-3.3-70b-versatile";

        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (!geminiApiKey) console.warn("WARN: GEMINI_API_KEY is missing. Fallback will not work.");
        if (geminiApiKey) {
            const genAI = new GoogleGenerativeAI(geminiApiKey);
            this.geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        }
    }

    _getCacheKey(prompt, history) {
        return prompt + JSON.stringify(history.map(h => h.content));
    }

    async generateContent(prompt, history = []) {
        const cacheKey = this._getCacheKey(prompt, history);
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTTL) {
                return cached.data;
            }
            this.cache.delete(cacheKey); // Expired
        }

        try {
            // Attempt 1: Groq
            const chatCompletion = await this.groq.chat.completions.create({
                messages: [...history, { role: "user", content: prompt }],
                model: this.groqModel,
                temperature: 0.7,
                max_tokens: 1024,
            });
            const text = chatCompletion.choices[0]?.message?.content || "";
            this.cache.set(cacheKey, { data: text, timestamp: Date.now() });
            return text;
        } catch (groqError) {
            console.warn("Groq API Failed, attempting fallback to Gemini...", groqError.message);
            // Attempt 2: Fallback to Gemini
            if (this.geminiModel) {
                try {
                    let fullPrompt = history.map(h => `${h.role}: ${h.content}`).join('\n') + `\nuser: ${prompt}`;
                    const result = await this.geminiModel.generateContent(fullPrompt);
                    const text = result.response.text();
                    this.cache.set(cacheKey, { data: text, timestamp: Date.now() });
                    return text;
                } catch (geminiError) {
                    console.error("Gemini Fallback Error:", geminiError.message);
                }
            }
            throw new Error("All AI providers failed to generate complete response.");
        }
    }

    async generateJSON(prompt, history = []) {
        const cacheKey = this._getCacheKey("JSON_" + prompt, history);
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTTL) {
                return cached.data;
            }
            this.cache.delete(cacheKey);
        }

        const systemPrompt = "You must respond with ONLY valid JSON. Absolutely no markdown or extra text.";
        const fullPrompt = `${systemPrompt}\n${prompt}`;

        let text = "";
        try {
            // Groq Attempt
            const chatCompletion = await this.groq.chat.completions.create({
                messages: [{ role: "system", content: systemPrompt }, ...history, { role: "user", content: prompt }],
                model: this.groqModel,
                response_format: { type: "json_object" }
            });
            text = chatCompletion.choices[0]?.message?.content || "";
        } catch (error) {
            console.warn("Groq JSON generation failed, falling back to Gemini...");
            if (this.geminiModel) {
                const result = await this.geminiModel.generateContent(fullPrompt);
                text = result.response.text();
            } else {
                throw new Error("AI Providers exhausted for JSON setup");
            }
        }

        // Robust JSON Extraction
        try {
            // Remove markdown codeblock wrappers if LLM returned them
            if (text.startsWith("```json")) {
                text = text.replace(/```json\n?/, "").replace(/```$/, "");
            } else if (text.startsWith("```")) {
                text = text.replace(/```\n?/, "").replace(/```$/, "");
            }
            const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
            const cleanText = jsonMatch ? jsonMatch[0] : text;
            const parsed = JSON.parse(cleanText);
            this.cache.set(cacheKey, { data: parsed, timestamp: Date.now() });
            return parsed;
        } catch (parseError) {
            console.error("Failed to parse JSON AI response:", text);
            throw new Error("AI returned malformed structured data that could not be repaired.");
        }
    }
}

module.exports = new AdvancedAIService();
