import { useState } from 'react';

export default function DashboardCard({ anime, preferEnglish, onCardClick, onUpdateProgress, onRemove }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const displayTitle = preferEnglish ? (anime.titleEnglish || anime.titleRomaji) : anime.titleRomaji;
  const status = anime.status || 'WATCHLIST';
  
  // Safely determine the watched episodes array
  const currentWatched = anime.watchedEpisodes || [];
  
  // THE FIX: Base progress on the highest episode watched, not the count!
  const highestEp = currentWatched.length > 0 ? Math.max(...currentWatched) : 0;

  // Enforce the cap and check if maxed out based on highest episode
  const totalEps = anime.totalEpisodes || 0;
  const isMaxedOut = totalEps > 0 && highestEp >= totalEps;

  // Determine badge styling based on status
  let badgeStyle = 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  if (status === 'WATCHING') badgeStyle = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
  if (status === 'COMPLETED' || status === 'WATCHED') badgeStyle = 'bg-sky-500/20 text-sky-400 border-sky-500/40';
  if (status === 'PLAN_TO_WATCH' || status === 'WATCHLIST') badgeStyle = 'bg-orange-500/20 text-orange-400 border-orange-500/40';

  const handleAddEpisode = async (e) => {
    e.stopPropagation(); // Prevent opening the modal
    if (isUpdating || isMaxedOut) return;
    
    setIsUpdating(true);
    
    try {
      // We already calculated highestEp above, just add 1!
      const nextEp = highestEp + 1;
      const newWatchedEpisodes = [...currentWatched, nextEp];
      
      // Auto-progress status if they were in the Watchlist, OR complete it if they hit the max!
      let newStatus = status;
      if (totalEps > 0 && nextEp >= totalEps) {
        newStatus = 'WATCHED';
      } else if (status === 'WATCHLIST' || status === 'PLAN_TO_WATCH') {
        newStatus = 'WATCHING';
      }
      
      // Upsert the data (Spring Boot will handle the rest!)
      await onUpdateProgress({
        id: anime.id,
        titleRomaji: anime.titleRomaji,
        titleEnglish: anime.titleEnglish,
        poster: anime.poster,
        status: newStatus,
        watchedEpisodes: newWatchedEpisodes,
        totalEpisodes: totalEps
      });
    } catch (err) {
      console.error("Failed to add episode:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveClick = async (e) => {
    e.stopPropagation(); // Prevent opening the modal
    if (isUpdating || isRemoving) return;
    
    setIsRemoving(true);
    try {
      await onRemove(anime.id);
    } catch (err) {
      console.error("Failed to remove anime:", err);
      setIsRemoving(false);
    }
  };

  return (
    <div 
      onClick={onCardClick}
      className="glass-card rounded-[2rem] p-4 flex flex-col group h-full cursor-pointer relative overflow-hidden"
    >
      {/* Quick Remove Button */}
      <button
        onClick={handleRemoveClick}
        disabled={isRemoving}
        className="absolute top-6 left-6 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-red-500 text-white/70 hover:text-white flex items-center justify-center backdrop-blur-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all shadow-lg border border-white/10 hover:border-red-400"
        title="Remove from Dashboard"
      >
        {isRemoving ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        )}
      </button>

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
              {highestEp} {totalEps > 0 ? `/ ${totalEps}` : 'Eps'}
            </span>
          </div>
          
          {/* Quick Action Button: Only show if actively watching or in watchlist, AND not maxed out */}
          {(status === 'WATCHING' || status === 'PLAN_TO_WATCH' || status === 'WATCHLIST') && !isMaxedOut && (
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