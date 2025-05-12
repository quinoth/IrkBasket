import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../AuthContext';

const LoginForm = () => {
    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    });
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Login data:', loginData);
        try {
            await login(loginData.email, loginData.password);
            toast.success('Login successful');
            navigate('/dashboard');
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Login failed: ' + error.message);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginData({ ...loginData, [name]: value });
    };

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Вход</h2>
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="mb-4">
                    <label className="block text-gray-700">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={loginData.email}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Пароль</label>
                    <input
                        type="password"
                        name="password"
                        value={loginData.password}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <button type="submit" className="bg-blue-500 text-white p-2 rounded">
                    Войти
                </button>
            </form>
        </div>
    );
};

export default LoginForm;