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

const BADGES = [
  { id: 'century', label: 'Century Club', desc: 'Watched 100 movies', icon: '🏆', threshold: 100, type: 'total' },
  { id: 'genre-master', label: 'Genre Master', desc: '50 films in one genre', icon: '🎭', threshold: 50, type: 'genre' },
  { id: 'world-cinema', label: 'World Cinema', desc: 'Films from 10 countries', icon: '🌍', threshold: 10, type: 'country' },
  { id: 'night-owl', label: 'Night Owl', desc: '10 late night watches', icon: '🦉', threshold: 10, type: 'nightowl' },
  { id: 'auteur', label: 'Auteur', desc: '5 films by same director', icon: '🎬', threshold: 5, type: 'director' },
  { id: 'binge-king', label: 'Binge King', desc: 'Finished a series in one day', icon: '📺', threshold: 1, type: 'binge' },
  { id: 'old-soul', label: 'Old Soul', desc: '20 films before 1980', icon: '🌟', threshold: 20, type: 'old' },
  { id: 'critic', label: 'The Critic', desc: 'Written 50 reviews', icon: '🗣️', threshold: 50, type: 'reviews' },
];

type EarnedBadge = { badge_id: string; earned_at: string };

export default function BadgesPage() {
  const [earned, setEarned] = useState<string[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newBadge, setNewBadge] = useState<string | null>(null);
  const tmdbKey = process.env.NEXT_PUBLIC_TMDB_API_KEY as string;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user?.id;
      setUserId(uid || null);
      if (uid) loadData(uid);
      else setLoading(false);
    });
  }, []);

  async function loadData(uid: string) {
    setLoading(true);
    const [historyRes, badgeRes] = await Promise.all([
      supabase.from('watch_history').select('*').eq('user_id', uid).limit(200),
      supabase.from('user_badges').select('badge_id').eq('user_id', uid),
    ]);
    const hist = historyRes.data || [];
    const earnedIds = (badgeRes.data || []).map((b: any) => b.badge_id);
    setHistory(hist);
    checkNewBadges(uid, hist, earnedIds);
    setEarned(earnedIds);
    setLoading(false);
  }

  async function checkNewBadges(uid: string, hist: any[], earned: string[]) {
    const computed = computeBadges(hist);
    for (const b of computed) {
      if (!earned.includes(b)) {
        await supabase.from('user_badges').insert({ user_id: uid, badge_id: b });
        setEarned(prev => [...prev, b]);
        setNewBadge(b);
        setTimeout(() => setNewBadge(null), 4000);
      }
    }
  }

  function computeBadges(hist: any[]) {
    const ids: string[] = [];
    if (hist.length >= 100) ids.push('century');
    if (hist.filter(h => h.media_type === 'series').length >= 1) ids.push('binge-king');
    const oldCount = hist.filter(h => h.year && h.year < 1980).length;
    if (oldCount >= 20) ids.push('old-soul');
    const genreCounts: Record<string, number> = {};
    hist.forEach(h => { if (h.genre) genreCounts[h.genre] = (genreCounts[h.genre] || 0) + 1; });
    if (Object.values(genreCounts).some(c => c >= 50)) ids.push('genre-master');
    return ids;
  }

  const totalCount = history.length;
  const favoriteGenre = (() => {
    const counts: Record<string, number> = {};
    history.forEach(h => { if (h.genre) counts[h.genre] = (counts[h.genre] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  })();
  const thisMonth = history.filter(h => {
    const d = new Date(h.watched_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className={dmsans.className}>
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Watched', value: totalCount },
          { label: 'Favourite Genre', value: favoriteGenre },
          { label: 'This Month', value: thisMonth },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-xl p-4 text-center"
          >
            <div className="text-2xl font-bold text-brand">{stat.value}</div>
            <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <h2 className={"text-3xl font-bold mb-6 " + dmsans.className}>Badges</h2>

      {/* New badge popup */}
      <AnimatePresence>
        {newBadge && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, x: '-50%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-brand border-2 border-yellow-400 text-white px-8 py-4 rounded-2xl shadow-2xl text-center"
          >
            <div className="text-4xl mb-2">
              {BADGES.find(b => b.id === newBadge)?.icon}
            </div>
            <div className="font-bold text-lg">Badge Unlocked!</div>
            <div className="text-sm font-semibold">{BADGES.find(b => b.id === newBadge)?.label}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badge grid */}
      {loading ? (
        <div className="grid grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-40 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {BADGES.map((badge, i) => {
            const isEarned = earned.includes(badge.id);
            return (
              <motion.div
                key={badge.id}
                custom={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={isEarned ? { scale: 1.08, boxShadow: '0 0 30px rgba(255,215,0,0.5)' } : {}}
                className={`relative rounded-2xl p-6 text-center border-2 transition-all ${isEarned ? 'border-yellow-400 bg-yellow-400/10' : 'border-white/10 bg-white/5 opacity-50'}`}
              >
                <motion.div
                  animate={isEarned ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-5xl mb-3"
                >
                  {badge.icon}
                </motion.div>
                <div className={`font-bold text-sm ${isEarned ? 'text-yellow-400' : 'text-gray-400'}`}>
                  {badge.label}
                </div>
                <div className="text-xs text-gray-500 mt-1">{badge.desc}</div>
                {!isEarned && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-3xl opacity-20">🔒</div>
                  </div>
                )}
                {isEarned && (
                  <div className="absolute top-2 right-2 text-xs bg-yellow-400 text-black px-2 py-0.5 rounded-full font-bold">
                    ✓
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="mt-6 text-center text-gray-500 text-sm">
        {earned.length}/{BADGES.length} badges earned
      </div>
    </div>
  );
}
