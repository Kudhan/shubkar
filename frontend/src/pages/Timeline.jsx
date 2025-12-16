import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Plus, Clock, Move, Trash2, Calendar as CalIcon } from 'lucide-react';

const Timeline = () => {
    const [events, setEvents] = useState([
        { id: 1, time: '10:00', title: 'Welcome Drinks', description: 'Guests arrive at the main hall.', category: 'Catering' },
        { id: 2, time: '11:00', title: 'Ceremony Start', description: 'Main ritual begins.', category: 'Ceremony' },
        { id: 3, time: '13:00', title: 'Lunch Buffet', description: 'Vegetarian and Non-Veg counters open.', category: 'Catering' },
    ]);
    const [newEvent, setNewEvent] = useState({ time: '', title: '', description: '' });

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newEvent.time || !newEvent.title) return;

        setEvents([...events, { ...newEvent, id: Date.now(), category: 'General' }].sort((a, b) => a.time.localeCompare(b.time)));
        setNewEvent({ time: '', title: '', description: '' });
    };

    const handleDelete = (id) => {
        setEvents(events.filter(e => e.id !== id));
    };

    return (
        <div className="min-h-screen bg-gray-50 font-primary">
            <Navbar />
            <div className="max-w-5xl mx-auto px-4 pt-28 pb-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 font-secondary mb-4">Event Timeline Manager</h1>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Plan your day minute-by-minute. Drag and drop to reorder or add new milestones to ensure your event runs perfectly.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add New Event Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-28">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                <Plus className="mr-2 text-brand-primary" /> Add Activity
                            </h3>
                            <form onSubmit={handleAdd} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                    <input
                                        type="time"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary"
                                        value={newEvent.time}
                                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Activity Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Cake Cutting"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary"
                                        value={newEvent.title}
                                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        placeholder="Details (optional)"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary h-24"
                                        value={newEvent.description}
                                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                    />
                                </div>
                                <button type="submit" className="w-full py-3 bg-brand-primary text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex justify-center items-center">
                                    <Plus size={18} className="mr-2" /> Add to Timeline
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Timeline Display */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 min-h-[500px]">
                            <h3 className="text-xl font-bold text-gray-800 mb-8 flex items-center">
                                <CalIcon className="mr-2 text-brand-secondary" /> Schedule
                            </h3>

                            <div className="relative border-l-2 border-dashed border-gray-200 ml-4 space-y-8">
                                {events.map((event) => (
                                    <div key={event.id} className="relative pl-8 group">
                                        {/* Dot */}
                                        <div className="absolute -left-[9px] top-1 h-5 w-5 rounded-full bg-white border-4 border-brand-primary group-hover:border-brand-secondary transition-colors"></div>

                                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 group-hover:shadow-md transition-shadow relative">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mb-2">
                                                        <Clock size={12} className="mr-1" /> {event.time}
                                                    </span>
                                                    <h4 className="text-lg font-bold text-gray-900">{event.title}</h4>
                                                    <p className="text-gray-600 mt-1">{event.description}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleDelete(event.id)}
                                                    className="text-gray-300 hover:text-red-500 transition-colors p-1">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {events.length === 0 && (
                                <div className="text-center py-12 text-gray-400">
                                    No activities yet. Start planning your day!
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
