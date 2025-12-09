// Service pour la gestion des promotions
import { BaseService } from "./base.service"
import { ENDPOINTS } from "../constants/endpoints"
import type {
  Promotion,
  CreatePromotionData,
  UpdatePromotionData,
  VerificationCodePromoResponse,
  StatistiquesPromotion,
} from "../types/promotion"
import type { RequestConfig } from "../types"

/**
 * Service pour gérer les promotions et codes promo
 */
export class PromotionService extends BaseService<Promotion, CreatePromotionData, UpdatePromotionData> {
  constructor() {
    super(ENDPOINTS.PROMOTIONS.ADMIN_BASE)
  }

  /**
   * Récupère toutes les promotions (route admin)
   */
  async getAll(config?: RequestConfig): Promise<Promotion[]> {
    const response = await this.customRequest<{
      success: boolean
      data: {
        data: Promotion[]
        meta: any
      }
    }>("GET", ENDPOINTS.PROMOTIONS.ADMIN_BASE, undefined, config)
    return response.data.data
  }

  /**
   * Récupère toutes les promotions archivées
   */
  async getArchived(config?: RequestConfig): Promise<Promotion[]> {
    const response = await this.customRequest<{
      success: boolean
      data: {
        data: Promotion[]
        meta: any
      }
    }>("GET", ENDPOINTS.PROMOTIONS.ADMIN_ARCHIVED, undefined, config)
    return response.data.data
  }

  /**
   * Récupère une promotion par son ID
   */
  async getById(id: number, config?: RequestConfig): Promise<Promotion> {
    const response = await this.customRequest<{ success: boolean; data: Promotion }>(
      "GET",
      ENDPOINTS.PROMOTIONS.ADMIN_BY_ID(id),
      undefined,
      config,
    )
    return response.data
  }

  /**
   * Récupère uniquement les promotions actives
   */
  async getActives(config?: RequestConfig): Promise<Promotion[]> {
    const response = await this.customRequest<{
      success: boolean
      data: {
        data: Promotion[]
        meta: any
      }
    }>("GET", ENDPOINTS.PROMOTIONS.ACTIVES, undefined, config)
    return response.data.data
  }

  /**
   * Recherche des promotions par terme
   */
  async search(term: string, config?: RequestConfig): Promise<Promotion[]> {
    const response = await this.customRequest<{
      success: boolean
      data: {
        data: Promotion[]
        meta: any
      }
    }>("GET", ENDPOINTS.PROMOTIONS.SEARCH(term), undefined, config)
    return response.data.data
  }

  /**
   * Active/désactive une promotion
   */
  async toggleActive(id: number, config?: RequestConfig): Promise<Promotion> {
    const response = await this.customRequest<{ success: boolean; data: Promotion }>(
      "PATCH",
      ENDPOINTS.PROMOTIONS.TOGGLE_ACTIVE(id),
      undefined,
      config,
    )
    return response.data
  }

  /**
   * Crée une nouvelle promotion
   */
  async create(data: CreatePromotionData, config?: RequestConfig): Promise<Promotion> {
    const response = await this.customRequest<{ success: boolean; data: Promotion }>(
      "POST",
      ENDPOINTS.PROMOTIONS.ADMIN_BASE,
      data,
      config,
    )
    return response.data
  }

  /**
   * Met à jour une promotion
   */
  async update(id: number, data: UpdatePromotionData, config?: RequestConfig): Promise<Promotion> {
    const response = await this.customRequest<{ success: boolean; data: Promotion }>(
      "PUT",
      ENDPOINTS.PROMOTIONS.ADMIN_BY_ID(id),
      data,
      config,
    )
    return response.data
  }

  /**
   * Archive une promotion (soft delete)
   */
  async delete(id: number, config?: RequestConfig): Promise<void> {
    await this.customRequest<{ success: boolean; message: string }>(
      "DELETE",
      ENDPOINTS.PROMOTIONS.ADMIN_BY_ID(id),
      undefined,
      config,
    )
  }

  /**
   * Restaure une promotion archivée
   */
  async restore(id: number, config?: RequestConfig): Promise<Promotion> {
    const response = await this.customRequest<{ success: boolean; data: Promotion }>(
      "PATCH",
      ENDPOINTS.PROMOTIONS.RESTORE(id),
      undefined,
      config,
    )
    return response.data
  }

  /**
   * Vérifie la validité d'un code promo
   */
  async verifierCode(
    code: string,
    montantCommande: number,
    clientId?: number,
    serviceId?: number,
    config?: RequestConfig,
  ): Promise<VerificationCodePromoResponse> {
    const response = await this.customRequest<{ success: boolean; data: VerificationCodePromoResponse }>(
      "POST",
      ENDPOINTS.PROMOTIONS.VERIFIER,
      {
        code,
        montantCommande,
        clientId,
        serviceId,
      },
      config,
    )
    return response.data
  }

  /**
   * Récupère les statistiques d'une promotion
   */
  async getStatistiques(id: number, config?: RequestConfig): Promise<StatistiquesPromotion> {
    const response = await this.customRequest<{ success: boolean; data: StatistiquesPromotion }>(
      "GET",
      ENDPOINTS.PROMOTIONS.STATISTIQUES(id),
      undefined,
      config,
    )
    return response.data
  }

  /**
   * Récupère toutes les promotions avec filtres
   */
  async getAllWithFilters(
    filters?: {
      page?: number
      limit?: number
      search?: string
      typeReduction?: string
      estActif?: boolean
    },
    config?: RequestConfig,
  ): Promise<Promotion[]> {
    const params = new URLSearchParams()
    if (filters?.page) params.append("page", filters.page.toString())
    if (filters?.limit) params.append("limit", filters.limit.toString())
    if (filters?.search) params.append("search", filters.search)
    if (filters?.typeReduction) params.append("type_reduction", filters.typeReduction)
    if (filters?.estActif !== undefined) params.append("est_actif", filters.estActif.toString())

    const endpoint = params.toString()
      ? `${ENDPOINTS.PROMOTIONS.ADMIN_BASE}?${params.toString()}`
      : ENDPOINTS.PROMOTIONS.ADMIN_BASE

    const response = await this.customRequest<{
      success: boolean
      data: {
        data: Promotion[]
        meta: any
      }
    }>("GET", endpoint, undefined, config)

    return response.data.data
  }
}

// Instance singleton du service
export const promotionService = new PromotionService()
