"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BookOpen, BarChart2, User, LogOut, BookText, ShieldCheck, Wand2 } from "lucide-react"

interface DashboardNavProps {
  userRole?: string
}

export function DashboardNav({ userRole }: DashboardNavProps) {
  const pathname = usePathname() || ""
  const isAdmin = userRole === "admin" || userRole === "teacher"

  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <BookOpen className="h-5 w-5" />,
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard/courses",
      label: "Courses",
      icon: <BookText className="h-5 w-5" />,
      active: pathname === "/dashboard/courses" || (pathname && pathname.startsWith("/dashboard/courses/")),
    },
    {
      href: "/dashboard/vocabulary",
      label: "Vocabulary",
      icon: <BookOpen className="h-5 w-5" />,
      active: pathname === "/dashboard/vocabulary" || (pathname && pathname.startsWith("/dashboard/vocabulary/")),
    },
    {
      href: "/dashboard/progress",
      label: "Progress",
      icon: <BarChart2 className="h-5 w-5" />,
      active: pathname === "/dashboard/progress" || (pathname && pathname.startsWith("/dashboard/progress/")),
    },
    {
      href: "/dashboard/tools",
      label: "Tools",
      icon: <Wand2 className="h-5 w-5" />,
      active: pathname === "/dashboard/tools" || (pathname && pathname.startsWith("/dashboard/tools/")),
    },
    {
      href: "/dashboard/profile",
      label: "Profile",
      icon: <User className="h-5 w-5" />,
      active: pathname === "/dashboard/profile",
    },
  ]

  // Add admin route if user is admin or teacher
  if (isAdmin) {
    routes.push({
      href: "/dashboard/admin",
      label: "Admin",
      icon: <ShieldCheck className="h-5 w-5" />,
      active: pathname === "/dashboard/admin" || (pathname && pathname.startsWith("/dashboard/admin/")),
    })
  }

  return (
    <nav className="flex flex-col gap-2 p-4">
      {routes.map((route) => (
        <Button
          key={route.href}
          variant={route.active ? "default" : "ghost"}
          className={cn("justify-start", route.active ? "bg-primary" : "")}
          asChild
        >
          <Link href={route.href}>
            {route.icon}
            <span className="ml-2">{route.label}</span>
          </Link>
        </Button>
      ))}
      <form action="/auth/sign-out" method="post" className="mt-auto">
        <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
          <LogOut className="h-5 w-5 mr-2" />
          Logout
        </Button>
      </form>
    </nav>
  )
}

