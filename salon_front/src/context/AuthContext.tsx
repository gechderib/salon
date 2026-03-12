import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types/auth';

interface AuthContextType {
    user: User | null;
    access: string | null;
    refresh: string | null;
    login: (user: User, access: string, refresh: string) => void;
    logout: () => void;
    updateUser: (user: User) => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [access, setAccess] = useState<string | null>(null);
    const [refresh, setRefresh] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load auth state from local storage on initial mount
        const savedUser = localStorage.getItem('user');
        const savedAccess = localStorage.getItem('access');
        const savedRefresh = localStorage.getItem('refresh');

        if (savedUser && savedAccess && savedRefresh) {
            setUser(JSON.parse(savedUser));
            setAccess(savedAccess);
            setRefresh(savedRefresh);
        }
        setIsLoading(false);
    }, []);

    const login = (newUser: User, newAccess: string, newRefresh: string) => {
        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.setItem('access', newAccess);
        localStorage.setItem('refresh', newRefresh);
        setUser(newUser);
        setAccess(newAccess);
        setRefresh(newRefresh);
    };

    const updateUser = (updatedUser: User) => {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        setUser(null);
        setAccess(null);
        setRefresh(null);
    };

    return (
        <AuthContext.Provider value={{ user, access, refresh, login, logout, updateUser, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
