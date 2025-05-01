"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function LoginPage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Simple password check - in a real app, you'd want to use a more secure method
      if (password === "1980") {
        // Set a cookie to maintain login state
        document.cookie = "admin_authenticated=true; path=/; max-age=86400" // 1 day
        router.push("/dashboard")
      } else {
        setError("كلمة المرور غير صحيحة")
      }
    } catch (err) {
      setError("حدث خطأ أثناء تسجيل الدخول")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="relative h-24 w-24">
              <Image src="/babyland-logo.png" alt="بيبي لاند" fill className="object-contain" />
            </div>
          </div>
          <h1 className="mt-2 text-center text-3xl font-bold text-blue-500">بيبي لاند</h1>
          <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">تسجيل الدخول للوحة التحكم</h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="password" className="sr-only">
                كلمة المرور
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="كلمة المرور"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {isLoading ? "جاري التحميل..." : "تسجيل الدخول"}
            </button>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>للدخول إلى لوحة التحكم، استخدم كلمة المرور: 1980</p>
          </div>
        </form>
      </div>
    </div>
  )
}
