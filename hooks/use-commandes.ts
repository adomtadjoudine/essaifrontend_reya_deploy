"use client"

// Hook personnalisé pour la gestion des commandes
import { useState, useEffect, useCallback } from "react"
import { commandeService } from "@/lib/api/services/commande.service"
import type {
  Commande,
  CreateCommandeData,
  UpdateCommandeData,
  ChangeStatutCommandeData,
  AddLigneCommandeData,
  CommandeStatistics,
} from "@/lib/api/types/commande"
import { toast } from "@/hooks/use-toast"

export function useCommandes() {
  const [commandes, setCommandes] = useState<Commande[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 10,
    total: 0,
    lastPage: 1,
    hasMore: false,
  })

  /**
   * Récupère toutes les commandes avec filtres optionnels
   */
  const fetchCommandes = useCallback(
    async (filters?: {
      page?: number
      limit?: number
      search?: string
      statut_id?: string
      client_id?: string
      est_urgent?: string
    }) => {
      try {
        console.log("[v0] Fetching commandes with filters:", filters)
        setLoading(true)
        setError(null)

        const data = filters ? await commandeService.getAllWithFilters(filters) : await commandeService.getAll()
        console.log("[v0] Raw API response:", data)

        if (Array.isArray(data)) {
          setCommandes(data)
          console.log("[v0] Commandes state updated with", data.length, "commandes")
        } else {
          console.error("[v0] API returned non-array data:", data)
          setCommandes([])
          setError("Format de données invalide reçu de l'API")
        }
      } catch (err) {
        console.error("[v0] Error fetching commandes:", err)

        const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des commandes"
        setError(errorMessage)
        setCommandes([])
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  /**
   * Récupère les commandes avec pagination et filtres
   */
  const fetchCommandesPaginated = useCallback(
    async (
      page = 1,
      limit = 10,
      filters?: {
        search?: string
        statut_id?: string
        client_id?: string
        est_urgent?: string
      },
    ) => {
      try {
        console.log("[v0] Fetching paginated commandes - page:", page, "limit:", limit, "filters:", filters)
        setLoading(true)
        setError(null)

        const response = await commandeService.getAllPaginated(page, limit, filters)

        if (Array.isArray(response.data)) {
          setCommandes(response.data)
          setPagination({
            currentPage: response.meta.currentPage,
            perPage: response.meta.perPage,
            total: response.meta.total,
            lastPage: response.meta.lastPage,
            hasMore: response.meta.hasMore,
          })
          console.log(
            "[v0] Commandes paginated state updated with",
            response.data.length,
            "commandes - Page",
            response.meta.currentPage,
            "of",
            response.meta.lastPage,
          )
        } else {
          console.error("[v0] API returned non-array data:", response.data)
          setCommandes([])
          setError("Format de données invalide reçu de l'API")
        }
      } catch (err) {
        console.error("[v0] Error fetching paginated commandes:", err)

        const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des commandes"
        setError(errorMessage)
        setCommandes([])
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  /**
   * Crée une nouvelle commande
   */
  const createCommande = useCallback(async (data: CreateCommandeData): Promise<Commande | null> => {
    try {
      const newCommande = await commandeService.create(data)
      setCommandes((prev) => {
        const currentCommandes = Array.isArray(prev) ? prev : []
        return [...currentCommandes, newCommande]
      })
      toast({
        title: "Succès",
        description: "Commande créée avec succès",
      })
      return newCommande
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la création de la commande"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return null
    }
  }, [])

  /**
   * Met à jour une commande
   */
  const updateCommande = useCallback(async (id: number, data: UpdateCommandeData): Promise<boolean> => {
    try {
      const updatedCommande = await commandeService.update(id, data)
      setCommandes((prev) => {
        const currentCommandes = Array.isArray(prev) ? prev : []
        return currentCommandes.map((commande) => (commande.id === id ? updatedCommande : commande))
      })
      toast({
        title: "Succès",
        description: "Commande mise à jour avec succès",
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la mise à jour de la commande"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [])

  /**
   * Archive une commande
   */
  const deleteCommande = useCallback(async (id: number): Promise<boolean> => {
    try {
      await commandeService.delete(id)
      setCommandes((prev) => {
        const currentCommandes = Array.isArray(prev) ? prev : []
        return currentCommandes.filter((commande) => commande.id !== id)
      })
      toast({
        title: "Succès",
        description: "Commande archivée avec succès",
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'archivage de la commande"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [])

  /**
   * Change le statut d'une commande
   */
  const changeStatus = useCallback(
    async (id: number, data: ChangeStatutCommandeData): Promise<boolean> => {
      try {
        await commandeService.changeStatus(id, data)
        // Recharger les commandes pour avoir les données à jour
        await fetchCommandes()
        toast({
          title: "Succès",
          description: "Statut de la commande changé avec succès",
        })
        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erreur lors du changement de statut"
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive",
        })
        return false
      }
    },
    [fetchCommandes],
  )

  /**
   * Ajoute une ligne à une commande
   */
  const addLine = useCallback(
    async (id: number, data: AddLigneCommandeData): Promise<boolean> => {
      try {
        await commandeService.addLine(id, data)
        // Recharger les commandes pour avoir les lignes à jour
        await fetchCommandes()
        toast({
          title: "Succès",
          description: "Ligne ajoutée à la commande avec succès",
        })
        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'ajout de la ligne"
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive",
        })
        return false
      }
    },
    [fetchCommandes],
  )

  /**
   * Récupère les statistiques des commandes
   */
  const getStatistics = useCallback(
    async (filters?: { dateDebut?: string; dateFin?: string }): Promise<CommandeStatistics | null> => {
      try {
        const statistics = await commandeService.getStatistics(filters)
        return statistics
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erreur lors de la récupération des statistiques"
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive",
        })
        return null
      }
    },
    [],
  )

  // Charger les commandes au montage du composant
  useEffect(() => {
    console.log("[v0] useCommandes hook initialized, fetching commandes...")
    fetchCommandesPaginated(1, 10)
  }, [fetchCommandesPaginated])

  return {
    commandes,
    loading,
    error,
    pagination,
    fetchCommandes,
    fetchCommandesPaginated,
    createCommande,
    updateCommande,
    deleteCommande,
    changeStatus,
    addLine,
    getStatistics,
  }
}
