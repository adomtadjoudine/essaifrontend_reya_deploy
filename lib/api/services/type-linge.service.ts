// Service API pour la gestion des types de linge
import { BaseService } from "./base.service"
import { ENDPOINTS } from "../constants/endpoints"
import type { TypeLinge, CreateTypeLingeData, UpdateTypeLingeData, RequestConfig } from "../types"

/**
 * Service pour gérer les types de linge (chemise, pantalon, robe, etc.)
 */
class TypeLingeService extends BaseService<TypeLinge, CreateTypeLingeData, UpdateTypeLingeData> {
  constructor() {
    super(ENDPOINTS.TYPE_LINGES.ADMIN_BASE)
  }

  /**
   * Récupère tous les types de linge (route admin)
   */
  async getAll(config?: RequestConfig): Promise<TypeLinge[]> {
    const response = await this.customRequest<{
      success: boolean
      data: {
        data: TypeLinge[]
        meta: any
      }
    }>("GET", ENDPOINTS.TYPE_LINGES.ADMIN_BASE, undefined, config)
    return response.data.data
  }

  /**
   * Récupère tous les types de linge archivés (route admin)
   */
  async getArchived(config?: RequestConfig): Promise<TypeLinge[]> {
    const response = await this.customRequest<{
      success: boolean
      data: {
        data: TypeLinge[]
        meta: any
      }
    }>("GET", ENDPOINTS.TYPE_LINGES.ADMIN_ARCHIVED, undefined, config)
    return response.data.data
  }

  /**
   * Récupère un type de linge par son ID (route admin)
   */
  async getById(id: number, config?: RequestConfig): Promise<TypeLinge> {
    const response = await this.customRequest<{ success: boolean; data: TypeLinge }>(
      "GET",
      ENDPOINTS.TYPE_LINGES.ADMIN_BY_ID(id),
      undefined,
      config,
    )
    return response.data
  }

  /**
   * Récupère uniquement les types de linge actifs (route publique)
   */
  async getActifs(config?: RequestConfig): Promise<TypeLinge[]> {
    const response = await this.customRequest<{ success: boolean; data: TypeLinge[] }>(
      "GET",
      ENDPOINTS.TYPE_LINGES.ACTIFS,
      undefined,
      config,
    )
    return response.data
  }

  /**
   * Active/désactive un type de linge
   */
  async toggleActive(id: number, config?: RequestConfig): Promise<TypeLinge> {
    const response = await this.customRequest<{ success: boolean; data: TypeLinge }>(
      "PATCH",
      ENDPOINTS.TYPE_LINGES.TOGGLE_ACTIVE(id),
      undefined,
      config,
    )
    return response.data
  }

  /**
   * Crée un nouveau type de linge
   */
  async create(data: CreateTypeLingeData, config?: RequestConfig): Promise<TypeLinge> {
    const response = await this.customRequest<{ success: boolean; data: TypeLinge }>(
      "POST",
      ENDPOINTS.TYPE_LINGES.ADMIN_BASE,
      data,
      config,
    )
    return response.data
  }

  /**
   * Met à jour un type de linge
   */
  async update(id: number, data: UpdateTypeLingeData, config?: RequestConfig): Promise<TypeLinge> {
    const response = await this.customRequest<{ success: boolean; data: TypeLinge }>(
      "PUT",
      ENDPOINTS.TYPE_LINGES.ADMIN_BY_ID(id),
      data,
      config,
    )
    return response.data
  }

  /**
   * Archive un type de linge (soft delete)
   */
  async delete(id: number, config?: RequestConfig): Promise<void> {
    await this.customRequest<{ success: boolean; message: string }>(
      "DELETE",
      ENDPOINTS.TYPE_LINGES.ADMIN_BY_ID(id),
      undefined,
      config,
    )
  }

  /**
   * Restaure un type de linge archivé
   */
  async restore(id: number, config?: RequestConfig): Promise<TypeLinge> {
    const response = await this.customRequest<{ success: boolean; data: TypeLinge }>(
      "PATCH",
      ENDPOINTS.TYPE_LINGES.RESTORE(id),
      undefined,
      config,
    )
    return response.data
  }

  /**
   * Récupérer tous les types de linge (alias pour compatibilité)
   */
  async getAllWithServices(config?: RequestConfig): Promise<TypeLinge[]> {
    return this.getAll(config)
  }

  /**
   * Récupérer un type de linge (alias pour compatibilité)
   */
  async getByIdWithServices(id: number, config?: RequestConfig): Promise<TypeLinge> {
    return this.getById(id, config)
  }
}

// Export d'une instance unique (singleton)
export const typeLingeService = new TypeLingeService()
