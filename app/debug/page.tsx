"use client"

import { useState, useEffect } from "react"
import { createClientSupabaseClient } from "@/lib/supabase"

export default function DebugPage() {
  const [envVars, setEnvVars] = useState<{ [key: string]: string | undefined }>({})
  const [dbTest, setDbTest] = useState<{ success: boolean; message: string; count?: number }>({
    success: false,
    message: "Not tested yet",
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check environment variables
    setEnvVars({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 5)}...`
        : undefined,
    })

    // Test database connection
    async function testConnection() {
      setIsLoading(true)
      try {
        const supabase = createClientSupabaseClient()
        const { data, error, count } = await supabase.from("products").select("*", { count: "exact" }).limit(1)

        if (error) {
          setDbTest({
            success: false,
            message: `Error: ${error.message}`,
          })
        } else {
          setDbTest({
            success: true,
            message: "Successfully connected to database",
            count: count || 0,
          })
        }
      } catch (err: any) {
        setDbTest({
          success: false,
          message: `Exception: ${err.message}`,
        })
      } finally {
        setIsLoading(false)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Debug Information</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Environment Variables</h2>
        <div className="bg-gray-100 p-4 rounded">
          {Object.entries(envVars).map(([key, value]) => (
            <div key={key} className="mb-2">
              <span className="font-medium">{key}:</span> {value || "Not defined"}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Database Connection Test</h2>
        <div className={`p-4 rounded ${dbTest.success ? "bg-green-100" : "bg-red-100"}`}>
          {isLoading ? (
            <p>Testing connection...</p>
          ) : (
            <>
              <p className="font-medium">{dbTest.message}</p>
              {dbTest.success && <p className="mt-2">Products in database: {dbTest.count}</p>}
            </>
          )}
        </div>
      </div>

      <div className="mt-8 text-sm text-gray-500">
        <p>Note: This page only tests client-side access. Server-side issues may still exist.</p>
      </div>
    </div>
  )
}
