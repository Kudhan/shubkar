import React, { useState } from 'react';
import { Download, Eye, FileText, Search, CreditCard, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import InvoiceModal from './InvoiceModal';

const CustomerInvoices = ({ bookings, user }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'paid'
    const [selectedBooking, setSelectedBooking] = useState(null);

    // Filter confirmed/completed bookings relevant to invoices
    const relevantBookings = bookings.filter(b =>
        (b.status === 'confirmed' || b.status === 'completed') &&
        (b.vendor?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b._id.includes(searchTerm))
    );

    const paidBookings = relevantBookings.filter(b => ['escrow', 'released', 'paid'].includes(b.paymentStatus));
    const pendingBookings = relevantBookings.filter(b => !['escrow', 'released', 'paid'].includes(b.paymentStatus));

    const displayBookings = activeTab === 'paid' ? paidBookings : pendingBookings;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h3 className="text-xl font-bold text-gray-900 font-secondary">Payments & Invoices</h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search vendor or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none text-sm w-64"
                    />
                </div>
            </div>

            <div className="flex gap-6 border-b border-gray-100 mb-6">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'pending' ? 'text-brand-primary' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Pending Payments ({pendingBookings.length})
                    {activeTab === 'pending' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary rounded-t-full"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('paid')}
                    className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'paid' ? 'text-brand-primary' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Payment History ({paidBookings.length})
                    {activeTab === 'paid' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary rounded-t-full"></div>}
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Reference ID</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Vendor</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Amount</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {displayBookings.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="py-12 text-center text-gray-400">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 text-gray-300">
                                            <FileText size={24} />
                                        </div>
                                        <p>No {activeTab} records found.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            displayBookings.map((booking) => (
                                <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="py-4 px-6 font-medium text-gray-600 text-xs">
                                        #{booking.transactionId || booking._id.substr(-8).toUpperCase()}
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                                {booking.vendor?.companyName?.[0] || "V"}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">{booking.vendor?.companyName || "Vendor"}</p>
                                                <p className="text-xs text-gray-400">{booking.serviceType}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-gray-500 text-sm">
                                        {new Date(booking.date).toLocaleDateString()}
                                    </td>
                                    <td className="py-4 px-6 text-right font-bold text-gray-900">
                                        ₹{(booking.finalPrice || booking.pricingDetails?.grandTotal || 0).toLocaleString()}
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${activeTab === 'paid'
                                            ? 'bg-green-100 text-green-800 border border-green-200'
                                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                                            }`}>
                                            {activeTab === 'paid' ? 'Paid' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex justify-center gap-2">
                                            {activeTab === 'pending' ? (
                                                <Link
                                                    to="/checkout"
                                                    state={{ booking }}
                                                    className="px-3 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center"
                                                >
                                                    <CreditCard size={14} className="mr-1.5" /> Pay Now
                                                </Link>
                                            ) : (
                                                <button
                                                    onClick={() => setSelectedBooking(booking)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-brand-primary transition-colors flex items-center gap-1 text-xs font-medium"
                                                >
                                                    <Download size={14} /> Invoice
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {selectedBooking && (
                <InvoiceModal
                    booking={selectedBooking}
                    user={user}
                    onClose={() => setSelectedBooking(null)}
                />
            )}
        </div>
    );
};

export default CustomerInvoices;
