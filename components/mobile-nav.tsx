"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import { Menu, X, Home, BookOpen, BookMarked, BarChart, ShieldCheck, User, LogOut, Wand2 } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useToast } from "@/components/ui/use-toast"

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchUserRole() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        // Try to get role from user metadata first (if it exists)
        if (user.user_metadata && user.user_metadata.role) {
          setUserRole(user.user_metadata.role)
          return
        }

        // Try a different approach - use a service role API endpoint
        // For now, use a fallback based on email domain
        if (user.email) {
          if (user.email.endsWith("@admin.com")) {
            setUserRole("admin")
          } else if (user.email.endsWith("@teacher.com")) {
            setUserRole("teacher")
          } else {
            // Default to student role
            setUserRole("student")
          }
        }
      } catch (error) {
        console.error("Error in fetchUserRole:", error)
        // Default to student role on error
        setUserRole("student")
      }
    }

    fetchUserRole()
  }, [supabase])

  const isAdmin = userRole === "admin" || userRole === "teacher"

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account",
      })
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Error signing out",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      {/* Mobile floating menu */}
      <div className="md:hidden">
        <Button
          ref={buttonRef}
          variant="ghost"
          size="icon"
          className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>

        {isOpen && (
          <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm">
            <div ref={menuRef} className="fixed bottom-20 right-4 z-50 w-64 rounded-lg border bg-card p-4 shadow-lg">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="dashboard" className="border-none">
                  <Link
                    href="/dashboard"
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                      pathname === "/dashboard" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                  >
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </AccordionItem>

                <AccordionItem value="courses" className="border-none">
                  <AccordionTrigger className="py-2 px-3 hover:bg-muted rounded-md">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <BookOpen className="h-4 w-4" />
                      <span>Courses</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pl-8">
                    <Link
                      href="/dashboard/courses"
                      className={`block py-2 text-sm ${
                        pathname === "/dashboard/courses" ? "text-primary font-medium" : "text-muted-foreground"
                      }`}
                    >
                      All Courses
                    </Link>
                    <Link
                      href="/dashboard/my-courses"
                      className={`block py-2 text-sm ${
                        pathname === "/dashboard/my-courses" ? "text-primary font-medium" : "text-muted-foreground"
                      }`}
                    >
                      My Courses
                    </Link>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="vocabulary" className="border-none">
                  <AccordionTrigger className="py-2 px-3 hover:bg-muted rounded-md">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <BookMarked className="h-4 w-4" />
                      <span>Vocabulary</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pl-8">
                    <Link
                      href="/dashboard/vocabulary"
                      className={`block py-2 text-sm ${
                        pathname === "/dashboard/vocabulary" ? "text-primary font-medium" : "text-muted-foreground"
                      }`}
                    >
                      Browse Vocabulary
                    </Link>
                    <Link
                      href="/dashboard/vocabulary/flashcards"
                      className={`block py-2 text-sm ${
                        pathname === "/dashboard/vocabulary/flashcards"
                          ? "text-primary font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      Flashcards
                    </Link>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="progress" className="border-none">
                  <Link
                    href="/dashboard/progress"
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                      pathname.startsWith("/dashboard/progress")
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <BarChart className="h-4 w-4" />
                    <span>Progress</span>
                  </Link>
                </AccordionItem>

                <AccordionItem value="tools" className="border-none">
                  <Link
                    href="/dashboard/tools"
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                      pathname.startsWith("/dashboard/tools") ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                  >
                    <Wand2 className="h-4 w-4" />
                    <span>Tools</span>
                  </Link>
                </AccordionItem>

                <AccordionItem value="profile" className="border-none">
                  <Link
                    href="/dashboard/profile"
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                      pathname.startsWith("/dashboard/profile")
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </AccordionItem>

                {isAdmin && (
                  <AccordionItem value="admin" className="border-none">
                    <Link
                      href="/dashboard/admin"
                      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                        pathname.startsWith("/dashboard/admin")
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span>Admin</span>
                    </Link>
                  </AccordionItem>
                )}
              </Accordion>

              <div className="mt-2 pt-2 border-t">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

