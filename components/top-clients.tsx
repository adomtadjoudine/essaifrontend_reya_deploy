"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect, useState } from "react"
import { statistiquesService } from "@/lib/api/services/statistiques.service"
import type { ClientActif } from "@/lib/api/types/statistiques"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { Crown } from "lucide-react"

export function TopClients() {
  const [clients, setClients] = useState<ClientActif[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true)
        console.log("[v0] Fetching top clients...")
        const response = await statistiquesService.getClientsActifs(5)
        console.log("[v0] Top clients response:", response)

        setClients(response.data)
      } catch (err) {
        console.error("[v0] Error fetching top clients:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [])

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Top Clients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          Top Clients
        </CardTitle>
      </CardHeader>
      <CardContent>
        {clients.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">Aucun client actif</div>
        ) : (
          <div className="space-y-3">
            {clients.map((clientData, index) => (
              <div
                key={clientData.client.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`/generic-placeholder-graphic.png?height=40&width=40`} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {clientData.client.nom
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("") || "CL"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground text-xs flex items-center justify-center font-bold shadow-md">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{clientData.client.nom}</div>
                    <div className="text-xs text-muted-foreground">
                      {clientData.nombreCommandes} commande{clientData.nombreCommandes > 1 ? "s" : ""} •{" "}
                      {formatDistanceToNow(new Date(clientData.dernireCommande), { addSuffix: true, locale: fr })}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sm text-primary">
                    {clientData.chiffreAffaires.toLocaleString("fr-FR")} FCFA
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Moy: {clientData.panierMoyen.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} FCFA
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
