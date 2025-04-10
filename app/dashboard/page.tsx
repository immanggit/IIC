import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen, Trophy, Clock, Star, CheckSquare, BarChart, CheckCircle } from "lucide-react"

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch user profile data
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch user progress data
  const { data: userProgress } = await supabase.from("user_progress").select("*, activities(*)").eq("user_id", user.id)

  // Fetch user courses data
  const { data: userCourses } = await supabase
    .from("user_courses")
    .select("*, courses(*)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  // Filter courses by progress - show 5 in-progress courses
  const inProgressCourses =
    userCourses?.filter((uc) => uc.progress < 100 && uc.courses.status === "published").slice(0, 5) || []

  // Show 5 completed courses
  const completedCourses =
    userCourses?.filter((uc) => uc.progress === 100 && uc.courses.status === "published").slice(0, 5) || []

  // If no in-progress courses, get some recommended courses
  let recommendedCourses = []
  if (inProgressCourses.length === 0) {
    const { data: courses } = await supabase
      .from("courses")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(5)

    recommendedCourses = courses || []
  }

  // Fetch recommended activities ordered by order_index
  const { data: recommendedActivities } = await supabase
    .from("activities")
    .select("*, courses(*)")
    .eq("status", "published")
    .order("order_index", { ascending: true })
    .limit(5)

  // Filter out activities from draft courses
  const filteredActivities =
    recommendedActivities?.filter((activity) => activity.courses && activity.courses.status === "published") || []

  // Calculate stats
  const completedActivities = userProgress?.filter((progress) => progress.completed) || []
  const totalTimeSpent = completedActivities.reduce((total, activity) => total + (activity.time_spent || 0), 0)
  const learningStreak = profile?.learning_streak || 0

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome back, {profile?.full_name || "Student"}!</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Activities Completed</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedActivities.length}</div>
            <p className="text-xs text-muted-foreground">
              {completedActivities.length > 0
                ? `+${
                    completedActivities.filter(
                      (a) => new Date(a.updated_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000,
                    ).length
                  } this week`
                : "Start your first activity!"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Courses Progress</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedCourses.length}/{userCourses?.filter((uc) => uc.courses.status === "published").length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {completedCourses.length > 0 ? "Great job completing courses!" : "Keep learning to complete courses"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Learning Streak</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{learningStreak} days</div>
            <p className="text-xs text-muted-foreground">
              {learningStreak > 0 ? "Keep it up!" : "Start your streak today!"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(totalTimeSpent / 60)}h {totalTimeSpent % 60}m
            </div>
            <p className="text-xs text-muted-foreground">Total learning time</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Continue Learning</CardTitle>
            <CardDescription>Pick up where you left off</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {inProgressCourses.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">You haven't started any courses yet.</p>
                <Button asChild>
                  <Link href="/dashboard/courses">Browse Courses</Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-y-auto pr-2">
                {inProgressCourses.map((userCourse) => (
                  <Link
                    key={userCourse.course_id}
                    href={`/dashboard/courses/${userCourse.course_id}`}
                    className="block mb-3"
                  >
                    <div className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="bg-primary/10 p-2 rounded">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{userCourse.courses.title}</h4>
                          <span className="text-sm text-muted-foreground">{userCourse.progress || 0}%</span>
                        </div>
                        <Progress value={userCourse.progress || 0} className="h-2" />
                        <p className="text-sm text-muted-foreground">{userCourse.courses.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {inProgressCourses.length > 0 && (
              <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                <Link href="/dashboard/my-courses">View All My Courses</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completed Courses</CardTitle>
            <CardDescription>Courses you've successfully finished</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="pr-2">
              {completedCourses.map((userCourse) => (
                <Link
                  key={userCourse.course_id}
                  href={`/dashboard/courses/${userCourse.course_id}`}
                  className="block mb-3"
                >
                  <div className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="bg-green-100 p-2 rounded">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{userCourse.courses.title}</h4>
                        <div className="flex items-center">
                          <Trophy className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="font-medium">{userCourse.score}/5</span>
                        </div>
                      </div>
                      <Progress value={100} className="h-2 bg-green-100" />
                      <p className="text-sm text-muted-foreground">{userCourse.courses.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/progress">View All Completed Courses</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center mt-8">
        <Button asChild size="lg">
          <Link href="/dashboard/progress">
            <BarChart className="h-4 w-4 mr-2" />
            View Detailed Progress Dashboard
          </Link>
        </Button>
      </div>
    </div>
  )
}

