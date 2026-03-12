import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import type { Booking } from '../types/salon';
import { Calendar, Clock, Scissors, CheckCircle2, XCircle, Timer, ChevronRight, MapPin } from 'lucide-react';

const MyBookings: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/bookings/my/');
            if (response.data.success) {
                setBookings(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching my bookings:', error);
        } finally {
            setLoading(true); // Bug in previous code? No, let's set to false
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleCancel = async (bookingId: number) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        try {
            const response = await api.post(`/api/bookings/${bookingId}/cancel/`, {});
            if (response.data.success) {
                setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
            }
        } catch (error) {
            console.error('Error cancelling booking:', error);
            alert('Failed to cancel booking.');
        }
    };

    const handleViewDetails = (booking: Booking) => {
        alert(`Booking Details:\n\nService: ${booking.service_name}\nBusiness: ${booking.business_name}\nDate: ${booking.date}\nTime: ${booking.start_time} - ${booking.end_time}\nStatus: ${booking.status.toUpperCase()}`);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
            case 'completed': return 'text-green-600 bg-green-50 border-green-100';
            case 'cancelled': return 'text-rose-600 bg-rose-50 border-rose-100';
            default: return 'text-amber-600 bg-amber-50 border-amber-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed': return <CheckCircle2 className="w-4 h-4" />;
            case 'completed': return <CheckCircle2 className="w-4 h-4" />;
            case 'cancelled': return <XCircle className="w-4 h-4" />;
            default: return <Timer className="w-4 h-4" />;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 px-4 sm:px-0">
            <div className="space-y-1">
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">My Bookings</h1>
                <p className="text-gray-500 font-medium text-sm sm:text-base">Keep track of your beauty transformations</p>
            </div>

            {bookings.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">You don't have any bookings yet.</p>
                    <button className="mt-4 text-indigo-600 font-bold hover:underline">Explore salons now</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {bookings.map((booking) => (
                        <div
                            key={booking.id}
                            className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6 group"
                        >
                            <div className="flex items-center gap-4 sm:gap-5">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform shrink-0">
                                    <Scissors className="w-7 h-7 sm:w-8 sm:h-8" />
                                </div>
                                <div className="space-y-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${getStatusColor(booking.status)}`}>
                                            {getStatusIcon(booking.status)}
                                            {booking.status}
                                        </span>
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{booking.service_name}</h3>
                                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 font-medium truncate">
                                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                                        {booking.business_name}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 font-medium pt-1">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                            {booking.date}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                            {booking.start_time}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                                <button
                                    onClick={() => handleViewDetails(booking)}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl font-bold text-xs sm:text-sm transition-all"
                                >
                                    Details
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                                {booking.status === 'pending' && (
                                    <button
                                        onClick={() => handleCancel(booking.id)}
                                        className="flex-1 sm:flex-none px-5 py-3 text-rose-600 font-bold text-xs sm:text-sm hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyBookings;
