import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Plus, Clock, Trash2, Calendar as CalIcon, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const Timeline = () => {
    const [events, setEvents] = useState([]);
    const [newEvent, setNewEvent] = useState({ time: '', title: '', description: '', category: 'General' });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Fetch Events
    const fetchEvents = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/timeline', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEvents(res.data.data.timeline);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to load timeline. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newEvent.time || !newEvent.title) return;

        try {
            setSubmitting(true);
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/timeline', newEvent, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Optimistic update or just append result
            setEvents([...events, res.data.data.item].sort((a, b) => a.time.localeCompare(b.time)));
            setNewEvent({ time: '', title: '', description: '', category: 'General' });
        } catch (err) {
            console.error(err);
            alert('Failed to add event');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this activity?')) return;

        // Optimistic delete
        const previousEvents = [...events];
        setEvents(events.filter(e => e._id !== id));

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/timeline/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error(err);
            alert('Failed to delete event');
            setEvents(previousEvents); // Revert
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';

        // Optimistic update
        const updatedEvents = events.map(e => e._id === id ? { ...e, status: newStatus } : e);
        setEvents(updatedEvents);

        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:5000/api/timeline/${id}`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error(err);
            // Revert
            setEvents(events);
        }
    };

    // Derived State
    const completedCount = events.filter(e => e.status === 'completed').length;
    const progress = events.length > 0 ? Math.round((completedCount / events.length) * 100) : 0;

    const getcategoryColor = (cat) => {
        switch (cat) {
            case 'Ceremony': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'Catering': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'Music': return 'bg-pink-100 text-pink-800 border-pink-200';
            default: return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-primary">
            <Navbar />
            <div className="max-w-6xl mx-auto px-4 pt-28 pb-12">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 font-secondary mb-2">Event Timeline</h1>
                        <p className="text-gray-500"> meticulous minute-by-minute planning for your perfect day.</p>
                    </div>

                    {/* Progress Widget */}
                    <div className="bg-white px-6 py-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 min-w-[250px]">
                        <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-semibold text-gray-700">Progress</span>
                                <span className="text-brand-primary font-bold">{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div
                                    className="bg-brand-primary h-2 rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="h-10 w-10 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary">
                            <CheckCircle2 size={20} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Add New Event Form */}
                    <div className="lg:col-span-4">
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-28">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                <Plus className="mr-2 text-brand-primary" /> Add Activity
                            </h3>
                            <form onSubmit={handleAdd} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Time</label>
                                        <input
                                            type="time"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                                            value={newEvent.time}
                                            onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Category</label>
                                        <select
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all bg-white"
                                            value={newEvent.category}
                                            onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                                        >
                                            <option>General</option>
                                            <option>Ceremony</option>
                                            <option>Catering</option>
                                            <option>Photography</option>
                                            <option>Music</option>
                                            <option>Logistics</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Activity Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Grand Entrance"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                                        value={newEvent.title}
                                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Description</label>
                                    <textarea
                                        placeholder="Add details, logistics notes, or team assignments..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all h-28 resize-none"
                                        value={newEvent.description}
                                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 transition-colors flex justify-center items-center shadow-md disabled:opacity-70"
                                >
                                    {submitting ? <Loader2 className="animate-spin mr-2" size={18} /> : <Plus size={18} className="mr-2" />}
                                    Add to Timeline
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Timeline Display */}
                    <div className="lg:col-span-8">
                        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 min-h-[600px] relative">
                            <div className="absolute left-10 top-8 bottom-8 w-0.5 bg-gray-200"></div>

                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                                    <Loader2 className="animate-spin mb-4" size={32} />
                                    <p>Loading your schedule...</p>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center h-96 text-red-400">
                                    <AlertCircle className="mb-4" size={32} />
                                    <p>{error}</p>
                                    <button onClick={fetchEvents} className="mt-4 text-brand-primary underline">Try Again</button>
                                </div>
                            ) : events.length === 0 ? (
                                <div className="text-center py-20 pl-8">
                                    <div className="inline-block p-4 bg-gray-50 rounded-full mb-4">
                                        <CalIcon size={32} className="text-gray-300" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Your timeline is empty</h3>
                                    <p className="text-gray-500 mt-1">Start adding activities to plan your event.</p>
                                </div>
                            ) : (
                                <div className="space-y-8 relative">
                                    {events.map((event) => (
                                        <div key={event._id} className="relative pl-12 group">
                                            {/* Time Marker */}
                                            <div
                                                className={`absolute left-2 top-6 -translate-x-1/2 h-4 w-4 rounded-full border-2 transition-colors z-10 ${event.status === 'completed' ? 'bg-green-500 border-green-500' : 'bg-white border-brand-primary'}`}
                                            ></div>

                                            <div className={`p-5 rounded-xl border transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg ${event.status === 'completed' ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-white border-gray-100 shadow-sm'}`}>
                                                <div className="flex justify-between items-start gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getcategoryColor(event.category)}`}>
                                                                {event.category}
                                                            </span>
                                                            <span className="flex items-center text-sm font-semibold text-gray-600">
                                                                <Clock size={14} className="mr-1.5" /> {event.time}
                                                            </span>
                                                        </div>
                                                        <h4 className={`text-lg font-bold ${event.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                                            {event.title}
                                                        </h4>
                                                        {event.description && (
                                                            <p className="text-gray-600 mt-2 text-sm leading-relaxed">{event.description}</p>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => toggleStatus(event._id, event.status)}
                                                            className={`p-2 rounded-lg transition-colors ${event.status === 'completed' ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-gray-400 hover:text-green-600 hover:bg-gray-50'}`}
                                                            title={event.status === 'completed' ? "Mark as Pending" : "Mark as Completed"}
                                                        >
                                                            <CheckCircle2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(event._id)}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={18} />
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
        </div>
    );
};

export default Timeline;
