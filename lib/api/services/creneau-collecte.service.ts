// Service API pour la gestion des créneaux de collecte
import { BaseService } from "./base.service"
import { ENDPOINTS } from "../constants/endpoints"
import type { CreneauCollecte, CreateCreneauCollecteData, UpdateCreneauCollecteData } from "../types/creneau-collecte"
import type { RequestConfig } from "../types"

/**
 * Service pour gérer les créneaux de collecte
 */
export class CreneauCollecteService extends BaseService<
  CreneauCollecte,
  CreateCreneauCollecteData,
  UpdateCreneauCollecteData
> {
  constructor() {
    super(ENDPOINTS.CRENEAU_COLLECTES.ADMIN_BASE)
  }

  /**
   * Récupère tous les créneaux de collecte (route admin)
   */
  async getAll(config?: RequestConfig): Promise<CreneauCollecte[]> {
    const response = await this.customRequest<{
      success: boolean
      data: {
        data: CreneauCollecte[]
        meta: any
      }
    }>("GET", ENDPOINTS.CRENEAU_COLLECTES.ADMIN_BASE, undefined, config)
    return response.data.data
  }

  /**
   * Récupère un créneau de collecte par son ID (route admin)
   */
  async getById(id: number, config?: RequestConfig): Promise<CreneauCollecte> {
    const response = await this.customRequest<{ success: boolean; data: CreneauCollecte }>(
      "GET",
      ENDPOINTS.CRENEAU_COLLECTES.ADMIN_BY_ID(id),
      undefined,
      config,
    )
    return response.data
  }

  /**
   * Récupère uniquement les créneaux de collecte actifs (route publique)
   */
  async getActifs(config?: RequestConfig): Promise<CreneauCollecte[]> {
    const response = await this.customRequest<{ success: boolean; data: CreneauCollecte[] }>(
      "GET",
      ENDPOINTS.CRENEAU_COLLECTES.ACTIFS,
      undefined,
      config,
    )
    return response.data
  }

  /**
   * Active/désactive un créneau de collecte
   */
  async toggleActive(id: number, config?: RequestConfig): Promise<CreneauCollecte> {
    const response = await this.customRequest<{ success: boolean; data: CreneauCollecte }>(
      "PATCH",
      ENDPOINTS.CRENEAU_COLLECTES.TOGGLE_ACTIVE(id),
      undefined,
      config,
    )
    return response.data
  }

  /**
   * Crée un nouveau créneau de collecte
   */
  async create(data: CreateCreneauCollecteData, config?: RequestConfig): Promise<CreneauCollecte> {
    const response = await this.customRequest<{ success: boolean; data: CreneauCollecte }>(
      "POST",
      ENDPOINTS.CRENEAU_COLLECTES.ADMIN_BASE,
      data,
      config,
    )
    return response.data
  }

  /**
   * Met à jour un créneau de collecte
   */
  async update(id: number, data: UpdateCreneauCollecteData, config?: RequestConfig): Promise<CreneauCollecte> {
    const response = await this.customRequest<{ success: boolean; data: CreneauCollecte }>(
      "PUT",
      ENDPOINTS.CRENEAU_COLLECTES.ADMIN_BY_ID(id),
      data,
      config,
    )
    return response.data
  }

  /**
   * Archive un créneau de collecte (soft delete)
   */
  async delete(id: number, config?: RequestConfig): Promise<void> {
    await this.customRequest<{ success: boolean; message: string }>(
      "DELETE",
      ENDPOINTS.CRENEAU_COLLECTES.ADMIN_BY_ID(id),
      undefined,
      config,
    )
  }

  /**
   * Récupère tous les créneaux de collecte archivés
   */
  async getArchived(config?: RequestConfig): Promise<CreneauCollecte[]> {
    const response = await this.customRequest<{
      success: boolean
      data: {
        data: CreneauCollecte[]
        meta: any
      }
    }>("GET", ENDPOINTS.CRENEAU_COLLECTES.ADMIN_ARCHIVED, undefined, config)
    return response.data.data
  }

  /**
   * Restaure un créneau de collecte archivé
   */
  async restore(id: number, config?: RequestConfig): Promise<CreneauCollecte> {
    const response = await this.customRequest<{ success: boolean; data: CreneauCollecte }>(
      "PATCH",
      ENDPOINTS.CRENEAU_COLLECTES.RESTORE(id),
      undefined,
      config,
    )
    return response.data
  }
}

// Export d'une instance unique (singleton)
export const creneauCollecteService = new CreneauCollecteService()
