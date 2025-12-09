"use client"

// Hook personnalisé pour la gestion des promotions
import { useState, useEffect, useCallback } from "react"
import { promotionService } from "@/lib/api/services/promotion.service"
import type {
  Promotion,
  CreatePromotionData,
  UpdatePromotionData,
  VerificationCodePromoResponse,
  StatistiquesPromotion,
} from "@/lib/api/types/promotion"
import { toast } from "@/hooks/use-toast"

/**
 * Hook personnalisé pour gérer les promotions et codes promo
 */
export function usePromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Récupère toutes les promotions avec filtres optionnels
   */
  const fetchPromotions = useCallback(
    async (filters?: {
      page?: number
      limit?: number
      search?: string
      typeReduction?: string
      estActif?: boolean
    }) => {
      try {
        setLoading(true)
        setError(null)

        const data = filters ? await promotionService.getAllWithFilters(filters) : await promotionService.getAll()

        if (Array.isArray(data)) {
          setPromotions(data)
        } else {
          setPromotions([])
          setError("Format de données invalide reçu de l'API")
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des promotions"
        setError(errorMessage)
        setPromotions([])
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

  /**
   * Crée une nouvelle promotion
   */
  const createPromotion = useCallback(async (data: CreatePromotionData): Promise<Promotion | null> => {
    try {
      const newPromotion = await promotionService.create(data)
      setPromotions((prev) => [...prev, newPromotion])
      toast({
        title: "Succès",
        description: "Promotion créée avec succès",
      })
      return newPromotion
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la création de la promotion"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return null
    }
  }, [])

  /**
   * Met à jour une promotion
   */
  const updatePromotion = useCallback(async (id: number, data: UpdatePromotionData): Promise<boolean> => {
    try {
      const updatedPromotion = await promotionService.update(id, data)
      setPromotions((prev) => prev.map((promotion) => (promotion.id === id ? updatedPromotion : promotion)))
      toast({
        title: "Succès",
        description: "Promotion mise à jour avec succès",
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la mise à jour de la promotion"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [])

  /**
   * Supprime (archive) une promotion
   */
  const deletePromotion = useCallback(async (id: number): Promise<boolean> => {
    try {
      await promotionService.delete(id)
      setPromotions((prev) => prev.filter((promotion) => promotion.id !== id))
      toast({
        title: "Succès",
        description: "Promotion supprimée avec succès",
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la suppression de la promotion"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [])

  /**
   * Active/désactive une promotion
   */
  const toggleActive = useCallback(async (id: number): Promise<boolean> => {
    try {
      const updatedPromotion = await promotionService.toggleActive(id)
      setPromotions((prev) => prev.map((promotion) => (promotion.id === id ? updatedPromotion : promotion)))
      toast({
        title: "Succès",
        description: `Promotion ${updatedPromotion.estActif ? "activée" : "désactivée"} avec succès`,
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
   * Vérifie la validité d'un code promo
   */
  const verifierCodePromo = useCallback(
    async (
      code: string,
      montantCommande: number,
      clientId?: number,
      serviceId?: number,
    ): Promise<VerificationCodePromoResponse | null> => {
      try {
        const result = await promotionService.verifierCode(code, montantCommande, clientId, serviceId)
        if (result.estValide) {
          toast({
            title: "Code promo valide",
            description: result.message,
          })
        } else {
          toast({
            title: "Code promo invalide",
            description: result.message,
            variant: "destructive",
          })
        }
        return result
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erreur lors de la vérification du code promo"
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
   * Récupère les statistiques d'une promotion
   */
  const getStatistiques = useCallback(async (id: number): Promise<StatistiquesPromotion | null> => {
    try {
      const stats = await promotionService.getStatistiques(id)
      return stats
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des statistiques"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      return null
    }
  }, [])

  // Charger les promotions au montage du composant
  useEffect(() => {
    fetchPromotions()
  }, [fetchPromotions])

  return {
    promotions,
    loading,
    error,
    fetchPromotions,
    createPromotion,
    updatePromotion,
    deletePromotion,
    toggleActive,
    verifierCodePromo,
    getStatistiques,
  }
}
