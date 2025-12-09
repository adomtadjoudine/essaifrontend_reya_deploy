/**
 * Modal de détails d'un paiement
 * Affiche toutes les informations d'un paiement de manière professionnelle
 */

"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card } from "@/components/ui/card"
import { CreditCard, Calendar, DollarSign, FileText, Package, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import type { Paiement } from "@/lib/api/types/paiement"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface PaiementDetailModalProps {
  paiement: Paiement | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onValider?: (id: number) => void
  onRejeter?: (id: number) => void
  onRembourser?: (id: number) => void
}

/**
 * Formate une date au format français
 */
const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "dd MMMM yyyy 'à' HH:mm", { locale: fr })
  } catch {
    return dateString
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
 * Retourne la couleur du badge selon le statut
 */
const getStatutColor = (statut: string) => {
  switch (statut.toLowerCase()) {
    case "valide":
      return "bg-green-100 text-green-800 hover:bg-green-200"
    case "en_attente":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
    case "echoue":
      return "bg-red-100 text-red-800 hover:bg-red-200"
    case "annule":
      return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    default:
      return "bg-blue-100 text-blue-800 hover:bg-blue-200"
  }
}

/**
 * Retourne le libellé du statut
 */
const getStatutLabel = (statut: string) => {
  switch (statut.toLowerCase()) {
    case "valide":
      return "Validé"
    case "en_attente":
      return "En attente"
    case "echoue":
      return "Échoué"
    case "annule":
      return "Annulé"
    default:
      return statut
  }
}

/**
 * Retourne le libellé de la méthode de paiement
 */
const getMethodeLabel = (methode: string) => {
  switch (methode.toLowerCase()) {
    case "especes":
      return "Espèces"
    case "mobile_money":
      return "Mobile Money"
    case "carte_bancaire":
      return "Carte bancaire"
    case "virement":
      return "Virement bancaire"
    case "cheque":
      return "Chèque"
    default:
      return methode
  }
}

export function PaiementDetailModal({
  paiement,
  open,
  onOpenChange,
  onValider,
  onRejeter,
  onRembourser,
}: PaiementDetailModalProps) {
  if (!paiement) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-6xl !max-h-[90vh] w-[95vw] p-0 overflow-hidden flex flex-col">
        {/* En-tête */}
        <DialogHeader className="space-y-4 px-8 pt-8 pb-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-teal-100 rounded-lg">
                  <CreditCard className="h-7 w-7 text-teal-600" />
                </div>
                <div>
                  <DialogTitle className="text-3xl font-bold text-balance">
                    Paiement {paiement.numeroPaiement}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground mt-2">Créé le {formatDate(paiement.createdAt)}</p>
                </div>
              </div>
            </div>
            <Badge className={`${getStatutColor(paiement.statut)} px-4 py-2 text-base`}>
              {getStatutLabel(paiement.statut)}
            </Badge>
          </div>
        </DialogHeader>

        <Separator />

        {/* Contenu principal avec scroll */}
        <div className="flex-1 overflow-y-auto space-y-8 py-8 px-8">
          {/* Informations principales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Montant */}
            <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-5">
                <div className="p-4 bg-green-100 rounded-full flex-shrink-0">
                  <DollarSign className="h-7 w-7 text-green-600" />
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-xs font-semibold tracking-widest text-green-900 uppercase">Montant</p>
                  <p className="text-4xl font-bold text-green-700">{formatCurrency(paiement.montant)}</p>
                </div>
              </div>
            </Card>

            {/* Méthode de paiement */}
            <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-5">
                <div className="p-4 bg-blue-100 rounded-full flex-shrink-0">
                  <CreditCard className="h-7 w-7 text-blue-600" />
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-xs font-semibold tracking-widest text-blue-900 uppercase">Méthode de paiement</p>
                  <p className="text-2xl font-semibold text-blue-700">{getMethodeLabel(paiement.methode)}</p>
                  {paiement.reference && <p className="text-sm text-blue-600 pt-1">Réf: {paiement.reference}</p>}
                </div>
              </div>
            </Card>
          </div>

          {/* Date du paiement */}
          <Card className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-5">
              <div className="p-4 bg-purple-100 rounded-full flex-shrink-0">
                <Calendar className="h-7 w-7 text-purple-600" />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-xs font-semibold tracking-widest text-purple-900 uppercase">Date du paiement</p>
                <p className="text-2xl font-semibold text-purple-700">{formatDate(paiement.datePaiement)}</p>
              </div>
            </div>
          </Card>

          {/* Informations de la commande */}
          {paiement.commande && (
            <Card className="p-8 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-5">
                <div className="p-4 bg-orange-100 rounded-full flex-shrink-0">
                  <Package className="h-7 w-7 text-orange-600" />
                </div>
                <div className="flex-1 space-y-4">
                  <p className="text-xs font-semibold tracking-widest text-orange-900 uppercase">Commande associée</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-white bg-opacity-60 p-4 rounded-lg">
                      <span className="text-sm font-medium text-orange-700">Numéro de commande</span>
                      <span className="font-bold text-orange-900 text-base">
                        {paiement.commande.numeroCommande || `#${paiement.commande.id}`}
                      </span>
                    </div>
                    {paiement.commande.client && (
                      <div className="flex items-center justify-between bg-white bg-opacity-60 p-4 rounded-lg">
                        <span className="text-sm font-medium text-orange-700">Client</span>
                        <div className="text-right">
                          {paiement.commande.client.user ? (
                            <>
                              <p className="font-semibold text-orange-900">
                                {paiement.commande.client.user.prenom} {paiement.commande.client.user.nom}
                              </p>
                              {paiement.commande.client.user.email && (
                                <p className="text-xs text-orange-600 mt-1">{paiement.commande.client.user.email}</p>
                              )}
                              {paiement.commande.client.user.telephone && (
                                <p className="text-xs text-orange-600">{paiement.commande.client.user.telephone}</p>
                              )}
                              <p className="text-xs text-orange-500 mt-1">
                                Code: {paiement.commande.client.codeClient}
                              </p>
                            </>
                          ) : (
                            <p className="font-semibold text-orange-900">Client non disponible</p>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between bg-white bg-opacity-60 p-4 rounded-lg">
                      <span className="text-sm font-medium text-orange-700">Montant total</span>
                      <span className="font-bold text-orange-900 text-base">
                        {formatCurrency(paiement.commande.montantTotal)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-white bg-opacity-60 p-4 rounded-lg">
                      <span className="text-sm font-medium text-orange-700">Montant payé</span>
                      <span className="font-bold text-orange-900 text-base">
                        {formatCurrency(paiement.commande.montantPaye)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-white bg-opacity-60 p-4 rounded-lg">
                      <span className="text-sm font-medium text-orange-700">Montant restant</span>
                      <span className="font-bold text-orange-900 text-base">
                        {formatCurrency(paiement.commande.montantRestant)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Informations de remboursement */}
          {paiement.estRembourse && (
            <Card className="p-8 bg-gradient-to-br from-red-50 to-rose-50 border-red-200 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-5">
                <div className="p-4 bg-red-100 rounded-full flex-shrink-0">
                  <RefreshCw className="h-7 w-7 text-red-600" />
                </div>
                <div className="flex-1 space-y-4">
                  <p className="text-xs font-semibold tracking-widest text-red-900 uppercase">Remboursement</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-white bg-opacity-60 p-4 rounded-lg">
                      <span className="text-sm font-medium text-red-700">Montant remboursé</span>
                      <span className="font-bold text-red-900 text-base">
                        {formatCurrency(paiement.montantRembourse || 0)}
                      </span>
                    </div>
                    {paiement.dateRemboursement && (
                      <div className="flex items-center justify-between bg-white bg-opacity-60 p-4 rounded-lg">
                        <span className="text-sm font-medium text-red-700">Date de remboursement</span>
                        <span className="font-semibold text-red-900">{formatDate(paiement.dateRemboursement)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Informations d'audit */}
          <Card className="p-8 bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-5">
              <div className="p-4 bg-gray-100 rounded-full flex-shrink-0">
                <FileText className="h-7 w-7 text-gray-600" />
              </div>
              <div className="flex-1 space-y-4">
                <p className="text-xs font-semibold tracking-widest text-gray-900 uppercase">Informations d'audit</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paiement.createdBy && (
                    <div className="bg-white bg-opacity-60 p-4 rounded-lg">
                      <p className="text-xs text-gray-600 font-medium">Créé par</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{paiement.createdBy}</p>
                    </div>
                  )}
                  {paiement.updatedBy && (
                    <div className="bg-white bg-opacity-60 p-4 rounded-lg">
                      <p className="text-xs text-gray-600 font-medium">Modifié par</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{paiement.updatedBy}</p>
                    </div>
                  )}
                  <div className="bg-white bg-opacity-60 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 font-medium">Date de création</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{formatDate(paiement.createdAt)}</p>
                  </div>
                  <div className="bg-white bg-opacity-60 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 font-medium">Dernière modification</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{formatDate(paiement.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-8 py-6">
          {paiement.statut === "en_attente" && onValider && (
            <Button onClick={() => onValider(paiement.id)} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="mr-2 h-4 w-4" />
              Valider
            </Button>
          )}
          {paiement.statut === "en_attente" && onRejeter && (
            <Button onClick={() => onRejeter(paiement.id)} variant="destructive">
              <XCircle className="mr-2 h-4 w-4" />
              Rejeter
            </Button>
          )}
          {paiement.statut === "valide" && !paiement.estRembourse && onRembourser && (
            <Button onClick={() => onRembourser(paiement.id)} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Rembourser
            </Button>
          )}
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
