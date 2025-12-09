"use client"

// Hook personnalisé pour la gestion des types de linge
import { useState, useEffect, useCallback } from "react"
import { typeLingeService } from "@/lib/api/services/type-linge.service"
import type { TypeLinge, CreateTypeLingeData, UpdateTypeLingeData } from "@/lib/api/types"
import { toast } from "@/hooks/use-toast"

/**
 * Hook personnalisé pour gérer les types de linge
 */
export function useTypeLinges() {
  const [typeLinges, setTypeLinges] = useState<TypeLinge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Récupère tous les types de linge
   */
  const fetchTypeLinges = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await typeLingeService.getAll()
      setTypeLinges(Array.isArray(data) ? data : [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des types de linge"
      setError(errorMessage)
      setTypeLinges([])
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
   * Récupère tous les types de linge archivés
   */
  const fetchArchivedTypeLinges = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await typeLingeService.getArchived()
      setTypeLinges(Array.isArray(data) ? data : [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des types de linge archivés"
      setError(errorMessage)
      setTypeLinges([])
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
   * Crée un nouveau type de linge
   */
  const createTypeLinge = useCallback(async (data: CreateTypeLingeData): Promise<TypeLinge | null> => {
    try {
      const newTypeLinge = await typeLingeService.create(data)
      setTypeLinges((prev) => [...prev, newTypeLinge])
      toast({
        title: "Succès",
        description: "Type de linge créé avec succès",
      })
      return newTypeLinge
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la création du type de linge"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return null
    }
  }, [])

  /**
   * Met à jour un type de linge
   */
  const updateTypeLinge = useCallback(async (id: number, data: UpdateTypeLingeData): Promise<boolean> => {
    try {
      const updatedTypeLinge = await typeLingeService.update(id, data)
      setTypeLinges((prev) => prev.map((typeLinge) => (typeLinge.id === id ? updatedTypeLinge : typeLinge)))
      toast({
        title: "Succès",
        description: "Type de linge mis à jour avec succès",
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la mise à jour du type de linge"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [])

  /**
   * Supprime (archive) un type de linge
   */
  const deleteTypeLinge = useCallback(async (id: number): Promise<boolean> => {
    try {
      await typeLingeService.delete(id)
      setTypeLinges((prev) => prev.filter((typeLinge) => typeLinge.id !== id))
      toast({
        title: "Succès",
        description: "Type de linge supprimé avec succès",
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la suppression du type de linge"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [])

  /**
   * Active/désactive un type de linge
   */
  const toggleActive = useCallback(async (id: number): Promise<boolean> => {
    try {
      const updatedTypeLinge = await typeLingeService.toggleActive(id)
      setTypeLinges((prev) => prev.map((typeLinge) => (typeLinge.id === id ? updatedTypeLinge : typeLinge)))
      toast({
        title: "Succès",
        description: `Type de linge ${updatedTypeLinge.estActif ? "activé" : "désactivé"} avec succès`,
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
   * Restaure un type de linge archivé
   */
  const restoreTypeLinge = useCallback(async (id: number): Promise<boolean> => {
    try {
      await typeLingeService.restore(id)
      setTypeLinges((prev) => prev.filter((typeLinge) => typeLinge.id !== id))
      toast({
        title: "Succès",
        description: "Type de linge restauré avec succès",
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la restauration du type de linge"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [])

  // Charger les types de linge au montage du composant
  useEffect(() => {
    fetchTypeLinges()
  }, [fetchTypeLinges])

  return {
    typeLinges,
    loading,
    error,
    fetchTypeLinges,
    fetchArchivedTypeLinges,
    createTypeLinge,
    updateTypeLinge,
    deleteTypeLinge,
    toggleActive,
    restoreTypeLinge,
  }
}
