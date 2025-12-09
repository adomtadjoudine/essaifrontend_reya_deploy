"use client"

/**
 * Hook personnalisé pour la gestion des créneaux de collecte
 */

import { useState, useEffect, useCallback } from "react"
import { creneauCollecteService } from "@/lib/api/services/creneau-collecte.service"
import type {
  CreneauCollecte,
  CreateCreneauCollecteData,
  UpdateCreneauCollecteData,
} from "@/lib/api/types/creneau-collecte"
import { toast } from "@/hooks/use-toast"

export function useCreneauCollectes() {
  const [creneauCollectes, setCreneauCollectes] = useState<CreneauCollecte[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Récupère tous les créneaux de collecte
   */
  const fetchCreneauCollectes = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await creneauCollecteService.getAll()
      setCreneauCollectes(Array.isArray(data) ? data : [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des créneaux de collecte"
      setError(errorMessage)
      setCreneauCollectes([])
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
   * Crée un nouveau créneau de collecte
   */
  const createCreneauCollecte = useCallback(
    async (data: CreateCreneauCollecteData): Promise<CreneauCollecte | null> => {
      try {
        const newCreneau = await creneauCollecteService.create(data)
        setCreneauCollectes((prev) => [...prev, newCreneau])
        toast({
          title: "Succès",
          description: "Créneau de collecte créé avec succès",
        })
        return newCreneau
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erreur lors de la création du créneau de collecte"
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
   * Met à jour un créneau de collecte
   */
  const updateCreneauCollecte = useCallback(async (id: number, data: UpdateCreneauCollecteData): Promise<boolean> => {
    try {
      const updatedCreneau = await creneauCollecteService.update(id, data)
      setCreneauCollectes((prev) => prev.map((creneau) => (creneau.id === id ? updatedCreneau : creneau)))
      toast({
        title: "Succès",
        description: "Créneau de collecte mis à jour avec succès",
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la mise à jour du créneau de collecte"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [])

  /**
   * Supprime (archive) un créneau de collecte
   */
  const deleteCreneauCollecte = useCallback(async (id: number): Promise<boolean> => {
    try {
      await creneauCollecteService.delete(id)
      setCreneauCollectes((prev) => prev.filter((creneau) => creneau.id !== id))
      toast({
        title: "Succès",
        description: "Créneau de collecte supprimé avec succès",
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la suppression du créneau de collecte"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [])

  /**
   * Active/désactive un créneau de collecte
   */
  const toggleActive = useCallback(async (id: number): Promise<boolean> => {
    try {
      const updatedCreneau = await creneauCollecteService.toggleActive(id)
      setCreneauCollectes((prev) => prev.map((creneau) => (creneau.id === id ? updatedCreneau : creneau)))
      toast({
        title: "Succès",
        description: `Créneau de collecte ${updatedCreneau.estActif ? "activé" : "désactivé"} avec succès`,
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
   * Récupère tous les créneaux de collecte archivés
   */
  const fetchArchivedCreneauCollectes = useCallback(async (): Promise<CreneauCollecte[]> => {
    try {
      const data = await creneauCollecteService.getArchived()
      return Array.isArray(data) ? data : []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des créneaux archivés"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return []
    }
  }, [])

  /**
   * Restaure un créneau de collecte archivé
   */
  const restoreCreneauCollecte = useCallback(async (id: number): Promise<boolean> => {
    try {
      await creneauCollecteService.restore(id)
      toast({
        title: "Succès",
        description: "Créneau de collecte restauré avec succès",
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la restauration du créneau"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [])

  // Charger les créneaux de collecte au montage du composant
  useEffect(() => {
    fetchCreneauCollectes()
  }, [fetchCreneauCollectes])

  return {
    creneauCollectes,
    loading,
    error,
    fetchCreneauCollectes,
    createCreneauCollecte,
    updateCreneauCollecte,
    deleteCreneauCollecte,
    toggleActive,
    fetchArchivedCreneauCollectes,
    restoreCreneauCollecte,
  }
}
