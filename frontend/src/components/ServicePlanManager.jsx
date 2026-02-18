import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, CheckCircle, X, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from './ui/Spinner';
import api from '../services/api';

const ServicePlanManager = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingPlan, setEditingPlan] = useState(null); // null = list mode, 'new' = create mode, object = edit mode

    // Form State
    const [formData, setFormData] = useState(initialFormState());

    function initialFormState() {
        return {
            name: '',
            description: '',
            pricingModel: 'FIXED',
            price: '',
            unitType: '',
            minQuantity: 1,
            maxQuantity: '',
            includedItems: '', // Textarea, split by newline
            addOns: [] // Array of { name, price, unit }
        };
    }

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const res = await api.get('/service-plans/my-plans'); // Ensure this route matches backend
            setPlans(res.data.data.plans);
        } catch (error) {
            console.error("Failed to fetch plans", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleEdit = (plan) => {
        setFormData({
            ...plan,
            includedItems: plan.includedItems ? plan.includedItems.join('\n') : '',
            price: plan.price || '',
            minQuantity: plan.minQuantity || 1,
            maxQuantity: plan.maxQuantity || '',
            addOns: plan.addOns || []
        });
        setEditingPlan(plan);
    };

    const handleCreate = () => {
        setFormData(initialFormState());
        setEditingPlan('new');
    };

    const handleCancel = () => {
        setEditingPlan(null);
        setFormData(initialFormState());
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                price: Number(formData.price),
                minQuantity: Number(formData.minQuantity),
                maxQuantity: formData.maxQuantity ? Number(formData.maxQuantity) : null,
                includedItems: formData.includedItems.split('\n').filter(i => i.trim() !== '')
            };

            if (editingPlan === 'new') {
                await api.post('/service-plans', payload);
            } else {
                await api.patch(`/service-plans/${editingPlan._id}`, payload);
            }

            await fetchPlans(); // Refresh list
            toast.success("Plan saved successfully!");
            handleCancel();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save plan');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this plan?")) return;
        try {
            await api.delete(`/service-plans/${id}`);
            setPlans(plans.filter(p => p._id !== id));
            toast.success("Plan deleted successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete plan");
        }
    };

    // Add-on helpers
    const addAddOn = () => {
        setFormData(prev => ({
            ...prev,
            addOns: [...prev.addOns, { name: '', price: '', unit: 'item' }]
        }));
    };

    const updateAddOn = (idx, field, val) => {
        const newAddOns = [...formData.addOns];
        newAddOns[idx] = { ...newAddOns[idx], [field]: val };
        setFormData(prev => ({ ...prev, addOns: newAddOns }));
    };

    const removeAddOn = (idx) => {
        setFormData(prev => ({
            ...prev,
            addOns: prev.addOns.filter((_, i) => i !== idx)
        }));
    };

    if (loading && !editingPlan) return <div className="text-center py-8 text-gray-500">Loading plans...</div>;

    if (editingPlan) {
        return (
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-gray-900">
                        {editingPlan === 'new' ? 'Create New Plan' : 'Edit Plan'}
                    </h3>
                    <button onClick={handleCancel} className="text-gray-500 hover:text-gray-900">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Plan Name</label>
                            <input
                                required
                                type="text"
                                className="w-full px-4 py-2 border rounded-xl outline-none focus:border-gray-900"
                                placeholder="e.g. Gold Package"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pricing Model</label>
                            <select
                                className="w-full px-4 py-2 border rounded-xl outline-none focus:border-gray-900 bg-white"
                                value={formData.pricingModel}
                                onChange={e => setFormData({ ...formData, pricingModel: e.target.value })}
                            >
                                <option value="FIXED">Fixed Price</option>
                                <option value="PER_UNIT">Per Unit</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price (₹)</label>
                            <input
                                required
                                type="number"
                                className="w-full px-4 py-2 border rounded-xl outline-none focus:border-gray-900"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                        {formData.pricingModel === 'PER_UNIT' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unit Type</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Hour, Plate"
                                        className="w-full px-4 py-2 border rounded-xl outline-none focus:border-gray-900"
                                        value={formData.unitType}
                                        onChange={e => setFormData({ ...formData, unitType: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Min Qty</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 border rounded-xl outline-none focus:border-gray-900"
                                        value={formData.minQuantity}
                                        onChange={e => setFormData({ ...formData, minQuantity: e.target.value })}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                        <textarea
                            required
                            rows="2"
                            className="w-full px-4 py-2 border rounded-xl outline-none focus:border-gray-900"
                            placeholder="Brief summary of this plan..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Included Items (One per line)</label>
                        <textarea
                            rows="4"
                            className="w-full px-4 py-2 border rounded-xl outline-none focus:border-gray-900"
                            placeholder="- Full coverage&#10;- 200 Edited Photos&#10;- Printed Album"
                            value={formData.includedItems}
                            onChange={e => setFormData({ ...formData, includedItems: e.target.value })}
                        />
                    </div>

                    {/* Add-ons */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase">Optional Add-ons</label>
                            <button type="button" onClick={addAddOn} className="text-xs font-bold text-brand-primary h-6 px-2 bg-brand-primary/10 rounded hover:bg-brand-primary/20">
                                + Add
                            </button>
                        </div>
                        {formData.addOns.map((addon, idx) => (
                            <div key={idx} className="flex gap-2 mb-2 items-center">
                                <input
                                    type="text" placeholder="Name"
                                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                                    value={addon.name}
                                    onChange={e => updateAddOn(idx, 'name', e.target.value)}
                                />
                                <input
                                    type="number" placeholder="Price"
                                    className="w-24 px-3 py-2 border rounded-lg text-sm"
                                    value={addon.price}
                                    onChange={e => updateAddOn(idx, 'price', e.target.value)}
                                />
                                <button type="button" onClick={() => removeAddOn(idx)} className="text-red-500 p-2 hover:bg-red-50 rounded">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t">
                        <button type="button" onClick={handleCancel} className="px-6 py-2 rounded-xl border border-gray-300 font-bold hover:bg-gray-50">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded-xl bg-gray-900 text-white font-bold hover:bg-black">Save Plan</button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div>
            {plans.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <Package className="mx-auto text-gray-300 mb-3" size={40} />
                    <h3 className="text-gray-900 font-bold mb-1">No Service Plans</h3>
                    <p className="text-gray-500 text-sm mb-6">Create packages to help customers book you faster.</p>
                    <button onClick={handleCreate} className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold text-sm">
                        Create First Plan
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-900">Your Plans ({plans.length})</h3>
                        <button onClick={handleCreate} className="flex items-center text-sm font-bold text-brand-primary">
                            <Plus size={16} className="mr-1" /> Add New
                        </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {plans.map(plan => (
                            <div key={plan._id} className="border border-gray-200 rounded-xl p-5 flex justify-between items-start hover:border-gray-300 transition-colors bg-white">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-gray-900">{plan.name}</h4>
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                                            {plan.pricingModel === 'FIXED' ? 'Fixed' : 'Per Unit'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-2">{plan.description}</p>
                                    <p className="font-bold text-gray-900">₹{plan.price.toLocaleString()} <span className="text-gray-400 font-normal text-sm">{plan.pricingModel === 'PER_UNIT' && `/ ${plan.unitType}`}</span></p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(plan)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(plan._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServicePlanManager;
