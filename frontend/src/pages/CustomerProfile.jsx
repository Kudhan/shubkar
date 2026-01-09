import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { User, Lock, Save, AlertCircle, CheckCircle } from 'lucide-react';

const CustomerProfile = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [name, setName] = useState(user?.name || '');

    // Password states
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await api.patch('/auth/update-profile', { name });
            const updatedUser = res.data.data.user;

            // Update local storage and state
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            // Dispatch a storage event so other components (like Navbar) can update if they listen to it, 
            // or we might need a context, but for now this persists usage.
            // Since Navbar doesn't listen to storage events by default, a reload might be needed to see name change in Navbar
            // OR we rely on user navigating which triggers re-mount/check.

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Error updating profile' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await api.patch('/auth/update-password', {
                currentPassword,
                newPassword
            });

            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
            }

            setMessage({ type: 'success', text: 'Password updated successfully!' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Error updating password' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 font-primary">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-28">
                <h1 className="text-3xl font-bold text-gray-900 font-secondary mb-8">Account Settings</h1>

                {message.text && (
                    <div className={`p-4 rounded-xl mb-6 flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {message.type === 'success' ? <CheckCircle size={20} className="mr-2" /> : <AlertCircle size={20} className="mr-2" />}
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Profile Details */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center mb-6">
                            <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary mr-3">
                                <User size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Profile Details</h2>
                        </div>

                        <form onSubmit={handleUpdateProfile}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all"
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    value={user?.email}
                                    disabled
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                                />
                                <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2.5 bg-brand-primary text-white font-bold rounded-xl shadow-lg hover:bg-brand-primary/90 transition-all flex items-center justify-center disabled:opacity-70"
                            >
                                <Save size={18} className="mr-2" /> Save Changes
                            </button>
                        </form>
                    </div>

                    {/* Security */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-10 md:mb-0">
                        <div className="flex items-center mb-6">
                            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mr-3">
                                <Lock size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Security</h2>
                        </div>

                        <form onSubmit={handleUpdatePassword}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2.5 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition-all flex items-center justify-center disabled:opacity-70"
                            >
                                <Save size={18} className="mr-2" /> Update Password
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerProfile;
