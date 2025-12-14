"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { AuthUser } from "./types"

interface AuthContextType {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem("alumni_hub_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication - in production, this would call Strapi's /login endpoint
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock users for demo
    const mockCredentials: Record<string, { password: string; user: User }> = {
      "superadmin@alumni.com": {
        password: "SLTdigitalPlatforms2025@",
        user: {
          id: "1",
          email: "superadmin@alumni.com",
          username: "superadmin",
          role: "super_admin",
        },
      },
      "computeradmin@alumni.com": {
        password: "admin123",
        user: {
          id: "field-admin-3",
          email: "computeradmin@alumni.com",
          username: "computeradmin",
          role: "field_admin",
          assignedField: "Computer",
        },
      },
      "civiladmin@alumni.edu": {
        password: "admin123",
        user: {
          id: "field-admin-2",
          email: "civiladmin@alumni.edu",
          username: "civiladmin",
          role: "field_admin",
          assignedField: "Civil",
        },
      },
    }

    const authData = mockCredentials[email]
    if (authData && authData.password === password) {
      setUser(authData.user)
      localStorage.setItem("alumni_hub_user", JSON.stringify(authData.user))
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("alumni_hub_user")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
