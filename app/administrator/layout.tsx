import AdministratorNavigation from "@/components/navigations/administrator-navigation"
import React from "react"

export default function AdministratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full bg-[#ebeefb]">
      <AdministratorNavigation />
      <div className="max-w-7xl min-h-screen mx-auto">
        {children}
      </div>
    </div>
  )
}