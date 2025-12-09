// Service pour la gestion des lignes de commande
import { BaseService } from "./base.service"
import type { LigneCommande, UpdateQuantityData } from "../types/commande"
import type { RequestConfig } from "../types"

export class LigneCommandeService extends BaseService<LigneCommande, any, any> {
  constructor() {
    super("/api/ligne-commandes")
  }

  /**
   * Mettre à jour la quantité d'une ligne de commande
   */
  async updateQuantity(id: number, data: UpdateQuantityData, config?: RequestConfig): Promise<LigneCommande> {
    const response = await this.customRequest<{ message: string; data: LigneCommande }>(
      "PATCH",
      `${this.baseEndpoint}/${id}/quantite`,
      data,
      config,
    )
    return response.data
  }
}

// Instance singleton du service
export const ligneCommandeService = new LigneCommandeService()
