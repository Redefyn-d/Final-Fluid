"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { SidebarNav } from "./sidebar-nav"
import Link from "next/link"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      <SidebarNav />
      <div className="flex-1 ml-[70px]">
        <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-sm shadow-sm">
          <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
            <Link href="/" className="text-2xl font-bold text-primary-800">
              River AI Dashboard
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="hover:bg-primary-50 text-primary-600">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-primary-600 hover:bg-primary-700 text-black">Sign Up</Button>
              </Link>
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}

