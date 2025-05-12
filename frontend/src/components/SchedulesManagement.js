import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';

const SchedulesManagement = () => {
    const { auth } = useAuth();
    const [schedules, setSchedules] = useState([]);
    const [formData, setFormData] = useState({
        team_id: '',
        event_type: 'practice',
        date: '',
        time: '',
        location: '',
        description: ''
    });

    useEffect(() => {
        if (auth.user && auth.user.role === 'trainer') {
            fetch('/schedules', {
                headers: { 'Authorization': `Bearer ${auth.token}` }
            })
                .then(res => res.json())
                .then(data => setSchedules(data))
                .catch(err => console.error(err));
        }
    }, [auth]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/schedules', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.token}`
                },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                const data = await response.json();
                setSchedules([...schedules, { id: data.id, ...formData }]);
                setFormData({
                    team_id: '',
                    event_type: 'practice',
                    date: '',
                    time: '',
                    location: '',
                    description: ''
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Управление расписанием</h2>
            <div className="mb-4">
                <input
                    type="number"
                    placeholder="ID команды"
                    value={formData.team_id}
                    onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
                    className="border p-2 mr-2"
                />
                <select
                    value={formData.event_type}
                    onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                    className="border p-2 mr-2"
                >
                    <option value="practice">Тренировка</option>
                    <option value="game">Игра</option>
                </select>
                <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="border p-2 mr-2"
                />
                <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="border p-2 mr-2"
                />
                <input
                    type="text"
                    placeholder="Место"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="border p-2 mr-2"
                />
                <input
                    type="text"
                    placeholder="Описание"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="border p-2 mr-2"
                />
                <button onClick={handleSubmit} className="bg-blue-500 text-white p-2 rounded">Добавить</button>
            </div>
            <ul>
                {schedules.map(schedule => (
                    <li key={schedule.id} className="border-b py-2">
                        {schedule.event_type} - {schedule.date} {schedule.time} ({schedule.location})
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SchedulesManagement;