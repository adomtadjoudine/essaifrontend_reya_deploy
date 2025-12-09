"use client"

/**
 * Hook personnalisé pour la gestion des paiements
 */

import { useState, useEffect, useCallback } from "react"
import { paiementService } from "@/lib/api/services/paiement.service"
import type {
  Paiement,
  CreatePaiementData,
  UpdatePaiementData,
  RemboursementData,
  PaiementStatistics,
} from "@/lib/api/types/paiement"

export function usePaiements() {
  const [paiements, setPaiements] = useState<Paiement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 10,
    total: 0,
    lastPage: 1,
    hasMore: false,
  })

  /**
   * Récupère tous les paiements avec filtres
   */
  const fetchPaiements = useCallback(
    async (params?: {
      page?: number
      limit?: number
      search?: string
      statut?: string
      methode?: string
      commandeId?: number
    }) => {
      try {
        setLoading(true)
        setError(null)
        const result = await paiementService.getAll(params)
        setPaiements(result.data)
        setCurrentPage(result.meta.currentPage)
        setTotalPages(result.meta.lastPage)
        setTotal(result.meta.total)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue")
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  /**
   * Récupère les paiements avec pagination et filtres
   */
  const fetchPaiementsPaginated = useCallback(
    async (
      page = 1,
      limit = 10,
      filters?: {
        search?: string
        statut?: string
        methode?: string
        commandeId?: number
      },
    ) => {
      try {
        setLoading(true)
        setError(null)

        const result = await paiementService.getAll({
          page,
          limit,
          ...filters,
        })

        setPaiements(result.data)
        setPagination({
          currentPage: result.meta.currentPage,
          perPage: result.meta.perPage,
          total: result.meta.total,
          lastPage: result.meta.lastPage,
          hasMore: result.meta.nextPageUrl !== null,
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue"
        setError(errorMessage)
        setPaiements([])
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  /**
   * Récupère un paiement par son ID
   */
  const getPaiementById = useCallback(async (id: number): Promise<Paiement | null> => {
    try {
      return await paiementService.getById(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
      return null
    }
  }, [])

  /**
   * Récupère les paiements d'une commande
   */
  const getPaiementsByCommande = useCallback(async (commandeId: number): Promise<Paiement[]> => {
    try {
      return await paiementService.getByCommande(commandeId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
      return []
    }
  }, [])

  /**
   * Crée un nouveau paiement
   */
  const createPaiement = useCallback(
    async (data: CreatePaiementData): Promise<boolean> => {
      try {
        await paiementService.create(data)
        await fetchPaiementsPaginated(1, pagination.perPage)
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue")
        return false
      }
    },
    [fetchPaiementsPaginated, pagination.perPage],
  )

  /**
   * Met à jour un paiement
   */
  const updatePaiement = useCallback(
    async (id: number, data: UpdatePaiementData): Promise<boolean> => {
      try {
        await paiementService.update(id, data)
        await fetchPaiementsPaginated(pagination.currentPage, pagination.perPage)
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue")
        return false
      }
    },
    [fetchPaiementsPaginated, pagination.currentPage, pagination.perPage],
  )

  /**
   * Valide un paiement
   */
  const validerPaiement = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await paiementService.valider(id)
        await fetchPaiementsPaginated(pagination.currentPage, pagination.perPage)
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue")
        return false
      }
    },
    [fetchPaiementsPaginated, pagination.currentPage, pagination.perPage],
  )

  /**
   * Rejette un paiement
   */
  const rejeterPaiement = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await paiementService.rejeter(id)
        await fetchPaiementsPaginated(pagination.currentPage, pagination.perPage)
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue")
        return false
      }
    },
    [fetchPaiementsPaginated, pagination.currentPage, pagination.perPage],
  )

  /**
   * Rembourse un paiement
   */
  const rembourserPaiement = useCallback(
    async (id: number, data: RemboursementData): Promise<boolean> => {
      try {
        await paiementService.rembourser(id, data)
        await fetchPaiementsPaginated(pagination.currentPage, pagination.perPage)
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue")
        return false
      }
    },
    [fetchPaiementsPaginated, pagination.currentPage, pagination.perPage],
  )

  /**
   * Archive un paiement
   */
  const deletePaiement = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await paiementService.delete(id)
        await fetchPaiementsPaginated(pagination.currentPage, pagination.perPage)
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue")
        return false
      }
    },
    [fetchPaiementsPaginated, pagination.currentPage, pagination.perPage],
  )

  /**
   * Calcule les statistiques des paiements
   */
  const getStatistics = useCallback((): PaiementStatistics => {
    const stats: PaiementStatistics = {
      totalPaiements: paiements.length,
      montantTotal: 0,
      paiementsEnAttente: 0,
      paiementsValides: 0,
      paiementsEchoues: 0,
      montantRembourse: 0,
      paiementsParMethode: {},
    }

    paiements.forEach((paiement) => {
      stats.montantTotal += paiement.montant

      if (paiement.statut === "en_attente") stats.paiementsEnAttente++
      if (paiement.statut === "valide") stats.paiementsValides++
      if (paiement.statut === "echoue") stats.paiementsEchoues++

      if (paiement.estRembourse && paiement.montantRembourse) {
        stats.montantRembourse += paiement.montantRembourse
      }

      stats.paiementsParMethode[paiement.methode] = (stats.paiementsParMethode[paiement.methode] || 0) + 1
    })

    return stats
  }, [paiements])

  // Charger les paiements au montage du composant
  useEffect(() => {
    fetchPaiementsPaginated(1, 10)
  }, [fetchPaiementsPaginated])

  return {
    paiements,
    loading,
    error,
    currentPage,
    totalPages,
    total,
    pagination,
    fetchPaiements,
    fetchPaiementsPaginated,
    getPaiementById,
    getPaiementsByCommande,
    createPaiement,
    updatePaiement,
    validerPaiement,
    rejeterPaiement,
    rembourserPaiement,
    deletePaiement,
    getStatistics,
  }
}
