import { useState } from 'react';

export default function DashboardCard({ anime, preferEnglish, onCardClick, onUpdateProgress }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const displayTitle = preferEnglish ? (anime.titleEnglish || anime.titleRomaji) : anime.titleRomaji;
  const status = anime.status || 'WATCHLIST';
  
  // Safely determine the total watched episodes
  const currentWatched = anime.watchedEpisodes || [];
  const episodesWatched = anime.episodesWatched || currentWatched.length;

  // Determine badge styling based on status
  let badgeStyle = 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  if (status === 'WATCHING') badgeStyle = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
  if (status === 'COMPLETED' || status === 'WATCHED') badgeStyle = 'bg-sky-500/20 text-sky-400 border-sky-500/40';
  if (status === 'PLAN_TO_WATCH' || status === 'WATCHLIST') badgeStyle = 'bg-orange-500/20 text-orange-400 border-orange-500/40';

  const handleAddEpisode = async (e) => {
    e.stopPropagation(); // Prevent opening the modal
    if (isUpdating) return;
    
    setIsUpdating(true);
    
    try {
      // Find the highest episode watched so far to append the next logical episode
      const highestEp = currentWatched.length > 0 ? Math.max(...currentWatched) : 0;
      const nextEp = highestEp + 1;
      const newWatchedEpisodes = [...currentWatched, nextEp];
      
      // Auto-progress status if they were in the Watchlist
      let newStatus = status;
      if (status === 'WATCHLIST' || status === 'PLAN_TO_WATCH') {
        newStatus = 'WATCHING';
      }
      
      // Upsert the data (Spring Boot will handle the rest!)
      await onUpdateProgress({
        id: anime.id,
        titleRomaji: anime.titleRomaji,
        titleEnglish: anime.titleEnglish,
        poster: anime.poster,
        status: newStatus,
        watchedEpisodes: newWatchedEpisodes
      });
    } catch (err) {
      console.error("Failed to add episode:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div 
      onClick={onCardClick}
      className="glass-card rounded-[2rem] p-4 flex flex-col group h-full cursor-pointer relative overflow-hidden"
    >
      {/* Dynamic Status Badge */}
      <div className={`absolute top-6 right-6 z-10 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-extrabold border backdrop-blur-md shadow-lg ${badgeStyle}`}>
        {status.replace(/_/g, ' ')}
      </div>

      <div className="w-full aspect-[2/3] rounded-xl overflow-hidden relative bg-black/5">
        {anime.poster ? (
          <img 
            src={anime.poster} 
            alt={displayTitle} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="theme-text-muted flex items-center justify-center h-full">No Image</div>
        )}
      </div>

      <div className="pt-4 flex-1 flex flex-col justify-between gap-3">
        <h4 className="font-bold text-sm md:text-base theme-text line-clamp-2 leading-tight text-center px-1" title={displayTitle}>
          {displayTitle}
        </h4>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold theme-text-muted tracking-wider">Progress</span>
            <span className="text-sm font-extrabold theme-text">
              {episodesWatched} Eps
            </span>
          </div>
          
          {/* Quick Action Button: Only show if actively watching or in watchlist */}
          {(status === 'WATCHING' || status === 'PLAN_TO_WATCH' || status === 'WATCHLIST') && (
            <button 
              onClick={handleAddEpisode}
              disabled={isUpdating}
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg transition-all shadow-lg ${
                isUpdating 
                  ? 'bg-slate-500/20 text-slate-500 cursor-not-allowed' 
                  : 'bg-sky-500/10 hover:bg-sky-500 hover:text-white text-sky-500 border border-sky-500/30'
              }`}
              title="Add 1 Episode"
            >
              {isUpdating ? '...' : '+1'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}