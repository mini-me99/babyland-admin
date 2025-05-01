import { createClient } from "@supabase/supabase-js"

// Create a Supabase client for server-side use
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.https://evmscqviiehistuqfneh.supabase.co || process.env.https://evmscqviiehistuqfneh.supabase.co
  const supabaseKey = process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2bXNjcXZpaWVoaXN0dXFmbmVoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTk2MzI0MiwiZXhwIjoyMDYxNTM5MjQyfQ.9CA0ljAXnVfV1mlxlLIGoiF6O5X15sij1QTXCB_gYX8

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables for server client:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
    })
  }

  return createClient(supabaseUrl!, supabaseKey!)
}

// Create a Supabase client for client-side use
let clientSupabaseClient: ReturnType<typeof createClient> | null = null

export const createClientSupabaseClient = () => {
  if (clientSupabaseClient) return clientSupabaseClient

  const supabaseUrl = process.env.https://evmscqviiehistuqfneh.supabase.co
  const supabaseKey = process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2bXNjcXZpaWVoaXN0dXFmbmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5NjMyNDIsImV4cCI6MjA2MTUzOTI0Mn0.bjCn8qKFLdzoJ9QAEk0-rN7UIDZOXSA_BC1psL9OtcY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables for client:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
    })
  }

  clientSupabaseClient = createClient(supabaseUrl!, supabaseKey!)
  return clientSupabaseClient
}
