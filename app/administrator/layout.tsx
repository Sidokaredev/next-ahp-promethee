import AdministratorNavigation from "@/components/navigations/administrator-navigation"
import React from "react"

export default function AdministratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full">
      <AdministratorNavigation />
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  )
}