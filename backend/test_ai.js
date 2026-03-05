require('dotenv').config({ path: 'd:/projects/shubkar/backend/.env' });
const Groq = require("groq-sdk");
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testAI() {
    try {
        console.log("Testing Groq...");
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "user", content: "Say hi" }],
            model: "llama-3.3-70b-versatile",
            max_tokens: 10,
        });
        console.log("Groq Success:", chatCompletion.choices[0]?.message?.content);
    } catch (e) {
        console.error("Groq Error:", e.status, e.error?.error?.message || e.message);
    }

    try {
        console.log("\nTesting Gemini...");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Say hi");
        console.log("Gemini Success:", result.response.text());
    } catch (e) {
        console.error("Gemini Error:", e.status, e.message);
    }
}
testAI();
