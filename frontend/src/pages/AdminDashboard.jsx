import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import {
    LayoutDashboard, Users, UserCheck, Shield, ChevronRight, CheckCircle, Search, Edit2, Package, Tag, Layers, RefreshCw, X, ShieldCheck, FileText, Download, UserX, AlertCircle, Phone, Globe, Activity, Trash2, Camera, Loader, Eye, Save, XCircle, Filter, MoreHorizontal
} from 'lucide-react';

const AdminDashboard = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchText, setSearchText] = useState('');
    const [fullScreenImage, setFullScreenImage] = useState(null); // Add this for viewing documents

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const [plans, setPlans] = useState([]);
    const [loadingPlans, setLoadingPlans] = useState(false);
    const [activeTab, setActiveTab] = useState('vendors'); // 'vendors' | 'plans'

    // Modal States
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [vendorBookings, setVendorBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(false);

    // Edit Form State
    const [editFormData, setEditFormData] = useState({});
    const [newPortfolioUrl, setNewPortfolioUrl] = useState('');

    // GST State
    const [verifyingGst, setVerifyingGst] = useState(false);
    const [gstDetails, setGstDetails] = useState(null);

    const handleVerifyGst = async (vendorId) => {
        setVerifyingGst(true);
        try {
            const res = await api.post(`/admin/vendors/${vendorId}/verify-gst`);
            setGstDetails(res.data.data);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to verify GST');
        } finally {
            setVerifyingGst(false);
        }
    };

    const handleApproveBackend = async (vendorId) => {
        try {
            await api.post(`/admin/vendors/${vendorId}/approve`);
            setGstDetails(null);
            setShowDetailsModal(false);
            fetchVendors();
        } catch(err) {
            alert('Approve failed');
        }
    };

    const handleRejectBackend = async (vendorId) => {
        try {
            await api.post(`/admin/vendors/${vendorId}/reject`);
            setGstDetails(null);
            setShowDetailsModal(false);
            fetchVendors();
        } catch(err) {
            alert('Reject failed');
        }
    };

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

    const fetchPlans = async () => {
        try {
            setLoadingPlans(true);
            const res = await api.get('/service-plans/admin/all');
            setPlans(res.data.data.plans);
        } catch (err) {
            console.error('Failed to fetch plans:', err);
        } finally {
            setLoadingPlans(false);
        }
    };

    useEffect(() => {
        fetchVendors();
        fetchPlans();
    }, []);

    const handleApproval = async (vendorId, status) => {
        try {
            await api.patch(`/vendors/status/${vendorId}`, { status });
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
            foundedYear: vendor.foundedYear,
            portfolio: vendor.portfolio || []
        });
        setNewPortfolioUrl('');
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
            const res = await api.get(`/bookings?vendorId=${vendor._id}`);
            setVendorBookings(res.data.data.bookings);
        } catch (err) {
            console.error('Error fetching activities:', err);
        } finally {
            setLoadingBookings(false);
        }
    };

    const [statusFilter, setStatusFilter] = useState('ALL');

    const filteredVendors = vendors.filter(v => {
        const matchSearch = v.companyName.toLowerCase().includes(searchText.toLowerCase()) ||
                            v.user?.email.toLowerCase().includes(searchText.toLowerCase());
        const matchStatus = statusFilter === 'ALL' || v.verification_status === statusFilter;
        return matchSearch && matchStatus;
    });

    const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedVendors = filteredVendors.slice(startIndex, startIndex + itemsPerPage);

    // Reset pagination when searching
    useEffect(() => {
        setCurrentPage(1);
    }, [searchText]);

    const filteredPlans = plans.filter(p =>
        p.name.toLowerCase().includes(searchText.toLowerCase()) ||
        p.vendor?.companyName?.toLowerCase().includes(searchText.toLowerCase())
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

                    <div className="flex gap-4 items-center w-full md:w-auto">
                        {/* Tabs */}
                        <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-200">
                            <button
                                onClick={() => setActiveTab('vendors')}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'vendors' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}>
                                Vendors
                            </button>
                            <button
                                onClick={() => setActiveTab('plans')}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'plans' ? 'bg-brand-primary text-white shadow-md' : 'text-gray-500 hover:text-brand-primary'}`}>
                                Service Plans
                            </button>
                        </div>

                        <div className="flex gap-2">
                            {activeTab === 'vendors' && (
                                <select 
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm font-semibold bg-white text-gray-700"
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="APPROVED">Approved</option>
                                    <option value="REJECTED">Rejected</option>
                                </select>
                            )}
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder={`Search ${activeTab === 'vendors' ? 'vendors' : 'plans'}...`}
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 w-full text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Document Fullscreen Overlay */}
                {fullScreenImage && (
                    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4">
                        <button onClick={() => setFullScreenImage(null)} className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors">
                            <X size={24} />
                        </button>
                        <div className="max-w-5xl max-h-[90vh] flex items-center justify-center w-full h-full relative">
                            {fullScreenImage.includes('application/pdf') || fullScreenImage.includes('.pdf') ? (
                                <iframe src={fullScreenImage} title="PDF Viewer" className="w-full h-full bg-white rounded-xl" />
                            ) : (
                                <img src={fullScreenImage} alt="Fullscreen View" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
                            )}
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 text-sm font-medium">Total Vendors</p>
                        <h3 className="text-3xl font-bold text-gray-900">{vendors.filter(v => v.verification_status !== 'REJECTED' && v.user?.vendorStatus !== 'rejected').length}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 text-sm font-medium">Pending Approvals</p>
                        <h3 className="text-3xl font-bold text-amber-600">{vendors.filter(v => !v.isApproved && v.verification_status !== 'REJECTED' && v.user?.vendorStatus !== 'rejected').length}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 text-sm font-medium">Active Plans</p>
                        <h3 className="text-3xl font-bold text-blue-600 font-secondary">
                            {plans.length}
                        </h3>
                    </div>
                </div>

                {/* Main Content */}
                {activeTab === 'vendors' ? (
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
                                    ) : paginatedVendors.length === 0 ? (
                                        <tr><td colSpan="4" className="p-10 text-center text-gray-500">No vendors found.</td></tr>
                                    ) : (
                                        paginatedVendors.map((vendor) => (
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
                                                    {vendor.verification_status === 'REJECTED' || vendor.user?.vendorStatus === 'rejected' ? (
                                                        <span className="flex items-center text-rose-700 text-sm font-bold bg-rose-50 px-3 py-1 rounded-full w-fit">
                                                            <XCircle size={14} className="mr-1" /> Rejected
                                                        </span>
                                                    ) : vendor.isApproved ? (
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
                                                        {(!vendor.isApproved && vendor.verification_status !== 'REJECTED') && (
                                                            <>
                                                                <button onClick={() => { setSelectedVendor(vendor); setShowDetailsModal(true); }} className="px-3 py-1 bg-brand-primary text-white text-xs font-bold rounded-lg hover:bg-brand-primary/90 transition-colors" title="Review & Approve">
                                                                    Review KYC
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
                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex justify-between items-center p-4 border-t border-gray-100 bg-gray-50/50">
                                    <span className="text-sm text-gray-500 font-medium">
                                        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredVendors.length)} of {filteredVendors.length} entries
                                    </span>
                                    <div className="flex gap-1">
                                        <button 
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 rounded-md bg-white border border-gray-200 text-sm font-semibold disabled:opacity-50 text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            Prev
                                        </button>
                                        {[...Array(totalPages)].map((_, i) => {
                                            // Simple pagination window logic
                                            if (
                                                i === 0 || 
                                                i === totalPages - 1 || 
                                                (i >= currentPage - 2 && i <= currentPage)
                                            ) {
                                                return (
                                                    <button 
                                                        key={i + 1} 
                                                        onClick={() => setCurrentPage(i + 1)}
                                                        className={`px-3 py-1 rounded-md text-sm font-semibold border transition-colors ${currentPage === i + 1 ? 'bg-brand-primary text-white border-brand-primary shadow-sm' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                                                    >
                                                        {i + 1}
                                                    </button>
                                                );
                                            } else if (i === 1 || i === totalPages - 2) {
                                                if (!window.paginationDotsRendered) {
                                                    // Naive dots spacing
                                                    return <span key={i} className="px-2 py-1 text-gray-400">...</span>;
                                                }
                                            }
                                            return null;
                                        })}
                                        <button 
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1 rounded-md bg-white border border-gray-200 text-sm font-semibold disabled:opacity-50 text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                                    <tr>
                                        <th className="p-5">Plan Name</th>
                                        <th className="p-5">Vendor</th>
                                        <th className="p-5">Pricing</th>
                                        <th className="p-5">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loadingPlans ? (
                                        <tr><td colSpan="4" className="p-10 text-center text-gray-400"><Loader className="animate-spin inline mr-2" /> Loading plans...</td></tr>
                                    ) : filteredPlans.length === 0 ? (
                                        <tr><td colSpan="4" className="p-10 text-center text-gray-500">No plans found.</td></tr>
                                    ) : (
                                        filteredPlans.map((plan) => (
                                            <tr key={plan._id} className="hover:bg-gray-50/80 transition-colors group">
                                                <td className="p-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                                                            <Package size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900">{plan.name}</p>
                                                            <p className="text-xs text-brand-primary bg-brand-primary/5 px-2 py-0.5 rounded-full w-fit mt-1">
                                                                {plan.pricingModel}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-5">
                                                    <p className="text-sm font-medium">{plan.vendor?.companyName || 'Unknown Vendor'}</p>
                                                    <p className="text-xs text-gray-500">{plan.vendor?.email}</p>
                                                </td>
                                                <td className="p-5 font-medium">
                                                    ₹{plan.price}
                                                    {plan.pricingModel === 'PER_UNIT' && <span className="text-xs text-gray-500"> / {plan.unitType}</span>}
                                                </td>
                                                <td className="p-5">
                                                    <p className="text-xs text-gray-600 max-w-xs truncate">{plan.description}</p>
                                                    {plan.addOns?.length > 0 && <p className="text-xs text-gray-400 mt-1">+{plan.addOns.length} add-ons</p>}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
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

                        {/* KYC Section */}
                        <div className="mt-8 border-t border-gray-100 pt-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <Shield className="mr-2 text-brand-primary" size={20} /> Vendor KYC & Verification
                            </h3>
                            
                            <div className="grid grid-cols-1 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">GST Number</p>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-gray-900">{selectedVendor.gst_number || 'N/A'}</p>
                                            {selectedVendor.gst_number && (
                                                <button 
                                                    onClick={() => handleVerifyGst(selectedVendor._id)} 
                                                    disabled={verifyingGst}
                                                    className="px-3 py-1 bg-brand-secondary text-gray-900 text-xs font-bold rounded-lg hover:bg-brand-secondary/80 disabled:opacity-50"
                                                >
                                                    {verifyingGst ? 'Verifying...' : 'Verify GST'}
                                                </button>
                                            )}
                                        </div>
                                        
                                        <p className="mt-4 text-xs font-bold text-gray-500 uppercase mb-1">PAN Number</p>
                                        <p className="font-bold text-gray-900">{selectedVendor.pan_number || 'N/A'}</p>

                                        <p className="mt-4 text-xs font-bold text-gray-500 uppercase mb-1">Official Phone Number</p>
                                        <p className="font-bold text-gray-900">{selectedVendor.phone_number || 'N/A'}</p>

                                        <p className="mt-4 text-xs font-bold text-gray-500 uppercase mb-1">Date of Birth</p>
                                        <p className="font-bold text-gray-900">
                                            {selectedVendor.date_of_birth 
                                                ? new Date(selectedVendor.date_of_birth).toLocaleDateString('en-GB') 
                                                : 'N/A'}
                                        </p>

                                        <p className="mt-4 text-xs font-bold text-gray-500 uppercase mb-1">Status</p>
                                        <p className={`font-bold ${selectedVendor.is_verified ? 'text-emerald-600' : 'text-amber-600'}`}>
                                            {selectedVendor.verification_status || 'PENDING'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-2">Business Documents</p>
                                        {selectedVendor.business_documents && selectedVendor.business_documents.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {selectedVendor.business_documents.map((doc, idx) => (
                                                    <button 
                                                        key={idx} 
                                                        onClick={() => setFullScreenImage(doc)} 
                                                        className="block w-[120px] aspect-square border border-gray-200 rounded-lg overflow-hidden hover:opacity-80 transition-opacity bg-white hover:ring-2 hover:ring-brand-primary cursor-pointer relative group"
                                                    >
                                                        {(doc.includes('.pdf') || doc.includes('data:application/pdf')) ? (
                                                            <div className="w-full h-full flex flex-col items-center justify-center text-xs font-bold text-gray-500">
                                                                <FileText className="mb-2 text-gray-400" size={24} />
                                                                PDF {idx + 1}
                                                                <span className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold text-gray-800 backdrop-blur-sm">View</span>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <img src={doc} alt={`Doc ${idx + 1}`} className="w-full h-full object-cover" />
                                                                <span className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold text-white backdrop-blur-sm">View</span>
                                                            </>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : selectedVendor.pan_card_image ? (
                                            <button 
                                                onClick={() => setFullScreenImage(selectedVendor.pan_card_image)}
                                                className="block max-w-[200px] border border-gray-200 rounded-lg overflow-hidden hover:opacity-80 transition-opacity cursor-pointer relative group"
                                            >
                                                <img src={selectedVendor.pan_card_image} alt="PAN Card Legacy" className="w-full h-auto object-cover" />
                                                <span className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold text-white backdrop-blur-sm">View</span>
                                            </button>
                                        ) : (
                                            <p className="text-sm border border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500">No documents uploaded</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* GST Verification Results Modal/Section */}
                            {gstDetails && (
                                <div className="mt-4 p-4 border border-brand-secondary bg-brand-secondary/5 rounded-xl">
                                    <h4 className="text-sm font-bold text-gray-900 mb-2">GST Verification Result</h4>
                                    <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto text-gray-700 font-mono">
                                        {JSON.stringify(gstDetails, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {/* KYC Actions */}
                            <div className="mt-6 flex gap-3 justify-end">
                                <button 
                                    onClick={() => handleRejectBackend(selectedVendor._id)} 
                                    className="px-6 py-2 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-xl font-bold transition-colors flex items-center"
                                >
                                    <XCircle size={18} className="mr-2" /> Reject Vendor
                                </button>
                                <button 
                                    onClick={() => handleApproveBackend(selectedVendor._id)} 
                                    className="px-6 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl font-bold transition-colors flex items-center shadow-lg shadow-emerald-600/20"
                                >
                                    <CheckCircle size={18} className="mr-2" /> Approve Vendor
                                </button>
                            </div>
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

                        {/* Portfolio Images Management */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio Images (Direct URLs)</label>

                            <div className="flex gap-2 mb-3">
                                <input
                                    type="url"
                                    placeholder="https://example.com/image.jpg"
                                    value={newPortfolioUrl}
                                    onChange={(e) => setNewPortfolioUrl(e.target.value)}
                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-primary/50 outline-none"
                                />
                                <button
                                    onClick={() => {
                                        if (!newPortfolioUrl) return;
                                        setEditFormData(prev => ({
                                            ...prev,
                                            portfolio: [...(prev.portfolio || []), newPortfolioUrl]
                                        }));
                                        setNewPortfolioUrl('');
                                    }}
                                    className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-black transition-colors"
                                >
                                    Add
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                {editFormData.portfolio?.map((url, idx) => (
                                    <div key={idx} className="relative group aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                        <img src={url} alt={`Portfolio ${idx}`} className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => {
                                                setEditFormData(prev => ({
                                                    ...prev,
                                                    portfolio: prev.portfolio.filter((_, i) => i !== idx)
                                                }));
                                            }}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                                {editFormData.portfolio?.length === 0 && (
                                    <div className="col-span-3 text-center py-4 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-gray-400 text-xs">
                                        No images added yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <button onClick={() => setShowEditModal(false)} className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium">Cancel</button>
                        <button onClick={handleEditSave} className="px-6 py-2 bg-brand-primary text-white rounded-xl font-medium hover:bg-brand-primary/90 flex items-center">
                            <Save size={18} className="mr-2" /> Save Changes
                        </button>
                    </div>
                </div>
            )}

            {/* ACTIVITY MODAL */}
            {
                showActivityModal && selectedVendor && (
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
                                                        {(booking.finalPrice || booking.pricingDetails?.grandTotal || booking.negotiation?.currentOffer?.price || 0) ? `₹${(booking.finalPrice || booking.pricingDetails?.grandTotal || booking.negotiation?.currentOffer?.price || 0)}` : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

        </div >
    );
};

export default AdminDashboard;
