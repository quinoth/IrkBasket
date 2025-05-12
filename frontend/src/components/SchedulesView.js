import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';

const SchedulesView = () => {
    const { auth } = useAuth();
    const [schedules, setSchedules] = useState([]);

    useEffect(() => {
        if (auth.user) {
            fetch('/schedules', {
                headers: { 'Authorization': `Bearer ${auth.token}` }
            })
                .then(res => res.json())
                .then(data => setSchedules(data))
                .catch(err => console.error(err));
        }
    }, [auth]);

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Расписание</h2>
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

export default SchedulesView;