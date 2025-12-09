"use client"

/**
 * Hook personnalisé pour la gestion des tarifs kilométriques
 */

import { useState, useEffect, useCallback } from "react"
import { tarifKilometriqueService } from "@/lib/api/services/tarif-kilometrique.service"
import type {
  TarifKilometrique,
  CreateTarifKilometriqueData,
  UpdateTarifKilometriqueData,
} from "@/lib/api/types/tarif-kilometrique"
import { toast } from "@/hooks/use-toast"

export function useTarifKilometriques() {
  const [tarifKilometriques, setTarifKilometriques] = useState<TarifKilometrique[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Récupère tous les tarifs kilométriques
   */
  const fetchTarifKilometriques = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await tarifKilometriqueService.getAll()
      setTarifKilometriques(Array.isArray(data) ? data : [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des tarifs kilométriques"
      setError(errorMessage)
      setTarifKilometriques([])
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
   * Crée un nouveau tarif kilométrique
   */
  const createTarifKilometrique = useCallback(
    async (data: CreateTarifKilometriqueData): Promise<TarifKilometrique | null> => {
      try {
        const newTarif = await tarifKilometriqueService.create(data)
        setTarifKilometriques((prev) => [...prev, newTarif])
        toast({
          title: "Succès",
          description: "Tarif kilométrique créé avec succès",
        })
        return newTarif
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erreur lors de la création du tarif kilométrique"
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
   * Met à jour un tarif kilométrique
   */
  const updateTarifKilometrique = useCallback(
    async (id: number, data: UpdateTarifKilometriqueData): Promise<boolean> => {
      try {
        const updatedTarif = await tarifKilometriqueService.update(id, data)
        setTarifKilometriques((prev) => prev.map((tarif) => (tarif.id === id ? updatedTarif : tarif)))
        toast({
          title: "Succès",
          description: "Tarif kilométrique mis à jour avec succès",
        })
        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erreur lors de la mise à jour du tarif kilométrique"
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive",
        })
        return false
      }
    },
    [],
  )

  /**
   * Supprime (archive) un tarif kilométrique
   */
  const deleteTarifKilometrique = useCallback(async (id: number): Promise<boolean> => {
    try {
      await tarifKilometriqueService.delete(id)
      setTarifKilometriques((prev) => prev.filter((tarif) => tarif.id !== id))
      toast({
        title: "Succès",
        description: "Tarif kilométrique supprimé avec succès",
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la suppression du tarif kilométrique"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [])

  /**
   * Active/désactive un tarif kilométrique
   */
  const toggleActive = useCallback(async (id: number): Promise<boolean> => {
    try {
      const updatedTarif = await tarifKilometriqueService.toggleActive(id)
      setTarifKilometriques((prev) => prev.map((tarif) => (tarif.id === id ? updatedTarif : tarif)))
      toast({
        title: "Succès",
        description: `Tarif kilométrique ${updatedTarif.estActif ? "activé" : "désactivé"} avec succès`,
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
   * Récupère tous les tarifs kilométriques archivés
   */
  const fetchArchivedTarifKilometriques = useCallback(async (): Promise<TarifKilometrique[]> => {
    try {
      const data = await tarifKilometriqueService.getArchived()
      return Array.isArray(data) ? data : []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des tarifs archivés"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return []
    }
  }, [])

  /**
   * Restaure un tarif kilométrique archivé
   */
  const restoreTarifKilometrique = useCallback(async (id: number): Promise<boolean> => {
    try {
      await tarifKilometriqueService.restore(id)
      toast({
        title: "Succès",
        description: "Tarif kilométrique restauré avec succès",
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la restauration du tarif"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [])

  // Charger les tarifs kilométriques au montage du composant
  useEffect(() => {
    fetchTarifKilometriques()
  }, [fetchTarifKilometriques])

  return {
    tarifKilometriques,
    loading,
    error,
    fetchTarifKilometriques,
    createTarifKilometrique,
    updateTarifKilometrique,
    deleteTarifKilometrique,
    toggleActive,
    fetchArchivedTarifKilometriques,
    restoreTarifKilometrique,
  }
}
