import React, { createContext, useState, useEffect, useContext } from 'react';

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

    const logout = () => {
        localStorage.removeItem('token');
        setAuth({ user: null, token: null });
    };

    return (
        <AuthContext.Provider value={{ auth, setAuth, logout }}>
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