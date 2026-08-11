import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Header({ onSignInClick, onViewChange, currentView, theme, setTheme }) {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Helper to close the mobile menu after clicking a navigation link
  const handleMobileNav = (view) => {
    onViewChange(view);
    setIsMobileMenuOpen(false);
  };
  
  return (
    <header className="fixed top-0 left-0 w-full p-4 md:px-8 md:py-5 z-50 flex justify-between items-center theme-nav backdrop-blur-md transition-colors">
      
      {/* LOGO */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => onViewChange(user ? 'explore' : 'landing')}>
        <div className="w-10 h-10 rounded-xl bg-sky-500/10 border-2 border-sky-500 flex items-center justify-center">
            <div className="w-4 h-4 rounded-sm bg-sky-500"></div>
        </div>
        <span className="text-2xl font-bold tracking-tight theme-text">AniTracker</span>
      </div>
      
      <div className="flex items-center gap-3 md:gap-5">
        
        {/* ========================================= */}
        {/* DESKTOP NAVIGATION (Hidden on Mobile) */}
        {/* ========================================= */}
        
        <select 
          value={theme} 
          onChange={(e) => setTheme(e.target.value)}
          className="hidden md:block structural-btn px-5 py-2 rounded-full text-sm font-semibold cursor-pointer appearance-none pr-8"
          style={{
            backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%230ea5e9%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right .8rem top 50%',
            backgroundSize: '.65rem auto'
          }}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="midnight">Midnight</option>
          <option value="lava">Lava</option>
          <option value="matrix">Matrix</option>
        </select>

        {user ? (
          <div className="hidden md:flex items-center gap-3 md:gap-4">
            <button onClick={() => onViewChange('explore')} className={`font-semibold tracking-wide px-4 py-2 rounded-full transition-colors ${currentView === 'explore' ? 'text-sky-500 bg-sky-500/10' : 'theme-text-muted hover:theme-text'}`}>
              Explore
            </button>
            <button onClick={() => onViewChange('dashboard')} className={`font-semibold tracking-wide px-4 py-2 rounded-full transition-colors ${currentView === 'dashboard' ? 'text-sky-500 bg-sky-500/10' : 'theme-text-muted hover:theme-text'}`}>
              Dashboard
            </button>
            <div className="w-px h-6 bg-slate-400/20 mx-2"></div>
            <span className="text-sm font-medium theme-text-muted">Hi, <span className="text-sky-500">{user.userName}</span></span>
            <button onClick={() => { logout(); onViewChange('landing'); }} className="text-sm font-semibold theme-text-muted hover:text-red-500">Logout</button>
          </div>
        ) : (
          <button onClick={onSignInClick} className="hidden md:block structural-btn px-6 py-2 rounded-full text-sm font-semibold tracking-wide">
            Sign In
          </button>
        )}

        {/* ========================================= */}
        {/* MOBILE KEBAB MENU (Hidden on Desktop) */}
        {/* ========================================= */}
        
        <div className="md:hidden relative">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${isMobileMenuOpen ? 'bg-sky-500/10 text-sky-500' : 'theme-text-muted hover:theme-text'}`}
          >
            {/* 3-dots vertical icon */}
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>

          {isMobileMenuOpen && (
            <div 
              className="absolute top-full right-0 mt-3 p-5 rounded-2xl w-60 z-[100] flex flex-col shadow-2xl border border-black/10 dark:border-white/10 origin-top-right animate-in fade-in scale-95 duration-200"
              style={{ 
                background: 'var(--nav-bg)', 
                backdropFilter: 'blur(20px)', 
                WebkitBackdropFilter: 'blur(20px)' 
              }}
            >
              {/* TOP HEADER SECTION */}
              <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-3 mb-3">
                {user ? (
                  <span className="text-sm font-semibold theme-text-muted uppercase tracking-wider">Hi, <span className="text-sky-500 font-bold">{user.userName}</span></span>
                ) : (
                  <h4 className="font-bold theme-text">Menu</h4>
                )}
                <button onClick={() => setIsMobileMenuOpen(false)} className="theme-text-muted hover:text-red-500">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {user ? (
                <>
                  {/* NAVIGATION PAGES */}
                  <div className="flex flex-col gap-1 pb-3">
                    <button onClick={() => handleMobileNav('explore')} className={`text-left px-3 py-2 rounded-lg font-bold text-sm transition-colors ${currentView === 'explore' ? 'bg-sky-500/10 text-sky-500' : 'theme-text hover:bg-black/5 dark:hover:bg-white/5'}`}>Explore</button>
                    <button onClick={() => handleMobileNav('dashboard')} className={`text-left px-3 py-2 rounded-lg font-bold text-sm transition-colors ${currentView === 'dashboard' ? 'bg-sky-500/10 text-sky-500' : 'theme-text hover:bg-black/5 dark:hover:bg-white/5'}`}>Dashboard</button>
                  </div>

                  {/* THEME SELECTOR */}
                  <div className="border-t border-black/10 dark:border-white/10 py-3 flex flex-col gap-2">
                    <label className="text-xs font-semibold theme-text-muted uppercase tracking-wider">Theme</label>
                    <select 
                      value={theme} 
                      onChange={(e) => setTheme(e.target.value)}
                      className="structural-input px-3 py-2.5 rounded-xl text-sm outline-none font-medium appearance-none"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="midnight">Midnight</option>
                      <option value="lava">Lava</option>
                      <option value="matrix">Matrix</option>
                    </select>
                  </div>

                  {/* LOGOUT BUTTON */}
                  <div className="border-t border-black/10 dark:border-white/10 pt-3 flex flex-col gap-2">
                    <button onClick={() => { logout(); handleMobileNav('landing'); }} className="text-left px-3 py-2 rounded-lg font-bold text-sm text-red-500 hover:bg-red-500/10 transition-colors">Logout</button>
                  </div>
                </>
              ) : (
                <>
                  {/* THEME SELECTOR (Logged out) */}
                  <div className="flex flex-col gap-2 pb-3">
                    <label className="text-xs font-semibold theme-text-muted uppercase tracking-wider">Theme</label>
                    <select 
                      value={theme} 
                      onChange={(e) => setTheme(e.target.value)}
                      className="structural-input px-3 py-2.5 rounded-xl text-sm outline-none font-medium appearance-none"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="midnight">Midnight</option>
                      <option value="lava">Lava</option>
                      <option value="matrix">Matrix</option>
                    </select>
                  </div>

                  {/* SIGN IN BUTTON (Logged out) */}
                  <div className="border-t border-black/10 dark:border-white/10 pt-3 flex flex-col gap-2">
                    <button onClick={() => { onSignInClick(); setIsMobileMenuOpen(false); }} className="cta-btn py-3 rounded-xl font-bold text-sm shadow-md w-full">Sign In</button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

      </div>
    </header>
  );
}