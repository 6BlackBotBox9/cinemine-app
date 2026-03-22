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

type MovieResult = {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date: string;
};

export default function LogPage() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<MovieResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<MovieResult | null>(null);
  const [rating, setRating] = useState(3);
  const [mood, setMood] = useState('relaxed');
  const [rewatch, setRewatch] = useState(false);
  const [review, setReview] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const tmdbKey = process.env.NEXT_PUBLIC_TMDB_API_KEY as string;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id || null);
    });
  }, []);

  async function doSearch() {
    if (!tmdbKey || !search.trim()) return;
    setSearching(true);
    const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${encodeURIComponent(search)}`);
    const data = await res.json();
    setResults((data.results || []).slice(0, 12));
    setSearching(false);
  }

  async function handleSubmit() {
    if (!selected || !userId) return;
    setSubmitting(true);
    const { error } = await supabase.from('watch_history').insert({
      user_id: userId,
      tmdb_id: selected.id,
      title: selected.title,
      poster_path: selected.poster_path,
      media_type: 'movie',
      genre: '',
      rating,
      mood,
      review,
      rewatch,
      director: '',
      country: '',
      year: selected.release_date ? parseInt(selected.release_date.slice(0, 4)) : null,
      watched_at: new Date().toISOString(),
    });
    setSubmitting(false);
    if (!error) {
      showToast(`"${selected.title}" logged! 🎬`);
      setSelected(null);
      setSearch('');
      setResults([]);
      setRating(3);
      setMood('relaxed');
      setRewatch(false);
      setReview('');
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  const moods = [
    { id: 'mind-blow', label: 'Mind Blown', icon: '🧠' },
    { id: 'emotional', label: 'Emotional', icon: '🥲' },
    { id: 'scared', label: 'Scared', icon: '😱' },
    { id: 'laughing', label: 'Laughing', icon: '😂' },
    { id: 'motivated', label: 'Motivated', icon: '💪' },
    { id: 'relaxed', label: 'Relaxed', icon: '😌' },
  ];

  return (
    <div className={dmsans.className}>
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

      <h2 className={"text-3xl font-bold mb-6 " + dmsans.className}>Log a Movie</h2>

      {/* Search */}
      <div className="flex gap-2 mb-6 max-w-2xl">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doSearch()}
          placeholder="Search for a movie you've watched..."
          className="flex-1 p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-brand focus:outline-none"
        />
        <button onClick={doSearch} disabled={searching} className="px-6 py-3 bg-brand text-white rounded-xl font-semibold disabled:opacity-50">
          {searching ? '...' : 'Search'}
        </button>
      </div>

      {/* Search results */}
      {results.length > 0 && !selected && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          {results.map(movie => (
            <motion.div
              key={movie.id}
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(229,9,20,0.3)' }}
              onClick={() => setSelected(movie)}
              className="rounded-xl overflow-hidden bg-white/5 cursor-pointer"
            >
              <div className="h-56" style={{ backgroundImage: movie.poster_path ? `url(https://image.tmdb.org/t/p/w500${movie.poster_path})` : undefined, backgroundSize: 'cover', backgroundColor: '#333' }} />
              <div className="p-2">
                <div className="text-xs font-semibold truncate">{movie.title}</div>
                <div className="text-xs text-gray-400">{movie.release_date?.slice(0,4)}</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Log form */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-2xl bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <div className="flex gap-4 mb-6">
              <div className="w-24 h-36 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundImage: selected.poster_path ? `url(https://image.tmdb.org/t/p/w500${selected.poster_path})` : undefined, backgroundSize: 'cover', backgroundColor: '#333' }} />
              <div className="flex-1">
                <h3 className="text-xl font-bold">{selected.title}</h3>
                <p className="text-gray-400 text-sm mt-1">{selected.release_date?.slice(0,4)} · ⭐ {selected.vote_average?.toFixed(1)}</p>
                <button onClick={() => setSelected(null)} className="text-sm text-gray-500 mt-2 hover:text-white">✕ Change</button>
              </div>
            </div>

            {/* Rating */}
            <div className="mb-4">
              <label className="text-sm text-gray-400 block mb-2">Your Rating</label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(n => (
                  <motion.button
                    key={n}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setRating(n)}
                    className={`text-3xl transition-colors ${n <= rating ? 'text-brand' : 'text-gray-600'}`}
                  >
                    ★
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Mood */}
            <div className="mb-4">
              <label className="text-sm text-gray-400 block mb-2">Mood After Watching</label>
              <div className="grid grid-cols-3 gap-2">
                {moods.map(m => (
                  <motion.button
                    key={m.id}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setMood(m.id)}
                    className={`p-3 rounded-xl border-2 text-sm ${mood === m.id ? 'border-brand bg-brand/20' : 'border-white/10 bg-white/5'}`}
                  >
                    <span className="text-lg mr-1">{m.icon}</span>{m.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Rewatch */}
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setRewatch(!rewatch)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${rewatch ? 'bg-brand' : 'bg-white/10'}`}
                >
                  <motion.div
                    animate={{ x: rewatch ? 16 : 0 }}
                    className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
                  />
                </div>
                <span className="text-sm">Rewatch?</span>
              </label>
            </div>

            {/* Review */}
            <div className="mb-6">
              <label className="text-sm text-gray-400 block mb-2">Short Review (optional)</label>
              <textarea
                value={review}
                onChange={e => setReview(e.target.value)}
                placeholder="What did you think?"
                rows={3}
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-brand focus:outline-none resize-none"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3 bg-brand text-white rounded-xl font-bold text-lg disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save to Watchlist 🎬'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
