import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import BookingModal from '../components/BookingModal';
import Skeleton from '../components/ui/Skeleton';
import { MapPin, Star, Share2, Heart, ArrowLeft, CheckCircle, Mail, Phone, Globe, Calendar, DollarSign, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const VendorDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('about'); // about, portfolio, reviews, services
    
    // Reviews
    const [reviews, setReviews] = useState([]);
    const [isEligible, setIsEligible] = useState(false);
    const [eligibleBookings, setEligibleBookings] = useState([]);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', bookingId: '' });
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        const fetchVendorDetails = async () => {
            try {
                setLoading(true);
                // Assuming standard REST endpoint. If this fails, we might need to adjust based on backend.
                // Based on VendorSearch, we likely need a public public endpoint.
                const res = await api.get(`/vendors/details/${id}`);
                setVendor(res.data.data.vendor);
            } catch (err) {
                console.error("Failed to fetch vendor details", err);
                setError("Vendor not found or unavailable.");
                toast.error("Failed to load vendor details.");
            } finally {
                setLoading(false);
            }
        };

        const fetchReviewsAndEligibility = async () => {
            try {
                // Public fetch reviews
                const reviewRes = await api.get(`/reviews/vendor/${id}`);
                setReviews(reviewRes.data.data.reviews);

                // If logged in, see if user can leave a review
                if (user) {
                    const eligRes = await api.get(`/reviews/eligibility/${id}`);
                    if (eligRes.data && eligRes.data.data && eligRes.data.data.isEligible) {
                        setIsEligible(true);
                        setEligibleBookings(eligRes.data.data.bookings);
                        if (eligRes.data.data.bookings.length > 0) {
                            setReviewForm(prev => ({ ...prev, bookingId: eligRes.data.data.bookings[0]._id }));
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to fetch reviews", err);
            }
        };

        if (id) {
            fetchVendorDetails();
            fetchReviewsAndEligibility();
        }
    }, [id, user]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmittingReview(true);
            const res = await api.post('/reviews', {
                vendorId: id,
                ...reviewForm
            });
            toast.success("Review submitted successfully!");
            setReviews([res.data.data.review, ...reviews]);
            setIsEligible(false); // Only letting them submit one per logic flow for simple UI right now
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to submit review");
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pb-12">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
                    <Skeleton className="h-8 w-32 mb-6" /> {/* Back button */}

                    {/* Hero Skeleton */}
                    <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm mb-8">
                        <Skeleton className="h-64 w-full" />
                        <div className="p-8">
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                <Skeleton className="w-24 h-24 rounded-2xl -mt-20 border-4 border-white" />
                                <div className="flex-1 w-full space-y-4">
                                    <Skeleton className="h-8 w-1/2" />
                                    <Skeleton className="h-4 w-1/3" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !vendor) {
        return (
            <div className="min-h-screen bg-gray-50 pb-12">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 text-center">
                    <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Vendor Not Found</h2>
                        <p className="text-gray-500 mb-6">{error || "The vendor you are looking for does not exist or has been removed."}</p>
                        <button onClick={handleBack} className="px-6 py-2 bg-brand-primary text-white rounded-xl font-bold">
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-primary pb-12">
            <Navbar />

            <BookingModal
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                vendor={vendor}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">
                {/* Back Navigation */}
                <button onClick={handleBack} className="flex items-center text-gray-500 hover:text-brand-primary mb-6 transition-colors font-medium">
                    <ArrowLeft size={18} className="mr-2" /> Back to Search
                </button>

                {/* Hero Section */}
                <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm mb-8 relative group">
                    {/* Cover Image */}
                    <div className="h-64 md:h-80 bg-gray-200 relative overflow-hidden">
                        {vendor.portfolio && vendor.portfolio.length > 0 ? (
                            <img
                                src={vendor.portfolio[0]}
                                alt={vendor.companyName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-r from-gray-800 to-gray-900 flex items-center justify-center">
                                <span className="text-gray-400 font-bold text-xl opacity-20">{vendor.companyName}</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                        <div className="absolute top-4 right-4 flex gap-2">
                            <button className="p-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/40 transition-colors">
                                <Share2 size={20} />
                            </button>
                            <button className="p-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/40 transition-colors">
                                <Heart size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="px-8 pb-8">
                        <div className="flex flex-col md:flex-row gap-6 items-start relative">
                            {/* Avatar/Logo */}
                            <div className="w-32 h-32 bg-white rounded-2xl p-1 shadow-lg -mt-16 relative z-10 flex-shrink-0">
                                {vendor.portfolio && vendor.portfolio.length > 0 ? (
                                    <img
                                        src={vendor.portfolio[0]}
                                        alt="Logo"
                                        className="w-full h-full object-cover rounded-xl"
                                    />
                                ) : ( // Fallback avatar
                                    <div className="w-full h-full bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary font-bold text-3xl">
                                        {vendor.companyName?.charAt(0) || 'V'}
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 pt-4 md:pt-2 w-full">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h1 className="text-3xl font-bold text-gray-900">{vendor.companyName}</h1>
                                            {vendor.isVerified && <CheckCircle size={20} className="text-blue-500 fill-blue-500 text-white" />}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                                            <span className="flex items-center"><MapPin size={16} className="mr-1 text-gray-400" /> {vendor.location?.city || "Location N/A"}</span>
                                            <span className="flex items-center"><Star size={16} className="mr-1 text-yellow-500 fill-yellow-500" /> {vendor.rating?.average || "New"} ({vendor.rating?.count || 0} reviews)</span>
                                            <span className="px-2 py-0.5 bg-brand-primary/10 text-brand-primary font-bold rounded text-xs uppercase">{vendor.services?.[0] || "Vendor"}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        <div className="text-right hidden md:block mr-2">
                                            <p className="text-xs text-gray-500 font-bold uppercase">Starting From</p>
                                            <p className="text-xl font-bold text-gray-900">
                                                {vendor.priceRange?.min > 0
                                                    ? `₹${vendor.priceRange.min.toLocaleString()}`
                                                    : "Ask for Quote"}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setIsBookingOpen(true)}
                                            className="flex-1 md:flex-none px-8 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-secondary transition-colors shadow-lg shadow-brand-primary/20"
                                        >
                                            Book Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="px-8 border-t border-gray-100 flex gap-8 overflow-x-auto no-scrollbar">
                        {['about', 'portfolio', 'reviews', 'services'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-4 text-sm font-bold uppercase tracking-wide transition-colors relative whitespace-nowrap ${activeTab === tab ? 'text-brand-primary' : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary rounded-t-full"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column (Main Content) */}
                    <div className="lg:col-span-2 space-y-8">

                        {activeTab === 'about' && (
                            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm animate-fade-in-up">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">About {vendor.companyName}</h3>
                                <p className="text-gray-600 leading-relaxed mb-6 whitespace-pre-line">
                                    {vendor.description || "No description provided by the vendor."}
                                </p>

                                <h4 className="font-bold text-gray-900 mb-3">Highlights</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {[
                                        { icon: CheckCircle, text: "Verified Vendor" },
                                        { icon: Calendar, text: "Flexible Booking" },
                                        { icon: DollarSign, text: "Transparent Pricing" },
                                        { icon: Globe, text: "Online Consultation" },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                                            <item.icon size={16} className="mr-2 text-brand-primary" />
                                            {item.text}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'portfolio' && (
                            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm animate-fade-in-up">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                    <ImageIcon size={20} className="mr-2" /> Portfolio
                                </h3>
                                {vendor.portfolio && vendor.portfolio.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        {vendor.portfolio.map((img, idx) => (
                                            <div key={idx} className="aspect-square bg-gray-100 rounded-xl overflow-hidden group cursor-pointer">
                                                <img
                                                    src={img}
                                                    alt={`Portfolio ${idx}`}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl">
                                        <ImageIcon size={48} className="mx-auto mb-2 opacity-20" />
                                        No images available.
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'services' && (
                            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm animate-fade-in-up">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Services Offered</h3>
                                <div className="space-y-4">
                                    {vendor.services && vendor.services.map((service, idx) => (
                                        <div key={idx} className="p-4 border border-gray-100 rounded-xl hover:border-brand-primary/30 transition-colors flex justify-between items-center group">
                                            <div className="flex items-center">
                                                <div className="w-2 h-2 rounded-full bg-brand-primary mr-3"></div>
                                                <span className="font-medium text-gray-900">{service}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {(!vendor.services || vendor.services.length === 0) && (
                                        <p className="text-gray-500 italic">No specific services listed.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Reviews */}
                        {activeTab === 'reviews' && (
                            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm animate-fade-in-up">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-gray-900">Client Reviews</h3>
                                </div>
                                
                                {isEligible && (
                                    <div className="bg-gray-50 p-6 rounded-2xl mb-8 border border-gray-200">
                                        <h4 className="font-bold text-gray-900 mb-4">Leave a Review</h4>
                                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Completed Booking</label>
                                                <select 
                                                    value={reviewForm.bookingId}
                                                    onChange={(e) => setReviewForm({...reviewForm, bookingId: e.target.value})}
                                                    className="w-full p-2 border border-gray-200 rounded-xl focus:ring-1 focus:ring-brand-primary outline-none text-sm"
                                                    required
                                                >
                                                    {eligibleBookings.map(b => (
                                                        <option key={b._id} value={b._id}>
                                                            {b.serviceType} - {new Date(b.date).toLocaleDateString()}
                                                        </option>
                                                    ))}
                                                </select>
                                                <p className="text-[10px] text-gray-500 mt-1">* Only fully paid and completed bookings can be reviewed.</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
                                                <div className="flex gap-2">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <button 
                                                            type="button" 
                                                            key={star} 
                                                            onClick={() => setReviewForm({...reviewForm, rating: star})}
                                                            className={`p-1 transition-transform hover:scale-110 ${reviewForm.rating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                                                        >
                                                            <Star className={reviewForm.rating >= star ? 'fill-yellow-500' : ''} size={24} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                                                <textarea 
                                                    required
                                                    rows="3"
                                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-brand-primary outline-none resize-none text-sm"
                                                    placeholder="Share your experience working with this vendor..."
                                                    value={reviewForm.comment}
                                                    onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                                                ></textarea>
                                            </div>
                                            <button 
                                                type="submit" 
                                                disabled={submittingReview}
                                                className="px-6 py-2 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-secondary transition-colors"
                                            >
                                                {submittingReview ? 'Submitting...' : 'Post Review'}
                                            </button>
                                        </form>
                                    </div>
                                )}

                                <div className="space-y-6">
                                    {reviews.length > 0 ? reviews.map(review => (
                                        <div key={review._id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                        <span className="font-bold text-gray-500">{review.customer?.name?.charAt(0) || 'U'}</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-sm text-gray-900">{review.customer?.name || 'Anonymous User'}</h4>
                                                        <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={14} className={i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-gray-600 text-sm mt-3">{review.comment}</p>
                                            
                                            {/* Vendor Reply */}
                                            {review.reply && (
                                                <div className="mt-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 ml-12">
                                                    <p className="text-xs font-bold text-gray-900 mb-1 flex items-center">
                                                        <span className="w-1.5 h-1.5 bg-brand-primary rounded-full mr-2"></span>
                                                        Message from {vendor.companyName}
                                                    </p>
                                                    <p className="text-sm text-gray-600">{review.reply}</p>
                                                </div>
                                            )}
                                        </div>
                                    )) : (
                                        <div className="text-center py-8">
                                            <p className="text-gray-500 italic">No reviews yet for this vendor.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Right Column (Sidebar Information) */}
                    <div className="space-y-6">
                        {/* Contact Card */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4">Contact Info</h3>
                            <div className="space-y-4">
                                {vendor.contactEmail && (
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Mail size={16} className="mr-3 text-gray-400" />
                                        {vendor.contactEmail}
                                    </div>
                                )}
                                {vendor.contactPhone && (
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Phone size={16} className="mr-3 text-gray-400" />
                                        {vendor.contactPhone}
                                    </div>
                                )}
                                {vendor.website && (
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Globe size={16} className="mr-3 text-gray-400" />
                                        <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">
                                            Visit Website
                                        </a>
                                    </div>
                                )}
                                {!vendor.contactEmail && !vendor.contactPhone && !vendor.website && (
                                    <p className="text-gray-400 text-sm italic">No contact info public.</p>
                                )}
                            </div>
                        </div>

                        {/* Mini Map (Placeholder) */}
                        <div className="bg-white p-2 rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="bg-gray-200 h-48 rounded-2xl w-full flex items-center justify-center text-gray-400 text-xs font-bold uppercase tracking-wider">
                                <MapPin size={24} className="mb-1 block mx-auto opacity-50" />
                                Map Preview
                            </div>
                            <div className="p-4">
                                <p className="font-bold text-gray-900 text-sm">{vendor.location?.city || "Mumbai, India"}</p>
                                <p className="text-xs text-gray-500">Service Area</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorDetails;
