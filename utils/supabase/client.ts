import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://knyyalrduzqekgjzgvwe.supabase.co"
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtueXlhbHJkdXpxZWtnanpndndlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyNzE2MzIsImV4cCI6MjA1ODg0NzYzMn0.4s0INweA9zQ6iJGZsnnkyoRK48nHGrnviso64ap46NQ"

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      "Supabase URL and Anon Key are required! Please check your environment variables:" +
        "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined.",
    )
    // Return a dummy client that will fail gracefully
    // This prevents the app from crashing immediately on the client
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null } }),
        // Add other commonly used methods with safe fallbacks
        signInWithPassword: () => Promise.reject(new Error("Supabase client not properly initialized")),
        signUp: () => Promise.reject(new Error("Supabase client not properly initialized")),
      },
      // Add other commonly used properties with safe fallbacks
    } as any
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}

