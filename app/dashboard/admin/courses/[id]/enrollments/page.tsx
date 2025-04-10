import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import ExportEnrollmentsPDFButton from "@/components/admin/export-enrollments-pdf"

export default async function CourseEnrollmentsPage({ params }: { params: { id: string } }) {
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

  // Get course data
  const { data: course } = await supabase.from("courses").select("*").eq("id", params.id).single()

  if (!course) {
    redirect("/dashboard/admin?tab=courses")
  }

  // Get enrollments
  const { data: enrollments } = await supabase
    .from("user_courses")
    .select(`
      id,
      user_id,
      progress,
      score,
      created_at,
      updated_at,
      profiles (
        full_name,
        email
      )
    `)
    .eq("course_id", params.id)
    .order("created_at", { ascending: false })

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/admin?tab=courses">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Course Enrollments</h1>
        </div>
        <ExportEnrollmentsPDFButton courseData={course} enrollmentsData={enrollments || []} />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{course.title}</CardTitle>
          <CardDescription>
            Level: {course.level} | Status: {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{enrollments?.length || 0} students enrolled</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enrolled Students</CardTitle>
          <CardDescription>Students enrolled in this course and their progress</CardDescription>
        </CardHeader>
        <CardContent>
          {enrollments && enrollments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Student</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Progress</th>
                    <th className="text-left py-3 px-4">Score</th>
                    <th className="text-left py-3 px-4">Enrolled On</th>
                    <th className="text-left py-3 px-4">Last Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <Link
                          href={`/dashboard/admin/students/${enrollment.user_id}`}
                          className="font-medium hover:underline"
                        >
                          {enrollment.profiles?.full_name || "Unknown"}
                        </Link>
                      </td>
                      <td className="py-3 px-4">{enrollment.profiles?.email || "Unknown"}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 w-32">
                          <div className="flex justify-between text-xs">
                            <span>{enrollment.progress}%</span>
                          </div>
                          <Progress value={enrollment.progress} className="h-2" />
                        </div>
                      </td>
                      <td className="py-3 px-4">{enrollment.score}/5</td>
                      <td className="py-3 px-4">{new Date(enrollment.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{new Date(enrollment.updated_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No students enrolled in this course yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

