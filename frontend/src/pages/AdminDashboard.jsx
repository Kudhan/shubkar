import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { CheckCircle, XCircle, Loader, Shield, Search, Filter, MoreHorizontal } from 'lucide-react';

const AdminDashboard = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="min-h-screen bg-gray-50 font-primary">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 pt-28 pb-12">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 font-secondary flex items-center">
                            <Shield className="mr-3 text-brand-primary" size={32} />
                            Admin Console
                        </h1>
                        <p className="text-gray-500 mt-1">Manage vendor approvals and platform security.</p>
                    </div>
                    <div className="flex space-x-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input type="text" placeholder="Search vendors..." className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 w-64" />
                        </div>
                    </div>
                </div>

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
                        <p className="text-gray-500 text-sm font-medium">Platform Health</p>
                        <h3 className="text-3xl font-bold text-emerald-600">100%</h3>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h2 className="text-lg font-bold text-gray-900">Vendor Approvals</h2>
                        <button className="flex items-center text-gray-500 hover:text-gray-900 text-sm font-medium">
                            <Filter size={16} className="mr-2" /> Filter List
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="p-5">Company Info</th>
                                    <th className="p-5">Service Category</th>
                                    <th className="p-5">Status</th>
                                    <th className="p-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan="4" className="p-10 text-center text-gray-400"><Loader className="animate-spin inline mr-2" /> Loading data...</td></tr>
                                ) : vendors.length === 0 ? (
                                    <tr><td colSpan="4" className="p-10 text-center text-gray-500">No vendors found.</td></tr>
                                ) : (
                                    vendors.map((vendor) => (
                                        <tr key={vendor._id} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="p-5">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold mr-3">
                                                        {vendor.companyName?.charAt(0) || "V"}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{vendor.companyName}</p>
                                                        <p className="text-xs text-gray-500">{vendor.user?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-semibold border border-gray-200">
                                                    {vendor.services.join(', ')}
                                                </span>
                                            </td>
                                            <td className="p-5">
                                                {vendor.isApproved ? (
                                                    <span className="flex items-center text-emerald-700 text-sm font-bold bg-emerald-50 px-3 py-1 rounded-full w-fit">
                                                        <CheckCircle size={14} className="mr-1" /> Approved
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center text-amber-700 text-sm font-bold bg-amber-50 px-3 py-1 rounded-full w-fit animate-pulse">
                                                        <Loader size={14} className="mr-1" /> Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-5 text-right">
                                                {!vendor.isApproved && (
                                                    <div className="flex justify-end space-x-2 opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleApproval(vendor._id, 'approved')}
                                                            className="p-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg transition-colors" title="Approve">
                                                            <CheckCircle size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleApproval(vendor._id, 'rejected')}
                                                            className="p-2 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-lg transition-colors" title="Reject">
                                                            <XCircle size={18} />
                                                        </button>
                                                    </div>
                                                )}
                                                {vendor.isApproved && (
                                                    <button className="text-gray-400 hover:text-gray-600">
                                                        <MoreHorizontal size={20} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
