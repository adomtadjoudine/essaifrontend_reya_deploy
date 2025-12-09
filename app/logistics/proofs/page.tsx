"use client"

import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminTopbar } from "@/components/admin-topbar"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Eye, MoreHorizontal, ImageIcon, FileText, Video, Download, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { usePreuves } from "@/hooks/use-preuves"
import type { Preuve } from "@/lib/api/types/preuve"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { getFileUrl } from "@/lib/api/config"

const getTypeIcon = (type: string) => {
  switch (type) {
    case "photo":
      return <ImageIcon className="h-4 w-4" />
    case "signature":
      return <FileText className="h-4 w-4" />
    case "document":
      return <FileText className="h-4 w-4" />
    case "video":
      return <Video className="h-4 w-4" />
    case "audio":
      return <FileText className="h-4 w-4" />
    case "qr_code":
      return <FileText className="h-4 w-4" />
    case "gps":
      return <FileText className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    photo: "Photo",
    signature: "Signature",
    document: "Document",
    video: "Vidéo",
    audio: "Audio",
    qr_code: "QR Code",
    gps: "GPS",
  }
  return labels[type] || type
}

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: fr })
  } catch {
    return dateString
  }
}

const getStatusBadgeVariant = (statut: string) => {
  switch (statut) {
    case "realisee":
    case "terminee":
      return "default" // Green/success
    case "en_cours":
      return "secondary" // Blue
    case "planifiee":
      return "outline" // Gray
    default:
      return "outline"
  }
}

const getStatusLabel = (statut: string) => {
  const labels: Record<string, string> = {
    realisee: "Validée",
    terminee: "Validée",
    en_cours: "En cours",
    planifiee: "En attente",
    annulee: "Rejetée",
  }
  return labels[statut] || statut
}

