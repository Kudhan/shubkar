import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { Send, Zap, User, Bot, Sparkles, Loader } from 'lucide-react';

const AIPlanEvent = () => {
    const [formData, setFormData] = useState({
        budget: '',
        guests: '',
        event_type: 'Wedding',
        priority_1: 'Venue',
        priority_2: 'Catering',
        priority_3: 'Photography'
    });
    const [messages, setMessages] = useState([
        { role: 'ai', content: "Hello! I'm your Shubakar AI Assistant. I can help you create a perfect budget breakdown for your event. Tell me a bit about what you're planning!" }
    ]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePlan = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Add user message mock
        const userMsg = { role: 'user', content: `Plan a ${formData.event_type} for ${formData.guests} guests with a budget of ₹${formData.budget}.` };
        setMessages(prev => [...prev, userMsg]);

        try {
            // Use existing Node.js api setup
            const prompt = `Plan a ${formData.event_type} for ${formData.guests} guests with a budget of ₹${formData.budget}. Priorities: ${formData.priority_1}, ${formData.priority_2}, ${formData.priority_3}.`;
            const res = await api.post('/ai/chat', { message: prompt, history: [] });
            
            const aiData = res.data.data;

            if (aiData.intent === 'EVENT_PLANNING' && aiData.content) {
                setResult(aiData.content);
                const aiMsg = { role: 'ai', content: aiData.text || "I've analyzed your requirements! Here is a recommended budget distribution to make your event perfect." };
                setMessages(prev => [...prev, aiMsg]);
            } else {
                setMessages(prev => [...prev, { role: 'ai', content: aiData.text || "I couldn't generate a specific budget plan for that request, but I'm here to help!" }]);
            }

        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error connecting to my brain. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-primary flex flex-col">
            <Navbar />

            <div className="flex-1 pt-24 pb-8 max-w-5xl mx-auto w-full px-4 flex flex-col">

                {/* Chat Container */}
                <div className="flex-1 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col relative">

                    {/* Header */}
                    <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between z-10">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center text-white shadow-lg">
                                <Sparkles size={20} />
                            </div>
                            <div className="ml-3">
                                <h2 className="font-bold text-gray-900">AI Event Planner</h2>
                                <p className="text-xs text-green-500 font-medium flex items-center">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span> Online
                                </p>
                            </div>
                        </div>
                        <span className="bg-brand-secondary/10 text-brand-secondary text-xs font-bold px-2 py-1 rounded">BETA</span>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.role === 'user' ? 'bg-gray-200 ml-3' : 'bg-brand-primary text-white mr-3'}`}>
                                        {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                    </div>
                                    <div className={`p-4 rounded-2xl shadow-sm text-sm ${msg.role === 'user' ? 'bg-gray-900 text-white rounded-tr-none' : 'bg-white border border-gray-100 rounded-tl-none'}`}>
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Result Card */}
                        {result && (
                            <div className="flex justify-start">
                                <div className="flex max-w-[90%] md:max-w-[70%] flex-row">
                                    <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center flex-shrink-0 mt-1 mr-3">
                                        <Bot size={16} />
                                    </div>
                                    <div className="bg-white border border-gray-100 p-6 rounded-2xl rounded-tl-none shadow-sm w-full">
                                        <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">
                                            {result.eventType} in {result.city}
                                        </h3>
                                        <div className="space-y-4">
                                            {result.budgetBreakdown?.map((item, idx) => (
                                                <div key={idx}>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="font-medium text-gray-600">{item.category}</span>
                                                        <span className="font-bold text-gray-900">₹{item.amount?.toLocaleString()}</span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                                        <div
                                                            className="bg-brand-secondary h-2 rounded-full"
                                                            style={{ width: `${item.percentage}%` }}
                                                        ></div>
                                                    </div>
                                                    {item.note && <p className="text-[10px] text-gray-500 mt-1 italic">{item.note}</p>}
                                                </div>
                                            ))}
                                            <div className="pt-4 mt-4 border-t border-gray-100 flex justify-between font-bold text-brand-primary">
                                                <span>Total Estimated Cost</span>
                                                <span>₹{result.totalBudget?.toLocaleString()}</span>
                                            </div>
                                            {result.summary && (
                                                <div className="pt-2 text-xs text-gray-600 bg-blue-50 p-2 rounded mt-2 border border-blue-100">
                                                    {result.summary}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {loading && (
                            <div className="flex justify-start animate-pulse">
                                <div className="flex items-center space-x-2 bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 ml-11">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        {/* Form Overlay for Quick Input */}
                        {!result && !loading && (
                            <form onSubmit={handlePlan} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 animate-slide-up">
                                <input type="number" name="budget" placeholder="Budget (₹)" required onChange={handleChange} className="p-2 border rounded-lg text-sm bg-gray-50 focus:bg-white outline-none focus:ring-1 focus:ring-brand-primary" />
                                <input type="number" name="guests" placeholder="Guests" required onChange={handleChange} className="p-2 border rounded-lg text-sm bg-gray-50 focus:bg-white outline-none focus:ring-1 focus:ring-brand-primary" />
                                <select name="event_type" onChange={handleChange} className="p-2 border rounded-lg text-sm bg-gray-50 focus:bg-white outline-none focus:ring-1 focus:ring-brand-primary">
                                    <option>Wedding</option>
                                    <option>Corporate</option>
                                    <option>Birthday</option>
                                </select>
                                <button type="submit" className="bg-gray-900 text-white rounded-lg flex items-center justify-center font-bold hover:bg-black transition-colors shadow-lg">
                                    <Zap size={16} className="mr-2" /> Generate
                                </button>
                            </form>
                        )}

                        {/* If result exists, show reset button */}
                        {result && (
                            <button onClick={() => { setResult(null); setMessages([{ role: 'ai', content: "Ready for another plan!" }]) }} className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                                Start New Plan
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AIPlanEvent;
