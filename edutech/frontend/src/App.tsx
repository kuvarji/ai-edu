import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { useStore } from './store/useStore';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import ClassroomPage from './pages/ClassroomPage';
import QuizPage from './pages/QuizPage';
import LeaderboardPage from './pages/LeaderboardPage';
import CharacterStorePage from './pages/CharacterStorePage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import ParentDashboard from './pages/ParentDashboard';

function App() {
  const initializeAuth = useStore((s) => s.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <Routes>
          <Route path="/" element={<><LandingPage /><Footer /></>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/courses" element={<><CoursesPage /><Footer /></>} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/classroom/:courseId/:chapterId" element={<ClassroomPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/leaderboard" element={<><LeaderboardPage /><Footer /></>} />
          <Route path="/store" element={<><CharacterStorePage /><Footer /></>} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/parent" element={<ParentDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App
