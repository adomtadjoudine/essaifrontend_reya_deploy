"use client"

/**
 * Hook personnalisé pour la gestion des statuts de commande
 */
import { useState, useEffect, useCallback } from "react"
import { statutService } from "@/lib/api/services/statut.service"
import type { Statut } from "@/lib/api/types/statut"
import { toast } from "@/hooks/use-toast"

export function useStatuts() {
  const [statuts, setStatuts] = useState<Statut[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Récupère tous les statuts actifs
   */
  const fetchStatuts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await statutService.getActifs()

      if (Array.isArray(data)) {
        setStatuts(data)
      } else {
        setStatuts([])
        setError("Format de données invalide reçu de l'API")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des statuts"
      setError(errorMessage)
      setStatuts([])
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  // Charger les statuts au montage du composant
  useEffect(() => {
    fetchStatuts()
  }, [fetchStatuts])

  return {
    statuts,
    loading,
    error,
    fetchStatuts,
  }
}
