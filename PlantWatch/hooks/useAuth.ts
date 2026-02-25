import { signIn, signUp } from '@/services/auth'
import { useState } from 'react'
import { Alert } from 'react-native'

interface UseAuthReturn {
  loading: boolean
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [loading, setLoading] = useState<boolean>(false)

  const signInWithEmail = async (
    email: string,
    password: string
  ): Promise<void> => {
    setLoading(true)

    const { error } = await signIn(email, password)

    if (error) Alert.alert(error.message)

    setLoading(false)
  }

  const signUpWithEmail = async (
    email: string,
    password: string
  ): Promise<void> => {
    setLoading(true)

    const { session, error } = await signUp(email, password)

    if (error) Alert.alert(error.message)
    if (!session) Alert.alert('Check your email for verification.')

    setLoading(false)
  }

  return {
    loading,
    signInWithEmail,
    signUpWithEmail,
  }
}