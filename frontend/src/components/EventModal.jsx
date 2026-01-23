import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Users, DollarSign, Type } from 'lucide-react';
import api from '../services/api';

const EventModal = ({ event, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        title: '',
        eventType: 'Wedding',
        date: '',
        guestCount: '',
        budget: '',
        city: '',
        venue: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (event) {
            setFormData({
                title: event.title,
                eventType: event.eventType,
                date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
                guestCount: event.guestCount || '',
                budget: event.budget?.total || '',
                city: event.location?.city || '',
                venue: event.location?.venue || ''
            });
        }
    }, [event?._id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                guestCount: Number(formData.guestCount),
                budget: { total: Number(formData.budget), currency: 'INR' },
                location: { city: formData.city, venue: formData.venue }
            };

            if (event) {
                await api.patch(`/events/${event._id}`, payload);
            } else {
                await api.post('/events', payload);
            }
            onUpdate();
            onClose();
        } catch (err) {
            console.error('Error saving event', err);
            alert('Failed to save event');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in-up">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold font-secondary text-gray-900">
                        {event ? 'Edit Event' : 'Create New Event'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                        <div className="relative">
                            <Type className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input
                                type="text"
                                required
                                placeholder="e.g. Rahul's Wedding"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/50 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                                value={formData.eventType}
                                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/50 outline-none bg-white"
                            >
                                <option>Wedding</option>
                                <option>Birthday</option>
                                <option>Corporate</option>
                                <option>Anniversary</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/50 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
                            <div className="relative">
                                <Users className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input
                                    type="number"
                                    placeholder="Count"
                                    value={formData.guestCount}
                                    onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/50 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Budget (₹)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input
                                    type="number"
                                    placeholder="Total Budget"
                                    value={formData.budget}
                                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/50 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="City"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/50 outline-none"
                            />
                            <input
                                type="text"
                                placeholder="Venue (Optional)"
                                value={formData.venue}
                                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/50 outline-none"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-secondary transition-colors mt-4 shadow-lg"
                    >
                        {loading ? 'Saving...' : (event ? 'Update Event' : 'Create Event')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EventModal;
