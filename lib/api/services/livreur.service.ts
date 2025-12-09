// Service pour la gestion des livreurs
import { BaseService } from "./base.service"
import { ENDPOINTS } from "../constants/endpoints"
import type {
  Livreur,
  CreateLivreurData,
  UpdateLivreurData,
  ToggleDisponibiliteData,
  LivreurStatistics,
} from "../types/livreur"

class LivreurService extends BaseService<Livreur, CreateLivreurData, UpdateLivreurData> {
  constructor() {
    super(ENDPOINTS.LIVREURS.BASE)
  }

  async getAll(): Promise<Livreur[]> {
    const response = await this.customRequest<any>("GET", this.baseEndpoint)

    // Extraction des données depuis la structure paginée
    if (response?.data?.data && Array.isArray(response.data.data)) {
      return response.data.data
    }

    // Fallback pour réponse non paginée
    if (Array.isArray(response?.data)) {
      return response.data
    }

    // Dernier fallback si les données sont directement un tableau
    if (Array.isArray(response)) {
      return response
    }

    console.error("[v0] Structure de réponse inattendue:", response)
    return []
  }

  async getDisponibles(): Promise<Livreur[]> {
    const response = await this.customRequest<any>("GET", ENDPOINTS.LIVREURS.DISPONIBLES)
    return response?.data || response
  }

  async toggleDisponibilite(id: number, data: ToggleDisponibiliteData): Promise<Livreur> {
    const response = await this.customRequest<any>("PATCH", ENDPOINTS.LIVREURS.DISPONIBILITE(id), data)
    return response?.data || response
  }

  async getStatistiquesLivreur(id: number): Promise<any> {
    const response = await this.customRequest<any>("GET", ENDPOINTS.LIVREURS.STATISTIQUES(id))
    return response?.data || response
  }

  async getStatistics(): Promise<LivreurStatistics> {
    const response = await this.customRequest<any>("GET", ENDPOINTS.LIVREURS.STATISTICS)
    return response?.data || response
  }
}

export const livreurService = new LivreurService()
