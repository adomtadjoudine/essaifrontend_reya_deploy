"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { statistiquesService } from "@/lib/api/services/statistiques.service"
import type { DelaiPerformance } from "@/lib/api/types/statistiques"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock, Package, TrendingUp } from "lucide-react"

export function DeliveryPerformance() {
  const [delais, setDelais] = useState<DelaiPerformance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDelais = async () => {
      try {
        setLoading(true)
        console.log("[v0] Fetching delivery performance...")
        const response = await statistiquesService.getPerformanceDelais()
        console.log("[v0] Delivery performance response:", response)

        setDelais(response.data.slice(0, 4))
      } catch (err) {
        console.error("[v0] Error fetching delivery performance:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDelais()
  }, [])

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Performance des Délais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Performance des Délais
        </CardTitle>
      </CardHeader>
      <CardContent>
        {delais.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">Aucune donnée disponible</div>
        ) : (
          <div className="space-y-3">
            {delais.map((delaiData) => (
              <div
                key={delaiData.delai.id}
                className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm">{delaiData.delai.nom}</h4>
                    <Badge variant="outline" className="text-xs">
                      {delaiData.delai.delaiHeures}h
                    </Badge>
                  </div>
                  <Badge
                    className={
                      delaiData.performance.tauxReussite >= 90
                        ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                        : delaiData.performance.tauxReussite >= 70
                          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                    }
                  >
                    {delaiData.performance.tauxReussite.toFixed(0)}% réussite
                  </Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mb-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-300"
                    style={{ width: `${delaiData.performance.tauxReussite}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Commandes</div>
                      <div className="font-semibold">{delaiData.performance.nombreCommandes}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">CA</div>
                      <div className="font-semibold">
                        {(delaiData.performance.chiffreAffaires / 1000).toFixed(0)}k FCFA
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Panier moy.</div>
                    <div className="font-semibold">
                      {delaiData.performance.panierMoyen.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} FCFA
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
