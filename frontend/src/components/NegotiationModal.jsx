import React, { useState, useEffect, useRef } from 'react';
import { X, Send, CheckCircle, XCircle, MessageSquare, IndianRupee, Clock } from 'lucide-react';
import api from '../services/api';

const NegotiationModal = ({ booking, onClose, onUpdate, userRole }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [offerPrice, setOfferPrice] = useState(booking.negotiation?.currentPrice || booking.price || 0);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Initialize messages from history
        if (booking.negotiation?.history) {
            setMessages(booking.negotiation.history);
        }
        scrollToBottom();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [booking._id, booking.negotiation?.history?.length]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendOffer = async (e) => {
        e.preventDefault();
        if (!offerPrice) return;

        setLoading(true);
        try {
            await api.post(`/bookings/${booking._id}/negotiate`, {
                price: parseFloat(offerPrice),
                message: newMessage
            });
            setNewMessage('');
            onUpdate(); // Refund parent
            onClose(); // Close or maybe just refresh local state? For now close.
        } catch (err) {
            console.error("Failed to send offer", err);
            alert("Failed to send offer");
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async () => {
        if (!confirm("Are you sure you want to accept this booking at the current price?")) return;
        setLoading(true);
        try {
            await api.patch(`/bookings/${booking._id}/accept`);
            onUpdate();
            onClose();
        } catch (err) {
            console.error("Failed to accept", err);
            alert("Failed to accept booking");
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!confirm("Are you sure you want to reject this booking?")) return;
        setLoading(true);
        try {
            await api.patch(`/bookings/${booking._id}/reject`);
            onUpdate();
            onClose();
        } catch (err) {
            console.error("Failed to reject", err);
            alert("Failed to reject booking");
        } finally {
            setLoading(false);
        }
    };

    const isLastMessageMine = messages.length > 0 && messages[messages.length - 1].offeredBy === userRole;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h3 className="font-bold text-lg text-gray-900">
                            Negotiation for {booking.event?.name || 'Event'}
                        </h3>
                        <p className="text-sm text-gray-500">
                            Current Status: <span className="font-semibold uppercase">{booking.status}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4">
                    {/* Initial Inquiry Context */}
                    <div className="flex justify-center mb-6">
                        <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                            Inquiry started on {new Date(booking.date).toLocaleDateString()}
                        </span>
                    </div>

                    {messages.map((msg, idx) => {
                        const isMe = msg.offeredBy === userRole;
                        return (
                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl p-4 ${isMe ? 'bg-brand-primary text-white rounded-tr-none' : 'bg-white border border-gray-200 rounded-tl-none'}`}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`text-xs font-bold ${isMe ? 'text-blue-100' : 'text-gray-500'}`}>
                                            {isMe ? 'You' : (userRole === 'vendor' ? 'Customer' : 'Vendor')} · {msg.action}
                                        </span>
                                    </div>
                                    <div className="text-lg font-bold mb-1 flex items-center">
                                        <IndianRupee size={16} className="mr-1" /> {msg.price?.toLocaleString()}
                                    </div>
                                    {msg.message && <p className={`text-sm ${isMe ? 'text-blue-50' : 'text-gray-600'}`}>{msg.message}</p>}
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Actions Area */}
                {(booking.status === 'inquiry' || booking.status === 'negotiation') ? (
                    <div className="p-4 bg-white border-t border-gray-100">
                        {/* Status Banners */}
                        {(() => {
                            const status = booking.negotiation?.status;
                            const isMyTurn = (status === 'CUSTOMER_ACCEPTED' && userRole === 'vendor') ||
                                (status === 'VENDOR_ACCEPTED' && userRole === 'customer') ||
                                (status === 'OPEN' && userRole === 'vendor'); // Initial case fallback

                            if (!isMyTurn) {
                                return (
                                    <div className="bg-amber-50 text-amber-800 px-4 py-3 rounded-xl mb-4 text-center font-medium border border-amber-100 flex items-center justify-center">
                                        <Clock size={16} className="mr-2" />
                                        Waiting for the {userRole === 'customer' ? 'Vendor' : 'Customer'} to respond.
                                    </div>
                                );
                            }

                            return (
                                <div className="space-y-4">
                                    <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-xl text-center font-medium border border-blue-100 flex items-center justify-center">
                                        <CheckCircle size={16} className="mr-2" />
                                        Action Required: Review the offer below.
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={handleAccept}
                                            className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors flex justify-center items-center shadow-lg shadow-emerald-200"
                                        >
                                            <CheckCircle size={18} className="mr-2" /> Accept Offer
                                        </button>
                                        <button
                                            onClick={handleReject}
                                            className="flex-1 bg-white text-red-600 border border-red-100 py-3 rounded-xl font-bold hover:bg-red-50 transition-colors flex justify-center items-center"
                                        >
                                            <XCircle size={18} className="mr-2" /> Reject
                                        </button>
                                    </div>
                                    <div className="text-center text-xs text-gray-400 font-medium relative py-2">
                                        <span className="bg-white px-2 relative z-10">OR COUNTER WITH NEW PRICE</span>
                                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Counter Offer Form */}
                        {(() => {
                            const status = booking.negotiation?.status;
                            const isMyTurn = (status === 'CUSTOMER_ACCEPTED' && userRole === 'vendor') ||
                                (status === 'VENDOR_ACCEPTED' && userRole === 'customer') ||
                                (status === 'OPEN' && userRole === 'vendor') ||
                                (!status); // Allow if no status (legacy)

                            return (
                                <form onSubmit={handleSendOffer} className={`space-y-4 ${!isMyTurn ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <div className="flex gap-4">
                                        <div className="relative w-1/3">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                                <IndianRupee size={18} />
                                            </div>
                                            <input
                                                type="number"
                                                required
                                                value={offerPrice}
                                                onChange={(e) => setOfferPrice(e.target.value)}
                                                className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/50 outline-none"
                                                placeholder="Price"
                                            />
                                        </div>
                                        <input
                                            itemType="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/50 outline-none"
                                            placeholder={isMyTurn ? "Type a counter message..." : "Waiting for response..."}
                                        />
                                        <button
                                            type="submit"
                                            disabled={loading || !isMyTurn}
                                            className="px-6 bg-brand-primary text-white rounded-xl hover:bg-brand-secondary transition-colors"
                                        >
                                            <Send size={20} />
                                        </button>
                                    </div>
                                </form>
                            );
                        })()}
                    </div>
                ) : (
                    <div className="p-6 text-center text-gray-500 border-t border-gray-100 bg-gray-50">
                        Booking is <span className="font-bold">{booking.status}</span>. No further negotiation allowed.
                    </div>
                )}
            </div>
        </div>
    );
};

export default NegotiationModal;
