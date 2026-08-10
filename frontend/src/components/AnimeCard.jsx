import { useState, useEffect } from 'react';

export default function AnimeCard({ anime, onAdd, onRemove, user, preferEnglish, onCardClick }) {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (user && user.animeList) {
      const foundAnime = user.animeList.some(a => a.id === anime.id);
      const matchedItem = user.animeList.find(a => a.id === anime.id);
      
      setAdded(foundAnime);
      if (matchedItem) {
        const st = (matchedItem.status || '').toLowerCase();
        setIsWatched(st === 'watched' || st === 'completed');
        setIsWatching(st === 'watching' || st === 'in_progress');
      } else {
        setIsWatched(false);
        setIsWatching(false);
      }
    } else {
      setAdded(false);
      setIsWatched(false);
      setIsWatching(false);
    }
  }, [user, anime.id]);

  const handleAction = async (e) => {
    e.stopPropagation(); // Prevents card click from triggering modal when clicking button
    if (!user) {
      setErrorMsg("Sign in required");
      setTimeout(() => setErrorMsg(""), 3000);
      return;
    }
    setLoading(true);
    try {
      if (added) {
        await onRemove(anime.id);
        setAdded(false);
        setIsWatched(false);
      } else {
        await onAdd(anime);
        setAdded(true);
      }
    } catch (err) {
      console.error("🔥 COMPONENT CAUGHT ERROR:", err);
      setErrorMsg(added ? "Failed to remove" : "Failed to add");
      setTimeout(() => setErrorMsg(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const displayTitle = preferEnglish ? anime.titleEnglish : anime.titleRomaji;

  return (
    <div 
      onClick={onCardClick}
      className="glass-card rounded-[2rem] p-4 flex flex-col group h-full cursor-pointer"
    >
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

      <div className="pt-4 flex-1 flex flex-col justify-between gap-3 md:gap-4">
        <h4 className="font-bold text-sm md:text-[1.1rem] theme-text line-clamp-2 leading-tight text-center px-1" title={displayTitle}>
          {displayTitle}
        </h4>
        
        <div onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={handleAction}
            disabled={loading}
            className={`w-full py-2 md:py-3 text-xs md:text-base rounded-xl font-bold transition-all relative overflow-hidden ${
              errorMsg ? 'bg-red-500/10 text-red-500 border border-red-500/30' :
              added ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/40 group/btn' : 'cta-btn'
            }`}
          >
            {errorMsg ? errorMsg : loading ? (added ? 'Removing...' : 'Adding...') : (
              added ? (
                isWatched ? (
                  <>
                    <span className="group-hover/btn:hidden">Watched</span>
                    <span className="hidden group-hover/btn:inline">Remove?</span>
                  </>
                ) : isWatching ? (
                  <>
                    <span className="group-hover/btn:hidden">Watching</span>
                    <span className="hidden group-hover/btn:inline">Remove?</span>
                  </>
                ) : (
                  <>
                    <span className="group-hover/btn:hidden">In Watchlist</span>
                    <span className="hidden group-hover/btn:inline">Remove?</span>
                  </>
                )
              ) : 'Add'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}