/**
 * Page de gestion des notifications
 * Affiche l'historique complet des notifications avec filtres et pagination
 */

"use client"

import { useEffect, useState } from "react"
import { AdminTopbar } from "@/components/admin-topbar"
import { useNotifications } from "@/hooks/use-notifications"
import { notificationService } from "@/lib/api/services/notification.service"
import type { Notification } from "@/lib/api/types/notification"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Bell, Trash2, Check, X, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export default function NotificationsPage() {
  const { notifications, nonLuesCount, isLoading, refetch, markAsRead, markAsUnread, markAsDeleted } =
    useNotifications()

  // États des filtres
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [statut, setStatut] = useState<string>("all")
  const [type, setType] = useState<string>("all")
  const [priorite, setPriorite] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  // États pour le chargement
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])
  const [selectedNotifications, setSelectedNotifications] = useState<Set<number>>(new Set())
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  useEffect(() => {
    const loadFilteredNotifications = async () => {
      try {
        setIsLoadingMore(true)
        const response = await notificationService.searchNotifications(page, limit, {
          statut: statut !== "all" ? statut : undefined,
          type: type !== "all" ? type : undefined,
          priorite: priorite !== "all" ? priorite : undefined,
        })

        if (response.success && Array.isArray(response.data)) {
          let filtered = response.data

          // Filtrer par terme de recherche
          if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(
              (n) => n.titre.toLowerCase().includes(term) || n.message.toLowerCase().includes(term),
            )
          }

          setFilteredNotifications(filtered)
        }
      } catch (error) {
        console.error("[v0] Erreur lors du chargement des notifications:", error)
      } finally {
        setIsLoadingMore(false)
      }
    }

    loadFilteredNotifications()
  }, [page, limit, statut, type, priorite, searchTerm, refetch])

  const toggleNotificationSelection = (id: number) => {
    const newSelected = new Set(selectedNotifications)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedNotifications(newSelected)
  }

  const toggleAllSelection = () => {
    if (selectedNotifications.size === filteredNotifications.length) {
      setSelectedNotifications(new Set())
    } else {
      setSelectedNotifications(new Set(filteredNotifications.map((n) => n.id)))
    }
  }

  const markSelectedAsRead = async () => {
    if (selectedNotifications.size === 0) return

    try {
      const ids = Array.from(selectedNotifications)
      for (const id of ids) {
        await markAsRead(id)
      }
      setSelectedNotifications(new Set())
      await refetch()
    } catch (error) {
      console.error("[v0] Erreur lors du marquage en masse:", error)
    }
  }

  const deleteSelectedNotifications = async () => {
    if (selectedNotifications.size === 0) return

    try {
      const ids = Array.from(selectedNotifications)
      for (const id of ids) {
        await markAsDeleted(id)
      }
      setSelectedNotifications(new Set())
      await refetch()
    } catch (error) {
      console.error("[v0] Erreur lors de la suppression:", error)
    }
  }

  const getStatusBadgeColor = (statut: string) => {
    switch (statut) {
      case "non_lue":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "lue":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      case "supprimee":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "Commande":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "Paiement":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "Service":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "Promotion":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityBadgeColor = (priorite: string) => {
    switch (priorite) {
      case "critique":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "haute":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "normal":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "basse":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "Commande":
        return "📦"
      case "Paiement":
        return "💳"
      case "Service":
        return "🔧"
      case "Promotion":
        return "🎁"
      default:
        return "📢"
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <AdminTopbar />

      <main className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                  <Bell className="h-8 w-8" />
                  Notifications
                </h1>
                <p className="text-muted-foreground mt-1">Gérez et consultez l'historique de vos notifications</p>
              </div>
              <div className="flex items-center gap-4">
                <Card className="p-4">
                  <div className="text-sm text-muted-foreground">Non lues</div>
                  <div className="text-2xl font-bold text-primary">{nonLuesCount}</div>
                </Card>
              </div>
            </div>
          </div>

          <Card className="p-4">
            <div className="space-y-4">
              {selectedNotifications.size > 0 && (
                <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                  <span className="text-sm font-medium">
                    {selectedNotifications.size} notification(s) sélectionnée(s)
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={markSelectedAsRead}>
                      <Check className="h-4 w-4 mr-1" />
                      Marquer comme lue
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Supprimer
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer {selectedNotifications.size} notification(s) ? Cette action
                          ne peut pas être annulée.
                        </AlertDialogDescription>
                        <div className="flex gap-2 justify-end">
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={deleteSelectedNotifications} className="bg-destructive">
                            Supprimer
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-4">
                <Input
                  placeholder="Rechercher dans les notifications..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setPage(1)
                  }}
                  className="flex-1"
                />

                <div className="grid grid-cols-4 gap-3">
                  <Select
                    value={statut}
                    onValueChange={(value) => {
                      setStatut(value)
                      setPage(1)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="non_lue">Non lue</SelectItem>
                      <SelectItem value="lue">Lue</SelectItem>
                      <SelectItem value="supprimee">Supprimée</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={type}
                    onValueChange={(value) => {
                      setType(value)
                      setPage(1)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="Commande">Commande</SelectItem>
                      <SelectItem value="Paiement">Paiement</SelectItem>
                      <SelectItem value="Service">Service</SelectItem>
                      <SelectItem value="Promotion">Promotion</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={priorite}
                    onValueChange={(value) => {
                      setPriorite(value)
                      setPage(1)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Priorité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les priorités</SelectItem>
                      <SelectItem value="basse">Basse</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="haute">Haute</SelectItem>
                      <SelectItem value="critique">Critique</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={limit.toString()}
                    onValueChange={(value) => {
                      setLimit(Number.parseInt(value))
                      setPage(1)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Par page" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 par page</SelectItem>
                      <SelectItem value="20">20 par page</SelectItem>
                      <SelectItem value="50">50 par page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <ScrollArea className="h-[600px]">
              {isLoading || isLoadingMore ? (
                <div className="p-8 text-center text-muted-foreground">Chargement des notifications...</div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">Aucune notification trouvée</div>
              ) : (
                <div className="divide-y">
                  <div className="flex items-center gap-3 p-4 bg-muted/50 sticky top-0 z-10">
                    <input
                      type="checkbox"
                      checked={
                        selectedNotifications.size === filteredNotifications.length && filteredNotifications.length > 0
                      }
                      onChange={toggleAllSelection}
                      className="w-4 h-4 rounded"
                    />
                    <div className="flex-1 grid grid-cols-12 gap-4">
                      <div className="col-span-4 text-sm font-medium">Titre</div>
                      <div className="col-span-2 text-sm font-medium">Type</div>
                      <div className="col-span-2 text-sm font-medium">Priorité</div>
                      <div className="col-span-2 text-sm font-medium">Statut</div>
                      <div className="col-span-2 text-sm font-medium">Date</div>
                    </div>
                    <div className="w-16 text-sm font-medium text-right">Actions</div>
                  </div>

                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer",
                        notification.statut === "non_lue" && "bg-blue-50 dark:bg-blue-950/30",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selectedNotifications.has(notification.id)}
                        onChange={() => toggleNotificationSelection(notification.id)}
                        className="w-4 h-4 rounded"
                      />
                      <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-4 flex items-center gap-2">
                          <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                          <div>
                            <div className="font-medium text-sm">{notification.titre}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1">{notification.message}</div>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <Badge className={cn("text-xs", getTypeBadgeColor(notification.type))}>
                            {notification.type}
                          </Badge>
                        </div>
                        <div className="col-span-2">
                          <Badge className={cn("text-xs", getPriorityBadgeColor(notification.priorite))}>
                            {notification.priorite}
                          </Badge>
                        </div>
                        <div className="col-span-2">
                          <Badge className={cn("text-xs", getStatusBadgeColor(notification.statut))}>
                            {notification.statut === "non_lue"
                              ? "Non lue"
                              : notification.statut === "lue"
                                ? "Lue"
                                : "Supprimée"}
                          </Badge>
                        </div>
                        <div className="col-span-2 text-xs text-muted-foreground text-right">
                          {new Date(notification.createdAt).toLocaleDateString("fr-FR", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>

                      <div className="flex gap-1">
                        {notification.statut === "non_lue" ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(notification.id)}
                            title="Marquer comme lue"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsUnread(notification.id)}
                            title="Marquer comme non lue"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => markAsDeleted(notification.id)}
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>

          {filteredNotifications.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {page} • {filteredNotifications.length} résultat(s)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={filteredNotifications.length < limit}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
