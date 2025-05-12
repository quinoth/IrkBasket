import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config';

const SchedulesView = () => {
    const { auth } = useAuth();
    const [schedules, setSchedules] = useState([]);

    useEffect(() => {
        if (auth.user) {
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
            <h2 className="text-2xl font-bold mb-4">Расписание</h2>
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

export default SchedulesView;