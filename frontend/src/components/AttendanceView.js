import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config';

const AttendanceView = () => {
    const { auth } = useAuth();
    const [attendance, setAttendance] = useState([]);

    useEffect(() => {
        if (auth.user) {
            fetch(`${API_BASE_URL}/attendance`, {
                headers: { 'Authorization': `Bearer ${auth.token}` }
            })
                .then(res => {
                    if (!res.ok) throw new Error('Failed to fetch attendance');
                    return res.json();
                })
                .then(data => setAttendance(data))
                .catch(err => {
                    console.error(err);
                    toast.error('Ошибка загрузки посещаемости');
                });
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