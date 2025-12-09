"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  CalendarIcon,
  ClockIcon,
  CreditCardIcon,
  PackageIcon,
  TruckIcon,
  UserIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  DollarSignIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  InfoIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import type { Commande } from "@/lib/api/types/commande"
import { cn } from "@/lib/utils"

interface CommandeDetailModalProps {
  commande: Commande | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Couleurs des badges selon le statut
 */
const statutColors: Record<string, string> = {
  attente: "bg-yellow-100 text-yellow-800 border-yellow-300",
  collecte: "bg-blue-100 text-blue-800 border-blue-300",
  cours: "bg-purple-100 text-purple-800 border-purple-300",
  traitement: "bg-purple-100 text-purple-800 border-purple-300",
  pret: "bg-green-100 text-green-800 border-green-300",
  livre: "bg-gray-100 text-gray-800 border-gray-300",
  annule: "bg-red-100 text-red-800 border-red-300",
}

/**
 * Couleurs des badges selon le statut de paiement
 */
const paiementStatutColors: Record<string, string> = {
  en_attente: "bg-yellow-100 text-yellow-800 border-yellow-300",
  paye: "bg-green-100 text-green-800 border-green-300",
  echoue: "bg-red-100 text-red-800 border-red-300",
  rembourse: "bg-gray-100 text-gray-800 border-gray-300",
}

/**
 * Labels des méthodes de paiement
 */
const paiementMethodeLabels: Record<string, string> = {
  carte: "Carte bancaire",
  especes: "Espèces",
  virement: "Virement",
  cheque: "Chèque",
  mobile: "Paiement mobile",
}

/**
 * Étapes du wizard de visualisation
 */
const wizardSteps = [
  { id: "client", label: "Client", icon: UserIcon },
  { id: "articles", label: "Articles", icon: PackageIcon },
  { id: "livraison", label: "Livraison", icon: TruckIcon },
  { id: "paiement", label: "Paiement", icon: CreditCardIcon },
  { id: "historique", label: "Historique", icon: ClockIcon },
]

/**
 * Modal de détails d'une commande
 * Affiche toutes les informations d'une commande de manière professionnelle
 * avec une navigation par étapes (wizard)
 */
export function CommandeDetailModal({ commande, open, onOpenChange }: CommandeDetailModalProps) {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    if (commande) {
      setCurrentStep(0)
    }
  }, [commande]) // Updated to use the entire commande object as a dependency

  if (!commande) return null

  /**
   * Formate un statut pour l'affichage
   */
  const formatStatut = (statut: string) => {
    return statut
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  /**
   * Retourne la couleur du badge selon le nom du statut
   */
  const getStatutColor = (statutNom: string) => {
    const nom = statutNom.toLowerCase()
    for (const [key, color] of Object.entries(statutColors)) {
      if (nom.includes(key)) return color
    }
    return "bg-gray-100 text-gray-800 border-gray-300"
  }

  /**
   * Formate une date
   */
  const formatDate = (date: string | undefined | null) => {
    if (!date) return "Non définie"
    try {
      const parsedDate = new Date(date)
      if (isNaN(parsedDate.getTime())) return "Date invalide"
      return format(parsedDate, "dd MMMM yyyy", { locale: fr })
    } catch {
      return "Date invalide"
    }
  }

  /**
   * Formate une date avec l'heure
   */
  const formatDateTime = (date: string | undefined | null) => {
    if (!date) return "Non définie"
    try {
      const parsedDate = new Date(date)
      if (isNaN(parsedDate.getTime())) return "Date invalide"
      return format(parsedDate, "dd MMM yyyy 'à' HH:mm", { locale: fr })
    } catch {
      return "Date invalide"
    }
  }

  /**
   * Formate un montant en FCFA
   */
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  /**
   * Récupère le statut actuel de la commande
   */
  const getCurrentStatut = () => {
    if (!commande.statuts || commande.statuts.length === 0) {
      return { nom: "En attente", description: null }
    }
    const statutsTries = [...commande.statuts].sort((a, b) => {
      const dateA = new Date(a.pivot?.createdAt || 0).getTime()
      const dateB = new Date(b.pivot?.createdAt || 0).getTime()
      return dateB - dateA
    })
    return statutsTries[0]
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

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setCurrentStep(0)
    }
    onOpenChange(newOpen)
  }

  /**
   * Rendu du contenu selon l'étape active
   */
  const renderStepContent = () => {
    switch (wizardSteps[currentStep].id) {
      case "client":
        return (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Nom complet */}
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-5 border border-primary/20">
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <UserIcon className="size-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Nom complet</p>
                    <p className="text-lg font-bold text-foreground break-words">
                      {(() => {
                        const prenom = commande.client?.user?.prenom || commande.client?.prenom || ""
                        const nom = commande.client?.user?.nom || commande.client?.nom || ""
                        const fullName = commande.client?.user?.fullName || ""

                        if (prenom && nom) {
                          return `${prenom} ${nom}`
                        } else if (fullName) {
                          return fullName
                        } else if (prenom || nom) {
                          return prenom || nom
                        } else {
                          return "Non renseigné"
                        }
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-lg p-5 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <MailIcon className="size-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Adresse email</p>
                    <p className="text-base font-semibold text-foreground break-all">
                      {commande.client?.user?.email || commande.client?.email || "Non renseigné"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Téléphone */}
            {(commande.client?.telephone || commande.client?.user?.telephone) && (
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 rounded-lg p-5 border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <PhoneIcon className="size-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Numéro de téléphone</p>
                    <p className="text-lg font-bold text-foreground">
                      {commande.client?.telephone || commande.client?.user?.telephone}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Adresses */}
            {(commande.adresseCollecte || commande.adresseLivraison) && (
              <div className="grid lg:grid-cols-2 gap-4">
                {commande.adresseCollecte && (
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30 rounded-lg p-5 border border-orange-200 dark:border-orange-800">
                    <div className="flex items-start gap-3">
                      <div className="size-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                        <MapPinIcon className="size-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Adresse de collecte</p>
                        <p className="text-base font-semibold text-foreground leading-relaxed break-words">
                          {commande.adresseCollecte}
                        </p>
                        {commande.distanceCollecte && (
                          <div className="mt-2 inline-flex items-center gap-1.5 bg-orange-500/10 rounded-full px-3 py-1">
                            <div className="size-1.5 rounded-full bg-orange-600" />
                            <span className="text-xs font-medium text-orange-900 dark:text-orange-100">
                              Distance: {commande.distanceCollecte.toFixed(2)} km
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {commande.adresseLivraison && (
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 rounded-lg p-5 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-start gap-3">
                      <div className="size-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <MapPinIcon className="size-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Adresse de livraison</p>
                        <p className="text-base font-semibold text-foreground leading-relaxed break-words">
                          {commande.adresseLivraison}
                        </p>
                        {commande.distanceLivraison && (
                          <div className="mt-2 inline-flex items-center gap-1.5 bg-purple-500/10 rounded-full px-3 py-1">
                            <div className="size-1.5 rounded-full bg-purple-600" />
                            <span className="text-xs font-medium text-purple-900 dark:text-purple-100">
                              Distance: {commande.distanceLivraison.toFixed(2)} km
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            {(commande.noteClient || commande.noteInterne) && (
              <div className="space-y-3">
                {commande.noteClient && (
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <div className="size-9 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <InfoIcon className="size-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-blue-900 dark:text-blue-100 mb-1 uppercase">
                          Note du client
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed break-words">
                          {commande.noteClient}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {commande.noteInterne && (
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/30 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-3">
                      <div className="size-9 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                        <AlertCircleIcon className="size-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-amber-900 dark:text-amber-100 mb-1 uppercase">
                          Note interne
                        </p>
                        <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed break-words">
                          {commande.noteInterne}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )

      case "articles":
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 rounded-lg p-5 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <PackageIcon className="size-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Articles commandés</h3>
                  <p className="text-sm text-muted-foreground">
                    {commande.lignesCommande?.length || 0} article(s) dans cette commande
                  </p>
                </div>
              </div>
            </div>

            {commande.lignesCommande && commande.lignesCommande.length > 0 ? (
              <div className="space-y-4">
                {commande.lignesCommande.map((ligne, index) => (
                  <div key={ligne.id} className="bg-card rounded-lg p-5 border shadow-sm">
                    <div className="flex items-start gap-3 mb-4">
                      <span className="size-8 rounded-full bg-purple-500/10 flex items-center justify-center text-sm font-bold text-purple-600">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-bold text-foreground break-words">
                          {ligne.service?.nom || "Service inconnu"}
                        </h4>
                        {ligne.service?.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{ligne.service.description}</p>
                        )}
                      </div>
                    </div>

                    <Separator className="my-3" />

                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <p className="text-xs text-muted-foreground font-medium uppercase mb-1">Quantité</p>
                        <p className="text-2xl font-bold text-purple-600">{ligne.quantite}</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <p className="text-xs text-muted-foreground font-medium uppercase mb-1">Prix unitaire</p>
                        <p className="text-base font-bold text-foreground">{formatCurrency(ligne.prixUnitaire)}</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 rounded-lg p-3 text-center border border-purple-200 dark:border-purple-800">
                        <p className="text-xs text-muted-foreground font-medium uppercase mb-1">Sous-total</p>
                        <p className="text-base font-bold text-purple-600">{formatCurrency(ligne.montantLigne)}</p>
                      </div>
                    </div>

                    {(ligne.typeLinge || ligne.temperature || ligne.optionTraitement) && (
                      <div className="mt-4 space-y-2">
                        <p className="text-xs font-bold text-muted-foreground uppercase mb-3">Options sélectionnées</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {/* Type de linge */}
                          {ligne.typeLinge && (
                            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase mb-1">
                                Type de linge
                              </p>
                              <p className="text-sm font-medium text-foreground">{ligne.typeLinge.nom}</p>
                              {ligne.prixSupplementaireTypeLinge && ligne.prixSupplementaireTypeLinge > 0 && (
                                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-1">
                                  +{formatCurrency(ligne.prixSupplementaireTypeLinge)}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Température */}
                          {ligne.temperature && (
                            <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
                              <p className="text-xs font-semibold text-orange-700 dark:text-orange-300 uppercase mb-1">
                                Température
                              </p>
                              <p className="text-sm font-medium text-foreground">{ligne.temperature.valeur}</p>
                              {ligne.prixSupplementaireTemperature && ligne.prixSupplementaireTemperature > 0 && (
                                <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold mt-1">
                                  +{formatCurrency(ligne.prixSupplementaireTemperature)}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Option de traitement */}
                          {ligne.optionTraitement && (
                            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                              <p className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase mb-1">
                                Option traitement
                              </p>
                              <p className="text-sm font-medium text-foreground">{ligne.optionTraitement.nom}</p>
                              {ligne.prixSupplementaireOptions && ligne.prixSupplementaireOptions > 0 && (
                                <p className="text-xs text-green-600 dark:text-green-400 font-semibold mt-1">
                                  +{formatCurrency(ligne.prixSupplementaireOptions)}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-5 border border-primary/20 space-y-2">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm text-muted-foreground font-medium">Sous-total</span>
                    <span className="text-base font-bold text-foreground">{formatCurrency(commande.sousTotal)}</span>
                  </div>

                  {commande.fraisCollecte !== null && commande.fraisCollecte > 0 && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-muted-foreground font-medium">Frais de collecte</span>
                      <span className="text-base font-bold text-foreground">
                        {formatCurrency(commande.fraisCollecte)}
                      </span>
                    </div>
                  )}

                  {commande.fraisLivraison !== null && commande.fraisLivraison > 0 && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-muted-foreground font-medium">Frais de livraison</span>
                      <span className="text-base font-bold text-foreground">
                        {formatCurrency(commande.fraisLivraison)}
                      </span>
                    </div>
                  )}

                  {commande.montantRemise !== null && commande.montantRemise > 0 && (
                    <div className="flex items-center justify-between py-1 text-green-600">
                      <span className="text-sm font-medium">Remise</span>
                      <span className="text-base font-bold">-{formatCurrency(commande.montantRemise)}</span>
                    </div>
                  )}

                  <Separator className="my-2" />

                  <div className="flex items-center justify-between py-2 bg-primary/10 rounded-lg px-3">
                    <span className="text-lg font-bold text-foreground">Total</span>
                    <span className="text-2xl font-bold text-primary">{formatCurrency(commande.montantTotal)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border-2 border-dashed">
                <PackageIcon className="size-12 mx-auto mb-3 opacity-20" />
                <p className="text-base font-medium">Aucun article dans cette commande</p>
              </div>
            )}
          </div>
        )

      case "livraison":
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-lg p-5 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <TruckIcon className="size-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Informations de livraison</h3>
                  <p className="text-sm text-muted-foreground">Délai et créneaux de collecte/livraison</p>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              {/* Délai de livraison */}
              {commande.delaiLivraison && (
                <div className="bg-card rounded-lg p-5 border">
                  <div className="flex items-start gap-3">
                    <div className="size-11 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <ClockIcon className="size-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Délai de livraison</p>
                      <p className="text-xl font-bold text-foreground mb-2 break-words">
                        {commande.delaiLivraison.nom}
                      </p>
                      {commande.delaiLivraison.delaiHeures && (
                        <div className="inline-flex items-center gap-2 bg-blue-500/10 rounded-full px-3 py-1.5 border border-blue-500/20">
                          <ClockIcon className="size-4 text-blue-600" />
                          <span className="text-sm font-bold text-blue-600">
                            {commande.delaiLivraison.delaiHeures} heures
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {commande.heureCollecteChoisie ? (
                <div className="bg-card rounded-lg p-5 border">
                  <div className="flex items-start gap-3">
                    <div className="size-11 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                      <CalendarIcon className="size-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                        Date et heure de collecte
                      </p>
                      <p className="text-xl font-bold text-foreground mb-2">
                        {formatDateTime(commande.heureCollecteChoisie)}
                      </p>
                      <div className="inline-flex items-center gap-2 bg-orange-500/10 rounded-full px-3 py-1.5 border border-orange-500/20">
                        <CalendarIcon className="size-4 text-orange-600" />
                        <span className="text-sm font-bold text-orange-600">
                          {formatDate(commande.heureCollecteChoisie)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : commande.creneauCollecte ? (
                <div className="bg-card rounded-lg p-5 border">
                  <div className="flex items-start gap-3">
                    <div className="size-11 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                      <CalendarIcon className="size-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Créneau de collecte</p>
                      <p className="text-xl font-bold text-foreground mb-2 break-words">
                        {commande.creneauCollecte.nom}
                      </p>
                      {commande.creneauCollecte.heureDebut && commande.creneauCollecte.heureFin && (
                        <p className="text-sm text-muted-foreground font-medium">
                          De {commande.creneauCollecte.heureDebut} à {commande.creneauCollecte.heureFin}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Commande urgente */}
            {commande.estUrgent && (
              <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30 rounded-lg p-5 border border-red-300 dark:border-red-800">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <AlertCircleIcon className="size-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-red-900 dark:text-red-100">Commande urgente</p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Cette commande nécessite un traitement prioritaire
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case "paiement":
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 rounded-lg p-5 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CreditCardIcon className="size-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Informations de paiement</h3>
                  <p className="text-sm text-muted-foreground">
                    {commande.paiements?.length || 0} paiement(s) enregistré(s)
                  </p>
                </div>
              </div>
            </div>

            {/* Résumé du paiement */}
            <div className="bg-card rounded-lg p-5 border">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center bg-muted/50 rounded-lg p-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Montant total</p>
                  <p className="text-xl font-bold text-foreground">{formatCurrency(commande.montantTotal)}</p>
                </div>
                <div className="text-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 rounded-lg p-3 border border-green-200 dark:border-green-800">
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Montant payé</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(commande.montantPaye)}</p>
                </div>
                <div className="text-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-800 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Montant restant</p>
                  <p className="text-xl font-bold text-orange-600">{formatCurrency(commande.montantRestant)}</p>
                </div>
              </div>

              <Separator className="my-3" />

              <div className="flex items-center justify-center py-2">
                {commande.estPayeCompletement ? (
                  <Badge className="bg-green-100 text-green-800 border-green-300 text-sm px-4 py-1.5">
                    <CheckCircle2Icon className="size-4 mr-2" />
                    Payé intégralement
                  </Badge>
                ) : (
                  <Badge className="bg-orange-100 text-orange-800 border-orange-300 text-sm px-4 py-1.5">
                    <AlertCircleIcon className="size-4 mr-2" />
                    Paiement partiel
                  </Badge>
                )}
              </div>
            </div>

            {/* Liste des paiements */}
            {commande.paiements && commande.paiements.length > 0 ? (
              <div className="space-y-3">
                {commande.paiements.map((paiement, index) => (
                  <div key={paiement.id} className="bg-card rounded-lg p-4 border">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="size-8 rounded-full bg-green-500/10 flex items-center justify-center text-sm font-bold text-green-600">
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase">Méthode de paiement</p>
                          <p className="text-base font-bold text-foreground">
                            {paiementMethodeLabels[paiement.methode] || paiement.methode}
                          </p>
                        </div>
                      </div>
                      <Badge className={cn("text-xs px-2 py-1", paiementStatutColors[paiement.statut])}>
                        {formatStatut(paiement.statut)}
                      </Badge>
                    </div>

                    <Separator className="my-3" />

                    <div className="grid lg:grid-cols-2 gap-3 mb-3">
                      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 rounded-lg p-3 border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2">
                          <DollarSignIcon className="size-5 text-green-600" />
                          <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase">Montant</p>
                            <p className="text-lg font-bold text-green-600">{formatCurrency(paiement.montant)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 border">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="size-5 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase">Date de paiement</p>
                            <p className="text-sm font-bold text-foreground">{formatDateTime(paiement.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {paiement.numeroTransaction && (
                      <div className="bg-muted/30 rounded-lg p-3 border">
                        <p className="text-xs text-muted-foreground font-medium uppercase mb-1">
                          Numéro de transaction
                        </p>
                        <p className="font-mono text-sm font-bold text-foreground break-all">
                          {paiement.numeroTransaction}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border-2 border-dashed">
                <CreditCardIcon className="size-12 mx-auto mb-3 opacity-20" />
                <p className="text-base font-medium">Aucun paiement enregistré</p>
              </div>
            )}
          </div>
        )

      case "historique":
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/30 rounded-lg p-5 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <ClockIcon className="size-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Historique de la commande</h3>
                  <p className="text-sm text-muted-foreground">Suivi des statuts et dates importantes</p>
                </div>
              </div>
            </div>

            {/* Informations générales */}
            <div className="bg-card rounded-lg p-5 border">
              <div className="grid lg:grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground font-medium uppercase mb-1">Numéro de commande</p>
                  <p className="text-lg font-bold text-foreground break-words">
                    {commande.numeroCommande || `#${commande.id}`}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground font-medium uppercase mb-1">Date de commande</p>
                  <p className="text-lg font-bold text-foreground">{formatDate(commande.dateCommande)}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground font-medium uppercase mb-1">Date de création</p>
                  <p className="text-sm font-semibold text-foreground">{formatDateTime(commande.createdAt)}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground font-medium uppercase mb-1">Dernière mise à jour</p>
                  <p className="text-sm font-semibold text-foreground">{formatDateTime(commande.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* Historique des statuts */}
            {commande.statuts && commande.statuts.length > 0 ? (
              <div className="bg-card rounded-lg p-5 border">
                <h4 className="font-bold text-base mb-4 flex items-center gap-2">
                  <ClockIcon className="size-4 text-primary" />
                  Historique des statuts ({commande.statuts.length})
                </h4>
                <div className="space-y-3">
                  {[...commande.statuts]
                    .sort((a, b) => {
                      // Essayer toutes les variations possibles du nom de champ
                      const dateAStr =
                        a.pivot?.createdAt ||
                        a.pivot?.created_at ||
                        a.pivot?.dateChangement ||
                        a.pivot?.date_changement ||
                        (a as any).createdAt ||
                        (a as any).created_at ||
                        (a as any).dateChangement ||
                        (a as any).date_changement

                      const dateBStr =
                        b.pivot?.createdAt ||
                        b.pivot?.created_at ||
                        b.pivot?.dateChangement ||
                        b.pivot?.date_changement ||
                        (b as any).createdAt ||
                        (b as any).created_at ||
                        (b as any).dateChangement ||
                        (b as any).date_changement

                      const dateA = dateAStr ? new Date(dateAStr).getTime() : 0
                      const dateB = dateBStr ? new Date(dateBStr).getTime() : 0
                      return dateB - dateA
                    })
                    .map((statut, index, sortedArray) => {
                      const isLast = index === 0

                      // Essayer toutes les variations possibles du nom de champ pour la date
                      const dateChangement =
                        statut.pivot?.createdAt ||
                        statut.pivot?.created_at ||
                        statut.pivot?.dateChangement ||
                        statut.pivot?.date_changement ||
                        (statut as any).createdAt ||
                        (statut as any).created_at ||
                        (statut as any).dateChangement ||
                        (statut as any).date_changement ||
                        null

                      // Validation et formatage de la date
                      let dateFormatee = "Date non disponible"
                      if (dateChangement) {
                        try {
                          const parsedDate = new Date(dateChangement)
                          if (!isNaN(parsedDate.getTime())) {
                            dateFormatee = formatDateTime(dateChangement)
                          }
                        } catch {
                          // Date invalide
                        }
                      }

                      const estNotifie =
                        statut.pivot?.estNotifie !== undefined
                          ? statut.pivot.estNotifie
                          : statut.pivot?.est_notifie || false

                      return (
                        <div key={`${statut.id}-${index}`} className="relative">
                          {index < sortedArray.length - 1 && (
                            <div
                              className="absolute left-4 top-10 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 to-border"
                              aria-hidden="true"
                            />
                          )}
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                "size-8 rounded-full flex items-center justify-center flex-shrink-0 z-10",
                                isLast
                                  ? "bg-primary text-white ring-4 ring-primary/20"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              {isLast ? (
                                <CheckCircle2Icon className="size-4" />
                              ) : (
                                <span className="text-xs font-bold">{sortedArray.length - index}</span>
                              )}
                            </div>
                            <div className="flex-1 pb-4 bg-muted/30 rounded-lg p-3 border">
                              <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
                                <Badge className={cn("text-xs px-2 py-1", getStatutColor(statut.nom))}>
                                  {statut.nom}
                                  {isLast && <span className="ml-1">(Actuel)</span>}
                                </Badge>
                                {estNotifie && (
                                  <Badge variant="outline" className="text-xs">
                                    Client notifié
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground font-medium">{dateFormatee}</p>
                              {statut.description && (
                                <p className="text-xs text-muted-foreground mt-1 leading-relaxed break-words">
                                  {statut.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-lg p-5 border">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <CheckCircle2Icon className="size-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground font-medium uppercase mb-1">Statut actuel</p>
                    <Badge className={cn("text-sm px-3 py-1.5", getStatutColor(getCurrentStatut().nom))}>
                      {getCurrentStatut().nom}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  const currentStatut = getCurrentStatut()

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[95vw] lg:max-w-7xl max-h-[95vh] p-0 gap-0 overflow-hidden">
        {/* En-tête du modal */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-br from-muted/50 to-muted/30">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl font-bold flex items-center gap-3 mb-2">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <PackageIcon className="size-6 text-primary" />
                </div>
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent break-words">
                  Commande {commande.numeroCommande || `#${commande.id}`}
                </span>
              </DialogTitle>
              <p className="text-sm text-muted-foreground ml-13 font-medium">
                Créée le {formatDateTime(commande.createdAt)}
              </p>
            </div>
            <Badge className={cn("text-sm px-4 py-2 whitespace-nowrap", getStatutColor(currentStatut.nom))}>
              {currentStatut.nom}
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
                    {isCompleted ? <CheckCircle2Icon className="size-6" /> : <StepIcon className="size-6" />}
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
        <ScrollArea className="max-h-[calc(95vh-280px)]">
          <div className="px-6 py-5">{renderStepContent()}</div>
        </ScrollArea>

        {/* Pied de page avec navigation */}
        <div className="px-6 py-4 border-t bg-gradient-to-br from-muted/30 to-muted/20 flex items-center justify-between gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="gap-2 bg-background hover:bg-muted"
          >
            <ChevronLeftIcon className="size-4" />
            Précédent
          </Button>

          <div className="text-sm text-muted-foreground font-bold">
            Étape {currentStep + 1} sur {wizardSteps.length}
          </div>

          <Button
            variant="default"
            size="lg"
            onClick={handleNext}
            disabled={currentStep === wizardSteps.length - 1}
            className="gap-2"
          >
            Suivant
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
