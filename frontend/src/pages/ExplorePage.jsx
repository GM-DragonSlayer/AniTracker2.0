import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import AnimeCard from '../components/AnimeCard';
import AnimeDetailsModal from '../components/AnimeDetailsModal';

export default function ExplorePage() {
  const { user, addAnime, removeAnime } = useAuth();
  
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [preferEnglish, setPreferEnglish] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [tempCategory, setTempCategory] = useState('');
  const [tempSortBy, setTempSortBy] = useState('popularity');
  const [activeFilters, setActiveFilters] = useState({ category: '', sortBy: 'popularity' });

  // State to control the Anime Details Modal
  const [selectedAnimeId, setSelectedAnimeId] = useState(null);

  const fetchAnimeData = async (isLoadMore = false) => {
    const nextOffset = isLoadMore ? offset + 20 : 0;
    
    if (!isLoadMore) { setLoading(true); setOffset(0); } 
    else { setLoadingMore(true); }

    try {
      const data = await api.getAnimeList({
        query: submittedQuery,
        offset: nextOffset,
        category: activeFilters.category,
        sortBy: activeFilters.sortBy
      });

      if (isLoadMore) setResults(prev => [...prev, ...data]);
      else setResults(data);
      
      setOffset(nextOffset);
      setHasMore(data.length === 20);
    } catch (err) {
      console.error("Failed to fetch anime.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => { fetchAnimeData(false); }, [submittedQuery, activeFilters]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim() === submittedQuery) return;
    setSubmittedQuery(query.trim());
  };

  const applyFilters = () => {
    setActiveFilters({ category: tempCategory, sortBy: tempSortBy });
    setShowFilters(false);
  };

  return (
    <main className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-12 pb-24 relative z-10 flex-1 flex flex-col">
      <div className="flex flex-col items-center mb-12 md:mb-16">
        <h2 className="text-3xl md:text-5xl font-extrabold mb-8 text-center theme-text tracking-tight">Find your next obsession.</h2>
        <form onSubmit={handleSearch} className="w-full max-w-2xl relative group">
          <input 
            type="text" 
            placeholder="Search anime" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-6 pr-32 py-4 md:pl-8 md:pr-36 md:py-5 rounded-[2rem] structural-input text-base md:text-lg font-medium shadow-lg"
          />
          <button type="submit" className="absolute right-2 top-2 bottom-2 cta-btn px-6 md:px-8 rounded-[1.5rem] font-bold tracking-wide">
            Search
          </button>
        </form>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <h3 className="text-xl md:text-2xl font-bold theme-text-muted">
            {submittedQuery ? `Search Results for "${submittedQuery}"` : 'Popular Anime'}
            {activeFilters.category && <span className="ml-2 text-sky-500 text-lg capitalize font-bold">({activeFilters.category})</span>}
          </h3>

          <div className="flex items-center gap-3">
            <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-black/5 dark:border-white/5 shadow-inner">
               <button onClick={() => setPreferEnglish(false)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!preferEnglish ? 'bg-sky-500 text-white shadow-md' : 'theme-text-muted hover:theme-text'}`}>JP</button>
               <button onClick={() => setPreferEnglish(true)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${preferEnglish ? 'bg-sky-500 text-white shadow-md' : 'theme-text-muted hover:theme-text'}`}>EN</button>
            </div>

            <div className="relative">
              <button onClick={() => setShowFilters(!showFilters)} className={`structural-btn px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${showFilters ? 'ring-2 ring-sky-500' : ''}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                Filter
              </button>

              {showFilters && (
                <div className="absolute top-full right-0 mt-3 p-5 glass-card rounded-2xl w-64 md:w-72 z-50 flex flex-col gap-5 shadow-2xl border border-white/10 origin-top-right">
                  <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-3">
                    <h4 className="font-bold theme-text">Filter Results</h4>
                    <button onClick={() => setShowFilters(false)} className="theme-text-muted hover:text-red-500">
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold theme-text-muted uppercase tracking-wider">Genre</label>
                    <select value={tempCategory} onChange={(e) => setTempCategory(e.target.value)} className="structural-input px-3 py-2.5 rounded-xl text-sm outline-none font-medium appearance-none">
                      <option value="">All Genres</option>
                      <option value="action">Action</option>
                      <option value="romance">Romance</option>
                      <option value="comedy">Comedy</option>
                      <option value="fantasy">Fantasy</option>
                      <option value="sci-fi">Sci-Fi</option>
                      <option value="horror">Horror</option>
                      <option value="sports">Sports</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold theme-text-muted uppercase tracking-wider">Sort By</label>
                    <select value={tempSortBy} onChange={(e) => setTempSortBy(e.target.value)} className="structural-input px-3 py-2.5 rounded-xl text-sm outline-none font-medium appearance-none">
                      <option value="popularity">Most Popular</option>
                      <option value="newest">Release Date (Newest)</option>
                      <option value="oldest">Release Date (Oldest)</option>
                    </select>
                  </div>
                  <button onClick={applyFilters} className="cta-btn mt-2 py-3 rounded-xl font-bold text-sm shadow-md">Apply Filters</button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex-1 flex justify-center items-center min-h-[400px]">
            <div className="w-12 h-12 border-4 theme-spinner rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8">
              {results.map(anime => (
                <AnimeCard 
                  key={anime.id} 
                  anime={anime} 
                  onAdd={addAnime} 
                  onRemove={removeAnime} 
                  user={user} 
                  preferEnglish={preferEnglish} 
                  onCardClick={() => setSelectedAnimeId(anime.id)}
                />
              ))}
            </div>
            
            {results.length > 0 && hasMore && (
              <div className="mt-12 flex justify-center">
                <button onClick={() => fetchAnimeData(true)} disabled={loadingMore} className="structural-btn px-10 py-4 rounded-full font-bold text-lg shadow-lg flex items-center gap-3">
                  {loadingMore ? 'Loading...' : 'Load More Anime'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

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