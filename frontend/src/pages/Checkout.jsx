import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { CreditCard, Lock, ShieldCheck, Loader, CheckCircle } from 'lucide-react';

const Checkout = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const booking = state?.booking;

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!booking) {
            navigate('/dashboard');
        }
    }, [booking, navigate]);

    const handlePayment = async () => {
        setLoading(true);
        setError('');
        try {
            await api.post('/payments/pay', {
                bookingId: booking._id,
                amount: booking.price,
                paymentMethod: 'credit_card'
            });
            setSuccess(true);
            setTimeout(() => {
                navigate('/dashboard');
            }, 3000);
        } catch (err) {
            setError('Payment process failed. Please try again.');
            setLoading(false);
        }
    };

    if (!booking) return null;

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 font-primary flex flex-col items-center justify-center">
                <div className="bg-white p-10 rounded-3xl shadow-2xl text-center max-w-md mx-4 animate-fade-in-up">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="text-green-600 w-12 h-12" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2 font-secondary">Payment Successful!</h2>
                    <p className="text-gray-500 mb-8">Your booking with <span className="font-bold text-gray-800">{booking.vendor?.companyName}</span> is now confirmed.</p>
                    <p className="text-sm text-gray-400">Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-primary">
            <Navbar />
            <div className="pt-28 pb-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                <h1 className="text-3xl font-bold text-gray-900 mb-8 font-secondary">Secure Checkout</h1>

                <div className="flex flex-col md:flex-row gap-8">

                    {/* Order Summary */}
                    <div className="w-full md:w-2/5 order-2 md:order-1">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Booking Summary</h3>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Service</span>
                                    <span className="font-medium text-gray-900">{booking.serviceType}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Vendor</span>
                                    <span className="font-medium text-gray-900">{booking.vendor?.companyName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Event Date</span>
                                    <span className="font-medium text-gray-900">{new Date(booking.date).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4 flex justify-between items-center text-xl font-bold">
                                <span>Total Amount</span>
                                <span className="text-brand-primary">₹{booking.price?.toLocaleString()}</span>
                            </div>

                            <div className="mt-6 flex items-center text-xs text-gray-400 bg-gray-50 p-3 rounded-lg">
                                <ShieldCheck size={16} className="mr-2 text-green-600" />
                                SSL Secured Payment. Your data is safe.
                            </div>
                        </div>
                    </div>

                    {/* Payment Form */}
                    <div className="w-full md:w-3/5 order-1 md:order-2">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xl font-bold text-gray-900">Payment Details</h3>
                                <div className="flex space-x-2">
                                    <div className="w-10 h-6 bg-blue-600 rounded"></div>
                                    <div className="w-10 h-6 bg-red-500 rounded"></div>
                                    <div className="w-10 h-6 bg-orange-500 rounded"></div>
                                </div>
                            </div>

                            {error && (
                                <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center">
                                    <Lock size={16} className="mr-2" /> {error}
                                </div>
                            )}

                            {/* Mock Card Visual */}
                            <div className="mb-8 w-full h-48 rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 relative shadow-xl overflow-hidden">
                                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                                <div className="flex justify-between items-start mb-10">
                                    <CreditCard size={32} className="opacity-80" />
                                    <span className="font-mono opacity-50">DEBIT</span>
                                </div>
                                <p className="font-mono text-xl tracking-widest mb-4">4242 4242 4242 4242</p>
                                <div className="flex justify-between">
                                    <div>
                                        <p className="text-xs opacity-50 uppercase">Card Holder</p>
                                        <p className="font-medium tracking-wider">JOHN DOE</p>
                                    </div>
                                    <div>
                                        <p className="text-xs opacity-50 uppercase">Expires</p>
                                        <p className="font-medium">12/28</p>
                                    </div>
                                </div>
                            </div>

                            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handlePayment(); }}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                                    <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none" placeholder="0000 0000 0000 0000" disabled />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiration</label>
                                        <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none" placeholder="MM/YY" disabled />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                                        <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none" placeholder="123" disabled />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-brand-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-primary/30 hover:bg-brand-primary/90 transition-all transform hover:-translate-y-0.5 flex items-center justify-center">
                                    {loading ? <Loader className="animate-spin" /> : `Pay ₹${booking.price?.toLocaleString()}`}
                                </button>

                                <p className="text-center text-xs text-gray-400 mt-4">
                                    This is a mock payment for testing purposes. No real money will be deducted.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
