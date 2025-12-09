"use client"

import { useState, useEffect, useMemo } from "react"
import { format, addHours, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import {
  Calendar,
  Clock,
  User,
  Package,
  TruckIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  AlertCircle,
  DollarSign,
  Clock3,
  AlertTriangle,
  Info,
  Ruler,
  Receipt,
  Search,
  ArrowDown,
  ArrowUp,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Livreur } from "@/lib/api/types/livreur"
import type { Commande } from "@/lib/api/types/commande"

interface CreateTourneeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  livreurs: Livreur[]
  commandes: Commande[]
  onSubmit: (data: CreateTourneeFormData) => Promise<void>
  loading?: boolean
}

export interface CreateTourneeFormData {
  livreurId: number
  date: string
  dateHeureDebut: string
  commandeIds: number[]
  operations: Array<{
    commandeId: number
    typeOperation: "collecte" | "livraison"
  }>
}

interface OperationCommande {
  commandeId: number
  typeOperation: "collecte" | "livraison"
}

const wizardSteps = [
  { id: "livreur", label: "Livreur & Date", icon: User },
  { id: "operations", label: "Commandes", icon: Package },
  { id: "recapitulatif", label: "Récapitulatif", icon: CheckCircle2 },
]

/**
 * Obtient le badge de statut de paiement d'une commande
 */
const getPaymentStatusBadge = (commande: Commande) => {
  if (commande.estPayeCompletement) {
    return <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">Payé</Badge>
  } else if (commande.montantPaye > 0) {
    return <Badge className="bg-orange-100 text-orange-800 border-orange-300 text-xs">Partiel</Badge>
  } else {
    return <Badge className="bg-red-100 text-red-800 border-red-300 text-xs">Impayé</Badge>
  }
}

/**
 * Récupère le statut actuel d'une commande en triant par date
 * Remplacer la logique pour obtenir le dernier statut par date au lieu de position dans le tableau
 */
const getCommandeStatut = (commande: Commande) => {
  if (!commande.statuts || commande.statuts.length === 0) {
    return "En attente"
  }

  // Trier les statuts par date décroissante pour obtenir le plus récent
  const statutsTries = [...commande.statuts].sort((a, b) => {
    const dateA = new Date(a.pivot?.createdAt || a.pivot?.created_at || 0).getTime()
    const dateB = new Date(b.pivot?.createdAt || b.pivot?.created_at || 0).getTime()
    return dateB - dateA
  })

  return statutsTries[0]?.nom || "En attente"
}

/**
 * Obtient le badge de statut d'une commande avec couleur
 */
const getStatutBadge = (commande: Commande) => {
  const statut = getCommandeStatut(commande)
  const statutLower = statut.toLowerCase()

  if (statutLower.includes("livr") || statutLower.includes("termin") || statutLower.includes("complet")) {
    return <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">{statut}</Badge>
  } else if (statutLower.includes("cours") || statutLower.includes("traitement")) {
    return <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-xs">{statut}</Badge>
  } else if (statutLower.includes("annul")) {
    return <Badge className="bg-red-100 text-red-800 border-red-300 text-xs">{statut}</Badge>
  } else {
    return <Badge className="bg-gray-100 text-gray-800 border-gray-300 text-xs">{statut}</Badge>
  }
}

/**
 * Vérifie si une commande est déjà livrée
 * Trie maintenant les statuts par date pour obtenir le plus récent
 */
const commandeEstLivree = (commande: Commande): boolean => {
  if (!commande.statuts || commande.statuts.length === 0) return false

  // Trier les statuts par date décroissante pour obtenir le plus récent
  const statutsTries = [...commande.statuts].sort((a, b) => {
    const dateA = new Date(a.pivot?.createdAt || a.pivot?.created_at || 0).getTime()
    const dateB = new Date(b.pivot?.createdAt || b.pivot?.created_at || 0).getTime()
    return dateB - dateA
  })

  const dernierStatut = statutsTries[0]
  const statutsLivres = ["livree", "livré", "livrée", "terminee", "terminée", "completee", "complétée"]

  return statutsLivres.some((s) => dernierStatut.nom.toLowerCase().includes(s))
}

