// 'use client';
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="auth-container h-screen flex justify-center items-center
    bg-[url(/backgrounds/bg-1.svg)] bg-cover"
    >
      {children}
    </div>
  )
}