"use client"

// Hook personnalisé pour la gestion des températures
import { useState, useEffect, useCallback } from "react"
import { temperatureService } from "@/lib/api/services/temperature.service"
import type { Temperature, CreateTemperatureData, UpdateTemperatureData } from "@/lib/api/types"
import { toast } from "@/hooks/use-toast"

/**
 * Hook personnalisé pour gérer les températures de lavage
 */
export function useTemperatures() {
  const [temperatures, setTemperatures] = useState<Temperature[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Récupère toutes les températures
   */
  const fetchTemperatures = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await temperatureService.getAll()
      setTemperatures(Array.isArray(data) ? data : [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des températures"
      setError(errorMessage)
      setTemperatures([])
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Récupère toutes les températures archivées
   */
  const fetchArchivedTemperatures = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await temperatureService.getArchived()
      setTemperatures(Array.isArray(data) ? data : [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des températures archivées"
      setError(errorMessage)
      setTemperatures([])
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Crée une nouvelle température
   */
  const createTemperature = useCallback(async (data: CreateTemperatureData): Promise<Temperature | null> => {
    try {
      const newTemperature = await temperatureService.create(data)
      setTemperatures((prev) => [...prev, newTemperature])
      toast({
        title: "Succès",
        description: "Température créée avec succès",
      })
      return newTemperature
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la création de la température"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return null
    }
  }, [])

  /**
   * Met à jour une température
   */
  const updateTemperature = useCallback(async (id: number, data: UpdateTemperatureData): Promise<boolean> => {
    try {
      const updatedTemperature = await temperatureService.update(id, data)
      setTemperatures((prev) => prev.map((temp) => (temp.id === id ? updatedTemperature : temp)))
      toast({
        title: "Succès",
        description: "Température mise à jour avec succès",
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la mise à jour de la température"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [])

  /**
   * Supprime (archive) une température
   */
  const deleteTemperature = useCallback(async (id: number): Promise<boolean> => {
    try {
      await temperatureService.delete(id)
      setTemperatures((prev) => prev.filter((temp) => temp.id !== id))
      toast({
        title: "Succès",
        description: "Température supprimée avec succès",
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la suppression de la température"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [])

  /**
   * Active/désactive une température
   */
  const toggleActive = useCallback(async (id: number): Promise<boolean> => {
    try {
      const updatedTemperature = await temperatureService.toggleActive(id)
      setTemperatures((prev) => prev.map((temp) => (temp.id === id ? updatedTemperature : temp)))
      toast({
        title: "Succès",
        description: `Température ${updatedTemperature.estActif ? "activée" : "désactivée"} avec succès`,
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

  /**
   * Restaure une température archivée
   */
  const restoreTemperature = useCallback(async (id: number): Promise<boolean> => {
    try {
      await temperatureService.restore(id)
      setTemperatures((prev) => prev.filter((temp) => temp.id !== id))
      toast({
        title: "Succès",
        description: "Température restaurée avec succès",
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la restauration de la température"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [])

  // Charger les températures au montage du composant
  useEffect(() => {
    fetchTemperatures()
  }, [fetchTemperatures])

  return {
    temperatures,
    loading,
    error,
    fetchTemperatures,
    fetchArchivedTemperatures,
    createTemperature,
    updateTemperature,
    deleteTemperature,
    toggleActive,
    restoreTemperature,
  }
}
