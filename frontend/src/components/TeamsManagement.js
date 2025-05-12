import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';

const TeamsManagement = () => {
    const { auth } = useAuth();
    const [teams, setTeams] = useState([]);
    const [formData, setFormData] = useState({ name: '', description: '' });

    useEffect(() => {
        if (auth.user && auth.user.role === 'trainer') {
            fetch('/teams', {
                headers: { 'Authorization': `Bearer ${auth.token}` }
            })
                .then(res => res.json())
                .then(data => setTeams(data))
                .catch(err => console.error(err));
        }
    }, [auth]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/teams', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.token}`
                },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                const data = await response.json();
                setTeams([...teams, { id: data.id, ...formData }]);
                setFormData({ name: '', description: '' });
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Управление командами</h2>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Название команды"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                {teams.map(team => (
                    <li key={team.id} className="border-b py-2">{team.name} - {team.description}</li>
                ))}
            </ul>
        </div>
    );
};

export default TeamsManagement;