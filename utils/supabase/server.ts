import { createServerClient as supabaseCreateServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"

export function createClient() {
  const cookieStore = cookies()

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
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null } }),
        getUser: () => Promise.resolve({ data: { user: null } }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: new Error("Supabase client not properly initialized") }),
          }),
        }),
      }),
    } as any
  }

  return supabaseCreateServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.set({ name, value: "", ...options })
      },
    },
  })
}

// Add createServerClient as a named export that uses the same implementation as createClient
export const createServerClient = createClient

