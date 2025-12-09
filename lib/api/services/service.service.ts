// Service pour la gestion des services
import { BaseService } from "./base.service"
import { ENDPOINTS } from "../constants/endpoints"
import type { Service, CreateServiceData, UpdateServiceData } from "../types/service"
import type { RequestConfig } from "../types"

/**
 * Service pour gérer les services de pressing (lavage, repassage, etc.)
 */
export class ServiceService extends BaseService<Service, CreateServiceData, UpdateServiceData> {
  constructor() {
    super(ENDPOINTS.SERVICES.ADMIN_BASE)
  }

  /**
   * Récupère tous les services (route admin)
   */
  async getAll(config?: RequestConfig): Promise<Service[]> {
    const response = await this.customRequest<{
      success: boolean
      data: {
        data: Service[]
        meta: any
      }
    }>("GET", ENDPOINTS.SERVICES.ADMIN_BASE, undefined, config)
    // L'API retourne une structure paginée, on extrait les données
    return response.data.data
  }

  /**
   * Récupère tous les services archivés (route admin)
   */
  async getArchived(config?: RequestConfig): Promise<Service[]> {
    const response = await this.customRequest<{
      success: boolean
      data: {
        data: Service[]
        meta: any
      }
    }>("GET", ENDPOINTS.SERVICES.ADMIN_ARCHIVED, undefined, config)
    // L'API retourne une structure paginée, on extrait les données
    return response.data.data
  }

  /**
   * Récupère un service par son ID (route admin)
   */
  async getById(id: number, config?: RequestConfig): Promise<Service> {
    const response = await this.customRequest<{ success: boolean; data: Service }>(
      "GET",
      ENDPOINTS.SERVICES.ADMIN_BY_ID(id),
      undefined,
      config,
    )
    return response.data
  }

  /**
   * Récupère uniquement les services actifs (route publique)
   */
  async getActifs(config?: RequestConfig): Promise<Service[]> {
    const response = await this.customRequest<{ success: boolean; data: Service[] }>(
      "GET",
      ENDPOINTS.SERVICES.ACTIFS,
      undefined,
      config,
    )
    return response.data
  }

  /**
   * Recherche des services par terme (route admin)
   */
  async search(term: string, config?: RequestConfig): Promise<Service[]> {
    const response = await this.customRequest<{ success: boolean; data: Service[] }>(
      "GET",
      ENDPOINTS.SERVICES.ADMIN_SEARCH(term),
      undefined,
      config,
    )
    return response.data
  }

  /**
   * Active/désactive un service
   */
  async toggleActive(id: number, config?: RequestConfig): Promise<Service> {
    const response = await this.customRequest<{ success: boolean; data: Service }>(
      "PATCH",
      ENDPOINTS.SERVICES.TOGGLE_ACTIVE(id),
      undefined,
      config,
    )
    return response.data
  }

  /**
   * Crée un nouveau service
   */
  async create(data: CreateServiceData, config?: RequestConfig): Promise<Service> {
    if (data.images && data.images.length > 0) {
      return this.createWithImages(data, config)
    }

    // Sinon, requête JSON classique
    const response = await this.customRequest<{ success: boolean; data: Service }>(
      "POST",
      ENDPOINTS.SERVICES.ADMIN_BASE,
      data,
      config,
    )
    return response.data
  }

  /**
   * Met à jour un service
   */
  async update(id: number, data: UpdateServiceData, config?: RequestConfig): Promise<Service> {
    if (data.images && data.images.length > 0) {
      return this.updateWithImages(id, data, config)
    }

    // Sinon, requête JSON classique
    const response = await this.customRequest<{ success: boolean; data: Service }>(
      "PUT",
      ENDPOINTS.SERVICES.ADMIN_BY_ID(id),
      data,
      config,
    )
    return response.data
  }

  /**
   * Archive un service (soft delete)
   */
  async delete(id: number, config?: RequestConfig): Promise<void> {
    await this.customRequest<{ success: boolean; message: string }>(
      "DELETE",
      ENDPOINTS.SERVICES.ADMIN_BY_ID(id),
      undefined,
      config,
    )
  }

