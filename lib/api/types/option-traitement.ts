/**
 * Types pour les options de traitement
 * Basés sur le modèle OptionTraitement de l'API AdonisJS backend_api
 */

/**
 * Modèle OptionTraitement - Représente une option de traitement (détachage, pressing express, etc.)
 */
export interface OptionTraitement {
  id: number
  nom: string
  description: string
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
 * Données pour créer une option de traitement
 */
export interface CreateOptionTraitementData {
  nom: string
  description: string
}

/**
 * Données pour mettre à jour une option de traitement
 */
export interface UpdateOptionTraitementData {
  nom?: string
  description?: string
}
