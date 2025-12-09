import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminTopbar } from "@/components/admin-topbar"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Clock, Package, Truck } from "lucide-react"

const activeDeliveries = [
  {
    id: 1,
    driver: "Ahmed Benali",
    avatar: "/ahmed-benali.jpg",
    zone: "Centre-ville",
    orders: 8,
    completed: 5,
    status: "En cours",
    location: "Rue de la Paix, 15",
    nextDelivery: "14:30",
  },
  {
    id: 2,
    driver: "Sarah Dubois",
    avatar: "/sarah-dubois.jpg",
    zone: "Quartier Nord",
    orders: 6,
    completed: 3,
    status: "En cours",
    location: "Avenue des Champs, 42",
    nextDelivery: "15:00",
  },
  {
    id: 3,
    driver: "Mohamed Kone",
    avatar: "/mohamed-kone.jpg",
    zone: "Banlieue Sud",
    orders: 4,
    completed: 4,
    status: "Terminé",
    location: "Retour au dépôt",
    nextDelivery: "-",
  },
]

const deliveryStats = [
  {
    title: "Tournées actives",
    value: "3",
    icon: Truck,
    color: "text-blue-600",
  },
  {
    title: "Livraisons aujourd'hui",
    value: "24",
    icon: Package,
    color: "text-green-600",
  },
  {
    title: "Temps moyen",
    value: "18 min",
    icon: Clock,
    color: "text-orange-600",
  },
  {
    title: "Taux de réussite",
    value: "98.5%",
    icon: MapPin,
    color: "text-purple-600",
  },
]

export default function DeliveriesPage() {
  return (
    <>
      <AdminSidebar />
      <SidebarInset>
        <AdminTopbar />
        <main className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Suivi des livraisons</h1>
              <p className="text-muted-foreground">Suivez en temps réel les tournées de vos livreurs</p>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Nouvelle tournée</Button>
          </div>

          {/* Stats */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {deliveryStats.map((stat) => (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Active Deliveries */}
          <Card>
            <CardHeader>
              <CardTitle>Tournées en cours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeDeliveries.map((delivery) => (
                  <div
                    key={delivery.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={delivery.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {delivery.driver
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{delivery.driver}</h3>
                        <p className="text-sm text-muted-foreground">{delivery.zone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Commandes</p>
                        <p className="font-semibold">
                          {delivery.completed}/{delivery.orders}
                        </p>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Position</p>
                        <p className="font-medium text-sm max-w-32 truncate">{delivery.location}</p>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Prochaine</p>
                        <p className="font-semibold">{delivery.nextDelivery}</p>
                      </div>

                      <Badge
                        className={
                          delivery.status === "En cours"
                            ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                            : "bg-green-100 text-green-800 hover:bg-green-200"
                        }
                      >
                        {delivery.status}
                      </Badge>

                      <Button variant="outline" size="sm">
                        Suivre
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Map Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Carte en temps réel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Carte interactive des livraisons en temps réel</p>
                  <p className="text-sm text-muted-foreground mt-2">Intégration avec Google Maps ou OpenStreetMap</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </>
  )
}
