"use client"

// Hook personnalisé pour la gestion des preuves
import { useState, useEffect, useCallback } from "react"
import { preuveService } from "@/lib/api/services/preuve.service"
import type { Preuve, CreatePreuveData, UpdatePreuveData, PreuveStatistics } from "@/lib/api/types/preuve"
import { toast } from "@/hooks/use-toast"

export function usePreuves() {
  const [preuves, setPreuves] = useState<Preuve[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPreuves = useCallback(
    async (filters?: {
      page?: number
      limit?: number
      typePreuve?: string
      dateDebut?: string
      dateFin?: string
    }) => {
      try {
        setLoading(true)
        setError(null)

        const data = filters ? await preuveService.getAllWithFilters(filters) : await preuveService.getAll()

        if (Array.isArray(data)) {
          setPreuves(data)
        } else {
          setPreuves([])
          setError("Format de données invalide reçu de l'API")
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des preuves"
        setError(errorMessage)
        setPreuves([])
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

  const createPreuve = useCallback(async (data: CreatePreuveData): Promise<Preuve | null> => {
    try {
      const newPreuve = await preuveService.create(data)
      setPreuves((prev) => [...prev, newPreuve])
      toast({
        title: "Succès",
        description: "Preuve créée avec succès",
      })
      return newPreuve
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la création de la preuve"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return null
    }
  }, [])

  const uploadPreuve = useCallback(async (formData: FormData): Promise<Preuve | null> => {
    try {
      const newPreuve = await preuveService.upload(formData)
      setPreuves((prev) => [...prev, newPreuve])
      toast({
        title: "Succès",
        description: "Fichiers uploadés avec succès",
      })
      return newPreuve
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'upload des fichiers"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return null
    }
  }, [])

  const updatePreuve = useCallback(async (id: number, data: UpdatePreuveData): Promise<boolean> => {
    try {
      const updatedPreuve = await preuveService.update(id, data)
      setPreuves((prev) => prev.map((preuve) => (preuve.id === id ? updatedPreuve : preuve)))
      toast({
        title: "Succès",
        description: "Preuve mise à jour avec succès",
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la mise à jour de la preuve"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [])

  const deletePreuve = useCallback(async (id: number): Promise<boolean> => {
    try {
      await preuveService.delete(id)
      setPreuves((prev) => prev.filter((preuve) => preuve.id !== id))
      toast({
        title: "Succès",
        description: "Preuve supprimée avec succès",
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la suppression de la preuve"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [])

  const getStatistics = useCallback(
    async (filters?: { dateDebut?: string; dateFin?: string }): Promise<PreuveStatistics | null> => {
      try {
        const statistics = await preuveService.getStatistics(filters)
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
    fetchPreuves()
  }, [fetchPreuves])

  return {
    preuves,
    loading,
    error,
    fetchPreuves,
    createPreuve,
    uploadPreuve,
    updatePreuve,
    deletePreuve,
    getStatistics,
  }
}
