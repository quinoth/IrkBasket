import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config';

const AttendanceRecording = () => {
    const { auth } = useAuth();
    const [schedules, setSchedules] = useState([]);
    const [selectedSchedule, setSelectedSchedule] = useState('');
    const [players, setPlayers] = useState([]);
    const [attendees, setAttendees] = useState([]);

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

    const handleScheduleChange = async (e) => {
        const scheduleId = e.target.value;
        setSelectedSchedule(scheduleId);
        if (scheduleId) {
            const schedule = schedules.find(s => s.id === parseInt(scheduleId));
            if (schedule) {
                try {
                    const res = await fetch(`${API_BASE_URL}/users?team_id=${schedule.team_id}`, {
                        headers: { 'Authorization': `Bearer ${auth.token}` }
                    });
                    if (!res.ok) throw new Error('Failed to fetch players');
                    const data = await res.json();
                    setPlayers(data);
                } catch (err) {
                    console.error(err);
                    toast.error('Ошибка загрузки игроков');
                }
            }
        }
    };

    const handleSubmit = async () => {
        if (!selectedSchedule) {
            toast.error('Выберите событие');
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/schedules/${selectedSchedule}/attendance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.token}`
                },
                body: JSON.stringify({ attendees })
            });
            if (!res.ok) throw new Error('Failed to record attendance');
            setAttendees([]);
            setSelectedSchedule('');
            toast.success('Посещаемость записана');
        } catch (error) {
            console.error(error);
            toast.error('Ошибка записи посещаемости');
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
            <h2 className="text-2xl font-bold mb-4">Запись посещаемости</h2>
            <select onChange={handleScheduleChange} value={selectedSchedule} className="border p-2 mb-4">
                <option value="">Выберите событие</option>
                {schedules.map(schedule => (
                    <option key={schedule.id} value={schedule.id}>
                        {schedule.team_name} - ({translateEventType(schedule.event_type)}) - {formatDateTime(schedule.date, schedule.time)}
                    </option>
                ))}
            </select>
            {players.length > 0 && (
                <div>
                    {players.map(player => (
                        <div key={player.id}>
                            <input
                                type="checkbox"
                                checked={attendees.includes(player.id)}
                                onChange={() => {
                                    if (attendees.includes(player.id)) {
                                        setAttendees(attendees.filter(id => id !== player.id));
                                    } else {
                                        setAttendees([...attendees, player.id]);
                                    }
                                }}
                            />
                            {player.first_name} {player.last_name}
                        </div>
                    ))}
                    <button onClick={handleSubmit} className="bg-blue-500 text-white p-2 rounded mt-4">Сохранить</button>
                </div>
            )}
        </div>
    );
};

export default AttendanceRecording;