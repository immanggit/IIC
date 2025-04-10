import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ActivityForm from "@/components/admin/activity-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function NewActivityPage({
  searchParams,
}: {
  searchParams: { courseId?: string }
}) {
  const supabase = createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Check if user is admin or teacher
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin" && profile?.role !== "teacher") {
    redirect("/dashboard")
  }

  // Fetch courses for the form
  const { data: courses } = await supabase.from("courses").select("id, title").order("title", { ascending: true })

  // Get the next order_index for the selected course
  let nextOrderIndex = 1
  if (searchParams.courseId) {
    const { data: activities, error } = await supabase
      .from("activities")
      .select("order_index")
      .eq("course_id", searchParams.courseId)
      .order("order_index", { ascending: false })
      .limit(1)

    if (!error && activities && activities.length > 0) {
      nextOrderIndex = (activities[0].order_index || 0) + 1
    }
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Create New Activity</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/admin?tab=activities">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Activities
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Activity Details</CardTitle>
          <CardDescription>Fill in the details to create a new activity</CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityForm
            courses={courses || []}
            initialCourseId={searchParams.courseId}
            initialOrderIndex={nextOrderIndex}
          />
        </CardContent>
      </Card>
    </div>
  )
}

