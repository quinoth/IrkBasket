import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';

const AttendanceView = () => {
    const { auth } = useAuth();
    const [attendance, setAttendance] = useState([]);

    useEffect(() => {
        if (auth.user) {
            fetch('http://localhost:5000/attendance', {
                headers: { 'Authorization': `Bearer ${auth.token}` }
            })
                .then(res => res.json())
                .then(data => setAttendance(data))
                .catch(err => console.error(err));
        }
    }, [auth]);

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Моя посещаемость</h2>
            <ul>
                {attendance.map(record => (
                    <li key={record.schedule_id} className="border-b py-2">
                        {record.event_type} - {record.date} {record.time} ({record.location})
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AttendanceView;