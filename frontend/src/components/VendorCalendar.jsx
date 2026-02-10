import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Lock, Unlock } from 'lucide-react';
import api from '../services/api';

const VendorCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [blockedDates, setBlockedDates] = useState([]); // Array of date strings (ISO)
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/vendors/profile');
            // Assuming blockedDates are stored as ISO strings or Date objects
            const dates = res.data.data.profile.blockedDates || [];
            setBlockedDates(dates.map(d => new Date(d).toDateString()));
        } catch (err) {
            console.error("Failed to fetch profile", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const toggleDate = async (date) => {
        const dateString = date.toDateString();
        let newBlockedDates;

        if (blockedDates.includes(dateString)) {
            newBlockedDates = blockedDates.filter(d => d !== dateString);
        } else {
            newBlockedDates = [...blockedDates, dateString];
        }

        // Optimistic Update
        setBlockedDates(newBlockedDates);

        try {
            // Convert back to ISO for backend
            const isoDates = newBlockedDates.map(d => new Date(d).toISOString());
            await api.patch('/vendors/profile', { blockedDates: isoDates });
        } catch (err) {
            console.error("Failed to update blocked dates", err);
            // Revert on error
            fetchProfile();
        }
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        return { days, firstDay };
    };

    const { days, firstDay } = getDaysInMonth(currentDate);
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const changeMonth = (offset) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
    };

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Availability Calendar</h3>
                    <p className="text-gray-500 text-sm">Click on dates to block/unblock them.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft /></button>
                    <h4 className="text-lg font-bold w-32 text-center">{months[currentDate.getMonth()]} {currentDate.getFullYear()}</h4>
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronRight /></button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-xs font-bold text-gray-400 uppercase tracking-wider py-2">{day}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {[...Array(firstDay)].map((_, i) => (
                    <div key={`empty-${i}`} className="h-24 md:h-32 bg-gray-50/30 rounded-xl"></div>
                ))}

                {[...Array(days)].map((_, i) => {
                    const day = i + 1;
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    const isBlocked = blockedDates.includes(date.toDateString());
                    const isPast = date < new Date().setHours(0, 0, 0, 0);

                    return (
                        <button
                            key={day}
                            disabled={isPast}
                            onClick={() => toggleDate(date)}
                            className={`h-24 md:h-32 rounded-xl border flex flex-col items-start justify-between p-3 transition-all relative group
                                ${isPast ? 'bg-gray-100/50 text-gray-300 border-transparent cursor-not-allowed' :
                                    isBlocked ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' :
                                        'bg-white border-gray-100 hover:border-brand-primary hover:shadow-md text-gray-700'}
                            `}
                        >
                            <span className={`font-bold text-lg ${isBlocked ? 'text-red-500' : ''}`}>{day}</span>

                            {isBlocked && (
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-red-50/80 rounded-xl">
                                    <Unlock size={20} />
                                </div>
                            )}

                            {!isBlocked && !isPast && (
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-gray-50/80 rounded-xl text-gray-400">
                                    <Lock size={20} />
                                </div>
                            )}

                            {isBlocked && (
                                <span className="self-end text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded">Blocked</span>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="mt-6 flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-white border border-gray-200 rounded"></div>
                    <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-50 border border-red-200 rounded"></div>
                    <span>Blocked</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-100 border border-transparent rounded"></div>
                    <span>Past</span>
                </div>
            </div>
        </div>
    );
};

export default VendorCalendar;
