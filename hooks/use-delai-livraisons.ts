"use client"

import { useState, useEffect, useCallback } from "react"
import { delaiLivraisonService } from "@/lib/api/services/delai-livraison.service"
import type {
  DelaiLivraison,
  CreateDelaiLivraisonData,
  UpdateDelaiLivraisonData,
} from "@/lib/api/types/delai-livraison"
import { toast } from "@/hooks/use-toast"

/**
 * Hook personnalisé pour la gestion des délais de livraison
 */
export function useDelaiLivraisons() {
  const [delaiLivraisons, setDelaiLivraisons] = useState<DelaiLivraison[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Récupère tous les délais de livraison
   */
  const fetchDelaiLivraisons = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await delaiLivraisonService.getAll()
      setDelaiLivraisons(Array.isArray(data) ? data : [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des délais de livraison"
      setError(errorMessage)
      setDelaiLivraisons([])
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
   * Crée un nouveau délai de livraison
   */
  const createDelaiLivraison = useCallback(async (data: CreateDelaiLivraisonData): Promise<DelaiLivraison | null> => {
    try {
      const newDelai = await delaiLivraisonService.create(data)
      setDelaiLivraisons((prev) => [...prev, newDelai])
      toast({
        title: "Succès",
        description: "Délai de livraison créé avec succès",
      })
      return newDelai
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la création du délai de livraison"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return null
    }
  }, [])

  /**
   * Met à jour un délai de livraison
   */
  const updateDelaiLivraison = useCallback(async (id: number, data: UpdateDelaiLivraisonData): Promise<boolean> => {
    try {
      const updatedDelai = await delaiLivraisonService.update(id, data)
      setDelaiLivraisons((prev) => prev.map((delai) => (delai.id === id ? updatedDelai : delai)))
      toast({
        title: "Succès",
        description: "Délai de livraison mis à jour avec succès",
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la mise à jour du délai de livraison"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [])

  /**
   * Supprime (archive) un délai de livraison
   */
  const deleteDelaiLivraison = useCallback(async (id: number): Promise<boolean> => {
    try {
      await delaiLivraisonService.delete(id)
      setDelaiLivraisons((prev) => prev.filter((delai) => delai.id !== id))
      toast({
        title: "Succès",
        description: "Délai de livraison supprimé avec succès",
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la suppression du délai de livraison"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [])

  /**
   * Active/désactive un délai de livraison
   */
  const toggleActive = useCallback(async (id: number): Promise<boolean> => {
    try {
      const updatedDelai = await delaiLivraisonService.toggleActive(id)
      setDelaiLivraisons((prev) => prev.map((delai) => (delai.id === id ? updatedDelai : delai)))
      toast({
        title: "Succès",
        description: `Délai de livraison ${updatedDelai.estActif ? "activé" : "désactivé"} avec succès`,
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
   * Récupère tous les délais de livraison archivés
   */
  const fetchArchivedDelaiLivraisons = useCallback(async (): Promise<DelaiLivraison[]> => {
    try {
      const data = await delaiLivraisonService.getArchived()
      return Array.isArray(data) ? data : []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des délais archivés"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return []
    }
  }, [])

  /**
   * Restaure un délai de livraison archivé
   */
  const restoreDelaiLivraison = useCallback(async (id: number): Promise<boolean> => {
    try {
      await delaiLivraisonService.restore(id)
      toast({
        title: "Succès",
        description: "Délai de livraison restauré avec succès",
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la restauration du délai"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [])

  // Charger les délais de livraison au montage du composant
  useEffect(() => {
    fetchDelaiLivraisons()
  }, [fetchDelaiLivraisons])

  return {
    delaiLivraisons,
    loading,
    error,
    fetchDelaiLivraisons,
    createDelaiLivraison,
    updateDelaiLivraison,
    deleteDelaiLivraison,
    toggleActive,
    fetchArchivedDelaiLivraisons,
    restoreDelaiLivraison,
  }
}
