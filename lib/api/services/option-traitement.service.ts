// Service pour la gestion des options de traitement
import { BaseService } from "./base.service"
import { ENDPOINTS } from "../constants/endpoints"
import type { OptionTraitement, CreateOptionTraitementData, UpdateOptionTraitementData, RequestConfig } from "../types"

/**
 * Service pour gérer les options de traitement (détachement, pressing express, etc.)
 */
export class OptionTraitementService extends BaseService<
  OptionTraitement,
  CreateOptionTraitementData,
  UpdateOptionTraitementData
> {
  constructor() {
    super(ENDPOINTS.OPTION_TRAITEMENTS.ADMIN_BASE)
  }

  /**
   * Récupère toutes les options de traitement (route admin)
   */
  async getAll(config?: RequestConfig): Promise<OptionTraitement[]> {
    const response = await this.customRequest<{
      success: boolean
      data: {
        data: OptionTraitement[]
        meta: any
      }
    }>("GET", ENDPOINTS.OPTION_TRAITEMENTS.ADMIN_BASE, undefined, config)
    return response.data.data
  }

  /**
   * Récupère toutes les options de traitement archivées (route admin)
   */
  async getArchived(config?: RequestConfig): Promise<OptionTraitement[]> {
    const response = await this.customRequest<{
      success: boolean
      data: {
        data: OptionTraitement[]
        meta: any
      }
    }>("GET", ENDPOINTS.OPTION_TRAITEMENTS.ADMIN_ARCHIVED, undefined, config)
    return response.data.data
  }

  /**
   * Récupère une option de traitement par son ID (route admin)
   */
  async getById(id: number, config?: RequestConfig): Promise<OptionTraitement> {
    const response = await this.customRequest<{ success: boolean; data: OptionTraitement }>(
      "GET",
      ENDPOINTS.OPTION_TRAITEMENTS.ADMIN_BY_ID(id),
      undefined,
      config,
    )
    return response.data
  }

  /**
   * Récupère uniquement les options de traitement actives (route publique)
   */
  async getActifs(config?: RequestConfig): Promise<OptionTraitement[]> {
    const response = await this.customRequest<{ success: boolean; data: OptionTraitement[] }>(
      "GET",
      ENDPOINTS.OPTION_TRAITEMENTS.ACTIFS,
      undefined,
      config,
    )
    return response.data
  }

  /**
   * Active/désactive une option de traitement
   */
  async toggleActive(id: number, config?: RequestConfig): Promise<OptionTraitement> {
    const response = await this.customRequest<{ success: boolean; data: OptionTraitement }>(
      "PATCH",
      ENDPOINTS.OPTION_TRAITEMENTS.TOGGLE_ACTIVE(id),
      undefined,
      config,
    )
    return response.data
  }

  /**
   * Crée une nouvelle option de traitement
   */
  async create(data: CreateOptionTraitementData, config?: RequestConfig): Promise<OptionTraitement> {
    const response = await this.customRequest<{ success: boolean; data: OptionTraitement }>(
      "POST",
      ENDPOINTS.OPTION_TRAITEMENTS.ADMIN_BASE,
      data,
      config,
    )
    return response.data
  }

  /**
   * Met à jour une option de traitement
   */
  async update(id: number, data: UpdateOptionTraitementData, config?: RequestConfig): Promise<OptionTraitement> {
    const response = await this.customRequest<{ success: boolean; data: OptionTraitement }>(
      "PUT",
      ENDPOINTS.OPTION_TRAITEMENTS.ADMIN_BY_ID(id),
      data,
      config,
    )
    return response.data
  }

  /**
   * Archive une option de traitement (soft delete)
   */
  async delete(id: number, config?: RequestConfig): Promise<void> {
    await this.customRequest<{ success: boolean; message: string }>(
      "DELETE",
      ENDPOINTS.OPTION_TRAITEMENTS.ADMIN_BY_ID(id),
      undefined,
      config,
    )
  }

  /**
   * Restaure une option de traitement archivée
   */
  async restore(id: number, config?: RequestConfig): Promise<OptionTraitement> {
    const response = await this.customRequest<{ success: boolean; data: OptionTraitement }>(
      "PATCH",
      ENDPOINTS.OPTION_TRAITEMENTS.RESTORE(id),
      undefined,
      config,
    )
    return response.data
  }
}

// Instance singleton du service
export const optionTraitementService = new OptionTraitementService()
