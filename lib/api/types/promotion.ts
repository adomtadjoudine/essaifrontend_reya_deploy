/**
 * Types pour les promotions
 * Basés sur le modèle Promotion de l'API AdonisJS backend_api
 */

/**
 * Type de réduction d'une promotion
 */
export type TypeReduction = "pourcentage" | "montant_fixe"

/**
 * Modèle Promotion - Représente un code promo
 */
export interface Promotion {
  id: number
  code: string
  description: string | null
  typeReduction: TypeReduction
  valeurReduction: number
  plafondReduction: number | null
  montantMinimum: number | null
  dateDebut: string
  dateFin: string
  estActif: boolean
  nombreUtilisationsMax: number | null
  nombreUtilisations: number
  estCumulable: boolean
  premierAchatUniquement: boolean
  clientId: number | null
  serviceId: number | null
  createdAt: string
  updatedAt: string
  createdBy: string | null
  updatedBy: string | null

  // Relations optionnelles
  client?: any
  service?: any
  utilisations?: any[]
}

/**
 * Données pour créer une promotion
 */
export interface CreatePromotionData {
  code: string
  description?: string
  typeReduction: TypeReduction
  valeurReduction: number
  plafondReduction?: number
  montantMinimum?: number
  dateDebut: string
  dateFin: string
  nombreUtilisationsMax?: number
  estCumulable?: boolean
  premierAchatUniquement?: boolean
  clientId?: number
  serviceId?: number
}

/**
 * Données pour mettre à jour une promotion
 */
export interface UpdatePromotionData {
  code?: string
  description?: string
  typeReduction?: TypeReduction
  valeurReduction?: number
  plafondReduction?: number
  montantMinimum?: number
  dateDebut?: string
  dateFin?: string
  nombreUtilisationsMax?: number
  estCumulable?: boolean
  premierAchatUniquement?: boolean
  clientId?: number
  serviceId?: number
}

/**
 * Résultat de vérification d'un code promo
 */
export interface VerificationCodePromoResponse {
  estValide: boolean
  message: string
  promotion?: Promotion
  reductionCalculee?: number
}

/**
 * Statistiques d'une promotion
 */
export interface StatistiquesPromotion {
  nombreUtilisations: number
  montantTotalReduit: number
  montantMoyenCommande: number
  clients: {
    total: number
    nouveaux: number
  }
  tauxUtilisation?: number
}
