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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Loader2, XCircle, MoreHorizontal, Power, Archive } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useTemperatures } from "@/hooks/use-temperatures"
import { useOptionTraitements } from "@/hooks/use-option-traitements"
import { useTypeLinges } from "@/hooks/use-type-linges"
import type { CreateTemperatureData, UpdateTemperatureData } from "@/lib/api/types/temperature"
import type { CreateOptionTraitementData, UpdateOptionTraitementData } from "@/lib/api/types/option-traitement"
import type { CreateTypeLingeData, UpdateTypeLingeData } from "@/lib/api/types/type-linge"
import Link from "next/link"

export default function ServiceOptionsPage() {
  const {
    temperatures,
    loading: temperaturesLoading,
    error: temperaturesError,
    createTemperature,
    updateTemperature,
    deleteTemperature,
    fetchTemperatures,
    toggleActive: toggleActiveTemperature,
  } = useTemperatures()

  const {
    optionTraitements,
    loading: optionTraitementsLoading,
    error: optionTraitementsError,
    createOptionTraitement,
    updateOptionTraitement,
    deleteOptionTraitement,
    fetchOptionTraitements,
    toggleActive: toggleActiveOptionTraitement,
  } = useOptionTraitements()

  const {
    typeLinges,
    loading: typeLingesLoading,
    error: typeLingesError,
    createTypeLinge,
    updateTypeLinge,
    deleteTypeLinge,
    fetchTypeLinges,
    toggleActive: toggleActiveTypeLinge,
  } = useTypeLinges()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [currentTab, setCurrentTab] = useState("options-traitement")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({})
  // </CHANGE>

  const [formData, setFormData] = useState<any>({})

  /**
   * Ouvre le dialogue pour ajouter un nouvel élément
   */
  const handleAdd = (type: string) => {
    setEditingItem(null)
    setFormData({})
    setValidationErrors({})
    setFieldErrors({})
    // </CHANGE>
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
    setFieldErrors({})
    // </CHANGE>
    setCurrentTab(type)
    setIsDialogOpen(true)
  }

  /**
   * Supprime un élément (archive)
   */
  const handleDelete = async (id: string | number, type: string) => {
    // if (!confirm("Êtes-vous sûr de vouloir archiver cet élément ?")) {
    //   return
    // }

    try {
      if (type === "temperatures") {
        await deleteTemperature(Number(id))
      } else if (type === "options-traitement") {
        await deleteOptionTraitement(Number(id))
      } else if (type === "types-linge") {
        await deleteTypeLinge(Number(id))
      }

      toast({
        title: "Élément archivé",
        description: "L'élément a été archivé avec succès.",
      })
    } catch (error) {
      console.error("[v0] Erreur lors de l'archivage:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'archivage.",
        variant: "destructive",
      })
    }
  }

  /**
   * Active/désactive un élément
   */
  const handleToggleActive = async (id: number, type: string) => {
    try {
      if (type === "temperatures") {
        await toggleActiveTemperature(id)
      } else if (type === "options-traitement") {
        await toggleActiveOptionTraitement(id)
      } else if (type === "types-linge") {
        await toggleActiveTypeLinge(id)
      }

      toast({
        title: "Statut modifié",
        description: "Le statut de l'élément a été modifié avec succès.",
      })
    } catch (error) {
      console.error("[v0] Erreur lors du changement de statut:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du changement de statut.",
        variant: "destructive",
      })
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, boolean> = {}

    if (currentTab === "temperatures") {
      if (!formData.valeur || formData.valeur.trim() === "") {
        errors.valeur = true
      }
    } else if (currentTab === "options-traitement") {
      if (!formData.nom || formData.nom.trim() === "") {
        errors.nom = true
      }
      if (!formData.description || formData.description.trim() === "") {
        errors.description = true
      }
    } else if (currentTab === "types-linge") {
      if (!formData.nom || formData.nom.trim() === "") {
        errors.nom = true
      }
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }
  // </CHANGE>

  /**
   * Sauvegarde un élément (création ou mise à jour)
   */
  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation échouée",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      })
      return
    }
    // </CHANGE>

    setIsSubmitting(true)
    setValidationErrors({})

    try {
      if (currentTab === "temperatures") {
        const temperatureData: CreateTemperatureData | UpdateTemperatureData = {
          valeur: formData.valeur,
          description: formData.description || null,
        }

        if (editingItem) {
          await updateTemperature(editingItem.id, temperatureData)
        } else {
          await createTemperature(temperatureData)
        }

        setIsDialogOpen(false)
        setFormData({})
        setEditingItem(null)
        setFieldErrors({})
        // </CHANGE>

        toast({
          title: editingItem ? "Température modifiée" : "Température ajoutée",
          description: `La température a été ${editingItem ? "modifiée" : "ajoutée"} avec succès.`,
        })
        return
      }

      if (currentTab === "options-traitement") {
        const optionTraitementData: CreateOptionTraitementData | UpdateOptionTraitementData = {
          nom: formData.nom,
          description: formData.description || "",
        }

        if (editingItem) {
          await updateOptionTraitement(editingItem.id, optionTraitementData)
        } else {
          await createOptionTraitement(optionTraitementData)
        }

        setIsDialogOpen(false)
        setFormData({})
        setEditingItem(null)
        setFieldErrors({})
        // </CHANGE>

        toast({
          title: editingItem ? "Option modifiée" : "Option ajoutée",
          description: `L'option de traitement a été ${editingItem ? "modifiée" : "ajoutée"} avec succès.`,
        })
        return
      }

      if (currentTab === "types-linge") {
        const typeLingeData: CreateTypeLingeData | UpdateTypeLingeData = {
          nom: formData.nom,
          description: formData.description || null,
        }

        if (editingItem) {
          await updateTypeLinge(editingItem.id, typeLingeData)
        } else {
          await createTypeLinge(typeLingeData)
        }

        setIsDialogOpen(false)
        setFormData({})
        setEditingItem(null)
        setFieldErrors({})
        // </CHANGE>

        toast({
          title: editingItem ? "Type modifié" : "Type ajouté",
          description: `Le type de linge a été ${editingItem ? "modifié" : "ajouté"} avec succès.`,
        })
        return
      }
    } catch (error: any) {
      console.error("[v0] Erreur lors de la sauvegarde:", error)

      if (error?.errors && typeof error.errors === "object") {
        setValidationErrors(error.errors)
      }

      toast({
        title: "Erreur de validation",
        description: "Veuillez corriger les erreurs dans le formulaire.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Rendu du formulaire selon le type d'élément
   */
  const renderForm = () => {
    switch (currentTab) {
      case "options-traitement":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="nom">Nom de l'option *</Label>
              <Input
                id="nom"
                value={formData.nom || ""}
                onChange={(e) => {
                  setFormData({ ...formData, nom: e.target.value })
                  if (fieldErrors.nom) {
                    setFieldErrors({ ...fieldErrors, nom: false })
                  }
                }}
                placeholder="Ex: Détachage spécialisé"
                required
                className={fieldErrors.nom ? "border-red-500" : ""}
              />
              {/* </CHANGE> */}
              {validationErrors.nom && <p className="text-sm text-red-500 mt-1">{validationErrors.nom.join(", ")}</p>}
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value })
                  if (fieldErrors.description) {
                    setFieldErrors({ ...fieldErrors, description: false })
                  }
                }}
                placeholder="Description de l'option de traitement"
                required
                className={fieldErrors.description ? "border-red-500" : ""}
              />
              {/* </CHANGE> */}
              {validationErrors.description && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.description.join(", ")}</p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                Note: Les prix sont gérés via le système de tarification
              </p>
            </div>
          </div>
        )
      case "types-linge":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="nom">Type de linge *</Label>
              <Input
                id="nom"
                value={formData.nom || ""}
                onChange={(e) => {
                  setFormData({ ...formData, nom: e.target.value })
                  if (fieldErrors.nom) {
                    setFieldErrors({ ...fieldErrors, nom: false })
                  }
                }}
                placeholder="Ex: Chemise"
                required
                className={fieldErrors.nom ? "border-red-500" : ""}
              />
              {/* </CHANGE> */}
              {validationErrors.nom && <p className="text-sm text-red-500 mt-1">{validationErrors.nom.join(", ")}</p>}
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du type de linge (optionnel)"
              />
              {validationErrors.description && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.description.join(", ")}</p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                Note: Les prix sont gérés via le système de tarification
              </p>
            </div>
          </div>
        )
      case "temperatures":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="valeur">Température *</Label>
              <Input
                id="valeur"
                value={formData.valeur || ""}
                onChange={(e) => {
                  setFormData({ ...formData, valeur: e.target.value })
                  if (fieldErrors.valeur) {
                    setFieldErrors({ ...fieldErrors, valeur: false })
                  }
                }}
                placeholder="Ex: 30"
                required
                className={fieldErrors.valeur ? "border-red-500" : ""}
              />
              {/* </CHANGE> */}
              {validationErrors.valeur && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.valeur.join(", ")}</p>
              )}
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de la température (optionnel)"
              />
              {validationErrors.description && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.description.join(", ")}</p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                Note: Les prix sont gérés via le système de tarification
              </p>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  /**
   * Affichage des erreurs de chargement
   */
  if (temperaturesError || optionTraitementsError || typeLingesError) {
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
                <p className="text-muted-foreground mb-4">
                  {temperaturesError || optionTraitementsError || typeLingesError}
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => fetchTemperatures()}>Réessayer températures</Button>
                  <Button onClick={() => fetchOptionTraitements()}>Réessayer options</Button>
                  <Button onClick={() => fetchTypeLinges()}>Réessayer types</Button>
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
              <h1 className="text-3xl font-bold text-balance">Options de Service</h1>
              <p className="text-muted-foreground">
                Gérez les options de traitement, types de linge et températures de lavage
              </p>
            </div>
            <Link href="/services/options/archived">
              <Button variant="outline">
                <Archive className="h-4 w-4 mr-2" />
                Voir les archives
              </Button>
            </Link>
            {/* </CHANGE> */}
          </div>

          <Tabs defaultValue="options-traitement" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="options-traitement">Options Traitement</TabsTrigger>
              <TabsTrigger value="types-linge">Types de Linge</TabsTrigger>
              <TabsTrigger value="temperatures">Températures</TabsTrigger>
            </TabsList>

            <TabsContent value="options-traitement">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Options de Traitement</CardTitle>
                    <CardDescription>
                      Gérez les options supplémentaires disponibles pour le traitement du linge
                    </CardDescription>
                  </div>
                  <Button onClick={() => handleAdd("options-traitement")} disabled={optionTraitementsLoading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                </CardHeader>
                <CardContent>
                  {optionTraitementsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Chargement des options de traitement...</span>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.isArray(optionTraitements) &&
                          optionTraitements.map((option) => (
                            <TableRow key={option.id}>
                              <TableCell className="font-medium">{option.nom}</TableCell>
                              <TableCell className="max-w-md truncate">{option.description}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={option.estActif ? "default" : "secondary"}
                                  className={!option.estActif ? "bg-red-500 hover:bg-red-600 text-white" : ""}
                                >
                                  {option.estActif ? "Actif" : "Inactif"}
                                </Badge>
                                {/* </CHANGE> */}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEdit(option, "options-traitement")}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Modifier
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleToggleActive(option.id, "options-traitement")}
                                    >
                                      <Power className="h-4 w-4 mr-2" />
                                      {option.estActif ? "Désactiver" : "Activer"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => handleDelete(option.id, "options-traitement")}
                                    >
                                      <Archive className="h-4 w-4 mr-2" />
                                      Archiver
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        {(!Array.isArray(optionTraitements) || optionTraitements.length === 0) && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                              Aucune option de traitement configurée
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="types-linge">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Types de Linge</CardTitle>
                    <CardDescription>Gérez les différents types de linge disponibles</CardDescription>
                  </div>
                  <Button onClick={() => handleAdd("types-linge")} disabled={typeLingesLoading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                </CardHeader>
                <CardContent>
                  {typeLingesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Chargement des types de linge...</span>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.isArray(typeLinges) &&
                          typeLinges.map((type) => (
                            <TableRow key={type.id}>
                              <TableCell className="font-medium">{type.nom}</TableCell>
                              <TableCell className="max-w-md truncate">{type.description || "-"}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={type.estActif ? "default" : "secondary"}
                                  className={!type.estActif ? "bg-red-500 hover:bg-red-600 text-white" : ""}
                                >
                                  {type.estActif ? "Actif" : "Inactif"}
                                </Badge>
                                {/* </CHANGE> */}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEdit(type, "types-linge")}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Modifier
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleToggleActive(type.id, "types-linge")}>
                                      <Power className="h-4 w-4 mr-2" />
                                      {type.estActif ? "Désactiver" : "Activer"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => handleDelete(type.id, "types-linge")}
                                    >
                                      <Archive className="h-4 w-4 mr-2" />
                                      Archiver
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        {(!Array.isArray(typeLinges) || typeLinges.length === 0) && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                              Aucun type de linge configuré
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="temperatures">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Températures</CardTitle>
                    <CardDescription>Gérez les températures de lavage disponibles</CardDescription>
                  </div>
                  <Button onClick={() => handleAdd("temperatures")} disabled={temperaturesLoading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                </CardHeader>
                <CardContent>
                  {temperaturesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Chargement des températures...</span>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Valeur</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.isArray(temperatures) &&
                          temperatures.map((temp) => (
                            <TableRow key={temp.id}>
                              <TableCell className="font-medium">{temp.valeur} °C</TableCell>
                              <TableCell className="max-w-md truncate">{temp.description || "-"}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={temp.estActif ? "default" : "secondary"}
                                  className={!temp.estActif ? "bg-red-500 hover:bg-red-600 text-white" : ""}
                                >
                                  {temp.estActif ? "Actif" : "Inactif"}
                                </Badge>
                                {/* </CHANGE> */}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEdit(temp, "temperatures")}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Modifier
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleToggleActive(temp.id, "temperatures")}>
                                      <Power className="h-4 w-4 mr-2" />
                                      {temp.estActif ? "Désactiver" : "Activer"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => handleDelete(temp.id, "temperatures")}
                                    >
                                      <Archive className="h-4 w-4 mr-2" />
                                      Archiver
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        {(!Array.isArray(temperatures) || temperatures.length === 0) && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                              Aucune température configurée
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

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "Modifier" : "Ajouter"}
                  {currentTab === "options-traitement" && " une option de traitement"}
                  {currentTab === "types-linge" && " un type de linge"}
                  {currentTab === "temperatures" && " une température"}
                </DialogTitle>
                <DialogDescription>
                  {editingItem ? "Modifiez les informations ci-dessous" : "Remplissez les informations ci-dessous"}
                </DialogDescription>
              </DialogHeader>
              {renderForm()}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                  Annuler
                </Button>
                <Button onClick={handleSave} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>{editingItem ? "Modifier" : "Ajouter"}</>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* </CHANGE> */}
        </main>
      </SidebarInset>
    </>
  )
}
