import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';

const AttendanceRecording = () => {
    const { auth } = useAuth();
    const [schedules, setSchedules] = useState([]);
    const [selectedSchedule, setSelectedSchedule] = useState('');
    const [players, setPlayers] = useState([]);
    const [attendees, setAttendees] = useState([]);

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

    const handleScheduleChange = async (e) => {
        const scheduleId = e.target.value;
        setSelectedSchedule(scheduleId);
        if (scheduleId) {
            const schedule = schedules.find(s => s.id === parseInt(scheduleId));
            if (schedule) {
                const conn = await fetch(`/users?team_id=${schedule.team_id}`, {
                    headers: { 'Authorization': `Bearer ${auth.token}` }
                });
                const data = await conn.json();
                setPlayers(data);
            }
        }
    };

    const handleSubmit = async () => {
        try {
            await fetch(`/schedules/${selectedSchedule}/attendance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.token}`
                },
                body: JSON.stringify({ attendees })
            });
            setAttendees([]);
            setSelectedSchedule('');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Запись посещаемости</h2>
            <select onChange={handleScheduleChange} value={selectedSchedule} className="border p-2 mb-4">
                <option value="">Выберите событие</option>
                {schedules.map(schedule => (
                    <option key={schedule.id} value={schedule.id}>{schedule.event_type} - {schedule.date}</option>
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