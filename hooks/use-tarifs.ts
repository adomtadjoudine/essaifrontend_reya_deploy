"use client"

// Hook personnalisé pour la gestion des tarifs
import { useState, useCallback } from "react"
import { tarifService } from "@/lib/api/services/tarif.service"
import type {
  Tarif,
  CreateTarifBaseData,
  CreateTarifSupplementaireData,
  UpdateTarifData,
  CalculerPrixData,
  CalculPrixResult,
} from "@/lib/api/types"
import { toast } from "@/hooks/use-toast"

/**
 * Hook personnalisé pour gérer les tarifs
 */
export function useTarifs() {
  const [tarifs, setTarifs] = useState<Tarif[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Récupère tous les tarifs actifs
   */
  const fetchTarifs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await tarifService.getAll()
      setTarifs(Array.isArray(data) ? data : [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des tarifs"
      setError(errorMessage)
      setTarifs([])
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
   * Crée un nouveau tarif de base
   */
  const createTarifBase = useCallback(async (data: CreateTarifBaseData): Promise<Tarif | null> => {
    try {
      const newTarif = await tarifService.createBase(data)
      toast({
        title: "Succès",
        description: "Tarif de base créé avec succès",
      })
      return newTarif
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la création du tarif de base"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return null
    }
  }, [])

  /**
   * Crée un nouveau tarif supplémentaire
   */
  const createTarifSupplementaire = useCallback(async (data: CreateTarifSupplementaireData): Promise<Tarif | null> => {
    try {
      const newTarif = await tarifService.createSupplementaire(data)
      toast({
        title: "Succès",
        description: "Tarif supplémentaire créé avec succès",
      })
      return newTarif
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la création du tarif supplémentaire"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return null
    }
  }, [])

  /**
   * Met à jour un tarif (crée une nouvelle version)
   */
  const updateTarif = useCallback(async (id: number, data: UpdateTarifData): Promise<boolean> => {
    try {
      await tarifService.update(id, data)
      toast({
        title: "Succès",
        description: "Tarif mis à jour avec succès (nouvelle version créée)",
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la mise à jour du tarif"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [])

  /**
   * Désactive un tarif
   */
  const deleteTarif = useCallback(async (id: number): Promise<boolean> => {
    try {
      await tarifService.delete(id)
      setTarifs((prev) => prev.filter((tarif) => tarif.id !== id))
      toast({
        title: "Succès",
        description: "Tarif désactivé avec succès",
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la désactivation du tarif"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [])

  /**
   * Récupère l'historique des tarifs pour une entité
   */
  const getHistorique = useCallback(async (entityType: string, entityId: number): Promise<Tarif[]> => {
    try {
      const data = await tarifService.getHistorique(entityType, entityId)
      return Array.isArray(data) ? data : []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la récupération de l'historique"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return []
    }
  }, [])

  /**
   * Récupère le tarif actuel d'une entité
   */
  const getTarifActuel = useCallback(async (entityType: string, entityId: number): Promise<Tarif | null> => {
    try {
      return await tarifService.getTarifActuel(entityType, entityId)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la récupération du tarif actuel"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return null
    }
  }, [])

  /**
   * Calcule le prix total pour une commande
   */
  const calculerPrix = useCallback(async (data: CalculerPrixData): Promise<CalculPrixResult | null> => {
    try {
      return await tarifService.calculerPrix(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du calcul du prix"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return null
    }
  }, [])

  return {
    tarifs,
    loading,
    error,
    fetchTarifs,
    createTarifBase,
    createTarifSupplementaire,
    updateTarif,
    deleteTarif,
    getHistorique,
    getTarifActuel,
    calculerPrix,
  }
}
