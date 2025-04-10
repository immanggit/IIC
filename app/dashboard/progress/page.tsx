import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Clock, Trophy, Star, BookOpen, Loader2 } from "lucide-react"
import { WeeklyActivityChart, ActivityTypesChart, MonthlyProgressChart } from "@/components/dashboard/progress-charts"
import { Suspense } from "react"
import ExportPDFButton from "@/components/dashboard/export-pdf-button"

export default function ProgressDashboardPage() {
  return (
    <Suspense fallback={<ProgressLoading />}>
      <ProgressDashboard />
    </Suspense>
  )
}

function ProgressLoading() {
  return (
    <div className="container py-8 flex justify-center items-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading progress data...</p>
      </div>
    </div>
  )
}

async function ProgressDashboard() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="mb-6">Please log in to view your progress dashboard.</p>
        <Button asChild>
          <Link href="/login">Log In</Link>
        </Button>
      </div>
    )
  }

  // Fetch user profile data
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch user progress data
  const { data: userProgress } = await supabase.from("user_progress").select("*, activities(*)").eq("user_id", user.id)

  // Fetch user courses data
  const { data: userCourses } = await supabase.from("user_courses").select("*").eq("user_id", user.id)

  // Calculate learning stats
  const completedActivities = userProgress?.filter((progress) => progress.completed) || []
  const totalTimeSpent = completedActivities.reduce((total, activity) => total + (activity.time_spent || 0), 0)
  const learningStreak = profile?.learning_streak || 0

  // Get courses in progress
  const courseIds = userCourses?.map((course) => course.course_id) || []

  if (courseIds.length === 0) {
    // If no courses, provide a default empty array
    return (
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Progress Dashboard</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Activities Completed</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Start your first activity!</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Time Spent Learning</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0h 0m</div>
              <p className="text-xs text-muted-foreground">Total learning time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Learning Streak</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 days</div>
              <p className="text-xs text-muted-foreground">Start your streak today!</p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground mb-4">You haven't started any courses yet.</p>
          <Button asChild>
            <Link href="/dashboard/courses">Browse Courses</Link>
          </Button>
        </div>
      </div>
    )
  }

  const { data: courses } = await supabase.from("courses").select("*").in("id", courseIds)

  // Count completed courses (progress = 100%)
  const completedCourses = userCourses?.filter((course) => course.progress === 100) || []

  // Prepare data for activity type chart
  const activityTypeData = [
    { name: "Reading", value: completedActivities.filter((p) => p.activities?.type === "reading").length },
    { name: "Listening", value: completedActivities.filter((p) => p.activities?.type === "listening").length },
    { name: "Quiz", value: completedActivities.filter((p) => p.activities?.type === "quiz").length },
    { name: "Fill Blanks", value: completedActivities.filter((p) => p.activities?.type === "fill_blank").length },
    { name: "Video", value: completedActivities.filter((p) => p.activities?.type === "video").length },
  ].filter((item) => item.value > 0)

  // Prepare data for weekly activity chart
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const today = new Date().getDay() // 0 = Sunday, 1 = Monday, etc.

  // Create realistic weekly data based on completed activities
  const weeklyActivityData = daysOfWeek.map((day, index) => {
    // Adjust index to match JavaScript's day numbering (0 = Sunday)
    const adjustedIndex = (index + 1) % 7
    const dayDiff = (today - adjustedIndex + 7) % 7
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() - dayDiff)

    // Format date to YYYY-MM-DD for comparison
    const dateStr = targetDate.toISOString().split("T")[0]

    // Count activities completed on this day
    const activitiesCompleted = completedActivities.filter((activity) => {
      const activityDate = new Date(activity.updated_at).toISOString().split("T")[0]
      return activityDate === dateStr
    }).length

    return {
      name: day,
      activities: activitiesCompleted,
      minutes: activitiesCompleted * 5, // Estimate 5 minutes per activity
    }
  })

  // Prepare data for monthly progress chart
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const currentMonth = new Date().getMonth()

  // Group activities by month
  const activitiesByMonth = completedActivities.reduce(
    (acc, activity) => {
      const month = new Date(activity.updated_at).getMonth()
      if (!acc[month]) acc[month] = 0
      acc[month]++
      return acc
    },
    {} as Record<number, number>,
  )

  const monthlyProgressData = monthNames.map((month, index) => {
    return {
      name: month,
      activities: index <= currentMonth ? activitiesByMonth[index] || 0 : 0,
    }
  })

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Progress Dashboard</h1>
        <ExportPDFButton userData={profile || {}} progressData={userProgress || []} courseData={courses || []} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Activities Completed</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedActivities.length}</div>
            <p className="text-xs text-muted-foreground">
              {completedActivities.length > 10 ? "Great progress!" : "Keep going!"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Time Spent Learning</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(totalTimeSpent / 60)}h {totalTimeSpent % 60}m
            </div>
            <p className="text-xs text-muted-foreground">Total learning time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Learning Streak</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{learningStreak} days</div>
            <p className="text-xs text-muted-foreground">{learningStreak > 5 ? "Impressive streak!" : "Keep it up!"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Courses Progress</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses?.length || 0}</div>
            <p className="text-xs text-muted-foreground">{completedCourses.length} completed</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Courses Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>Your learning activity over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <WeeklyActivityChart data={weeklyActivityData} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activity Types</CardTitle>
                <CardDescription>Breakdown of completed activities by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ActivityTypesChart data={activityTypeData} />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Progress</CardTitle>
              <CardDescription>Your learning progress throughout the year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <MonthlyProgressChart data={monthlyProgressData} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Progress</CardTitle>
              <CardDescription>Your progress in current courses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {courses?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">You haven't started any courses yet.</p>
              ) : (
                courses?.map((course) => {
                  // Get progress from user_courses
                  const userCourse = userCourses?.find((uc) => uc.course_id === course.id)
                  const progressPercentage = userCourse?.progress || 0

                  return (
                    <div key={course.id} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{course.title}</span>
                        <span>{progressPercentage}%</span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{progressPercentage === 100 ? "Completed" : "In Progress"}</span>
                        <Button variant="link" size="sm" asChild className="p-0 h-auto">
                          <Link href={`/dashboard/courses/${course.id}`}>Continue Learning</Link>
                        </Button>
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your most recent course activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userProgress?.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No recent activities.</p>
                ) : (
                  userProgress
                    ?.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                    .slice(0, 5)
                    .map((progress) => (
                      <div key={progress.id} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <p className="font-medium">{progress.activities?.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {courses?.find((c) => c.id === progress.course_id)?.title || "Unknown Course"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={progress.completed ? "text-green-600 font-medium" : "text-amber-600 font-medium"}
                          >
                            {progress.completed ? "Completed" : "In Progress"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(progress.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

