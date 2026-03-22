"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DM_Sans } from 'next/font/google';
const dmsans = DM_Sans({ subsets: ['latin'], weight: '400' });

const STEPS = [
  { id: 'format', label: 'Format', icon: '🎬' },
  { id: 'genre', label: 'Genre', icon: '🎭' },
  { id: 'mood', label: 'Mood', icon: '🎯' },
  { id: 'watchWith', label: 'Watch With', icon: '👥' },
  { id: 'duration', label: 'Duration', icon: '⏱️' },
  { id: 'platform', label: 'Platform', icon: '📺' },
  { id: 'rating', label: 'Rating', icon: '⭐' },
];

const FORMAT_OPTIONS = [
  { id: 'movie', label: 'Movie', icon: '🎬' },
  { id: 'series', label: 'Series', icon: '📺' },
  { id: 'anime', label: 'Anime', icon: '🈯' },
  { id: 'animation', label: 'Animation', icon: '🎨' },
];

const GENRE_OPTIONS = [
  { id: '28', label: 'Action', icon: '💥' },
  { id: '12', label: 'Adventure', icon: '🗺️' },
  { id: '878', label: 'Sci-Fi', icon: '🚀' },
  { id: '53', label: 'Thriller', icon: '🔪' },
  { id: '9648', label: 'Mystery', icon: '🔍' },
  { id: '27', label: 'Horror', icon: '👻' },
  { id: '35', label: 'Comedy', icon: '😂' },
  { id: '10749', label: 'Romance', icon: '❤️' },
  { id: '18', label: 'Drama', icon: '🎭' },
];

const MOOD_OPTIONS = [
  { id: 'mind-blow', label: 'Mind Blown', icon: '🧠' },
  { id: 'emotional', label: 'Emotional', icon: '🥲' },
  { id: 'scared', label: 'Scared', icon: '😱' },
  { id: 'laughing', label: 'Laughing', icon: '😂' },
  { id: 'motivated', label: 'Motivated', icon: '💪' },
  { id: 'relaxed', label: 'Relaxed', icon: '😌' },
];

const WATCHWITH_OPTIONS = [
  { id: 'alone', label: 'Alone', icon: '🧑' },
  { id: 'partner', label: 'Partner', icon: '👫' },
  { id: 'friends', label: 'Friends', icon: '👯' },
  { id: 'family', label: 'Family', icon: '👨‍👩‍👧' },
];

const DURATION_OPTIONS = [
  { id: 'short', label: 'Under 90min', icon: '⚡' },
  { id: 'medium', label: '90–120min', icon: '⏱️' },
  { id: 'long', label: '2hr+', icon: '⏰' },
  { id: 'binge', label: 'Binge Ready', icon: '📺' },
];

const PLATFORM_OPTIONS = [
  { id: 'netflix', label: 'Netflix', icon: '🟢' },
  { id: 'prime', label: 'Prime', icon: '🔵' },
  { id: 'hotstar', label: 'Hotstar', icon: '⭐' },
  { id: 'sonyliv', label: 'SonyLIV', icon: '🟣' },
  { id: 'zee5', label: 'ZEE5', icon: '🔴' },
  { id: 'youtube', label: 'YouTube', icon: '▶️' },
];

const RATING_OPTIONS = [
  { id: '7', label: 'Above 7 ⭐', icon: '⭐' },
  { id: '8', label: 'Above 8 ⭐⭐', icon: '⭐' },
  { id: '9', label: 'Above 9 ⭐⭐⭐', icon: '⭐' },
  { id: 'any', label: 'Any Rating', icon: '🎯' },
];

type Movie = {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average?: number;
  release_date?: string;
};

