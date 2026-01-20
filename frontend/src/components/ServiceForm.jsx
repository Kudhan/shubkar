import React, { useState } from 'react';
import { Loader, X, Upload } from 'lucide-react';
import api from '../services/api';

const ServiceForm = ({ onClose, onServiceAdded }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '', // Required by backend
        category: 'Venue', // Required Enum
        basePrice: '', // Required Number
        priceUnit: 'per day' // Required String
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const categories = ['Venue', 'Catering', 'Decor', 'Photography', 'Music', 'Entertainment', 'Makeup', 'Other'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/services', formData);
            onServiceAdded();
            onClose();
        } catch (err) {
            console.error('Error creating service:', err);
            setError(err.response?.data?.message || 'Failed to create service');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg text-gray-900">Add New Service</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Service Title</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple/50 outline-none transition-all"
                            placeholder="e.g., Luxury Wedding Photography"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple/50 outline-none transition-all"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            required
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple/50 outline-none transition-all resize-none"
                            placeholder="Describe what you offer..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (₹)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple/50 outline-none transition-all"
                                placeholder="5000"
                                value={formData.basePrice}
                                onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price Unit</label>
                            <input
                                type="text"
                                required
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple/50 outline-none transition-all"
                                placeholder="e.g. per day, per hour"
                                value={formData.priceUnit}
                                onChange={(e) => setFormData({ ...formData, priceUnit: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-all flex justify-center items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            {loading ? <Loader className="animate-spin" /> : 'Create Draft Service'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ServiceForm;
