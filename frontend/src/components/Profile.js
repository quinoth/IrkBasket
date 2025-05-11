import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
    const { user } = useContext(AuthContext);

    if (!user) {
        return <div className="text-center mt-10">Пожалуйста, войдите в систему</div>;
    }

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center mb-6">Профиль</h2>
            <p><strong>Имя:</strong> {user.first_name}</p>
            <p><strong>Фамилия:</strong> {user.last_name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Роль:</strong> {user.role === 'player' ? 'Игрок' : 'Тренер'}</p>
        </div>
    );
};

export default Profile;