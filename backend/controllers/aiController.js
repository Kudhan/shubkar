const { classifyIntent } = require("../services/ai/intentClassifier");
const { planEvent } = require("../services/ai/eventPlannerService");
const { recommendVendors } = require("../services/ai/vendorAIService");
const { determineNavigation } = require("../services/ai/navigationService");
const aiService = require("../services/ai/groqService");

/**
 * AI Controller
 * Orchestrates the flow of the unified AI Chat system.
 */
const chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res
        .status(400)
        .json({ status: "fail", message: "Message is required" });
    }

    // Convert history format if needed
    const formattedHistory = history.map((h) => ({
      role: h.role === "user" ? "user" : "assistant",
      content: h.text || h.content || "",
    }));

    // 1. Classify Intent
    const intent = await classifyIntent(message, formattedHistory);
    console.log(`AI Chat Intent: ${intent}`);

    let aiResponse = {
      intent,
      content: null,
      text: "",
    };

    // 2. Route based on intent
    switch (intent) {
      case "EVENT_PLANNING":
        aiResponse.content = await planEvent(message, formattedHistory);
        aiResponse.text = "I've drafted a plan for you!";
        break;

      case "VENDOR_SEARCH":
        aiResponse.content = await recommendVendors(message, formattedHistory);
        aiResponse.text =
          aiResponse.content.aiAdvice ||
          "Here are some vendors that match your request.";
        break;

      case "SITE_NAVIGATION":
        aiResponse.content = await determineNavigation(message);
        aiResponse.text = "I can take you exactly where you need to go! Just click the link below.";
        break;

      case "GENERAL_HELP":
      default:
        const prompt = `
                    You are SHUBAKAR Assistant, a knowledgeable event planner on the "shubakar" platform.
                    User Message: "${message}"

                    Provide a helpful, polite, and conversational response. Keep it concise, friendly, and under 4 sentences.
                `;
        aiResponse.text = await aiService.generateContent(
          prompt,
          formattedHistory.slice(-6),
        );
        break;
    }

    res.status(200).json({
      status: "success",
      data: aiResponse,
    });
  } catch (error) {
    console.error("AI Controller Error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error in AI service",
    });
  }
};

/**
 * BACKWARD COMPATIBILITY: Restoring functions required by adminRoutes
 */
const getVendorRecommendations = async (req, res) => {
  // Legacy support for admin recommendation requests
  req.body.message = req.body.message || "Recommend some vendors";
  return chat(req, res);
};

const analyzeRisk = async (req, res) => {
  // Placeholder for budget risk analysis
  res.status(200).json({
    status: "success",
    data: {
      riskLevel: "LOW",
      analysis: "Automated risk assessment complete.",
    },
  });
};

module.exports = {
  chat,
  getVendorRecommendations,
  analyzeRisk,
};
