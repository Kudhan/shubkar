import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Save, AlertCircle, CheckCircle, Upload } from 'lucide-react';

const VendorProfileSettings = () => {
    const [formData, setFormData] = useState({
        companyName: '',
        description: '',
        website: '',
        serviceCities: [],
        foundedYear: '',
        teamSize: '',
        bookingPolicy: '',
        services: [],
        minPrice: '',
        maxPrice: '',
        portfolio: []
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [newPortfolioUrl, setNewPortfolioUrl] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/vendors/profile');
                const profile = res.data.data.profile;
                if (profile) {
                    setFormData({
                        companyName: profile.companyName || '',
                        description: profile.description || '',
                        website: profile.website || '',
                        serviceCities: profile.serviceCities || [],
                        foundedYear: profile.foundedYear || '',
                        teamSize: profile.teamSize || '',
                        bookingPolicy: profile.bookingPolicy || '',
                        services: profile.services || [],
                        minPrice: profile.priceRange?.min || '',
                        maxPrice: profile.priceRange?.max || '',
                        portfolio: profile.portfolio || []
                    });
                    setNewPortfolioUrl('');
                }
            } catch (err) {
                console.error('Error fetching profile', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleArrayChange = (e, field) => {
        const val = e.target.value;
        setFormData(prev => ({ ...prev, [field]: val.split(',').map(s => s.trim()) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const payload = {
                ...formData,
                priceRange: {
                    min: Number(formData.minPrice),
                    max: Number(formData.maxPrice)
                }
            };

            await api.patch('/vendors/profile', payload);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/30">
                <h2 className="text-xl font-bold text-gray-900">Edit Vendor Profile</h2>
                <p className="text-sm text-gray-500">Update your business details visible to customers.</p>
            </div>

            <div className="p-8">
                {message.text && (
                    <div className={`p-4 rounded-xl mb-6 flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {message.type === 'success' ? <CheckCircle size={20} className="mr-2" /> : <AlertCircle size={20} className="mr-2" />}
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                            <input
                                type="text"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                            <input
                                type="url"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none"
                                placeholder="https://"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none"
                            placeholder="Tell customers about your services..."
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Services (comma separated)</label>
                            <input
                                type="text"
                                value={formData.services.join(', ')}
                                onChange={(e) => handleArrayChange(e, 'services')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Service Cities (comma separated)</label>
                            <input
                                type="text"
                                value={formData.serviceCities.join(', ')}
                                onChange={(e) => handleArrayChange(e, 'serviceCities')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price Range (Min)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500">₹</span>
                                <input
                                    type="number"
                                    name="minPrice"
                                    value={formData.minPrice}
                                    onChange={handleChange}
                                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price Range (Max)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500">₹</span>
                                <input
                                    type="number"
                                    name="maxPrice"
                                    value={formData.maxPrice}
                                    onChange={handleChange}
                                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio Images (Direct URLs)</label>
                        <p className="text-xs text-gray-500 mb-3">Paste direct image URLs (e.g. from Unsplash, Imgur) to showcase your work.</p>

                        <div className="flex gap-2 mb-4">
                            <input
                                type="url"
                                placeholder="https://example.com/modern-wedding-stage.jpg"
                                value={newPortfolioUrl}
                                onChange={(e) => setNewPortfolioUrl(e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    if (!newPortfolioUrl) return;
                                    setFormData(prev => ({
                                        ...prev,
                                        portfolio: [...(prev.portfolio || []), newPortfolioUrl]
                                    }));
                                    setNewPortfolioUrl('');
                                }}
                                className="bg-gray-900 text-white px-4 py-2 rounded-xl font-bold hover:bg-black transition-all"
                            >
                                Add
                            </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {formData.portfolio?.map((url, idx) => (
                                <div key={idx} className="relative group aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                                    <img src={url} alt={`Portfolio ${idx}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormData(prev => ({
                                                ...prev,
                                                portfolio: prev.portfolio.filter((_, i) => i !== idx)
                                            }));
                                        }}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                    >
                                        <Upload size={14} className="rotate-45" /> {/* Using Upload icon rotated as X/Remove for now if X not imported, wait X is not imported but AlertCircle is. Let's use text X or import X if possible. Actually let's just use existing imported icons or simple text. Wait, "Upload" is imported. I will just use text "X" if icon not available, or re-check imports.
                                        Imports: `Save, AlertCircle, CheckCircle, Upload`. 
                                        I can simply use a text 'X' or SVG directly to be safe without changing imports. Or better, just use a simple `<span>`. */}
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                </div>
                            ))}
                            {formData.portfolio?.length === 0 && (
                                <div className="col-span-2 md:col-span-4 py-8 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
                                    <Upload className="mx-auto mb-2 opacity-50" size={24} />
                                    No images added yet.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-black transition-all flex items-center justify-center disabled:opacity-70"
                        >
                            <Save size={18} className="mr-2" /> {saving ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>


                </form>

                <div className="my-10 border-t border-gray-100"></div>
            </div>
        </div>
    );
};

export default VendorProfileSettings;
