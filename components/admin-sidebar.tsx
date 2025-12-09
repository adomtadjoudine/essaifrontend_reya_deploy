"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Users,
  Settings,
  Tag,
  UserCheck,
  ChevronRight,
  MapPin,
  PackageCheck,
  ImageIcon,
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const menuItems = [
  {
    title: "Tableau de bord",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Commandes",
    url: "/orders",
    icon: ShoppingCart,
    submenu: [
      { title: "Toutes les commandes", url: "/orders" },
      { title: "Paiements", url: "/orders/payments" },
      // { title: "Preuves", url: "/orders/proofs" },
    ],
  },
  {
    title: "Services",
    url: "/services",
    icon: Package,
    submenu: [
      { title: "Tous les services", url: "/services" },
      { title: "Options Service", url: "/services/options" },
      { title: "Services archivés", url: "/services/archived" },
      { title: "paramètre livraison", url: "/parametres-livraison" },
    ],
  },
  {
    title: "Logistique",
    url: "/logistics",
    icon: Truck,
    submenu: [
      { title: "Tournées", url: "/logistics/tours", icon: MapPin },
      // { title: "Opérations", url: "/logistics/operations", icon: PackageCheck },
      // { title: "Preuves", url: "/logistics/proofs", icon: ImageIcon },
    ],
  },
  // {
  //   title: "Opérations Logistiques",
  //   url: "/deliveries",
  //   icon: Truck,
  //   submenu: [
  //     { title: "Tournées actives", url: "/deliveries" },
  //     { title: "Livreurs", url: "/deliveries/drivers" },
  //     { title: "Suivi en temps réel", url: "/deliveries/tracking" },
  //   ],
  // },
  {
    title: "Clients",
    url: "/customers",
    icon: Users,
    submenu: [
      { title: "Tous les clients", url: "/customers" },
      // { title: "Programme fidélité", url: "/customers/loyalty" },
      // { title: "Parrainages", url: "/customers/referrals" },
      // { title: "Adresses", url: "/customers/addresses" },
      // { title: "Chats", url: "/customers/chats" },
    ],
  },
  {
    title: "Marketing",
    url: "/marketing",
    icon: Tag,
    submenu: [
      { title: "Promotions", url: "/marketing/promotions" },
      // { title: "Campagnes", url: "/marketing/campaigns" },
      // { title: "Notifications", url: "/marketing/notifications" },
    ],
  },
  // {
  //   title: "Analyses",
  //   url: "/analytics",
  //   icon: BarChart3,
  //   submenu: [
  //     { title: "Chiffre d'affaires", url: "/analytics/revenue" },
  //     { title: "Performance", url: "/analytics/performance" },
  //     { title: "Rapports", url: "/analytics/reports" },
  //   ],
  // },
  {
    title: "Utilisateurs",
    url: "/users",
    icon: UserCheck,
    submenu: [
      { title: "Tous les utilisateurs", url: "/users" },
      // { title: "Rôles & Permissions", url: "/users/roles" },
      // { title: "Administrateurs", url: "/users/admins" },
      { title: "Livreurs", url: "/users/livreurs", icon: Truck },
    ],
  },
  // {
  //   title: "Paramètres",
  //   url: "/settings",
  //   icon: Settings,
  //   submenu: [
  //     { title: "Général", url: "/settings" },
  //     { title: "RGPD", url: "/settings/gdpr" },
  //     { title: "Intégrations", url: "/settings/integrations" },
  //   ],
  // },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState<string[]>([])

  useEffect(() => {
    const activeParentMenus = menuItems
      .filter((item) => {
        if (!item.submenu) return false
        // Check if any submenu item matches the current pathname
        return item.submenu.some((subItem) => pathname === subItem.url || pathname.startsWith(subItem.url))
      })
      .map((item) => item.title)

    if (activeParentMenus.length > 0) {
      setOpenMenus((prev) => {
        // Merge with existing open menus and remove duplicates
        const newOpenMenus = [...new Set([...prev, ...activeParentMenus])]
        return newOpenMenus
      })
    }
  }, [pathname])

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => (prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]))
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <img src="/images/ereya-logo.png" alt="EREYA PRESSING" className="h-8 w-8 object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">EREYA PRESSING</span>
            <span className="text-xs text-muted-foreground">Admin Dashboard</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              {item.submenu ? (
                <Collapsible open={openMenus.includes(item.title)} onOpenChange={() => toggleMenu(item.title)}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className={cn(
                        "w-full justify-between",
                        pathname.startsWith(item.url) && "bg-sidebar-accent text-sidebar-accent-foreground",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </div>
                      <ChevronRight
                        className={cn("h-4 w-4 transition-transform", openMenus.includes(item.title) && "rotate-90")}
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.submenu.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.url}>
                          <SidebarMenuSubButton
                            asChild
                            className={cn(
                              pathname === subItem.url && "bg-sidebar-primary text-sidebar-primary-foreground",
                            )}
                          >
                            <Link href={subItem.url}>
                              <div className="flex items-center gap-3">
                                {subItem.icon && <subItem.icon className="h-4 w-4" />}
                                <span>{subItem.title}</span>
                              </div>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <SidebarMenuButton
                  asChild
                  className={cn(pathname === item.url && "bg-sidebar-primary text-sidebar-primary-foreground")}
                >
                  <Link href={item.url}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      {/* <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/admin-avatar.png" />
            <AvatarFallback className="bg-primary text-primary-foreground">AD</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-sidebar-foreground">Admin</span>
            <span className="text-xs text-muted-foreground">admin@ereya.com</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          <span>Déconnexion</span>
        </Button>
      </SidebarFooter> */}

      {/* <SidebarRail /> */}
    </Sidebar>
  )
}
