import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { User, Mail, Lock, ArrowRight, Star, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '../components/ui/Spinner';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/register', { ...formData, role: 'customer' });
            
            // Backend now sends OTP instead of auto-login
            toast.success("Account created successfully! Please verify your email.");
            setStep(2);
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Registration failed. Please try again.';
            toast.error(msg);
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.post('/auth/verify-email-otp', { email: formData.email, otp });
            
            toast.success("Email verified successfully! You can now log in.");
            navigate('/login');
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Verification failed. Invalid OTP.';
            toast.error(msg);
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        try {
            await api.post('/auth/resend-otp', { email: formData.email });
            toast.success("A new OTP has been sent to your email.");
            setOtp('');
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to resend OTP.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex font-primary">
            {/* Left Side - Visual Section */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-primary to-orange-500 relative overflow-hidden items-center justify-center text-white p-12">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 max-w-lg">
                    <h1 className="text-5xl font-bold font-secondary mb-6 leading-tight">
                        Start Your <br />
                        <span className="text-brand-accent">Perfect Event</span>
                    </h1>
                    <p className="text-xl text-orange-50 leading-relaxed mb-8">
                        Join thousands of happy couples and planners. Get exclusive access to AI planning tools and top-rated vendors.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
                            <Star className="text-brand-accent mb-2" size={24} />
                            <h3 className="font-bold">AI Planner</h3>
                            <p className="text-sm opacity-80">Smart budgeting & scheduling</p>
                        </div>
                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
                            <User className="text-brand-accent mb-2" size={24} />
                            <h3 className="font-bold">Vendor Network</h3>
                            <p className="text-sm opacity-80">Verified pros for your event</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form Section */}
            <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 relative">
                <div className="absolute top-6 left-6 lg:hidden">
                    <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-secondary font-secondary">SHUBAKAR</Link>
                </div>

                <div className="max-w-md w-full mx-auto">
                    {step === 1 ? (
                        <>
                            <h2 className="text-4xl font-bold text-gray-900 mb-2 font-secondary">Create Account</h2>
                            <p className="text-gray-500 mb-10">Get started with your free customer account.</p>

                            <form className="space-y-5" onSubmit={handleSubmit}>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Full Name <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            <User size={20} />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all bg-gray-50 focus:bg-white"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Email Address <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            <Mail size={20} />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all bg-gray-50 focus:bg-white"
                                            placeholder="name@example.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Password <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            <Lock size={20} />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all bg-gray-50 focus:bg-white"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-lg shadow-brand-primary/20 text-sm font-bold text-white bg-gradient-to-r from-brand-primary to-orange-500 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                                >
                                    {loading ? (
                                        <>
                                            <Spinner size={20} className="mr-2 text-white" />
                                            Creating Account...
                                        </>
                                    ) : (
                                        <>
                                            Create Account <ArrowRight className="ml-2" size={20} />
                                        </>
                                    )}
                                </button>
                            </form>

                            <p className="mt-8 text-center text-sm text-gray-600">
                                Already have an account?{' '}
                                <Link to="/login" className="font-bold text-brand-primary hover:text-orange-600 transition-colors">
                                    Sign In
                                </Link>
                            </p>

                            <div className="mt-8 pt-8 border-t border-gray-100 text-center">
                                <p className="text-sm text-gray-500 mb-3">Are you a business?</p>
                                <Link to="/vendor/register" className="inline-block text-sm font-semibold text-brand-secondary bg-brand-secondary/10 px-4 py-2 rounded-lg hover:bg-brand-secondary/20 transition-colors">
                                    Register as a Vendor
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 className="text-4xl font-bold text-gray-900 mb-2 font-secondary">Verify Email</h2>
                            <p className="text-gray-500 mb-10">We've sent a 6-digit OTP to <span className="font-bold text-brand-primary">{formData.email}</span></p>

                            <form className="space-y-5" onSubmit={handleVerifyOtp}>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Enter OTP <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        maxLength="6"
                                        className="block w-full px-4 py-4 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all bg-gray-50 focus:bg-white text-center text-3xl font-bold tracking-widest uppercase"
                                        placeholder="------"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || otp.length < 6}
                                    className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-lg shadow-brand-primary/20 text-sm font-bold text-white bg-gradient-to-r from-brand-primary to-orange-500 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                                >
                                    {loading ? (
                                        <>
                                            <Spinner size={20} className="mr-2 text-white" />
                                            Verifying...
                                        </>
                                    ) : (
                                        "Verify Email"
                                    )}
                                </button>
                            </form>

                            <p className="mt-8 text-center text-sm text-gray-600">
                                Didn't receive the email?{' '}
                                <button onClick={handleResendOtp} disabled={loading} className="font-bold text-brand-primary hover:text-orange-600 transition-colors disabled:opacity-50">
                                    Resend OTP
                                </button>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Register;
