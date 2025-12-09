"use client"

// Hook personnalisé pour la gestion des tournées
import { useState, useEffect, useCallback } from "react"
import { tourneeService } from "@/lib/api/services/tournee.service"
import type {
  Tournee,
  CreateTourneeData,
  UpdateTourneeData,
  ChangeStatutTourneeData,
  AddOperationsToTourneeData,
  RemoveOperationsFromTourneeData,
  TourneeStatistics,
} from "@/lib/api/types/tournee"
import { toast } from "@/hooks/use-toast"

export function useTournees() {
  const [tournees, setTournees] = useState<Tournee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTournees = useCallback(
    async (filters?: {
      page?: number
      limit?: number
      statut?: string
      livreurId?: number
      dateDebut?: string
      dateFin?: string
    }) => {
      try {
        setLoading(true)
        setError(null)

        const data = filters ? await tourneeService.getAllWithFilters(filters) : await tourneeService.getAll()

        if (Array.isArray(data)) {
          setTournees(data)
        } else {
          setTournees([])
          setError("Format de données invalide reçu de l'API")
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des tournées"
        setError(errorMessage)
        setTournees([])
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

  const createTournee = useCallback(async (data: CreateTourneeData): Promise<Tournee | null> => {
    try {
      const newTournee = await tourneeService.create(data)
      setTournees((prev) => [...prev, newTournee])
      toast({
        title: "Succès",
        description: "Tournée créée avec succès",
      })
      return newTournee
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la création de la tournée"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return null
    }
  }, [])

  const updateTournee = useCallback(async (id: number, data: UpdateTourneeData): Promise<boolean> => {
    try {
      const updatedTournee = await tourneeService.update(id, data)
      setTournees((prev) => prev.map((tournee) => (tournee.id === id ? updatedTournee : tournee)))
      toast({
        title: "Succès",
        description: "Tournée mise à jour avec succès",
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la mise à jour de la tournée"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [])

  const deleteTournee = useCallback(async (id: number): Promise<boolean> => {
    try {
      await tourneeService.delete(id)
      setTournees((prev) => prev.filter((tournee) => tournee.id !== id))
      toast({
        title: "Succès",
        description: "Tournée supprimée avec succès",
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la suppression de la tournée"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [])

  const changeStatus = useCallback(async (id: number, data: ChangeStatutTourneeData): Promise<boolean> => {
    try {
      const updatedTournee = await tourneeService.changeStatus(id, data)
      setTournees((prev) => prev.map((tournee) => (tournee.id === id ? updatedTournee : tournee)))
      toast({
        title: "Succès",
        description: `Statut changé vers "${data.statut}" avec succès`,
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
  }, [])

  const addOperations = useCallback(
    async (id: number, data: AddOperationsToTourneeData): Promise<boolean> => {
      try {
        await tourneeService.addOperations(id, data)
        await fetchTournees()
        toast({
          title: "Succès",
          description: "Opérations ajoutées à la tournée avec succès",
        })
        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'ajout des opérations"
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive",
        })
        return false
      }
    },
    [fetchTournees],
  )

  const removeOperations = useCallback(
    async (id: number, data: RemoveOperationsFromTourneeData): Promise<boolean> => {
      try {
        await tourneeService.removeOperations(id, data)
        await fetchTournees()
        toast({
          title: "Succès",
          description: "Opérations retirées de la tournée avec succès",
        })
        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erreur lors du retrait des opérations"
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive",
        })
        return false
      }
    },
    [fetchTournees],
  )

  const getStatistics = useCallback(
    async (filters?: {
      dateDebut?: string
      dateFin?: string
      livreurId?: number
    }): Promise<TourneeStatistics | null> => {
      try {
        const statistics = await tourneeService.getStatistics(filters)
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

  useEffect(() => {
    fetchTournees()
  }, [fetchTournees])

  return {
    tournees,
    loading,
    error,
    fetchTournees,
    createTournee,
    updateTournee,
    deleteTournee,
    changeStatus,
    addOperations,
    removeOperations,
    getStatistics,
  }
}
