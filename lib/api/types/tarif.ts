/**
 * Types pour les tarifs
 * Basés sur le modèle Tarif de l'API AdonisJS
 */

import type { Service } from "./service"
import type { TypeLinge } from "./type-linge"
import type { Temperature } from "./temperature"
import type { OptionTraitement } from "./option-traitement"
import type { TrancheTarifaireService } from "./tranche-tarifaire"

/**
 * Type d'entité pour l'historique des tarifs
 */
export type EntityType = "service" | "type_linge" | "temperature" | "option_traitement" | "tranche_tarifaire"

/**
 * Modèle Tarif - Table centrale pour l'historique des prix
 */
export interface Tarif {
  id: number
  prix: number | null
  prixSupplementaire: number | null
  serviceId: number | null
  typeLingeId: number | null
  temperatureId: number | null
  optionTraitementId: number | null
  trancheTarifaireServiceId: number | null
  estActif: boolean
  isArchive: boolean
  dateArchive: string | null
  createdAt: string
  updatedAt: string
  createdBy: string | null
  updatedBy: string | null
  // Relations optionnelles
  service?: Service
  typeLinge?: TypeLinge
  temperature?: Temperature
  optionTraitement?: OptionTraitement
  trancheTarifaireService?: TrancheTarifaireService
}

/**
 * Données pour créer un tarif de base (service ou tranche tarifaire)
 */
export interface CreateTarifBaseData {
  prix: number
  serviceId: number
  trancheTarifaireServiceId?: number
}

/**
 * Données pour créer un tarif supplémentaire (options)
 */
export interface CreateTarifSupplementaireData {
  prixSupplementaire: number
  serviceId: number
  typeLingeId?: number
  temperatureId?: number
  optionTraitementId?: number
}

/**
 * Données pour mettre à jour un tarif
 */
export interface UpdateTarifData {
  prix?: number
  prixSupplementaire?: number
}

/**
 * Données pour calculer un prix
 */
export interface CalculerPrixData {
  serviceId: number
  quantite?: number
  typeLingeId?: number
  temperatureId?: number
  optionTraitementIds?: number[]
}

/**
 * Résultat du calcul de prix
 */
export interface CalculPrixResult {
  prixTotal: number
  details: {
    prixBase: number
    quantite: number
    supplements: number
  }
}
