import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Navigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

declare global {
    interface Window {
        onTelegramAuth: (data: any) => void;
    }
}

const Login: React.FC = () => {
    const { user, login, isLoading } = useAuth();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Add the Telegram Login script
        const script = document.createElement('script');
        script.src = "https://telegram.org/js/telegram-widget.js?22";
        script.setAttribute('data-telegram-login', import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'salon_bot');
        script.setAttribute('data-size', 'large');
        script.setAttribute('data-onauth', 'onTelegramAuth(user)');
        script.setAttribute('data-request-access', 'write');
        script.async = true;

        const widget = document.getElementById('telegram-widget');
        if (widget) {
            widget.appendChild(script);
        }

        // Set up the Telegram callback
        window.onTelegramAuth = async (data: any) => {
            try {
                const response = await api.post('/api/auth/telegram-login/', { telegram_data: data });
                if (response.data.success) {
                    login(response.data.data.user, response.data.data.access, response.data.data.refresh);
                    setError(null);
                } else {
                    setError('Telegram Login Failed');
                }
            } catch (err: any) {
                setError(err.response?.data?.message || 'Telegram Login Error');
            }
        };

        return () => {
            // Clean up script on unmount
            if (widget) {
                widget.innerHTML = '';
            }
        };
    }, [login]);

    const handleGoogleSuccess = async (googleResponse: any) => {
        try {
            const response = await api.post('/api/auth/google-login/', { id_token: googleResponse.credential });
            if (response.data.success) {
                login(response.data.data.user, response.data.data.access, response.data.data.refresh);
                setError(null);
            } else {
                setError('Google Login Failed');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Google Login Error');
        }
    };

    const handleGoogleError = () => {
        setError('Google Login Failed');
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (user) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-10 border border-gray-100">
            <div className="text-center space-y-2 mb-10">
                <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-indigo-200 shadow-xl transform rotate-3 hover:rotate-0 transition-transform cursor-default">
                    <LogIn className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Salon Login</h1>
                <p className="text-gray-500 font-medium">Choose your preferred login method</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r-xl text-rose-700 font-medium text-sm animate-pulse">
                    {error}
                </div>
            )}

            <div className="space-y-6">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-full flex justify-center shadow-sm">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            useOneTap
                            shape="pill"
                        />
                    </div>

                    <div className="flex items-center gap-4 w-full px-4">
                        <div className="h-px flex-1 bg-gray-100"></div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">or</span>
                        <div className="h-px flex-1 bg-gray-100"></div>
                    </div>

                    <div id="telegram-widget" className="w-full flex justify-center hover:scale-[1.02] transition-transform"></div>
                </div>
            </div>

            <p className="mt-10 text-center text-xs text-gray-400 font-medium">
                By signing in, you agree to our <a href="#" className="underline hover:text-indigo-600 transition-colors">Terms</a> and <a href="#" className="underline hover:text-indigo-600 transition-colors">Privacy Policy</a>
            </p>
        </div>
    );
};

export default Login;
