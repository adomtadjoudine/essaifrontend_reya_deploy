/**
 * Types pour les services de pressing
 * Basés sur le modèle Service de l'API AdonisJS backend_api
 */

/**
 * Type de tarification d'un service
 */
export type TypeTarification = "unitaire" | "poids" | "forfait"

/**
 * Modèle Service - Représente un service de pressing (lavage, repassage, etc.)
 */
export interface Service {
  id: number
  code: string
  nom: string
  description: string | null
  typeTarification: TypeTarification
  images: string[] | null
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
 * Données pour créer un service
 */
export interface CreateServiceData {
  code: string
  nom: string
  description?: string
  typeTarification: TypeTarification
  images?: File[]
}

/**
 * Données pour mettre à jour un service
 */
export interface UpdateServiceData {
  code?: string
  nom?: string
  description?: string
  typeTarification?: TypeTarification
  images?: File[]
}
