"use client"

import { Bell, Search, Settings, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth-context"
import { useNotifications } from "@/hooks/use-notifications"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function AdminTopbar() {
  const { user, logout } = useAuth()
  const { notifications, nonLuesCount, isConnected, markAsRead } = useNotifications()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
    }
  }

  const getUserInitials = () => {
    if (user?.prenom && user?.nom) {
      return `${user.prenom[0]}${user.nom[0]}`.toUpperCase()
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase()
    }
    return "AD"
  }

  const getUserFullName = () => {
    if (user?.prenom && user?.nom) {
      return `${user.prenom} ${user.nom}`
    }
    return user?.email || "Utilisateur"
  }

  const getUserRoles = () => {
    if (user?.roles && user.roles.length > 0) {
      return user.roles.map((role) => role.nom).join(", ")
    }
    return "Aucun rôle"
  }

  const recentNotifications = notifications.filter((n) => n.statut === "non_lue").slice(0, 5)

  const getPriorityBadgeColor = (priorite: string) => {
    switch (priorite) {
      case "critique":
        return "bg-red-600 text-white"
      case "haute":
        return "bg-orange-600 text-white"
      case "normal":
        return "bg-blue-600 text-white"
      default:
        return "bg-gray-600 text-white"
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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="h-8 w-8" />
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher des commandes, clients, services..." className="pl-10 bg-muted/50" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {nonLuesCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                  >
                    {nonLuesCount > 9 ? "9+" : nonLuesCount}
                  </Badge>
                )}
                <div
                  className={cn(
                    "absolute bottom-0 right-0 h-2 w-2 rounded-full border border-background transition-colors",
                    isConnected ? "bg-green-500 animate-pulse" : "bg-red-500",
                  )}
                  title={isConnected ? "Connecté en temps réel" : "Déconnecté du serveur"}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96">
              <div className="flex items-center justify-between px-4 py-3">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <span className={cn("text-xs font-medium", isConnected ? "text-green-600" : "text-red-600")}>
                  {isConnected ? "✓ En direct" : "✗ Hors ligne"}
                </span>
              </div>
              <DropdownMenuSeparator />
              {recentNotifications.length > 0 ? (
                <>
                  {recentNotifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="flex flex-col items-start gap-2 p-3 cursor-pointer hover:bg-accent"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex w-full items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{notification.titre}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1">{notification.message}</div>
                          </div>
                        </div>
                        <Badge className={cn("text-xs", getPriorityBadgeColor(notification.priorite))}>
                          {notification.priorite}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground w-full text-right">
                        {new Date(notification.createdAt).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-center text-sm" asChild>
                    <Link href="/notifications" className="w-full">
                      Voir toutes les notifications
                    </Link>
                  </DropdownMenuItem>
                </>
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">Aucune notification</div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings */}
          {/* <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button> */}

          {/* Menu utilisateur */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/user4.png" />
                  <AvatarFallback className="bg-primary text-primary-foreground">{getUserInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{getUserFullName()}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  <p className="text-xs leading-none text-muted-foreground">{getUserRoles()}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </DropdownMenuItem>
              {/* <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Paramètres</span>
              </DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
