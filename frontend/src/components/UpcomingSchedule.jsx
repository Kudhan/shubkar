import React, { useMemo } from 'react';
import { Calendar, Clock, MapPin, User, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

const UpcomingSchedule = ({ bookings }) => {
    const processedBookings = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        // Filter valid confirmed bookings
        const upcoming = bookings.filter(b => {
            // Ensure we have a valid date and status is confirmed (or paid/completed if you want history, but request said upcoming)
            // strict "upcoming" means date >= today.
            if (!b.date) return false;
            const bDate = new Date(b.date);
            return bDate >= today && (b.status === 'confirmed' || b.status === 'paid');
        }).sort((a, b) => new Date(a.date) - new Date(b.date));

        const groups = {
            today: [],
            tomorrow: [],
            thisWeek: [],
            later: []
        };

        upcoming.forEach(booking => {
            const bDate = new Date(booking.date);
            bDate.setHours(0, 0, 0, 0);

            if (bDate.getTime() === today.getTime()) {
                groups.today.push(booking);
            } else if (bDate.getTime() === tomorrow.getTime()) {
                groups.tomorrow.push(booking);
            } else if (bDate < nextWeek) {
                groups.thisWeek.push(booking);
            } else {
                groups.later.push(booking);
            }
        });

        return groups;
    }, [bookings]);

    const BookingCard = ({ booking, isToday }) => (
        <div className={`relative p-5 rounded-2xl border transition-all hover:shadow-md ${isToday ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-gray-100'}`}>
            {isToday && (
                <div className="absolute top-4 right-4 animate-pulse">
                    <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                    </span>
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                {/* Time/Date Column */}
                <div className={`flex flex-col items-center justify-center p-3 rounded-xl min-w-[80px] ${isToday ? 'bg-white text-indigo-600 shadow-sm' : 'bg-gray-50 text-gray-500'}`}>
                    <span className="text-xs font-bold uppercase tracking-wider">{new Date(booking.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                    <span className="text-2xl font-bold">{new Date(booking.date).getDate()}</span>
                    <span className="text-xs font-medium opacity-80">{new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                </div>

                {/* Details Column */}
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${isToday ? 'bg-indigo-200 text-indigo-800' : 'bg-gray-100 text-gray-600'}`}>
                            {booking.serviceType || 'Service'}
                        </span>
                        {booking.time && (
                            <span className="flex items-center text-xs text-gray-500 font-medium">
                                <Clock size={12} className="mr-1" /> {booking.time}
                            </span>
                        )}
                    </div>

                    <h4 className="text-lg font-bold text-gray-900 leading-tight">
                        {booking.event?.title || "Untitled Event"}
                    </h4>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                            <User size={14} className="text-gray-400" />
                            <span>{booking.customer?.name || "Customer"}</span>
                        </div>
                        {booking.event?.location && (
                            <div className="flex items-center gap-1.5">
                                <MapPin size={14} className="text-gray-400" />
                                <span className="truncate max-w-[200px]">{booking.event.location}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Column */}
                <div className="flex flex-col items-end gap-2 w-full md:w-auto mt-2 md:mt-0">
                    <div className="text-right">
                        <p className="text-xs text-gray-500 font-medium uppercase">Est. Revenue</p>
                        <p className="font-bold text-gray-900">₹{(booking.finalPrice || booking.pricingDetails?.grandTotal || 0).toLocaleString()}</p>
                    </div>
                    {/* Add specific actions here if needed, e.g., "View Details" */}
                </div>
            </div>

            {booking.notes && (
                <div className="mt-4 pt-3 border-t border-gray-100/50 flex gap-2">
                    <AlertCircle size={14} className="text-gray-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-500 italic line-clamp-2">"{booking.notes}"</p>
                </div>
            )}
        </div>
    );

    const hasBookings = Object.values(processedBookings).some(arr => arr.length > 0);

    if (!hasBookings) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-gray-400">
                    <Calendar size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">No upcoming events</h3>
                <p className="text-gray-500 text-center max-w-md mt-1">
                    You don't have any confirmed bookings coming up. Once customers book you, your schedule will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
            {processedBookings.today.length > 0 && (
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
                            Today
                        </h3>
                        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {processedBookings.today.length}
                        </span>
                    </div>
                    <div className="grid gap-4">
                        {processedBookings.today.map(b => (
                            <BookingCard key={b._id} booking={b} isToday={true} />
                        ))}
                    </div>
                </section>
            )}

            {processedBookings.tomorrow.length > 0 && (
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                            Tomorrow
                        </h3>
                    </div>
                    <div className="grid gap-4">
                        {processedBookings.tomorrow.map(b => (
                            <BookingCard key={b._id} booking={b} />
                        ))}
                    </div>
                </section>
            )}

            {processedBookings.thisWeek.length > 0 && (
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-lg font-bold text-gray-900">This Week</h3>
                    </div>
                    <div className="grid gap-4">
                        {processedBookings.thisWeek.map(b => (
                            <BookingCard key={b._id} booking={b} />
                        ))}
                    </div>
                </section>
            )}

            {processedBookings.later.length > 0 && (
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Upcoming</h3>
                    </div>
                    <div className="grid gap-4">
                        {processedBookings.later.map(b => (
                            <BookingCard key={b._id} booking={b} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default UpcomingSchedule;
