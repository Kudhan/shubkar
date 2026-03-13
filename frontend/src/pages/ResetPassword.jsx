import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../services/api';
import { Lock, LockOpen, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '../components/ui/Spinner';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!token) {
            toast.error('Invalid or missing reset token. Please try again from your email.');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }

        if (password.length < 8) {
            toast.error('Password must be at least 8 characters long.');
            return;
        }

        setLoading(true);
        try {
            await resetPassword(token, password);
            toast.success('Password reset successfully! You can now log in.');
            navigate('/login');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 font-primary px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-secondary to-brand-primary rounded-t-2xl"></div>
                
                <div className="text-center mb-8 mt-2">
                    <h2 className="text-3xl font-bold text-gray-900 font-secondary mb-2">Create New Password</h2>
                    <p className="text-gray-500">Your new password must be different from previous used passwords.</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 block text-left">New Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Lock size={20} />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 focus:border-brand-secondary transition-all bg-gray-50 focus:bg-white"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 block text-left">Confirm Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <LockOpen size={20} />
                            </div>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 focus:border-brand-secondary transition-all bg-gray-50 focus:bg-white"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-lg shadow-brand-secondary/20 text-sm font-bold text-white bg-gradient-to-r from-brand-secondary to-brand-primary hover:from-brand-secondary/90 hover:to-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                    >
                        {loading ? (
                            <>
                                <Spinner size={20} className="mr-2 text-white" />
                                Resetting...
                            </>
                        ) : (
                            'Reset Password'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
