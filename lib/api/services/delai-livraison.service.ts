// Service API pour la gestion des délais de livraison
import { BaseService } from "./base.service"
import { ENDPOINTS } from "../constants/endpoints"
import type { DelaiLivraison, CreateDelaiLivraisonData, UpdateDelaiLivraisonData } from "../types/delai-livraison"
import type { RequestConfig } from "../types"

/**
 * Service pour gérer les délais de livraison
 */
export class DelaiLivraisonService extends BaseService<
  DelaiLivraison,
  CreateDelaiLivraisonData,
  UpdateDelaiLivraisonData
> {
  constructor() {
    super(ENDPOINTS.DELAI_LIVRAISONS.ADMIN_BASE)
  }

  /**
   * Récupère tous les délais de livraison (route admin)
   */
  async getAll(config?: RequestConfig): Promise<DelaiLivraison[]> {
    const response = await this.customRequest<{
      success: boolean
      data: {
        data: DelaiLivraison[]
        meta: any
      }
    }>("GET", ENDPOINTS.DELAI_LIVRAISONS.ADMIN_BASE, undefined, config)
    return response.data.data
  }

  /**
   * Récupère un délai de livraison par son ID (route admin)
   */
  async getById(id: number, config?: RequestConfig): Promise<DelaiLivraison> {
    const response = await this.customRequest<{ success: boolean; data: DelaiLivraison }>(
      "GET",
      ENDPOINTS.DELAI_LIVRAISONS.ADMIN_BY_ID(id),
      undefined,
      config,
    )
    return response.data
  }

  /**
   * Récupère uniquement les délais de livraison actifs (route publique)
   */
  async getActifs(config?: RequestConfig): Promise<DelaiLivraison[]> {
    const response = await this.customRequest<{ success: boolean; data: DelaiLivraison[] }>(
      "GET",
      ENDPOINTS.DELAI_LIVRAISONS.ACTIFS,
      undefined,
      config,
    )
    return response.data
  }

  /**
   * Active/désactive un délai de livraison
   */
  async toggleActive(id: number, config?: RequestConfig): Promise<DelaiLivraison> {
    const response = await this.customRequest<{ success: boolean; data: DelaiLivraison }>(
      "PATCH",
      ENDPOINTS.DELAI_LIVRAISONS.TOGGLE_ACTIVE(id),
      undefined,
      config,
    )
    return response.data
  }

  /**
   * Crée un nouveau délai de livraison
   */
  async create(data: CreateDelaiLivraisonData, config?: RequestConfig): Promise<DelaiLivraison> {
    const response = await this.customRequest<{ success: boolean; data: DelaiLivraison }>(
      "POST",
      ENDPOINTS.DELAI_LIVRAISONS.ADMIN_BASE,
      data,
      config,
    )
    return response.data
  }

  /**
   * Met à jour un délai de livraison
   */
  async update(id: number, data: UpdateDelaiLivraisonData, config?: RequestConfig): Promise<DelaiLivraison> {
    const response = await this.customRequest<{ success: boolean; data: DelaiLivraison }>(
      "PUT",
      ENDPOINTS.DELAI_LIVRAISONS.ADMIN_BY_ID(id),
      data,
      config,
    )
    return response.data
  }

  /**
   * Archive un délai de livraison (soft delete)
   */
  async delete(id: number, config?: RequestConfig): Promise<void> {
    await this.customRequest<{ success: boolean; message: string }>(
      "DELETE",
      ENDPOINTS.DELAI_LIVRAISONS.ADMIN_BY_ID(id),
      undefined,
      config,
    )
  }

  /**
   * Récupère tous les délais de livraison archivés
   */
  async getArchived(config?: RequestConfig): Promise<DelaiLivraison[]> {
    const response = await this.customRequest<{
      success: boolean
      data: {
        data: DelaiLivraison[]
        meta: any
      }
    }>("GET", ENDPOINTS.DELAI_LIVRAISONS.ADMIN_ARCHIVED, undefined, config)
    return response.data.data
  }

  /**
   * Restaure un délai de livraison archivé
   */
  async restore(id: number, config?: RequestConfig): Promise<DelaiLivraison> {
    const response = await this.customRequest<{ success: boolean; data: DelaiLivraison }>(
      "PATCH",
      ENDPOINTS.DELAI_LIVRAISONS.RESTORE(id),
      undefined,
      config,
    )
    return response.data
  }
}

// Export d'une instance unique (singleton)
export const delaiLivraisonService = new DelaiLivraisonService()
