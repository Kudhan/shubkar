import React from 'react';
import { Edit2, Eye, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';

const ServiceCard = ({ service, onUpdate }) => {
    const handlePublish = async () => {
        try {
            await api.put(`/services/${service._id}/publish`);
            onUpdate(); // Refresh list
        } catch (err) {
            console.error("Failed to publish", err);
            alert("Failed to submit for review");
        }
    };

    const statusColors = {
        draft: 'bg-gray-100 text-gray-600',
        submitted: 'bg-blue-50 text-blue-600',
        published: 'bg-green-50 text-green-600',
        rejected: 'bg-red-50 text-red-600'
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all group">
            <div className="flex justify-between items-start mb-3">
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase ${statusColors[service.lifecycleStatus] || 'bg-gray-100'}`}>
                    {service.lifecycleStatus}
                </span>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500">
                        <Edit2 size={16} />
                    </button>
                </div>
            </div>

            <h3 className="font-bold text-lg text-gray-900 mb-1">{service.title}</h3>
            <p className="text-gray-500 text-sm mb-4 line-clamp-2">{service.description}</p>

            <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-900">₹{service.basePrice?.toLocaleString()} <span className="text-gray-400 font-normal">/ {service.priceUnit}</span></span>
            </div>

            {service.lifecycleStatus === 'draft' && (
                <button
                    onClick={handlePublish}
                    className="mt-4 w-full py-2 bg-brand-secondary/10 text-brand-secondary font-bold rounded-lg hover:bg-brand-secondary hover:text-white transition-all text-sm"
                >
                    Submit for Review
                </button>
            )}

            {service.lifecycleStatus === 'rejected' && (
                <div className="mt-4 bg-red-50 p-2 rounded text-xs text-red-600">
                    <strong>Admin Note:</strong> {service.adminFeedback}
                </div>
            )}
        </div>
    );
};

export default ServiceCard;
