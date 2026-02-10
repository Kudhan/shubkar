import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { CreditCard, Lock, ShieldCheck, Loader, CheckCircle, Smartphone, Globe, Wallet } from 'lucide-react';

const Checkout = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const booking = state?.booking;

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('upi'); // upi, card, netbanking

    // Form States
    const [upiId, setUpiId] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');
    const [cardName, setCardName] = useState('');
    const [selectedBank, setSelectedBank] = useState('');

    useEffect(() => {
        if (!booking) {
            navigate('/dashboard');
        }
    }, [booking, navigate]);

    const handlePayment = async () => {
        setLoading(true);
        setError('');

        // Basic Validation Simulation
        if (paymentMethod === 'upi' && !upiId) {
            setError('Please enter a valid UPI ID');
            setLoading(false);
            return;
        }
        if (paymentMethod === 'card' && (!cardNumber || !cardExpiry || !cardCvv)) {
            setError('Please fill in all card details');
            setLoading(false);
            return;
        }
        if (paymentMethod === 'netbanking' && !selectedBank) {
            setError('Please select your bank');
            setLoading(false);
            return;
        }

        try {
            // Simulate Network Delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            await api.post('/payments/pay', {
                bookingId: booking._id,
                amount: booking.finalPrice || booking.pricingDetails?.grandTotal || 0,
                paymentMethod: paymentMethod
            });
            setSuccess(true);
            setTimeout(() => {
                navigate('/dashboard');
            }, 3000);
        } catch (err) {
            setError('Payment processing failed. Please try again.');
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
                    <p className="text-gray-500 mb-8">Amount of <strong>₹{(booking.finalPrice || booking.pricingDetails?.grandTotal || 0).toLocaleString()}</strong> has been transferred securely.</p>
                    <p className="text-sm text-gray-400">Redirecting to your invoices...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-primary">
            <Navbar />
            <div className="pt-28 pb-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Left: Summary */}
                    <div className="lg:w-1/3 order-2 lg:order-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-28">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-4 border-b border-gray-100">Booking Summary</h3>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                                    {booking.vendor?.companyName?.[0]}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{booking.vendor?.companyName}</h4>
                                    <p className="text-xs text-gray-500">{booking.serviceType}</p>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm text-gray-600 mb-6">
                                <div className="flex justify-between">
                                    <span>Date</span>
                                    <span className="font-medium text-gray-900">{new Date(booking.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Reference ID</span>
                                    <span className="font-medium text-gray-900">#{booking._id.substr(-6).toUpperCase()}</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                                <span className="text-lg font-bold text-gray-900">Total Payable</span>
                                <span className="text-2xl font-bold text-brand-primary">₹{(booking.finalPrice || booking.pricingDetails?.grandTotal || 0).toLocaleString()}</span>
                            </div>

                            <div className="mt-6 flex items-start gap-2 text-xs text-gray-400 bg-gray-50 p-3 rounded-xl">
                                <ShieldCheck size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                                <p>Your payment is secured with 256-bit SSL encryption. We do not store your card details.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Payment Options */}
                    <div className="lg:w-2/3 order-1 lg:order-2">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="p-6 bg-gray-900 text-white">
                                <h1 className="text-2xl font-bold font-secondary">Select Payment Method</h1>
                                <p className="text-gray-400 text-sm mt-1">Choose your preferred safe payment option</p>
                            </div>

                            <div className="flex flex-col md:flex-row min-h-[400px]">
                                {/* Sidebar Tabs */}
                                <div className="w-full md:w-1/3 bg-gray-50 border-r border-gray-100">
                                    <button
                                        onClick={() => setPaymentMethod('upi')}
                                        className={`w-full text-left p-4 flex items-center gap-3 transition-all ${paymentMethod === 'upi' ? 'bg-white border-l-4 border-brand-primary shadow-sm text-brand-primary' : 'text-gray-600 hover:bg-gray-100 border-l-4 border-transparent'}`}
                                    >
                                        <Smartphone size={20} />
                                        <div className="flex-1">
                                            <p className="font-bold text-sm">UPI / QR</p>
                                            <p className="text-[10px] text-gray-400">Google Pay, PhonePe, Paytm</p>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('card')}
                                        className={`w-full text-left p-4 flex items-center gap-3 transition-all ${paymentMethod === 'card' ? 'bg-white border-l-4 border-brand-primary shadow-sm text-brand-primary' : 'text-gray-600 hover:bg-gray-100 border-l-4 border-transparent'}`}
                                    >
                                        <CreditCard size={20} />
                                        <div className="flex-1">
                                            <p className="font-bold text-sm">Credit / Debit Card</p>
                                            <p className="text-[10px] text-gray-400">Visa, Mastercard, RuPay</p>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('netbanking')}
                                        className={`w-full text-left p-4 flex items-center gap-3 transition-all ${paymentMethod === 'netbanking' ? 'bg-white border-l-4 border-brand-primary shadow-sm text-brand-primary' : 'text-gray-600 hover:bg-gray-100 border-l-4 border-transparent'}`}
                                    >
                                        <Globe size={20} />
                                        <div className="flex-1">
                                            <p className="font-bold text-sm">Net Banking</p>
                                            <p className="text-[10px] text-gray-400">All Indian Banks</p>
                                        </div>
                                    </button>
                                </div>

                                {/* Content Area */}
                                <div className="w-full md:w-2/3 p-8 relative">
                                    {error && (
                                        <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center animate-shake">
                                            <Lock size={16} className="mr-2" /> {error}
                                        </div>
                                    )}

                                    {/* UPI View */}
                                    {paymentMethod === 'upi' && (
                                        <div className="space-y-6">
                                            <h3 className="font-bold text-gray-900">Pay via UPI</h3>
                                            <div className="flex gap-4">
                                                <div className="border hover:border-brand-primary cursor-pointer rounded-xl p-3 flex flex-col items-center gap-2 w-24 transition-colors">
                                                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs">GPay</div>
                                                    <span className="text-xs font-medium">Google Pay</span>
                                                </div>
                                                <div className="border hover:border-brand-primary cursor-pointer rounded-xl p-3 flex flex-col items-center gap-2 w-24 transition-colors">
                                                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs">PhPe</div>
                                                    <span className="text-xs font-medium">PhonePe</span>
                                                </div>
                                                <div className="border hover:border-brand-primary cursor-pointer rounded-xl p-3 flex flex-col items-center gap-2 w-24 transition-colors">
                                                    <div className="w-8 h-8 rounded-full bg-cyan-400 text-white flex items-center justify-center font-bold text-xs">Paytm</div>
                                                    <span className="text-xs font-medium">Paytm</span>
                                                </div>
                                            </div>

                                            <div className="relative">
                                                <div className="absolute inset-0 flex items-center">
                                                    <div className="w-full border-t border-gray-200"></div>
                                                </div>
                                                <div className="relative flex justify-center text-sm">
                                                    <span className="px-2 bg-white text-gray-500">OR Enter VPA</span>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                                                <input
                                                    type="text"
                                                    value={upiId}
                                                    onChange={(e) => setUpiId(e.target.value)}
                                                    placeholder="example@okaxis"
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none"
                                                />
                                                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                                    <ShieldCheck size={12} /> Verified Merchant: Shubkar Events
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Card View */}
                                    {paymentMethod === 'card' && (
                                        <div className="space-y-4">
                                            <h3 className="font-bold text-gray-900">Enter Card Details</h3>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Card Number</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={cardNumber}
                                                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').substring(0, 16))}
                                                        placeholder="0000 0000 0000 0000"
                                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none font-mono"
                                                    />
                                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Expiry Date</label>
                                                    <input
                                                        type="text"
                                                        value={cardExpiry}
                                                        onChange={(e) => setCardExpiry(e.target.value)}
                                                        placeholder="MM/YY"
                                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CVV</label>
                                                    <input
                                                        type="password"
                                                        value={cardCvv}
                                                        onChange={(e) => setCardCvv(e.target.value.substring(0, 3))}
                                                        placeholder="123"
                                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Card Holder Name</label>
                                                <input
                                                    type="text"
                                                    value={cardName}
                                                    onChange={(e) => setCardName(e.target.value)}
                                                    placeholder="Name on card"
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* NetBanking View */}
                                    {paymentMethod === 'netbanking' && (
                                        <div className="space-y-6">
                                            <h3 className="font-bold text-gray-900">Select your Bank</h3>
                                            <div className="grid grid-cols-3 gap-3">
                                                {['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'PNB'].map(bank => (
                                                    <button
                                                        key={bank}
                                                        onClick={() => setSelectedBank(bank)}
                                                        className={`p-3 border rounded-xl flex items-center justify-center font-bold text-sm hover:border-brand-primary hover:bg-brand-primary/5 transition-colors ${selectedBank === bank ? 'border-brand-primary bg-brand-primary/10 text-brand-primary' : 'border-gray-200 text-gray-600'}`}
                                                    >
                                                        {bank}
                                                    </button>
                                                ))}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Other Banks</label>
                                                <select
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none bg-white"
                                                    onChange={(e) => setSelectedBank(e.target.value)}
                                                    value={selectedBank && !['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'PNB'].includes(selectedBank) ? selectedBank : ''}
                                                >
                                                    <option value="">Select a bank</option>
                                                    <option value="BOB">Bank of Baroda</option>
                                                    <option value="Yes">Yes Bank</option>
                                                    <option value="IndusInd">IndusInd Bank</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-8">
                                        <button
                                            onClick={handlePayment}
                                            disabled={loading}
                                            className="w-full bg-brand-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-primary/30 hover:bg-brand-primary/90 transition-all transform hover:-translate-y-0.5 flex items-center justify-center"
                                        >
                                            {loading ? <Loader className="animate-spin" /> : `Pay ₹${(booking.finalPrice || booking.pricingDetails?.grandTotal || 0).toLocaleString()}`}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
