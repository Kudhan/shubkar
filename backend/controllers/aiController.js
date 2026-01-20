// Mock AI Controller
const VendorProfile = require('../models/VendorProfile');

exports.getVendorRecommendations = async (req, res) => {
    try {
        // In a real app, this would call a Python flask service or OpenAI API
        // For now, simple rule-based matching based on query
        const { eventType, budget, city } = req.body;

        const recommended = await VendorProfile.find({
            "location.city": city,
            "priceRange.min": { $lte: budget / 2 } // Heuristic: service shouldn't exceed 50% of budget
        }).limit(5);

        res.status(200).json({
            status: 'success',
            ai_model: 'shubakar-recommend-v1',
            data: { recommendations: recommended }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.analyzeRisk = async (req, res) => {
    try {
        const { vendorId } = req.body;
        // Mock risk analysis
        const riskScore = Math.floor(Math.random() * 100);
        const riskLevel = riskScore < 20 ? 'Low' : riskScore < 70 ? 'Medium' : 'High';

        res.status(200).json({
            status: 'success',
            data: {
                vendorId,
                riskScore,
                riskLevel,
                factors: ['Response Time', 'Cancellation Rate']
            }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};
