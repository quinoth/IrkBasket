import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const Navbar = () => {
    const { auth, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-gray-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-white text-xl font-bold">Баскетбольный клуб</Link>
                <ul className="flex space-x-4">
                    {auth.user ? (
                        <>
                            <li><Link to="/schedules" className="text-white">Расписание</Link></li>
                            {auth.user.role === 'trainer' && (
                                <>
                                    <li><Link to="/teams" className="text-white">Команды</Link></li>
                                    <li><Link to="/schedules-management" className="text-white">Управление расписанием</Link></li>
                                    <li><Link to="/attendance-recording" className="text-white">Запись посещаемости</Link></li>
                                </>
                            )}
                            {auth.user.role === 'player' && (
                                <li><Link to="/my-attendance" className="text-white">Моя посещаемость</Link></li>
                            )}
                            <li><Link to="/profile" className="text-white">Профиль</Link></li>
                            <li><button onClick={handleLogout} className="text-white">Выйти</button></li>
                        </>
                    ) : (
                        <>
                            <li><Link to="/login" className="text-white">Вход</Link></li>
                            <li><Link to="/register" className="text-white">Регистрация</Link></li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;