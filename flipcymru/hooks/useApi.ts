"use client"

import { useAuth } from "@/contexts/AuthContext"
import ApiClient from "@/lib/api"
import { useMemo } from "react"

export function useApi() {
  const { getIdToken } = useAuth()

  const api = useMemo(() => {
    return new ApiClient(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000", getIdToken)
  }, [getIdToken])

  return api
}
