import React, { useState, useEffect } from 'react';
import { X, Calendar, MessageSquare, Briefcase, Loader2, CheckCircle2, ChevronDown, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const BookingModal = ({ isOpen, onClose, vendor, preSelectedEventId }) => {
    const [step, setStep] = useState(1); // 1: Form, 2: Success
    const [submitting, setSubmitting] = useState(false);
    const [userEvents, setUserEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(true);

    // Form State
    const [formData, setFormData] = useState({
        eventId: '',
        date: '',
        serviceType: '',
        notes: ''
    });

    // 1. Fetch User's Events on Load
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await api.get('/events');
                const events = res.data.data.events;
                setUserEvents(events);

                // Auto-select logic
                if (preSelectedEventId) {
                    const event = events.find(e => e._id === preSelectedEventId);
                    if (event) {
                        const safeDate = event.date && event.date.startDate
                            ? new Date(event.date.startDate).toISOString().split('T')[0]
                            : '';
                        setFormData(prev => ({
                            ...prev,
                            eventId: event._id,
                            date: safeDate
                        }));
                    }
                } else if (events.length > 0) {
                    const firstEvent = events[0];
                    const safeDate = firstEvent.date && firstEvent.date.startDate
                        ? new Date(firstEvent.date.startDate).toISOString().split('T')[0]
                        : '';

                    setFormData(prev => ({
                        ...prev,
                        eventId: firstEvent._id,
                        date: safeDate
                    }));
                }
            } catch (err) {
                console.error('Failed to fetch events', err);
            } finally {
                setLoadingEvents(false);
            }
        };

        if (isOpen) {
            fetchEvents();
        }
    }, [isOpen, preSelectedEventId]);

    // 2. Pre-fill vendor service info
    useEffect(() => {
        if (vendor) {
            setFormData(prev => ({
                ...prev,
                serviceType: vendor.services?.[0] || 'General'
            }));
        }
    }, [vendor?._id]);

    // Handle Event Selection Change
    const handleEventChange = (e) => {
        const selectedId = e.target.value;
        const selectedEvent = userEvents.find(ev => ev._id === selectedId);

        const safeDate = selectedEvent && selectedEvent.date && selectedEvent.date.startDate
            ? new Date(selectedEvent.date.startDate).toISOString().split('T')[0]
            : prev.date;

        setFormData(prev => ({
            ...prev,
            eventId: selectedId,
            date: safeDate
        }));
    };

    if (!isOpen || !vendor) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.eventId) {
            alert("Please select an event to link this booking to.");
            return;
        }

        setSubmitting(true);
        try {
            // Price logic
            let priceValue = 15000;
            if (vendor.priceRange) {
                if (typeof vendor.priceRange === 'object') {
                    priceValue = vendor.priceRange.min || 15000;
                } else {
                    priceValue = parseInt(String(vendor.priceRange).replace(/[^0-9]/g, ''), 10) || 15000;
                }
            }

            await api.post('/bookings', {
                eventId: formData.eventId,
                vendorId: vendor.vendorProfileId || vendor._id,
                serviceType: formData.serviceType,
                date: formData.date,
                price: Number(priceValue),
                notes: formData.notes
            });
            setStep(2);
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Failed to send booking request.';
            alert(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden scale-100 transition-all">
                {step === 1 ? (
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 font-secondary">Book Vendor</h2>
                                <p className="text-gray-500 text-sm">Request a quote from <span className="font-semibold text-gray-900">{vendor.companyName}</span></p>
                            </div>
                            <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        {loadingEvents ? (
                            <div className="py-10 text-center text-gray-400">Loading your events...</div>
                        ) : userEvents.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="p-4 bg-orange-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-orange-500">
                                    <Calendar size={24} />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">No Events Found</h3>
                                <p className="text-sm text-gray-500 mb-6">You need to create an event (e.g., Wedding, Birthday) before booking vendors.</p>
                                <Link onClick={() => onClose()} to="/events" className="inline-flex items-center px-6 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90">
                                    <Plus size={18} className="mr-2" /> Create First Event
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">

                                {/* Event Selector */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Select Event</label>
                                    <div className="relative">
                                        <select
                                            required
                                            disabled={!!preSelectedEventId} // Disable if fixed
                                            className={`w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary appearance-none font-semibold text-gray-800 ${preSelectedEventId ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50'}`}
                                            value={formData.eventId}
                                            onChange={handleEventChange}
                                        >
                                            <option value="" disabled>Choose an event...</option>
                                            {userEvents.map(ev => (
                                                <option key={ev._id} value={ev._id}>{ev.title}</option>
                                            ))}
                                        </select>
                                        {!preSelectedEventId && (
                                            <ChevronDown className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" size={18} />
                                        )}
                                    </div>
                                    {!preSelectedEventId && (
                                        <p className="text-xs text-brand-primary mt-1.5 text-right font-medium cursor-pointer hover:underline">
                                            <Link to="/events" onClick={onClose}>+ Create New Event</Link>
                                        </p>
                                    )}
                                </div>

                                {/* Date Field */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3.5 top-3 text-gray-400" size={18} />
                                        <input
                                            type="date"
                                            required
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none font-medium text-gray-700"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Service Type */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Service Type</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3.5 top-3 text-gray-400" size={18} />
                                        <select
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none font-medium text-gray-700 bg-white"
                                            value={formData.serviceType}
                                            onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                                        >
                                            {vendor.services?.map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Notes (Optional)</label>
                                    <div className="relative">
                                        <textarea
                                            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none font-medium text-gray-700 h-24 resize-none"
                                            placeholder="Describe your requirements..."
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full py-3.5 bg-brand-primary text-white font-bold rounded-xl shadow-lg hover:bg-brand-primary/90 transition-all flex justify-center items-center"
                                    >
                                        {submitting ? <Loader2 className="animate-spin mr-2" /> : null}
                                        {submitting ? 'Sending Request...' : 'Send Booking Request'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                ) : (
                    <div className="p-8 text-center py-16">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-slow">
                            <CheckCircle2 size={40} className="text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Sent!</h2>
                        <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                            Your booking request has been sent to <strong>{vendor.companyName}</strong>. You can track status in your Event Dashboard.
                        </p>
                        <button
                            onClick={onClose}
                            className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors"
                        >
                            Back to Search
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingModal;
