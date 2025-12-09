import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminTopbar } from "@/components/admin-topbar"
import { DashboardStats } from "@/components/dashboard-stats"
import { RecentOrders } from "@/components/recent-orders"
import { RevenueChart } from "@/components/revenue-chart"
import { TopClients } from "@/components/top-clients"
import { DeliveryPerformance } from "@/components/delivery-performance"
import { ServicesChart } from "@/components/services-chart"
import { StatusDistributionChart } from "@/components/status-distribution-chart"
import { SidebarInset } from "@/components/ui/sidebar"
import { Sparkles } from "lucide-react"

export default function DashboardPage() {
  return (
    <>
      <AdminSidebar />
      <SidebarInset>
        <AdminTopbar />
        <main className="flex-1 space-y-6 p-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg shadow-blue-600/20">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-balance bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Tableau de bord
                  </h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Vue d'ensemble de votre activité EREYA PRESSING
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-green-700">En direct</span>
            </div>
          </div>

          <DashboardStats />

          {/* <div className="grid gap-6">
            <RevenueChart />
          </div> */}

          <div className="grid gap-6 lg:grid-cols-2">
            <ServicesChart />
            <StatusDistributionChart />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <TopClients />
            <DeliveryPerformance />
          </div>

          <div className="grid gap-6">
            <RecentOrders />
          </div>
        </main>
      </SidebarInset>
    </>
  )
}
