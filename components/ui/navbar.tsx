"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Package, ShoppingBag, BarChart2, LogOut, Menu, X } from "lucide-react"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    document.cookie = "admin_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    router.push("/")
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* الشعار */}
          <div className="flex-shrink-0">
            <Link href="/dashboard" className="flex items-center">
              <div className="relative h-10 w-10 mr-2">
                <Image src="/babyland-logo.png" alt="بيبي لاند" fill className="object-contain" />
              </div>
              <span className="text-xl font-bold text-blue-500">بيبي لاند - لوحة التحكم</span>
            </Link>
          </div>

          {/* القائمة للشاشات الكبيرة */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link
                href="/dashboard"
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium flex items-center",
                  pathname === "/dashboard"
                    ? "text-blue-500 bg-blue-50"
                    : "text-gray-700 hover:text-blue-500 hover:bg-blue-50",
                )}
              >
                <BarChart2 className="ml-2 h-4 w-4" />
                لوحة التحكم
              </Link>
              <Link
                href="/products"
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium flex items-center",
                  pathname.startsWith("/products")
                    ? "text-blue-500 bg-blue-50"
                    : "text-gray-700 hover:text-blue-500 hover:bg-blue-50",
                )}
              >
                <Package className="ml-2 h-4 w-4" />
                المنتجات
              </Link>
              <Link
                href="/orders"
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium flex items-center",
                  pathname.startsWith("/orders")
                    ? "text-blue-500 bg-blue-50"
                    : "text-gray-700 hover:text-blue-500 hover:bg-blue-50",
                )}
              >
                <ShoppingBag className="ml-2 h-4 w-4" />
                الطلبات
              </Link>
            </div>
          </div>

          {/* أيقونات */}
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-500 hover:bg-blue-50"
            >
              <LogOut className="ml-2 h-4 w-4" />
              <span className="hidden md:inline">تسجيل الخروج</span>
            </button>

            {/* زر القائمة للشاشات الصغيرة */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-500 hover:bg-blue-50 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* القائمة للشاشات الصغيرة */}
        {isMenuOpen && (
          <div className="md:hidden py-2">
            <div className="flex flex-col space-y-2 px-2 pb-3 pt-2">
              <Link
                href="/dashboard"
                className={cn(
                  "px-3 py-2 rounded-md text-base font-medium flex items-center",
                  pathname === "/dashboard"
                    ? "text-blue-500 bg-blue-50"
                    : "text-gray-700 hover:text-blue-500 hover:bg-blue-50",
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                <BarChart2 className="ml-2 h-5 w-5" />
                لوحة التحكم
              </Link>
              <Link
                href="/products"
                className={cn(
                  "px-3 py-2 rounded-md text-base font-medium flex items-center",
                  pathname.startsWith("/products")
                    ? "text-blue-500 bg-blue-50"
                    : "text-gray-700 hover:text-blue-500 hover:bg-blue-50",
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                <Package className="ml-2 h-5 w-5" />
                المنتجات
              </Link>
              <Link
                href="/orders"
                className={cn(
                  "px-3 py-2 rounded-md text-base font-medium flex items-center",
                  pathname.startsWith("/orders")
                    ? "text-blue-500 bg-blue-50"
                    : "text-gray-700 hover:text-blue-500 hover:bg-blue-50",
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                <ShoppingBag className="ml-2 h-5 w-5" />
                الطلبات
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
