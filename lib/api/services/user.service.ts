// Service de gestion des utilisateurs - Adapté pour l'API AdonisJS backend

import { BaseService } from "./base.service"
import { ENDPOINTS } from "../constants/endpoints"
import type { User, CreateUserData, UpdateUserData, Role, AssignRoleData, ApiResponse } from "../types"

class UserService extends BaseService<User, CreateUserData, UpdateUserData> {
  constructor() {
    super(ENDPOINTS.USERS.BASE)
  }

  /**
   * Récupère tous les utilisateurs avec leurs rôles et permissions
   * Route: GET /api/admin/users
   * Retourne: { success, data: { data: User[], meta: {...} } }
   */
  async getAllUsers(): Promise<User[]> {
    console.log("[v0] Récupération de tous les utilisateurs...")

    try {
      const response = await this.customRequest<{
        success: boolean
        data: {
          data: User[]
          meta?: {
            total: number
            per_page: number
            current_page: number
            last_page: number
          }
        }
      }>("GET", `${this.baseEndpoint}?limit=1000`)

      console.log("[v0] Réponse API utilisateurs complète:", JSON.stringify(response, null, 2))
      console.log("[v0] Type de response:", typeof response)
      console.log("[v0] Clés de response:", Object.keys(response))

      // L'API retourne { success: true, data: { data: [...], meta: {...} } }
      if (response && typeof response === "object" && "data" in response) {
        const dataWrapper = response.data
        console.log("[v0] dataWrapper:", dataWrapper)
        console.log("[v0] Type de dataWrapper:", typeof dataWrapper)

        if (dataWrapper && typeof dataWrapper === "object" && "data" in dataWrapper) {
          const usersArray = dataWrapper.data
          console.log("[v0] usersArray:", usersArray)
          console.log("[v0] Type de usersArray:", typeof usersArray)
          console.log("[v0] Est un tableau?", Array.isArray(usersArray))

          if (Array.isArray(usersArray)) {
            console.log("[v0] ✅ Utilisateurs extraits avec succès:", usersArray.length)
            return usersArray
          }
        }
      }

      console.warn("[v0] ⚠️ Format de réponse inattendu, retour tableau vide")
      console.warn("[v0] Structure reçue:", response)
      return []
    } catch (error) {
      console.error("[v0] ❌ Erreur lors de la récupération des utilisateurs:", error)
      throw error
    }
  }

  /**
   * Récupère un utilisateur par son ID avec ses rôles et permissions
   * Route: GET /api/admin/users/:id
   * Retourne: { success, data: User }
   */
  async getUserById(id: number): Promise<User> {
    console.log("[v0] Récupération de l'utilisateur ID:", id)
    return this.getById(id)
  }

  /**
   * Crée un nouvel utilisateur
   * Route: POST /api/admin/users
   * Retourne: { success, message, data: User }
   */
  async createUser(userData: CreateUserData): Promise<User> {
    console.log("[v0] Création d'un nouvel utilisateur:", userData.email)
    return this.create(userData)
  }

  /**
   * Met à jour un utilisateur existant
   * Route: PUT /api/admin/users/:id
   * Retourne: { success, message, data: User }
   */
  async updateUser(id: number, userData: UpdateUserData): Promise<User> {
    console.log("[v0] Mise à jour de l'utilisateur ID:", id)
    return this.update(id, userData)
  }

  /**
   * Supprime un utilisateur
   * Route: DELETE /api/admin/users/:id
   * Retourne: { success, message }
   */
  async deleteUser(id: number): Promise<void> {
    console.log("[v0] Suppression de l'utilisateur ID:", id)
    return this.delete(id)
  }

  /**
   * Récupère les rôles d'un utilisateur spécifique
   * Route: GET /api/admin/users/:id/roles
   * Retourne: { success, data: { utilisateur_id, roles, permissions } }
   */
  async getUserRoles(userId: number): Promise<{
    utilisateur_id: number
    roles: Role[]
    permissions: string[]
  }> {
    console.log("[v0] Récupération des rôles de l'utilisateur ID:", userId)
    return this.customRequest<{
      utilisateur_id: number
      roles: Role[]
      permissions: string[]
    }>("GET", ENDPOINTS.USERS.ROLES(userId))
  }

  /**
   * Assigne un rôle à un utilisateur
   * Route: POST /api/admin/roles/assign
   * Body: { utilisateur_id, role_id }
   * Retourne: { success, message }
   */
  async assignRoleToUser(data: AssignRoleData): Promise<ApiResponse> {
    console.log("[v0] Attribution du rôle:", data)
    return this.customRequest<ApiResponse>("POST", ENDPOINTS.ROLES.ASSIGN, data)
  }

  /**
   * Retire un rôle d'un utilisateur
   * Route: DELETE /api/admin/roles/remove
   * Body: { utilisateur_id, role_id }
   * Retourne: { success, message }
   */
  async removeRoleFromUser(data: AssignRoleData): Promise<ApiResponse> {
    console.log("[v0] Retrait du rôle:", data)
    return this.customRequest<ApiResponse>("DELETE", ENDPOINTS.ROLES.REMOVE, data)
  }

  /**
   * Recherche des utilisateurs par nom, prénom ou email (côté client)
   */
  async searchUsers(query: string): Promise<User[]> {
    console.log("[v0] Recherche d'utilisateurs avec le terme:", query)
    const users = await this.getAllUsers()
    return users.filter(
      (user) =>
        user.nom.toLowerCase().includes(query.toLowerCase()) ||
        user.prenom.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase()),
    )
  }

  /**
   * Filtre les utilisateurs par rôle (côté client)
   */
  async getUsersByRole(roleName: string): Promise<User[]> {
    console.log("[v0] Filtrage des utilisateurs par rôle:", roleName)
    const users = await this.getAllUsers()
    return users.filter((user) => user.roles.some((role) => role.nom.toLowerCase() === roleName.toLowerCase()))
  }

  /**
   * Vérifie si un utilisateur a une permission spécifique
   */
  async userHasPermission(userId: number, permissionName: string): Promise<boolean> {
    try {
      const userRoles = await this.getUserRoles(userId)
      return userRoles.permissions.includes(permissionName)
    } catch (error) {
      console.error("[v0] Erreur lors de la vérification des permissions:", error)
      return false
    }
  }

  /**
   * Récupère les statistiques des utilisateurs
   */
  async getUserStats(): Promise<{
    total: number
    byRole: Record<string, number>
    recent: User[]
  }> {
    console.log("[v0] Récupération des statistiques utilisateurs...")
    const users = await this.getAllUsers()

    // Comptage des utilisateurs par rôle
    const byRole: Record<string, number> = {}
    users.forEach((user) => {
      user.roles.forEach((role) => {
        byRole[role.nom] = (byRole[role.nom] || 0) + 1
      })
    })

    // Utilisateurs récents (derniers 30 jours)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recent = users.filter((user) => new Date(user.createdAt) > thirtyDaysAgo).slice(0, 10)

    return {
      total: users.length,
      byRole,
      recent,
    }
  }
}

const userService = new UserService()

export { userService }
export default userService
