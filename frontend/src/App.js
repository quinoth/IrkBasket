import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RegistrationForm from './components/RegistrationForm';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/register" element={<RegistrationForm />} />
            </Routes>
        </Router>
    );
}

export default App;