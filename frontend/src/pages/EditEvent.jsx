import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { Save, ArrowLeft, Calendar, MapPin, Users, DollarSign, AlertTriangle, Lock } from 'lucide-react';

const EditEvent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [event, setEvent] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        startDate: '',
        endDate: '',
        venue: '',
        city: '',
        address: '',
        guestCount: '',
        budgetTotal: ''
    });

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await api.get(`/events/${id}`);
                const ev = res.data.data.event;
                setEvent(ev);

                // Redirect if readonly
                if (ev.status === 'completed' || ev.status === 'cancelled') {
                    alert(`Event is ${ev.status} and cannot be edited.`);
                    navigate(`/events/${id}`);
                    return;
                }

                setFormData({
                    title: ev.title,
                    startDate: ev.date?.startDate ? new Date(ev.date.startDate).toISOString().split('T')[0] : '',
                    endDate: ev.date?.endDate ? new Date(ev.date.endDate).toISOString().split('T')[0] : '',
                    venue: ev.location?.venue || '',
                    city: ev.location?.city || '',
                    address: ev.location?.address || '',
                    guestCount: ev.guestCount || '',
                    budgetTotal: ev.budget?.total || ''
                });
            } catch (err) {
                console.error("Failed to fetch event", err);
                alert("Failed to load event.");
                navigate('/events');
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const hasBookings = event?.bookings?.length > 0;
    const committedBudget = event?.budget?.committed || 0;

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Frontend Checks
        if (Number(formData.budgetTotal) < committedBudget) {
            alert(`Budget cannot be less than committed expenses (₹${committedBudget})`);
            return;
        }

        if (hasBookings) {
            const confirmed = window.confirm(
                "⚠️ WARNING: You have active bookings for this event.\n\nChanging details like Date or Location will NOT update your vendor contracts automatically. You must inform them manually.\n\nDo you want to proceed?"
            );
            if (!confirmed) return;
        }

        setSaving(true);
        try {
            const payload = {
                title: formData.title,
                date: {
                    startDate: formData.startDate,
                    endDate: formData.endDate
                },
                location: {
                    venue: formData.venue,
                    city: formData.city,
                    address: formData.address
                },
                guestCount: Number(formData.guestCount),
                budget: {
                    total: Number(formData.budgetTotal)
                }
            };

            await api.patch(`/events/${id}`, payload);
            alert("Event updated successfully!");
            navigate(`/events/${id}`);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to update event.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 font-primary">
            <Navbar />

            <div className="pt-28 pb-12 max-w-4xl mx-auto px-4">
                <button onClick={() => navigate(`/events/${id}`)} className="mb-6 flex items-center text-gray-500 hover:text-gray-900 font-medium">
                    <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
                </button>

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 font-secondary">Edit Event</h1>
                        <p className="text-gray-500 mt-1">Update details for <span className="font-semibold text-gray-900">{event.title}</span></p>
                    </div>
                </div>

                {hasBookings && (
                    <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start">
                        <AlertTriangle className="text-amber-600 mr-3 flex-shrink-0" size={24} />
                        <div>
                            <h4 className="font-bold text-amber-800">Active Bookings Detected</h4>
                            <p className="text-sm text-amber-700 mt-1">
                                Changes to Date or Location will not automatically update your vendor bookings.
                                Please communicate changes to your {event.bookings.length} booked vendors directly.
                            </p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8">

                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Basic Info</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Event Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none"
                                    value={formData.title}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Guest Count</label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                    <input
                                        type="number"
                                        name="guestCount"
                                        required
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none"
                                        value={formData.guestCount}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Date & Time */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Date & Time</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Start Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                    <input
                                        type="date"
                                        name="startDate"
                                        required
                                        className={`w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none ${hasBookings ? 'bg-amber-50/30' : ''}`}
                                        value={formData.startDate}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">End Date (Optional)</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Location</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="city"
                                        required
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none"
                                        value={formData.city}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Venue Name</label>
                                <input
                                    type="text"
                                    name="venue"
                                    placeholder="e.g. Grand Hotel"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none"
                                    value={formData.venue}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    placeholder="Full address (optional)"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none"
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Budget */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Budget</h3>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Total Budget</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input
                                    type="number"
                                    name="budgetTotal"
                                    required
                                    min={committedBudget}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none font-medium"
                                    value={formData.budgetTotal}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mt-2 text-xs flex items-center text-gray-500">
                                <Lock size={12} className="mr-1" />
                                Locked Minimum: ₹{committedBudget.toLocaleString()} (Committed Expenses)
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-8 py-3 bg-brand-primary text-white font-bold rounded-xl shadow-lg hover:bg-brand-primary/90 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:translate-y-0 flex items-center"
                        >
                            <Save size={20} className="mr-2" />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default EditEvent;
