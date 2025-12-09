"use client"

import { useState } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminTopbar } from "@/components/admin-topbar"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  XCircle,
  Clock,
  Calendar,
  MapPin,
  MoreHorizontal,
  Power,
  Archive,
} from "lucide-react"
import { useDelaiLivraisons } from "@/hooks/use-delai-livraisons"
import { useCreneauCollectes } from "@/hooks/use-creneau-collectes"
import { useTarifKilometriques } from "@/hooks/use-tarif-kilometriques"
import type { CreateCreneauCollecteData, UpdateCreneauCollecteData } from "@/lib/api/types/creneau-collecte"
import type { CreateTarifKilometriqueData, UpdateTarifKilometriqueData } from "@/lib/api/types/tarif-kilometrique"
import Link from "next/link"

/**
 * Page de configuration logistique
 * Gère les délais de livraison, créneaux de collecte et tarifs kilométriques
 */
export default function LogisticsPage() {
  // Hooks pour les délais de livraison
  const {
    delaiLivraisons,
    loading: delaisLoading,
    error: delaisError,
    createDelaiLivraison,
    updateDelaiLivraison,
    deleteDelaiLivraison,
    toggleActive: toggleActiveDelai,
    fetchDelaiLivraisons,
  } = useDelaiLivraisons()

  // Hooks pour les créneaux de collecte
  const {
    creneauCollectes,
    loading: creneauxLoading,
    error: creneauxError,
    createCreneauCollecte,
    updateCreneauCollecte,
    deleteCreneauCollecte,
    toggleActive: toggleActiveCreneau,
    fetchCreneauCollectes,
  } = useCreneauCollectes()

  // Hooks pour les tarifs kilométriques
  const {
    tarifKilometriques,
    loading: tarifsLoading,
    error: tarifsError,
    createTarifKilometrique,
    updateTarifKilometrique,
    deleteTarifKilometrique,
    toggleActive: toggleActiveTarif,
    fetchTarifKilometriques,
  } = useTarifKilometriques()

  // États locaux
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [currentTab, setCurrentTab] = useState("delais-livraison")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Jours de la semaine pour les créneaux
  const joursSemaine = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]

  const [tarifType, setTarifType] = useState<"prix" | "remise" | "aucun">("prix")

  /**
   * Ouvre le dialogue pour ajouter un nouvel élément
   */
  const handleAdd = (type: string) => {
    setEditingItem(null)
    setFormData({})
    setValidationErrors({})
    setTarifType("aucun")
    setCurrentTab(type)
    setIsDialogOpen(true)
  }

  /**
   * Ouvre le dialogue pour modifier un élément existant
   */
  const handleEdit = (item: any, type: string) => {
    setEditingItem(item)
    setFormData(item)
    setValidationErrors({})
    if (type === "delais-livraison") {
      if (item.prix !== null && item.prix !== undefined) {
        setTarifType("prix")
      } else if (item.remise !== null && item.remise !== undefined) {
        setTarifType("remise")
      } else {
        setTarifType("aucun")
      }
    }
    setCurrentTab(type)
    setIsDialogOpen(true)
  }

  /**
   * Supprime un élément (archive)
   */
  const handleDelete = async (id: string | number, type: string) => {
    if (!confirm("Êtes-vous sûr de vouloir archiver cet élément ?")) {
      return
    }

    try {
      if (type === "delais-livraison") {
        await deleteDelaiLivraison(Number(id))
      } else if (type === "creneaux-collecte") {
        await deleteCreneauCollecte(Number(id))
      } else if (type === "tarifs-kilometriques") {
        await deleteTarifKilometrique(Number(id))
      }
    } catch (error) {
      console.error("[v0] Erreur lors de la suppression:", error)
    }
  }

  /**
   * Active ou désactive un élément
   */
  const handleToggleActive = async (id: number, type: string) => {
    try {
      if (type === "delais-livraison") {
        await toggleActiveDelai(id)
      } else if (type === "creneaux-collecte") {
        await toggleActiveCreneau(id)
      } else if (type === "tarifs-kilometriques") {
        await toggleActiveTarif(id)
      }
    } catch (error) {
      console.error("[v0] Erreur lors du changement de statut:", error)
    }
  }

  /**
   * Sauvegarde un élément (création ou mise à jour)
   */
  const handleSave = async () => {
    const errors: Record<string, string> = {}

    if (currentTab === "delais-livraison") {
      if (!formData.nom?.trim()) {
        errors.nom = "Le nom du délai est requis"
      }
      if (!formData.delaiHeures?.trim()) {
        errors.delaiHeures = "Le délai en heures est requis"
      }
      if (tarifType === "prix") {
        if (!formData.prix || formData.prix <= 0) {
          errors.prix = "Le prix est requis et doit être positif"
        }
      } else if (tarifType === "remise") {
        if (formData.remise === null || formData.remise === undefined || formData.remise < 0 || formData.remise > 100) {
          errors.remise = "La remise doit être entre 0 et 100"
        }
      }
      // If tarifType === "aucun", no validation needed for prix/remise
    } else if (currentTab === "creneaux-collecte") {
      if (!formData.jourSemaine) {
        errors.jourSemaine = "Le jour de la semaine est requis"
      }
      if (!formData.heureDebut) {
        errors.heureDebut = "L'heure de début est requise"
      }
      if (!formData.heureFin) {
        errors.heureFin = "L'heure de fin est requise"
      }
    } else if (currentTab === "tarifs-kilometriques") {
      if (!formData.prixParKm || formData.prixParKm < 0) {
        errors.prixParKm = "Le prix par kilomètre est requis et doit être positif"
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    setIsSubmitting(true)
    setValidationErrors({})

    try {
      // Validation des champs requis selon le type
      if (currentTab === "delais-livraison") {
        const delaiData: any = {
          nom: formData.nom,
          delaiHeures: formData.delaiHeures,
          description: formData.description || null,
        }

        if (tarifType === "prix") {
          delaiData.prix = Number(formData.prix)
          delaiData.remise = null
        } else if (tarifType === "remise") {
          delaiData.remise = Number(formData.remise)
          delaiData.prix = null
        } else {
          delaiData.prix = null
          delaiData.remise = null
        }

        if (editingItem) {
          await updateDelaiLivraison(editingItem.id, delaiData)
        } else {
          await createDelaiLivraison(delaiData)
        }
      } else if (currentTab === "creneaux-collecte") {
        const creneauData: CreateCreneauCollecteData | UpdateCreneauCollecteData = {
          jourSemaine: formData.jourSemaine,
          heureDebut: formData.heureDebut,
          heureFin: formData.heureFin,
        }

        if (editingItem) {
          await updateCreneauCollecte(editingItem.id, creneauData)
        } else {
          await createCreneauCollecte(creneauData)
        }
      } else if (currentTab === "tarifs-kilometriques") {
        const tarifData: CreateTarifKilometriqueData | UpdateTarifKilometriqueData = {
          prixParKm: Number(formData.prixParKm),
          distanceMin: formData.distanceMin ? Number(formData.distanceMin) : null,
          distanceMax: formData.distanceMax ? Number(formData.distanceMax) : null,
        }

        if (editingItem) {
          await updateTarifKilometrique(editingItem.id, tarifData)
        } else {
          await createTarifKilometrique(tarifData)
        }
      }

      setIsDialogOpen(false)
      setFormData({})
      setEditingItem(null)
      setValidationErrors({})
      setTarifType("prix")
    } catch (error: any) {
      console.error("[v0] Erreur lors de la sauvegarde:", error)
      if (error.errors) {
        setValidationErrors(error.errors)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Rendu du formulaire selon le type d'élément
   */
  const renderForm = () => {
    switch (currentTab) {
      case "delais-livraison":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="nom">
                Nom du délai <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nom"
                value={formData.nom || ""}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Ex: Express, Standard, Économique"
                className={validationErrors.nom ? "border-red-500" : ""}
                required
              />
              {validationErrors.nom && <p className="text-sm text-red-500 mt-1">{validationErrors.nom}</p>}
            </div>
            <div>
              <Label htmlFor="delaiHeures">
                Délai en heures <span className="text-red-500">*</span>
              </Label>
              <Input
                id="delaiHeures"
                value={formData.delaiHeures || ""}
                onChange={(e) => setFormData({ ...formData, delaiHeures: e.target.value })}
                placeholder="Ex: 24, 48, 72"
                className={validationErrors.delaiHeures ? "border-red-500" : ""}
                required
              />
              {validationErrors.delaiHeures && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.delaiHeures}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Type de tarification</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={tarifType === "prix" ? "default" : "outline"}
                  onClick={() => setTarifType("prix")}
                  className="flex-1"
                >
                  Prix
                </Button>
                <Button
                  type="button"
                  variant={tarifType === "remise" ? "default" : "outline"}
                  onClick={() => setTarifType("remise")}
                  className="flex-1"
                >
                  Remise
                </Button>
                <Button
                  type="button"
                  variant={tarifType === "aucun" ? "default" : "outline"}
                  onClick={() => setTarifType("aucun")}
                  className="flex-1"
                >
                  Gratuit
                </Button>
              </div>
            </div>

            {tarifType === "prix" ? (
              <div>
                <Label htmlFor="prix">
                  Prix (FCFA) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="prix"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.prix || ""}
                  onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                  placeholder="Ex: 5000"
                  className={validationErrors.prix ? "border-red-500" : ""}
                  required
                />
                {validationErrors.prix && <p className="text-sm text-red-500 mt-1">{validationErrors.prix}</p>}
              </div>
            ) : tarifType === "remise" ? (
              <div>
                <Label htmlFor="remise">
                  Remise (%) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="remise"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.remise || ""}
                  onChange={(e) => setFormData({ ...formData, remise: e.target.value })}
                  placeholder="Ex: 10"
                  className={validationErrors.remise ? "border-red-500" : ""}
                  required
                />
                {validationErrors.remise && <p className="text-sm text-red-500 mt-1">{validationErrors.remise}</p>}
              </div>
            ) : null}
            {/* End of for prix/remise/aucun display */}

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du délai de livraison (optionnel)"
              />
            </div>
          </div>
        )

      case "creneaux-collecte":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="jourSemaine">
                Jour de la semaine <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.jourSemaine || ""}
                onValueChange={(value) => setFormData({ ...formData, jourSemaine: value })}
              >
                <SelectTrigger className={validationErrors.jourSemaine ? "border-red-500" : ""}>
                  <SelectValue placeholder="Sélectionnez un jour" />
                </SelectTrigger>
                <SelectContent>
                  {joursSemaine.map((jour) => (
                    <SelectItem key={jour} value={jour}>
                      {jour}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.jourSemaine && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.jourSemaine}</p>
              )}
            </div>
            <div>
              <Label htmlFor="heureDebut">
                Heure de début <span className="text-red-500">*</span>
              </Label>
              <Input
                id="heureDebut"
                type="time"
                value={formData.heureDebut || ""}
                onChange={(e) => setFormData({ ...formData, heureDebut: e.target.value })}
                className={validationErrors.heureDebut ? "border-red-500" : ""}
                required
              />
              {validationErrors.heureDebut && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.heureDebut}</p>
              )}
            </div>
            <div>
              <Label htmlFor="heureFin">
                Heure de fin <span className="text-red-500">*</span>
              </Label>
              <Input
                id="heureFin"
                type="time"
                value={formData.heureFin || ""}
                onChange={(e) => setFormData({ ...formData, heureFin: e.target.value })}
                className={validationErrors.heureFin ? "border-red-500" : ""}
                required
              />
              {validationErrors.heureFin && <p className="text-sm text-red-500 mt-1">{validationErrors.heureFin}</p>}
            </div>
          </div>
        )

      case "tarifs-kilometriques":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="prixParKm">
                Prix par kilomètre (FCFA) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="prixParKm"
                type="number"
                step="0.01"
                min="0"
                value={formData.prixParKm || ""}
                onChange={(e) => setFormData({ ...formData, prixParKm: e.target.value })}
                placeholder="Ex: 500"
                className={validationErrors.prixParKm ? "border-red-500" : ""}
                required
              />
              {validationErrors.prixParKm && <p className="text-sm text-red-500 mt-1">{validationErrors.prixParKm}</p>}
            </div>
            <div>
              <Label htmlFor="distanceMin">Distance minimale (km)</Label>
              <Input
                id="distanceMin"
                type="number"
                step="0.1"
                min="0"
                value={formData.distanceMin || ""}
                onChange={(e) => setFormData({ ...formData, distanceMin: e.target.value })}
                placeholder="Ex: 0"
              />
            </div>
            <div>
              <Label htmlFor="distanceMax">Distance maximale (km)</Label>
              <Input
                id="distanceMax"
                type="number"
                step="0.1"
                min="0"
                value={formData.distanceMax || ""}
                onChange={(e) => setFormData({ ...formData, distanceMax: e.target.value })}
                placeholder="Ex: 5"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Laissez les distances vides pour un tarif sans limite de distance
            </p>
          </div>
        )

      default:
        return null
    }
  }

  /**
   * Affichage des erreurs de chargement
   */
  if (delaisError || creneauxError || tarifsError) {
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
                <p className="text-muted-foreground mb-4">{delaisError || creneauxError || tarifsError}</p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => fetchDelaiLivraisons()}>Réessayer délais</Button>
                  <Button onClick={() => fetchCreneauCollectes()}>Réessayer créneaux</Button>
                  <Button onClick={() => fetchTarifKilometriques()}>Réessayer tarifs</Button>
                </div>
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
              <h1 className="text-3xl font-bold text-balance">Configuration Logistique</h1>
              <p className="text-muted-foreground">
                Gérez les délais de livraison, créneaux de collecte et tarifs kilométriques
              </p>
            </div>
            <Link href="/parametres-livraison/archived">
              <Button variant="outline">
                <Archive className="h-4 w-4 mr-2" />
                Voir les archives
              </Button>
            </Link>
          </div>

          <Tabs defaultValue="delais-livraison" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="delais-livraison">
                <Clock className="h-4 w-4 mr-2" />
                Délais de Livraison
              </TabsTrigger>
              <TabsTrigger value="creneaux-collecte">
                <Calendar className="h-4 w-4 mr-2" />
                Créneaux de Collecte
              </TabsTrigger>
              <TabsTrigger value="tarifs-kilometriques">
                <MapPin className="h-4 w-4 mr-2" />
                Tarifs Kilométriques
              </TabsTrigger>
            </TabsList>

            {/* Onglet Délais de Livraison */}
            <TabsContent value="delais-livraison">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Délais de Livraison</CardTitle>
                    <CardDescription>
                      Configurez les différents délais de livraison disponibles pour vos clients
                    </CardDescription>
                  </div>
                  <Button onClick={() => handleAdd("delais-livraison")} disabled={delaisLoading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                </CardHeader>
                <CardContent>
                  {delaisLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Chargement des délais de livraison...</span>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom</TableHead>
                          <TableHead>Délai (heures)</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Prix/Remise</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.isArray(delaiLivraisons) &&
                          delaiLivraisons.map((delai) => {
                            console.log("[v0] Delai:", { id: delai.id, nom: delai.nom, tarifs: delai.tarifs })

                            return (
                              <TableRow key={delai.id}>
                                <TableCell className="font-medium">{delai.nom}</TableCell>
                                <TableCell>{delai.delaiHeures}h</TableCell>
                                <TableCell className="max-w-md truncate">{delai.description || "-"}</TableCell>
                                <TableCell>
                                  {delai.remise !== null && delai.remise !== undefined ? (
                                    <span className="text-green-600 font-medium">Remise: {delai.remise}%</span>
                                  ) : delai.prix !== null && delai.prix !== undefined ? (
                                    <span className="font-medium">{delai.prix} FCFA</span>
                                  ) : (
                                    <span className="text-muted-foreground">Non défini</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={delai.estActif ? "default" : "secondary"}
                                    className={!delai.estActif ? "bg-red-500 text-white" : ""}
                                  >
                                    {delai.estActif ? "Actif" : "Inactif"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleEdit(delai, "delais-livraison")}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Modifier
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleToggleActive(delai.id, "delais-livraison")}
                                      >
                                        <Power className="h-4 w-4 mr-2" />
                                        {delai.estActif ? "Désactiver" : "Activer"}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleDelete(delai.id, "delais-livraison")}
                                        className="text-red-600"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Archiver
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        {(!Array.isArray(delaiLivraisons) || delaiLivraisons.length === 0) && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              Aucun délai de livraison configuré
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Créneaux de Collecte */}
            <TabsContent value="creneaux-collecte">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Créneaux de Collecte</CardTitle>
                    <CardDescription>
                      Définissez les créneaux horaires disponibles pour la collecte du linge
                    </CardDescription>
                  </div>
                  <Button onClick={() => handleAdd("creneaux-collecte")} disabled={creneauxLoading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                </CardHeader>
                <CardContent>
                  {creneauxLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Chargement des créneaux de collecte...</span>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Jour</TableHead>
                          <TableHead>Heure de début</TableHead>
                          <TableHead>Heure de fin</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.isArray(creneauCollectes) &&
                          creneauCollectes.map((creneau) => (
                            <TableRow key={creneau.id}>
                              <TableCell className="font-medium">{creneau.jourSemaine}</TableCell>
                              <TableCell>{creneau.heureDebut}</TableCell>
                              <TableCell>{creneau.heureFin}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={creneau.estActif ? "default" : "secondary"}
                                  className={!creneau.estActif ? "bg-red-500 text-white" : ""}
                                >
                                  {creneau.estActif ? "Actif" : "Inactif"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEdit(creneau, "creneaux-collecte")}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Modifier
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleToggleActive(creneau.id, "creneaux-collecte")}
                                    >
                                      <Power className="h-4 w-4 mr-2" />
                                      {creneau.estActif ? "Désactiver" : "Activer"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleDelete(creneau.id, "creneaux-collecte")}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Archiver
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        {(!Array.isArray(creneauCollectes) || creneauCollectes.length === 0) && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              Aucun créneau de collecte configuré
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Tarifs Kilométriques */}
            <TabsContent value="tarifs-kilometriques">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Tarifs Kilométriques</CardTitle>
                    <CardDescription>Configurez les tarifs de livraison en fonction de la distance</CardDescription>
                  </div>
                  <Button onClick={() => handleAdd("tarifs-kilometriques")} disabled={tarifsLoading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                </CardHeader>
                <CardContent>
                  {tarifsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Chargement des tarifs kilométriques...</span>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Prix par km (FCFA)</TableHead>
                          <TableHead>Distance min (km)</TableHead>
                          <TableHead>Distance max (km)</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.isArray(tarifKilometriques) &&
                          tarifKilometriques.map((tarif) => (
                            <TableRow key={tarif.id}>
                              <TableCell className="font-medium">{tarif.prixParKm} FCFA</TableCell>
                              <TableCell>{tarif.distanceMin !== null ? `${tarif.distanceMin} km` : "-"}</TableCell>
                              <TableCell>{tarif.distanceMax !== null ? `${tarif.distanceMax} km` : "-"}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={tarif.estActif ? "default" : "secondary"}
                                  className={!tarif.estActif ? "bg-red-500 text-white" : ""}
                                >
                                  {tarif.estActif ? "Actif" : "Inactif"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEdit(tarif, "tarifs-kilometriques")}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Modifier
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleToggleActive(tarif.id, "tarifs-kilometriques")}
                                    >
                                      <Power className="h-4 w-4 mr-2" />
                                      {tarif.estActif ? "Désactiver" : "Activer"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleDelete(tarif.id, "tarifs-kilometriques")}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Archiver
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        {(!Array.isArray(tarifKilometriques) || tarifKilometriques.length === 0) && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              Aucun tarif kilométrique configuré
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Dialog pour ajouter/modifier */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingItem ? "Modifier" : "Ajouter"} un élément</DialogTitle>
                <DialogDescription>
                  {editingItem ? "Modifiez" : "Ajoutez"} les informations de l'élément.
                </DialogDescription>
              </DialogHeader>
              {renderForm()}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                  Annuler
                </Button>
                <Button onClick={handleSave} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {editingItem ? "Modifier" : "Ajouter"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </SidebarInset>
    </>
  )
}
