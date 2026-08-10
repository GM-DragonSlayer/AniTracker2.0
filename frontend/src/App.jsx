import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import ExplorePage from './pages/ExplorePage';
import DashboardPage from './pages/DashboardPage';
import AuthModal from './components/AuthModal';

function AppLayout() {
  const { user, isAuthLoading } = useAuth();
  const [showModal, setShowModal] = useState(false);
  
  // THE FIX: Remember the user's last view using localStorage so a refresh doesn't reset it!
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('animetracker_view') || 'landing';
  }); 
  
  const [theme, setTheme] = useState('light'); 

  // Save the view whenever they navigate between Explore/Dashboard
  useEffect(() => {
    localStorage.setItem('animetracker_view', currentView);
  }, [currentView]);

  useEffect(() => {
    // ONLY redirect if we are completely finished checking the cookie
    if (!isAuthLoading) {
      if (!user && currentView === 'dashboard') setCurrentView('landing');
      if (user && currentView === 'landing') setCurrentView('explore');
    }
  }, [user, currentView, isAuthLoading]);

  // Show a sleek full-screen loader while checking the cookie on refresh
  if (isAuthLoading) {
    return (
      <div className={`theme-${theme} theme-bg relative min-h-screen flex items-center justify-center`}>
         <div className="w-12 h-12 border-4 theme-spinner rounded-full animate-spin z-10 relative"></div>
         <div className="absolute inset-0 bg-grid pointer-events-none z-0"></div>
      </div>
    );
  }

  return (
    <div className={`theme-${theme} theme-bg theme-transition relative min-h-screen flex flex-col overflow-x-hidden font-sans pt-24`}>
      <div className="fixed inset-0 bg-grid pointer-events-none z-0"></div>
      
      <Header 
        onSignInClick={() => setShowModal(true)} 
        onViewChange={setCurrentView}
        currentView={currentView}
        theme={theme}
        setTheme={setTheme}
      />

      {currentView === 'landing' && (
        <LandingPage onStartTrackingClick={() => {
          if (user) setCurrentView('explore');
          else setShowModal(true);
        }} />
      )}

      {currentView === 'explore' && <ExplorePage />}

      {currentView === 'dashboard' && <DashboardPage />}

      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
}