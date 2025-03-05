"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Factory, Mail, Bell, Droplets } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/" },
  { title: "Manage Industries", icon: Factory, href: "/manage-industries" },
  { title: "Manage Emails", icon: Mail, href: "/emails" },
  { title: "Manage Notifications", icon: Bell, href: "/notifications" },
]

export function SidebarNav() {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseEnter = () => setIsExpanded(true)
    const handleMouseLeave = () => setIsExpanded(false)

    const sidebar = sidebarRef.current
    if (sidebar) {
      sidebar.addEventListener("mouseenter", handleMouseEnter)
      sidebar.addEventListener("mouseleave", handleMouseLeave)
    }

    return () => {
      if (sidebar) {
        sidebar.removeEventListener("mouseenter", handleMouseEnter)
        sidebar.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [])

  return (
    <motion.div
      ref={sidebarRef}
      className="fixed h-screen bg-[#1a3c61] text-white overflow-hidden z-50"
      animate={{ width: isExpanded ? 280 : 70 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center px-6 mb-4">
        <Link href="/" className="flex items-center gap-3">
          <Droplets className="h-7 w-7 shrink-0" />
          <motion.span
            className="font-bold text-lg origin-left"
            animate={{ opacity: isExpanded ? 1 : 0, scale: isExpanded ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            River AI
          </motion.span>
        </Link>
      </div>

      {/* Menu Items */}
      <div className="py-4 px-3 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 transition-all rounded-lg group relative",
                isActive ? "bg-white/15 text-white" : "hover:bg-white/10",
                !isExpanded && "justify-center px-2",
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <motion.span
                className="truncate font-medium origin-left"
                animate={{ opacity: isExpanded ? 1 : 0, scale: isExpanded ? 1 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {item.title}
              </motion.span>
              {!isExpanded && (
                <div className="absolute left-14 rounded-md px-2 py-1 bg-gray-900 text-white text-sm invisible opacity-0 -translate-x-3 group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                  {item.title}
                </div>
              )}
            </Link>
          )
        })}
      </div>
    </motion.div>
  )
}

