"use client";
import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import { Bebas_Neue, DM_Sans } from 'next/font/google';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnon);

const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400' });
const dmsans = DM_Sans({ subsets: ['latin'], weight: '400' });

const NAV = [
  { href: '/dashboard', label: 'Home', icon: '🏠' },
  { href: '/dashboard/discover', label: 'Discover', icon: '🔍' },
  { href: '/dashboard/watchlist', label: 'My Watchlist', icon: '🎬' },
  { href: '/dashboard/badges', label: 'Badges', icon: '🏆' },
  { href: '/dashboard/log', label: 'Log', icon: '✏️' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [confirmed, setConfirmed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Single auth check — no double-setLoading false
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setConfirmed(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setConfirmed(true);
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Redirect only AFTER we confirmed auth state (no flickering, no loops)
  useEffect(() => {
    if (confirmed && !session) {
      router.push('/login');
    }
  }, [confirmed, session, router]);

  async function handleSignOut() {
    setConfirmed(false);
    setSession(null);
    await supabase.auth.signOut();
    router.push('/login');
  }

  // Still loading — show splash
  if (!confirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <div className="text-brand text-3xl animate-pulse tracking-widest">CineMine</div>
      </div>
    );
  }

  // No session — splash is replaced by redirect above
  if (!session) return null;

  return (
    <div className="min-h-screen flex bg-dark text-white">
      {/* Mobile toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-dark/90 p-2 rounded-lg border border-white/10"
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen || window?.innerWidth >= 768 ? 0 : -260 }}
        className="fixed md:static inset-y-0 left-0 z-40 w-64 bg-dark border-r border-white/10 flex flex-col"
      >
        <div className="p-6 border-b border-white/10">
          <Link href="/dashboard">
            <h1 className={'text-3xl text-brand tracking-wider ' + bebas.className}>CineMine</h1>
            <p className={'text-xs text-gray-400 ' + dmsans.className}>Your Movies. Your Rules.</p>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {NAV.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-brand text-white' : 'hover:bg-white/5 text-gray-300'}`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className={'font-medium ' + dmsans.className}>{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 transition-all"
          >
            <span className="text-xl">🚪</span>
            <span className={'font-medium ' + dmsans.className}>Sign Out</span>
          </button>
        </div>
      </motion.aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="flex-1 min-h-screen p-6 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
