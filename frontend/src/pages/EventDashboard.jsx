import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { Calendar, MapPin, Users, DollarSign, PieChart, CheckCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import BudgetDash from '../components/budget/BudgetDash';

const EventDashboard = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const res = await api.get(`/events/${id}`);
                setEvent(res.data.data.event);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchEventDetails();
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!event) return <div className="min-h-screen flex items-center justify-center">Event not found</div>;

    const budgetPercent = Math.min(Math.round((event.budget.committed / event.budget.total) * 100), 100);

    return (
        <div className="min-h-screen bg-gray-50 font-primary">
            <Navbar />

            {/* Header */}
            <div className="bg-white border-b border-gray-200 pt-24 pb-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-xs font-bold rounded-full uppercase tracking-wide">
                                    {event.eventType}
                                </span>
                                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wide">
                                    {event.status}
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 font-secondary">{event.title}</h1>
                            <div className="flex items-center gap-6 mt-3 text-gray-500 text-sm font-medium">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} />
                                    {new Date(event.date.startDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} />
                                    {event.location?.city || 'Location TBD'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users size={16} />
                                    {event.guestCount} Guests
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Link to={`/events/${id}/edit`} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors">
                                Edit Details
                            </Link>
                            <Link to={`/events/${id}/vendors`} className="px-5 py-2.5 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/20">
                                + Add Vendors
                            </Link>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex space-x-8 border-b border-transparent">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`pb-4 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'overview' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('budget')}
                            className={`pb-4 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'budget' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Budget & Finance
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'overview' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Stats & Budget */}
                        <div className="space-y-6">
                            {/* Budget Card */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                                    <DollarSign size={20} className="mr-2 text-gray-400" /> Budget Overview
                                </h3>
                                <div className="mb-2 flex justify-between items-end">
                                    <span className="text-3xl font-bold text-gray-900">₹{event.budget.committed.toLocaleString()}</span>
                                    <span className="text-sm text-gray-500 mb-1">of ₹{event.budget.total.toLocaleString()}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                                    <div
                                        className={`h-2.5 rounded-full ${budgetPercent > 90 ? 'bg-red-500' : 'bg-green-500'}`}
                                        style={{ width: `${budgetPercent}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-400 text-right">{budgetPercent}% committed</p>
                                <button
                                    onClick={() => setActiveTab('budget')}
                                    className="w-full mt-4 text-center text-sm font-bold text-brand-primary hover:underline"
                                >
                                    View Full Budget
                                </button>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-gradient-to-br from-brand-secondary to-teal-600 rounded-2xl p-6 text-white shadow-lg">
                                <h3 className="font-bold text-lg mb-2">AI Planner</h3>
                                <p className="text-teal-100 text-sm mb-4">Get AI suggestions for venue and catering based on your budget.</p>
                                <Link to="/ai-planner" className="block w-full text-center py-2 bg-white text-teal-700 font-bold rounded-lg hover:bg-teal-50 transition-colors">
                                    Open AI Planner
                                </Link>
                            </div>
                        </div>

                        {/* Right Column: Vendors & Tasks */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Vendor Team */}
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-4 font-secondary">Your Vendor Team</h2>
                                {event.bookings && event.bookings.length > 0 ? (
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                                        {event.bookings.map(booking => (
                                            <div key={booking._id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                                                        {booking.serviceType === 'Photography' ? '📸' : '🏢'}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900">{booking.vendor?.companyName}</h4>
                                                        <p className="text-sm text-gray-500">{booking.serviceType}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                        booking.status === 'negotiation' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {booking.status}
                                                    </span>
                                                    <Link to="/dashboard" className="text-gray-400 hover:text-brand-primary">
                                                        <ArrowRight size={18} />
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-gray-200">
                                        <p className="text-gray-500 mb-4">No vendors booked yet.</p>
                                        <Link to={`/events/${id}/vendors`} className="inline-block px-5 py-2 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-primary/90">
                                            Browse Vendors
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <BudgetDash eventData={event} />
                )}
            </div>
        </div>
    );
};

export default EventDashboard;