/**
 * Vérifie si une commande a déjà un statut "collecte"
 * Nouvelle fonction pour contrôler si on peut choisir le type d'opération
 */
const commandeAUnStatutCollecte = (commande: Commande): boolean => {
  if (!commande.statuts || commande.statuts.length === 0) return false

  // Trier les statuts par date décroissante pour obtenir le plus récent
  const statutsTries = [...commande.statuts].sort((a, b) => {
    const dateA = new Date(a.pivot?.createdAt || a.pivot?.created_at || 0).getTime()
    const dateB = new Date(b.pivot?.createdAt || b.pivot?.created_at || 0).getTime()
    return dateB - dateA
  })

  const dernierStatut = statutsTries[0]
  const statutsCollectes = ["collecte", "collectée", "collectées", "en collecte", "collecté"]

  return statutsCollectes.some((s) => dernierStatut.nom.toLowerCase().includes(s))
}

const getOperationsDisponibles = (commande: Commande): Array<"collecte" | "livraison"> => {
  // Si la commande a déjà un statut collecte, afficher uniquement livraison
  if (commandeAUnStatutCollecte(commande)) {
    return ["livraison"]
  }
  // Sinon, afficher les deux options
  return ["collecte", "livraison"]
}

/**
 * Modal professionnel de création de tournée avec wizard multi-étapes
 * Permet de créer une tournée en 3 étapes : sélection livreur/date, ajout de commandes, récapitulatif
 */
