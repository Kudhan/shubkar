import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { User, Mail, Lock, Briefcase, MapPin, Globe, Users, Award, ChevronRight, CheckCircle, Loader } from 'lucide-react';

const VendorRegister = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'vendor',
        companyName: '', description: '', serviceType: 'Venue', phone: '',
        city: '', website: '', experience: '', teamSize: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const nextStep = (e) => {
        e.preventDefault();
        setStep(step + 1);
    };

    const prevStep = () => {
        setStep(step - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/register', formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.data.user));
            navigate('/vendor/dashboard');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Registration failed.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-primary">
            <Navbar />

            <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 font-secondary mb-3">Partner with SHUBAKAR</h1>
                    <p className="text-gray-500 text-lg">Grow your business and reach thousands of customers.</p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">

                    {/* Stepper Sidebar */}
                    <div className="bg-gray-900 text-white p-8 md:w-1/3 flex flex-col justify-between">
                        <div>
                            <h3 className="text-xl font-bold font-secondary mb-8 text-brand-secondary">Registration</h3>
                            <div className="space-y-6 relative">
                                {/* Vertical Line */}
                                <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-700 -z-10"></div>

                                {[1, 2, 3].map((s) => (
                                    <div key={s} className="flex items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors ${step >= s ? 'bg-brand-secondary border-brand-secondary text-gray-900' : 'bg-gray-800 border-gray-600 text-gray-400'}`}>
                                            {s}
                                        </div>
                                        <div className="ml-4">
                                            <p className={`text-sm font-semibold ${step >= s ? 'text-white' : 'text-gray-400'}`}>
                                                {s === 1 ? 'Credentials' : s === 2 ? 'Business Details' : 'Portfolio'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 bg-gray-800 p-4 rounded-xl">
                            <h4 className="font-bold text-brand-accent mb-1">Why Join?</h4>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                "SHUBAKAR helped us increase bookings by 200% in just 3 months!" <br /> - <span className="italic">Royal Caterers</span>
                            </p>
                        </div>
                    </div>

                    {/* Form Area */}
                    <div className="p-8 md:w-2/3">
                        {error && (
                            <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                                {error}
                            </div>
                        )}

                        <form onSubmit={step === 3 ? handleSubmit : nextStep}>

                            {/* STEP 1: ACCOUNT */}
                            {step === 1 && (
                                <div className="space-y-6 animate-fade-in">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Account Credentials</h3>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                                        <input type="text" name="name" required value={formData.name} onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none transition-all" placeholder="Your Full Name" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                        <input type="email" name="email" required value={formData.email} onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none transition-all" placeholder="business@example.com" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Create Password</label>
                                        <input type="password" name="password" required value={formData.password} onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none transition-all" placeholder="••••••••" />
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button type="submit" className="bg-brand-secondary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-brand-secondary/30 hover:bg-brand-secondary/90 transition-all flex items-center">
                                            Next Step <ChevronRight size={20} className="ml-2" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: BUSINESS */}
                            {step === 2 && (
                                <div className="space-y-6 animate-fade-in">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Business Information</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                            <input type="text" name="companyName" required value={formData.companyName} onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none transition-all" placeholder="Ex: Royal Events" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Service Category</label>
                                            <select name="serviceType" value={formData.serviceType} onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none transition-all bg-white">
                                                <option value="Venue">Venue</option>
                                                <option value="Catering">Catering</option>
                                                <option value="Photography">Photography</option>
                                                <option value="Decoration">Decoration</option>
                                                <option value="Music">Music/DJ</option>
                                                <option value="Planner">Event Planner</option>
                                                <option value="Makeup">Makeup Artist</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">City / Location</label>
                                            <input type="text" name="city" value={formData.city} onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none transition-all" placeholder="Ex: Mumbai" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                            <textarea name="description" rows="3" required value={formData.description} onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none transition-all" placeholder="Tell us about your services..." />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-between">
                                        <button type="button" onClick={prevStep} className="text-gray-500 font-semibold px-4 hover:text-gray-700">Back</button>
                                        <button type="submit" className="bg-brand-secondary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-brand-secondary/30 hover:bg-brand-secondary/90 transition-all flex items-center">
                                            Next Step <ChevronRight size={20} className="ml-2" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: DETAILS */}
                            {step === 3 && (
                                <div className="space-y-6 animate-fade-in">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Extra Details</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                                            <input type="number" name="experience" value={formData.experience} onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none transition-all" placeholder="Ex: 5" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Team Size</label>
                                            <input type="number" name="teamSize" value={formData.teamSize} onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none transition-all" placeholder="Ex: 10" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Website / Portfolio URL</label>
                                            <input type="url" name="website" value={formData.website} onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none transition-all" placeholder="https://..." />
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-700 border border-blue-100 flex items-start">
                                        <CheckCircle className="mr-2 mt-0.5 flex-shrink-0" size={16} />
                                        Your profile will be reviewed by our admin team. You can access the dashboard immediately after registration.
                                    </div>

                                    <div className="pt-4 flex justify-between">
                                        <button type="button" onClick={prevStep} className="text-gray-500 font-semibold px-4 hover:text-gray-700">Back</button>
                                        <button type="submit" disabled={loading} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-gray-800 transition-all flex items-center justify-center min-w-[160px]">
                                            {loading ? <Loader className="animate-spin" /> : 'Complete Registration'}
                                        </button>
                                    </div>
                                </div>
                            )}

                        </form>
                    </div>
                </div>

                <p className="text-center text-gray-500 mt-8">
                    Already have a partner account? <Link to="/login" className="text-brand-secondary font-bold hover:underline">Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default VendorRegister;
