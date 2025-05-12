import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config';

const SchedulesManagement = () => {
    const { auth } = useAuth();
    const [schedules, setSchedules] = useState([]);
    const [teams, setTeams] = useState([]);
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
            fetch(`${API_BASE_URL}/schedules`, {
                headers: { 'Authorization': `Bearer ${auth.token}` }
            })
                .then(res => {
                    if (!res.ok) throw new Error('Failed to fetch schedules');
                    return res.json();
                })
                .then(data => setSchedules(data))
                .catch(err => {
                    console.error(err);
                    toast.error('Ошибка загрузки расписания');
                });
        }
    }, [auth]);

    useEffect(() => {
        fetch(`${API_BASE_URL}/public/teams`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch teams');
                return res.json();
            })
            .then(data => {
                setTeams(data);
                if (data.length > 0) {
                    setFormData(prev => ({ ...prev, team_id: data[0].id.toString() }));
                }
            })
            .catch(err => {
                console.error(err);
                toast.error('Ошибка загрузки команд');
            });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/schedules`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.token}`
                },
                body: JSON.stringify(formData)
            });
            if (!response.ok) throw new Error('Failed to create schedule');
            const data = await response.json();
            fetch(`${API_BASE_URL}/schedules`, {
                headers: { 'Authorization': `Bearer ${auth.token}` }
            })
                .then(res => {
                    if (!res.ok) throw new Error('Failed to fetch schedules');
                    return res.json();
                })
                .then(data => setSchedules(data))
                .catch(err => {
                    console.error(err);
                    toast.error('Ошибка обновления расписания');
                });
            setFormData({
                team_id: teams.length > 0 ? teams[0].id.toString() : '',
                event_type: 'practice',
                date: '',
                time: '',
                location: '',
                description: ''
            });
            toast.success('Событие добавлено');
        } catch (error) {
            console.error(error);
            toast.error('Ошибка добавления события');
        }
    };

    const formatDateTime = (date, time) => {
        const [year, month, day] = date.split('-');
        const formattedDate = `${day}.${month}.${year}`;
        const formattedTime = time.split(':').slice(0, 2).join(':');
        return `${formattedDate} ${formattedTime}`;
    };

    const translateEventType = (eventType) => {
        return eventType === 'practice' ? 'Тренировка' : 'Игра';
    };

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Управление расписанием</h2>
            <div className="mb-4">
                <select
                    value={formData.team_id}
                    onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
                    className="border p-2 mr-2"
                >
                    {teams.length === 0 ? (
                        <option value="">Нет доступных команд</option>
                    ) : (
                        teams.map(team => (
                            <option key={team.id} value={team.id}>
                                {team.name}
                            </option>
                        ))
                    )}
                </select>
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
                        <div>{formatDateTime(schedule.date, schedule.time)}</div>
                        <div>
                            {schedule.team_name} - {translateEventType(schedule.event_type)} - {schedule.location} - {schedule.description || 'Нет описания'}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SchedulesManagement;