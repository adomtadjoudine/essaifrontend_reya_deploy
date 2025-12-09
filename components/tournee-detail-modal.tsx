"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
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
  MapPin,
  Phone,
  Mail,
  Hash,
  Play,
  StopCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { Tournee } from "@/lib/api/types/tournee"

interface TourneeDetailModalProps {
  tournee: Tournee | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDemarrer?: (id: number) => Promise<void>
  onTerminer?: (id: number) => Promise<void>
  onAnnuler?: (id: number) => Promise<void>
}

/**
 * Couleurs des badges selon le statut de la tournée
 */
const statutColors: Record<string, string> = {
  planifiee: "bg-blue-100 text-blue-800 border-blue-300",
  en_cours: "bg-orange-100 text-orange-800 border-orange-300",
  completee: "bg-green-100 text-green-800 border-green-300",
  annulee: "bg-red-100 text-red-800 border-red-300",
}

/**
 * Labels des statuts
 */
const statutLabels: Record<string, string> = {
  planifiee: "Planifiée",
  en_cours: "En cours",
  completee: "Complétée",
  annulee: "Annulée",
}

/**
 * Couleurs des badges selon le type d'opération
 */
const typeOperationColors: Record<string, string> = {
  collecte: "bg-blue-100 text-blue-800 border-blue-300",
  livraison: "bg-green-100 text-green-800 border-green-300",
}

/**
 * Étapes du wizard de visualisation
 */
const wizardSteps = [
  { id: "general", label: "Informations", icon: TruckIcon },
  { id: "livreur", label: "Livreur", icon: User },
  { id: "operations", label: "Opérations", icon: Package },
]

/**
 * Modal de détails d'une tournée
 * Affiche toutes les informations d'une tournée avec wizard navigation
 */
