"use client"

import { createClient } from "@/utils/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { BookOpen, CheckCircle, Clock, ArrowLeft, Play, Trophy, Edit, AlertTriangle } from "lucide-react"

export default async function CoursePage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Check if user is teacher or admin
  const { data: userRole } = await supabase.from("user_roles").select("role").eq("user_id", user.id).single()

  const isTeacherOrAdmin = userRole?.role === "teacher" || userRole?.role === "admin"

  // Fetch course details
  const { data: course } = await supabase.from("courses").select("*, categories(name)").eq("id", params.id).single()

  if (!course) {
    notFound()
  }

  // If course is draft and user is not teacher/admin, redirect
  if (course.status === "draft" && !isTeacherOrAdmin) {
    redirect("/dashboard/courses")
  }

  // Fetch course activities - order by order_index
  let query = supabase
    .from("activities")
    .select("*")
    .eq("course_id", params.id)
    .eq("status", "published")
    .order("order_index", { ascending: true })

  // Only show published activities for regular users
  if (!isTeacherOrAdmin) {
    query = query.eq("status", "published")
  }

  const { data: activities } = await query

  // Fetch user progress for this course
  const { data: userProgress } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", params.id)

  // Get user course data
  const { data: userCourse } = await supabase
    .from("user_courses")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", params.id)
    .single()

  // Calculate course progress
  const completedActivities = userProgress?.filter((progress) => progress.completed) || []
  const progressPercentage = activities?.length ? Math.round((completedActivities.length / activities.length) * 100) : 0

  // Get course score
  const courseScore = userCourse?.score || 0
  const isCompleted = progressPercentage === 100

  // Find the next activity to continue from
  let nextActivityId = null
  if (activities && activities.length > 0) {
    // If there are completed activities, find the first incomplete one
    if (completedActivities.length > 0 && completedActivities.length < activities.length) {
      const completedIds = completedActivities.map((p) => p.activity_id)
      nextActivityId = activities.find((a) => !completedIds.includes(a.id))?.id
    }
    // If no activities completed or all completed, start from the first one
    else {
      nextActivityId = activities[0].id
    }
  }

  // Fetch related courses by category - increased to 5
  const { data: relatedCourses } = await supabase
    .from("courses")
    .select("id, title, level, image_url")
    .eq("category_id", course.category_id)
    .eq("status", "published")
    .neq("id", params.id)
    .limit(5)

  return (
    <div className="container py-8">
      <div className="mb-6 flex justify-between items-center">
        <Link href="/dashboard/courses" className="text-primary hover:underline inline-flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Courses
        </Link>

        {isTeacherOrAdmin && (
          <Button asChild variant="outline">
            <Link href={`/dashboard/teacher/courses/edit/${params.id}`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Course
            </Link>
          </Button>
        )}
      </div>

      {course.status === "draft" && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center">
          <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
          <p className="text-amber-800">
            This course is currently in <strong>draft mode</strong> and is only visible to teachers and administrators.
          </p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <div className="aspect-video relative">
              <img
                src={course.image_url || "/placeholder.svg?height=400&width=800"}
                alt={course.title}
                className="object-cover w-full h-full"
              />
              <Badge className="absolute top-4 right-4 text-sm px-3 py-1">{course.level || "Beginner"}</Badge>
              {course.status === "draft" && (
                <Badge className="absolute top-4 left-4 bg-amber-100 text-amber-800 text-sm px-3 py-1">Draft</Badge>
              )}
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{course.title}</CardTitle>
                  <CardDescription className="text-base">
                    {course.categories?.name || "General English"}
                  </CardDescription>
                </div>

                {isCompleted && (
                  <div className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full">
                    <Trophy className="h-4 w-4 mr-1 text-yellow-500" />
                    <span className="font-medium">Score: {courseScore}/5</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p>{course.description}</p>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Course Progress</h3>
                <div className="flex justify-between text-sm mb-2">
                  <span>
                    {completedActivities.length} of {activities?.length || 0} activities completed
                  </span>
                  <span>{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Activities</CardTitle>
              <CardDescription>
                {isCompleted
                  ? "You've completed all activities in this course!"
                  : "Complete all activities to finish the course"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activities?.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No activities available for this course yet.</p>
              ) : (
                activities?.map((activity, index) => {
                  const activityProgress = userProgress?.find((p) => p.activity_id === activity.id)
                  const isCompleted = activityProgress?.completed || false
                  const score = activityProgress?.score || 0

                  return (
                    <Link
                      key={activity.id}
                      href={`/dashboard/activities/${activity.id}?referrer=course`}
                      className="block"
                    >
                      <div
                        className={`block md:flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors ${isCompleted ? "bg-green-50 border-green-200" : ""}`}
                      >
                        <div
                          className={`hidden flex-shrink-0 w-8 h-8 md:flex items-center justify-center rounded-full ${isCompleted ? "bg-green-100 text-green-700" : "bg-primary/10 text-primary"}`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <span className="font-medium">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium">{activity.title}</h4>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                          {activity.status === "draft" && (
                            <Badge variant="outline" className="mt-1 text-amber-600 border-amber-300">
                              Draft
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getActivityBadgeVariant(activity.type)}>
                            {formatActivityType(activity.type)}
                          </Badge>

                          {isCompleted ? (
                            <div className="flex items-center">
                              <Trophy className="h-4 w-4 text-yellow-500 mr-1" />
                              <span className="font-medium mr-2">{score}/5</span>
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:text-blue-700"
                              >
                                Review
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              Start
                            </Button>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })
              )}

              {isTeacherOrAdmin && (
                <Button asChild className="w-full mt-2">
                  <Link href={`/dashboard/teacher/activities/new?courseId=${params.id}`}>Add New Activity</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span>Duration: {activities?.length || 0} activities</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                <span>Level: {course.level || "Beginner"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-muted-foreground" />
                <span>Progress: {progressPercentage}% complete</span>
              </div>

              {isCompleted && (
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span>Score: {courseScore}/5</span>
                </div>
              )}
            </CardContent>
            <CardFooter>
              {activities?.length > 0 && nextActivityId && (
                <Button asChild className="flex w-full bg-green-600 hover:bg-green-700 md:w-auto">
                  <Link href={`/dashboard/activities/${nextActivityId}?referrer=course`}>
                    <Play className="h-4 w-4 mr-2" />
                    {isCompleted
                      ? "Review Course"
                      : progressPercentage > 0 && progressPercentage < 100
                        ? "Continue Course"
                        : "Start Course"}
                  </Link>
                </Button>
              )}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Related Courses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {relatedCourses && relatedCourses.length > 0 ? (
                relatedCourses.map((relatedCourse) => (
                  <Link key={relatedCourse.id} href={`/dashboard/courses/${relatedCourse.id}`} className="block">
                    <div className="flex items-center gap-3 p-2 border rounded-md hover:bg-muted/50 transition-colors">
                      <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                        <img
                          src={relatedCourse.image_url || "/placeholder.svg?height=48&width=48"}
                          alt={relatedCourse.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{relatedCourse.title}</p>
                        <p className="text-xs text-muted-foreground">{relatedCourse.level}</p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Explore more courses to improve your English skills.</p>
              )}
              <Button asChild variant="outline" className="w-full md:w-auto block">
                <Link href="/dashboard/courses">Browse All Courses</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function formatActivityType(type: string): string {
  switch (type) {
    case "reading":
      return "Reading"
    case "listening":
      return "Listening"
    case "quiz":
      return "Quiz"
    case "fill_blank":
      return "Fill Blanks"
    case "video":
      return "Video"
    default:
      return type
  }
}

function getActivityBadgeVariant(type: string): "default" | "secondary" | "destructive" | "outline" {
  switch (type) {
    case "reading":
      return "default"
    case "listening":
      return "secondary"
    case "quiz":
      return "outline"
    case "fill_blank":
      return "destructive"
    case "video":
      return "secondary"
    default:
      return "default"
  }
}

