import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import api from '../services/api'; // For fetching history
import { Send, X, MessageSquare } from 'lucide-react';

const ENDPOINT = 'http://localhost:5000';

const ChatWindow = ({ bookingId, currentUser, onClose }) => {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        // Fetch history
        const fetchHistory = async () => {
            try {
                const res = await api.get(`/chat/${bookingId}`);
                setMessages(res.data.data.messages);
                scrollToBottom();
            } catch (err) {
                console.error(err);
            }
        };
        fetchHistory();

        // Connect Socket
        const newSocket = io(ENDPOINT);
        setSocket(newSocket);

        newSocket.emit('join_room', bookingId);

        newSocket.on('receive_message', (message) => {
            setMessages((prev) => [...prev, message]);
            scrollToBottom();
        });

        return () => newSocket.close();
    }, [bookingId]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        const messageData = {
            bookingId,
            senderId: currentUser._id,
            content: newMessage
        };

        socket.emit('send_message', messageData);
        setNewMessage('');
    };

    // Helper to check if message is mine
    const isMine = (senderId) => {
        // senderId could be populated object or string ID
        const id = senderId._id || senderId;
        return id === currentUser._id;
    };

    return (
        <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 animate-fade-in-up">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 bg-brand-primary text-white rounded-t-2xl flex justify-between items-center">
                <div className="flex items-center">
                    <MessageSquare size={20} className="mr-2" />
                    <span className="font-bold">Chat</span>
                </div>
                <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full"><X size={18} /></button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${isMine(msg.sender) ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${isMine(msg.sender) ? 'bg-brand-primary text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                            }`}>
                            <p>{msg.content}</p>
                            <span className={`text-[10px] block mt-1 ${isMine(msg.sender) ? 'text-white/70' : 'text-gray-400'}`}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 border-t border-gray-100 flex gap-2 bg-white rounded-b-2xl">
                <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-sm"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" className="p-2 bg-brand-primary text-white rounded-full hover:opacity-90 transition-opacity">
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;
