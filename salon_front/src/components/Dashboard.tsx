import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import type { Business } from '../types/salon';
import { MapPin, Phone, Clock, ChevronRight, Search, Scissors } from 'lucide-react';

const Dashboard: React.FC = () => {
    const [salons, setSalons] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchSalons = async () => {
            try {
                const response = await api.get('/api/businesses/');
                if (response.data.success) {
                    setSalons(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching salons:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSalons();
    }, []);

    const filteredSalons = salons.filter(salon =>
        salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        salon.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Explore Salons</h1>
                    <p className="text-gray-500 font-medium">Find and book the best beauty services near you</p>
                </div>

                <div className="relative group max-w-md w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by name or location..."
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all placeholder:text-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {filteredSalons.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Scissors className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">No salons found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSalons.map((salon) => (
                        <Link
                            key={salon.id}
                            to={`/salon/${salon.id}`}
                            className="group bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="aspect-[16/9] bg-gray-100 relative overflow-hidden">
                                {salon.logo ? (
                                    <img src={salon.logo} alt={salon.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
                                        <Scissors className="w-12 h-12 text-indigo-200" />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold text-indigo-600 shadow-sm">
                                    Top Rated
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{salon.name}</h3>
                                    <div className="flex items-center text-gray-500 text-sm gap-1.5 font-medium">
                                        <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                                        <span className="line-clamp-1">{salon.address}</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3 py-1">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                        {salon.working_hours}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                                        {salon.phone}
                                    </div>
                                </div>

                                <div className="pt-2 flex items-center justify-between group-hover:translate-x-1 transition-transform">
                                    <span className="text-sm font-bold text-indigo-600">View Services</span>
                                    <ChevronRight className="w-5 h-5 text-indigo-600" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
