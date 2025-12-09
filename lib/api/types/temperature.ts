/**
 * Types pour les températures de lavage
 * Basés sur le modèle Temperature de l'API AdonisJS backend_api
 */

/**
 * Modèle Temperature - Représente une température de lavage (froid, tiède, chaud)
 */
export interface Temperature {
  id: number
  valeur: string
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
 * Données pour créer une température
 */
export interface CreateTemperatureData {
  valeur: string
  description?: string
}

/**
 * Données pour mettre à jour une température
 */
export interface UpdateTemperatureData {
  valeur?: string
  description?: string
}
