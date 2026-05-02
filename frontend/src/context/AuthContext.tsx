import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../lib/api';

interface User {
    _id: string;
    name: string;
    email: string;
    createdAt?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (user: User, token: string) => void;
    logout: () => void;
    updateUser: (updatedUser: User) => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                try {
                    const response = await api.getMe();
                    if (response.status === 'success') {
                        setUser(response.data.user);
                    } else {
                        // Token might be invalid
                        logout();
                    }
                } catch (err) {
                    console.error('Failed to fetch user:', err);
                    logout();
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, [token]);

    const login = (newUser: User, newToken: string) => {
        setUser(newUser);
        setToken(newToken);
        localStorage.setItem('token', newToken);
        navigate('/dashboard');
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        navigate('/');
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateUser, isAuthenticated: !!token, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
