import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import {
    User, Mail, Lock, Briefcase, MapPin, Globe, Users, Award,
    ChevronRight, CheckCircle, Loader, Instagram, Facebook, Youtube,
    DollarSign, BookOpen, Plus, X
} from 'lucide-react';

const VendorRegister = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        // Auth
        name: '', email: '', password: '', role: 'vendor',

        // Business Basic
        companyName: '', foundedYear: '',

        // Location & Service
        city: '', serviceCities: [], // Array
        serviceType: 'Venue', // Primary
        services: [], // Multi select

        // Detailed
        description: '', website: '', experience: '', teamSize: '',

        // Socials
        socialLinks: { instagram: '', facebook: '', youtube: '' },

        // Policies
        bookingPolicy: { advancePercentage: '', cancellationRules: '' },
        awards: []
    });

    // Temp inputs for arrays
    const [tempCity, setTempCity] = useState('');
    const [tempAward, setTempAward] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    // Array Handlers
    const addArrayItem = (field, value, createFunc) => {
        if (!value.trim()) return;
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], value]
        }));
        createFunc('');
    };

    const removeArrayItem = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    // Service Multi-select
    const toggleService = (svc) => {
        setFormData(prev => {
            const exists = prev.services.includes(svc);
            return {
                ...prev,
                services: exists
                    ? prev.services.filter(s => s !== svc)
                    : [...prev.services, svc]
            };
        });
    };

    const nextStep = (e) => {
        e.preventDefault();
        setStep(step + 1);
        window.scrollTo(0, 0);
    };

    const prevStep = () => {
        setStep(step - 1);
        window.scrollTo(0, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // Include primary service in services array if not present
            const finalServices = [...new Set([...formData.services, formData.serviceType])];

            const payload = {
                ...formData,
                services: finalServices
            };

            const res = await api.post('/auth/register', payload);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.data.user));
            navigate('/vendor/dashboard');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Registration failed.');
            setLoading(false);
        }
    };

    const SERVICE_OPTIONS = ['Venue', 'Catering', 'Decor', 'Photography', 'Music', 'Entertainment', 'Makeup', 'Planner'];

    return (
        <div className="min-h-screen bg-gray-50 font-primary">
            <Navbar />

            <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 font-secondary mb-3">Partner with SHUBAKAR</h1>
                    <p className="text-gray-500 text-lg">Join the elite network of premium event professionals.</p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col lg:flex-row min-h-[600px]">

                    {/* Stepper Sidebar */}
                    <div className="bg-gray-900 text-white p-8 lg:w-1/4 flex flex-col justify-between relative overflow-hidden">
                        {/* Deco Circle */}
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-secondary/10 rounded-full blur-3xl"></div>

                        <div>
                            <h3 className="text-xl font-bold font-secondary mb-8 text-brand-secondary">Setup Profile</h3>
                            <div className="space-y-0 relative">
                                {/* Vertical Line */}
                                <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-gray-800 -z-10"></div>

                                {[
                                    { id: 1, label: 'Identity', icon: User },
                                    { id: 2, label: 'Expertise', icon: Briefcase },
                                    { id: 3, label: 'Presence', icon: Globe },
                                    { id: 4, label: 'Business', icon: DollarSign },
                                ].map((s) => (
                                    <div key={s.id} className="flex items-center py-4 group">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all z-10 
                                            ${step >= s.id ? 'bg-brand-secondary border-brand-secondary text-gray-900 shadow-[0_0_10px_rgba(255,215,0,0.4)]' : 'bg-gray-900 border-gray-600 text-gray-500 group-hover:border-gray-500'}`}>
                                            {step > s.id ? <CheckCircle size={16} /> : s.id}
                                        </div>
                                        <div className="ml-4">
                                            <p className={`text-sm font-semibold transition-colors ${step >= s.id ? 'text-white' : 'text-gray-500'}`}>
                                                {s.label}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8">
                            <div className="bg-gray-800/50 backdrop-blur p-4 rounded-xl border border-gray-700">
                                <h4 className="font-bold text-brand-accent mb-1 text-sm">Pro Tip</h4>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    Complete all sections with high-quality details to get the "Verified" badge 3x faster.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form Area */}
                    <div className="p-8 lg:w-3/4 bg-white flex flex-col">
                        {error && (
                            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-200 flex items-center">
                                <X size={16} className="mr-2" /> {error}
                            </div>
                        )}

                        <form onSubmit={step === 4 ? handleSubmit : nextStep} className="flex-grow flex flex-col">

                            <div className="flex-grow">
                                {/* STEP 1: IDENTITY */}
                                {step === 1 && (
                                    <div className="space-y-6 animate-fade-in max-w-2xl">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Let's start with the basics</h3>
                                        <p className="text-gray-500 text-sm mb-6">Create your login credentials for the dashboard.</p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="col-span-2">
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Owner Name</label>
                                                <input type="text" name="name" required value={formData.name} onChange={handleChange}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none transition-all" placeholder="Your Full Name" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email (Login ID)</label>
                                                <input type="email" name="email" required value={formData.email} onChange={handleChange}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none transition-all" placeholder="business@example.com" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                                                <input type="password" name="password" required value={formData.password} onChange={handleChange}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none transition-all" placeholder="••••••••" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 2: EXPERTISE */}
                                {step === 2 && (
                                    <div className="space-y-6 animate-fade-in max-w-3xl">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Business Expertise</h3>
                                        <p className="text-gray-500 text-sm mb-6">Tell us what you do and where you operate.</p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="col-span-2">
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Company Name</label>
                                                <input type="text" name="companyName" required value={formData.companyName} onChange={handleChange}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none transition-all font-bold text-lg" placeholder="Ex: Royal Events" />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Primary Base City</label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                                                    <input type="text" name="city" required value={formData.city} onChange={handleChange}
                                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none transition-all" placeholder="Mumbai" />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Founded Year</label>
                                                <input type="number" name="foundedYear" value={formData.foundedYear} onChange={handleChange}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none transition-all" placeholder="2015" />
                                            </div>

                                            {/* Services Multi-Select */}
                                            <div className="col-span-2">
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Services Provided (Select all that apply)</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {SERVICE_OPTIONS.map(svc => (
                                                        <button
                                                            key={svc} type="button"
                                                            onClick={() => toggleService(svc)}
                                                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${formData.services.includes(svc)
                                                                    ? 'bg-brand-primary text-white border-brand-primary shadow-lg'
                                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-brand-secondary'
                                                                }`}>
                                                            {svc}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Service Cities */}
                                            <div className="col-span-2">
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Other Cities You Serve</label>
                                                <div className="flex gap-2 mb-2">
                                                    <input type="text" value={tempCity} onChange={(e) => setTempCity(e.target.value)}
                                                        className="flex-grow px-4 py-2 border border-gray-200 rounded-xl focus:border-brand-secondary outline-none" placeholder="Add another city (e.g. Pune)"
                                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('serviceCities', tempCity, setTempCity))} />
                                                    <button type="button" onClick={() => addArrayItem('serviceCities', tempCity, setTempCity)} className="bg-gray-100 p-2 rounded-xl hover:bg-gray-200"><Plus /></button>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {formData.serviceCities.map((city, idx) => (
                                                        <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs flex items-center">
                                                            {city} <button type="button" onClick={() => removeArrayItem('serviceCities', idx)} className="ml-1 hover:text-red-500"><X size={12} /></button>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 3: PRESENCE */}
                                {step === 3 && (
                                    <div className="space-y-6 animate-fade-in max-w-3xl">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Online Presence</h3>
                                        <p className="text-gray-500 text-sm mb-6">Showcase your brand to the world.</p>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Business Description</label>
                                                <textarea name="description" rows="4" required value={formData.description} onChange={handleChange}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none transition-all" placeholder="Tell unique story about your services..." />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Website URL</label>
                                                <div className="relative">
                                                    <Globe className="absolute left-3 top-3 text-gray-400" size={18} />
                                                    <input type="url" name="website" value={formData.website} onChange={handleChange}
                                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none transition-all" placeholder="https://www.yourbrand.com" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Instagram</label>
                                                    <div className="relative">
                                                        <Instagram className="absolute left-3 top-3 text-pink-500" size={18} />
                                                        <input type="text" name="socialLinks.instagram" value={formData.socialLinks.instagram} onChange={handleChange}
                                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-brand-secondary outline-none" placeholder="@username" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Facebook</label>
                                                    <div className="relative">
                                                        <Facebook className="absolute left-3 top-3 text-blue-600" size={18} />
                                                        <input type="text" name="socialLinks.facebook" value={formData.socialLinks.facebook} onChange={handleChange}
                                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-brand-secondary outline-none" placeholder="Profile URL" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">YouTube</label>
                                                    <div className="relative">
                                                        <Youtube className="absolute left-3 top-3 text-red-600" size={18} />
                                                        <input type="text" name="socialLinks.youtube" value={formData.socialLinks.youtube} onChange={handleChange}
                                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-brand-secondary outline-none" placeholder="Channel URL" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 4: BUSINESS */}
                                {step === 4 && (
                                    <div className="space-y-6 animate-fade-in max-w-3xl">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Business Policies</h3>
                                        <p className="text-gray-500 text-sm mb-6">Transparency builds trust with customers.</p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Experience (Years)</label>
                                                <input type="number" name="experience" value={formData.experience} onChange={handleChange}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-brand-secondary outline-none" placeholder="Ex: 5" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Team Size</label>
                                                <input type="number" name="teamSize" value={formData.teamSize} onChange={handleChange}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-brand-secondary outline-none" placeholder="Ex: 15" />
                                            </div>

                                            <div className="col-span-2 md:col-span-1">
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Advance Payment %</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-3 text-gray-400 font-bold">%</span>
                                                    <input type="number" name="bookingPolicy.advancePercentage" value={formData.bookingPolicy.advancePercentage} onChange={handleChange}
                                                        className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:border-brand-secondary outline-none" placeholder="e.g. 50" />
                                                </div>
                                            </div>

                                            <div className="col-span-2">
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cancellation Policy</label>
                                                <textarea name="bookingPolicy.cancellationRules" rows="2" value={formData.bookingPolicy.cancellationRules} onChange={handleChange}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-brand-secondary outline-none" placeholder="e.g. Full refund if cancelled 30 days prior..." />
                                            </div>

                                            {/* Awards */}
                                            <div className="col-span-2">
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Awards & Recognitions</label>
                                                <div className="flex gap-2 mb-2">
                                                    <input type="text" value={tempAward} onChange={(e) => setTempAward(e.target.value)}
                                                        className="flex-grow px-4 py-2 border border-gray-200 rounded-xl focus:border-brand-secondary outline-none" placeholder="e.g. Best Wedding Planner 2024"
                                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('awards', tempAward, setTempAward))} />
                                                    <button type="button" onClick={() => addArrayItem('awards', tempAward, setTempAward)} className="bg-brand-secondary text-gray-900 font-bold px-4 rounded-xl hover:bg-brand-secondary/80">Add</button>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    {formData.awards.map((awr, idx) => (
                                                        <div key={idx} className="bg-yellow-50 text-yellow-800 px-4 py-2 rounded-lg text-sm flex items-center justify-between">
                                                            <span className="flex items-center"><Award size={16} className="mr-2" /> {awr}</span>
                                                            <button type="button" onClick={() => removeArrayItem('awards', idx)} className="hover:text-red-600"><X size={16} /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Navigation */}
                            <div className="pt-8 border-t border-gray-100 mt-8 flex justify-between items-center bg-white sticky bottom-0">
                                {step > 1 ? (
                                    <button type="button" onClick={prevStep} className="px-6 py-2 rounded-lg text-gray-500 font-bold hover:bg-gray-100 transition-colors">
                                        Back
                                    </button>
                                ) : <div></div>}

                                <button type="submit" disabled={loading} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold shadow-xl hover:bg-black transition-all transform hover:-translate-y-1 flex items-center">
                                    {loading ? <Loader className="animate-spin" /> : step === 4 ? 'Complete Registration' : <>Next Step <ChevronRight size={18} className="ml-1" /></>}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorRegister;
