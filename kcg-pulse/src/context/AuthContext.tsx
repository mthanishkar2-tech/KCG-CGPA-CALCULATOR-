"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      // Route protection logic
      if (!currentUser && !pathname.includes('/login') && !pathname.includes('/signup')) {
        router.push('/login');
      } else if (currentUser && (pathname.includes('/login') || pathname.includes('/signup') || pathname === '/')) {
        router.push('/dashboard');
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {/* FORCE GIT UPDATE - If loading, show a dark cyberpunk loading screen to prevent hydration crashes */}
      {loading ? (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
          <div className="text-kcg-blue font-bold tracking-widest animate-pulse">
            INITIALIZING PULSE...
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
