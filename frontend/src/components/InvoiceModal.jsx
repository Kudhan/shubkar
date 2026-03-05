import React, { useRef, useState } from 'react';
import { X, Printer, Download, CheckCircle, Mail, Clock, Loader } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const InvoiceModal = ({ booking, onClose, user }) => {
    const modalRef = useRef();
    const [isSendingUrl, setIsSendingUrl] = useState(false);

    if (!booking) return null;

    const handlePrint = () => {
        window.print();
    };

    const handleSendEmail = async () => {
        try {
            setIsSendingUrl(true);
            await api.post(`/bookings/${booking._id}/send-invoice`);
            toast.success("Invoice sent directly to your email!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to send invoice email.");
        } finally {
            setIsSendingUrl(false);
        }
    };

    // Calculate dates
    const invoiceDate = new Date().toLocaleDateString();
    const dueDate = new Date(booking.date).toLocaleDateString();

    // Fallback for user data if not passed or incomplete
    const customerName = user?.name || "Customer";
    const customerEmail = user?.email || "customer@example.com";

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const amount = booking.finalPrice || booking.pricingDetails?.grandTotal || booking.negotiation?.currentOffer?.price || 0;
    // Note: Displaying actual paid amount without any additional GST
    const total = amount;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div
                ref={modalRef}
                className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up"
            >
                {/* Header */}
                <div className="bg-gray-900 text-white p-6 flex justify-between items-center print:bg-gray-900 print:text-white">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">✨</span>
                            <span className="text-xl font-bold font-secondary">SHUBAKAR</span>
                        </div>
                        <p className="text-gray-400 text-sm">Invoice #{booking.transactionId || `INV-${booking._id.substr(-6).toUpperCase()}`}</p>
                    </div>
                    <div className="flex gap-3 print:hidden">
                        <button
                            onClick={handlePrint}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white"
                            title="Print Invoice"
                        >
                            <Printer size={20} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 bg-white/10 hover:bg-red-500/80 rounded-xl transition-colors text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-8">
                    {/* Status Badge */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-1">Invoice</h2>
                            <p className="text-gray-500">Date: {invoiceDate}</p>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full font-bold uppercase tracking-wide flex items-center text-sm border ${['escrow', 'released', 'paid'].includes(booking.paymentStatus)
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-amber-100 text-amber-700 border-amber-200'
                            }`}>
                            {['escrow', 'released', 'paid'].includes(booking.paymentStatus) ? (
                                <>
                                    <CheckCircle size={16} className="mr-1.5" /> Paid
                                </>
                            ) : (
                                <>
                                    <Clock size={16} className="mr-1.5" /> {booking.paymentStatus || 'Pending'}
                                </>
                            )}
                        </div>
                    </div>

                    {/* From / To */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed From</h3>
                            <h4 className="font-bold text-gray-900 text-lg">{booking.vendor?.companyName || "Vendor Name"}</h4>
                            <p className="text-gray-500 text-sm mt-1">{booking.vendor?.city || "City, India"}</p>
                            <p className="text-gray-500 text-sm">support@shubakar.com</p>
                        </div>
                        <div className="text-left md:text-right">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</h3>
                            <h4 className="font-bold text-gray-900 text-lg">{customerName}</h4>
                            <p className="text-gray-500 text-sm mt-1">{customerEmail}</p>
                        </div>
                    </div>

                    {/* Line Items */}
                    <div className="border rounded-2xl overflow-hidden mb-8">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase">Description</th>
                                    <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <tr>
                                    <td className="py-4 px-6">
                                        <p className="font-bold text-gray-900">{booking.serviceType} Service</p>
                                        <p className="text-sm text-gray-500">Event Date: {new Date(booking.date).toLocaleDateString()}</p>
                                    </td>
                                    <td className="py-4 px-6 text-right font-medium text-gray-900">
                                        {formatCurrency(amount)}
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot className="bg-gray-50">
                                <tr>
                                    <td className="py-4 px-6 font-bold text-gray-900">Total</td>
                                    <td className="py-4 px-6 text-right font-bold text-xl text-brand-primary">
                                        {formatCurrency(total)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Footer - Payment Info */}
                    <div className="bg-gray-50 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-4 border border-gray-100">
                        <div className="text-sm text-gray-500">
                            <p><span className="font-bold text-gray-700">Payment ID:</span> {booking.paymentId || "PAY-" + Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                            <p><span className="font-bold text-gray-700">Payment Mode:</span> {booking.paymentMode || "Online"}</p>
                            <p><span className="font-bold text-gray-700">Paid on:</span> {invoiceDate}</p>
                        </div>
                        <button onClick={handleSendEmail} disabled={isSendingUrl} className="flex items-center gap-2 text-brand-primary font-bold hover:underline print:hidden disabled:opacity-50">
                            {isSendingUrl ? <><Loader size={16} className="animate-spin" /> Sending...</> : <><Mail size={16} /> Email Invoice</>}
                        </button>
                    </div>

                    <div className="mt-8 text-center text-xs text-gray-400 print:mt-4">
                        <p>Thank you for choosing Shubakar for your event planning needs.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceModal;
