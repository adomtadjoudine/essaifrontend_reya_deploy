"use client"

// Hook personnalisé pour la gestion des livreurs
import { useState, useEffect, useCallback } from "react"
import { livreurService } from "@/lib/api/services/livreur.service"
import type { Livreur, CreateLivreurData, UpdateLivreurData, ToggleDisponibiliteData } from "@/lib/api/types/livreur"
import { toast } from "@/hooks/use-toast"

export function useLivreurs() {
  const [livreurs, setLivreurs] = useState<Livreur[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLivreurs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await livreurService.getAll()

      if (Array.isArray(data)) {
        setLivreurs(data)
      } else {
        setLivreurs([])
        setError("Format de données invalide reçu de l'API")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des livreurs"
      setError(errorMessage)
      setLivreurs([])
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchLivreursDisponibles = useCallback(async () => {
    try {
      const data = await livreurService.getDisponibles()
      return Array.isArray(data) ? data : []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des livreurs disponibles"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return []
    }
  }, [])

  const createLivreur = useCallback(async (data: CreateLivreurData): Promise<Livreur | null> => {
    try {
      const response = await livreurService.create(data)

      // Extraction des données selon le format de l'API
      const newLivreur = (response as any)?.data || response

      setLivreurs((prev) => [...prev, newLivreur])
      toast({
        title: "Succès",
        description: "Livreur créé avec succès",
      })
      return newLivreur
    } catch (err) {
      const errorMessage =
        (err as any)?.message || (err instanceof Error ? err.message : "Erreur lors de la création du livreur")
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return null
    }
  }, [])

  const updateLivreur = useCallback(async (id: number, data: UpdateLivreurData): Promise<boolean> => {
    try {
      const response = await livreurService.update(id, data)
      const updatedLivreur = (response as any)?.data || response
      setLivreurs((prev) => prev.map((livreur) => (livreur.id === id ? updatedLivreur : livreur)))
      toast({
        title: "Succès",
        description: "Livreur mis à jour avec succès",
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la mise à jour du livreur"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [])

  const deleteLivreur = useCallback(async (id: number): Promise<boolean> => {
    try {
      await livreurService.delete(id)
      setLivreurs((prev) => prev.filter((livreur) => livreur.id !== id))
      toast({
        title: "Succès",
        description: "Livreur supprimé avec succès",
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la suppression du livreur"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [])

  const toggleDisponibilite = useCallback(async (id: number, data: ToggleDisponibiliteData): Promise<boolean> => {
    try {
      const response = await livreurService.toggleDisponibilite(id, data)
      const updatedLivreur = (response as any)?.data || response
      setLivreurs((prev) => prev.map((livreur) => (livreur.id === id ? updatedLivreur : livreur)))
      toast({
        title: "Succès",
        description: data.estDisponible ? "Livreur marqué disponible" : "Livreur marqué indisponible",
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du changement de disponibilité"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [])

  useEffect(() => {
    fetchLivreurs()
  }, [fetchLivreurs])

  return {
    livreurs,
    loading,
    error,
    fetchLivreurs,
    fetchLivreursDisponibles,
    createLivreur,
    updateLivreur,
    deleteLivreur,
    toggleDisponibilite,
  }
}
