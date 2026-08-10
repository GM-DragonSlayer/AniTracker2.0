const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const api = {
  signup: async (email, userName, password) => {
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, userName, password })
    });
    if (!response.ok) throw new Error('Failed to sign up.');
    return await response.json();
  },
  login: async (email, password) => {
    // UPDATED: Now sends a secure POST request with the password in the body
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      if (response.status === 401) throw new Error('Incorrect password.');
      if (response.status === 404) throw new Error('User not found.');
      throw new Error('Login failed.');
    }
    return await response.json();
  },
  addAnimeToWatchlist: async (email, animeData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${email}/anime`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(animeData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("SPRING BOOT REJECTED IT! Reason:", errorText);
        throw new Error('Failed to add anime.');
      }
      
      return await response.json();
    } catch (err) {
      console.error("NETWORK ERROR:", err.message);
      throw err;
    }
  },
  removeAnimeFromWatchlist: async (email, animeId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${email}/anime/${animeId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("SPRING BOOT REJECTED REMOVAL! Reason:", errorText);
        throw new Error('Failed to remove anime.');
      }
      
      return await response.json();
    } catch (err) {
      console.error("NETWORK ERROR:", err.message);
      throw err;
    }
  },
  getAnimeList: async ({ query = '', offset = 0, sortBy = 'popularity', category = '' }) => {
    let url = `https://kitsu.io/api/edge/anime?page[limit]=20&page[offset]=${offset}`;
    
    if (query) url += `&filter[text]=${query}`;
    if (category) url += `&filter[categories]=${category}`;

    if (sortBy === 'newest') url += `&sort=-startDate`;
    else if (sortBy === 'oldest') url += `&sort=startDate`;
    else if (!query) url += `&sort=-userCount`;

    const response = await fetch(url);
    const data = await response.json();
    
    return data.data.map(anime => ({
      id: parseInt(anime.id),
      titleRomaji: anime.attributes.canonicalTitle,
      titleEnglish: anime.attributes.titles?.en || anime.attributes.titles?.en_us || anime.attributes.canonicalTitle,
      poster: anime.attributes.posterImage?.large || anime.attributes.posterImage?.original,
      totalEpisodes: anime.attributes.episodeCount || 0
    }));
  },
  getAnimeDetails: async (animeId) => {
    const animeRes = await fetch(`https://kitsu.io/api/edge/anime/${animeId}?include=genres`);
    const animeData = await animeRes.json();
    const attr = animeData.data.attributes;
    
    let episodeCount = attr.episodeCount || 0;
    
    // Fallback to AniList GraphQL for ongoing/unknown episode counts
    if (!episodeCount || episodeCount === 0) {
      try {
        const query = `
          query($search: String) {
            Media(search: $search, type: ANIME) {
              episodes
              nextAiringEpisode {
                episode
              }
            }
          }
        `;

        const variables = {
          // Clean the title slightly to improve AniList search accuracy
          search: attr.canonicalTitle.replace(/:.*$/, '').trim() 
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

        const anilistRes = await fetch('https://graphql.anilist.co', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ query, variables }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (anilistRes.ok) {
          const anilistData = await anilistRes.json();
          const media = anilistData?.data?.Media;
          
          if (media) {
            if (media.nextAiringEpisode && media.nextAiringEpisode.episode) {
              // Exact ongoing math: Next episode minus 1
              episodeCount = media.nextAiringEpisode.episode - 1;
            } else if (media.episodes) {
              // Fallback to their total episode count if available
              episodeCount = media.episodes;
            }
          }
        }
      } catch (err) {
        console.warn("AniList API fallback failed gracefully:", err);
      }
    }
    
    // Fetch first page of episodes (up to 20)
    const epRes = await fetch(`https://kitsu.io/api/edge/anime/${animeId}/episodes?page[limit]=20&page[offset]=0`);
    const epData = await epRes.json();
    
    const episodes = (epData && epData.data) ? epData.data.map(ep => ({
      id: ep.id,
      number: ep.attributes.number,
      title: ep.attributes.canonicalTitle || ep.attributes.titles?.en_jp || `Episode ${ep.attributes.number}`,
      synopsis: ep.attributes.synopsis
    })) : [];
    
    const genres = animeData.included ? animeData.included.filter(inc => inc.type === 'genres').map(g => g.attributes.name) : [];

    return {
      id: parseInt(animeData.data.id),
      titleRomaji: attr.canonicalTitle,
      titleEnglish: attr.titles?.en || attr.titles?.en_us || attr.canonicalTitle,
      synopsis: attr.synopsis,
      poster: attr.posterImage?.large || attr.posterImage?.original,
      episodeCount,
      startDate: attr.startDate,
      genres,
      episodes
    };
  },
  getAnimeEpisodes: async (animeId, offset = 0) => {
    const epRes = await fetch(`https://kitsu.io/api/edge/anime/${animeId}/episodes?page[limit]=20&page[offset]=${offset}`);
    const epData = await epRes.json();
    
    return (epData && epData.data) ? epData.data.map(ep => ({
      id: ep.id,
      number: ep.attributes.number,
      title: ep.attributes.canonicalTitle || ep.attributes.titles?.en_jp || `Episode ${ep.attributes.number}`,
      synopsis: ep.attributes.synopsis
    })) : [];
  }
};