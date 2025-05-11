import React from 'react';

const RegistrationForm = () => {
    return (
        <div>
            <h2>Регистрация</h2>
            <form>
                <label>
                    Имя:
                    <input type="text" name="first_name" />
                </label>
                <label>
                    Фамилия:
                    <input type="text" name="last_name" />
                </label>
                <label>
                    Email:
                    <input type="email" name="email" />
                </label>
                <label>
                    Пароль:
                    <input type="password" name="password" />
                </label>
                <label>
                    Роль:
                    <select name="role">
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