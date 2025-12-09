// Service d'authentification - Adapté pour l'API AdonisJS backend

import { apiClient } from "../client"
import { ENDPOINTS } from "../constants/endpoints"
import type { LoginCredentials, RegisterData, AuthResponse, User, ApiResponse, CreateAdminData } from "../types"

class AuthService {
  private readonly TOKEN_KEY = "auth_token"

  /**
   * Connecte un administrateur avec email et mot de passe
   * Route: POST /api/admin/auth/login
   * Retourne: { success, message, data: { user, session: { token, refreshToken, expiresAt } } }
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log("[v0] Tentative de connexion admin avec:", credentials.email)

    try {
      const response = await apiClient.post<AuthResponse>(ENDPOINTS.AUTH.LOGIN, credentials)

      console.log("[v0] Réponse de connexion:", response)

      // Vérifier la structure de la réponse
      if (response.success && response.data?.session?.token) {
        // Stocker le token de session dans localStorage
        localStorage.setItem(this.TOKEN_KEY, response.data.session.token)
        console.log("[v0] Token de session stocké avec succès")
        return response
      } else {
        throw new Error(response.message || "Format de réponse invalide: token manquant")
      }
    } catch (error: any) {
      console.error("[v0] Erreur lors de la connexion:", error)

      // Gérer les erreurs de validation
      if (error.status === 400 && error.errors) {
        const errorMessages = Object.values(error.errors).flat().join(", ")
        throw new Error(errorMessages || error.message || "Erreur de validation")
      }

      throw new Error(error.message || "Erreur lors de la connexion")
    }
  }

  /**
   * Inscrit un nouveau client (mobile)
   * Route: POST /api/auth/register
   */
  async register(userData: RegisterData): Promise<ApiResponse<User>> {
    return apiClient.post<ApiResponse<User>>(ENDPOINTS.AUTH.REGISTER, userData)
  }

  /**
   * Crée un nouvel administrateur (super_admin uniquement)
   * Route: POST /api/admin/auth/create-admin
   */
  async createAdmin(adminData: CreateAdminData): Promise<ApiResponse<User>> {
    return apiClient.post<ApiResponse<User>>(ENDPOINTS.AUTH.CREATE_ADMIN, adminData)
  }

  /**
   * Déconnecte l'utilisateur actuel
   * Route: POST /api/admin/auth/logout (pour admin)
   * Route: POST /api/auth/logout (pour client)
   */
  async logout(): Promise<void> {
    try {
      console.log("[v0] Déconnexion en cours...")
      await apiClient.post<void>(ENDPOINTS.AUTH.LOGOUT)
      console.log("[v0] Déconnexion réussie")
    } catch (error) {
      console.error("[v0] Erreur lors de la déconnexion:", error)
    } finally {
      this.clearToken()
    }
  }

  /**
   * Récupère les informations de l'utilisateur connecté
   * Route: GET /api/admin/auth/me (pour admin)
   * Retourne: { success, data: { user } }
   */
  async getCurrentUser(): Promise<User> {
    console.log("[v0] Récupération du profil admin...")

    try {
      const response = await apiClient.get<ApiResponse<{ user: User }>>(ENDPOINTS.AUTH.ME)

      console.log("[v0] Profil admin récupéré:", response)

      if (response.success && response.data?.user) {
        return response.data.user
      }

      throw new Error("Format de réponse invalide: utilisateur manquant")
    } catch (error: any) {
      console.error("[v0] Erreur lors de la récupération du profil:", error)
      throw error
    }
  }

  /**
   * Récupère le token d'authentification
   */
  getToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(this.TOKEN_KEY)
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    return !!this.getToken()
  }

  /**
   * Supprime le token d'authentification
   */
  clearToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.TOKEN_KEY)
      console.log("[v0] Token supprimé du localStorage")
    }
  }

  /**
   * Vérifie si le token est valide en faisant un appel à l'API
   */
  async validateToken(): Promise<boolean> {
    try {
      await this.getCurrentUser()
      return true
    } catch (error) {
      console.error("[v0] Token invalide:", error)
      this.clearToken()
      return false
    }
  }

  /**
   * Rafraîchit les données de l'utilisateur connecté
   */
  async refreshUser(): Promise<User | null> {
    try {
      if (!this.isAuthenticated()) {
        console.log("[v0] Aucun token trouvé, utilisateur non authentifié")
        return null
      }
      return await this.getCurrentUser()
    } catch (error) {
      console.error("[v0] Erreur lors du rafraîchissement de l'utilisateur:", error)
      this.clearToken()
      return null
    }
  }

  /**
   * Vérifie si l'utilisateur connecté a une permission spécifique
   */
  async hasPermission(permissionName: string): Promise<boolean> {
    try {
      const user = await this.getCurrentUser()
      return user.permissions?.includes(permissionName) || false
    } catch (error) {
      return false
    }
  }

  /**
   * Vérifie si l'utilisateur connecté a un rôle spécifique
   */
  async hasRole(roleName: string): Promise<boolean> {
    try {
      const user = await this.getCurrentUser()
      return user.roles.some((role) => role.nom === roleName)
    } catch (error) {
      return false
    }
  }

  /**
   * Vérifie si l'utilisateur est un super admin
   */
  async isSuperAdmin(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser()
      return user.typeCompte === "super_admin"
    } catch (error) {
      return false
    }
  }

  /**
   * Vérifie si l'utilisateur est un admin (admin ou super_admin)
   */
  async isAdmin(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser()
      return ["admin", "super_admin"].includes(user.typeCompte)
    } catch (error) {
      return false
    }
  }
}

export const authService = new AuthService()
