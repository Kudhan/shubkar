import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import VendorProfileSettings from '../components/VendorProfileSettings';
import { Calendar, Check, X, MessageSquare, Clock, TrendingUp, Users, DollarSign, Layout, Settings } from 'lucide-react';

const VendorDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('bookings');
    const user = JSON.parse(localStorage.getItem('user'));

    const fetchBookings = async () => {
        try {
            const res = await api.get('/bookings');
            setBookings(res.data.data.bookings);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleAction = async (bookingId, status) => {
        try {
            await api.patch(`/bookings/${bookingId}`, { status });
            fetchBookings();
        } catch (err) {
            console.error('Error updating booking', err);
        }
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            accepted: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            pending: 'bg-amber-100 text-amber-700 border-amber-200',
            rejected: 'bg-gray-100 text-gray-600 border-gray-200'
        };
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${styles[status] || styles.rejected}`}>
                {status}
            </span>
        );
    };

    const StatCard = ({ title, value, icon: Icon, color, trend }) => (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${color}`}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <span className="bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center">
                        <TrendingUp size={12} className="mr-1" /> {trend}
                    </span>
                )}
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 font-primary">
            <Navbar />

            <div className="pt-28 pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 font-secondary">Vendor Hub</h1>
                        <p className="text-gray-500 mt-1">Manage your bookings and track your business growth.</p>
                    </div>
                    <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-200">
                        <button
                            onClick={() => setActiveTab('bookings')}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'bookings' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}>
                            <Layout size={16} className="inline mr-2" /> Bookings
                        </button>
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'profile' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}>
                            <Settings size={16} className="inline mr-2" /> Profile
                        </button>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <StatCard
                        title="Total Revenue (Est)"
                        value={`₹${bookings.filter(b => b.status === 'accepted').reduce((sum, b) => sum + (b.price || 0), 0).toLocaleString()}`}
                        icon={DollarSign}
                        color="bg-emerald-50 text-emerald-600"
                        trend="+12%"
                    />
                    <StatCard
                        title="Active Bookings"
                        value={bookings.filter(b => b.status === 'accepted').length}
                        icon={Calendar}
                        color="bg-blue-50 text-blue-600"
                    />
                    <StatCard
                        title="Pending Requests"
                        value={bookings.filter(b => b.status === 'pending').length}
                        icon={Clock}
                        color="bg-amber-50 text-amber-600"
                    />
                </div>

                {/* Content Area */}
                {activeTab === 'bookings' ? (
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        {/* ... Table Content ... (using strict existing structure) */}
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                            <h2 className="text-lg font-bold text-gray-900">Recent Requests</h2>
                            <div className="flex space-x-2 text-sm">
                                <span className="px-3 py-1 bg-white border rounded-lg text-gray-600 font-medium shadow-sm">All ({bookings.length})</span>
                                <span className="px-3 py-1 bg-amber-50 border border-amber-100 rounded-lg text-amber-700 font-medium">Pending ({bookings.filter(b => b.status === 'pending').length})</span>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {loading ? (
                                <div className="p-12 text-center text-gray-500">Loading requests...</div>
                            ) : bookings.length === 0 ? (
                                <div className="p-16 text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                        <MessageSquare size={32} />
                                    </div>
                                    <h3 className="text-gray-900 font-bold mb-1">No requests yet</h3>
                                    <p className="text-gray-500">Your profile is visible to thousands of customers.</p>
                                </div>
                            ) : (
                                bookings.map((booking) => (
                                    <div key={booking._id} className="p-6 hover:bg-gray-50 transition-colors group">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            {/* Date Box */}
                                            <div className="w-16 h-16 bg-gray-100 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-gray-600 border border-gray-200">
                                                <span className="text-xs font-bold uppercase">{new Date(booking.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                                                <span className="text-xl font-bold">{new Date(booking.date).getDate()}</span>
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-900 mr-3">{booking.customer?.name || "Customer"}</h3>
                                                        <p className="text-sm text-gray-500 flex items-center mt-1">
                                                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-semibold mr-2">{booking.serviceType}</span>
                                                            {booking.event?.name && `for ${booking.event.name}`}
                                                        </p>
                                                    </div>
                                                    <div className="mt-2 sm:mt-0 text-right">
                                                        <StatusBadge status={booking.status} />
                                                        {booking.paymentStatus === 'paid' && (
                                                            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded border border-green-200">PAID</span>
                                                        )}
                                                        <p className="font-bold text-gray-900 mt-1">₹{booking.price?.toLocaleString()}</p>
                                                    </div>
                                                </div>

                                                {booking.notes && (
                                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mt-3 text-sm text-gray-600 italic">
                                                        "{booking.notes}"
                                                    </div>
                                                )}

                                                {/* Actions Bar */}
                                                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                                                    <button className="text-brand-purple font-semibold text-sm hover:underline flex items-center">
                                                        <MessageSquare size={16} className="mr-2" /> Message Customer
                                                    </button>

                                                    {booking.status === 'pending' && (
                                                        <div className="flex space-x-3">
                                                            <button
                                                                onClick={() => handleAction(booking._id, 'rejected')}
                                                                className="px-4 py-2 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors">
                                                                Reject
                                                            </button>
                                                            <button
                                                                onClick={() => handleAction(booking._id, 'accepted')}
                                                                className="px-6 py-2 rounded-xl text-sm font-bold bg-gray-900 text-white shadow-lg hover:bg-gray-800 transition-all transform hover:-translate-y-0.5 flex items-center">
                                                                <Check size={16} className="mr-2" /> Accept Booking
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ) : (
                    <VendorProfileSettings />
                )}
            </div>
        </div>
    );
};

export default VendorDashboard;
