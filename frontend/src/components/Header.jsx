import { useAuth } from '../context/AuthContext';


export default function Header({ onSignInClick, onViewChange, currentView, theme, setTheme }) {
  const { user, logout } = useAuth();
  
  return (
    <header className="fixed top-0 left-0 w-full p-4 md:px-8 md:py-5 z-50 flex justify-between items-center theme-nav backdrop-blur-md transition-colors">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => onViewChange(user ? 'explore' : 'landing')}>
        <div className="w-10 h-10 rounded-xl bg-sky-500/10 border-2 border-sky-500 flex items-center justify-center">
            <div className="w-4 h-4 rounded-sm bg-sky-500"></div>
        </div>
        <span className="text-2xl font-bold tracking-tight theme-text">AniTracker</span>
      </div>
      
      <div className="flex items-center gap-3 md:gap-5">
        <select 
          value={theme} 
          onChange={(e) => setTheme(e.target.value)}
          className="structural-btn px-5 py-2 rounded-full text-sm font-semibold cursor-pointer appearance-none pr-8"
          style={{
            backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%230ea5e9%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right .8rem top 50%',
            backgroundSize: '.65rem auto'
          }}
        >
          <option value="light">Light Theme</option>
          <option value="dark">Dark Theme</option>
          <option value="midnight">Midnight</option>
          <option value="lava">Lava</option>
          <option value="matrix">Matrix</option>
        </select>

        {user ? (
          <>
            <button onClick={() => onViewChange('explore')} className={`hidden md:block font-semibold tracking-wide px-4 py-2 rounded-full transition-colors ${currentView === 'explore' ? 'text-sky-500 bg-sky-500/10' : 'theme-text-muted hover:theme-text'}`}>
              Explore
            </button>
            <button onClick={() => onViewChange('dashboard')} className={`hidden md:block font-semibold tracking-wide px-4 py-2 rounded-full transition-colors ${currentView === 'dashboard' ? 'text-sky-500 bg-sky-500/10' : 'theme-text-muted hover:theme-text'}`}>
              Dashboard
            </button>
            <div className="hidden md:block w-px h-6 bg-slate-400/20 mx-2"></div>
            <span className="text-sm font-medium theme-text-muted hidden sm:block">Hi, <span className="text-sky-500">{user.userName}</span></span>
            <button onClick={() => { logout(); onViewChange('landing'); }} className="text-sm font-semibold theme-text-muted hover:text-red-500">Logout</button>
          </>
        ) : (
          <button onClick={onSignInClick} className="structural-btn px-6 py-2 rounded-full text-sm font-semibold tracking-wide">
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
