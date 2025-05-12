import React from 'react';
import { useAuth } from '../AuthContext';

const Profile = () => {
    const { auth } = useAuth();
    const user = auth.user;

    if (!user) {
        return <div>Загрузка...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Профиль</h2>
            <p><strong>Имя:</strong> {user.first_name}</p>
            <p><strong>Фамилия:</strong> {user.last_name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Роль:</strong> {user.role === 'player' ? 'Игрок' : 'Тренер'}</p>
            {user.role === 'player' && user.team_name && (
                <p><strong>Команда:</strong> {user.team_name}</p>
            )}
        </div>
    );
};

export default Profile;