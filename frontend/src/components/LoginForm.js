import React, { useState, useContext } from 'react'; 
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginForm = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        if (!formData.email || !formData.password) {
            toast.error('Все поля обязательны');
            setIsLoading(false);
            return;
        }
        
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            toast.error('Некорректный email');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Неверные учетные данные');
            }
            
            toast.success('Вход успешен');
            localStorage.setItem('token', data.token);
            login(data.user);
            navigate('/profile');
            
        } catch (err) {
            toast.error(err.message || 'Ошибка входа');
            console.error('Login error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center mb-6">Вход</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Пароль</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                    disabled={isLoading}
                >
                    {isLoading ? 'Вход...' : 'Войти'}
                </button>
            </form>
        </div>
    );
};

export default LoginForm;