export default function ProofsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedPreuve, setSelectedPreuve] = useState<Preuve | null>(null)

  const { preuves, loading, error, fetchPreuves, getStatistics } = usePreuves()
  const [stats, setStats] = useState({
    nombreTotal: 0,
    preuvesParType: {} as Record<string, number>,
    preuvesImages: 0,
    preuvesAvecFichiers: 0,
    nombreTotalFichiers: 0,
    fichiersParType: {} as Record<string, number>,
  })

  useEffect(() => {
    const loadStatistics = async () => {
      const statistics = await getStatistics()
      if (statistics) {
        setStats(statistics)
      }
    }
    loadStatistics()
  }, [getStatistics])

  useEffect(() => {
    if (preuves.length > 0) {
      const firstPreuve = preuves[0]
      const firstFile = firstPreuve.fichiers?.[0]
      if (firstFile) {
        console.log("[v0] Original file URL:", firstFile.url)
        console.log("[v0] Generated full URL:", getFileUrl(firstFile.url))
        console.log("[v0] API Base URL:", process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333")
      }
    }
  }, [preuves])

  const filteredPreuves = preuves.filter((preuve) => {
    const matchesSearch =
      preuve.id.toString().includes(searchTerm) ||
      preuve.operationLogistiqueId.toString().includes(searchTerm) ||
      preuve.typePreuve.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === "all" || preuve.typePreuve === typeFilter

    return matchesSearch && matchesType
  })

  const handleViewDetails = (preuve: Preuve) => {
    setSelectedPreuve(preuve)
    setIsDetailsModalOpen(true)
  }

  if (loading) {
    return (
      <>
        <AdminSidebar />
        <SidebarInset>
          <AdminTopbar />
          <main className="flex-1 space-y-6 p-6">
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Chargement des preuves...</p>
            </div>
          </main>
        </SidebarInset>
      </>
    )
  }

  if (error) {
    return (
      <>
        <AdminSidebar />
        <SidebarInset>
          <AdminTopbar />
          <main className="flex-1 space-y-6 p-6">
            <div className="flex items-center justify-center h-64">
              <p className="text-red-500">Erreur: {error}</p>
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
              <h1 className="text-3xl font-bold text-balance">Gestion des preuves</h1>
              <p className="text-muted-foreground">Visualisez et gérez toutes les preuves collectées</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total preuves</p>
                  <p className="text-2xl font-bold">{stats.nombreTotal}</p>
                </div>
                <ImageIcon className="h-8 w-8 text-blue-600" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Photos</p>
                  <p className="text-2xl font-bold">{stats.preuvesImages}</p>
                </div>
                <ImageIcon className="h-8 w-8 text-purple-600" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Documents</p>
                  <p className="text-2xl font-bold">{stats.preuvesParType?.document || 0}</p>
                </div>
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total fichiers</p>
                  <p className="text-2xl font-bold">{stats.nombreTotalFichiers}</p>
                </div>
                <FileText className="h-8 w-8 text-orange-600" />
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Liste des preuves</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher..."
                      className="pl-10 w-48"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous types</SelectItem>
                      <SelectItem value="photo">Photo</SelectItem>
                      <SelectItem value="signature">Signature</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="video">Vidéo</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="qr_code">QR Code</SelectItem>
                      <SelectItem value="gps">GPS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredPreuves.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">Aucune preuve trouvée</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Aperçu</TableHead>
                      <TableHead>Opération</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Livreur</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPreuves.map((preuve) => {
                      const operation = preuve.operationLogistique
                      const livreur = operation?.tournee?.livreur
                      const fichiers = preuve.fichiers?.flat() || []
                      const firstFile = fichiers[0]
                      const isImage = firstFile?.type?.startsWith("image")

                      const imageUrl = firstFile ? getFileUrl(firstFile.url) : ""
                      if (isImage && firstFile) {
                        console.log("[v0] Rendering image:", {
                          originalUrl: firstFile.url,
                          fullUrl: imageUrl,
                          fileName: firstFile.nom,
                        })
                      }

                      return (
                        <TableRow key={preuve.id}>
                          {/* Type column */}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTypeIcon(preuve.typePreuve)}
                              <span className="font-medium">{getTypeLabel(preuve.typePreuve)}</span>
                            </div>
                          </TableCell>

                          {/* Preview column */}
                          <TableCell>
                            {isImage && firstFile ? (
                              <img
                                src={imageUrl || "/placeholder.svg"}
                                alt={firstFile.nom}
                                className="h-20 w-20 rounded object-cover border"
                                onError={(e) => {
                                  console.log("[v0] Image failed to load:", imageUrl)
                                  e.currentTarget.src = "/placeholder.svg"
                                }}
                              />
                            ) : (
                              <div className="h-20 w-20 rounded bg-muted flex items-center justify-center border">
                                {getTypeIcon(preuve.typePreuve)}
                              </div>
                            )}
                          </TableCell>

                          {/* Operation column */}
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <span className="font-medium">
                                {operation?.type === "collecte" ? "Collecte" : "Livraison"} #
                                {preuve.operationLogistiqueId}
                              </span>
                              <Badge variant="outline" className="w-fit text-xs">
                                {preuve.fichiers?.length || 0} fichier(s)
                              </Badge>
                            </div>
                          </TableCell>

                          {/* Date column */}
                          <TableCell>
                            <span className="text-sm">{formatDate(preuve.createdAt)}</span>
                          </TableCell>

                          {/* Delivery person column */}
                          <TableCell>
                            {livreur ? (
                              <div className="flex flex-col gap-1">
                                <span className="font-medium text-sm">
                                  {livreur.prenom} {livreur.nom}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">Non assigné</span>
                            )}
                          </TableCell>

                          {/* Status column */}
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(operation?.statut || "planifiee")}>
                              {getStatusLabel(operation?.statut || "planifiee")}
                            </Badge>
                          </TableCell>

                          {/* Actions column */}
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleViewDetails(preuve)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewDetails(preuve)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Voir détails
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Download className="mr-2 h-4 w-4" />
                                    Télécharger
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Supprimer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </SidebarInset>

      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la preuve #{selectedPreuve?.id}</DialogTitle>
            <DialogDescription>Informations complètes sur la preuve et l'opération associée</DialogDescription>
          </DialogHeader>
          {selectedPreuve && (
            <div className="space-y-6">
              {/* Main information grid */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type de preuve</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getTypeIcon(selectedPreuve.typePreuve)}
                    <p className="text-sm font-medium">{getTypeLabel(selectedPreuve.typePreuve)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Opération</p>
                  <p className="text-sm mt-1">
                    {selectedPreuve.operationLogistique?.type === "collecte" ? "Collecte" : "Livraison"} #
                    {selectedPreuve.operationLogistiqueId}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date de création</p>
                  <p className="text-sm mt-1">{formatDate(selectedPreuve.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nombre de fichiers</p>
                  <p className="text-sm mt-1">{selectedPreuve.fichiers?.length || 0} fichier(s)</p>
                </div>
                {selectedPreuve.operationLogistique?.tournee?.livreur && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Livreur</p>
                      <p className="text-sm mt-1">
                        {selectedPreuve.operationLogistique.tournee.livreur.prenom}{" "}
                        {selectedPreuve.operationLogistique.tournee.livreur.nom}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Statut</p>
                      <Badge
                        variant={getStatusBadgeVariant(selectedPreuve.operationLogistique?.statut || "planifiee")}
                        className="mt-1"
                      >
                        {getStatusLabel(selectedPreuve.operationLogistique?.statut || "planifiee")}
                      </Badge>
                    </div>
                  </>
                )}
              </div>

              {/* Files section */}
              {selectedPreuve.fichiers && selectedPreuve.fichiers.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-3">Fichiers attachés</p>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedPreuve.fichiers.flat().map((fichier, index) => (
                      <div key={index} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        {fichier.type.startsWith("image") ? (
                          <img
                            src={getFileUrl(fichier.url) || "/placeholder.svg"}
                            alt={fichier.nom}
                            className="w-full h-64 object-cover cursor-pointer"
                            onClick={() => window.open(getFileUrl(fichier.url), "_blank")}
                          />
                        ) : (
                          <div className="h-64 bg-muted flex flex-col items-center justify-center gap-2">
                            {getTypeIcon(selectedPreuve.typePreuve)}
                            <p className="text-sm text-muted-foreground">{fichier.extension || "Fichier"}</p>
                          </div>
                        )}
                        <div className="p-3 bg-muted/50">
                          <p className="text-xs font-medium truncate">{fichier.nom}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-muted-foreground">
                              {fichier.taille ? `${(fichier.taille / 1024).toFixed(2)} KB` : "Taille inconnue"}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2"
                              onClick={() => window.open(getFileUrl(fichier.url), "_blank")}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>
              Fermer
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Télécharger tout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
