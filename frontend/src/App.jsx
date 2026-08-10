import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import ExplorePage from './pages/ExplorePage';
import DashboardPage from './pages/DashboardPage';
import AuthModal from './components/AuthModal';

function AppLayout() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [currentView, setCurrentView] = useState('landing'); 
  const [theme, setTheme] = useState('light'); 

  useEffect(() => {
    if (!user && currentView === 'dashboard') setCurrentView('landing');
    
    if (user && currentView === 'landing') setCurrentView('explore');
  }, [user, currentView]);

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