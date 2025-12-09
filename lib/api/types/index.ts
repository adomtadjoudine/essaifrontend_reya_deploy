// Types TypeScript centralisés - Adaptés pour l'API AdonisJS backend

/**
 * Structure de réponse standard de l'API
 */
export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  errors?: string[] | Record<string, string[]>
}

/**
 * Structure de réponse paginée
 */
export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    per_page: number
    current_page: number
    last_page: number
    first_page: number
    first_page_url: string
    last_page_url: string
    next_page_url: string | null
    previous_page_url: string | null
  }
}

// ============================================
// TYPES POUR LES UTILISATEURS
// ============================================

/**
 * Modèle utilisateur complet
 */
export interface User {
  id: number
  nom: string | null
  prenom: string | null
  fullName: string | null
  email: string
  telephone: string
  typeCompte: "client" | "admin" | "super_admin"
  emailVerified: boolean
  telephoneVerified: boolean
  derniereConnexion: string | null
  isActive: boolean
  isArchive: boolean
  dateArchive: string | null
  createdAt: string
  updatedAt: string | null
  createdBy: string | null
  updatedBy: string | null
  // Relations
  roles: Role[]
  permissions?: string[] // Liste des noms de permissions
  client?: Client // Profil client si typeCompte === "client"
}

/**
 * Profil client
 */
export interface Client {
  id: number
  codeClient: string
  estBloque: boolean
  dateBlocage: string | null
  raisonBlocage: string | null
  nombreCommandeTotal: number
  montantTotalDepense: number
  userId: number
  estActif: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Données pour créer un utilisateur
 */
export interface CreateUserData {
  nom: string
  prenom: string
  email: string
  password: string
  password_confirmation: string
  telephone: string
  typeCompte?: "client" | "admin" | "super_admin"
}

/**
 * Données pour mettre à jour un utilisateur
 */
export interface UpdateUserData {
  nom?: string
  prenom?: string
  email?: string
  telephone?: string
}

// ============================================
// TYPES POUR LES RÔLES
// ============================================

/**
 * Modèle rôle
 */
export interface Role {
  id: number
  nom: string
  description: string | null
  estActif: boolean
  isArchive: boolean
  dateArchive: string | null
  createdAt: string
  updatedAt: string
  createdBy: string | null
  updatedBy: string | null
  // Relations
  permissions: Permission[]
  users?: User[]
}

/**
 * Données pour créer un rôle
 */
export interface CreateRoleData {
  nom: string
  description?: string
}

/**
 * Données pour mettre à jour un rôle
 */
export interface UpdateRoleData {
  nom?: string
  description?: string
}

// ============================================
// TYPES POUR LES PERMISSIONS
// ============================================

/**
 * Modèle permission
 */
export interface Permission {
  id: number
  nom: string
  description: string | null
  estActif: boolean
  isArchive: boolean
  dateArchive: string | null
  createdAt: string
  updatedAt: string
  createdBy: string | null
  updatedBy: string | null
  // Relations
  roles?: Role[]
}

/**
 * Données pour créer une permission
 */
export interface CreatePermissionData {
  nom: string
  description?: string
}

/**
 * Données pour mettre à jour une permission
 */
export interface UpdatePermissionData {
  nom?: string
  description?: string
}

// ============================================
// TYPES POUR L'AUTHENTIFICATION
// ============================================

/**
 * Identifiants de connexion admin
 */
export interface LoginCredentials {
  email: string
  password: string
}

/**
 * Données d'inscription client
 */
export interface RegisterData {
  nom: string
  prenom: string
  email: string
  password: string
  password_confirmation: string
  telephone: string
}

/**
 * Réponse de connexion admin
 */
export interface AuthResponse {
  success: boolean
  message: string
  data: {
    user: User
    session: {
      token: string
      refreshToken: string | null
      expiresAt: string
    }
  }
}

/**
 * Données pour créer un admin
 */
export interface CreateAdminData {
  nom: string
  prenom: string
  email: string
  password: string
  password_confirmation: string
  telephone: string
  typeCompte: "admin" | "super_admin"
}

// ============================================
// TYPES POUR LES ASSIGNATIONS
// ============================================

/**
 * Données pour assigner/retirer des rôles à un utilisateur
 */
export interface AssignRoleData {
  roleIds: number[]
}

/**
 * Données pour assigner/retirer des permissions à un rôle
 */
export interface AssignPermissionData {
  permissionIds: number[]
}

// ============================================
// TYPES D'ERREUR
// ============================================

/**
 * Structure d'erreur API
 */
export interface ApiError {
  message: string
  status: number
  errors?: string[] | Record<string, string[]>
}

// ============================================
// TYPES POUR LES REQUÊTES
// ============================================

/**
 * Configuration des requêtes HTTP
 */
export interface RequestConfig {
  headers?: Record<string, string>
  timeout?: number
  retries?: number
}

// Exporter les types des autres modules
export * from "./service"
export * from "./type-linge"
export * from "./temperature"
export * from "./option-traitement"
export * from "./tranche-tarifaire"
export * from "./tarif"
export * from "./livreur"
export * from "./tournee"
export * from "./operation-logistique"
