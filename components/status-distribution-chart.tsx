"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartTooltip } from "@/components/ui/chart"
import { Pie, PieChart, ResponsiveContainer, Cell } from "recharts"
import { useEffect, useState } from "react"
import { statistiquesService } from "@/lib/api/services/statistiques.service"
import { Skeleton } from "@/components/ui/skeleton"
import { PieChartIcon } from "lucide-react"

const COLORS: Record<string, string> = {
  en_attente: "hsl(45, 93%, 47%)", // Jaune pour en attente
  en_attente_de_collecte: "hsl(38, 92%, 50%)", // Orange pour attente de collecte
  collecte_en_cours: "hsl(217, 91%, 60%)", // Bleu pour collecte en cours
  en_cours_de_traitement: "hsl(271, 76%, 53%)", // Violet pour en traitement
  en_cours_de_livraison: "hsl(217, 91%, 60%)", // Bleu pour en cours de livraison
  pret: "hsl(142, 76%, 36%)", // Vert pour prêt
  livre: "hsl(210, 40%, 50%)", // Gris-bleu pour livré
  annule: "hsl(0, 84%, 60%)", // Rouge pour annulé
}

const STATUS_LABELS: Record<string, string> = {
  en_attente: "En attente",
  en_attente_de_collecte: "Collectée	",
  collecte_en_cours: "Collecte en cours",
  en_cours_de_traitement: "En cours de traitement",
  en_cours_de_livraison: "En cours de livraison",
  pret: "Prêt",
  livre: "Livré	",
  annule: "Annulé",
}

export function StatusDistributionChart() {
  const [data, setData] = useState<Array<{ name: string; value: number; color: string; status: string }>>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        console.log("[v0] Fetching status distribution data...")
        const response = await statistiquesService.getTableauDeBord()
        console.log("[v0] Status distribution response:", response)

        const chartData = Object.entries(response.data.repartitionStatuts).map(([status, count]) => {
          const normalizedStatus = status.toLowerCase().replace(/\s+/g, "_")
          return {
            name: STATUS_LABELS[normalizedStatus] || status,
            value: count as number,
            color: COLORS[normalizedStatus] || "hsl(0, 0%, 50%)",
            status: normalizedStatus,
          }
        })

        setData(chartData)
        setTotal(chartData.reduce((sum, item) => sum + item.value, 0))
      } catch (err) {
        console.error("[v0] Error fetching status distribution data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-blue-600" />
            Répartition par statut
          </CardTitle>
          <CardDescription>Distribution des commandes par statut</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-blue-600" />
            Répartition par statut
          </CardTitle>
          <CardDescription>Distribution des commandes par statut</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center">
            <p className="text-muted-foreground">Aucune donnée disponible</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-blue-600" />
              Répartition par statut
            </CardTitle>
            <CardDescription>Distribution des commandes par statut</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{total}</div>
            <div className="text-xs text-gray-500">Total commandes</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const percentage = (((payload[0].value as number) / total) * 100).toFixed(1)
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                        <p className="font-semibold text-gray-900 mb-1">{payload[0].name}</p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Nombre:</span>
                            <span className="text-sm font-semibold text-gray-900">{payload[0].value}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Pourcentage:</span>
                            <span className="text-sm font-semibold text-gray-900">{percentage}%</span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-gray-600">{item.name}:</span>
              <span className="text-sm font-semibold text-gray-900">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
