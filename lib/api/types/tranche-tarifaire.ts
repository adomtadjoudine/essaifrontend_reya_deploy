/**
 * Types pour les tranches tarifaires
 * Basés sur le modèle TrancheTarifaireService de l'API AdonisJS
 */

/**
 * Modèle TrancheTarifaireService - Représente une tranche de quantité pour la tarification
 */
export interface TrancheTarifaireService {
  id: number
  quantite: number
  description: string | null
  estActif: boolean
  isArchive: boolean
  dateArchive: string | null
  createdAt: string
  updatedAt: string
  createdBy: string | null
  updatedBy: string | null
}

/**
 * Données pour créer une tranche tarifaire
 */
export interface CreateTrancheTarifaireData {
  quantite: number
  description?: string
}

/**
 * Données pour mettre à jour une tranche tarifaire
 */
export interface UpdateTrancheTarifaireData {
  quantite?: number
  description?: string
}
