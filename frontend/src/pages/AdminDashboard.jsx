import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import {
    CheckCircle, XCircle, Loader, Shield, Search, Filter, MoreHorizontal,
    Trash2, Eye, FileText, Activity, X, Save
} from 'lucide-react';

const AdminDashboard = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');

    // Modal States
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [vendorBookings, setVendorBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(false);

    // Edit Form State
    const [editFormData, setEditFormData] = useState({});

    const fetchVendors = async () => {
        try {
            setLoading(true);
            const res = await api.get('/vendors/all');
            setVendors(res.data.data.vendors);
        } catch (err) {
            console.error('Failed to fetch vendors:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendors();
    }, []);

    const handleApproval = async (vendorId, status) => {
        try {
            await api.patch(`/vendors/approve/${vendorId}`, { status });
            fetchVendors();
        } catch (err) {
            console.error('Error updating status', err);
        }
    };

    const handleDelete = async (vendorId) => {
        if (!window.confirm('Are you sure you want to permanently delete this vendor? This action updates the user role to customer and removes the vendor profile.')) return;
        try {
            await api.delete(`/vendors/${vendorId}`);
            setVendors(vendors.filter(v => v._id !== vendorId));
        } catch (err) {
            console.error('Error deleting vendor:', err);
            alert('Failed to delete vendor');
        }
    };

    const handleEditClick = (vendor) => {
        setSelectedVendor(vendor);
        setEditFormData({
            companyName: vendor.companyName,
            description: vendor.description,
            website: vendor.website,
            experience: vendor.experience,
            teamSize: vendor.teamSize,
            serviceCities: vendor.serviceCities?.join(', ') || '',
            foundedYear: vendor.foundedYear
        });
        setShowEditModal(true);
    };

    const handleEditSave = async () => {
        try {
            const payload = {
                ...editFormData,
                serviceCities: editFormData.serviceCities.split(',').map(c => c.trim())
            };
            await api.patch(`/vendors/${selectedVendor._id}`, payload);
            setShowEditModal(false);
            fetchVendors();
        } catch (err) {
            console.error('Error updating vendor:', err);
            alert('Failed to update vendor');
        }
    };

    const handleActivityClick = async (vendor) => {
        setSelectedVendor(vendor);
        setShowActivityModal(true);
        setLoadingBookings(true);
        try {
            // Using the bookings endpoint with admin filter
            // Assuming we updated bookingController to accept vendorId query for admin
            // Wait, implementation plan said `getBookings` would handle `req.query.vendorId` for admin.
            const res = await api.get(`/bookings?vendorId=${vendor._id}`);
            setVendorBookings(res.data.data.bookings);
        } catch (err) {
            console.error('Error fetching activities:', err);
        } finally {
            setLoadingBookings(false);
        }
    };

    const filteredVendors = vendors.filter(v =>
        v.companyName.toLowerCase().includes(searchText.toLowerCase()) ||
        v.user?.email.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 font-primary">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 pt-28 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 font-secondary flex items-center">
                            <Shield className="mr-3 text-brand-primary" size={32} />
                            Super Admin Console
                        </h1>
                        <p className="text-gray-500 mt-1">Complete control over vendor ecosystem.</p>
                    </div>
                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search vendors..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 w-full md:w-64"
                        />
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 text-sm font-medium">Total Vendors</p>
                        <h3 className="text-3xl font-bold text-gray-900">{vendors.length}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 text-sm font-medium">Pending Approvals</p>
                        <h3 className="text-3xl font-bold text-amber-600">{vendors.filter(v => !v.isApproved).length}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 text-sm font-medium">Active High Performers</p>
                        <h3 className="text-3xl font-bold text-emerald-600 font-secondary">
                            {vendors.filter(v => v.rating?.average > 4.5).length}
                        </h3>
                    </div>
                </div>

                {/* Vendor Table */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="p-5">Company Info</th>
                                    <th className="p-5">Service</th>
                                    <th className="p-5">Status</th>
                                    <th className="p-5 text-right">Controls</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan="4" className="p-10 text-center text-gray-400"><Loader className="animate-spin inline mr-2" /> Loading data...</td></tr>
                                ) : filteredVendors.length === 0 ? (
                                    <tr><td colSpan="4" className="p-10 text-center text-gray-500">No vendors found.</td></tr>
                                ) : (
                                    filteredVendors.map((vendor) => (
                                        <tr key={vendor._id} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="p-5">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold mr-3 shrink-0">
                                                        {vendor.companyName?.charAt(0) || "V"}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{vendor.companyName}</p>
                                                        <p className="text-xs text-gray-500">{vendor.user?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex flex-wrap gap-1">
                                                    {vendor.services.slice(0, 2).map((s, i) => (
                                                        <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-semibold border border-gray-200">
                                                            {s}
                                                        </span>
                                                    ))}
                                                    {vendor.services.length > 2 && <span className="text-xs text-gray-400">+{vendor.services.length - 2}</span>}
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                {vendor.isApproved ? (
                                                    <span className="flex items-center text-emerald-700 text-sm font-bold bg-emerald-50 px-3 py-1 rounded-full w-fit">
                                                        <CheckCircle size={14} className="mr-1" /> Approved
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center text-amber-700 text-sm font-bold bg-amber-50 px-3 py-1 rounded-full w-fit">
                                                        <Loader size={14} className="mr-1 animate-spin" /> Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-5 text-right">
                                                <div className="flex justify-end items-center space-x-2">
                                                    {/* Approval Actions */}
                                                    {!vendor.isApproved && (
                                                        <>
                                                            <button onClick={() => handleApproval(vendor._id, 'approved')} className="p-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg transition-colors" title="Approve">
                                                                <CheckCircle size={16} />
                                                            </button>
                                                            <button onClick={() => handleApproval(vendor._id, 'rejected')} className="p-2 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-lg transition-colors" title="Reject">
                                                                <XCircle size={16} />
                                                            </button>
                                                            <div className="h-4 w-px bg-gray-300 mx-2"></div>
                                                        </>
                                                    )}

                                                    {/* View Details */}
                                                    <button onClick={() => { setSelectedVendor(vendor); setShowDetailsModal(true); }} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="View Details">
                                                        <Eye size={18} />
                                                    </button>

                                                    {/* Activities */}
                                                    <button onClick={() => handleActivityClick(vendor)} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors" title="View Activity">
                                                        <Activity size={18} />
                                                    </button>

                                                    {/* Edit */}
                                                    <button onClick={() => handleEditClick(vendor)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                                        <FileText size={18} />
                                                    </button>

                                                    {/* Delete */}
                                                    <button onClick={() => handleDelete(vendor._id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* DETAILS MODAL */}
            {showDetailsModal && selectedVendor && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative animate-fade-in-up">
                        <button onClick={() => setShowDetailsModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900">
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-bold font-secondary mb-6 text-gray-900">{selectedVendor.companyName}</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Basic Info</h3>
                                <p className="mb-2"><span className="font-semibold">Email:</span> {selectedVendor.user?.email}</p>
                                <p className="mb-2"><span className="font-semibold">Website:</span> <a href={selectedVendor.website} target="_blank" rel="noreferrer" className="text-brand-primary underline">{selectedVendor.website || 'N/A'}</a></p>
                                <p className="mb-2"><span className="font-semibold">Founded:</span> {selectedVendor.foundedYear || 'N/A'}</p>
                                <p className="mb-2"><span className="font-semibold">Team Size:</span> {selectedVendor.teamSize || 'N/A'}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Service</h3>
                                <p className="mb-2"><span className="font-semibold">Categories:</span> {selectedVendor.services.join(', ')}</p>
                                <p className="mb-2"><span className="font-semibold">Cities:</span> {selectedVendor.serviceCities?.join(', ') || 'All'}</p>
                                <p className="mb-2"><span className="font-semibold">Experience:</span> {selectedVendor.experience} Years</p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Description</h3>
                            <p className="text-gray-700 bg-gray-50 p-4 rounded-xl text-sm leading-relaxed">{selectedVendor.description || 'No description provided.'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {showEditModal && selectedVendor && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
                        <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900">
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-bold font-secondary mb-6 text-gray-900">Edit Vendor</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                <input
                                    type="text"
                                    value={editFormData.companyName}
                                    onChange={e => setEditFormData({ ...editFormData, companyName: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-primary/50 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                                <input
                                    type="text"
                                    value={editFormData.website}
                                    onChange={e => setEditFormData({ ...editFormData, website: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-primary/50 outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
                                    <input
                                        type="number"
                                        value={editFormData.experience}
                                        onChange={e => setEditFormData({ ...editFormData, experience: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Founded Year</label>
                                    <input
                                        type="number"
                                        value={editFormData.foundedYear}
                                        onChange={e => setEditFormData({ ...editFormData, foundedYear: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Service Cities (comma separated)</label>
                                <input
                                    type="text"
                                    value={editFormData.serviceCities}
                                    onChange={e => setEditFormData({ ...editFormData, serviceCities: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    rows="4"
                                    value={editFormData.description}
                                    onChange={e => setEditFormData({ ...editFormData, description: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none"
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3">
                            <button onClick={() => setShowEditModal(false)} className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium">Cancel</button>
                            <button onClick={handleEditSave} className="px-6 py-2 bg-brand-primary text-white rounded-xl font-medium hover:bg-brand-primary/90 flex items-center">
                                <Save size={18} className="mr-2" /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ACTIVITY MODAL */}
            {showActivityModal && selectedVendor && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative">
                        <button onClick={() => setShowActivityModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900">
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-bold font-secondary mb-2 text-gray-900">Vendor Activity Log</h2>
                        <p className="text-gray-500 mb-6">Booking history for {selectedVendor.companyName}</p>

                        {loadingBookings ? (
                            <div className="py-20 text-center"><Loader className="animate-spin inline mr-2 text-brand-primary" /> Loading activities...</div>
                        ) : vendorBookings.length === 0 ? (
                            <div className="py-20 text-center bg-gray-50 rounded-xl text-gray-500">No bookings found for this vendor.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                        <tr>
                                            <th className="p-4">Date</th>
                                            <th className="p-4">Customer</th>
                                            <th className="p-4">Service</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {vendorBookings.map(booking => (
                                            <tr key={booking._id}>
                                                <td className="p-4 text-gray-900">{new Date(booking.date).toLocaleDateString()}</td>
                                                <td className="p-4 font-medium">{booking.customer?.name || 'Unknown'}</td>
                                                <td className="p-4 text-gray-500">{booking.serviceType}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                                                        ${booking.status === 'confirmed' || booking.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                            booking.status === 'cancelled' || booking.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right font-bold text-gray-900">
                                                    {booking.price ? `₹${booking.price}` : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminDashboard;
