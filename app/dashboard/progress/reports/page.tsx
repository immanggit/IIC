import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft, Calendar, Clock, BookOpen, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Suspense } from "react"
import ExportReportButton from "@/components/dashboard/export-report-button"

export default function PerformanceReportsPage() {
  return (
    <Suspense fallback={<ReportsLoading />}>
      <PerformanceReports />
    </Suspense>
  )
}

function ReportsLoading() {
  return (
    <div className="container py-8 flex justify-center items-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading reports data...</p>
      </div>
    </div>
  )
}

async function PerformanceReports() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch user profile data
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch user progress data
  const { data: userProgress } = await supabase
    .from("user_progress")
    .select("*, activities(*), courses(*)")
    .eq("user_id", user.id)

  // Calculate learning stats
  const completedActivities = userProgress?.filter((progress) => progress.completed) || []
  const totalTimeSpent = completedActivities.reduce((total, activity) => total + (activity.time_spent || 0), 0)

  // Get courses in progress
  const courseIds = [...new Set(userProgress?.map((progress) => progress.course_id) || [])]
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .in("id", courseIds.length > 0 ? courseIds : ["no-courses"])

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

  // Calculate skill radar data
  const skillRadarData = [
    { subject: "Reading", A: Math.min(100, scoresByType.find((s) => s.type === "Reading")?.score * 20 || 50) },
    { subject: "Listening", A: Math.min(100, scoresByType.find((s) => s.type === "Listening")?.score * 20 || 40) },
    { subject: "Quiz", A: Math.min(100, scoresByType.find((s) => s.type === "Quiz")?.score * 20 || 60) },
    { subject: "Fill Blank", A: Math.min(100, scoresByType.find((s) => s.type === "Fill blank")?.score * 20 || 45) },
    { subject: "Video", A: Math.min(100, scoresByType.find((s) => s.type === "Video")?.score * 20 || 55) },
  ]

  // Calculate progress over time (last 10 activities)
  const progressOverTime = completedActivities
    .sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime())
    .slice(-10)
    .map((activity, index) => ({
      name: `Activity ${index + 1}`,
      score: activity.score || 0,
      date: new Date(activity.updated_at).toLocaleDateString(),
    }))

  // Calculate time spent by day of week
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const timeByDay = daysOfWeek.map((day) => {
    const dayIndex = daysOfWeek.indexOf(day)
    // Calculate time spent on this day of week
    const timeSpent = completedActivities
      .filter((a) => new Date(a.updated_at).getDay() === (dayIndex + 1) % 7)
      .reduce((sum, a) => sum + (a.time_spent || 0), 0)

    return {
      day,
      minutes: timeSpent,
    }
  })

  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-4">
          <Link href="/dashboard/progress">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Performance Reports</h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-muted-foreground">Detailed analysis of your learning performance and progress</p>
        </div>
        <ExportReportButton />
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {completedActivities.length > 0
                ? Math.round(
                    (completedActivities.reduce((sum, a) => sum + (a.score || 0), 0) / completedActivities.length) * 10,
                  ) / 10
                : 0}
              /5
            </div>
            <p className="text-xs text-muted-foreground">Average score across all activities</p>
            <div className="mt-4">
              <Progress
                value={
                  completedActivities.length > 0
                    ? (completedActivities.reduce((sum, a) => sum + (a.score || 0), 0) / completedActivities.length) *
                      20
                    : 0
                }
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Time Investment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.floor(totalTimeSpent / 60)}h {totalTimeSpent % 60}m
            </div>
            <p className="text-xs text-muted-foreground">Total learning time</p>
            <div className="mt-4 flex items-center">
              <Clock className="h-4 w-4 text-muted-foreground mr-2" />
              <span className="text-sm">
                {Math.round(totalTimeSpent / (completedActivities.length || 1))} min avg per activity
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {userProgress?.length ? Math.round((completedActivities.length / userProgress.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {completedActivities.length} of {userProgress?.length || 0} activities completed
            </p>
            <div className="mt-4">
              <Progress
                value={userProgress?.length ? (completedActivities.length / userProgress.length) * 100 : 0}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Performance Analysis</TabsTrigger>
          <TabsTrigger value="time">Time Analysis</TabsTrigger>
          <TabsTrigger value="activities">Activity Details</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance by Activity Type</CardTitle>
                <CardDescription>Your average scores across different activity types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Performance chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skills Assessment</CardTitle>
                <CardDescription>Radar chart showing your skills across different areas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Skills radar chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Progress Over Time</CardTitle>
              <CardDescription>Your scores in the last 10 completed activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">Progress chart will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Time Spent by Day of Week</CardTitle>
              <CardDescription>Analysis of your learning patterns throughout the week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">Time chart will be displayed here</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Learning Efficiency</CardTitle>
                <CardDescription>Time spent vs. performance analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Average time per activity</span>
                    <span>{Math.round(totalTimeSpent / (completedActivities.length || 1))} minutes</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Most efficient activity type</span>
                    <Badge>
                      {scoresByType.sort((a, b) => b.score / (b.count || 1) - a.score / (a.count || 1))[0]?.type ||
                        "N/A"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Least efficient activity type</span>
                    <Badge variant="outline">
                      {scoresByType.sort((a, b) => a.score / (a.count || 1) - b.score / (b.count || 1))[0]?.type ||
                        "N/A"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Best time of day</span>
                    <span>Afternoon</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Time Distribution</CardTitle>
                <CardDescription>How your learning time is distributed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityTypes.map((type) => {
                    const activities = completedActivities.filter((a) => a.activities?.type === type)
                    const timeSpent = activities.reduce((sum, a) => sum + (a.time_spent || 0), 0)
                    const percentage = totalTimeSpent ? Math.round((timeSpent / totalTimeSpent) * 100) : 0

                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="capitalize">{type.replace("_", " ")}</span>
                          <span>
                            {Math.floor(timeSpent / 60)}h {timeSpent % 60}m ({percentage}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activities" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Performance Details</CardTitle>
              <CardDescription>Detailed breakdown of your performance in each activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completedActivities.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No completed activities yet.</p>
                ) : (
                  completedActivities
                    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                    .map((activity) => (
                      <div key={activity.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{activity.activities?.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {activity.activities?.type?.replace("_", " ").charAt(0).toUpperCase() +
                                activity.activities?.type?.replace("_", " ").slice(1)}{" "}
                              Activity •{activity.courses?.title}
                            </p>
                          </div>
                          <Badge
                            variant={activity.score >= 4 ? "default" : activity.score >= 2 ? "outline" : "destructive"}
                          >
                            Score: {activity.score}/5
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Time Spent</p>
                            <p className="font-medium">{activity.time_spent || 0} minutes</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Completed On</p>
                            <p className="font-medium">{new Date(activity.updated_at).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Status</p>
                            <div className="flex items-center">
                              {activity.completed ? (
                                <>
                                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                  <span className="font-medium text-green-600">Completed</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4 text-amber-500 mr-1" />
                                  <span className="font-medium text-amber-600">In Progress</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>Personalized recommendations based on your performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scoresByType
                  .filter((type) => type.count > 0)
                  .sort((a, b) => a.score - b.score)
                  .slice(0, 2)
                  .map((type) => (
                    <div key={type.type} className="border rounded-lg p-4">
                      <h4 className="font-medium flex items-center">
                        <BookOpen className="h-4 w-4 mr-2 text-primary" />
                        Improve your {type.type} skills
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your performance in {type.type} activities is {type.score < 3 ? "below average" : "average"}. We
                        recommend focusing on more {type.type.toLowerCase()} exercises.
                      </p>
                      <Button variant="outline" size="sm" className="mt-2" asChild>
                        <Link href={`/dashboard/activities?type=${type.type.toLowerCase()}`}>
                          Find {type.type} Activities
                        </Link>
                      </Button>
                    </div>
                  ))}

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    Optimize your learning schedule
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on your activity patterns, you perform best when learning in the
                    {timeByDay.indexOf(timeByDay.reduce((max, day) => (max.minutes > day.minutes ? max : day))) < 5
                      ? " weekdays"
                      : " weekends"}
                    . Try to schedule more learning sessions during these times.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

