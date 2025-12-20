import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import ChatWindow from '../components/ChatWindow';
import { Calendar, CheckCircle, Clock, MessageSquare, Search, Zap, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [timelineProgress, setTimelineProgress] = useState(0);
    const [loading, setLoading] = useState(true);
    const [activeChat, setActiveChat] = useState(null);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bookingsRes, timelineRes] = await Promise.all([
                    api.get('/bookings'),
                    api.get('/timeline')
                ]);

                setBookings(bookingsRes.data.data.bookings);

                // Calculate Timeline Progress
                const events = timelineRes.data.data.timeline;
                const completed = events.filter(e => e.status === 'completed').length;
                const total = events.length;
                const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
                setTimelineProgress(progress);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'accepted': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 font-primary">
            <Navbar />

            {/* Hero Section */}
            <div className="bg-white border-b border-gray-100 pt-28 pb-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 font-secondary">
                                Welcome back, {user?.name.split(' ')[0]}! 👋
                            </h1>
                            <p className="text-gray-500 mt-1">Here's what's happening with your event planning.</p>
                        </div>
                        <div className="flex gap-3">
                            <Link to="/vendors" className="flex items-center px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                                <Search size={18} className="mr-2" /> Find Vendor
                            </Link>
                            <Link to="/ai-planner" className="flex items-center px-5 py-2.5 bg-brand-primary text-white font-semibold rounded-xl hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/25">
                                <Zap size={18} className="mr-2" /> Ask AI
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Total Bookings</p>
                                <h3 className="text-3xl font-bold text-gray-900">{bookings.length}</h3>
                            </div>
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                <Calendar size={24} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm text-gray-400">
                            <span className="text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded mr-2">
                                {bookings.filter(b => b.status === 'accepted').length} Confirmed
                            </span>
                            Active events
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Pending Requests</p>
                                <h3 className="text-3xl font-bold text-gray-900">{bookings.filter(b => b.status === 'pending').length}</h3>
                            </div>
                            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                                <Clock size={24} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm text-gray-400">
                            Awaiting vendor approval
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-brand-secondary to-teal-500 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-teal-100 font-medium mb-1">Tasks Completed</p>
                                    <h3 className="text-3xl font-bold">{timelineProgress}%</h3>
                                </div>
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <CheckCircle size={24} />
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="w-full bg-black/10 rounded-full h-1.5 mb-2">
                                    <div className="bg-white h-1.5 rounded-full" style={{ width: `${timelineProgress}%` }}></div>
                                </div>
                                <Link to="/timeline" className="text-sm font-semibold hover:underline flex items-center">
                                    Continue Planning <span className="ml-1">→</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Left: Bookings */}
                    <div className="lg:w-2/3">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 font-secondary">Recent Bookings</h2>
                            <Link to="/vendors" className="text-brand-primary text-sm font-semibold hover:underline">Browse All Vendors</Link>
                        </div>

                        <div className="space-y-4">
                            {loading ? (
                                <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100">Loading...</div>
                            ) : bookings.length === 0 ? (
                                <div className="p-12 text-center bg-white rounded-2xl border border-gray-100 border-dashed">
                                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                        <Calendar size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">No bookings yet</h3>
                                    <p className="text-gray-500 mb-6">Start by finding the perfect vendor for your event.</p>
                                    <Link to="/vendors" className="inline-block px-6 py-2.5 bg-brand-primary text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                                        Find Vendors
                                    </Link>
                                </div>
                            ) : (
                                bookings.map((booking) => (
                                    <div key={booking._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-5 items-start sm:items-center group">
                                        {/* Vendor Avatar Stub */}
                                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
                                            {booking.serviceType === 'Photography' ? '📸' :
                                                booking.serviceType === 'Catering' ? '🥗' : '🏢'}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-bold text-gray-900 text-lg group-hover:text-brand-primary transition-colors">
                                                    {booking.vendor?.companyName || "Vendor"}
                                                </h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 mb-1 flex items-center">
                                                <span className="font-medium text-gray-700">{booking.serviceType}</span>
                                                <span className="mx-2 text-gray-300">|</span>
                                                {new Date(booking.date).toLocaleDateString()}
                                            </p>
                                            {booking.notes && (
                                                <p className="text-xs text-gray-400 line-clamp-1 italic">"{booking.notes}"</p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4 w-full sm:w-auto mt-2 sm:mt-0 justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                                            <div className="text-right mr-2 hidden sm:block">
                                                <p className="text-xs text-gray-400 uppercase tracking-wide">Estimate</p>
                                                <p className="font-bold text-gray-900">₹{booking.price?.toLocaleString() || '-'}</p>
                                            </div>

                                            <div className="flex gap-2">
                                                {booking.status === 'accepted' && booking.paymentStatus !== 'paid' && (
                                                    <button
                                                        onClick={() => window.location.href = '/checkout'} // Simple redirect for now, ideally useNavigate with state
                                                    // replacing with useNavigate logic below inside the map context is tricky without rewriting map, so I will stick to component logic update recommendation.
                                                    >
                                                    </button>
                                                )}
                                            </div>

                                            {booking.status === 'accepted' && booking.paymentStatus !== 'paid' && (
                                                <Link
                                                    to="/checkout"
                                                    state={{ booking }}
                                                    className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl shadow-lg hover:bg-black transition-all flex items-center">
                                                    Pay Now
                                                </Link>
                                            )}

                                            {booking.paymentStatus === 'paid' && (
                                                <div className="flex items-center space-x-2">
                                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold border border-green-200 flex items-center">
                                                        <CheckCircle size={12} className="mr-1" /> Paid
                                                    </span>
                                                    <button onClick={() => alert(`Invoice #${booking.transactionId}\nAmount: ₹${booking.price}\nStatus: Paid`)} className="text-xs text-gray-500 underline hover:text-brand-primary">
                                                        Invoice
                                                    </button>
                                                </div>
                                            )}

                                            {booking.status !== 'rejected' && (
                                                <button
                                                    onClick={() => setActiveChat(booking._id)}
                                                    className="p-2.5 text-gray-400 hover:text-brand-primary hover:bg-brand-primary/5 rounded-xl transition-colors border border-transparent hover:border-brand-primary/10">
                                                    <MessageSquare size={20} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right: Smart Widgets */}
                    <div className="lg:w-1/3 space-y-6">

                        {/* Premium Upgrade / AI Promo */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                            <div className="relative z-10">
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4 text-brand-accent">
                                    <Star fill="currentColor" size={20} />
                                </div>
                                <h3 className="text-xl font-bold font-secondary mb-2">Upgrade Your Event</h3>
                                <p className="text-gray-400 text-sm mb-6">Get Verified Vendors and Advanced AI planning tools.</p>
                                <button onClick={() => window.location.href = '/ai-planner'} className="w-full py-3 bg-brand-accent text-gray-900 font-bold rounded-xl hover:bg-brand-accent/90 transition-colors">
                                    Try AI Planner
                                </button>
                            </div>
                        </div>

                        {/* Recent Activity / Timeline Stub */}
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4">Timeline</h3>
                            <div className="space-y-4 relative">
                                <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-gray-100"></div>

                                <div className="flex gap-4 relative">
                                    <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center flex-shrink-0 z-10 ring-4 ring-white">
                                        <CheckCircle size={14} />
                                    </div>
                                    <div className="pt-1">
                                        <p className="text-sm font-bold text-gray-800">Account Created</p>
                                        <p className="text-xs text-gray-400">Welcome to SHUBAKAR!</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 relative">
                                    <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 text-gray-400 flex items-center justify-center flex-shrink-0 z-10 ring-4 ring-white">
                                        <Calendar size={14} />
                                    </div>
                                    <div className="pt-1">
                                        <p className="text-sm font-medium text-gray-500">Book First Vendor</p>
                                        <p className="text-xs text-gray-400">Search for venues...</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {activeChat && (
                <ChatWindow
                    bookingId={activeChat}
                    currentUser={user}
                    onClose={() => setActiveChat(null)}
                />
            )}
        </div>
    );
};

export default Dashboard;
