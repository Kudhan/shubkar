import React, { useState, useEffect } from 'react';
import { X, Calendar, MessageSquare, Briefcase, Loader2, CheckCircle2, ChevronDown, Plus, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ServicePlanCard from './ServicePlanCard';

const BookingModal = ({ isOpen, onClose, vendor, preSelectedEventId }) => {
    const [step, setStep] = useState(1); // 1: Plan Selection (if available), 2: Booking Form, 3: Success
    const [submitting, setSubmitting] = useState(false);
    const [userEvents, setUserEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(true);

    // Plans State
    const [vendorPlans, setVendorPlans] = useState([]);
    const [loadingPlans, setLoadingPlans] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        eventId: '',
        date: '',
        serviceType: 'General',
        notes: '',
        quantity: 1,
        addOns: [] // Array of { name, quantity }
    });

    const [estimatedPrice, setEstimatedPrice] = useState(0);

    // 1. Fetch User's Events on Load
    useEffect(() => {
        if (isOpen) {
            setStep(1); // Reset
            fetchEvents();
            if (vendor) fetchVendorPlans();
        }
    }, [isOpen, vendor?._id]);

    const fetchEvents = async () => {
        try {
            setLoadingEvents(true);
            const res = await api.get('/events');
            const events = res.data.data.events;
            setUserEvents(events);

            // Auto-select logic
            if (preSelectedEventId) {
                const event = events.find(e => e._id === preSelectedEventId);
                if (event) selectEvent(event);
            } else if (events.length > 0) {
                selectEvent(events[0]);
            }
        } catch (err) {
            console.error('Failed to fetch events', err);
        } finally {
            setLoadingEvents(false);
        }
    };

    const fetchVendorPlans = async () => {
        if (!vendor?._id && !vendor?.vendorProfileId) return;
        try {
            setLoadingPlans(true);
            const id = vendor.vendorProfileId || vendor._id;
            const res = await api.get(`/service-plans?vendorId=${id}`);
            setVendorPlans(res.data.data.plans);
        } catch (err) {
            console.error('Failed to fetch plans', err);
        } finally {
            setLoadingPlans(false);
        }
    };

    // Auto-skip to form if no plans
    useEffect(() => {
        if (!loadingPlans && vendorPlans.length === 0 && step === 1) {
            setStep(2);
        }
    }, [loadingPlans, vendorPlans, step]);

    const selectEvent = (event) => {
        const safeDate = event.date && event.date.startDate
            ? new Date(event.date.startDate).toISOString().split('T')[0]
            : '';
        setFormData(prev => ({
            ...prev,
            eventId: event._id,
            date: safeDate
        }));
    };

    // Calculate Price when dependencies change
    useEffect(() => {
        if (selectedPlan) {
            let base = 0;
            if (selectedPlan.pricingModel === 'FIXED') {
                base = selectedPlan.price * formData.quantity;
            } else {
                base = selectedPlan.price * formData.quantity;
            }

            let addonsCost = 0;
            formData.addOns.forEach(addon => {
                const planAddon = selectedPlan.addOns.find(a => a.name === addon.name);
                if (planAddon) {
                    addonsCost += planAddon.price * (addon.quantity || 1);
                }
            });

            setEstimatedPrice(base + addonsCost);
        } else {
            // Fallback Legacy Price
            let priceValue = 15000;
            if (vendor?.priceRange) {
                if (typeof vendor.priceRange === 'object') {
                    priceValue = vendor.priceRange.min || 15000;
                } else {
                    priceValue = parseInt(String(vendor.priceRange).replace(/[^0-9]/g, ''), 10) || 15000;
                }
            }
            setEstimatedPrice(priceValue);
        }
    }, [selectedPlan, formData.quantity, formData.addOns, vendor]);


    const handleSelectPlan = (plan) => {
        setSelectedPlan(plan);
        setFormData(prev => ({
            ...prev,
            serviceType: plan.name,
            quantity: plan.minQuantity || 1,
            addOns: []
        }));
        setStep(2);
    };

    const handleSkipPlans = () => {
        setSelectedPlan(null);
        setFormData(prev => ({
            ...prev,
            serviceType: vendor.services?.[0] || 'General'
        }));
        setStep(2);
    };

    const toggleAddOn = (addonName) => {
        setFormData(prev => {
            const exists = prev.addOns.find(a => a.name === addonName);
            if (exists) {
                return { ...prev, addOns: prev.addOns.filter(a => a.name !== addonName) };
            } else {
                return { ...prev, addOns: [...prev.addOns, { name: addonName, quantity: 1 }] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.eventId) {
            alert("Please select an event to link this booking to.");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                eventId: formData.eventId,
                vendorId: vendor.vendorProfileId || vendor._id,
                serviceType: formData.serviceType,
                date: formData.date,
                price: estimatedPrice,
                notes: formData.notes
            };

            if (selectedPlan) {
                payload.servicePlanId = selectedPlan._id;
                payload.quantity = formData.quantity;
                payload.addOns = formData.addOns;
            }

            await api.post('/bookings', payload);
            setStep(3);
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Failed to send booking request.';
            alert(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen || !vendor) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            <div className={`relative bg-white rounded-3xl w-full ${step === 1 && vendorPlans.length > 0 ? 'max-w-4xl' : 'max-w-md'} shadow-2xl overflow-hidden scale-100 transition-all max-h-[90vh] overflow-y-auto`}>

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 font-secondary">
                            {step === 1 && vendorPlans.length > 0 ? 'Select a Package' : 'Complete Booking'}
                        </h2>
                        <p className="text-gray-500 text-sm">Booking <span className="font-semibold text-gray-900">{vendor.companyName}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Step 1: Plan Selection */}
                {step === 1 && vendorPlans.length > 0 && (
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {vendorPlans.map(plan => (
                                <ServicePlanCard
                                    key={plan._id}
                                    plan={plan}
                                    onBook={handleSelectPlan}
                                />
                            ))}
                        </div>
                        <div className="mt-8 text-center">
                            <button onClick={handleSkipPlans} className="text-gray-500 hover:text-gray-900 text-sm font-medium underline">
                                I want a custom quote (Skip Packages)
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Form */}
                {step === 2 && (
                    <div className="p-6">
                        {step === 2 && vendorPlans.length > 0 && (
                            <button onClick={() => setStep(1)} className="text-xs text-brand-primary font-bold mb-4 hover:underline">
                                ← Back to Packages
                            </button>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Selected Plan Summary */}
                            {selectedPlan && (
                                <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-xl p-4 flex items-start gap-3">
                                    <Package className="text-brand-primary mt-1" size={20} />
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">{selectedPlan.name}</h4>
                                        <p className="text-xs text-gray-600">{selectedPlan.description}</p>
                                        <div className="mt-1 font-bold text-brand-primary">₹{selectedPlan.price} {selectedPlan.pricingModel === 'PER_UNIT' && `/ ${selectedPlan.unitType}`}</div>
                                    </div>
                                </div>
                            )}

                            {/* Event & Date */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Event</label>
                                    <select
                                        required
                                        disabled={!!preSelectedEventId}
                                        className="w-full px-3 py-2 border rounded-xl text-sm font-medium outline-none focus:border-gray-900"
                                        value={formData.eventId}
                                        onChange={e => {
                                            const ev = userEvents.find(ev => ev._id === e.target.value);
                                            selectEvent(ev);
                                        }}
                                    >
                                        <option value="" disabled>Select...</option>
                                        {userEvents.map(ev => (
                                            <option key={ev._id} value={ev._id}>{ev.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-3 py-2 border rounded-xl text-sm font-medium outline-none focus:border-gray-900"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Quantity (If Per Unit) */}
                            {selectedPlan && selectedPlan.pricingModel === 'PER_UNIT' && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                                        Quantity ({selectedPlan.unitType}s)
                                    </label>
                                    <input
                                        type="number"
                                        min={selectedPlan.minQuantity || 1}
                                        max={selectedPlan.maxQuantity}
                                        className="w-full px-4 py-2 border rounded-xl font-bold outline-none focus:border-gray-900"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: Math.max(1, Number(e.target.value)) })}
                                    />
                                </div>
                            )}

                            {/* Add-ons */}
                            {selectedPlan && selectedPlan.addOns && selectedPlan.addOns.length > 0 && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Add-ons</label>
                                    <div className="space-y-2">
                                        {selectedPlan.addOns.map((addon, idx) => {
                                            const isSelected = formData.addOns.some(a => a.name === addon.name);
                                            return (
                                                <div key={idx}
                                                    onClick={() => toggleAddOn(addon.name)}
                                                    className={`p-3 rounded-xl border flex justify-between items-center cursor-pointer transition-all ${isSelected ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'bg-brand-primary border-brand-primary' : 'border-gray-300'}`}>
                                                            {isSelected && <CheckCircle2 size={12} className="text-white" />}
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-700">{addon.name}</span>
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-900">+₹{addon.price}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Notes</label>
                                <textarea
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-gray-900 h-20 text-sm"
                                    placeholder="Any special requests?"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>

                            {/* Price Summary */}
                            <div className="bg-gray-50 p-4 rounded-xl flex justify-between items-center">
                                <span className="text-gray-500 font-medium">Estimated Total</span>
                                <span className="text-2xl font-bold text-gray-900">₹{estimatedPrice.toLocaleString()}</span>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3.5 bg-brand-primary text-white font-bold rounded-xl shadow-lg hover:bg-brand-primary/90 transition-all flex justify-center items-center"
                            >
                                {submitting ? <Loader2 className="animate-spin mr-2" /> : null}
                                {submitting ? 'Sending Request...' : 'Confirm Request'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Step 3: Success */}
                {step === 3 && (
                    <div className="p-8 text-center py-16">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-slow">
                            <CheckCircle2 size={40} className="text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Sent!</h2>
                        <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                            Your booking request has been sent to <strong>{vendor.companyName}</strong>.
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
