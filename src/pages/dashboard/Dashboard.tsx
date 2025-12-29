import * as React from "react"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SectionCards } from "@/components/section-cards"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardPage() {
  return (
    <SidebarProvider
      style={
        {
          "--header-height": "3.5rem",
        } as React.CSSProperties
      }
    >
      {/* <AppSidebar className="mt-16" /> */}
      <SidebarInset className="mt-16">
        {/* <SiteHeader /> */}
        <div className="flex flex-1 flex-col gap-4 py-4 lg:gap-6 lg:py-6 @container/main">
          <SectionCards />
          <div className="grid flex-1 gap-4 px-4 lg:gap-6 lg:px-6 @5xl/main:grid-cols-2">
            <ChartAreaInteractive />
            <ChartAreaInteractive />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
