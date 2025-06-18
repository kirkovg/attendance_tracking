import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Attendance from './pages/Attendance';
import History from './pages/History';
import Sessions from './pages/Sessions';
import Statistics from './pages/Statistics';

function App() {
    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/history" element={<History />} />
                <Route path="/sessions" element={<Sessions />} />
                <Route path="/statistics" element={<Statistics />} />
            </Routes>
        </>
    );
}

export default App;
