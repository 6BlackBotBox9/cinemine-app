"use client";
import Link from 'next/link'
import { Bebas_Neue, DM_Sans } from 'next/font/google'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400' })
const dmsans = DM_Sans({ subsets: ['latin'], weight: '400' })

type TMDBMovie = {
  id: number;
  title: string;
  poster_path: string | null;
  release_date?: string;
  vote_average?: number;
}

const FEATURES = [
  { icon: '🎯', title: 'Spin the Wheel', desc: 'Let fate pick your next movie with our random picker' },
  { icon: '🎭', title: 'Mood Filters', desc: '8 mood-based filters to match your vibe' },
  { icon: '🏆', title: 'Badge System', desc: 'Earn achievements as you track your journey' },
];

const STATS = [
  { value: '10,000+', label: 'Movies' },
  { value: '8', label: 'Mood Filters' },
  { value: '🎯', label: 'Spin The Wheel' },
];

export default function Landing() {
  const [trending, setTrending] = useState<TMDBMovie[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setLoaded(true);
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY as string;
    if (!apiKey) return;
    fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${apiKey}`)
      .then(res => res.json())
      .then(data => setTrending((data.results || []).slice(0, 18)))
      .catch(() => setTrending([]));
  }, []);

  return (
    <main className="min-h-screen bg-dark text-white relative overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center p-8">
        {/* Background poster mosaic */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="grid grid-cols-6 gap-1 w-full h-full absolute inset-0">
            {trending.map(m => (
              <div key={m.id} className="relative">
                <div className="absolute inset-0" style={{ backgroundImage: m.poster_path ? `url(https://image.tmdb.org/t/p/w500${m.poster_path})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark/60 to-dark" />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 30 }}
            transition={{ duration: 0.8 }}
            className={"text-7xl md:text-9xl font-bold tracking-widest text-brand mb-2 " + bebas.className}
          >
            CineMine
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: loaded ? 1 : 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className={dmsans.className + ' text-2xl md:text-3xl text-gray-200 mb-2'}
          >
            Your Movies. Your Rules. Your Universe.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: loaded ? 1 : 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className={dmsans.className + ' text-gray-400 mb-8'}
          >
            The ultimate movie tracking app for cinema lovers
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 20 }}
            transition={{ delay: 0.7 }}
            className="flex gap-4 justify-center"
          >
            <Link href="/signup" className="px-8 py-4 bg-brand text-white rounded-xl font-bold text-lg hover:brightness-110 transition-all">
              Start Tracking 🎬
            </Link>
            <Link href="/login" className="px-8 py-4 bg-white/10 text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all">
              Sign In
            </Link>
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 20 }}
          transition={{ delay: 1 }}
          className="relative z-10 flex gap-8 mt-12"
        >
          {STATS.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-bold text-brand">{s.value}</div>
              <div className="text-xs text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: loaded ? 1 : 0 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-500 text-sm animate-bounce"
        >
          ↓
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-20 px-8">
        <h2 className={"text-5xl font-bold text-center mb-12 " + bebas.className}>Built for Movie Lovers</h2>
        <div className="max-w-6xl mx-auto grid grid-cols-3 gap-8">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(229,9,20,0.2)' }}
              className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center"
            >
              <div className="text-5xl mb-4">{f.icon}</div>
              <h3 className={dmsans.className + ' text-xl font-bold mb-2'}>{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="py-20 px-8 bg-black/30">
        <h2 className={"text-5xl font-bold text-center mb-4 " + bebas.className}>Trending Movies</h2>
        <p className="text-center text-gray-400 mb-12">See what everyone is watching right now</p>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-6 gap-4">
            {trending.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ scale: 1.1, boxShadow: '0 0 25px rgba(229,9,20,0.4)', zIndex: 10 }}
                className="rounded-xl overflow-hidden bg-white/5 cursor-pointer relative group"
              >
                <div className="h-56" style={{ backgroundImage: m.poster_path ? `url(https://image.tmdb.org/t/p/w500${m.poster_path})` : undefined, backgroundSize: 'cover', backgroundColor: '#333' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <div>
                    <div className="text-xs font-semibold truncate">{m.title}</div>
                    <div className="text-xs text-gray-300">{m.release_date?.slice(0,4)} · ⭐ {m.vote_average?.toFixed(1)}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <h2 className={"text-6xl font-bold mb-4 text-brand " + bebas.className}>Ready to Start?</h2>
          <p className={dmsans.className + ' text-xl text-gray-300 mb-8'}>
            Join thousands of movie lovers tracking their cinema journey
          </p>
          <Link href="/signup" className="px-10 py-4 bg-brand text-white rounded-xl font-bold text-lg hover:brightness-110 transition-all inline-block">
            Create Free Account →
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-8 border-t border-white/10 text-center text-gray-500 text-sm">
        <span className={bebas.className + ' text-brand text-lg'}>CineMine</span> · Your Movies. Your Rules. Your Universe.
      </footer>
    </main>
  );
}
