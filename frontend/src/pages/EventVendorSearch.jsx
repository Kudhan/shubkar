import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import BookingModal from '../components/BookingModal';
import { Search, MapPin, Filter, Star, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

const EventVendorSearch = () => {
    const { id: eventId } = useParams();
    const navigate = useNavigate();

    const [event, setEvent] = useState(null);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [category, setCategory] = useState('');
    const [bookingModalOpen, setBookingModalOpen] = useState(false);
    const [selectedVendorForBooking, setSelectedVendorForBooking] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // 1. Fetch Event Details (to get location context)
                const eventRes = await api.get(`/events/${eventId}`);
                setEvent(eventRes.data.data.event);

                // 2. Fetch Compatible Vendors
                const vendorsRes = await api.get(`/vendors/events/${eventId}`);
                setVendors(vendorsRes.data.data.vendors);

                setError(null);
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || 'Failed to load vendors');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [eventId]);

    // Derived state for filtering
    const filteredVendors = category
        ? vendors.filter(v => v.services.includes(category))
        : vendors;

    const handleBookClick = (vendor) => {
        setSelectedVendorForBooking(vendor);
        setBookingModalOpen(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-brand-primary" size={32} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <Navbar />
                <div className="max-w-4xl mx-auto pt-24 text-center">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100">
                        <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Unavailable</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <Link to="/events" className="text-brand-primary font-bold hover:underline">
                            Return to My Events
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-primary">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">

                {/* Header */}
                <div className="mb-8">
                    <button onClick={() => navigate(`/events/${eventId}`)} className="flex items-center text-gray-500 hover:text-gray-800 mb-4 transition-colors">
                        <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
                    </button>

                    <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                        <div>
                            <span className="inline-block px-3 py-1 bg-brand-primary/10 text-brand-primary text-xs font-bold uppercase tracking-wider rounded-full mb-2">
                                Event Context
                            </span>
                            <h1 className="text-3xl font-bold text-gray-900 font-secondary">
                                Find Vendors for {event?.title}
                            </h1>
                            <div className="flex items-center text-gray-600 mt-2">
                                <MapPin size={18} className="mr-1 text-gray-400" />
                                <span className="font-medium mr-2">{event?.location?.city}</span>
                                <span className="text-gray-300">|</span>
                                <span className="ml-2 text-sm">Showing vendors serving this location</span>
                            </div>
                        </div>

                        {/* Filter Bar */}
                        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
                            <Filter size={18} className="text-gray-400 ml-2" />
                            <select
                                className="border-none focus:ring-0 text-sm font-medium text-gray-700 bg-transparent min-w-[150px]"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="">All Categories</option>
                                <option value="Venue">Venues</option>
                                <option value="Catering">Catering</option>
                                <option value="Photography">Photography</option>
                                <option value="Decor">Decor</option>
                                <option value="Music">Music</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Vendor Grid */}
                {filteredVendors.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search size={32} className="text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No vendors found</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            We couldn't find any {category} vendors serving {event?.location?.city}.
                            Try searching for a different category or contact support.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredVendors.map(vendor => (
                            <div key={vendor._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
                                <div className="h-48 bg-gray-200 relative">
                                    {vendor.portfolio && vendor.portfolio[0] ? (
                                        <img
                                            src={vendor.portfolio[0]}
                                            alt={vendor.companyName}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                                                e.target.parentElement.classList.add('bg-gray-100');
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                                            No Image
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold flex items-center shadow-sm">
                                        <Star size={12} className="text-yellow-400 mr-1 fill-yellow-400" />
                                        {vendor.rating?.average || 'New'}
                                    </div>
                                    <div className="absolute bottom-4 left-4">
                                        <span className="px-2 py-1 bg-black/50 backdrop-blur text-white text-xs font-bold rounded uppercase tracking-wide">
                                            {vendor.services[0]}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-brand-primary transition-colors">
                                        {vendor.companyName}
                                    </h3>
                                    <div className="flex items-center text-sm text-gray-500 mb-4">
                                        <MapPin size={14} className="mr-1" />
                                        {vendor.location?.city}
                                    </div>

                                    <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                                        {vendor.description || "No description provided."}
                                    </p>

                                    <div className="flex gap-3">
                                        <button
                                            // Link to vendor profile details (if we had that page) or just expand
                                            className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors text-sm"
                                        >
                                            View Profile
                                        </button>
                                        <button
                                            onClick={() => handleBookClick(vendor)}
                                            className="flex-1 py-2.5 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/20 text-sm"
                                        >
                                            Book Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Booking Modal */}
            {bookingModalOpen && selectedVendorForBooking && (
                <BookingModal
                    isOpen={bookingModalOpen}
                    onClose={() => setBookingModalOpen(false)}
                    vendor={selectedVendorForBooking}
                    preSelectedEventId={eventId} // Pass the event ID to lock it
                />
            )}
        </div>
    );
};

export default EventVendorSearch;
