import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav className="bg-blue-500 p-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link to="/" className="text-white text-xl font-bold">Баскетбольный клуб</Link>
                <div className="space-x-4">
                    {user ? (
                        <>
                            <Link to="/profile" className="text-white hover:underline">Профиль</Link>
                            <button
                                onClick={logout}
                                className="text-white hover:underline"
                            >
                                Выйти
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-white hover:underline">Вход</Link>
                            <Link to="/register" className="text-white hover:underline">Регистрация</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;