  /**
   * Restaure un service archivé
   */
  async restore(id: number, config?: RequestConfig): Promise<Service> {
    const response = await this.customRequest<{ success: boolean; data: Service }>(
      "PATCH",
      ENDPOINTS.SERVICES.RESTORE(id),
      undefined,
      config,
    )
    return response.data
  }

  /**
   * Récupère tous les services avec filtres
   */
  async getAllWithFilters(
    filters?: {
      page?: number
      limit?: number
      search?: string
      typeTarification?: string
    },
    config?: RequestConfig,
  ): Promise<Service[]> {
    const params = new URLSearchParams()
    if (filters?.page) params.append("page", filters.page.toString())
    if (filters?.limit) params.append("limit", filters.limit.toString())
    if (filters?.search) params.append("search", filters.search)
    if (filters?.typeTarification) params.append("type_tarification", filters.typeTarification)

    const endpoint = params.toString()
      ? `${ENDPOINTS.SERVICES.ADMIN_BASE}?${params.toString()}`
      : ENDPOINTS.SERVICES.ADMIN_BASE

    const response = await this.customRequest<{
      success: boolean
      data: {
        data: Service[]
        meta: any
      }
    }>("GET", endpoint, undefined, config)

    return response.data.data
  }

  /**
   * Crée un service avec plusieurs images (multipart/form-data)
   * Nouvelle méthode pour gérer l'upload multiple
   */
  private async createWithImages(data: CreateServiceData, config?: RequestConfig): Promise<Service> {
    const formData = new FormData()
    formData.append("nom", data.nom)
    formData.append("typeTarification", data.typeTarification)
    if (data.description) {
      formData.append("description", data.description)
    }
    if (data.images && data.images.length > 0) {
      data.images.forEach((image, index) => {
        formData.append(`images[${index}]`, image)
      })
    }

    const response = await this.uploadRequest<{ success: boolean; data: Service }>(
      "POST",
      ENDPOINTS.SERVICES.ADMIN_BASE,
      formData,
      config,
    )
    return response.data
  }

  /**
   * Met à jour un service avec plusieurs images (multipart/form-data)
   * Nouvelle méthode pour gérer l'upload multiple
   */
  private async updateWithImages(id: number, data: UpdateServiceData, config?: RequestConfig): Promise<Service> {
    const formData = new FormData()
    if (data.nom) formData.append("nom", data.nom)
    if (data.typeTarification) formData.append("typeTarification", data.typeTarification)
    if (data.description) formData.append("description", data.description)
    if (data.images && data.images.length > 0) {
      data.images.forEach((image, index) => {
        formData.append(`images[${index}]`, image)
      })
    }

    const response = await this.uploadRequest<{ success: boolean; data: Service }>(
      "PUT",
      ENDPOINTS.SERVICES.ADMIN_BY_ID(id),
      formData,
      config,
    )
    return response.data
  }

  /**
   * Effectue une requête avec FormData (multipart/form-data)
   * Méthode mise à jour pour gérer les uploads
   */
  private async uploadRequest<R>(
    method: "POST" | "PUT",
    endpoint: string,
    formData: FormData,
    config?: RequestConfig,
  ): Promise<R> {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333"
    const url = `${baseURL}${endpoint}`

    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }

    console.log("[v0] FormData envoyé au backend:", {
      url,
      method,
      entries: Array.from(formData.entries()),
    })

    const response = await fetch(url, {
      method,
      headers,
      body: formData,
      credentials: "include",
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Erreur de réseau" }))
      console.error("[v0] Erreur API complète:", {
        status: response.status,
        statusText: response.statusText,
        errorData,
      })
      throw {
        message: errorData.message || `Erreur HTTP ${response.status}`,
        status: response.status,
        errors: errorData.errors,
      }
    }

    const result = await response.json()
    console.log("[v0] Réponse API reçue:", result)
    return result
  }
}

// Instance singleton du service
export const serviceService = new ServiceService()
