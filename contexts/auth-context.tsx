"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { authService } from "@/lib/api/services/auth.service"
import type { User } from "@/lib/api/types"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  /**
   * Rafraîchit les données de l'utilisateur connecté
   */
  const refreshUser = async () => {
    try {
      console.log("[v0] AuthProvider: Vérification de l'authentification...")

      if (authService.isAuthenticated()) {
        console.log("[v0] AuthProvider: Token trouvé, récupération du profil...")
        const userData = await authService.getCurrentUser()
        console.log("[v0] AuthProvider: Utilisateur connecté:", userData.email)
        setUser(userData)
      } else {
        console.log("[v0] AuthProvider: Aucun token trouvé")
        setUser(null)
      }
    } catch (error) {
      console.error("[v0] AuthProvider: Erreur lors de la récupération de l'utilisateur:", error)
      // Nettoyer le token invalide
      authService.clearToken()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Connecte un utilisateur
   */
  const login = async (email: string, password: string) => {
    try {
      console.log("[v0] AuthProvider: Tentative de connexion...")
      const response = await authService.login({ email, password })

      if (response.success && response.data?.user) {
        console.log("[v0] AuthProvider: Connexion réussie, utilisateur:", response.data.user.email)
        setUser(response.data.user)
      } else {
        throw new Error("Format de réponse invalide")
      }
    } catch (error: any) {
      console.error("[v0] AuthProvider: Erreur de connexion:", error)
      // Propager l'erreur avec le message approprié
      throw new Error(error.message || "Identifiants incorrects")
    }
  }

  /**
   * Déconnecte l'utilisateur
   */
  const logout = async () => {
    try {
      console.log("[v0] AuthProvider: Déconnexion...")
      await authService.logout()
      setUser(null)
      console.log("[v0] AuthProvider: Déconnexion réussie")
    } catch (error) {
      console.error("[v0] AuthProvider: Erreur lors de la déconnexion:", error)
      // Même en cas d'erreur, on déconnecte localement
      authService.clearToken()
      setUser(null)
    }
  }

  // Vérifier l'authentification au chargement
  useEffect(() => {
    refreshUser()
  }, [])

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider")
  }
  return context
}
