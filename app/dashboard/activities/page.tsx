import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen, Headphones, CheckSquare, Edit3, Youtube } from "lucide-react"

// Add a NoActivitiesMessage component at the top of the file
function NoActivitiesMessage() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-3 mb-4">
        <BookOpen className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">No activities found</h3>
      <p className="text-muted-foreground max-w-md mb-4">
        There are no activities available in this category yet. Check back later or explore other categories.
      </p>
      <Button asChild>
        <Link href="/dashboard/courses">Browse Courses</Link>
      </Button>
    </div>
  )
}

export default async function ActivitiesPage() {
  const supabase = createClient()

  // Fetch courses to check their status
  const { data: courses } = await supabase.from("courses").select("id, status")
  const publishedCourseIds = courses?.filter((course) => course.status === "published").map((course) => course.id) || []

  // Fetch activities grouped by type
  const { data: readingActivities } = await supabase
    .from("activities")
    .select("*, courses(status)")
    .eq("type", "reading")
    .eq("status", "published")
    .order("created_at", { ascending: false })

  const { data: listeningActivities } = await supabase
    .from("activities")
    .select("*, courses(status)")
    .eq("type", "listening")
    .eq("status", "published")
    .order("created_at", { ascending: false })

  const { data: quizActivities } = await supabase
    .from("activities")
    .select("*, courses(status)")
    .eq("type", "quiz")
    .eq("status", "published")
    .order("created_at", { ascending: false })

  const { data: fillBlankActivities } = await supabase
    .from("activities")
    .select("*, courses(status)")
    .eq("type", "fill_blank")
    .eq("status", "published")
    .order("created_at", { ascending: false })

  const { data: videoActivities } = await supabase
    .from("activities")
    .select("*, courses(status)")
    .eq("type", "video")
    .eq("status", "published")
    .order("created_at", { ascending: false })

  // Filter activities to only show those from published courses
  const filterActivitiesByCourseStatus = (activities: any[]) => {
    return activities?.filter((activity) => publishedCourseIds.includes(activity.course_id)) || []
  }

  const filteredReadingActivities = filterActivitiesByCourseStatus(readingActivities || [])
  const filteredListeningActivities = filterActivitiesByCourseStatus(listeningActivities || [])
  const filteredQuizActivities = filterActivitiesByCourseStatus(quizActivities || [])
  const filteredFillBlankActivities = filterActivitiesByCourseStatus(fillBlankActivities || [])
  const filteredVideoActivities = filterActivitiesByCourseStatus(videoActivities || [])

  // Combine all activities for the "all" tab
  const allActivities = [
    ...filteredReadingActivities,
    ...filteredListeningActivities,
    ...filteredQuizActivities,
    ...filteredFillBlankActivities,
    ...filteredVideoActivities,
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Learning Activities</h1>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="reading">Reading</TabsTrigger>
          <TabsTrigger value="listening">Listening</TabsTrigger>
          <TabsTrigger value="quiz">Multiple Choice</TabsTrigger>
          <TabsTrigger value="fill_blank">Fill Blanks</TabsTrigger>
          <TabsTrigger value="video">Video Quizzes</TabsTrigger>
        </TabsList>

        {/* For the "all" tab: */}
        <TabsContent value="all" className="mt-6">
          {allActivities.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {allActivities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <NoActivitiesMessage />
          )}
        </TabsContent>

        {/* For the "reading" tab: */}
        <TabsContent value="reading" className="mt-6">
          {filteredReadingActivities.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredReadingActivities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <NoActivitiesMessage />
          )}
        </TabsContent>

        {/* For the "listening" tab: */}
        <TabsContent value="listening" className="mt-6">
          {filteredListeningActivities.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredListeningActivities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <NoActivitiesMessage />
          )}
        </TabsContent>

        {/* For the "quiz" tab: */}
        <TabsContent value="quiz" className="mt-6">
          {filteredQuizActivities.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredQuizActivities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <NoActivitiesMessage />
          )}
        </TabsContent>

        {/* For the "fill_blank" tab: */}
        <TabsContent value="fill_blank" className="mt-6">
          {filteredFillBlankActivities.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredFillBlankActivities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <NoActivitiesMessage />
          )}
        </TabsContent>

        {/* For the "video" tab: */}
        <TabsContent value="video" className="mt-6">
          {filteredVideoActivities.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredVideoActivities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <NoActivitiesMessage />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ActivityCard({ activity }: { activity: any }) {
  // Get icon and color based on activity type
  const getActivityTypeInfo = (type: string) => {
    switch (type) {
      case "reading":
        return {
          icon: <BookOpen className="h-6 w-6 text-blue-600" />,
          color: "text-blue-600",
          buttonColor: "bg-blue-600 hover:bg-blue-700",
        }
      case "listening":
        return {
          icon: <Headphones className="h-6 w-6 text-purple-600" />,
          color: "text-purple-600",
          buttonColor: "bg-purple-600 hover:bg-purple-700",
        }
      case "quiz":
        return {
          icon: <CheckSquare className="h-6 w-6 text-green-600" />,
          color: "text-green-600",
          buttonColor: "bg-green-600 hover:bg-green-700",
        }
      case "fill_blank":
        return {
          icon: <Edit3 className="h-6 w-6 text-amber-600" />,
          color: "text-amber-600",
          buttonColor: "bg-amber-600 hover:bg-amber-700",
        }
      case "video":
        return {
          icon: <Youtube className="h-6 w-6 text-red-600" />,
          color: "text-red-600",
          buttonColor: "bg-red-600 hover:bg-red-700",
        }
      default:
        return {
          icon: <BookOpen className="h-6 w-6 text-primary" />,
          color: "text-primary",
          buttonColor: "",
        }
    }
  }

  const typeInfo = getActivityTypeInfo(activity.type)

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0">{typeInfo.icon}</div>
          <CardTitle className={typeInfo.color}>{activity.title}</CardTitle>
        </div>
        <CardDescription>{activity.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="aspect-video bg-muted rounded-md flex items-center justify-center h-48">
          <img
            src={activity.image_url || "/placeholder.svg?height=200&width=300"}
            alt={activity.title}
            className="h-full w-full object-cover rounded-md"
            loading="lazy"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className={`w-full ${typeInfo.buttonColor}`}>
          <Link href={`/dashboard/activities/${activity.id}`}>Start Activity</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