export default function DiscoverPage() {
  const [step, setStep] = useState(0);
  const [filters, setFilters] = useState({
    format: 'movie',
    genre: [] as string[],
    mood: [] as string[],
    watchWith: '',
    duration: '',
    platform: '',
    rating: '7',
  });
  const [results, setResults] = useState<Movie[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [spunMovie, setSpunMovie] = useState<Movie | null>(null);
  const [showResults, setShowResults] = useState(false);
  const tmdbKey = process.env.NEXT_PUBLIC_TMDB_API_KEY as string;

  function toggleArray(arr: string[], val: string) {
    return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
  }

  function buildTMDBUrl() {
    const base = 'https://api.themoviedb.org/3/discover/movie';
    const params = new URLSearchParams({ api_key: tmdbKey, sort_by: 'popularity.desc' });
    if (filters.genre.length > 0) params.set('with_genres', filters.genre.join(','));
    if (filters.rating !== 'any') params.set('vote_average.gte', filters.rating);
    return `${base}?${params.toString()}`;
  }

  async function fetchResults() {
    if (!tmdbKey) return;
    const url = buildTMDBUrl();
    const res = await fetch(url);
    const data = await res.json();
    setResults((data.results || []).slice(0, 24));
    setShowResults(true);
  }

  function spin() {
    if (results.length === 0) return;
    setSpinning(true);
    let count = 0;
    const max = 20;
    const interval = setInterval(() => {
      const pick = results[Math.floor(Math.random() * results.length)];
      setSpunMovie(pick);
      count++;
      if (count >= max) {
        clearInterval(interval);
        setSpinning(false);
      }
    }, 100);
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: (i: number) => ({
      opacity: 1, y: 0, scale: 1,
      transition: { delay: i * 0.05, duration: 0.3, ease: 'easeOut' },
    }),
    hover: { scale: 1.05, boxShadow: '0 0 20px rgba(229,9,20,0.4)' },
  };

  function renderStepOptions() {
    switch (step) {
      case 0: return FORMAT_OPTIONS;
      case 1: return GENRE_OPTIONS;
      case 2: return MOOD_OPTIONS;
      case 3: return WATCHWITH_OPTIONS;
      case 4: return DURATION_OPTIONS;
      case 5: return PLATFORM_OPTIONS;
      case 6: return RATING_OPTIONS;
      default: return [];
    }
  }

  function handleSelect(id: string) {
    const stepKey = STEPS[step].id as keyof typeof filters;
    if (['genre', 'mood'].includes(stepKey)) {
      setFilters(f => ({ ...f, [stepKey]: toggleArray(f[stepKey] as string[], id) }));
    } else {
      setFilters(f => ({ ...f, [stepKey]: id }));
    }
  }

  function isSelected(id: string) {
    const stepKey = STEPS[step].id as keyof typeof filters;
    const val = filters[stepKey];
    if (Array.isArray(val)) return val.includes(id);
    return val === id;
  }

  return (
    <div className={dmsans.className}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={"text-3xl font-bold " + dmsans.className}>Discover</h2>
        <div className="flex gap-2">
          <button onClick={() => { setStep(0); setShowResults(false); }} className="px-4 py-2 bg-white/10 rounded text-sm">Reset</button>
          {!showResults && <button onClick={fetchResults} className="px-4 py-2 bg-brand text-white rounded font-semibold">Find Movies</button>}
          {showResults && <button onClick={spin} disabled={spinning} className="px-4 py-2 bg-brand text-white rounded font-semibold">{spinning ? 'Spinning...' : 'Spin the Wheel 🎯'}</button>}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2 text-xs text-gray-400">
          {STEPS.map((s, i) => (
            <span key={s.id} className={i <= step ? 'text-brand' : ''}>{s.label}</span>
          ))}
        </div>
        <div className="h-2 bg-white/10 rounded-full">
          <motion.div
            className="h-full bg-brand rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${((step + (showResults ? 1 : 0)) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {!showResults ? (
        <div>
          <h3 className="text-lg mb-4 flex items-center gap-2">
            <span className="text-2xl">{STEPS[step].icon}</span>
            <span className="font-semibold">{STEPS[step].label}</span>
          </h3>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-4 gap-4"
            >
              {renderStepOptions().map((opt: any, i: number) => (
                <motion.button
                  key={opt.id}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  onClick={() => handleSelect(opt.id)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${isSelected(opt.id) ? 'border-brand bg-brand/20' : 'border-white/10 bg-white/5 hover:border-brand/50'}`}
                >
                  <div className="text-3xl mb-2">{opt.icon}</div>
                  <div className="text-sm font-medium">{opt.label}</div>
                </motion.button>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Step nav */}
          <div className="flex justify-between mt-8">
            <button
              disabled={step === 0}
              onClick={() => setStep(s => s - 1)}
              className="px-6 py-2 bg-white/10 rounded disabled:opacity-30"
            >
              ← Back
            </button>
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)} className="px-6 py-2 bg-brand text-white rounded font-semibold">
                Next →
              </button>
            ) : (
              <button onClick={fetchResults} className="px-6 py-2 bg-brand text-white rounded font-semibold">
                Get Results →
              </button>
            )}
          </div>
        </div>
      ) : (
        <div>
          {/* Spin result */}
          <AnimatePresence>
            {spunMovie && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="mb-6 p-6 bg-brand/20 border-2 border-brand rounded-2xl flex items-center gap-6"
              >
                <div className="w-24 h-36 rounded-lg overflow-hidden" style={{ backgroundImage: spunMovie.poster_path ? `url(https://image.tmdb.org/t/p/w500${spunMovie.poster_path})` : undefined, backgroundSize: 'cover', backgroundColor: '#333' }} />
                <div>
                  <div className="text-2xl font-bold">{spunMovie.title}</div>
                  <div className="text-sm text-gray-400 mt-1">{spunMovie.release_date?.slice(0,4)} · ⭐ {spunMovie.vote_average?.toFixed(1)}</div>
                  <div className="mt-2 text-brand font-semibold text-lg">🎯 Picked for you!</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">{results.length} Movies Found</h3>
            <button onClick={() => { spin(); }} disabled={spinning} className="px-4 py-2 bg-brand text-white rounded font-semibold">
              {spinning ? '🎰 Spinning...' : '🎯 Spin Again'}
            </button>
          </div>

          <motion.div
            className="grid grid-cols-4 gap-4"
            initial="hidden"
            animate="visible"
          >
            {results.map((r, i) => (
              <motion.div
                key={r.id}
                custom={i}
                variants={cardVariants}
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(229,9,20,0.4)' }}
                className="rounded-xl overflow-hidden bg-white/5 cursor-pointer transition-all"
              >
                <div className="h-72" style={{ backgroundImage: r.poster_path ? `url(https://image.tmdb.org/t/p/w500${r.poster_path})` : undefined, backgroundSize: 'cover', backgroundColor: '#333' }} />
                <div className="p-3">
                  <div className="font-semibold text-sm truncate">{r.title}</div>
                  <div className="text-xs text-gray-400 mt-1">{r.release_date?.slice(0,4)} · ⭐ {r.vote_average?.toFixed(1)}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
}
