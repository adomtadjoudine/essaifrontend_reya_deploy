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
import type { Tournee } from "@/lib/api/types/tournee"
import { cn } from "@/lib/utils"

interface TourneeModalProps {
  tournee?: Tournee | null
  onSave: (data: any) => void
  trigger?: React.ReactNode
  livreurs?: Array<{ id: number; nom: string; prenom: string }>
}

export function TourneeModal({ tournee, onSave, trigger, livreurs = [] }: TourneeModalProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    dateTournee: new Date(),
    statut: "planifiee",
    livreurId: "",
  })

  useEffect(() => {
    if (tournee) {
      setFormData({
        dateTournee: tournee.dateTournee ? new Date(tournee.dateTournee) : new Date(),
        statut: tournee.statut || "planifiee",
        livreurId: tournee.livreurId?.toString() || "",
      })
    } else {
      setFormData({
        dateTournee: new Date(),
        statut: "planifiee",
        livreurId: "",
      })
    }
  }, [tournee, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const submitData = {
      dateTournee: formData.dateTournee.toISOString(),
      statut: formData.statut,
      livreurId: Number(formData.livreurId),
    }

    onSave(submitData)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle tournée
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{tournee ? "Modifier la tournée" : "Créer une nouvelle tournée"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dateTournee">Date de la tournée *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.dateTournee && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dateTournee ? (
                    format(formData.dateTournee, "PPP", { locale: fr })
                  ) : (
                    <span>Sélectionner une date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.dateTournee}
                  onSelect={(date) => date && setFormData((prev) => ({ ...prev, dateTournee: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="livreurId">Livreur *</Label>
            <Select
              value={formData.livreurId}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, livreurId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un livreur" />
              </SelectTrigger>
              <SelectContent>
                {livreurs.map((livreur) => (
                  <SelectItem key={livreur.id} value={livreur.id.toString()}>
                    {livreur.prenom} {livreur.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                <SelectItem value="terminee">Terminée</SelectItem>
                <SelectItem value="annulee">Annulée</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit">{tournee ? "Mettre à jour" : "Créer la tournée"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
