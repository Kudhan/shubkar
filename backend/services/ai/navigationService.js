const aiService = require('./groqService');

const determineNavigation = async (userMessage) => {
    const prompt = `
        You are a navigation router for the "SHUBAKAR" event planning platform.
        Determine which application route the user wants to go to based on their message.

        Available Routes:
        - "/dashboard" (My Dashboard, my overview, home)
        - "/profile" (My Profile, settings, account)
        - "/vendors" (Search Vendors, browse vendors generally)
        - "/ai-planner" (AI Planner, event planner AI tool)
        - "/timeline" (Event Timeline)
        - "/checkout" (Checkout, cart, pay)
        - "/events" (My Events, list of events)
        - "/events/create" (Create Event, start a new event, make an event)

        User Message: "${userMessage}"

        Choose the single best matching route.
        Return ONLY a JSON object with this shape:
        {
            "route": "string (the exact path from the list)",
            "label": "string (a short 2-3 word button label, e.g. 'View Dashboard')"
        }
    `;

    try {
        const response = await aiService.generateJSON(prompt);
        return response;
    } catch (error) {
        console.error("Navigation Service Error:", error);
        return {
            route: "/dashboard",
            label: "Go to Dashboard"
        };
    }
};

module.exports = { determineNavigation };
