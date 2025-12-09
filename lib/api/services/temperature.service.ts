// Service API pour la gestion des températures de lavage
import { BaseService } from "./base.service"
import { ENDPOINTS } from "../constants/endpoints"
import type { Temperature, CreateTemperatureData, UpdateTemperatureData, RequestConfig } from "../types"

/**
 * Service pour gérer les températures de lavage (froid, tiède, chaud)
 */
export class TemperatureService extends BaseService<Temperature, CreateTemperatureData, UpdateTemperatureData> {
  constructor() {
    super(ENDPOINTS.TEMPERATURES.ADMIN_BASE)
  }

  /**
   * Récupère toutes les températures (route admin)
   */
  async getAll(config?: RequestConfig): Promise<Temperature[]> {
    const response = await this.customRequest<{
      success: boolean
      data: {
        data: Temperature[]
        meta: any
      }
    }>("GET", ENDPOINTS.TEMPERATURES.ADMIN_BASE, undefined, config)
    return response.data.data
  }

  /**
   * Récupère toutes les températures archivées (route admin)
   */
  async getArchived(config?: RequestConfig): Promise<Temperature[]> {
    const response = await this.customRequest<{
      success: boolean
      data: {
        data: Temperature[]
        meta: any
      }
    }>("GET", ENDPOINTS.TEMPERATURES.ADMIN_ARCHIVED, undefined, config)
    return response.data.data
  }

  /**
   * Récupère une température par son ID (route admin)
   */
  async getById(id: number, config?: RequestConfig): Promise<Temperature> {
    const response = await this.customRequest<{ success: boolean; data: Temperature }>(
      "GET",
      ENDPOINTS.TEMPERATURES.ADMIN_BY_ID(id),
      undefined,
      config,
    )
    return response.data
  }

  /**
   * Récupère uniquement les températures actives (route publique)
   */
  async getActifs(config?: RequestConfig): Promise<Temperature[]> {
    const response = await this.customRequest<{ success: boolean; data: Temperature[] }>(
      "GET",
      ENDPOINTS.TEMPERATURES.ACTIFS,
      undefined,
      config,
    )
    return response.data
  }

  /**
   * Active/désactive une température
   */
  async toggleActive(id: number, config?: RequestConfig): Promise<Temperature> {
    const response = await this.customRequest<{ success: boolean; data: Temperature }>(
      "PATCH",
      ENDPOINTS.TEMPERATURES.TOGGLE_ACTIVE(id),
      undefined,
      config,
    )
    return response.data
  }

  /**
   * Crée une nouvelle température
   */
  async create(data: CreateTemperatureData, config?: RequestConfig): Promise<Temperature> {
    const response = await this.customRequest<{ success: boolean; data: Temperature }>(
      "POST",
      ENDPOINTS.TEMPERATURES.ADMIN_BASE,
      data,
      config,
    )
    return response.data
  }

  /**
   * Met à jour une température
   */
  async update(id: number, data: UpdateTemperatureData, config?: RequestConfig): Promise<Temperature> {
    const response = await this.customRequest<{ success: boolean; data: Temperature }>(
      "PUT",
      ENDPOINTS.TEMPERATURES.ADMIN_BY_ID(id),
      data,
      config,
    )
    return response.data
  }

  /**
   * Archive une température (soft delete)
   */
  async delete(id: number, config?: RequestConfig): Promise<void> {
    await this.customRequest<{ success: boolean; message: string }>(
      "DELETE",
      ENDPOINTS.TEMPERATURES.ADMIN_BY_ID(id),
      undefined,
      config,
    )
  }

  /**
   * Restaure une température archivée
   */
  async restore(id: number, config?: RequestConfig): Promise<Temperature> {
    const response = await this.customRequest<{ success: boolean; data: Temperature }>(
      "PATCH",
      ENDPOINTS.TEMPERATURES.RESTORE(id),
      undefined,
      config,
    )
    return response.data
  }
}

// Export d'une instance unique (singleton)
export const temperatureService = new TemperatureService()
