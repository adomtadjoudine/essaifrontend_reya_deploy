/**
 * Types pour la gestion des paiements
 */

import type { Commande } from "./commande"

/**
 * Interface représentant un paiement
 */
export interface Paiement {
  id: number
  numeroPaiement: string
  datePaiement: string
  montant: number
  methode: string
  reference: string
  statut: string
  estRembourse: boolean
  montantRembourse: number | null
  dateRemboursement: string | null
  commandeId: number
  commande?: Commande
  createdAt: string
  updatedAt: string
  createdBy: string | null
  updatedBy: string | null
  estActif: boolean
  isArchive: boolean
  dateArchive: string | null
}

/**
 * Données pour créer un paiement
 */
export interface CreatePaiementData {
  commandeId: number
  montant: number
  methode: string
  reference: string
}

/**
 * Données pour mettre à jour un paiement
 */
export interface UpdatePaiementData {
  methode?: string
  reference?: string
  montant?: number
}

/**
 * Données pour rembourser un paiement
 */
export interface RemboursementData {
  montantRembourse: number
}

/**
 * Statistiques des paiements
 */
export interface PaiementStatistics {
  totalPaiements: number
  montantTotal: number
  paiementsEnAttente: number
  paiementsValides: number
  paiementsEchoues: number
  montantRembourse: number
  paiementsParMethode: Record<string, number>
}

/**
 * Réponse paginée de l'API
 */
export interface PaginatedPaiements {
  meta: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
    firstPage: number
    firstPageUrl: string
    lastPageUrl: string
    nextPageUrl: string | null
    previousPageUrl: string | null
  }
  data: Paiement[]
}
