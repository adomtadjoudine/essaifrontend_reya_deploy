/**
 * Service API pour la gestion des tranches tarifaires
 * Consomme les endpoints de l'API AdonisJS backend_api
 */

import { BaseService } from "./base.service"
import { ENDPOINTS } from "../constants/endpoints"
import type {
  TrancheTarifaireService,
  CreateTrancheTarifaireData,
  UpdateTrancheTarifaireData,
  RequestConfig,
} from "../types"

/**
 * Service pour gérer les tranches tarifaires (1-5 pièces, 6-10 pièces, etc.)
 */
class TrancheTarifaireServiceService extends BaseService<
  TrancheTarifaireService,
  CreateTrancheTarifaireData,
  UpdateTrancheTarifaireData
> {
  constructor() {
    super(ENDPOINTS.TRANCHE_TARIFAIRES.BASE)
  }

  /**
   * Récupère toutes les tranches tarifaires
   */
  async getAll(config?: RequestConfig): Promise<TrancheTarifaireService[]> {
    const response = await this.customRequest<{
      success: boolean
      data: {
        data: TrancheTarifaireService[]
        meta: any
      }
    }>("GET", ENDPOINTS.TRANCHE_TARIFAIRES.BASE, undefined, config)
    return response.data.data
  }

  /**
   * Récupère une tranche tarifaire par son ID
   */
  async getById(id: number, config?: RequestConfig): Promise<TrancheTarifaireService> {
    const response = await this.customRequest<{ success: boolean; data: TrancheTarifaireService }>(
      "GET",
      ENDPOINTS.TRANCHE_TARIFAIRES.BY_ID(id),
      undefined,
      config,
    )
    return response.data
  }

  /**
   * Récupère les tranches tarifaires d'un service spécifique
   */
  async getByService(serviceId: number, config?: RequestConfig): Promise<TrancheTarifaireService[]> {
    const response = await this.customRequest<{ success: boolean; data: TrancheTarifaireService[] }>(
      "GET",
      ENDPOINTS.TRANCHE_TARIFAIRES.BY_SERVICE(serviceId),
      undefined,
      config,
    )
    return response.data
  }

  /**
   * Crée une nouvelle tranche tarifaire
   */
  async create(data: CreateTrancheTarifaireData, config?: RequestConfig): Promise<TrancheTarifaireService> {
    const response = await this.customRequest<{ success: boolean; data: TrancheTarifaireService }>(
      "POST",
      ENDPOINTS.TRANCHE_TARIFAIRES.BASE,
      data,
      config,
    )
    return response.data
  }

  /**
   * Met à jour une tranche tarifaire
   */
  async update(id: number, data: UpdateTrancheTarifaireData, config?: RequestConfig): Promise<TrancheTarifaireService> {
    const response = await this.customRequest<{ success: boolean; data: TrancheTarifaireService }>(
      "PUT",
      ENDPOINTS.TRANCHE_TARIFAIRES.BY_ID(id),
      data,
      config,
    )
    return response.data
  }

  /**
   * Archive une tranche tarifaire (soft delete)
   */
  async delete(id: number, config?: RequestConfig): Promise<void> {
    await this.customRequest<{ success: boolean; message: string }>(
      "DELETE",
      ENDPOINTS.TRANCHE_TARIFAIRES.BY_ID(id),
      undefined,
      config,
    )
  }

  /**
   * Active/désactive une tranche tarifaire
   */
  async toggleActive(id: number, config?: RequestConfig): Promise<TrancheTarifaireService> {
    const response = await this.customRequest<{ success: boolean; data: TrancheTarifaireService }>(
      "PATCH",
      ENDPOINTS.TRANCHE_TARIFAIRES.TOGGLE_ACTIVE(id),
      undefined,
      config,
    )
    return response.data
  }
}

// Export d'une instance unique (singleton)
export const trancheTarifaireService = new TrancheTarifaireServiceService()
