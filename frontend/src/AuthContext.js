import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({ user: null, token: null });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetch('http://localhost:5000/user', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.id) {
                        setAuth({ user: data, token });
                    } else {
                        localStorage.removeItem('token');
                        setAuth({ user: null, token: null });
                    }
                })
                .catch(() => {
                    localStorage.removeItem('token');
                    setAuth({ user: null, token: null });
                });
        }
    }, []);

    const login = async (email, password) => {
        try {
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                setAuth({ user: data.user, token: data.token });
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setAuth({ user: null, token: null });
    };

    return (
        <AuthContext.Provider value={{ auth, setAuth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};