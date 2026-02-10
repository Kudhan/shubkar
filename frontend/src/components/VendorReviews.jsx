import React, { useEffect, useState } from 'react';
import { Star, MessageSquare, ThumbsUp, User } from 'lucide-react';
import api from '../services/api';

const VendorReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');

    const fetchReviews = async () => {
        try {
            const res = await api.get('/reviews/my-reviews');
            setReviews(res.data.data.reviews);
        } catch (err) {
            console.error("Failed to fetch reviews", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleReplySubmit = async (reviewId) => {
        try {
            await api.patch(`/reviews/${reviewId}/reply`, { reply: replyText });
            setReplyingTo(null);
            setReplyText('');
            fetchReviews(); // Refresh
        } catch (err) {
            console.error("Failed to submit reply", err);
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading reviews...</div>;

    if (reviews.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-amber-400">
                    <Star size={32} fill="currentColor" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">No reviews yet</h3>
                <p className="text-gray-500 text-center max-w-md mt-1">
                    Once customers rate your services, their feedback will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Customer Feedback ({reviews.length})</h3>
                <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-3 py-1 rounded-full">
                    <Star size={16} fill="currentColor" />
                    <span>
                        {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)} Average
                    </span>
                </div>
            </div>

            <div className="grid gap-6">
                {reviews.map((review) => (
                    <div key={review._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                    {review.customer?.photo ? (
                                        <img src={review.customer.photo} alt="User" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <User size={20} />
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{review.customer?.name || "Anonymous Customer"}</h4>
                                    <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex gap-1 text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-gray-300"} />
                                ))}
                            </div>
                        </div>

                        <p className="text-gray-700 leading-relaxed mb-4">
                            {review.comment || "No written review provided."}
                        </p>

                        {review.reply ? (
                            <div className="bg-gray-50 p-4 rounded-xl border-l-4 border-brand-primary">
                                <p className="text-xs font-bold text-brand-primary mb-1">Your Reply</p>
                                <p className="text-sm text-gray-600">{review.reply}</p>
                            </div>
                        ) : (
                            <div>
                                {replyingTo === review._id ? (
                                    <div className="mt-4">
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="Write a professional reply..."
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none text-sm mb-2"
                                            rows="3"
                                        />
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                onClick={() => setReplyingTo(null)}
                                                className="px-4 py-2 text-sm text-gray-500 font-medium hover:bg-gray-100 rounded-lg"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handleReplySubmit(review._id)}
                                                className="px-4 py-2 text-sm bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800"
                                            >
                                                Post Reply
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setReplyingTo(review._id)}
                                        className="text-brand-primary text-sm font-semibold flex items-center hover:underline"
                                    >
                                        <MessageSquare size={14} className="mr-1.5" /> Reply to feedback
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VendorReviews;
