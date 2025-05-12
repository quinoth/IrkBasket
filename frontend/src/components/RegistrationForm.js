import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config';

const RegistrationForm = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'player',
        team_id: ''
    });
    const [teams, setTeams] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${API_BASE_URL}/public/teams`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch teams');
                return res.json();
            })
            .then(data => setTeams(data))
            .catch(err => {
                console.error(err);
                toast.error('Ошибка загрузки команд');
            });
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateEmail = (email) => {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    };

    const validatePassword = (password) => {
        if (password.length < 8) return false;
        if (!/[A-Z]/.test(password)) return false;
        if (!/[a-z]/.test(password)) return false;
        if (!/[0-9]/.test(password)) return false;
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateEmail(formData.email)) {
            toast.error('Некорректный email');
            return;
        }
        if (!validatePassword(formData.password)) {
            toast.error('Пароль должен содержать хотя бы 8 символов, включая заглавные и строчные буквы и цифры');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            toast.error('Пароли не совпадают');
            return;
        }
        if (formData.role === 'player' && !formData.team_id) {
            toast.error('Выберите команду');
            return;
        }
        const registerData = {
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
        };
        if (formData.role === 'player') {
            registerData.team_id = formData.team_id;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registerData)
            });
            const data = await response.json();
            if (response.ok) {
                toast.success(data.message);
                setFormData({
                    first_name: '',
                    last_name: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    role: 'player',
                    team_id: ''
                });
                navigate('/login');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('Ошибка регистрации');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Регистрация</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="first_name" className="block text-gray-700 font-bold mb-2">Имя</label>
                    <input
                        type="text"
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="last_name" className="block text-gray-700 font-bold mb-2">Фамилия</label>
                    <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 font-bold mb-2">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="password" className="block text-gray-700 font-bold mb-2">Пароль</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="confirmPassword" className="block text-gray-700 font-bold mb-2">Подтвердить пароль</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="role" className="block text-gray-700 font-bold mb-2">Роль</label>
                    <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    >
                        <option value="player">Игрок</option>
                        <option value="trainer">Тренер</option>
                    </select>
                </div>
                {formData.role === 'player' && (
                    <div className="mb-4">
                        <label htmlFor="team_id" className="block text-gray-700 font-bold mb-2">Команда</label>
                        <select
                            id="team_id"
                            name="team_id"
                            value={formData.team_id}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            required
                        >
                            <option value="">Выберите команду</option>
                            {teams.map(team => (
                                <option key={team.id} value={team.id}>{team.name}</option>
                            ))}
                        </select>
                    </div>
                )}
                <button type="submit" className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:shadow-outline">
                    Зарегистрироваться
                </button>
            </form>
        </div>
    );
};

export default RegistrationForm;