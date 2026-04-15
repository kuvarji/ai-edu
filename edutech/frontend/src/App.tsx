import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { useStore } from './store/useStore';
import RouteGuard from './components/RouteGuard';
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
  const darkMode = useStore((s) => s.darkMode);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Apply dark class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('app_darkMode', darkMode ? 'true' : 'false');
  }, [darkMode]);

  return (
    <Router>
      <div className="min-h-screen bg-theme-page transition-colors duration-300">
        <Navbar />
        <Routes>
          <Route path="/" element={<><LandingPage /><Footer /></>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<RouteGuard><DashboardPage /></RouteGuard>} />
          <Route path="/courses" element={<><CoursesPage /><Footer /></>} />
          <Route path="/courses/:id" element={<RouteGuard><CourseDetailPage /></RouteGuard>} />
          <Route path="/classroom/:courseId/:chapterId" element={<RouteGuard><ClassroomPage /></RouteGuard>} />
          <Route path="/quiz" element={<RouteGuard><QuizPage /></RouteGuard>} />
          <Route path="/leaderboard" element={<><LeaderboardPage /><Footer /></>} />
          <Route path="/store" element={<RouteGuard><CharacterStorePage /><Footer /></RouteGuard>} />
          <Route path="/profile" element={<RouteGuard><ProfilePage /></RouteGuard>} />
          <Route path="/admin" element={<RouteGuard requiredRole="admin"><AdminDashboard /></RouteGuard>} />
          <Route path="/parent" element={<RouteGuard requiredRole="parent"><ParentDashboard /></RouteGuard>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App
