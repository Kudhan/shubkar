import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { Search, MapPin, Filter, Star, Heart, ArrowRight } from 'lucide-react';
import Skeleton from '../components/ui/Skeleton';
import { Link } from 'react-router-dom';
import BookingModal from '../components/BookingModal';

const VendorSearch = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [filters, setFilters] = useState({
        serviceType: 'All',
        priceRange: 'All',
        rating: 0,
        sortBy: 'Recommended'
    });

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            const res = await api.get('/vendors/search'); // Ensure backend supports efficient searching
            setVendors(res.data.data.vendors);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSortChange = (e) => {
        setFilters(prev => ({ ...prev, sortBy: e.target.value }));
    };

    let filteredVendors = vendors.filter(vendor => {
        const searchLower = searchTerm.toLowerCase();
        
        // 1. Text Search (Name, Description, Location)
        const matchesSearch = 
            vendor.companyName?.toLowerCase().includes(searchLower) ||
            vendor.description?.toLowerCase().includes(searchLower) ||
            vendor.location?.city?.toLowerCase().includes(searchLower) ||
            (vendor.serviceCities && vendor.serviceCities.some(city => city.toLowerCase().includes(searchLower)));

        // 2. Service Type Filter
        const matchesService = filters.serviceType === 'All' || vendor.services?.includes(filters.serviceType);
        
        // 3. Price Filter
        let matchesPrice = true;
        const vendorPrice = vendor.priceRange?.min || (typeof vendor.priceRange === 'number' ? vendor.priceRange : 0);
        
        if (filters.priceRange !== 'All') {
            if (filters.priceRange === 'Budget') matchesPrice = vendorPrice <= 50000;
            else if (filters.priceRange === 'Standard') matchesPrice = vendorPrice > 50000 && vendorPrice <= 150000;
            else if (filters.priceRange === 'Premium') matchesPrice = vendorPrice > 150000 && vendorPrice <= 300000;
            else if (filters.priceRange === 'Luxury') matchesPrice = vendorPrice > 300000;
        }

        // 4. Rating Filter
        const matchesRating = (vendor.rating?.average || 0) >= filters.rating;
        
        return matchesSearch && matchesService && matchesPrice && matchesRating;
    });

    // Handle Sorting
    filteredVendors.sort((a, b) => {
        const priceA = a.priceRange?.min || (typeof a.priceRange === 'number' ? a.priceRange : 0);
        const priceB = b.priceRange?.min || (typeof b.priceRange === 'number' ? b.priceRange : 0);
        const ratingA = a.rating?.average || 0;
        const ratingB = b.rating?.average || 0;

        switch (filters.sortBy) {
            case 'Price: Low to High':
                return priceA - priceB;
            case 'Price: High to Low':
                return priceB - priceA;
            case 'Rating: High to Low':
                return ratingB - ratingA;
            case 'Recommended':
            default:
                // Prioritize verified vendors, then rating, then sort randomly or by date created
                if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;
                return ratingB - ratingA;
        }
    });

    const categories = ['All', 'Venue', 'Catering', 'Photography', 'Decoration', 'Music', 'Makeup'];

    const clearFilters = () => {
        setFilters({
            serviceType: 'All',
            priceRange: 'All',
            rating: 0,
            sortBy: 'Recommended'
        });
        setSearchTerm('');
    };

    return (
        <div className="min-h-screen bg-gray-50 font-primary">
            <Navbar />

            {/* Booking Modal */}
            <BookingModal
                isOpen={!!selectedVendor}
                onClose={() => setSelectedVendor(null)}
                vendor={selectedVendor}
            />

            {/* Search Header */}
            <div className="bg-white pt-28 pb-8 border-b border-gray-100 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search 'Wedding Photographer in Mumbai'..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="flex items-center px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors shadow-lg">
                            <Filter size={18} className="mr-2" /> Filters
                        </button>
                    </div>

                    {/* Quick Categories */}
                    <div className="flex gap-2 mt-6 overflow-x-auto pb-2 no-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => toggleFilter('serviceType', cat)}
                                className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${filters.serviceType === cat ? 'bg-brand-primary text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar Filters (Desktop) */}
                    <div className="hidden lg:block w-64 flex-shrink-0">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-48">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                                <Filter size={16} className="mr-2" /> Refine Results
                            </h3>

                            <div className="space-y-6">
                                <div className="flex justify-between items-center mb-4">
                                    <button 
                                        onClick={clearFilters}
                                        className="text-xs font-bold text-brand-primary hover:text-brand-secondary underline"
                                    >
                                        Clear All
                                    </button>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Price Range</label>
                                    <div className="space-y-2">
                                        {['All', 'Budget', 'Standard', 'Premium', 'Luxury'].map(range => (
                                            <label key={range} className="flex items-center space-x-2 cursor-pointer">
                                                <input type="radio" name="price" className="form-radio text-brand-primary focus:ring-brand-primary" checked={filters.priceRange === range} onChange={() => toggleFilter('priceRange', range)} />
                                                <span className="text-sm text-gray-600">{range}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Rating</label>
                                    <div className="space-y-2">
                                        {[4, 3, 2].map(star => (
                                            <label key={star} className="flex items-center space-x-2 cursor-pointer">
                                                <input 
                                                    type="radio" 
                                                    name="rating"
                                                    onChange={() => toggleFilter('rating', star)}
                                                    checked={filters.rating === star}
                                                    className="form-radio text-brand-primary rounded focus:ring-brand-primary" 
                                                />
                                                <span className="text-sm text-gray-600 flex items-center">{star}+ <Star size={12} className="ml-1 fill-amber-400 text-amber-400" /></span>
                                            </label>
                                        ))}
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input 
                                                type="radio" 
                                                name="rating"
                                                onChange={() => toggleFilter('rating', 0)}
                                                checked={filters.rating === 0}
                                                className="form-radio text-brand-primary rounded focus:ring-brand-primary" 
                                            />
                                            <span className="text-sm text-gray-600 flex items-center">Any Rating</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Grid */}
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-gray-500 font-medium">Showing <span className="text-gray-900 font-bold">{filteredVendors.length}</span> results</p>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <span>Sort by:</span>
                                <select 
                                    className="bg-transparent font-semibold text-gray-900 outline-none cursor-pointer p-1"
                                    value={filters.sortBy}
                                    onChange={handleSortChange}
                                >
                                    <option value="Recommended">Recommended</option>
                                    <option value="Price: Low to High">Price: Low to High</option>
                                    <option value="Price: High to Low">Price: High to Low</option>
                                    <option value="Rating: High to Low">Rating: High to Low</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[26rem]">
                                        <Skeleton className="h-48 w-full" />
                                        <div className="p-5 flex-1 flex flex-col space-y-3">
                                            <div className="flex justify-between">
                                                <Skeleton className="h-6 w-3/4" />
                                                <Skeleton className="h-6 w-12" />
                                            </div>
                                            <Skeleton className="h-4 w-1/2" />
                                            <Skeleton className="h-4 w-full" />
                                            <div className="pt-4 mt-auto flex justify-between items-center">
                                                <div className="space-y-1">
                                                    <Skeleton className="h-3 w-16" />
                                                    <Skeleton className="h-5 w-20" />
                                                </div>
                                                <Skeleton className="h-10 w-10 rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredVendors.map(vendor => (
                                    <div key={vendor._id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group flex flex-col">
                                        {/* Image Box */}
                                        <div className="h-48 bg-gray-200 relative overflow-hidden group">
                                            {vendor.portfolio && vendor.portfolio.length > 0 ? (
                                                <img
                                                    src={vendor.portfolio[0]}
                                                    alt={vendor.companyName}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                                                        e.target.parentElement.classList.add('bg-gray-100');
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-brand-secondary/20 to-brand-primary/10 flex items-center justify-center">
                                                    <span className="text-gray-400 font-bold opacity-50 text-sm">No Image</span>
                                                </div>
                                            )}

                                            <div className="absolute top-3 right-3 z-10">
                                                <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white text-gray-400 hover:text-red-500 transition-colors shadow-sm">
                                                    <Heart size={18} />
                                                </button>
                                            </div>
                                            <div className="absolute bottom-3 left-3 z-10">
                                                <span className="bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-lg uppercase tracking-wide shadow-sm">
                                                    {vendor.services[0]}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-5 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg text-gray-900 leading-tight group-hover:text-brand-primary transition-colors">
                                                    {vendor.companyName}
                                                </h3>
                                                <div className="flex items-center bg-green-50 px-1.5 py-0.5 rounded text-xs font-bold text-green-700">
                                                    4.8 <Star size={10} className="ml-1 fill-green-700" />
                                                </div>
                                            </div>

                                            <div className="flex items-center text-sm text-gray-500 mb-3">
                                                <MapPin size={14} className="mr-1" /> {
                                                    vendor.location?.city 
                                                        ? vendor.location.city.charAt(0).toUpperCase() + vendor.location.city.slice(1).toLowerCase() 
                                                        : (vendor.serviceCities?.length > 0 ? vendor.serviceCities.map(c => c.charAt(0).toUpperCase() + c.slice(1).toLowerCase()).join(', ') : 'Location N/A')
                                                }
                                            </div>

                                            <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">
                                                {vendor.description || "Providing exceptional event services for all your celebrations."}
                                            </p>

                                            <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-gray-400 font-semibold uppercase">Starting from</p>
                                                    <p className="font-bold text-gray-900">₹{typeof vendor.priceRange === 'object' ? vendor.priceRange.min?.toLocaleString() : vendor.priceRange || '15,000'}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Link
                                                        to={`/vendors/${vendor._id}`}
                                                        className="px-4 py-2 rounded-xl bg-gray-50 text-gray-900 font-bold hover:bg-gray-100 transition-colors text-sm"
                                                    >
                                                        Details
                                                    </Link>
                                                    <button
                                                        onClick={() => setSelectedVendor(vendor)}
                                                        className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white hover:bg-black transition-all shadow-lg"
                                                    >
                                                        <ArrowRight size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorSearch;