export function TourneeDetailModal({
  tournee,
  open,
  onOpenChange,
  onDemarrer,
  onTerminer,
  onAnnuler,
}: TourneeDetailModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (tournee) {
      setCurrentStep(0)
    }
  }, [tournee])

  if (!tournee) return null

  /**
   * Formate une date
   */
  const formatDate = (date: string | null) => {
    if (!date) return "Non définie"
    try {
      return format(new Date(date), "dd MMMM yyyy", { locale: fr })
    } catch {
      return "Date invalide"
    }
  }

  /**
   * Formate une date avec heure
   */
  const formatDateTime = (date: string | null) => {
    if (!date) return "Non définie"
    try {
      return format(new Date(date), "dd MMM yyyy 'à' HH:mm", { locale: fr })
    } catch {
      return "Date invalide"
    }
  }

  /**
   * Calcule la durée de la tournée
   */
  const calculerDuree = () => {
    if (!tournee.dateHeureDebut) return "Non définie"
    if (!tournee.dateHeureFin) return "En cours..."

    try {
      const debut = new Date(tournee.dateHeureDebut)
      const fin = new Date(tournee.dateHeureFin)
      const diffMs = fin.getTime() - debut.getTime()
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      return `${diffHours}h ${diffMinutes}min`
    } catch {
      return "Erreur de calcul"
    }
  }

  const handleAction = async (action: "demarrer" | "terminer" | "annuler") => {
    if (!tournee) return

    setLoading(true)
    try {
      if (action === "demarrer" && onDemarrer) {
        await onDemarrer(tournee.id)
      } else if (action === "terminer" && onTerminer) {
        await onTerminer(tournee.id)
      } else if (action === "annuler" && onAnnuler) {
        await onAnnuler(tournee.id)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex)
  }

  /**
   * Rendu du contenu selon l'étape active
   */
  const renderStepContent = () => {
    switch (wizardSteps[currentStep].id) {
      case "general":
        return (
          <div className="space-y-6">
            {/* Informations générales */}
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Hash className="size-5 text-primary" />
                Informations générales
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-medium">Numéro de tournée</p>
                  <p className="text-base font-bold text-primary">{tournee.numeroTournee}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-medium">Statut</p>
                  <Badge className={cn("text-sm", statutColors[tournee.statut])}>
                    {statutLabels[tournee.statut] || tournee.statut}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                    <Calendar className="size-3.5" />
                    Date de la tournée
                  </p>
                  <p className="text-base font-semibold">{formatDate(tournee.date)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                    <Clock className="size-3.5" />
                    Durée
                  </p>
                  <p className="text-base font-semibold">{calculerDuree()}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-card rounded-xl p-6 border shadow-sm">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Clock className="size-5 text-primary" />
                Timeline
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Play className="size-5 text-blue-600" />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="font-semibold">Heure de début</p>
                    <p className="text-sm text-muted-foreground">{formatDateTime(tournee.dateHeureDebut)}</p>
                  </div>
                </div>
                {tournee.dateHeureFin && (
                  <div className="flex items-start gap-4">
                    <div className="size-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <StopCircle className="size-5 text-green-600" />
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="font-semibold">Heure de fin</p>
                      <p className="text-sm text-muted-foreground">{formatDateTime(tournee.dateHeureFin)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Statistiques */}
            {tournee.operations && tournee.operations.length > 0 && (
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">Total opérations</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{tournee.operations.length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 rounded-xl p-6 border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-2">Complétées</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                    {tournee.operations.filter((op) => op.statut === "completee").length}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                  <p className="text-sm text-orange-600 dark:text-orange-400 font-medium mb-2">En cours</p>
                  <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                    {tournee.operations.filter((op) => op.statut === "en_cours").length}
                  </p>
                </div>
              </div>
            )}
          </div>
        )

      case "livreur":
        return (
          <div className="space-y-6">
            {tournee.livreur ? (
              <>
                {/* Carte livreur */}
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
                  <div className="flex items-start gap-4">
                    <div className="size-16 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <User className="size-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">
                        {tournee.livreur.user?.prenom} {tournee.livreur.user?.nom}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">Matricule: {tournee.livreur.matricule}</p>
                      <div className="flex gap-2">
                        <Badge
                          className={cn(
                            "text-xs",
                            tournee.livreur.estDisponible
                              ? "bg-green-100 text-green-800 border-green-300"
                              : "bg-red-100 text-red-800 border-red-300",
                          )}
                        >
                          {tournee.livreur.estDisponible ? "Disponible" : "Indisponible"}
                        </Badge>
                        <Badge
                          className={cn(
                            "text-xs",
                            tournee.livreur.estActif
                              ? "bg-blue-100 text-blue-800 border-blue-300"
                              : "bg-gray-100 text-gray-800 border-gray-300",
                          )}
                        >
                          {tournee.livreur.estActif ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coordonnées */}
                <div className="bg-card rounded-xl p-6 border shadow-sm">
                  <h3 className="text-lg font-bold mb-4">Coordonnées</h3>
                  <div className="space-y-4">
                    {tournee.livreur.user?.email && (
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <Mail className="size-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-semibold">{tournee.livreur.user.email}</p>
                        </div>
                      </div>
                    )}
                    {tournee.livreur.user?.telephone && (
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <Phone className="size-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Téléphone</p>
                          <p className="font-semibold">{tournee.livreur.user.telephone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Statistiques du livreur */}
                {tournee.livreur.statistiques && (
                  <div className="bg-card rounded-xl p-6 border shadow-sm">
                    <h3 className="text-lg font-bold mb-4">Statistiques</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold text-primary">
                          {tournee.livreur.statistiques.tourneesTerminees || 0}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">Tournées terminées</p>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold text-primary">
                          {tournee.livreur.statistiques.operationsCompletees || 0}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">Opérations complétées</p>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold text-primary">
                          {tournee.livreur.statistiques.tauxReussite
                            ? `${tournee.livreur.statistiques.tauxReussite}%`
                            : "0%"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">Taux de réussite</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="size-16 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Aucun livreur assigné</p>
              </div>
            )}
          </div>
        )

      case "operations":
        return (
          <div className="space-y-4">
            {tournee.operations && tournee.operations.length > 0 ? (
              tournee.operations.map((operation, index) => (
                <div
                  key={operation.id}
                  className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-primary">{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">Opération #{operation.numeroOperation}</h4>
                        <Badge className={cn("text-xs mt-1", typeOperationColors[operation.typeOperation])}>
                          {operation.typeOperation === "collecte" ? "Collecte" : "Livraison"}
                        </Badge>
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        "text-xs",
                        operation.statut === "completee"
                          ? "bg-green-100 text-green-800 border-green-300"
                          : operation.statut === "en_cours"
                            ? "bg-orange-100 text-orange-800 border-orange-300"
                            : "bg-blue-100 text-blue-800 border-blue-300",
                      )}
                    >
                      {operation.statut === "completee"
                        ? "Complétée"
                        : operation.statut === "en_cours"
                          ? "En cours"
                          : "Planifiée"}
                    </Badge>
                  </div>

                  {/* Informations de la commande */}
                  {operation.commande && (
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2 font-semibold">
                        <Package className="size-4 text-primary" />
                        Commande #{operation.commande.numeroCommande}
                      </div>
                      <Separator />
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Client</p>
                          <p className="font-semibold">
                            {operation.commande.client?.user?.prenom || operation.commande.client?.prenom}{" "}
                            {operation.commande.client?.user?.nom || operation.commande.client?.nom}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Téléphone</p>
                          <p className="font-semibold">
                            {operation.commande.client?.user?.telephone ||
                              operation.commande.client?.telephone ||
                              "Non renseigné"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="size-4 text-primary flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <p className="text-muted-foreground text-sm mb-1">
                            {operation.typeOperation === "collecte" ? "Adresse de collecte" : "Adresse de livraison"}
                          </p>
                          <p className="font-medium leading-relaxed">
                            {operation.typeOperation === "collecte"
                              ? operation.commande.adresseCollecte || "Non renseignée"
                              : operation.commande.adresseLivraison || "Non renseignée"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Timeline de l'opération */}
                  {(operation.dateHeureDebut || operation.dateHeureFin) && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-semibold text-muted-foreground mb-3">Timeline</p>
                      <div className="space-y-2 text-sm">
                        {operation.dateHeureDebut && (
                          <div className="flex items-center gap-2">
                            <Play className="size-3.5 text-blue-600" />
                            <span className="text-muted-foreground">Début:</span>
                            <span className="font-semibold">{formatDateTime(operation.dateHeureDebut)}</span>
                          </div>
                        )}
                        {operation.dateHeureFin && (
                          <div className="flex items-center gap-2">
                            <StopCircle className="size-3.5 text-green-600" />
                            <span className="text-muted-foreground">Fin:</span>
                            <span className="font-semibold">{formatDateTime(operation.dateHeureFin)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Package className="size-16 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Aucune opération logistique</p>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] lg:max-w-7xl max-h-[95vh] p-0 gap-0 overflow-hidden">
        {/* En-tête du modal */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-br from-muted/50 to-muted/30">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl font-bold flex items-center gap-3 mb-2">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TruckIcon className="size-6 text-primary" />
                </div>
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent break-words">
                  Tournée {tournee.numeroTournee}
                </span>
              </DialogTitle>
              <p className="text-sm text-muted-foreground ml-13 font-medium">
                Créée le {formatDateTime(tournee.createdAt)}
              </p>
            </div>
            <Badge className={cn("text-sm px-4 py-2 whitespace-nowrap", statutColors[tournee.statut])}>
              {statutLabels[tournee.statut] || tournee.statut}
            </Badge>
          </div>
        </DialogHeader>

        {/* Navigation par étapes */}
        <div className="px-6 py-4 border-b bg-gradient-to-br from-muted/30 to-muted/20">
          <div className="flex items-center justify-between gap-2">
            {wizardSteps.map((step, index) => {
              const StepIcon = step.icon
              const isActive = index === currentStep
              const isCompleted = index < currentStep

              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(index)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200",
                    "hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/30",
                    isActive && "bg-primary/10 scale-105",
                    !isActive && !isCompleted && "opacity-60 hover:opacity-80",
                  )}
                >
                  <div
                    className={cn(
                      "size-11 rounded-full flex items-center justify-center transition-all duration-200",
                      isActive && "bg-primary text-white shadow-lg shadow-primary/40",
                      isCompleted && "bg-green-500 text-white shadow-lg shadow-green-500/40",
                      !isActive && !isCompleted && "bg-muted text-muted-foreground",
                    )}
                  >
                    {isCompleted ? <CheckCircle2 className="size-6" /> : <StepIcon className="size-6" />}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-semibold whitespace-nowrap",
                      isActive && "text-primary",
                      !isActive && "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Contenu scrollable */}
        <ScrollArea className="max-h-[calc(95vh-340px)]">
          <div className="px-6 py-5">{renderStepContent()}</div>
        </ScrollArea>

        {/* Pied de page avec actions */}
        <div className="px-6 py-4 border-t bg-gradient-to-br from-muted/30 to-muted/20">
          <div className="flex items-center justify-between gap-4">
            {/* Navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="lg"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="gap-2 bg-background hover:bg-muted"
              >
                <ChevronLeft className="size-4" />
                Précédent
              </Button>
              <Button
                variant="default"
                size="lg"
                onClick={handleNext}
                disabled={currentStep === wizardSteps.length - 1}
                className="gap-2"
              >
                Suivant
                <ChevronRight className="size-4" />
              </Button>
            </div>

            {/* Actions de la tournée */}
            <div className="flex items-center gap-2">
              {tournee.statut === "planifiee" && onDemarrer && (
                <Button
                  onClick={() => handleAction("demarrer")}
                  disabled={loading}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Play className="size-4" />
                  Démarrer
                </Button>
              )}
              {tournee.statut === "en_cours" && onTerminer && (
                <Button
                  onClick={() => handleAction("terminer")}
                  disabled={loading}
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <CheckCircle2 className="size-4" />
                  Terminer
                </Button>
              )}
              {(tournee.statut === "planifiee" || tournee.statut === "en_cours") && onAnnuler && (
                <Button
                  onClick={() => handleAction("annuler")}
                  disabled={loading}
                  variant="destructive"
                  className="gap-2"
                >
                  <XCircle className="size-4" />
                  Annuler
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
