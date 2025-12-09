"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import type { OperationLogistique } from "@/lib/api/types/operation-logistique"
import { cn } from "@/lib/utils"

interface OperationLogistiqueModalProps {
  operation?: OperationLogistique | null
  onSave: (data: any) => void
  trigger?: React.ReactNode
  tournees?: Array<{ id: number; dateTournee: string; livreur?: { nom: string; prenom: string } }>
  commandes?: Array<{ id: number; numeroCommande: string }>
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function OperationLogistiqueModal({
  operation,
  onSave,
  trigger,
  tournees = [],
  commandes = [],
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: OperationLogistiqueModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [formData, setFormData] = useState({
    type: "collecte",
    datePrevue: new Date(),
    dateReelle: null as Date | null,
    statut: "planifiee",
    tourneeId: "",
    commandeId: "",
  })

  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = externalOnOpenChange || setInternalOpen

  useEffect(() => {
    console.log("[v0] Modal opened, commandes available:", commandes.length)
    console.log("[v0] Modal opened, tournees available:", tournees.length)
    if (operation) {
      setFormData({
        type: operation.type || "collecte",
        datePrevue: operation.datePrevue ? new Date(operation.datePrevue) : new Date(),
        dateReelle: operation.dateReelle ? new Date(operation.dateReelle) : null,
        statut: operation.statut || "planifiee",
        tourneeId: operation.tourneeId?.toString() || "",
        commandeId: operation.commandeId?.toString() || "",
      })
    } else {
      setFormData({
        type: "collecte",
        datePrevue: new Date(),
        dateReelle: null,
        statut: "planifiee",
        tourneeId: "",
        commandeId: "",
      })
    }
  }, [operation, open, commandes.length, tournees.length])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const submitData = {
      type: formData.type,
      datePrevue: formData.datePrevue.toISOString(),
      dateReelle: formData.dateReelle?.toISOString(),
      statut: formData.statut,
      tourneeId: Number(formData.tourneeId),
      commandeId: Number(formData.commandeId),
    }

    onSave(submitData)
    setOpen(false)
  }

  const shouldRenderTrigger = trigger !== undefined && externalOpen === undefined

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {shouldRenderTrigger && (
        <DialogTrigger asChild>
          {trigger || (
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle opération
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {operation ? "Modifier l'opération logistique" : "Créer une nouvelle opération logistique"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type d'opération *</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="collecte">Collecte</SelectItem>
                <SelectItem value="livraison">Livraison</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="stockage">Stockage</SelectItem>
                <SelectItem value="controle_qualite">Contrôle qualité</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="commandeId">Commande *</Label>
            <Select
              value={formData.commandeId}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, commandeId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une commande" />
              </SelectTrigger>
              <SelectContent>
                {commandes.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">Aucune commande disponible</div>
                ) : (
                  commandes.map((commande) => (
                    <SelectItem key={commande.id} value={commande.id.toString()}>
                      {commande.numeroCommande}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tourneeId">Tournée *</Label>
            <Select
              value={formData.tourneeId}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, tourneeId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une tournée" />
              </SelectTrigger>
              <SelectContent>
                {tournees.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">Aucune tournée disponible</div>
                ) : (
                  tournees.map((tournee) => (
                    <SelectItem key={tournee.id} value={tournee.id.toString()}>
                      {format(new Date(tournee.dateTournee), "PPP", { locale: fr })}
                      {tournee.livreur && ` - ${tournee.livreur.prenom} ${tournee.livreur.nom}`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="datePrevue">Date prévue *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.datePrevue && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.datePrevue ? (
                    format(formData.datePrevue, "PPP", { locale: fr })
                  ) : (
                    <span>Sélectionner une date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.datePrevue}
                  onSelect={(date) => date && setFormData((prev) => ({ ...prev, datePrevue: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateReelle">Date réelle</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.dateReelle && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dateReelle ? (
                    format(formData.dateReelle, "PPP", { locale: fr })
                  ) : (
                    <span>Sélectionner une date (optionnel)</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.dateReelle || undefined}
                  onSelect={(date) => setFormData((prev) => ({ ...prev, dateReelle: date || null }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="statut">Statut</Label>
            <Select
              value={formData.statut}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, statut: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planifiee">Planifiée</SelectItem>
                <SelectItem value="en_cours">En cours</SelectItem>
                <SelectItem value="realisee">Réalisée</SelectItem>
                <SelectItem value="annulee">Annulée</SelectItem>
                <SelectItem value="en_retard">En retard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit">{operation ? "Mettre à jour" : "Créer l'opération"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
