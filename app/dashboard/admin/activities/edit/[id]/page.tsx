import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import ActivityForm from "@/components/admin/activity-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function EditActivityPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin" && profile?.role !== "teacher") {
    redirect("/dashboard")
  }

  // Get activity data
  const { data: activity } = await supabase.from("activities").select("*").eq("id", params.id).single()

  if (!activity) {
    redirect("/dashboard/admin?tab=activities")
  }

  // Get courses for dropdown
  const { data: courses } = await supabase.from("courses").select("id, title").order("title")

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Edit Activity</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/admin?tab=activities">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Activities
          </Link>
        </Button>
      </div>
      <ActivityForm courses={courses || []} activity={activity} />
    </div>
  )
}

