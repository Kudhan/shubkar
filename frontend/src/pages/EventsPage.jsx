import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { Plus, Calendar, MapPin, Users, DollarSign, Edit, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const EventsPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const res = await api.get('/events');
            setEvents(res.data.data.events);
        } catch (err) {
            console.error('Error fetching events', err);
            // Error is already handled by api interceptor with toast
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const renderEventCard = (event) => (
        <Link to={`/events/${event._id}`} key={event._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all group overflow-hidden flex flex-col cursor-pointer hover:-translate-y-1">
            <div className={`h-1.5 w-full ${event.status === 'completed' || new Date(event.date.startDate || event.date) < new Date() ? 'bg-gray-400' : event.status === 'cancelled' ? 'bg-red-400' : 'bg-brand-primary'}`}></div>
            <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-xs font-bold rounded-full uppercase tracking-wide">
                        {event.eventType}
                    </span>
                    {/* Status Dot */}
                    <div className="flex items-center text-xs font-semibold text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full bg-gray-50">
                        <span className={`w-2 h-2 rounded-full mr-1.5 ${event.status === 'confirmed' ? 'bg-green-500' : event.status === 'completed' ? 'bg-blue-500' : event.status === 'cancelled' ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                        {event.status === 'planning' ? 'Planning' : event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </div>
                </div>

                <h3 className={`text-xl font-bold mb-2 transition-colors ${event.status === 'cancelled' ? 'text-gray-500 line-through' : 'text-gray-900 group-hover:text-brand-primary'}`}>
                    {event.title}
                </h3>

                <div className="space-y-3 text-sm text-gray-600 mt-4">
                    <div className="flex items-center text-gray-900 font-medium">
                        <Calendar size={16} className={`mr-3 ${new Date(event.date.startDate || event.date) < new Date() ? 'text-gray-400' : 'text-brand-primary'}`} />
                        {new Date(event.date.startDate || event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                <span className="text-gray-500 group-hover:text-gray-900 font-semibold text-sm flex items-center transition-colors">
                    {event.status === 'completed' || new Date(event.date.startDate || event.date) < new Date() ? 'View Past Details' : 'Manage Event'}
                </span>

                <span className="text-brand-primary font-bold text-sm flex items-center group-hover:translate-x-1 transition-transform">
                    {event.status === 'completed' || new Date(event.date.startDate || event.date) < new Date() ? 'Review Dashboard' : 'View Dashboard'} <ArrowRight size={16} className="ml-1" />
                </span>
            </div>
        </Link>
    );

    return (
        <div className="min-h-screen bg-gray-50 font-primary">
            <Navbar />

            <div className="pt-28 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 font-secondary">My Events</h1>
                        <p className="text-gray-500 mt-1">Manage all your special occasions in one place.</p>
                    </div>
                    <Link
                        to="/events/create"
                        className="flex items-center px-6 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-secondary transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <Plus size={20} className="mr-2" /> Create Event
                    </Link>
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
                        <Link
                            to="/events/create"
                            className="inline-flex items-center px-6 py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-secondary transition-colors"
                        >
                            <Plus size={20} className="mr-2" /> Start Planning
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {/* Upcoming Events Section */}
                        {(() => {
                            const upcomingEvents = events.filter(e => new Date(e.date.startDate || e.date) >= new Date() && e.status !== 'completed' && e.status !== 'cancelled');
                            if (upcomingEvents.length === 0) return null;
                            return (
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-brand-primary"></div>
                                        Upcoming Events
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {upcomingEvents.map(renderEventCard)}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Completed Events Section */}
                        {(() => {
                            // Events are completed if explicitly marked, or date is in the past
                            const completedEvents = events.filter(e => e.status === 'completed' || new Date(e.date.startDate || e.date) < new Date() && e.status !== 'cancelled');
                            if (completedEvents.length === 0) return null;
                            return (
                                <div>
                                    <h2 className="text-xl font-bold text-gray-400 mb-6 flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                                        Past / Completed Events
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75 grayscale-[20%]">
                                        {completedEvents.map(renderEventCard)}
                                    </div>
                                </div>
                            );
                        })()}
                        
                        {/* Cancelled Events Section */}
                        {(() => {
                            const cancelledEvents = events.filter(e => e.status === 'cancelled');
                            if (cancelledEvents.length === 0) return null;
                            return (
                                <div>
                                    <h2 className="text-xl font-bold text-red-800 mb-6 flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                        Cancelled Events
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-50 grayscale">
                                        {cancelledEvents.map(renderEventCard)}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventsPage;
