"use client"

import type React from "react"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"

const publicRoutes = ["/", "/auth/login", "/auth/register", "/auth/forgot-password", "/test-auth"]

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user && !publicRoutes.includes(pathname)) {
      router.push("/auth/login")
    }
  }, [user, loading, pathname, router])

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If user is not authenticated and trying to access protected route
  if (!user && !publicRoutes.includes(pathname)) {
    return null // Will redirect in useEffect
  }

  return <>{children}</>
}
