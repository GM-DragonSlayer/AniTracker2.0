import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardCard from '../components/DashboardCard';
import AnimeDetailsModal from '../components/AnimeDetailsModal';

export default function DashboardPage() {
  const { user, addAnime, removeAnime } = useAuth();
  
  const [filter, setFilter] = useState('ALL');
  const [selectedAnimeId, setSelectedAnimeId] = useState(null);
  const [preferEnglish, setPreferEnglish] = useState(false);

  // Fallback for unauthenticated access
  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <h2 className="text-2xl font-bold theme-text">Please sign in to view your dashboard.</h2>
      </div>
    );
  }

  const animeList = user.animeList || [];
  
  // Calculate Stats
  const totalAnime = animeList.length;
  const totalEpisodes = animeList.reduce((acc, anime) => acc + (anime.watchedEpisodes ? anime.watchedEpisodes.length : (anime.episodesWatched || 0)), 0);
  const watchingCount = animeList.filter(a => a.status === 'WATCHING').length;

  // Filter the list based on segmented control
  const filteredList = animeList.filter(anime => {
    if (filter === 'ALL') return true;
    if (filter === 'WATCHLIST') return anime.status === 'WATCHLIST' || anime.status === 'PLAN_TO_WATCH';
    if (filter === 'WATCHED') return anime.status === 'WATCHED' || anime.status === 'COMPLETED';
    return anime.status === filter;
  });

  return (
    <main className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-8 pb-24 relative z-10 flex-1 flex flex-col animate-in fade-in duration-300">
      
      {/* === 1. THE STATS HEADER === */}
      <div className="glass-card rounded-[2.5rem] p-8 md:p-12 mb-10 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl border border-white/10 relative overflow-hidden">
        {/* Subtle background glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 blur-[80px] rounded-full pointer-events-none"></div>
        
        <div className="text-center md:text-left flex-1 z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold theme-text tracking-tight mb-3">Your Command Center</h2>
          <p className="text-base md:text-lg theme-text-muted font-medium">Track your progress and pick up right where you left off.</p>
        </div>
        
        <div className="flex flex-wrap justify-center md:justify-end gap-4 md:gap-6 flex-1 z-10">
          <div className="flex flex-col items-center bg-black/5 dark:bg-white/5 rounded-3xl p-5 min-w-[110px] border border-black/5 dark:border-white/5 shadow-inner">
            <span className="text-3xl md:text-4xl font-black text-sky-500">{totalAnime}</span>
            <span className="text-[10px] md:text-xs uppercase font-bold theme-text-muted mt-2 tracking-widest text-center">Total<br/>Anime</span>
          </div>
          <div className="flex flex-col items-center bg-black/5 dark:bg-white/5 rounded-3xl p-5 min-w-[110px] border border-black/5 dark:border-white/5 shadow-inner">
            <span className="text-3xl md:text-4xl font-black text-orange-500">{totalEpisodes}</span>
            <span className="text-[10px] md:text-xs uppercase font-bold theme-text-muted mt-2 tracking-widest text-center">Eps<br/>Watched</span>
          </div>
          <div className="flex flex-col items-center bg-black/5 dark:bg-white/5 rounded-3xl p-5 min-w-[110px] border border-black/5 dark:border-white/5 shadow-inner">
            <span className="text-3xl md:text-4xl font-black text-emerald-500">{watchingCount}</span>
            <span className="text-[10px] md:text-xs uppercase font-bold theme-text-muted mt-2 tracking-widest text-center">Currently<br/>Watching</span>
          </div>
        </div>
      </div>

      {/* === 2. STATUS FILTER & TOGGLES === */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-8">
        
        <div className="flex bg-black/5 dark:bg-white/5 p-1.5 rounded-2xl border border-black/5 dark:border-white/5 shadow-inner overflow-x-auto max-w-full custom-scrollbar">
          {['ALL', 'WATCHING', 'WATCHLIST', 'WATCHED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                filter === f ? 'bg-white dark:bg-slate-800 text-sky-500 shadow-md' : 'theme-text-muted hover:theme-text'
              }`}
            >
              {f.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-black/5 dark:border-white/5 shadow-inner">
           <button onClick={() => setPreferEnglish(false)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${!preferEnglish ? 'bg-sky-500 text-white shadow-md' : 'theme-text-muted hover:theme-text'}`}>JP</button>
           <button onClick={() => setPreferEnglish(true)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${preferEnglish ? 'bg-sky-500 text-white shadow-md' : 'theme-text-muted hover:theme-text'}`}>EN</button>
        </div>
      </div>

      {/* === 3. PERSONAL GRID === */}
      {filteredList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-60 flex-1">
          <div className="w-24 h-24 bg-slate-500/20 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 theme-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <h3 className="text-xl font-bold theme-text">No anime found here.</h3>
          <p className="theme-text-muted mt-2 font-medium">Time to explore and add some!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8">
          {filteredList.map(anime => (
            <DashboardCard 
              key={anime.id} 
              anime={anime} 
              preferEnglish={preferEnglish}
              onCardClick={() => setSelectedAnimeId(anime.id)}
              onUpdateProgress={addAnime} /* Passed directly to handle +1 updates! */
              onRemove={removeAnime}
            />
          ))}
        </div>
      )}

      {/* === 4. REUSED DETAILS MODAL === */}
      {selectedAnimeId && (
        <AnimeDetailsModal 
          animeId={selectedAnimeId} 
          onClose={() => setSelectedAnimeId(null)} 
          preferEnglish={preferEnglish} 
        />
      )}

    </main>
  );
}