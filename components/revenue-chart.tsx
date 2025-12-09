"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Line, LineChart } from "recharts"
import { useEffect, useState } from "react"
import { statistiquesService } from "@/lib/api/services/statistiques.service"
import type { EvolutionMensuelle } from "@/lib/api/types/statistiques"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp } from "lucide-react"

const chartConfig = {
  chiffreAffaires: {
    label: "Chiffre d'affaires",
    color: "hsl(217, 91%, 60%)", // Bleu vif
  },
  commandes: {
    label: "Commandes",
    color: "hsl(142, 76%, 36%)", // Vert vif
  },
}

const MOIS_LABELS: Record<string, string> = {
  "01": "Jan",
  "02": "Fév",
  "03": "Mar",
  "04": "Avr",
  "05": "Mai",
  "06": "Jun",
  "07": "Jul",
  "08": "Aoû",
  "09": "Sep",
  "10": "Oct",
  "11": "Nov",
  "12": "Déc",
}

export function RevenueChart() {
  const [data, setData] = useState<Array<{ month: string; revenue: number; orders: number }>>([])
  const [loading, setLoading] = useState(true)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [avgRevenue, setAvgRevenue] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        console.log("[v0] Fetching revenue chart data...")
        const response = await statistiquesService.getTableauDeBord()
        console.log("[v0] Revenue chart response:", response)

        const chartData = response.data.evolutionMensuelle.map((item: EvolutionMensuelle) => {
          const [, mois] = item.mois.split("-")
          return {
            month: MOIS_LABELS[mois] || mois,
            revenue: item.chiffreAffaires,
            orders: item.commandes,
          }
        })

        setData(chartData)

        const total = chartData.reduce((sum, item) => sum + item.revenue, 0)
        setTotalRevenue(total)
        setAvgRevenue(chartData.length > 0 ? total / chartData.length : 0)
      } catch (err) {
        console.error("[v0] Error fetching revenue chart data:", err)
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
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Évolution du chiffre d'affaires
          </CardTitle>
          <CardDescription>Tendance mensuelle des revenus et commandes</CardDescription>
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
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Évolution du chiffre d'affaires
          </CardTitle>
          <CardDescription>Tendance mensuelle des revenus et commandes</CardDescription>
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
    <Card className="border border-slate-200/50 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-white to-slate-50/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              Évolution du chiffre d'affaires
            </CardTitle>
            <CardDescription className="mt-1">Tendance mensuelle des revenus et commandes</CardDescription>
          </div>
          <div className="text-right bg-gradient-to-br from-blue-50 to-blue-100/50 px-6 py-3 rounded-xl border border-blue-200/50">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              {(totalRevenue / 1000).toFixed(0)}k
            </div>
            <div className="text-xs font-medium text-blue-700 mt-1">FCFA Total</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
              <YAxis
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                        <p className="font-semibold text-gray-900 mb-2">{payload[0].payload.month}</p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-600" />
                            <span className="text-sm text-gray-600">CA:</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {((payload[0].value as number) / 1000).toFixed(1)}k FCFA
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-600" />
                            <span className="text-sm text-gray-600">Commandes:</span>
                            <span className="text-sm font-semibold text-gray-900">{payload[1].value}</span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="hsl(217, 91%, 60%)"
                strokeWidth={3}
                dot={{ fill: "hsl(217, 91%, 60%)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                stroke="hsl(142, 76%, 36%)"
                strokeWidth={3}
                dot={{ fill: "hsl(142, 76%, 36%)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200">
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-xs text-slate-600 font-medium">Moyenne mensuelle</div>
            <div className="text-lg font-bold text-slate-900 mt-1">{(avgRevenue / 1000).toFixed(0)}k FCFA</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-xs text-slate-600 font-medium">Nombre de mois</div>
            <div className="text-lg font-bold text-slate-900 mt-1">{data.length}</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-xs text-slate-600 font-medium">Total commandes</div>
            <div className="text-lg font-bold text-slate-900 mt-1">
              {data.reduce((sum, item) => sum + item.orders, 0)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
