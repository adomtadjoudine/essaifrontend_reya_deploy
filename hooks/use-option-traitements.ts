"use client"

// Hook personnalisé pour la gestion des options de traitement
import { useState, useEffect, useCallback } from "react"
import { optionTraitementService } from "@/lib/api/services/option-traitement.service"
import type { OptionTraitement, CreateOptionTraitementData, UpdateOptionTraitementData } from "@/lib/api/types"
import { toast } from "@/hooks/use-toast"

/**
 * Hook personnalisé pour gérer les options de traitement
 */
export function useOptionTraitements() {
  const [optionTraitements, setOptionTraitements] = useState<OptionTraitement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Récupère toutes les options de traitement
   */
  const fetchOptionTraitements = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await optionTraitementService.getAll()
      setOptionTraitements(Array.isArray(data) ? data : [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des options de traitement"
      setError(errorMessage)
      setOptionTraitements([])
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
   * Récupère toutes les options de traitement archivées
   */
  const fetchArchivedOptionTraitements = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await optionTraitementService.getArchived()
      setOptionTraitements(Array.isArray(data) ? data : [])
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur lors du chargement des options de traitement archivées"
      setError(errorMessage)
      setOptionTraitements([])
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
   * Crée une nouvelle option de traitement
   */
  const createOptionTraitement = useCallback(
    async (data: CreateOptionTraitementData): Promise<OptionTraitement | null> => {
      try {
        const newOptionTraitement = await optionTraitementService.create(data)
        setOptionTraitements((prev) => [...prev, newOptionTraitement])
        toast({
          title: "Succès",
          description: "Option de traitement créée avec succès",
        })
        return newOptionTraitement
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erreur lors de la création de l'option de traitement"
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

  /**
   * Met à jour une option de traitement
   */
  const updateOptionTraitement = useCallback(async (id: number, data: UpdateOptionTraitementData): Promise<boolean> => {
    try {
      const updatedOptionTraitement = await optionTraitementService.update(id, data)
      setOptionTraitements((prev) => prev.map((option) => (option.id === id ? updatedOptionTraitement : option)))
      toast({
        title: "Succès",
        description: "Option de traitement mise à jour avec succès",
      })
      return true
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur lors de la mise à jour de l'option de traitement"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [])

  /**
   * Supprime (archive) une option de traitement
   */
  const deleteOptionTraitement = useCallback(async (id: number): Promise<boolean> => {
    try {
      await optionTraitementService.delete(id)
      setOptionTraitements((prev) => prev.filter((option) => option.id !== id))
      toast({
        title: "Succès",
        description: "Option de traitement supprimée avec succès",
      })
      return true
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur lors de la suppression de l'option de traitement"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [])

  /**
   * Active/désactive une option de traitement
   */
  const toggleActive = useCallback(async (id: number): Promise<boolean> => {
    try {
      const updatedOptionTraitement = await optionTraitementService.toggleActive(id)
      setOptionTraitements((prev) => prev.map((option) => (option.id === id ? updatedOptionTraitement : option)))
      toast({
        title: "Succès",
        description: `Option de traitement ${updatedOptionTraitement.estActif ? "activée" : "désactivée"} avec succès`,
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
   * Restaure une option de traitement archivée
   */
  const restoreOptionTraitement = useCallback(async (id: number): Promise<boolean> => {
    try {
      await optionTraitementService.restore(id)
      setOptionTraitements((prev) => prev.filter((option) => option.id !== id))
      toast({
        title: "Succès",
        description: "Option de traitement restaurée avec succès",
      })
      return true
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur lors de la restauration de l'option de traitement"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [])

  // Charger les options de traitement au montage du composant
  useEffect(() => {
    fetchOptionTraitements()
  }, [fetchOptionTraitements])

  return {
    optionTraitements,
    loading,
    error,
    fetchOptionTraitements,
    fetchArchivedOptionTraitements,
    createOptionTraitement,
    updateOptionTraitement,
    deleteOptionTraitement,
    toggleActive,
    restoreOptionTraitement,
  }
}
