import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Settings, ShieldCheck, Mail, Phone, Briefcase, CheckCircle2, AlertCircle, User as UserIcon } from 'lucide-react';

const Profile: React.FC = () => {
    const { user, updateUser } = useAuth();
    const [firstName, setFirstName] = useState(user?.first_name || '');
    const [lastName, setLastName] = useState(user?.last_name || '');
    const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.put('/api/users/profile/', {
                first_name: firstName,
                last_name: lastName,
                phone_number: phoneNumber
            });
            if (response.data.success) {
                updateUser(response.data.data);
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Update failed.' });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(null), 5000);
        }
    };

    const handleBecomeBusiness = async () => {
        if (!window.confirm('Are you sure you want to request a business account?')) return;

        setLoading(true);
        try {
            const response = await api.post('/api/users/become-business/', {});
            if (response.data.success) {
                updateUser(response.data.data);
                setMessage({ type: 'success', text: 'Request sent! Awaiting admin approval.' });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Request failed.' });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Your Profile</h1>
                    <p className="text-gray-500 font-medium">Manage your personal information and account type</p>
                </div>
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <Settings className="w-6 h-6 text-indigo-500" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center gap-6">
                        <div className="relative group">
                            {user.profile_picture ? (
                                <img src={user.profile_picture} className="w-32 h-32 rounded-3xl object-cover shadow-xl border-4 border-indigo-50" alt={user.username} />
                            ) : (
                                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl border-4 border-white">
                                    <UserIcon className="w-16 h-16 text-white" />
                                </div>
                            )}
                            {user.is_business_approved && (
                                <div className="absolute -bottom-2 -right-2 bg-indigo-600 p-2 rounded-xl shadow-lg border-2 border-white">
                                    <ShieldCheck className="w-5 h-5 text-white" />
                                </div>
                            )}
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-gray-900">{user.username}</h3>
                            <p className="text-indigo-600 font-black uppercase text-xs tracking-widest mt-1">
                                {user.is_admin_role ? 'Administrator' : user.is_business ? 'Business Owner' : 'Customer'}
                            </p>
                        </div>

                        <div className="w-full space-y-3 pt-6 border-t border-gray-50">
                            <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                                <span className="truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                                <span>{user.phone_number || 'No phone added'}</span>
                            </div>
                        </div>
                    </div>

                    {!user.is_business && !user.is_admin_role && (
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 overflow-hidden relative">
                            <div className="relative z-10 space-y-6">
                                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl w-fit">
                                    <Briefcase className="w-6 h-6 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xl font-bold">Start your business!</h4>
                                    <p className="text-indigo-100 font-medium text-sm leading-relaxed">Boost your salon's reach by listing your services here.</p>
                                </div>
                                <button
                                    onClick={handleBecomeBusiness}
                                    disabled={loading}
                                    className="w-full py-4 bg-white text-indigo-700 rounded-2xl font-black text-sm transition-all hover:bg-indigo-50 active:scale-95 disabled:opacity-50"
                                >
                                    Join as Business
                                </button>
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        </div>
                    )}

                    {user.is_business && !user.is_business_approved && (
                        <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 flex items-start gap-4">
                            <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
                            <div>
                                <h4 className="font-bold text-amber-900">Verification Pending</h4>
                                <p className="text-sm text-amber-700 mt-1">Your business application is being reviewed. We'll notify you soon.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Update Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100">
                        <h3 className="text-2xl font-bold text-gray-900 mb-8">Personal Information</h3>

                        {message && (
                            <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                                }`}>
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="font-bold">{message.text}</span>
                            </div>
                        )}

                        <form onSubmit={handleUpdate} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-400 uppercase tracking-wider ml-1">First Name</label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium"
                                        placeholder="Enter your first name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-400 uppercase tracking-wider ml-1">Last Name</label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium"
                                        placeholder="Enter your last name"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-black text-gray-400 uppercase tracking-wider ml-1">Phone Number</label>
                                <input
                                    type="text"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium"
                                    placeholder="e.g. +1 234 567 890"
                                />
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-indigo-100 shadow-xl hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all disabled:opacity-50 disabled:translate-y-0"
                                >
                                    {loading ? 'Saving Changes...' : 'Save Settings'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
