import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { BookOpen, Trophy, ArrowLeft } from "lucide-react"

export default async function MyCoursesPage() {
  const supabase = createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch user courses data
  const { data: userCourses } = await supabase
    .from("user_courses")
    .select("*, courses(*)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  // Filter out courses with draft status
  const filteredCourses = userCourses?.filter((uc) => uc.courses.status === "published") || []

  // Separate in-progress and completed courses
  const inProgressCourses = filteredCourses.filter((uc) => uc.progress < 100) || []
  const completedCourses = filteredCourses.filter((uc) => uc.progress === 100) || []

  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Link href="/dashboard" className="text-primary hover:underline inline-flex items-center mr-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
      </div>

      <div className="flex items-center mb-6">
        <h1 className="text-3xl font-bold">My Courses</h1>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground mb-4">You haven't enrolled in any courses yet.</p>
          <Button asChild>
            <Link href="/dashboard/courses">Browse Courses</Link>
          </Button>
        </div>
      ) : (
        <>
          {inProgressCourses.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">In Progress</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {inProgressCourses.map((userCourse) => (
                  <CourseCard
                    key={userCourse.course_id}
                    course={userCourse.courses}
                    progress={userCourse.progress || 0}
                    score={userCourse.score || 0}
                  />
                ))}
              </div>
            </div>
          )}

          {completedCourses.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Completed</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {completedCourses.map((userCourse) => (
                  <CourseCard
                    key={userCourse.course_id}
                    course={userCourse.courses}
                    progress={100}
                    score={userCourse.score || 0}
                    isCompleted
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function CourseCard({
  course,
  progress,
  score,
  isCompleted = false,
}: {
  course: any
  progress: number
  score: number
  isCompleted?: boolean
}) {
  // Get badge color based on level
  const getBadgeColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "Intermediate":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "Advanced":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200"
      default:
        return ""
    }
  }

  // Get button color based on progress
  const getButtonColor = (progress: number) => {
    if (progress === 100) {
      return "bg-green-600 hover:bg-green-700"
    }

    switch (course.level) {
      case "Beginner":
        return "bg-green-600 hover:bg-green-700"
      case "Intermediate":
        return "bg-blue-600 hover:bg-blue-700"
      case "Advanced":
        return "bg-purple-600 hover:bg-purple-700"
      default:
        return ""
    }
  }

  return (
    <Card className={`overflow-hidden flex flex-col h-full ${isCompleted ? "border-green-200" : ""}`}>
      <div className="aspect-video relative h-48">
        <img
          src={course.image_url || "/placeholder.svg?height=200&width=300"}
          alt={course.title}
          className="object-cover w-full h-full"
          loading="lazy"
        />
        <Badge className={`absolute top-2 right-2 ${getBadgeColor(course.level)}`}>{course.level || "Beginner"}</Badge>
        {isCompleted && <Badge className="absolute top-2 left-2 bg-green-100 text-green-800">Completed</Badge>}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{course.title}</CardTitle>
        <CardDescription>{course.category_name || "General English"}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2 flex-1">
        <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className={`h-2 ${isCompleted ? "bg-green-100" : ""}`} />

          {isCompleted && (
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm font-medium">Score:</span>
              <div className="flex items-center">
                <Trophy className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="font-medium">{score}/5</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className={`w-full ${getButtonColor(progress)} flex`}>
          <Link href={`/dashboard/courses/${course.id}`}>
            <BookOpen className="h-4 w-4 mr-2" />
            {isCompleted ? "Review Course" : progress > 0 ? "Continue Learning" : "Start Course"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

