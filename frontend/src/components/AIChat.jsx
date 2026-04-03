import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, PieChart, MapPin, Zap, ExternalLink, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Lock } from 'lucide-react';

const AIChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', text: "Hello! I'm your SHUBAKAR AI Assistant. How can I help you plan your celebration today?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const { user } = useAuth();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput('');
        
        // Prepare history for backend (max 6 previous messages to limit payload size)
        const historyToSend = messages.slice(-6).map(m => ({
            role: m.role,
            text: m.text || ""
        }));

        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const res = await api.post('/ai/chat', { 
                message: userMsg,
                history: historyToSend 
            });
            const { intent, content, text } = res.data.data;

            setMessages(prev => [...prev, { 
                role: 'ai', 
                text, 
                intent, 
                content 
            }]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { 
                role: 'ai', 
                text: "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later." 
            }]);
        } finally {
            setLoading(false);
        }
    };

    const formatText = (text) => {
        if (!text) return null;
        return text.split('\n').map((line, i) => {
            // Very simple bold replacement for **text**
            const parts = line.split(/(\*\*.*?\*\*)/g);
            return (
                <div key={i} className="min-h-[1.5em]">
                    {parts.map((p, j) => {
                        if (p.startsWith('**') && p.endsWith('**')) {
                            return <strong key={j}>{p.slice(2, -2)}</strong>;
                        }
                        return <span key={j}>{p}</span>;
                    })}
                </div>
            );
        });
    };

    // --- Sub-components for structured data ---

    const BudgetTable = ({ plan }) => {
        if (!plan) return null;
        return (
            <div className="mt-4 bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gray-900 text-white p-3 flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                    <span>{plan.eventType || 'Event'} Budget - {plan.city || 'Standard'}</span>
                    <span>₹{(plan.totalBudget || 0).toLocaleString()}</span>
                </div>
                <div className="p-3 space-y-3">
                    {Array.isArray(plan.budgetBreakdown) && plan.budgetBreakdown.map((item, i) => (
                        <div key={i}>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-semibold text-gray-700">{item?.category || 'Category'}</span>
                                <span className="font-bold text-gray-900">₹{(item?.amount || 0).toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div className="bg-brand-secondary h-1.5 rounded-full" style={{ width: `${item?.percentage || 0}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
                {plan.summary && (
                    <div className="bg-blue-50 p-3 text-[10px] text-blue-700 italic border-t border-blue-100">
                        {plan.summary}
                    </div>
                )}
            </div>
        );
    };

    const VendorCards = ({ data }) => {
        if (!data || !Array.isArray(data.vendors)) return null;
        return (
            <div className="mt-4 space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest pl-1">Recommendations</p>
                {data.vendors.map((vendor, i) => (
                    <div key={i} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-gray-900 flex items-center gap-1">
                                    {vendor?.companyName || 'Unknown Vendor'}
                                    <Zap size={10} className="text-brand-primary fill-brand-primary" />
                                </h4>
                                <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                                    <MapPin size={10} /> {vendor?.location?.city || 'Location N/A'} • {vendor?.services?.[0] || 'Service N/A'}
                                </p>
                            </div>
                            {vendor?._id && (
                                <Link 
                                    to={`/vendors/${vendor._id}`}
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                                >
                                    <ExternalLink size={14} />
                                </Link>
                            )}
                        </div>
                    </div>
                ))}
                {data.aiAdvice && (
                    <div className="p-3 bg-brand-primary/5 rounded-xl border border-brand-primary/10 text-xs text-brand-primary italic">
                        "{data.aiAdvice}"
                    </div>
                )}
            </div>
        );
    };

    const NavigationCard = ({ content }) => (
        <div className="mt-4">
            <Link 
                to={content.route || '/dashboard'} 
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between w-full bg-gray-900 text-white p-3 rounded-xl shadow-md hover:bg-black transition-colors group"
            >
                <span className="font-bold text-sm tracking-wide">{content.label || 'Go there now!'}</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
    );

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="w-80 sm:w-96 h-[500px] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden mb-4 animate-fade-in-up">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-brand-primary to-brand-secondary p-4 text-white flex justify-between items-center shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                                <Sparkles size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm leading-none">SHUBAKAR AI</h3>
                                <p className="text-[10px] text-white/70 mt-1">Smart Planning Assistant</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.role === 'user' ? 'bg-gray-200 ml-2' : 'bg-brand-primary text-white mr-2'}`}>
                                        {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                    </div>
                                    <div className="space-y-2">
                                        <div className={`p-3 rounded-2xl text-sm shadow-sm ${msg.role === 'user' ? 'bg-gray-900 text-white rounded-tr-none' : 'bg-white border border-gray-100 rounded-tl-none text-gray-800'}`}>
                                            {msg.role === 'ai' ? formatText(msg.text) : msg.text}
                                        </div>
                                        {/* Structured Content Rendering */}
                                        {msg.intent === 'EVENT_PLANNING' && msg.content && <BudgetTable plan={msg.content} />}
                                        {msg.intent === 'VENDOR_SEARCH' && msg.content && <VendorCards data={msg.content} />}
                                        {msg.intent === 'SITE_NAVIGATION' && msg.content && <NavigationCard content={msg.content} />}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="ml-10 bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 flex gap-1 items-center animate-pulse">
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Login Nudge Overlay for Guests */}
                    {!user && (
                        <div className="absolute inset-x-0 bottom-0 top-[72px] bg-white/90 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                            <div className="w-16 h-16 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mb-4 shadow-inner">
                                <Lock size={32} />
                            </div>
                            <h4 className="font-bold text-gray-900 text-lg mb-2">Member Service Only</h4>
                            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                                Our smart AI assistant is available exclusively for registered members. 
                                Log in to get personalized planning advice and vendor matches!
                            </p>
                            <Link 
                                to="/login" 
                                onClick={() => setIsOpen(false)}
                                className="w-full py-3 bg-brand-primary text-white font-bold rounded-2xl shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                Sign In to Chat
                            </Link>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="mt-4 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
                            >
                                Maybe Later
                            </button>
                        </div>
                    )}

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2">
                        <input
                            type="text"
                            placeholder="Ask me anything..."
                            className="flex-1 bg-gray-50 border-none rounded-2xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={!user || loading}
                        />
                        <button type="submit" disabled={!input.trim() || loading || !user} className="p-2.5 bg-brand-primary text-white rounded-xl shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}

            {/* Launch Button */}
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all group relative"
                >
                    <div className="absolute inset-0 rounded-full bg-brand-primary animate-ping opacity-20"></div>
                    <MessageSquare size={28} className="group-hover:rotate-12 transition-transform" />
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-brand-accent text-gray-900 rounded-full flex items-center justify-center font-bold text-[10px] animate-bounce">1</div>
                </button>
            )}
        </div>
    );
};

export default AIChat;
