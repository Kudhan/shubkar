import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '../components/ui/Spinner';
import ForgotPasswordModal from '../components/ForgotPasswordModal';

const Login = () => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/login', formData);
            const user = res.data.data.user;

            // Use context login
            login(user, res.data.token);
            toast.success(`Welcome back, ${user.name}!`);

            if (user.role === 'admin' || user.role === 'superadmin') {
                navigate('/admin');
            } else if (user.role === 'vendor') {
                navigate('/vendor/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
            toast.error(msg);
            setError(msg); // Keep setting error for fallback or accessibility if needed, or remove if fully relying on toast
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex font-primary">
            {/* Left Side - Visual Brand Section */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-secondary to-blue-600 relative overflow-hidden items-center justify-center text-white p-12">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-brand-primary/20 rounded-full blur-3xl"></div>

                <div className="relative z-10 max-w-lg">
                    <h1 className="text-5xl font-bold font-secondary mb-6 leading-tight">
                        Welcome Back to <br />
                        <span className="text-brand-accent">SHUBAKAR</span>
                    </h1>
                    <p className="text-xl text-blue-50 leading-relaxed mb-8">
                        Continue planning your dream celebration or managing your growing business. Your vision awaits.
                    </p>
                    <div className="flex items-center space-x-4 text-sm font-medium bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-sm">
                        <span className="flex items-center">✨ Trusted by 10k+ Planners</span>
                    </div>
                </div>
            </div>

            {/* Right Side - Form Section */}
            <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 relative">
                <div className="absolute top-6 left-6 lg:hidden">
                    <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-secondary font-secondary">SHUBAKAR</Link>
                </div>

                <div className="max-w-md w-full mx-auto">
                    <h2 className="text-4xl font-bold text-gray-900 mb-2 font-secondary">Sign In</h2>
                    <p className="text-gray-500 mb-10">Access your personalized dashboard.</p>

                    {/* Error alert removed in favor of toast, but keeping consistent layout */}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 block">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Mail size={20} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 focus:border-brand-secondary transition-all bg-gray-50 focus:bg-white"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-gray-700">Password</label>
                                <button
                                    type="button"
                                    onClick={() => setShowForgotModal(true)}
                                    className="text-sm font-medium text-brand-secondary hover:text-brand-primary"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 focus:border-brand-secondary transition-all bg-gray-50 focus:bg-white"
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
                            className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-lg shadow-brand-secondary/20 text-sm font-bold text-white bg-gradient-to-r from-brand-secondary to-brand-primary hover:from-brand-secondary/90 hover:to-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Spinner size={20} className="mr-2 text-white" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In <ArrowRight className="ml-2" size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-bold text-brand-secondary hover:text-brand-primary transition-colors">
                            Create Account
                        </Link>
                    </p>
                </div>

                <ForgotPasswordModal 
                    isOpen={showForgotModal} 
                    onClose={() => setShowForgotModal(false)} 
                />
            </div>
        </div>
    );
};

export default Login;
