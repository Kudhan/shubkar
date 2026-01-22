import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Calendar, MapPin, Users, DollarSign, Type, ArrowRight, Check } from 'lucide-react';

const CreateEvent = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        eventType: 'Wedding',
        date: {
            startDate: '',
            endDate: ''
        },
        location: {
            city: '',
            venue: ''
        },
        guestCount: '',
        budget: {
            total: ''
        }
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNestedChange = (parent, field, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [field]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                guestCount: Number(formData.guestCount),
                budget: {
                    total: Number(formData.budget.total),
                    currency: 'INR'
                }
            };

            const res = await api.post('/events', payload);
            if (res.data.status === 'success') {
                navigate(`/events/${res.data.data.event._id}`);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to create event: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-primary">
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 py-10 mt-20">

                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 font-secondary">Create Your Event</h1>
                    <p className="text-gray-500 mt-2">Let's start planning something beautiful.</p>
                </div>

                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="h-2 bg-gray-100 w-full">
                        <div
                            className="h-full bg-brand-primary transition-all duration-500 ease-out"
                            style={{ width: `${(step / 3) * 100}%` }}
                        ></div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 md:p-10">

                        {/* STEP 1: Basics */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center mr-3 text-sm">1</div>
                                    Event Details
                                </h3>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Event Name</label>
                                    <div className="relative">
                                        <Type className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            required
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                                            placeholder="e.g. Rahul & Priya's Wedding"
                                            value={formData.title}
                                            onChange={(e) => handleChange('title', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Event Type</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {['Wedding', 'Birthday', 'Corporate', 'Anniversary', 'Other'].map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => handleChange('eventType', type)}
                                                className={`py-3 px-4 rounded-xl text-sm font-medium border transition-all ${formData.eventType === type
                                                        ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/25'
                                                        : 'bg-white text-gray-600 border-gray-200 hover:border-brand-primary/50'
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        className="flex items-center px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-transform active:scale-95"
                                    >
                                        Next Step <ArrowRight size={18} className="ml-2" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Date & Location */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center mr-3 text-sm">2</div>
                                    When & Where
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                                            <input
                                                type="date"
                                                required
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                                                value={formData.date.startDate}
                                                onChange={(e) => handleNestedChange('date', 'startDate', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                                                placeholder="e.g. Mumbai"
                                                value={formData.location.city}
                                                onChange={(e) => handleNestedChange('location', 'city', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="text-gray-500 font-semibold hover:text-gray-900"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStep(3)}
                                        className="flex items-center px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-transform active:scale-95"
                                    >
                                        Next Step <ArrowRight size={18} className="ml-2" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Scale & Budget */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center mr-3 text-sm">3</div>
                                    Scale & Budget
                                </h3>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Estimated Guests</label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-3 text-gray-400" size={18} />
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                                            placeholder="e.g. 500"
                                            value={formData.guestCount}
                                            onChange={(e) => handleChange('guestCount', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Total Budget (INR)</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-3 text-gray-400 font-bold">₹</div>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                                            placeholder="e.g. 1500000"
                                            value={formData.budget.total}
                                            onChange={(e) => handleNestedChange('budget', 'total', e.target.value)}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">This helps us track your spending. You can change it later.</p>
                                </div>

                                <div className="flex justify-between pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        className="text-gray-500 font-semibold hover:text-gray-900"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center px-8 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/30"
                                    >
                                        {loading ? 'Creating...' : 'Create Event'} <Check size={18} className="ml-2" />
                                    </button>
                                </div>
                            </div>
                        )}

                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateEvent;
