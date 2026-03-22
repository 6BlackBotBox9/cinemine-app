"use client";
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DM_Sans } from 'next/font/google';
import { createClient } from '@supabase/supabase-js';

const dmsans = DM_Sans({ subsets: ['latin'], weight: '400' });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

type WatchlistItem = {
  id: string;
  tmdb_id: number;
  title: string;
  poster_path: string;
  rating: number;
  mood: string;
  watched_at: string;
  genre: string;
  year: number | null;
};

type MovieResult = {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date: string;
};

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<MovieResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [logRating, setLogRating] = useState(3);
  const [logMood, setLogMood] = useState('relaxed');
  const [selectedMovie, setSelectedMovie] = useState<MovieResult | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const tmdbKey = process.env.NEXT_PUBLIC_TMDB_API_KEY as string;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user?.id;
      setUserId(uid || null);
      if (uid) loadWatchlist(uid);
      else setLoading(false);
    });
  }, []);

  async function loadWatchlist(uid: string) {
    setLoading(true);
    const { data, error } = await supabase
      .from('watch_history')
      .select('*')
      .eq('user_id', uid)
      .order('watched_at', { ascending: false })
      .limit(50);
    if (!error && data) setItems(data as WatchlistItem[]);
    setLoading(false);
  }

  async function searchTMDB(q: string) {
    if (!tmdbKey || !q.trim()) return;
    setSearching(true);
    const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${encodeURIComponent(q)}`);
    const data = await res.json();
    setSearchResults((data.results || []).slice(0, 8));
    setSearching(false);
  }

  async function addToWatchlist(movie: MovieResult) {
    if (!userId) return;
    const { error } = await supabase.from('watch_history').insert({
      user_id: userId,
      tmdb_id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      media_type: 'movie',
      genre: '',
      rating: logRating,
      mood: logMood,
      review: '',
      rewatch: false,
      director: '',
      country: '',
      year: movie.release_date ? parseInt(movie.release_date.slice(0, 4)) : null,
      watched_at: new Date().toISOString(),
    });
    if (!error) {
      showToast(`"${movie.title}" added to your watchlist!`);
      setSelectedMovie(null);
      setSearch('');
      setSearchResults([]);
      loadWatchlist(userId);
    }
  }

  async function removeFromWatchlist(id: string) {
    if (!userId) return;
    await supabase.from('watch_history').delete().eq('id', id);
    setItems(prev => prev.filter(i => i.id !== id));
    showToast('Removed from watchlist');
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.04, duration: 0.3 },
    }),
  };

  return (
    <div className={dmsans.className}>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-4 right-4 bg-brand text-white px-4 py-2 rounded-lg z-50 shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-6">
        <h2 className={"text-3xl font-bold " + dmsans.className}>My Watchlist</h2>
        <span className="text-gray-400">{items.length} movies tracked</span>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="flex gap-2 mb-3">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchTMDB(search)}
            placeholder="Search a movie to add..."
            className="flex-1 p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500"
          />
          <button onClick={() => searchTMDB(search)} disabled={searching} className="px-6 py-3 bg-brand text-white rounded-lg font-semibold">
            {searching ? '...' : 'Search'}
          </button>
        </div>

        {/* Search results */}
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
          >
            <div className="p-4 grid grid-cols-4 gap-4">
              {searchResults.map(movie => (
                <motion.div
                  key={movie.id}
                  whileHover={{ scale: 1.05 }}
                  className="bg-black/20 rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => setSelectedMovie(movie)}
                >
                  <div className="h-48" style={{ backgroundImage: movie.poster_path ? `url(https://image.tmdb.org/t/p/w500${movie.poster_path})` : undefined, backgroundSize: 'cover', backgroundColor: '#333' }} />
                  <div className="p-2">
                    <div className="text-xs font-semibold truncate">{movie.title}</div>
                    <div className="text-xs text-gray-400">{movie.release_date?.slice(0,4)}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Log modal */}
      <AnimatePresence>
        {selectedMovie && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedMovie(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={e => e.stopPropagation()}
              className="bg-dark border border-white/10 rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold mb-4">Log: {selectedMovie.title}</h3>
              <div className="flex gap-2 mb-4">
                <div className="flex-1">
                  <label className="text-xs text-gray-400 block mb-1">Rating</label>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(n => (
                      <button key={n} onClick={() => setLogRating(n)} className={`text-xl ${n <= logRating ? 'text-brand' : 'text-gray-600'}`}>★</button>
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-400 block mb-1">Mood</label>
                  <select value={logMood} onChange={e => setLogMood(e.target.value)} className="w-full bg-black/40 text-white p-2 rounded text-sm">
                    <option value="mind-blow">🧠 Mind Blown</option>
                    <option value="emotional">🥲 Emotional</option>
                    <option value="scared">😱 Scared</option>
                    <option value="laughing">😂 Laughing</option>
                    <option value="motivated">💪 Motivated</option>
                    <option value="relaxed">😌 Relaxed</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setSelectedMovie(null)} className="flex-1 px-4 py-2 bg-white/10 rounded-lg">Cancel</button>
                <button onClick={() => addToWatchlist(selectedMovie)} className="flex-1 px-4 py-2 bg-brand text-white rounded-lg font-semibold">Add to Watchlist</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Watchlist grid */}
      {loading ? (
        <div className="grid grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-72 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-4xl mb-4">🎬</div>
          <p className="text-lg">Your watchlist is empty</p>
          <p className="text-sm mt-1">Search and log a movie above to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.05 }}
              className="rounded-xl overflow-hidden bg-white/5 group relative"
            >
              <div className="h-72" style={{ backgroundImage: item.poster_path ? `url(https://image.tmdb.org/t/p/w500${item.poster_path})` : undefined, backgroundSize: 'cover', backgroundColor: '#333' }} />
              <div className="p-3">
                <div className="font-semibold text-sm truncate">{item.title}</div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-400">{item.year || item.watched_at?.slice(0,4)}</span>
                  <span className="text-brand text-sm">{'★'.repeat(item.rating || 3)}</span>
                </div>
                {item.mood && <div className="text-xs text-gray-500 mt-1">{item.mood}</div>}
              </div>
              <button
                onClick={() => removeFromWatchlist(item.id)}
                className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Remove
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
