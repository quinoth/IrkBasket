import React, { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    if (!user) {
        return <div>Loading...</div>;
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center mb-6">Профиль</h2>
            <p><strong>Имя:</strong> {user.first_name}</p>
            <p><strong>Фамилия:</strong> {user.last_name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Роль:</strong> {user.role === 'player' ? 'Игрок' : 'Тренер'}</p>
            <button
                onClick={handleLogout}
                className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600 mt-4"
            >
                Выйти
            </button>
        </div>
    );
};

export default Profile;