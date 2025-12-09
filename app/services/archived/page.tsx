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
import { Search, Archive, ArrowLeft, Loader2, MoreHorizontal, Eye, RotateCcw } from "lucide-react"
import Link from "next/link"
import useSWR from "swr"
import { serviceService } from "@/lib/api/services/service.service"
import type { Service } from "@/lib/api/types/service"
import { ServiceDetailModal } from "@/components/service-detail-modal"
import { toast } from "@/hooks/use-toast"

export default function ArchivedServicesPage() {
  const {
    data: archivedServices,
    error,
    isLoading: loading,
    mutate,
  } = useSWR<Service[]>("archived-services", () => serviceService.getArchived())

  const [searchTerm, setSearchTerm] = useState("")
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  const filteredArchivedServices =
    archivedServices?.filter(
      (service) =>
        service.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        service.code.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || []

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

  const handleViewService = (service: Service) => {
    setSelectedService(service)
    setIsDetailModalOpen(true)
  }

  const handleRestoreService = async (id: number) => {
    try {
      await serviceService.restore(id)
      toast({
        title: "Succès",
        description: "Service restauré avec succès",
      })
      mutate() // Refresh the list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la restauration du service"
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <AdminSidebar />
      <SidebarInset>
        <AdminTopbar />
        <main className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link href="/services">
                  <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                    <ArrowLeft className="h-4 w-4" />
                    Retour aux services
                  </Button>
                </Link>
              </div>
              <h1 className="text-3xl font-bold text-balance">Services archivés</h1>
              <p className="text-muted-foreground">Consultez vos services archivés</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Archive className="h-5 w-5" />
                  Services archivés ({filteredArchivedServices.length})
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un service archivé..."
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
                  <span>Chargement des services archivés...</span>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-500">Erreur lors du chargement des services archivés</p>
                </div>
              ) : filteredArchivedServices.length === 0 ? (
                <div className="text-center py-8">
                  <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">Aucun service archivé</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm
                      ? "Aucun service archivé ne correspond à votre recherche."
                      : "Vous n'avez pas encore archivé de services."}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Tarification</TableHead>
                      <TableHead>Statut avant archivage</TableHead>
                      <TableHead>Date d'archivage</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredArchivedServices.map((service) => (
                      <TableRow key={service.id} className="opacity-60">
                        <TableCell className="font-mono text-sm">{service.code}</TableCell>
                        <TableCell className="font-medium">{service.nom}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{formatTypeTarification(service.typeTarification)}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={service.estActif ? "default" : "secondary"}>
                            {service.estActif ? "Actif" : "Inactif"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {service.dateArchive
                            ? new Date(service.dateArchive).toLocaleDateString("fr-FR")
                            : "Non disponible"}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewService(service)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Détails
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRestoreService(service.id)}>
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Restaurer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </SidebarInset>

      <ServiceDetailModal open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen} service={selectedService} />
    </>
  )
}
