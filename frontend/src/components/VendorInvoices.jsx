import React, { useState } from 'react';
import { Download, Eye, FileText, Search } from 'lucide-react';
import InvoiceModal from './InvoiceModal';

const VendorInvoices = ({ bookings, user }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);

    // Filter for completed/confirmed bookings
    const invocableBookings = bookings.filter(b =>
        (b.status === 'confirmed' || b.status === 'completed') &&
        (b.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b._id.includes(searchTerm))
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h3 className="text-xl font-bold text-gray-900">Financial Records</h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by customer or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase">Invoice ID</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase">Customer</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase">Date</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase text-right">Amount</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {invocableBookings.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="py-8 text-center text-gray-500">No invoices found.</td>
                            </tr>
                        ) : (
                            invocableBookings.map((booking) => (
                                <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-6 font-medium text-gray-900">
                                        #{booking.transactionId || booking._id.substr(-6).toUpperCase()}
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                                {booking.customer?.name?.[0] || "C"}
                                            </div>
                                            <span className="font-medium text-gray-900">{booking.customer?.name || "Customer"}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-gray-500">
                                        {new Date(booking.date).toLocaleDateString()}
                                    </td>
                                    <td className="py-4 px-6 text-right font-bold text-gray-900">
                                        ₹{(booking.finalPrice || booking.pricingDetails?.grandTotal || 0).toLocaleString()}
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => setSelectedBooking(booking)}
                                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-brand-primary transition-colors"
                                                title="View Invoice"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => setSelectedBooking(booking)}
                                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-brand-primary transition-colors"
                                                title="Download PDF"
                                            >
                                                <Download size={18} />
                                            </button>
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
                    user={selectedBooking.customer}
                    onClose={() => setSelectedBooking(null)}
                />
            )}
        </div>
    );
};

export default VendorInvoices;
