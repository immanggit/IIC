"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, CheckSquare, BookMarked, Home, UserIcon, BarChart, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"

export default function StickyHeader() {
  const [prevScrollPos, setPrevScrollPos] = useState(0)
  const [visible, setVisible] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push("/")
  }

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY

      // Make the navbar visible when scrolling up or at the top
      setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10)

      setPrevScrollPos(currentScrollPos)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [prevScrollPos])

  // Fetch user role
  useEffect(() => {
    async function fetchUserRole() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { data, error } = await supabase.from("profiles").select("role").eq("id", user.id).single()

        if (error) throw error
        setUserRole(data?.role || null)
      } catch (error) {
        console.error("Error fetching user role:", error)
      }
    }

    fetchUserRole()
  }, [supabase])

  const isAdmin = userRole === "admin" || userRole === "teacher"

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-background border-b transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="container px-6 md:px-8 flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-2xl font-bold text-primary">
            KidsEnglish
          </Link>
        </div>
        <nav className="hidden md:flex gap-6">
          <Link
            href="/dashboard"
            className={`font-medium ${pathname === "/dashboard" ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
          >
            <div className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </div>
          </Link>
          <Link
            href="/dashboard/courses"
            className={`font-medium ${pathname.startsWith("/dashboard/courses") ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
          >
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>Courses</span>
            </div>
          </Link>
          <Link
            href="/dashboard/vocabulary"
            className={`font-medium ${pathname.startsWith("/dashboard/vocabulary") ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
          >
            <div className="flex items-center gap-1">
              <BookMarked className="h-4 w-4" />
              <span>Vocabulary</span>
            </div>
          </Link>
          <Link
            href="/dashboard/progress"
            className={`font-medium ${pathname.startsWith("/dashboard/progress") ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
          >
            <div className="flex items-center gap-1">
              <BarChart className="h-4 w-4" />
              <span>Progress</span>
            </div>
          </Link>
          {isAdmin && (
            <Link
              href="/dashboard/admin"
              className={`font-medium ${pathname.startsWith("/dashboard/admin") ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
            >
              <div className="flex items-center gap-1">
                <ShieldCheck className="h-4 w-4" />
                <span>Admin</span>
              </div>
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full cursor-pointer">
                <UserIcon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/dashboard/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/dashboard/my-courses">My Courses</Link>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/dashboard/admin">Admin Dashboard</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

