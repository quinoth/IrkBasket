import React from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Navbar from './components/Navbar';
import RegistrationForm from './components/RegistrationForm';
import LoginForm from './components/LoginForm';
import Profile from './components/Profile';
import TeamsManagement from './components/TeamsManagement';
import SchedulesManagement from './components/SchedulesManagement';
import AttendanceRecording from './components/AttendanceRecording';
import SchedulesView from './components/SchedulesView';
import AttendanceView from './components/AttendanceView';
import ProtectedRoute from './ProtectedRoute';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Navbar />
                <Routes>
                    <Route path="/register" element={<RegistrationForm />} />
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/teams" element={
                        <ProtectedRoute allowedRoles={['trainer']}>
                            <TeamsManagement />
                        </ProtectedRoute>
                    } />
                    <Route path="/schedules-management" element={
                        <ProtectedRoute allowedRoles={['trainer']}>
                            <SchedulesManagement />
                        </ProtectedRoute>
                    } />
                    <Route path="/attendance-recording" element={
                        <ProtectedRoute allowedRoles={['trainer']}>
                            <AttendanceRecording />
                        </ProtectedRoute>
                    } />
                    <Route path="/schedules" element={<SchedulesView />} />
                    <Route path="/my-attendance" element={<AttendanceView />} />
                    <Route path="/" element={<div>Главная страница</div>} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;