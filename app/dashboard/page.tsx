"use client";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DM_Sans, Bebas_Neue } from 'next/font/google';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const dmsans = DM_Sans({ subsets: ['latin'], weight: '400' });
const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

type Movie = {
  id: number;
  title: string;
  poster_path: string | null;
  release_date?: string;
  vote_average?: number;
};

type HistoryItem = {
  id: string;
  title: string;
  poster_path: string;
  rating: number;
  mood: string;
  watched_at: string;
  year: number;
};

export default function DashboardHome() {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const tmdbKey = process.env.NEXT_PUBLIC_TMDB_API_KEY as string;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user?.id;
      if (uid) {
        supabase
          .from('watch_history')
          .select('*')
          .eq('user_id', uid)
          .order('watched_at', { ascending: false })
          .limit(50)
          .then(({ data: hist }) => {
            if (hist) setHistory(hist as HistoryItem[]);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });
    if (tmdbKey) {
      fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${tmdbKey}`)
        .then(res => res.json())
        .then(data => setTrending((data.results || []) as Movie[]))
        .catch(() => {});
    }
  }, []);

  const totalWatched = history.length;
  const favoriteGenre = (() => {
    const counts: Record<string, number> = {};
    history.forEach(h => { if (h.mood) counts[h.mood] = (counts[h.mood] || 0) + 1; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (!top) return 'N/A';
    const moodLabels: Record<string, string> = {
      'mind-blow': '🧠 Mind Blown', 'emotional': '🥲 Emotional', 'scared': '😱 Scared',
      'laughing': '😂 Laughing', 'motivated': '💪 Motivated', 'relaxed': '😌 Relaxed',
    };
    return moodLabels[top[0]] || top[0];
  })();
  const thisMonth = history.filter(h => {
    const d = new Date(h.watched_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const avgRating = history.length > 0
    ? (history.reduce((s, h) => s + (h.rating || 0), 0) / history.length).toFixed(1)
    : 'N/A';

  return (
    <div className={dmsans.className}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={"text-4xl font-bold tracking-wide " + bebas.className}>Welcome Back!</h1>
          <p className="text-gray-400 mt-1">Here is your cinema universe</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/log" className="px-4 py-2 bg-brand text-white rounded-lg font-semibold text-sm">
            + Log Movie
          </Link>
          <Link href="/dashboard/discover" className="px-4 py-2 bg-white/10 text-white rounded-lg font-semibold text-sm">
            🔍 Discover
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Watched', value: totalWatched, icon: '🎬', color: 'text-brand' },
          { label: 'Favourite Mood', value: favoriteGenre, icon: '🎯', color: 'text-yellow-400' },
          { label: 'This Month', value: thisMonth, icon: '📅', color: 'text-blue-400' },
          { label: 'Avg Rating', value: avgRating + ' ⭐', icon: '⭐', color: 'text-orange-400' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white/5 border border-white/10 rounded-xl p-4"
          >
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-400 mt-1">{stat.icon} {stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Recently Watched */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className={"text-2xl font-bold " + bebas.className}>Recently Watched</h2>
          <Link href="/dashboard/watchlist" className="text-sm text-gray-400 hover:text-brand">View All →</Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-56 bg-white/5 rounded-xl animate-pulse" />)}
          </div>
        ) : history.length === 0 ? (
          <div className="bg-white/5 rounded-xl p-8 text-center text-gray-400">
            <div className="text-4xl mb-3">🎬</div>
            <p className="text-lg">No movies logged yet</p>
            <Link href="/dashboard/log" className="text-brand text-sm mt-2 inline-block">Log your first movie →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-6 gap-4">
            {history.slice(0, 6).map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(229,9,20,0.3)' }}
                className="rounded-xl overflow-hidden bg-white/5 cursor-pointer group"
              >
                <div className="h-48" style={{ backgroundImage: item.poster_path ? `url(https://image.tmdb.org/t/p/w500${item.poster_path})` : undefined, backgroundSize: 'cover', backgroundColor: '#333' }} />
                <div className="p-2">
                  <div className="text-xs font-semibold truncate">{item.title}</div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">{item.year}</span>
                    <span className="text-brand text-xs">{'★'.repeat(item.rating || 3)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Trending */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className={"text-2xl font-bold " + bebas.className}>Trending Now</h2>
          <Link href="/dashboard/discover" className="text-sm text-gray-400 hover:text-brand">Explore →</Link>
        </div>
        <div className="grid grid-cols-6 gap-4">
          {trending.slice(0, 6).map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(229,9,20,0.3)' }}
              className="rounded-xl overflow-hidden bg-white/5 cursor-pointer"
            >
              <div className="h-48" style={{ backgroundImage: m.poster_path ? `url(https://image.tmdb.org/t/p/w500${m.poster_path})` : undefined, backgroundSize: 'cover', backgroundColor: '#333' }} />
              <div className="p-2">
                <div className="text-xs font-semibold truncate">{m.title}</div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-500">{m.release_date?.slice(0,4)}</span>
                  <span className="text-yellow-400 text-xs">⭐ {m.vote_average?.toFixed(1)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
