"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"
import { useEffect, useState } from "react"
import { statistiquesService } from "@/lib/api/services/statistiques.service"
import type { TopService } from "@/lib/api/types/statistiques"
import { Skeleton } from "@/components/ui/skeleton"
import { Package } from "lucide-react"

const chartConfig = {
  quantite: {
    label: "Quantité",
    color: "hsl(217, 91%, 60%)",
  },
  chiffreAffaires: {
    label: "Chiffre d'affaires",
    color: "hsl(142, 76%, 36%)",
  },
}

export function ServicesChart() {
  const [data, setData] = useState<TopService[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        console.log("[v0] Fetching services chart data...")
        const response = await statistiquesService.getTableauDeBord()
        console.log("[v0] Services chart response:", response)

        setData(response.data.topServices)
      } catch (err) {
        console.error("[v0] Error fetching services chart data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, []) // Added empty dependency array to run once on mount

  if (loading) {
    return (
      <Card className="border border-slate-200/50 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg">
              <Package className="h-5 w-5 text-white" />
            </div>
            Top Services
          </CardTitle>
          <CardDescription>Services les plus demandés</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card className="border border-slate-200/50 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg">
              <Package className="h-5 w-5 text-white" />
            </div>
            Top Services
          </CardTitle>
          <CardDescription>Services les plus demandés</CardDescription>
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
    <Card className="border border-slate-200/50 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <div className="p-2 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg">
            <Package className="h-5 w-5 text-white" />
          </div>
          Top Services
        </CardTitle>
        <CardDescription>Services les plus demandés par quantité et CA</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="nom"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                        <p className="font-semibold text-gray-900 mb-2">{payload[0].payload.nom}</p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-600" />
                            <span className="text-sm text-gray-600">Quantité:</span>
                            <span className="text-sm font-semibold text-gray-900">{payload[0].value}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-600" />
                            <span className="text-sm text-gray-600">CA:</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {((payload[1].value as number) / 1000).toFixed(1)}k FCFA
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar yAxisId="left" dataKey="quantite" fill="hsl(217, 91%, 60%)" radius={[8, 8, 0, 0]} />
              <Bar yAxisId="right" dataKey="chiffreAffaires" fill="hsl(142, 76%, 36%)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
