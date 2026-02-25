import { supabase } from '@/util/supabase';
import { AuthError, Session } from '@supabase/supabase-js';

export async function signIn(
  email: string,
  password: string
): Promise<{ session: Session | null; error: AuthError | null }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return { session: data.session, error }
}

export async function signUp(
  email: string,
  password: string,
  first_name: string,
  last_name: string
): Promise<{ session: Session | null; error: AuthError | null }> {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
        data: {
            first_name: first_name,
            last_name: last_name
        }
    }
  })

  return { session: data.session, error }
}