import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
}

interface Profile {
  id: string;
  name: string | null;
  company: string | null;
  role: string | null;
  industry: string | null;
  target_audience: string | null;
  tone: string;
  bio: string | null;
  linkedin_connected: boolean;
  onboarding_completed: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock user for demo - will be replaced with Supabase
const MOCK_USER: User = { id: 'demo-user-1', email: 'ceo@example.com' };

const DEFAULT_PROFILE: Profile = {
  id: 'demo-user-1',
  name: null,
  company: null,
  role: null,
  industry: null,
  target_audience: null,
  tone: 'visionary',
  bio: null,
  linkedin_connected: false,
  onboarding_completed: false,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('ceo-autopilot-auth');
    if (saved) {
      setUser(MOCK_USER);
      const savedProfile = localStorage.getItem('ceo-autopilot-profile');
      setProfile(savedProfile ? JSON.parse(savedProfile) : DEFAULT_PROFILE);
    }
    setLoading(false);
  }, []);

  const signIn = async (_email: string, _password: string) => {
    setUser(MOCK_USER);
    const savedProfile = localStorage.getItem('ceo-autopilot-profile');
    const p = savedProfile ? JSON.parse(savedProfile) : DEFAULT_PROFILE;
    setProfile(p);
    localStorage.setItem('ceo-autopilot-auth', 'true');
  };

  const signUp = async (_email: string, _password: string) => {
    setUser(MOCK_USER);
    setProfile(DEFAULT_PROFILE);
    localStorage.setItem('ceo-autopilot-auth', 'true');
    localStorage.setItem('ceo-autopilot-profile', JSON.stringify(DEFAULT_PROFILE));
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('ceo-autopilot-auth');
  };

  const resetPassword = async (_email: string) => {
    // Will integrate with Supabase
  };

  const updatePassword = async (_password: string) => {
    // Will integrate with Supabase
  };

  const refreshProfile = async () => {
    const savedProfile = localStorage.getItem('ceo-autopilot-profile');
    if (savedProfile) setProfile(JSON.parse(savedProfile));
  };

  const updateProfile = async (data: Partial<Profile>) => {
    const updated = { ...profile, ...data } as Profile;
    setProfile(updated);
    localStorage.setItem('ceo-autopilot-profile', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, resetPassword, updatePassword, refreshProfile, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
