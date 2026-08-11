import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AnimeDetailsModal({ animeId, onClose, preferEnglish }) {
  const { user, addAnime } = useAuth();
  
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('WATCHLIST');
  const [watchedEpisodes, setWatchedEpisodes] = useState(new Set());
  const [currentOffset, setCurrentOffset] = useState(0);
  const [paginatedEpisodes, setPaginatedEpisodes] = useState([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const data = await api.getAnimeDetails(animeId);
        setDetails(data);
        setPaginatedEpisodes(data.episodes);
        
        if (user && user.animeList) {
          const matched = user.animeList.find(a => a.id === animeId);
          if (matched) {
            setStatus(matched.status || 'WATCHLIST');
            if (matched.watchedEpisodes) {
              setWatchedEpisodes(new Set(matched.watchedEpisodes));
            }
          }
        }
      } catch (err) {
        console.error("Failed to load anime details:", err);
        setErrorMsg("Failed to load details");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [animeId, user]);

  const handlePageChange = async (newOffset) => {
    setCurrentOffset(newOffset);
    setLoadingEpisodes(true);
    try {
      const eps = await api.getAnimeEpisodes(animeId, newOffset);
      setPaginatedEpisodes(eps);
    } catch (err) {
      console.error("Failed to load episodes page:", err);
    } finally {
      setLoadingEpisodes(false);
    }
  };

  if (!details && loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pt-28 bg-black/60 backdrop-blur-sm">
        <div className="glass-card p-12 rounded-[3rem] flex justify-center items-center">
          <div className="w-12 h-12 border-4 theme-spinner rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!details) return null;

  const displayTitle = preferEnglish ? details.titleEnglish : details.titleRomaji;
  const totalEps = details.episodeCount || 0;

  const determineStatus = (updatedEpisodesSet) => {
    if (totalEps > 0 && updatedEpisodesSet.size >= totalEps) {
      return 'WATCHED';
    } else if (updatedEpisodesSet.size > 0) {
      return 'WATCHING';
    } else {
      return 'WATCHLIST';
    }
  };

  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus);
    try {
      await addAnime({
        id: details.id,
        titleRomaji: details.titleRomaji,
        titleEnglish: details.titleEnglish,
        poster: details.poster,
        status: newStatus,
        watchedEpisodes: Array.from(watchedEpisodes),
        totalEpisodes: totalEps
      });
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const toggleEpisode = async (epNumber) => {
    const updated = new Set(watchedEpisodes);
    if (updated.has(epNumber)) {
      updated.delete(epNumber);
    } else {
      updated.add(epNumber);
    }
    setWatchedEpisodes(updated);

    const newStatus = determineStatus(updated);
    setStatus(newStatus);

    try {
      await addAnime({
        id: details.id,
        titleRomaji: details.titleRomaji,
        titleEnglish: details.titleEnglish,
        poster: details.poster,
        status: newStatus,
        watchedEpisodes: Array.from(updated),
        totalEpisodes: totalEps
      });
    } catch (err) {
      console.error("Failed to update episodes:", err);
    }
  };

  const pageOptions = [];
  if (totalEps > 20) {
    for (let i = 0; i < totalEps; i += 20) {
      const start = i + 1;
      const end = Math.min(i + 20, totalEps);
      pageOptions.push({ offset: i, label: `Episodes ${start} - ${end}` });
    }
  }

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 pt-28 md:pt-32 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="glass-card rounded-[2.5rem] pt-12 pb-6 px-6 md:pt-14 md:pb-10 md:px-10 w-full max-w-4xl max-h-[85vh] overflow-y-auto relative custom-scrollbar flex flex-col gap-8 shadow-2xl border border-white/10"
      >
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 md:top-3 md:right-3 w-10 h-10 flex items-center justify-center rounded-full bg-slate-500/10 hover:bg-red-500/20 theme-text-muted hover:text-red-500 transition-all z-10"
          title="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* TOP SECTION: Poster & Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
          
          {/* Poster Column - Constrained on mobile */}
          <div className="w-48 sm:w-56 md:w-full mx-auto md:mx-0 aspect-[2/3] rounded-2xl overflow-hidden relative bg-black/5 shadow-inner">
            {details.poster ? (
              <img src={details.poster} alt={displayTitle} className="w-full h-full object-cover" />
            ) : (
              <div className="theme-text-muted flex items-center justify-center h-full">No Image</div>
            )}
          </div>

          {/* Metadata Column */}
          <div className="md:col-span-2 flex flex-col justify-between gap-5 h-full">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pr-2">
                <h2 className="text-2xl md:text-3xl font-extrabold theme-text tracking-tight flex-1 pr-4" title={displayTitle}>
                  {displayTitle}
                </h2>
                
                {/* Status Selector Wrapper */}
                <div className="relative flex-shrink-0">
                  <select 
                    value={status} 
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="structural-input px-4 py-2.5 pr-12 rounded-xl text-sm font-bold outline-none cursor-pointer appearance-none w-full"
                  >
                    <option value="WATCHLIST">Watchlist</option>
                    <option value="WATCHING">Watching</option>
                    <option value="WATCHED">Watched</option>
                  </select>
                  
                  {/* Explicit Arrow Icon */}
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none theme-text-muted">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Description / Synopsis */}
              <p className="theme-text-muted text-sm md:text-base leading-relaxed line-clamp-4 font-medium">
                {details.synopsis || 'No description available for this anime.'}
              </p>
            </div>

            {/* Genres & Stats */}
            <div className="flex flex-col gap-3 pt-2 border-t border-black/10 dark:border-white/10">
              <div className="flex flex-wrap gap-2">
                {details.genres.map((genre, idx) => (
                  <span key={idx} className="px-3 py-1 bg-sky-500/10 text-sky-500 border border-sky-500/30 rounded-full text-xs font-bold capitalize">
                    {genre}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center gap-6 text-xs md:text-sm font-semibold theme-text-muted pt-1">
                <span>Episodes: <strong className="theme-text">{totalEps || 'Unknown'}</strong></span>
                <span>Released: <strong className="theme-text">{details.startDate || 'N/A'}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Episode List & Pagination */}
        <div className="flex flex-col gap-4 pt-4 border-t border-black/10 dark:border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h3 className="text-xl font-bold theme-text">Episode List</h3>
            
            {/* Pagination Range Selector - Also added right padding for consistency */}
            {pageOptions.length > 0 && (
              <select
                value={currentOffset}
                onChange={(e) => handlePageChange(Number(e.target.value))}
                className="structural-input px-4 py-2 pr-8 rounded-xl text-xs font-bold outline-none cursor-pointer appearance-none bg-no-repeat bg-[length:0.75rem_0.75rem] bg-[right_0.75rem_center]"
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`
                }}
              >
                {pageOptions.map(opt => (
                  <option key={opt.offset} value={opt.offset}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <div className="glass-card rounded-2xl p-4 flex flex-col gap-3 max-h-72 overflow-y-auto custom-scrollbar border border-white/5 relative">
            {loadingEpisodes ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-8 h-8 border-3 theme-spinner rounded-full animate-spin"></div>
              </div>
            ) : paginatedEpisodes && paginatedEpisodes.length > 0 ? (
              paginatedEpisodes.map(ep => {
                const isWatched = watchedEpisodes.has(ep.number);
                return (
                  <div key={ep.id} className="flex items-center justify-between p-3 rounded-xl structural-input transition-all gap-3">
                    
                    <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                      <span className="font-bold text-xs md:text-sm theme-text-muted w-8 md:w-10 flex-shrink-0">#{ep.number}</span>
                      <span className="font-semibold text-xs md:text-sm theme-text truncate">{ep.title}</span>
                    </div>
                    
                    <button 
                      onClick={() => toggleEpisode(ep.number)}
                      className={`flex-shrink-0 px-3 py-1.5 md:px-4 rounded-lg text-[10px] md:text-xs font-bold transition-all ${
                        isWatched ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/40' : 'structural-btn'
                      }`}
                    >
                      {isWatched ? 'Watched ✓' : 'Mark Watched'}
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 theme-text-muted text-sm font-medium">No episode data available from Kitsu for this range.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}