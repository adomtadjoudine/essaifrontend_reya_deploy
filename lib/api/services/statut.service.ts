/**
 * Service pour la gestion des statuts de commande
 * Consomme les endpoints de l'API AdonisJS backend_api
 */

import { BaseService } from "./base.service"
import type { Statut, CreateStatutData, UpdateStatutData } from "../types/statut"
import type { RequestConfig } from "../types"

export class StatutService extends BaseService<Statut, CreateStatutData, UpdateStatutData> {
  constructor() {
    super("/api/admin/statuts")
  }

  /**
   * Récupère tous les statuts
   */
  async getAll(config?: RequestConfig): Promise<Statut[]> {
    const response = await this.customRequest<{
      message: string
      data: {
        data: Statut[]
        meta: any
        links: any
      }
    }>("GET", "/api/statuts", undefined, config)
    return response.data.data
  }

  /**
   * Récupère uniquement les statuts actifs
   */
  async getActifs(config?: RequestConfig): Promise<Statut[]> {
    const response = await this.customRequest<{
      message: string
      data: Statut[]
    }>("GET", "/api/statuts/actifs", undefined, config)
    return response.data
  }

  /**
   * Récupère un statut par son ID
   */
  async getById(id: number, config?: RequestConfig): Promise<Statut> {
    const response = await this.customRequest<{ message: string; data: Statut }>(
      "GET",
      `/api/statuts/${id}`,
      undefined,
      config,
    )
    return response.data
  }

  /**
   * Active/désactive un statut
   */
  async toggleActive(id: number, config?: RequestConfig): Promise<Statut> {
    const response = await this.customRequest<{ message: string; data: Statut }>(
      "PATCH",
      `/api/admin/statuts/${id}/toggle-active`,
      undefined,
      config,
    )
    return response.data
  }
}

// Instance singleton du service
export const statutService = new StatutService()
