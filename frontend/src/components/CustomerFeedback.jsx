import React, { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const CustomerFeedback = ({ bookings }) => {
    // Filter bookings that are paid and date has passed
    const currentDate = new Date();
    
    const eligibleBookings = bookings.filter(b => {
        const isPaid = b.paymentStatus === 'paid' || b.paymentStatus === 'released';
        // b.date might be a single date, or part of an event date, but in Booking model we have b.date
        const isPast = b.date && new Date(b.date) <= currentDate;
        return isPaid && isPast;
    });

    const [reviewFormOpen, setReviewFormOpen] = useState(null); // stores booking ID
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [submitting, setSubmitting] = useState(false);
    const [reviewedBookings, setReviewedBookings] = useState(new Set()); // track locally in session

    const handleReviewSubmit = async (e, bookingId, vendorId) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await api.post('/reviews', {
                vendorId,
                bookingId,
                rating: reviewForm.rating,
                comment: reviewForm.comment
            });
            toast.success("Feedback submitted successfully!");
            
            // Mark as reviewed
            setReviewedBookings(prev => new Set(prev).add(bookingId));
            setReviewFormOpen(null);
            setReviewForm({ rating: 5, comment: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to submit feedback");
        } finally {
            setSubmitting(false);
        }
    };

    if (eligibleBookings.length === 0) {
        return (
            <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm text-center animate-fade-in-up">
                <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-primary">
                    <Star size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No Completed Bookings Yet</h2>
                <p className="text-gray-500 max-w-md mx-auto">
                    You can leave feedback once your event date has passed and the vendor has been fully paid.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-gray-900 font-secondary mb-6">Completed Bookings & Feedback</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {eligibleBookings.map(booking => {
                    const isReviewedLocally = reviewedBookings.has(booking._id);
                    
                    return (
                        <div key={booking._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-xl shadow-inner">
                                            {booking.serviceType === 'Photography' ? '📸' :
                                             booking.serviceType === 'Catering' ? '🥗' : '🏢'}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{booking.vendor?.companyName || "Vendor"}</h3>
                                            <p className="text-xs text-brand-primary font-bold uppercase tracking-wider">{booking.serviceType}</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold whitespace-nowrap">
                                        Completed
                                    </span>
                                </div>
                                
                                <div className="space-y-2 mb-4 text-sm text-gray-600">
                                    <p><span className="font-semibold text-gray-700">Date:</span> {new Date(booking.date).toLocaleDateString()}</p>
                                    <p><span className="font-semibold text-gray-700">Paid:</span> ₹{(booking.finalPrice || booking.pricingDetails?.grandTotal || 0).toLocaleString()}</p>
                                </div>

                                {isReviewedLocally ? (
                                    <div className="bg-green-50s border border-green-200 p-3 rounded-xl flex items-center text-green-700 text-sm font-semibold">
                                        <Star fill="currentColor" size={16} className="mr-2" />
                                        Feedback Submitted
                                    </div>
                                ) : reviewFormOpen === booking._id ? (
                                    <form onSubmit={(e) => handleReviewSubmit(e, booking._id, booking.vendor._id)} className="bg-gray-50 border border-gray-200 p-4 rounded-xl mt-4 space-y-4 animate-fade-in-up">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Rate Your Experience</label>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <button 
                                                        type="button" 
                                                        key={star} 
                                                        onClick={() => setReviewForm({...reviewForm, rating: star})}
                                                        className={`p-1.5 transition-transform hover:scale-110 rounded-full ${reviewForm.rating >= star ? 'text-yellow-500 bg-yellow-50' : 'text-gray-300 hover:text-gray-400'}`}
                                                    >
                                                        <Star className={reviewForm.rating >= star ? 'fill-yellow-500' : ''} size={24} />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Your Review</label>
                                            <textarea 
                                                required
                                                rows="3"
                                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none resize-none text-sm bg-white"
                                                placeholder="How was the service? Would you recommend them?"
                                                value={reviewForm.comment}
                                                onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                                            ></textarea>
                                        </div>
                                        <div className="flex gap-2 flex-wrap">
                                            <button 
                                                type="submit" 
                                                disabled={submitting}
                                                className="flex-1 px-4 py-2 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-secondary transition-colors text-sm disabled:opacity-50"
                                            >
                                                {submitting ? 'Submitting...' : 'Post Feedback'}
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => setReviewFormOpen(null)}
                                                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors text-sm"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <button 
                                        onClick={() => {
                                            setReviewFormOpen(booking._id);
                                            setReviewForm({ rating: 5, comment: '' });
                                        }}
                                        className="w-full py-2.5 flex items-center justify-center gap-2 bg-brand-primary/10 text-brand-primary font-bold rounded-xl hover:bg-brand-primary/20 transition-colors"
                                    >
                                        <MessageSquare size={16} /> Write Feedback
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CustomerFeedback;
