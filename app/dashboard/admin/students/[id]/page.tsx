"use client"

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ArrowLeft, Download, Clock, CheckCircle, XCircle, Award, Zap, Brain, BarChart, Target } from "lucide-react"

export default async function StudentDetailPage({ params }: { params: { id: string } }) {
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

  // Get student data
  const { data: student } = await supabase.from("profiles").select("*").eq("id", params.id).single()

  if (!student) {
    redirect("/dashboard/admin?tab=students")
  }

  // Fetch user progress data
  const { data: userProgress } = await supabase
    .from("user_progress")
    .select("*, activities(*), courses(*)")
    .eq("user_id", params.id)

  // Fetch user courses data for accurate progress tracking
  const { data: userCourses } = await supabase.from("user_courses").select("*, courses(*)").eq("user_id", params.id)

  // Calculate learning stats
  const completedActivities = userProgress?.filter((progress) => progress.completed) || []
  const totalTimeSpent = completedActivities.reduce((total, activity) => total + (activity.time_spent || 0), 0)
  const learningStreak = student?.learning_streak || 0

  // Get courses in progress with accurate progress data
  const courseIds = [...new Set(userProgress?.map((progress) => progress.course_id) || [])]
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .in("id", courseIds.length > 0 ? courseIds : ["no-courses"])

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

  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-4">
          <Link href="/dashboard/admin?tab=students">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students
          </Link>
        </Button>
      </div>

      <div className="flex items-center mb-6">
        <h1 className="text-3xl font-bold">Student Profile</h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">{student.full_name}</h2>
          <p className="text-muted-foreground">{student.email}</p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/dashboard/admin/students/${params.id}/export`}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Link>
        </Button>
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
            <CardTitle className="text-sm font-medium">Course Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{courseCompletionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {completedCourses.length} of {userCourses?.length || 0} courses completed
            </p>
            <div className="mt-4">
              <Progress value={courseCompletionRate} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto md:h-10">
          <TabsTrigger value="courses">Courses Progress</TabsTrigger>
          <TabsTrigger value="activities">Activity Details</TabsTrigger>
          <TabsTrigger value="performance">Performance Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Progress</CardTitle>
              <CardDescription>Student's progress in current courses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {courses?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Student hasn't started any courses yet.</p>
              ) : (
                courses?.map((course) => {
                  // Get progress from user_courses for accurate tracking
                  const userCourse = userCourses?.find((uc) => uc.course_id === course.id)
                  const progressPercentage = userCourse?.progress || 0

                  // Calculate activities completed for display
                  const courseProgress = userProgress?.filter((p) => p.course_id === course.id) || []
                  const completedActivities = courseProgress.filter((p) => p.completed).length

                  return (
                    <div key={course.id} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{course.title}</span>
                        <span>{progressPercentage}%</span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Performance Details</CardTitle>
              <CardDescription>Detailed breakdown of student's performance in each activity</CardDescription>
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
        </TabsContent>

        <TabsContent value="performance" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance by Activity Type</CardTitle>
                <CardDescription>Average scores across different activity types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scoresByType
                    .filter((type) => type.count > 0)
                    .map((type) => (
                      <div key={type.type} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{type.type}</span>
                          <span>
                            {type.score}/5 ({type.count} activities)
                          </span>
                        </div>
                        <Progress value={type.score * 20} className="h-2" />
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Learning Efficiency</CardTitle>
                <CardDescription>Time spent vs. performance analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-primary mr-2" />
                      <span className="font-medium">Average time per activity</span>
                    </div>
                    <span>{Math.round(totalTimeSpent / (completedActivities.length || 1))} minutes</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Award className="h-4 w-4 text-primary mr-2" />
                      <span className="font-medium">Most efficient activity type</span>
                    </div>
                    <span>
                      {scoresByType.sort((a, b) => b.score / (b.count || 1) - a.score / (a.count || 1))[0]?.type ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Target className="h-4 w-4 text-primary mr-2" />
                      <span className="font-medium">Least efficient activity type</span>
                    </div>
                    <span>
                      {scoresByType.sort((a, b) => a.score / (a.count || 1) - b.score / (b.count || 1))[0]?.type ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Zap className="h-4 w-4 text-primary mr-2" />
                      <span className="font-medium">Learning streak</span>
                    </div>
                    <span>{learningStreak} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Brain className="h-4 w-4 text-primary mr-2" />
                      <span className="font-medium">Learning style</span>
                    </div>
                    <span>{scoresByType.sort((a, b) => b.count - a.count)[0]?.type || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <BarChart className="h-4 w-4 text-primary mr-2" />
                      <span className="font-medium">Overall progress</span>
                    </div>
                    <span>
                      {userCourses && userCourses.length > 0
                        ? Math.round(
                            userCourses.reduce((sum, course) => sum + (course.progress || 0), 0) / userCourses.length,
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

