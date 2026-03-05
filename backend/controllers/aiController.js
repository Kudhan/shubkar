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

    if (!message || typeof message !== "string") {
      return res
        .status(400)
        .json({ status: "fail", message: "Message is required and must be a string." });
    }

    if (message.length > 500) {
      return res
        .status(400)
        .json({ status: "fail", message: "Message length exceeds maximum allowed limit (500 chars)." });
    }

    // Convert history format if needed and truncate length to prevent payload OOM scaling attacks
    const maxHistoryItems = 6;
    let validHistory = Array.isArray(history) ? history.slice(-maxHistoryItems) : [];

    const formattedHistory = validHistory.map((h) => ({
      role: h.role === "user" ? "user" : "assistant",
      content: (h.text || h.content || "").substring(0, 1000), // Protect against massive injection
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
          You are SHUBAKAR Assistant, a highly knowledgeable and friendly AI event planning expert exclusively operating on the "SHUBAKAR" platform.

          ABOUT SHUBAKAR:
          SHUBAKAR is a premium Event Management Platform designed to connect customers with top-tier vendors for their events (Weddings, Corporate Events, Birthdays, etc.).
          Key Features for Customers:
          - Plan Events: Create events, set dates, and manage budgets.
          - Find Vendors: Search, filter, and book vendors across categories like Photography, Catering, Venues, Decoration, etc.
          - AI Planner: Get intelligent budget breakdowns and vendor recommendations.
          - Secure Payments & Invoices: Handle payments securely and generate detailed invoices.
          - Real-time Chat & Negotiation: Communicate and negotiate prices directly with vendors.
          
          Key Features for Vendors:
          - Vendor Dashboard: Manage bookings, inquiries, and track revenue.
          - Profile & Portfolio: Showcase services and past work.
          - Service Plans: Create customizable pricing tiers (Basic, Premium, Elite).

          YOUR ROLE:
          Answer the user's queries accurately based on the SHUBAKAR platform capabilities described above. 
          If they ask about things outside of event planning or the platform, politely redirect them.
          Keep your response concise, friendly, helpful, and under 4-5 sentences.

          User Message: "${message}"
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
  try {
    const { eventDetails, userBudget } = req.body;

    if (!eventDetails || typeof userBudget !== 'number') {
      return res.status(400).json({ status: "fail", message: "Event details and numeric budget are required." });
    }

    const prompt = `
        You are an expert AI risk analyst for SHUBAKAR, an event planning platform.
        Assess the budget and planning risk for an upcoming event based on the following details:
        Event Details: ${JSON.stringify(eventDetails)}
        User Budget: ${userBudget} INR
        
        Provide a structured JSON risk analysis containing:
        {
          "riskLevel": "LOW", "MEDIUM", or "CRITICAL",
          "analysis": "A concise 2 sentence explanation of the risk.",
          "hiddenCosts": ["String array of 2 potential hidden costs to watch out for"]
        }
    `;

    const riskData = await aiService.generateJSON(prompt);

    res.status(200).json({
      status: "success",
      data: riskData,
    });
  } catch (error) {
    console.error("AI Risk Assessment Error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error during risk analysis. Please try again later.",
    });
  }
};

module.exports = {
  chat,
  getVendorRecommendations,
  analyzeRisk,
};
