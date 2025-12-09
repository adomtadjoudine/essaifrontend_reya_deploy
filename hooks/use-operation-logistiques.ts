"use client"

// Hook personnalisé pour la gestion des opérations logistiques
import { useState, useEffect, useCallback } from "react"
import { operationLogistiqueService } from "@/lib/api/services/operation-logistique.service"
import type {
  OperationLogistique,
  CreateOperationLogistiqueData,
  UpdateOperationLogistiqueData,
  CreateOperationLogistiqueAvecPreuvesData,
  ChangeStatutOperationLogistiqueData,
  MarquerRealiseeData,
  AddPreuvesToOperationData,
  RemovePreuvesFromOperationData,
  OperationLogistiqueStatistics,
} from "@/lib/api/types/operation-logistique"
import { toast } from "@/hooks/use-toast"

export function useOperationLogistiques() {
  const [operations, setOperations] = useState<OperationLogistique[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOperations = useCallback(
    async (filters?: {
      page?: number
      limit?: number
      type?: string
      statut?: string
      dateDebut?: string
      dateFin?: string
      enRetard?: boolean
      tourneeId?: number
    }) => {
      try {
        setLoading(true)
        setError(null)

        const data = filters
          ? await operationLogistiqueService.getAllWithFilters(filters)
          : await operationLogistiqueService.getAll()

        if (Array.isArray(data)) {
          setOperations(data)
        } else {
          setOperations([])
          setError("Format de données invalide reçu de l'API")
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des opérations"
        setError(errorMessage)
        setOperations([])
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

  const createOperation = useCallback(
    async (data: CreateOperationLogistiqueData): Promise<OperationLogistique | null> => {
      try {
        const newOperation = await operationLogistiqueService.create(data)
        setOperations((prev) => [...prev, newOperation])
        toast({
          title: "Succès",
          description: "Opération logistique créée avec succès",
        })
        return newOperation
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erreur lors de la création de l'opération"
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

  const createOperationAvecPreuves = useCallback(
    async (data: CreateOperationLogistiqueAvecPreuvesData): Promise<OperationLogistique | null> => {
      try {
        const newOperation = await operationLogistiqueService.createAvecPreuves(data)
        setOperations((prev) => [...prev, newOperation])
        toast({
          title: "Succès",
          description: "Opération logistique créée avec preuves avec succès",
        })
        return newOperation
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur lors de la création de l'opération avec preuves"
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

  const updateOperation = useCallback(async (id: number, data: UpdateOperationLogistiqueData): Promise<boolean> => {
    try {
      const updatedOperation = await operationLogistiqueService.update(id, data)
      setOperations((prev) => prev.map((operation) => (operation.id === id ? updatedOperation : operation)))
      toast({
        title: "Succès",
        description: "Opération logistique mise à jour avec succès",
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la mise à jour de l'opération"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [])

  const deleteOperation = useCallback(async (id: number): Promise<boolean> => {
    try {
      await operationLogistiqueService.delete(id)
      setOperations((prev) => prev.filter((operation) => operation.id !== id))
      toast({
        title: "Succès",
        description: "Opération logistique supprimée avec succès",
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la suppression de l'opération"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [])

  const changeStatus = useCallback(async (id: number, data: ChangeStatutOperationLogistiqueData): Promise<boolean> => {
    try {
      const updatedOperation = await operationLogistiqueService.changeStatus(id, data)
      setOperations((prev) => prev.map((operation) => (operation.id === id ? updatedOperation : operation)))
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

  const marquerRealisee = useCallback(async (id: number, data?: MarquerRealiseeData): Promise<boolean> => {
    try {
      const updatedOperation = await operationLogistiqueService.marquerRealisee(id, data)
      setOperations((prev) => prev.map((operation) => (operation.id === id ? updatedOperation : operation)))
      toast({
        title: "Succès",
        description: "Opération marquée comme réalisée avec succès",
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du marquage de l'opération"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [])

  const addPreuves = useCallback(
    async (id: number, data: AddPreuvesToOperationData): Promise<boolean> => {
      try {
        await operationLogistiqueService.addPreuves(id, data)
        await fetchOperations()
        toast({
          title: "Succès",
          description: "Preuves ajoutées à l'opération avec succès",
        })
        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'ajout des preuves"
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive",
        })
        return false
      }
    },
    [fetchOperations],
  )

  const removePreuves = useCallback(
    async (id: number, data: RemovePreuvesFromOperationData): Promise<boolean> => {
      try {
        await operationLogistiqueService.removePreuves(id, data)
        await fetchOperations()
        toast({
          title: "Succès",
          description: "Preuves retirées de l'opération avec succès",
        })
        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erreur lors du retrait des preuves"
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive",
        })
        return false
      }
    },
    [fetchOperations],
  )

  const getOperationsEnRetard = useCallback(async (): Promise<OperationLogistique[]> => {
    try {
      const data = await operationLogistiqueService.getOperationsEnRetard()
      return data
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur lors de la récupération des opérations en retard"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return []
    }
  }, [])

  const getStatistics = useCallback(
    async (filters?: {
      dateDebut?: string
      dateFin?: string
      type?: string
    }): Promise<OperationLogistiqueStatistics | null> => {
      try {
        const statistics = await operationLogistiqueService.getStatistics(filters)
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
    fetchOperations()
  }, [fetchOperations])

  return {
    operations,
    loading,
    error,
    fetchOperations,
    createOperation,
    createOperationAvecPreuves,
    updateOperation,
    deleteOperation,
    changeStatus,
    marquerRealisee,
    addPreuves,
    removePreuves,
    getOperationsEnRetard,
    getStatistics,
  }
}
