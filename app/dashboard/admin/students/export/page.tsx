import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Download, FileSpreadsheet, FileIcon as FilePdf } from "lucide-react"

export default async function StudentsExportPage() {
  const supabase = createClient()

  // Get current user
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    redirect("/login")
  }

  // Check if current user is admin
  const { data: currentProfile } = await supabase.from("profiles").select("role").eq("id", currentUser.id).single()

  if (currentProfile?.role !== "admin" && currentProfile?.role !== "teacher") {
    redirect("/dashboard")
  }

  // Fetch students (users with role 'user')
  const { data: students } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      email,
      created_at,
      learning_streak,
      last_active
    `)
    .eq("role", "user")
    .order("created_at", { ascending: false })

  // Get user progress data for students
  const studentIds = students?.map((student) => student.id) || []
  const { data: userProgress } = await supabase
    .from("user_progress")
    .select("user_id, completed")
    .in("user_id", studentIds.length > 0 ? studentIds : ["no-students"])

  // Calculate progress for each student
  const studentProgress = studentIds.map((id) => {
    const studentActivities = userProgress?.filter((p) => p.user_id === id) || []
    const completedActivities = studentActivities.filter((p) => p.completed).length
    const progressPercentage =
      studentActivities.length > 0 ? Math.round((completedActivities / studentActivities.length) * 100) : 0
    return {
      id,
      totalActivities: studentActivities.length,
      completedActivities,
      progressPercentage,
    }
  })

  // Format students data
  const formattedStudents =
    students?.map((student) => {
      const progress = studentProgress.find((p) => p.id === student.id)
      return {
        id: student.id || "",
        name: student.full_name || "",
        email: student.email || "",
        progress: progress?.progressPercentage || 0,
        activitiesCompleted: progress?.completedActivities || 0,
        streak: student.learning_streak || 0,
        lastActive: student.last_active ? new Date(student.last_active).toLocaleDateString() : "Never",
        createdAt: student.created_at ? new Date(student.created_at).toLocaleDateString() : "",
      }
    }) || []

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link href="/dashboard/admin?tab=students">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Students
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Export Student Data</h1>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
          <CardDescription>Choose a format to export student data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="border rounded-lg p-6 flex flex-col items-center text-center">
              <FileSpreadsheet className="h-16 w-16 text-green-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Excel Spreadsheet</h3>
              <p className="text-muted-foreground mb-4">
                Export student data as an Excel spreadsheet. Includes all student information and progress data.
              </p>
              <Button className="bg-green-600 hover:bg-green-700">
                <Download className="h-4 w-4 mr-2" />
                Export as Excel
              </Button>
            </div>

            <div className="border rounded-lg p-6 flex flex-col items-center text-center">
              <FilePdf className="h-16 w-16 text-red-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">PDF Report</h3>
              <p className="text-muted-foreground mb-4">
                Export student data as a PDF report. Includes summary statistics and individual student progress.
              </p>
              <Button className="bg-red-600 hover:bg-red-700">
                <Download className="h-4 w-4 mr-2" />
                Export as PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student Data Preview</CardTitle>
          <CardDescription>Preview of the data that will be exported</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-2 text-left">Name</th>
                  <th className="border p-2 text-left">Email</th>
                  <th className="border p-2 text-left">Progress</th>
                  <th className="border p-2 text-left">Activities Completed</th>
                  <th className="border p-2 text-left">Streak</th>
                  <th className="border p-2 text-left">Last Active</th>
                  <th className="border p-2 text-left">Joined</th>
                </tr>
              </thead>
              <tbody>
                {formattedStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-muted/50">
                    <td className="border p-2">{student.name}</td>
                    <td className="border p-2">{student.email}</td>
                    <td className="border p-2">{student.progress}%</td>
                    <td className="border p-2">{student.activitiesCompleted}</td>
                    <td className="border p-2">{student.streak} days</td>
                    <td className="border p-2">{student.lastActive}</td>
                    <td className="border p-2">{student.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

