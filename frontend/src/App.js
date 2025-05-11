import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RegistrationForm from './components/RegistrationForm';
import LoginForm from './components/LoginForm';
import Profile from './components/Profile';
import { AuthProvider } from './context/AuthContext';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/register" element={<RegistrationForm />} />
                    <Route path="/login" element={<LoginForm />} />
					<Route path="/profile" element={<Profile />} />
                    <Route path="/" element={<div className="text-center mt-10">Главная страница</div>} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;