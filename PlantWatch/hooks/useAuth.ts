import { signIn, signUp } from '@/services/auth'
import { supabase } from '@/util/supabase'
import { Session, User } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { Alert } from 'react-native'

let globalSession: Session | null = null;
let listeners: Array<(session: Session | null) => void> = [];

// Initialize auth listener once
supabase.auth.onAuthStateChange((_event, session) => {
  globalSession = session;
  listeners.forEach(listener => listener(session));
});

interface UseAuthReturn {
  loading: boolean
  session: Session | null
  user: User | null 
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, first_name: string, last_name: string) => Promise<void>
  signOut: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [loading, setLoading] = useState<boolean>(false)
  const [session, setSession] = useState<Session | null>(globalSession);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      globalSession = session;
      setSession(session);
      setLoading(false);
    });

    // Subscribe to changes
    listeners.push(setSession);

    return () => { listeners = listeners.filter(l => l !== setSession) };
  }, []);

  const signInWithEmail = async (
    email: string,
    password: string
  ): Promise<void> => {
    setLoading(true);
    console.log("signing in");
    const { session, error } = await signIn(email, password);
    console.log(session);
    if (error) Alert.alert(error.message);

    setLoading(false);
  }

  const signUpWithEmail = async (
    email: string,
    password: string,
    first_name: string,
    last_name: string
  ): Promise<void> => {
    setLoading(true);

    const { session, error } = await signUp(email, password, first_name, last_name);

    if (error) Alert.alert(error.message);
    if (!session) Alert.alert('Check your email for verification.')
    Alert.alert("Success?");

    setLoading(false);
  }

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    loading: loading,
    session: session,
    user: session?.user ?? null,
    signInWithEmail,
    signUpWithEmail,
    signOut
  }
}