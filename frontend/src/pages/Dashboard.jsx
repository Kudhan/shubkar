import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Calendar, Search, Zap, Clock, CheckCircle, MessageSquare,
    IndianRupee, Star, MapPin, ChevronRight
} from 'lucide-react';
import Skeleton from '../components/ui/Skeleton';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ChatWindow from '../components/ChatWindow';
import NegotiationModal from '../components/NegotiationModal';
import InvoiceModal from '../components/InvoiceModal';
import CustomerInvoices from '../components/CustomerInvoices';
import CustomerFeedback from '../components/CustomerFeedback';

const Dashboard = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [statusFilter, setStatusFilter] = useState('All');
    const [activeChat, setActiveChat] = useState(null);
    const [activeNegotiation, setActiveNegotiation] = useState(null);
    const [activeInvoice, setActiveInvoice] = useState(null);

    const fetchBookings = async () => {
        try {
            const res = await api.get('/bookings');
            setBookings(res.data.data.bookings);
        } catch (err) {
            console.error("Failed to fetch bookings", err);
            // Error is already handled by api interceptor with toast
        } finally {
            setLoading(false);
        }
    };

    const refreshBookings = () => {
        fetchBookings();
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
            case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            case 'negotiation': return 'bg-amber-100 text-amber-800 border-amber-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Calculate timeline progress
    const calculateProgress = () => {
        if (!bookings.length) return 25; // Account created
        const hasConfirmed = bookings.some(b => b.status === 'confirmed');
        const hasCompleted = bookings.some(b => b.status === 'completed');

        if (hasCompleted) return 100;
        if (hasConfirmed) return 75;
        return 50; // Made a booking inquiry
    };

    const timelineProgress = calculateProgress();

    return (
        <div className="min-h-screen bg-gray-50/50 font-primary">
            <Navbar />

            {/* Hero Section with Tabs */}
            <div className="bg-white border-b border-gray-100 pt-28 pb-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 font-secondary">
                                Welcome back, {user?.name.split(' ')[0]}! 👋
                            </h1>
                            <p className="text-gray-500 mt-1">Here's what's happening with your event planning.</p>
                        </div>
                        <div className="flex gap-3">
                            <Link to="/events" className="flex items-center px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                                <Calendar size={18} className="mr-2" /> My Events
                            </Link>
                            <Link to="/vendors" className="flex items-center px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                                <Search size={18} className="mr-2" /> Find Vendor
                            </Link>
                            <Link to="/ai-planner" className="flex items-center px-5 py-2.5 bg-brand-primary text-white font-semibold rounded-xl hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/25">
                                <Zap size={18} className="mr-2" /> Ask AI
                            </Link>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'overview' ? 'text-brand-primary' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Overview
                            {activeTab === 'overview' && <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-primary rounded-t-full"></div>}
                        </button>
                        <button
                            onClick={() => setActiveTab('payments')}
                            className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'payments' ? 'text-brand-primary' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Payments & Invoices
                            {activeTab === 'payments' && <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-primary rounded-t-full"></div>}
                        </button>
                        <button
                            onClick={() => setActiveTab('feedback')}
                            className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'feedback' ? 'text-brand-primary' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Completed & Feedback
                            {activeTab === 'feedback' && <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-primary rounded-t-full"></div>}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {activeTab === 'overview' ? (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            {/* ... existing stats ... */}
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
                                        {bookings.filter(b => b.status === 'confirmed').length} Confirmed
                                    </span>
                                    Active events
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">Pending Requests</p>
                                        <h3 className="text-3xl font-bold text-gray-900">{bookings.filter(b => b.status === 'inquiry' || b.status === 'negotiation').length}</h3>
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
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                    <h2 className="text-xl font-bold text-gray-900 font-secondary">Recent Bookings</h2>
                                    <div className="flex items-center gap-3">
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-primary"
                                        >
                                            <option value="All">All Statuses</option>
                                            <option value="inquiry">Inquiry</option>
                                            <option value="negotiation">Negotiating</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                        <Link to="/vendors" className="text-brand-primary text-sm font-semibold hover:underline hidden sm:block">Browse All</Link>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {loading ? (
                                        <div className="space-y-4">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-5 items-center">
                                                    <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
                                                    <div className="flex-1 w-full space-y-2">
                                                        <div className="flex justify-between w-full">
                                                            <Skeleton className="h-6 w-32" />
                                                            <Skeleton className="h-6 w-20 rounded-full" />
                                                        </div>
                                                        <Skeleton className="h-4 w-48" />
                                                        <Skeleton className="h-3 w-24" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
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
                                        bookings
                                            .filter(booking => statusFilter === 'All' || booking.status === statusFilter)
                                            .length === 0 ? (
                                                <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100 italic text-gray-500">
                                                    No bookings found for the selected status filter.
                                                </div>
                                            ) : bookings
                                            .filter(booking => statusFilter === 'All' || booking.status === statusFilter)
                                            .map((booking) => (
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
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(booking.status)} uppercase`}>
                                                            {booking.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 mb-1 flex items-center">
                                                        <span className="font-medium text-gray-700">{booking.serviceType}</span>
                                                        <span className="mx-2 text-gray-300">|</span>
                                                        {new Date(booking.date).toLocaleDateString()}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-gray-500">
                                                            Status: {booking.status === 'confirmed' ? 'Booked & Confirmed' : 'In Progress'}
                                                        </span>
                                                        {booking.notes && (
                                                            <p className="text-xs text-gray-400 line-clamp-1 italic border-l border-gray-200 pl-2">"{booking.notes}"</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 w-full sm:w-auto mt-2 sm:mt-0 justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                                                    <div className="text-right mr-2 hidden sm:block">
                                                        <p className="text-xs text-gray-400 uppercase tracking-wide">
                                                            {booking.status === 'negotiation' ? 'Latest Offer' : 'Estimate'}
                                                        </p>
                                                        <p className="font-bold text-gray-900">
                                                            ₹{(booking.finalPrice || booking.pricingDetails?.grandTotal || booking.negotiation?.currentOffer?.price || 0).toLocaleString()}
                                                        </p>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        {(booking.status === 'inquiry' || booking.status === 'negotiation') && (
                                                            <button
                                                                onClick={() => setActiveNegotiation(booking)}
                                                                className="px-3 py-2 bg-amber-50 text-amber-700 text-sm font-bold rounded-xl hover:bg-amber-100 transition-all flex items-center border border-amber-200"
                                                                title="Negotiate Price"
                                                            >
                                                                <IndianRupee size={16} className="mr-1" /> Negotiate
                                                            </button>
                                                        )}

                                                        {booking.status === 'confirmed' && !['paid', 'escrow', 'released'].includes(booking.paymentStatus) && (
                                                            <Link
                                                                to="/checkout"
                                                                state={{ booking }}
                                                                className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl shadow-lg hover:bg-black transition-all flex items-center">
                                                                Pay Now
                                                            </Link>
                                                        )}

                                                        {['paid', 'escrow', 'released'].includes(booking.paymentStatus) && (
                                                            <div className="flex items-center space-x-2">
                                                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold border border-green-200 flex items-center">
                                                                    <CheckCircle size={12} className="mr-1" /> Paid
                                                                </span>
                                                                <button onClick={() => setActiveInvoice(booking)} className="text-xs text-gray-500 underline hover:text-brand-primary">
                                                                    Invoice
                                                                </button>
                                                            </div>
                                                        )}

                                                        {booking.status !== 'rejected' && booking.status !== 'cancelled' && (
                                                            <button
                                                                onClick={() => setActiveChat(booking._id)}
                                                                className="p-2.5 text-gray-400 hover:text-brand-primary hover:bg-brand-primary/5 rounded-xl transition-colors border border-transparent hover:border-brand-primary/10">
                                                                <MessageSquare size={20} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Right: Smart Widgets */}
                            <div className="lg:w-1/3 space-y-6">
                                {/* Premium Upgrade */}
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

                                {/* Milestones */}
                                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                                    <h3 className="font-bold text-gray-900 mb-4">Planning Milestones</h3>
                                    <div className="space-y-4 relative">
                                        <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-gray-100"></div>
                                        {/* Milestone 1: Account Created */}
                                        <div className="flex gap-4 relative">
                                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 z-10 ring-4 ring-white">
                                                <CheckCircle size={14} />
                                            </div>
                                            <div className="pt-1">
                                                <p className="text-sm font-bold text-gray-800">Account Created</p>
                                                <p className="text-xs text-gray-400">Welcome to SHUBAKAR!</p>
                                            </div>
                                        </div>

                                        {/* Milestone 2: Create Event */}
                                        <div className="flex gap-4 relative">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ring-4 ring-white ${timelineProgress >= 50 ? 'bg-green-100 text-green-600' : 'bg-gray-50 border border-gray-200 text-gray-400'}`}>
                                                {timelineProgress >= 50 ? <CheckCircle size={14} /> : <Calendar size={14} />}
                                            </div>
                                            <div className="pt-1">
                                                <p className={`text-sm font-medium ${timelineProgress >= 50 ? 'text-gray-800 font-bold' : 'text-gray-500'}`}>Create Event</p>
                                                <p className="text-xs text-gray-400 text-opacity-80">Set date & venue</p>
                                            </div>
                                        </div>

                                        {/* Milestone 3: First Booking */}
                                        <div className="flex gap-4 relative">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ring-4 ring-white ${timelineProgress >= 75 ? 'bg-green-100 text-green-600' : 'bg-gray-50 border border-gray-200 text-gray-400'}`}>
                                                {timelineProgress >= 75 ? <CheckCircle size={14} /> : <Search size={14} />}
                                            </div>
                                            <div className="pt-1">
                                                <p className={`text-sm font-medium ${timelineProgress >= 75 ? 'text-gray-800 font-bold' : 'text-gray-500'}`}>Book Vendors</p>
                                                <p className="text-xs text-gray-400 text-opacity-80">Send inquiries</p>
                                            </div>
                                        </div>

                                        {/* Milestone 4: Confirm Booking */}
                                        <div className="flex gap-4 relative">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ring-4 ring-white ${timelineProgress >= 100 ? 'bg-green-100 text-green-600' : 'bg-gray-50 border border-gray-200 text-gray-400'}`}>
                                                {timelineProgress >= 100 ? <CheckCircle size={14} /> : <Star size={14} />}
                                            </div>
                                            <div className="pt-1">
                                                <p className={`text-sm font-medium ${timelineProgress >= 100 ? 'text-gray-800 font-bold' : 'text-gray-500'}`}>Confirm Vendors</p>
                                                <p className="text-xs text-gray-400 text-opacity-80">Finalize contracts</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : activeTab === 'payments' ? (
                    <CustomerInvoices bookings={bookings} user={user} />
                ) : (
                    <CustomerFeedback bookings={bookings} />
                )}
            </div>

            {/* Modals and Other Components */}
            {activeChat && (
                <ChatWindow
                    bookingId={activeChat}
                    currentUser={user}
                    onClose={() => setActiveChat(null)}
                />
            )}

            {activeNegotiation && (
                <NegotiationModal
                    booking={activeNegotiation}
                    userRole="customer"
                    onClose={() => setActiveNegotiation(null)}
                    onUpdate={refreshBookings}
                />
            )}

            {activeInvoice && (
                <InvoiceModal
                    booking={activeInvoice}
                    user={user}
                    onClose={() => setActiveInvoice(null)}
                />
            )}
        </div>
    );
};

export default Dashboard;
