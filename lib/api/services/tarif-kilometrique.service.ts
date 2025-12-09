// Service API pour la gestion des tarifs kilométriques
import { BaseService } from "./base.service"
import { ENDPOINTS } from "../constants/endpoints"
import type {
  TarifKilometrique,
  CreateTarifKilometriqueData,
  UpdateTarifKilometriqueData,
} from "../types/tarif-kilometrique"
import type { RequestConfig } from "../types"

/**
 * Service pour gérer les tarifs kilométriques
 */
export class TarifKilometriqueService extends BaseService<
  TarifKilometrique,
  CreateTarifKilometriqueData,
  UpdateTarifKilometriqueData
> {
  constructor() {
    super(ENDPOINTS.TARIF_KILOMETRIQUES.ADMIN_BASE)
  }

  /**
   * Récupère tous les tarifs kilométriques (route admin)
   */
  async getAll(config?: RequestConfig): Promise<TarifKilometrique[]> {
    const response = await this.customRequest<{
      success: boolean
      data: {
        data: TarifKilometrique[]
        meta: any
      }
    }>("GET", ENDPOINTS.TARIF_KILOMETRIQUES.ADMIN_BASE, undefined, config)
    return response.data.data
  }

  /**
   * Récupère un tarif kilométrique par son ID (route admin)
   */
  async getById(id: number, config?: RequestConfig): Promise<TarifKilometrique> {
    const response = await this.customRequest<{ success: boolean; data: TarifKilometrique }>(
      "GET",
      ENDPOINTS.TARIF_KILOMETRIQUES.ADMIN_BY_ID(id),
      undefined,
      config,
    )
    return response.data
  }

  /**
   * Récupère uniquement les tarifs kilométriques actifs (route publique)
   */
  async getActifs(config?: RequestConfig): Promise<TarifKilometrique[]> {
    const response = await this.customRequest<{ success: boolean; data: TarifKilometrique[] }>(
      "GET",
      ENDPOINTS.TARIF_KILOMETRIQUES.ACTIFS,
      undefined,
      config,
    )
    return response.data
  }

  /**
   * Active/désactive un tarif kilométrique
   */
  async toggleActive(id: number, config?: RequestConfig): Promise<TarifKilometrique> {
    const response = await this.customRequest<{ success: boolean; data: TarifKilometrique }>(
      "PATCH",
      ENDPOINTS.TARIF_KILOMETRIQUES.TOGGLE_ACTIVE(id),
      undefined,
      config,
    )
    return response.data
  }

  /**
   * Crée un nouveau tarif kilométrique
   */
  async create(data: CreateTarifKilometriqueData, config?: RequestConfig): Promise<TarifKilometrique> {
    const response = await this.customRequest<{ success: boolean; data: TarifKilometrique }>(
      "POST",
      ENDPOINTS.TARIF_KILOMETRIQUES.ADMIN_BASE,
      data,
      config,
    )
    return response.data
  }

  /**
   * Met à jour un tarif kilométrique
   */
  async update(id: number, data: UpdateTarifKilometriqueData, config?: RequestConfig): Promise<TarifKilometrique> {
    const response = await this.customRequest<{ success: boolean; data: TarifKilometrique }>(
      "PUT",
      ENDPOINTS.TARIF_KILOMETRIQUES.ADMIN_BY_ID(id),
      data,
      config,
    )
    return response.data
  }

  /**
   * Archive un tarif kilométrique (soft delete)
   */
  async delete(id: number, config?: RequestConfig): Promise<void> {
    await this.customRequest<{ success: boolean; message: string }>(
      "DELETE",
      ENDPOINTS.TARIF_KILOMETRIQUES.ADMIN_BY_ID(id),
      undefined,
      config,
    )
  }

  /**
   * Récupère tous les tarifs kilométriques archivés
   */
  async getArchived(config?: RequestConfig): Promise<TarifKilometrique[]> {
    const response = await this.customRequest<{
      success: boolean
      data: {
        data: TarifKilometrique[]
        meta: any
      }
    }>("GET", ENDPOINTS.TARIF_KILOMETRIQUES.ADMIN_ARCHIVED, undefined, config)
    return response.data.data
  }

  /**
   * Restaure un tarif kilométrique archivé
   */
  async restore(id: number, config?: RequestConfig): Promise<TarifKilometrique> {
    const response = await this.customRequest<{ success: boolean; data: TarifKilometrique }>(
      "PATCH",
      ENDPOINTS.TARIF_KILOMETRIQUES.RESTORE(id),
      undefined,
      config,
    )
    return response.data
  }
}

// Export d'une instance unique (singleton)
export const tarifKilometriqueService = new TarifKilometriqueService()
