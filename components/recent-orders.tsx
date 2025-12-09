"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye, MoreHorizontal, ShoppingCart } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"
import { commandeService } from "@/lib/api/services/commande.service"
import type { Commande } from "@/lib/api/types/commande"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import {
  getStatusColor,
  getCurrentStatutFromCommande,
  getClientFullName,
  getClientInitials,
} from "@/lib/api/utils/status-colors"

export function RecentOrders() {
  const [orders, setOrders] = useState<Commande[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        console.log("[v0] Fetching recent orders...")
        const response = await commandeService.getAll()
        console.log("[v0] Recent orders response:", response)

        const sortedOrders = response
          .sort((a, b) => new Date(b.dateCommande).getTime() - new Date(a.dateCommande).getTime())
          .slice(0, 5)
        setOrders(sortedOrders)
      } catch (err) {
        console.error("[v0] Error fetching recent orders:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Commandes récentes
          </CardTitle>
          <Button variant="outline" size="sm" disabled>
            Voir tout
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          Commandes récentes
        </CardTitle>
        <Button variant="outline" size="sm" onClick={() => (window.location.href = "/orders")}>
          Voir tout
        </Button>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">Aucune commande récente</div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const currentStatut = getCurrentStatutFromCommande(order)
              const clientFullName = getClientFullName(order.client)
              const clientInitials = getClientInitials(order.client)

              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={`/.jpg?height=40&width=40&query=${encodeURIComponent(clientFullName)}`}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {clientInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{clientFullName}</span>
                        <span className="text-xs text-muted-foreground">#{order.id}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {order.lignesCommande?.length || 0} article(s)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-semibold text-sm">
                        {order.montantTotal.toLocaleString("fr-FR", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}{" "}
                        FCFA
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(order.dateCommande), { addSuffix: true, locale: fr })}
                      </div>
                    </div>
                    <Badge className={getStatusColor(currentStatut.nom)}>{currentStatut.nom}</Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => (window.location.href = `/orders?id=${order.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Voir détails
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
