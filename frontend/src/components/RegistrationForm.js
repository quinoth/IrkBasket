import React, { useState } from 'react';

const RegistrationForm = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        role: 'player'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div>
            <h2>Регистрация</h2>
            <form>
                <label>
                    Имя:
                    <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                    />
                </label>
                <label>
                    Фамилия:
                    <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                    />
                </label>
                <label>
                    Email:
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </label>
                <label>
                    Пароль:
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                </label>
                <label>
                    Роль:
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                    >
                        <option value="player">Игрок</option>
                        <option value="trainer">Тренер</option>
                    </select>
                </label>
                <button type="submit">Зарегистрироваться</button>
            </form>
        </div>
    );
};

export default RegistrationForm;