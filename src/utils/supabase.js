import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isMock = !supabaseUrl || !supabaseKey

if (isMock) {
  console.warn('[Supabase] ENV vars missing — running in mock mode. Add .env to connect real Supabase.')
}

/* ── Mock client for UI development without Supabase credentials ── */
const mockClient = {
  auth: {
    getSession:         async () => ({ data: { session: null }, error: null }),
    getUser:            async () => ({ data: { user: null }, error: null }),
    signInWithOtp:      async () => ({ error: null }),
    verifyOtp:          async () => ({ error: null }),
    signInWithPassword: async ({ email, password }) => {
      if (email && password) return { data: {}, error: null }
      return { data: null, error: { message: 'Email and password required.' } }
    },
    updateUser: async () => ({ error: null }),
    signOut:    async () => ({ error: null }),
  },
}

export const supabase = isMock
  ? mockClient
  : createClient(supabaseUrl, supabaseKey)
