import React, { useState } from 'react';
import { X, Calendar, MessageSquare, Briefcase, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const BookingModal = ({ isOpen, onClose, vendor }) => {
    const [step, setStep] = useState(1); // 1: Form, 2: Success
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        date: '',
        serviceType: vendor?.services?.[0] || '',
        notes: ''
    });

    if (!isOpen || !vendor) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Parse price: Remove commas and non-numeric characters, fallback to 0
            const rawPrice = vendor.priceRange ? String(vendor.priceRange).replace(/[^0-9]/g, '') : '15000';
            const parsedPrice = parseInt(rawPrice, 10) || 0;

            await api.post('/bookings', {
                vendorId: vendor.vendorProfileId || vendor._id,
                serviceType: formData.serviceType,
                date: formData.date,
                price: parsedPrice,
                notes: formData.notes
            });
            setStep(2);
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Failed to send booking request. Please try again.';
            alert(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden scale-100 transition-all">
                {step === 1 ? (
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 font-secondary">Book Vendor</h2>
                                <p className="text-gray-500 text-sm">Request a quote from <span className="font-semibold text-gray-900">{vendor.companyName}</span></p>
                            </div>
                            <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Event Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3.5 top-3 text-gray-400" size={18} />
                                    <input
                                        type="date"
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none font-medium text-gray-700"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Service Type</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3.5 top-3 text-gray-400" size={18} />
                                    <select
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none font-medium text-gray-700 bg-white"
                                        value={formData.serviceType}
                                        onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                                    >
                                        {vendor.services?.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Notes (Optional)</label>
                                <div className="relative">
                                    <textarea
                                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none font-medium text-gray-700 h-28 resize-none"
                                        placeholder="Describe your event, venue details, or specific requests..."
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    />
                                    <MessageSquare className="absolute right-3 top-3 text-gray-300" size={18} />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-3.5 bg-brand-primary text-white font-bold rounded-xl shadow-lg hover:bg-brand-primary/90 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:translate-y-0 flex justify-center items-center"
                                >
                                    {submitting ? <Loader2 className="animate-spin mr-2" /> : null}
                                    {submitting ? 'Sending Request...' : 'Send Booking Request'}
                                </button>
                                <p className="text-center text-xs text-gray-400 mt-3">
                                    No payment required yet. Vendor will review your request.
                                </p>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="p-8 text-center py-16">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-slow">
                            <CheckCircle2 size={40} className="text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Sent!</h2>
                        <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                            Your booking request has been sent to <strong>{vendor.companyName}</strong>. You'll be notified when they accept.
                        </p>
                        <button
                            onClick={onClose}
                            className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors"
                        >
                            Back to Search
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingModal;
