import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import EventModal from '../components/EventModal';
import { Plus, Calendar, MapPin, Users, DollarSign, Edit, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const EventsPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const res = await api.get('/events');
            setEvents(res.data.data.events);
        } catch (err) {
            console.error('Error fetching events', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleEdit = (event) => {
        setSelectedEvent(event);
        setShowModal(true);
    };

    const handleCreate = () => {
        setSelectedEvent(null);
        setShowModal(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-primary">
            <Navbar />

            <div className="pt-28 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 font-secondary">My Events</h1>
                        <p className="text-gray-500 mt-1">Manage all your special occasions in one place.</p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="flex items-center px-6 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-secondary transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <Plus size={20} className="mr-2" /> Create Event
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading events...</div>
                ) : events.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                            <Calendar size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No events planned yet</h3>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">Create your first event to start organizing tasks, booking vendors, and managing your budget.</p>
                        <button
                            onClick={handleCreate}
                            className="inline-flex items-center px-6 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-secondary transition-colors"
                        >
                            <Plus size={20} className="mr-2" /> Start Planning
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event) => (
                            <div key={event._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all group overflow-hidden flex flex-col">
                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-xs font-bold rounded-full uppercase tracking-wide">
                                            {event.eventType}
                                        </span>
                                        {/* Status Dot */}
                                        <div className="flex items-center text-xs font-semibold text-gray-500">
                                            <span className={`w-2 h-2 rounded-full mr-2 ${event.status === 'confirmed' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                                            {event.status}
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-primary transition-colors">
                                        {event.title}
                                    </h3>

                                    <div className="space-y-3 text-sm text-gray-600 mt-4">
                                        <div className="flex items-center">
                                            <Calendar size={16} className="mr-3 text-gray-400" />
                                            {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </div>
                                        {event.location?.city && (
                                            <div className="flex items-center">
                                                <MapPin size={16} className="mr-3 text-gray-400" />
                                                {event.location.venue ? `${event.location.venue}, ` : ''}{event.location.city}
                                            </div>
                                        )}
                                        {event.guestCount && (
                                            <div className="flex items-center">
                                                <Users size={16} className="mr-3 text-gray-400" />
                                                {event.guestCount} Guests
                                            </div>
                                        )}
                                        {event.budget?.total && (
                                            <div className="flex items-center">
                                                <DollarSign size={16} className="mr-3 text-gray-400" />
                                                Budget: ₹{event.budget.total.toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center bg-opacity-50">
                                    <button
                                        onClick={() => handleEdit(event)}
                                        className="text-gray-500 hover:text-gray-900 font-semibold text-sm flex items-center"
                                    >
                                        <Edit size={16} className="mr-1" /> Edit
                                    </button>

                                    <Link to={`/timeline`} className="text-brand-primary font-bold text-sm flex items-center hover:underline">
                                        View Timeline <ArrowRight size={16} className="ml-1" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <EventModal
                    event={selectedEvent}
                    onClose={() => setShowModal(false)}
                    onUpdate={fetchEvents}
                />
            )}
        </div>
    );
};

export default EventsPage;
