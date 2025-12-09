"use client"

import { useState } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminTopbar } from "@/components/admin-topbar"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { Search, Edit, Trash2, MoreHorizontal, Eye, Archive, XCircle, Loader2, Plus, Package } from "lucide-react"
import { useServices } from "@/hooks/use-services"
import { ServiceModal } from "@/components/service-modal"
import { ServiceDetailModal } from "@/components/service-detail-modal"
import { getFileUrl } from "@/lib/api/config"
import type { Service } from "@/lib/api/types/service"

export default function ServicesPage() {
  const { services, loading, error, deleteService, fetchServices, toggleActive } = useServices()

  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [togglingServiceId, setTogglingServiceId] = useState<number | null>(null)

  const activeServices = services.filter((service) => !service.isArchive)

  const filteredServices = activeServices.filter(
    (service) =>
      service.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      service.code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  console.log(
    "[v0] Services filtrés avec images:",
    filteredServices.map((s) => ({
      id: s.id,
      nom: s.nom,
      image: s.images && s.images.length > 0 ? s.images[0] : undefined,
      imageUrl: s.images && s.images.length > 0 ? getFileUrl(s.images[0]) : "pas d'image",
    })),
  )

  const formatTypeTarification = (type: string) => {
    switch (type) {
      case "unitaire":
        return "Par pièce"
      case "poids":
        return "Au kilo"
      case "forfait":
        return "Forfait"
      default:
        return type
    }
  }

  const handleDeleteService = (id: number) => {
    deleteService(id)
  }

  const handleArchiveService = (id: number) => {
    deleteService(id)
  }

  const handleToggleActive = async (id: number) => {
    setTogglingServiceId(id)
    try {
      await toggleActive(id)
    } finally {
      setTogglingServiceId(null)
    }
  }

  const handleCreateService = () => {
    setSelectedService(null)
    setIsCreateModalOpen(true)
  }

  const handleEditService = (service: Service) => {
    setSelectedService(service)
    setIsEditModalOpen(true)
  }

  const handleViewService = (service: Service) => {
    setSelectedService(service)
    setIsDetailModalOpen(true)
  }

  const handleServiceSaved = () => {
    fetchServices()
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
  }

  if (error) {
    return (
      <>
        <AdminSidebar />
        <SidebarInset>
          <AdminTopbar />
          <main className="flex-1 space-y-6 p-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Erreur de chargement</h2>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={() => fetchServices()}>Réessayer</Button>
              </div>
            </div>
          </main>
        </SidebarInset>
      </>
    )
  }

  return (
    <>
      <AdminSidebar />
      <SidebarInset>
        <AdminTopbar />
        <main className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Gestion des services</h1>
              <p className="text-muted-foreground">Gérez les services proposés par votre pressing</p>
            </div>
            <div className="flex gap-3">
              <Link href="/services/archived">
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Archive className="h-4 w-4" />
                  Services archivés
                </Button>
              </Link>
              <Link href="/services/options">
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  Options de service
                </Button>
              </Link>
              <Button className="flex items-center gap-2" onClick={handleCreateService}>
                <Plus className="h-4 w-4" />
                Nouveau service
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-6 px-4 py-3 bg-card border rounded-lg">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Total:</span>
                <Badge variant="secondary" className="font-semibold">
                  {activeServices.length}
                </Badge>
              </div>
            </div>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Actifs:</span>
              <Badge variant="default" className="font-semibold">
                {activeServices.filter((s) => s.estActif).length}
              </Badge>
            </div>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Inactifs:</span>
              <Badge variant="destructive" className="font-semibold">
                {activeServices.filter((s) => !s.estActif).length}
              </Badge>
            </div>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Archivés:</span>
              <Badge variant="outline" className="font-semibold">
                {services.filter((s) => s.isArchive).length}
              </Badge>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tous les services</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un service..."
                    className="pl-10 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Chargement des services...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Image</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Tarification</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredServices.map((service) => {
                      const imageUrl =
                        service.images && service.images.length > 0 ? getFileUrl(service.images[0]) : undefined

                      return (
                        <TableRow key={service.id} className={!service.estActif ? "bg-red-50" : ""}>
                          <TableCell>
                            <Avatar className="h-10 w-10 rounded-md">
                              <AvatarImage
                                src={imageUrl || "/placeholder.svg"}
                                alt={service.nom}
                                className="object-cover"
                                onError={(e) => {
                                  console.log("[v0] Erreur chargement image:", imageUrl)
                                  e.currentTarget.style.display = "none"
                                }}
                                onLoad={() => console.log("[v0] Image chargée avec succès:", imageUrl)}
                              />
                              <AvatarFallback className="rounded-md">
                                <Package className="h-5 w-5 text-muted-foreground" />
                              </AvatarFallback>
                            </Avatar>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{service.code}</TableCell>
                          <TableCell className="font-medium">{service.nom}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{formatTypeTarification(service.typeTarification)}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={service.estActif ? "default" : "destructive"}>
                              {service.estActif ? "Actif" : "Inactif"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  disabled={togglingServiceId === service.id}
                                >
                                  {togglingServiceId === service.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <MoreHorizontal className="h-4 w-4" />
                                  )}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewService(service)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Détails
                                </DropdownMenuItem>
                                {/* <DropdownMenuItem onClick={() => handleEditService(service)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Modifier
                                </DropdownMenuItem> */}
                                <DropdownMenuItem
                                  onClick={() => handleToggleActive(service.id)}
                                  disabled={togglingServiceId === service.id}
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  {service.estActif ? "Désactiver" : "Activer"}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleArchiveService(service.id)}>
                                  <Archive className="mr-2 h-4 w-4" />
                                  Archiver
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteService(service.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {filteredServices.length === 0 && !loading && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          {searchTerm ? "Aucun service trouvé pour cette recherche" : "Aucun service configuré"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </SidebarInset>

      <ServiceModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} onSave={handleServiceSaved} />

      <ServiceModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        service={selectedService}
        onSave={handleServiceSaved}
      />

      <ServiceDetailModal open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen} service={selectedService} />
    </>
  )
}
