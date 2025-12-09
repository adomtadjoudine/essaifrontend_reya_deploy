"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, ShoppingCart, Users, Truck, Euro, Clock, Star } from "lucide-react"
import { useEffect, useState } from "react"
import { statistiquesService } from "@/lib/api/services/statistiques.service"
import type { StatistiquesGenerales } from "@/lib/api/types/statistiques"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardStatsProps {
  dateDebut?: string
  dateFin?: string
}

export function DashboardStats({ dateDebut, dateFin }: DashboardStatsProps) {
  const [stats, setStats] = useState<StatistiquesGenerales | null>(null)
  const [repartitionStatuts, setRepartitionStatuts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await statistiquesService.getTableauDeBord(dateDebut, dateFin)
        setStats(response.data.statistiquesGenerales)
        setRepartitionStatuts(response.data.repartitionStatuts)
        setError(null)
      } catch (err) {
        console.error("Error fetching dashboard stats:", err)
        setError("Erreur lors du chargement des statistiques")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [dateDebut, dateFin]) // Added dependency array to prevent infinite loops

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card className="col-span-full shadow-sm">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">{error || "Aucune donnée disponible"}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalLivraisons = (repartitionStatuts.livree || 0) + (repartitionStatuts.en_livraison || 0)
  const commandesEnCours = repartitionStatuts.en_cours || 0
  const commandesLivrees = repartitionStatuts.livree || 0

  const avgDeliveryTime = "3h 25min"

  const satisfactionRate =
    stats.nombreCommandes > 0 ? ((commandesLivrees / stats.nombreCommandes) * 100).toFixed(0) : "0"

  const statsData = [
    {
      title: "Commandes totales",
      value: stats.nombreCommandes.toString(),
      change: "+8.2%",
      trend: "up" as const,
      icon: ShoppingCart,
      description: "Total période",
      bgColor: "bg-blue-500",
      iconBgColor: "bg-blue-100 dark:bg-blue-950",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Chiffre d'affaires",
      value: `${(stats.chiffreAffaires / 1000).toFixed(0)}k`,
      subValue: "FCFA",
      change: "+12.5%",
      trend: "up" as const,
      icon: Euro,
      description: "Total revenus",
      bgColor: "bg-emerald-500",
      iconBgColor: "bg-emerald-100 dark:bg-emerald-950",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Commandes en cours",
      value: commandesEnCours.toString(),
      change: commandesEnCours > 0 ? "Actives" : "Aucune",
      trend: commandesEnCours > 0 ? ("up" as const) : ("neutral" as const),
      icon: Truck,
      description: "En traitement",
      bgColor: "bg-purple-500",
      iconBgColor: "bg-purple-100 dark:bg-purple-950",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Délai moyen",
      value: avgDeliveryTime,
      change: "-15min",
      trend: "up" as const,
      icon: Clock,
      description: "Temps livraison",
      bgColor: "bg-orange-500",
      iconBgColor: "bg-orange-100 dark:bg-orange-950",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
    {
      title: "Panier moyen",
      value: `${(stats.panierMoyen / 1000).toFixed(1)}k`,
      subValue: "FCFA",
      change: "+5%",
      trend: "up" as const,
      icon: Users,
      description: "Par commande",
      bgColor: "bg-pink-500",
      iconBgColor: "bg-pink-100 dark:bg-pink-950",
      iconColor: "text-pink-600 dark:text-pink-400",
    },
    {
      title: "Taux satisfaction",
      value: `${satisfactionRate}%`,
      change: "+2%",
      trend: "up" as const,
      icon: Star,
      description: "Commandes livrées",
      bgColor: "bg-amber-500",
      iconBgColor: "bg-amber-100 dark:bg-amber-900/30",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 animate-in fade-in duration-500">
      {statsData.map((stat, index) => (
        <Card
          key={stat.title}
          className="group relative overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-white dark:bg-card border border-slate-200/50 hover:border-slate-300 hover:-translate-y-1"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div
            className={`absolute top-0 left-0 right-0 h-1 ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
          />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {stat.title}
            </CardTitle>
            <div
              className={`p-2 rounded-lg ${stat.iconBgColor} group-hover:scale-110 transition-transform duration-300`}
            >
              <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground tracking-tight">
              {stat.value}
              {stat.subValue && <span className="text-sm font-normal text-muted-foreground ml-1">{stat.subValue}</span>}
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Badge
                variant={stat.trend === "up" ? "default" : stat.trend === "neutral" ? "secondary" : "destructive"}
                className={`flex items-center gap-1 text-xs font-medium ${
                  stat.trend === "up"
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : stat.trend === "neutral"
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
                      : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {stat.trend === "up" ? (
                  <TrendingUp className="h-3 w-3" />
                ) : stat.trend === "down" ? (
                  <TrendingDown className="h-3 w-3" />
                ) : null}
                {stat.change}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
