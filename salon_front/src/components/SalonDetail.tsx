import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import type { Business, Service } from '../types/salon';
import { useAuth } from '../context/AuthContext';
import { Clock, MapPin, Calendar, Scissors, ChevronLeft, CreditCard, ChevronRight, Check } from 'lucide-react';

interface AvailabilitySlot {
    start: string;
    end: string;
    available_count: number;
}

const SalonDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [salon, setSalon] = useState<Business | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    // Booking Flow State
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
    const [slotsLoading, setSlotsLoading] = useState(false);

    const [bookingLoading, setBookingLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [salonRes, servicesRes] = await Promise.all([
                    api.get(`/api/businesses/${id}/`),
                    api.get(`/api/services/salon/${id}/`)
                ]);

                if (salonRes.data.success) setSalon(salonRes.data.data);
                if (servicesRes.data.success) setServices(servicesRes.data.data);
            } catch (error) {
                console.error('Error fetching salon detail:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    useEffect(() => {
        if (selectedService && selectedDate) {
            fetchAvailability();
        }
    }, [selectedService, selectedDate]);

    const fetchAvailability = async () => {
        setSlotsLoading(true);
        setSelectedSlot(null);
        try {
            const response = await api.get(`/api/businesses/${id}/availability/`, {
                params: { date: selectedDate, service_id: selectedService?.id }
            });
            if (response.data.success) {
                setSlots(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching availability:', error);
        } finally {
            setSlotsLoading(false);
        }
    };

    const handleConfirmBooking = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (user.is_business) {
            setMessage({ type: 'error', text: 'Business owners cannot book services. Please use a customer account.' });
            return;
        }

        if (!selectedService || !selectedSlot) return;

        setBookingLoading(true);
        try {
            const response = await api.post('/api/bookings/', {
                business: salon?.id,
                service: selectedService.id,
                date: selectedDate,
                start_time: selectedSlot.start,
                end_time: selectedSlot.end
            });

            if (response.data.success) {
                setMessage({ type: 'success', text: 'Booking confirmed! Check "My Bookings" for details.' });
                setSelectedService(null);
                setSelectedSlot(null);
            } else {
                setMessage({ type: 'error', text: response.data.message || 'Booking failed.' });
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Error creating booking.';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setBookingLoading(false);
            setTimeout(() => setMessage(null), 6000);
        }
    };

    // Helper to generate next 14 days
    const getNextDays = () => {
        const days = [];
        for (let i = 0; i < 14; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            days.push({
                full: d.toISOString().split('T')[0],
                dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
                dateNum: d.getDate(),
                month: d.toLocaleDateString('en-US', { month: 'short' })
            });
        }
        return days;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!salon) return <div className="text-center py-10">Salon not found.</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-20 px-4 sm:px-6">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-semibold group mt-4 sm:mt-0"
            >
                <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                Back to Explore
            </button>

            {message && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-bounce shadow-lg sticky top-24 z-40 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}>
                    <Check className="w-5 h-5 shrink-0" />
                    <span className="font-bold text-sm sm:text-base">{message.text}</span>
                </div>
            )}

            <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 lg:p-14 shadow-sm border border-gray-100 space-y-10 sm:space-y-12">
                <div className="text-center space-y-4">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tighter leading-tight">{salon.name}</h1>
                    {salon.map_url && (
                        <a
                            href={salon.map_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:underline bg-indigo-50 px-5 py-2 rounded-full text-xs sm:text-sm transition-all"
                        >
                            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            View on Maps
                        </a>
                    )}
                </div>

                <div className="pt-10 border-t border-gray-50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Available Services</h2>
                        <span className="bg-gray-900 text-white px-5 py-2 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest w-fit">
                            {services.length} Total
                        </span>
                    </div>

                    {!selectedService ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            {services.map((service) => (
                                <div
                                    key={service.id}
                                    onClick={() => setSelectedService(service)}
                                    className="p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 bg-gray-50/20 hover:bg-white hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-50/50 transition-all group cursor-pointer flex items-center justify-between gap-4"
                                >
                                    <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-gray-100 shrink-0 group-hover:scale-110 transition-transform overflow-hidden">
                                            {service.image ? (
                                                <img src={service.image} className="w-full h-full object-cover" />
                                            ) : (
                                                <Scissors className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-100" />
                                            )}
                                        </div>
                                        <div className="space-y-1 sm:space-y-1.5 min-w-0">
                                            <h4 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{service.name}</h4>
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 font-bold">
                                                <span className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider shrink-0">
                                                    <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                    {service.duration_minutes}m
                                                </span>
                                                <span className="text-indigo-600 text-base sm:text-lg font-black shrink-0">${service.price}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white p-2.5 rounded-xl shadow-sm text-gray-300 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all shrink-0">
                                        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="max-w-3xl mx-auto space-y-12 animate-in slide-in-from-bottom-8 duration-500">
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => setSelectedService(null)}
                                    className="text-gray-400 hover:text-gray-900 font-bold flex items-center gap-2 group"
                                >
                                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                    Change Service
                                </button>
                                <div className="text-right">
                                    <h3 className="text-2xl font-black text-gray-900">{selectedService.name}</h3>
                                    <p className="text-indigo-600 font-black">${selectedService.price} • {selectedService.duration_minutes} min</p>
                                </div>
                            </div>

                            {/* Date Picker */}
                            <div className="space-y-6">
                                <h4 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                    <Calendar className="w-6 h-6 text-indigo-600" />
                                    Select a Date
                                </h4>
                                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                    {getNextDays().map((day) => (
                                        <button
                                            key={day.full}
                                            onClick={() => setSelectedDate(day.full)}
                                            className={`flex flex-col items-center justify-center min-w-[90px] h-[110px] rounded-3xl border-2 transition-all ${selectedDate === day.full
                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl shadow-indigo-200 scale-105'
                                                : 'bg-white border-gray-50 text-gray-500 hover:border-indigo-100'
                                                }`}
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">{day.month}</span>
                                            <span className="text-3xl font-black tracking-tighter">{day.dateNum}</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest mt-1">{day.dayName}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Time Slots */}
                            <div className="space-y-6">
                                <h4 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                    <Clock className="w-6 h-6 text-indigo-600" />
                                    Available Slots
                                </h4>
                                {slotsLoading ? (
                                    <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
                                ) : slots.length === 0 ? (
                                    <div className="bg-gray-50 p-14 rounded-[2rem] text-center text-gray-400 font-bold border border-dashed border-gray-200 uppercase tracking-widest text-xs">
                                        No slots available for this date.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {slots.map((slot) => (
                                            <button
                                                key={slot.start}
                                                disabled={slot.available_count === 0}
                                                onClick={() => setSelectedSlot(slot)}
                                                className={`p-5 rounded-2xl border-2 transition-all text-center flex flex-col gap-1 items-center ${selectedSlot?.start === slot.start
                                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100'
                                                    : 'bg-white border-gray-50 text-gray-900 hover:border-indigo-100 shadow-sm'
                                                    } ${slot.available_count === 0 ? 'opacity-20 cursor-not-allowed grayscale' : ''}`}
                                            >
                                                <span className="text-xl font-black tracking-tighter">{slot.start}</span>
                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                                                    {slot.available_count} left
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Final Confirm */}
                            <div className="pt-12 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-8">
                                <div className="space-y-1">
                                    {selectedSlot ? (
                                        <>
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Selected Appointment</p>
                                            <p className="text-2xl font-black text-indigo-600 tracking-tight">
                                                {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} at {selectedSlot.start}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-gray-400 font-bold italic">Please select your preferred time slot</p>
                                    )}
                                </div>
                                <button
                                    onClick={handleConfirmBooking}
                                    disabled={!selectedSlot || bookingLoading || user?.is_business}
                                    className="w-full sm:w-auto px-16 py-6 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-2xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-4 uppercase tracking-[0.1em] text-xs"
                                >
                                    {bookingLoading ? (
                                        <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <CreditCard className="w-5 h-5" />
                                            {user?.is_business ? 'Booking Restricted' : 'Complete Booking'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SalonDetail;
