"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Download, Printer, Loader2 } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

export default function StudentExportPage() {
  const params = useParams()
  const router = useRouter()
  const [student, setStudent] = useState<any>(null)
  const [userProgress, setUserProgress] = useState<any[]>([])
  const [userCourses, setUserCourses] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        // Get current user
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser()

        if (!currentUser) {
          router.push("/login")
          return
        }

        // Check if current user is admin
        const { data: currentProfile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", currentUser.id)
          .single()

        if (currentProfile?.role !== "admin" && currentProfile?.role !== "teacher") {
          router.push("/dashboard")
          return
        }

        // Get student data
        const { data: studentData, error: studentError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", params.id)
          .single()

        if (studentError || !studentData) {
          setError("Student not found")
          return
        }

        setStudent(studentData)

        // Fetch user progress data
        const { data: progressData } = await supabase
          .from("user_progress")
          .select("*, activities(*), courses(*)")
          .eq("user_id", params.id)

        setUserProgress(progressData || [])

        // Fetch user courses data for accurate progress tracking
        const { data: coursesData } = await supabase
          .from("user_courses")
          .select("*, courses(*)")
          .eq("user_id", params.id)

        setUserCourses(coursesData || [])

        // Get courses in progress
        const courseIds = [...new Set(progressData?.map((progress) => progress.course_id) || [])]
        if (courseIds.length > 0) {
          const { data: allCoursesData } = await supabase.from("courses").select("*").in("id", courseIds)
          setCourses(allCoursesData || [])
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load student data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id, router, supabase])

  const handlePrint = () => {
    window.print()
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const reportElement = document.getElementById("report")
      if (!reportElement) {
        throw new Error("Report element not found")
      }

      const canvas = await html2canvas(reportElement, {
        scale: 1.5,
        useCORS: true,
        logging: false,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      })

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height)
      pdf.save(`student-report-${student?.full_name || "unknown"}.pdf`)
    } catch (error) {
      console.error("Error exporting to PDF:", error)
      alert("Failed to export report. Please try again.")
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading student data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="mb-6">{error}</p>
        <Button asChild>
          <Link href="/dashboard/admin?tab=students">Back to Students</Link>
        </Button>
      </div>
    )
  }

  // Calculate learning stats
  const completedActivities = userProgress?.filter((progress) => progress.completed) || []
  const totalTimeSpent = completedActivities.reduce((total, activity) => total + (activity.time_spent || 0), 0)
  const learningStreak = student?.learning_streak || 0

  // Calculate course completion rate
  const completedCourses = userCourses?.filter((course) => course.progress === 100) || []
  const courseCompletionRate = userCourses?.length
    ? Math.round((completedCourses.length / userCourses.length) * 100)
    : 0

  // Calculate average scores by activity type
  const activityTypes = ["reading", "listening", "quiz", "fill_blank", "video"]
  const scoresByType = activityTypes.map((type) => {
    const activities = completedActivities.filter((a) => a.activities?.type === type)
    const totalScore = activities.reduce((sum, a) => sum + (a.score || 0), 0)
    const avgScore = activities.length > 0 ? Math.round((totalScore / activities.length) * 10) / 10 : 0
    return {
      type: type.charAt(0).toUpperCase() + type.slice(1).replace("_", " "),
      score: avgScore,
      count: activities.length,
    }
  })

  // Calculate overall course progress
  const overallProgress =
    userCourses && userCourses.length > 0
      ? Math.round(userCourses.reduce((sum, course) => sum + (course.progress || 0), 0) / userCourses.length)
      : 0

  return (
    <div className="container py-8">
      <div className="md:flex items-center justify-between mb-6 space-y-3 md:space-y-0">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link href={`/dashboard/admin/students/${params.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Student Profile
            </Link>
          </Button>
        </div>
        <div className="flex gap-2 justify-between md:justify-evenly">
          <Button variant="outline" onClick={handlePrint} disabled={exporting}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md print:shadow-none" id="report">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Student Progress Report</h1>
          <p className="text-xl mt-2">{student?.full_name}</p>
          <p className="text-muted-foreground">{student?.email}</p>
          <p className="text-sm mt-2">Generated on {new Date().toLocaleDateString()}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Overall Performance</h3>
            <div className="text-3xl font-bold">
              {completedActivities.length > 0
                ? Math.round(
                    (completedActivities.reduce((sum, a) => sum + (a.score || 0), 0) / completedActivities.length) * 10,
                  ) / 10
                : 0}
              /5
            </div>
            <p className="text-sm text-muted-foreground">Average score across all activities</p>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Time Investment</h3>
            <div className="text-3xl font-bold">
              {Math.floor(totalTimeSpent / 60)}h {totalTimeSpent % 60}m
            </div>
            <p className="text-sm text-muted-foreground">Total learning time</p>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Course Completion Rate</h3>
            <div className="text-3xl font-bold">{courseCompletionRate}%</div>
            <p className="text-sm text-muted-foreground">
              {completedCourses.length} of {userCourses?.length || 0} courses completed
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Course Progress</h2>
          <div className="space-y-4">
            {courses?.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Student hasn't started any courses yet.</p>
            ) : (
              courses?.map((course) => {
                // Get progress from user_courses for accurate tracking
                const userCourse = userCourses?.find((uc) => uc.course_id === course.id)
                const progressPercentage = userCourse?.progress || 0

                // Calculate activities completed for display
                const courseProgress = userProgress?.filter((p) => p.course_id === course.id) || []
                const completedActivities = courseProgress.filter((p) => p.completed).length

                return (
                  <div key={course.id} className="border rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-semibold">{course.title}</h3>
                      <span className="font-medium">{progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full mb-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>
                        {completedActivities} of {courseProgress.length} activities completed
                      </span>
                      <span>Last active: {new Date(course.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Performance by Activity Type</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {scoresByType
              .filter((type) => type.count > 0)
              .map((type) => (
                <div key={type.type} className="border rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-semibold">{type.type}</h3>
                    <span className="font-medium">
                      {type.score}/5 ({type.count} activities)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full mb-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${type.score * 20}%` }}></div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Recent Activity Details</h2>
          <div className="space-y-4">
            {completedActivities.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No completed activities yet.</p>
            ) : (
              completedActivities
                .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                .slice(0, 5)
                .map((activity) => (
                  <div key={activity.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{activity.activities?.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {activity.activities?.type?.replace("_", " ").charAt(0).toUpperCase() +
                            activity.activities?.type?.replace("_", " ").slice(1)}{" "}
                          Activity • {activity.courses?.title}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Score: {activity.score}/5</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>This report is generated by the English Learning Platform.</p>
          <p>© {new Date().getFullYear()} English Learning Platform. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