export function CreateTourneeModal({
  open,
  onOpenChange,
  livreurs,
  commandes,
  onSubmit,
  loading = false,
}: CreateTourneeModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Données du formulaire
  const [livreurId, setLivreurId] = useState<number | null>(null)
  const [date, setDate] = useState("")
  const [heureDebut, setHeureDebut] = useState("08:00")

  const [operations, setOperations] = useState<OperationCommande[]>([])

  const [searchQuery, setSearchQuery] = useState("")

  const commandesDisponibles = commandes.filter((commande) => !commandeEstLivree(commande))

  const commandesFiltrees = useMemo(() => {
    if (!searchQuery.trim()) return commandesDisponibles

    const query = searchQuery.toLowerCase()
    return commandesDisponibles.filter((commande) => {
      const numeroMatch = commande.numeroCommande.toLowerCase().includes(query)
      const clientNom =
        `${commande.client?.user?.prenom || commande.client?.prenom || ""} ${commande.client?.user?.nom || commande.client?.nom || ""}`.toLowerCase()
      const clientMatch = clientNom.includes(query)
      const adresseCollecteMatch = commande.adresseCollecte?.toLowerCase().includes(query) || false
      const adresseLivraisonMatch = commande.adresseLivraison?.toLowerCase().includes(query) || false
      const statutMatch = getCommandeStatut(commande).toLowerCase().includes(query)

      return numeroMatch || clientMatch || adresseCollecteMatch || adresseLivraisonMatch || statutMatch
    })
  }, [commandesDisponibles, searchQuery])

  // Réinitialiser le formulaire quand le modal s'ouvre/ferme
  useEffect(() => {
    if (open) {
      resetForm()
    }
  }, [open])

  const resetForm = () => {
    setCurrentStep(0)
    setLivreurId(null)
    setDate("")
    setHeureDebut("08:00")
    setOperations([])
    setSearchQuery("")
    setErrors({})
  }

  const handleNext = () => {
    // Validation avant de passer à l'étape suivante
    if (currentStep === 0) {
      const newErrors: Record<string, string> = {}
      if (!livreurId) newErrors.livreur = "Veuillez sélectionner un livreur"
      if (!date) newErrors.date = "Veuillez sélectionner une date"
      if (!heureDebut) newErrors.heure = "Veuillez sélectionner une heure"

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }
    } else if (currentStep === 1) {
      const newErrors: Record<string, string> = {}
      if (operations.length === 0) {
        newErrors.commandes = "Veuillez sélectionner au moins une commande"
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }
    }

    setErrors({})
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setErrors({})
    }
  }

  const handleSubmit = async () => {
    if (!livreurId || !date || operations.length === 0) return

    const dateHeureDebut = `${date}T${heureDebut}:00.000Z`

    const formData: CreateTourneeFormData = {
      livreurId,
      date,
      dateHeureDebut,
      commandeIds: operations.map((op) => op.commandeId),
      operations: operations, // Inclure les types d'opération
    }

    await onSubmit(formData)
    onOpenChange(false)
    resetForm()
  }

  const ajouterOperation = (commandeId: number, typeOperation: "collecte" | "livraison") => {
    const existe = operations.find((op) => op.commandeId === commandeId)
    if (!existe) {
      setOperations([...operations, { commandeId, typeOperation }])
      setErrors({})
    }
  }

  const retirerOperation = (commandeId: number) => {
    setOperations(operations.filter((op) => op.commandeId !== commandeId))
    if (operations.length <= 1) {
      setErrors({ commandes: "Veuillez sélectionner au moins une commande" })
    }
  }

  const changerTypeOperation = (commandeId: number, typeOperation: "collecte" | "livraison") => {
    setOperations(operations.map((op) => (op.commandeId === commandeId ? { ...op, typeOperation } : op)))
  }

  // Obtenir les infos du livreur sélectionné
  const livreurSelectionne = livreurs.find((l) => l.id === livreurId)

  // Obtenir les infos d'une commande
  const getCommandeById = (id: number) => {
    return commandesDisponibles.find((c) => c.id === id)
  }

  // Filtrer les livreurs disponibles
  const livreursDisponibles = livreurs.filter((l) => l.estDisponible && l.estActif)

  // Rendu du contenu selon l'étape
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            {/* Sélection du livreur */}
            <div className="space-y-3">
              <Label htmlFor="livreur" className="text-base font-semibold flex items-center gap-2">
                <User className="size-4 text-primary" />
                Livreur
              </Label>
              <Select
                value={livreurId?.toString() || ""}
                onValueChange={(value) => {
                  setLivreurId(Number(value))
                  setErrors({})
                }}
              >
                <SelectTrigger id="livreur" className={cn("h-12 text-base", errors.livreur && "border-red-500")}>
                  <SelectValue placeholder="Sélectionnez un livreur disponible" />
                </SelectTrigger>
                <SelectContent>
                  {livreursDisponibles.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      <AlertCircle className="size-8 mx-auto mb-2 text-orange-500" />
                      Aucun livreur disponible
                    </div>
                  ) : (
                    livreursDisponibles.map((livreur) => (
                      <SelectItem key={livreur.id} value={livreur.id.toString()} className="text-base py-3">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="size-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-semibold">
                              {livreur.user?.prenom} {livreur.user?.nom}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              <span>Matricule: {livreur.matricule}</span>
                              {livreur.typeVehicule && <span className="text-primary">• {livreur.typeVehicule}</span>}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.livreur && <p className="text-sm text-red-500">{errors.livreur}</p>}
            </div>

            {/* Informations du livreur sélectionné */}
            {livreurSelectionne && (
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
                <div className="flex items-start gap-3">
                  <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <User className="size-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg mb-1">
                      {livreurSelectionne.user?.prenom} {livreurSelectionne.user?.nom}
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p className="text-muted-foreground">
                        <span className="font-medium">Email:</span> {livreurSelectionne.user?.email}
                      </p>
                      {livreurSelectionne.user?.telephone && (
                        <p className="text-muted-foreground">
                          <span className="font-medium">Téléphone:</span> {livreurSelectionne.user.telephone}
                        </p>
                      )}
                      {livreurSelectionne.typeVehicule && (
                        <p className="text-muted-foreground">
                          <span className="font-medium">Véhicule:</span> {livreurSelectionne.typeVehicule}
                          {livreurSelectionne.immatriculationVehicule &&
                            ` (${livreurSelectionne.immatriculationVehicule})`}
                        </p>
                      )}
                      <div className="flex gap-2 pt-2 flex-wrap">
                        <Badge className="bg-green-100 text-green-800 border-green-300"> Disponible</Badge>
                        {livreurSelectionne.statistiques && (
                          <>
                            <Badge variant="outline">
                              {livreurSelectionne.statistiques.tourneesCompletees || 0} tournées terminées
                            </Badge>
                            <Badge variant="outline">
                              {livreurSelectionne.statistiques.totalOperations || 0} opérations
                            </Badge>
                            {livreurSelectionne.statistiques.tauxReussite && (
                              <Badge variant="outline" className="bg-blue-50 border-blue-200">
                                {livreurSelectionne.statistiques.tauxReussite.toFixed(1)}% succès
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Sélection de la date */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="date" className="text-base font-semibold flex items-center gap-2">
                  <Calendar className="size-4 text-primary" />
                  Date de la tournée
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value)
                    setErrors({})
                  }}
                  min={new Date().toISOString().split("T")[0]}
                  className={cn("h-12 text-base", errors.date && "border-red-500")}
                />
                {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
              </div>

              <div className="space-y-3">
                <Label htmlFor="heure" className="text-base font-semibold flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  Heure de début
                </Label>
                <Input
                  id="heure"
                  type="time"
                  value={heureDebut}
                  onChange={(e) => {
                    setHeureDebut(e.target.value)
                    setErrors({})
                  }}
                  className={cn("h-12 text-base", errors.heure && "border-red-500")}
                />
                {errors.heure && <p className="text-sm text-red-500">{errors.heure}</p>}
              </div>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Sélection des commandes</h3>
                <p className="text-sm text-muted-foreground">Choisissez les commandes à inclure dans cette tournée</p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Info className="size-3" />
                  {commandesFiltrees.length} commande(s) disponible(s) • {operations.length} sélectionnée(s)
                </p>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher par numéro, client, adresse, statut..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>

            {errors.commandes && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 dark:text-red-200">{errors.commandes}</p>
              </div>
            )}

            <ScrollArea className="h-[450px] pr-4">
              <div className="space-y-2">
                {commandesFiltrees.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="size-16 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground mb-2">
                      {searchQuery ? "Aucune commande trouvée" : "Aucune commande disponible"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {searchQuery
                        ? "Essayez avec un autre terme de recherche"
                        : "Les commandes déjà livrées sont automatiquement exclues"}
                    </p>
                  </div>
                ) : (
                  commandesFiltrees.map((commande) => {
                    const operation = operations.find((op) => op.commandeId === commande.id)
                    const estSelectionnee = !!operation

                    return (
                      <div
                        key={commande.id}
                        className={cn(
                          "bg-card border rounded-lg p-3 transition-all hover:shadow-md",
                          estSelectionnee && "border-primary bg-primary/5 ring-1 ring-primary/20",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {/* Checkbox visuel */}
                          <div
                            className={cn(
                              "size-5 rounded border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors",
                              estSelectionnee
                                ? "bg-primary border-primary"
                                : "border-muted-foreground/30 bg-background hover:border-primary/50",
                            )}
                            onClick={() => {
                              if (estSelectionnee) {
                                retirerOperation(commande.id)
                              } else {
                                ajouterOperation(commande.id, "collecte")
                              }
                            }}
                          >
                            {estSelectionnee && <CheckCircle2 className="size-3.5 text-white" />}
                          </div>

                          {/* Informations principales sur une ligne */}
                          <div className="flex-1 min-w-0 grid grid-cols-12 gap-2 items-center">
                            {/* Numéro et statut */}
                            <div className="col-span-3 flex items-center gap-2">
                              <span className="font-bold text-sm">#{commande.numeroCommande}</span>
                              {getStatutBadge(commande)}
                            </div>

                            {/* Client */}
                            <div className="col-span-3 flex items-center gap-1 min-w-0">
                              <User className="size-3 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm truncate">
                                {commande.client?.user?.prenom || commande.client?.prenom}{" "}
                                {commande.client?.user?.nom || commande.client?.nom}
                              </span>
                            </div>

                            {/* Collecte */}
                            <div className="col-span-3 flex items-center gap-1 min-w-0">
                              <Clock3 className="size-3 text-blue-600 flex-shrink-0" />
                              <span className="text-xs text-muted-foreground truncate">
                                {commande.creneauCollecte
                                  ? formaterDateHeureCollecte(
                                      commande.dateCommande,
                                      commande.creneauCollecte.nom,
                                      commande.heureCollecteChoisie,
                                    )
                                  : "Non définie"}
                              </span>
                            </div>

                            {/* Livraison et badges */}
                            <div className="col-span-3 flex items-center gap-1 justify-end">
                              {commande.estUrgent && (
                                <Badge className="bg-red-100 text-red-800 border-red-300 text-[10px] px-1.5 py-0">
                                  <AlertTriangle className="size-2.5 mr-0.5" />
                                  Urgent
                                </Badge>
                              )}
                              {getPaymentStatusBadge(commande)}
                              <span className="text-xs font-semibold text-green-600">
                                {commande.montantTotal.toFixed(0)} F
                              </span>
                            </div>
                          </div>

                          {estSelectionnee && (
                            <div className="flex-shrink-0">
                              <Select
                                value={operation?.typeOperation || "collecte"}
                                onValueChange={(value: "collecte" | "livraison") =>
                                  changerTypeOperation(commande.id, value)
                                }
                              >
                                <SelectTrigger className="h-8 w-[110px] text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {getOperationsDisponibles(commande).includes("collecte") && (
                                    <SelectItem value="collecte">
                                      <div className="flex items-center gap-1.5">
                                        <ArrowUp className="size-3 text-blue-600" />
                                        Collecte
                                      </div>
                                    </SelectItem>
                                  )}
                                  {getOperationsDisponibles(commande).includes("livraison") && (
                                    <SelectItem value="livraison">
                                      <div className="flex items-center gap-1.5">
                                        <ArrowDown className="size-3 text-green-600" />
                                        Livraison
                                      </div>
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>

                        {/* Détails supplémentaires (affichés seulement si sélectionné) */}
                        {estSelectionnee && (
                          <div className="mt-3 pt-3 border-t space-y-2 text-xs">
                            {/* Délai de livraison */}
                            {commande.delaiLivraison && (
                              <div className="flex items-start gap-1.5">
                                <Clock className="size-3.5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-muted-foreground">Livraison avant le:</span>
                                  <p className="font-medium text-red-600">
                                    {calculerDateLimiteLivraison(
                                      commande.dateCommande,
                                      commande.delaiLivraison.delaiHeures,
                                    )}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Adresses */}
                            <div className="grid grid-cols-2 gap-3">
                              {commande.adresseCollecte && (
                                <div className="flex items-start gap-1.5">
                                  <MapPin className="size-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                                  <div className="min-w-0">
                                    <span className="text-muted-foreground">Collecte:</span>
                                    <p className="line-clamp-2">{commande.adresseCollecte}</p>
                                    {commande.distanceCollecte && (
                                      <p className="text-muted-foreground flex items-center gap-1 mt-0.5">
                                        <Ruler className="size-3" />
                                        {commande.distanceCollecte.toFixed(2)} km
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
                              {commande.adresseLivraison && (
                                <div className="flex items-start gap-1.5">
                                  <MapPin className="size-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                                  <div className="min-w-0">
                                    <span className="text-muted-foreground">Livraison:</span>
                                    <p className="line-clamp-2">{commande.adresseLivraison}</p>
                                    {commande.distanceLivraison && (
                                      <p className="text-muted-foreground flex items-center gap-1 mt-0.5">
                                        <Ruler className="size-3" />
                                        {commande.distanceLivraison.toFixed(2)} km
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Articles */}
                            {commande.lignesCommande && commande.lignesCommande.length > 0 && (
                              <div className="flex items-center gap-1.5">
                                <Receipt className="size-3.5 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  {commande.lignesCommande.length} article(s) •{" "}
                                  {commande.lignesCommande.reduce((acc, ligne) => acc + ligne.quantite, 0)} pièce(s)
                                </span>
                              </div>
                            )}

                            {/* Note client */}
                            {commande.noteClient && (
                              <div className="bg-amber-50 dark:bg-amber-950/30 rounded p-2">
                                <span className="font-medium text-amber-900 dark:text-amber-100">Note:</span>
                                <p className="text-amber-800 dark:text-amber-200 mt-1 line-clamp-2 italic">
                                  {commande.noteClient}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 rounded-lg p-5 border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-3">
                <div className="size-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="size-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Récapitulatif de la tournée</h3>
                  <p className="text-sm text-muted-foreground">Vérifiez les informations avant de créer la tournée</p>
                </div>
              </div>
            </div>

            {/* Informations de la tournée */}
            <div className="space-y-4">
              {/* Livreur */}
              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="size-4 text-primary" />
                  <h4 className="font-semibold">Livreur assigné</h4>
                </div>
                {livreurSelectionne && (
                  <div className="flex items-center gap-3 pl-6">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">
                        {livreurSelectionne.user?.prenom} {livreurSelectionne.user?.nom}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {livreurSelectionne.matricule}
                        {livreurSelectionne.typeVehicule && ` • ${livreurSelectionne.typeVehicule}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Date et heure */}
              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="size-4 text-primary" />
                  <h4 className="font-semibold">Date et heure</h4>
                </div>
                <div className="pl-6 space-y-1">
                  <p className="text-base">
                    <span className="font-medium">Date:</span>{" "}
                    {date ? format(new Date(date), "dd MMMM yyyy", { locale: fr }) : ""}
                  </p>
                  <p className="text-base">
                    <span className="font-medium">Heure de début:</span> {heureDebut}
                  </p>
                </div>
              </div>

              {/* Commandes sélectionnées */}
              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Package className="size-4 text-primary" />
                    <h4 className="font-semibold">Commandes sélectionnées</h4>
                  </div>
                  <Badge variant="secondary">{operations.length} opération(s)</Badge>
                </div>
                <ScrollArea className="max-h-[300px]">
                  <div className="space-y-3 pl-6">
                    {operations.map((operation, index) => {
                      const commande = getCommandeById(operation.commandeId)
                      if (!commande) return null

                      return (
                        <div key={operation.commandeId} className="flex items-start gap-3 bg-muted/30 rounded-lg p-3">
                          <span className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="font-semibold">#{commande.numeroCommande}</span>
                              <Badge
                                className={cn(
                                  "text-xs",
                                  operation.typeOperation === "collecte"
                                    ? "bg-blue-100 text-blue-800 border-blue-300"
                                    : "bg-green-100 text-green-800 border-green-300",
                                )}
                              >
                                {operation.typeOperation === "collecte" ? (
                                  <>
                                    <ArrowUp className="size-3 mr-1" />
                                    Collecte
                                  </>
                                ) : (
                                  <>
                                    <ArrowDown className="size-3 mr-1" />
                                    Livraison
                                  </>
                                )}
                              </Badge>
                              {getStatutBadge(commande)}
                              {getPaymentStatusBadge(commande)}
                              {commande.estUrgent && (
                                <Badge className="bg-red-100 text-red-800 border-red-300 text-xs">
                                  <AlertTriangle className="size-3 mr-1" />
                                  Urgent
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm space-y-1">
                              <p className="text-muted-foreground text-xs">
                                Client: {commande.client?.user?.prenom || commande.client?.prenom}{" "}
                                {commande.client?.user?.nom || commande.client?.nom}
                              </p>
                              <p className="text-muted-foreground text-xs flex items-center gap-1">
                                <DollarSign className="size-3" />
                                {commande.montantTotal.toFixed(2)} F CFA
                              </p>
                              {commande.delaiLivraison && (
                                <p className="text-red-600 text-xs flex items-center gap-1">
                                  <Clock className="size-3" />
                                  Livraison:{" "}
                                  {calculerDateLimiteLivraison(
                                    commande.dateCommande,
                                    commande.delaiLivraison.delaiHeures,
                                  )}
                                </p>
                              )}
                              {commande.creneauCollecte && (
                                <p className="text-blue-600 text-xs flex items-center gap-1">
                                  <Clock3 className="size-3" />
                                  Collecte:{" "}
                                  {formaterDateHeureCollecte(
                                    commande.dateCommande,
                                    commande.creneauCollecte.nom,
                                    commande.heureCollecteChoisie,
                                  )}
                                </p>
                              )}
                              {commande.adresseCollecte && (
                                <p className="text-muted-foreground text-xs leading-relaxed line-clamp-1">
                                  <MapPin className="size-3 inline mr-1 text-blue-600" />
                                  {commande.adresseCollecte}
                                </p>
                              )}
                              {commande.adresseLivraison && (
                                <p className="text-muted-foreground text-xs leading-relaxed line-clamp-1">
                                  <MapPin className="size-3 inline mr-1 text-green-600" />
                                  {commande.adresseLivraison}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] lg:max-w-[90vw] xl:max-w-[85vw] max-h-[95vh] p-0 gap-0 overflow-hidden">
        {/* En-tête */}
        <DialogHeader className="px-6 py-5 border-b bg-gradient-to-r from-primary/5 to-primary/10">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center">
              <TruckIcon className="size-5 text-primary" />
            </div>
            Créer une nouvelle tournée
          </DialogTitle>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 px-6 py-4 bg-muted/30 border-b">
          {wizardSteps.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === index
            const isCompleted = currentStep > index

            return (
              <div key={step.id} className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all",
                    isActive && "bg-primary text-primary-foreground shadow-md scale-105",
                    isCompleted && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                    !isActive && !isCompleted && "bg-muted text-muted-foreground",
                  )}
                >
                  <div
                    className={cn(
                      "size-8 rounded-full flex items-center justify-center font-bold",
                      isActive && "bg-primary-foreground/20",
                      isCompleted && "bg-green-200 dark:bg-green-800",
                      !isActive && !isCompleted && "bg-background",
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="size-5" />
                    ) : (
                      <Icon className={cn("size-4", isActive && "text-primary-foreground")} />
                    )}
                  </div>
                  <span className="font-semibold text-sm hidden md:inline">{step.label}</span>
                </div>
                {index < wizardSteps.length - 1 && (
                  <ChevronRight className="size-5 text-muted-foreground flex-shrink-0" />
                )}
              </div>
            )
          })}
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(95vh-300px)]">
            <div className="p-6">{renderStepContent()}</div>
          </ScrollArea>
        </div>

        {/* Footer avec boutons */}
        <div className="px-6 py-4 border-t bg-muted/30 flex items-center justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            <X className="size-4 mr-2" />
            Annuler
          </Button>

          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrevious} disabled={loading} size="lg">
                <ChevronLeft className="size-4 mr-2" />
                Précédent
              </Button>
            )}

            {currentStep < wizardSteps.length - 1 ? (
              <Button onClick={handleNext} disabled={loading} size="lg">
                Suivant
                <ChevronRight className="size-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading} size="lg" className="min-w-[180px]">
                {loading ? (
                  <>
                    <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Création...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4 mr-2" />
                    Créer la tournée
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Calcule la date et heure limite de livraison à partir de la date de commande et du délai
 */
const calculerDateLimiteLivraison = (dateCommande: string, delaiHeures: string): string => {
  try {
    const date = parseISO(dateCommande)
    const heures = Number.parseInt(delaiHeures, 10)
    const dateLimite = addHours(date, heures)
    return format(dateLimite, "dd/MM/yyyy 'à' HH:mm", { locale: fr })
  } catch (error) {
    return "Non disponible"
  }
}

/**
 * Formate la date et heure de collecte
 * Amélioration du formatage pour gérer les formats ISO et HH:mm correctement
 */
const formaterDateHeureCollecte = (dateCommande: string, creneauNom?: string, heureChoisie?: string | null): string => {
  try {
    // Formater la date de commande
    const date = format(parseISO(dateCommande), "dd/MM/yyyy", { locale: fr })

    // Si une heure spécifique est choisie
    if (heureChoisie) {
      // Vérifier si heureChoisie est une date ISO complète ou juste une heure
      if (heureChoisie.includes("T") || heureChoisie.includes("-")) {
        // C'est une date ISO, extraire juste l'heure
        const heureFormatee = format(parseISO(heureChoisie), "HH:mm", { locale: fr })
        return `${date} à ${heureFormatee}`
      } else {
        // C'est déjà une heure au format HH:mm
        return `${date} à ${heureChoisie}`
      }
    }
    // Si un créneau est défini
    else if (creneauNom) {
      return `${date} - ${creneauNom}`
    }

    return date
  } catch (error) {
    return "Non disponible"
  }
}
