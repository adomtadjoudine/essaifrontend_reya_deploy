/**
 * Types pour les types de linge
 * Basés sur le modèle TypeLinge de l'API AdonisJS backend_api
 */

/**
 * Modèle TypeLinge - Représente un type de linge (chemise, pantalon, robe, etc.)
 */
export interface TypeLinge {
  id: number
  nom: string
  description: string | null
  estActif: boolean
  isArchive: boolean
  dateArchive: string | null
  createdAt: string
  updatedAt: string
  createdBy: string | null
  updatedBy: string | null
  // Relations optionnelles
  tarifs?: any[]
}

/**
 * Données pour créer un type de linge
 */
export interface CreateTypeLingeData {
  nom: string
  description?: string
}

/**
 * Données pour mettre à jour un type de linge
 */
export interface UpdateTypeLingeData {
  nom?: string
  description?: string
}
