/**
 * Service API pour la gestion des tarifs
 * Consomme les endpoints de l'API AdonisJS backend_api
 */

import { BaseService } from "./base.service"
import { ENDPOINTS } from "../constants/endpoints"
import type {
  Tarif,
  CreateTarifBaseData,
  CreateTarifSupplementaireData,
  UpdateTarifData,
  CalculerPrixData,
  CalculPrixResult,
  EntityType,
  RequestConfig,
} from "../types"

/**
 * Service pour gérer les tarifs (prix de base et supplémentaires)
 */
class TarifService extends BaseService<Tarif, CreateTarifBaseData, UpdateTarifData> {
  constructor() {
    super(ENDPOINTS.TARIFS.BASE)
  }

  /**
   * Récupère tous les tarifs actifs
   */
  async getAll(config?: RequestConfig): Promise<Tarif[]> {
    const response = await this.customRequest<{
      success: boolean
      data: {
        data: Tarif[]
        meta: any
      }
    }>("GET", ENDPOINTS.TARIFS.BASE, undefined, config)
    return response.data.data
  }

  /**
   * Récupère un tarif par son ID
   */
  async getById(id: number, config?: RequestConfig): Promise<Tarif> {
    const response = await this.customRequest<{ success: boolean; data: Tarif }>(
      "GET",
      ENDPOINTS.TARIFS.BY_ID(id),
      undefined,
      config,
    )
    return response.data
  }

  /**
   * Crée un tarif de base (pour un service ou une tranche tarifaire)
   */
  async createBase(data: CreateTarifBaseData, config?: RequestConfig): Promise<Tarif> {
    const response = await this.customRequest<{ success: boolean; data: Tarif }>(
      "POST",
      ENDPOINTS.TARIFS.BASE_TARIF,
      data,
      config,
    )
    return response.data
  }

  /**
   * Crée un tarif supplémentaire (pour type linge, température, option)
   */
  async createSupplementaire(data: CreateTarifSupplementaireData, config?: RequestConfig): Promise<Tarif> {
    const response = await this.customRequest<{ success: boolean; data: Tarif }>(
      "POST",
      ENDPOINTS.TARIFS.SUPPLEMENTAIRE,
      data,
      config,
    )
    return response.data
  }

  /**
   * Met à jour un tarif (crée une nouvelle version pour l'historique)
   */
  async update(id: number, data: UpdateTarifData, config?: RequestConfig): Promise<Tarif> {
    const response = await this.customRequest<{ success: boolean; data: Tarif }>(
      "PUT",
      ENDPOINTS.TARIFS.BY_ID(id),
      data,
      config,
    )
    return response.data
  }

  /**
   * Désactive un tarif (soft delete)
   */
  async delete(id: number, config?: RequestConfig): Promise<void> {
    await this.customRequest<{ success: boolean; message: string }>(
      "DELETE",
      ENDPOINTS.TARIFS.BY_ID(id),
      undefined,
      config,
    )
  }

  /**
   * Récupère l'historique des tarifs d'une entité
   */
  async getHistorique(entityType: EntityType, entityId: number, config?: RequestConfig): Promise<Tarif[]> {
    const response = await this.customRequest<{
      success: boolean
      data: {
        data: Tarif[]
        meta: any
      }
    }>("GET", ENDPOINTS.TARIFS.HISTORIQUE(entityType, entityId), undefined, config)
    return response.data.data
  }

  /**
   * Récupère le tarif actuel d'une entité
   */
  async getTarifActuel(entityType: EntityType, entityId: number, config?: RequestConfig): Promise<Tarif> {
    const response = await this.customRequest<{ success: boolean; data: Tarif }>(
      "GET",
      ENDPOINTS.TARIFS.ACTUEL(entityType, entityId),
      undefined,
      config,
    )
    return response.data
  }

  /**
   * Calcule le prix total d'une commande (route publique)
   */
  async calculerPrix(data: CalculerPrixData, config?: RequestConfig): Promise<CalculPrixResult> {
    const response = await this.customRequest<{ success: boolean; data: CalculPrixResult }>(
      "POST",
      ENDPOINTS.TARIFS.CALCULER,
      data,
      config,
    )
    return response.data
  }

  /**
   * Active/désactive un tarif
   */
  async toggleActive(id: number, config?: RequestConfig): Promise<Tarif> {
    const response = await this.customRequest<{ success: boolean; data: Tarif }>(
      "PATCH",
      ENDPOINTS.TARIFS.TOGGLE_ACTIVE(id),
      undefined,
      config,
    )
    return response.data
  }
}

// Export d'une instance unique (singleton)
export const tarifService = new TarifService()
