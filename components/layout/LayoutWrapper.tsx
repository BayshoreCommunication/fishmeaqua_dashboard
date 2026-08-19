'use client'

import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import { SidebarProvider, useSidebarContext } from '@/lib/SidebarContext'

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isExpanded } = useSidebarContext()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Fixed positioning */}
      <Sidebar />

      {/* Topbar - Fixed positioning */}
      <Topbar />

      {/* Main content with proper spacing for fixed sidebar and topbar */}
      <main
        className="pt-16 min-h-screen transition-all duration-300"
        style={{ paddingLeft: isExpanded ? '256px' : '80px' }}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  )
}
