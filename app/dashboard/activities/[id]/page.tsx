"use client"

import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import ReadingActivity from "@/components/activities/reading-activity"
import ListeningActivity from "@/components/activities/listening-activity"
import MultipleChoiceActivity from "@/components/activities/multiple-choice-activity"
import FillBlanksActivity from "@/components/activities/fill-blanks-activity"
import VideoActivity from "@/components/activities/video-activity"
import DragDropActivity from "@/components/activities/drag-drop-activity"
import MatchLinesActivity from "@/components/activities/match-lines-activity"
import FlipCardsActivity from "@/components/activities/flip-cards-activity"
import ActivityActions from "@/components/activities/activity-actions"

export default async function ActivityPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { referrer?: string; courseId?: string }
}) {
  const supabase = createClient()

  // Fetch activity details
  const { data: activity } = await supabase.from("activities").select("*").eq("id", params.id).single()

  if (!activity) {
    notFound()
  }

  // Fetch user progress for this activity  params.id).single()

  if (!activity) {
    notFound()
  }

  // Fetch user progress for this activity
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: progress } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", user?.id)
    .eq("activity_id", params.id)
    .single()

  // Get course information
  const { data: course } = await supabase.from("courses").select("title").eq("id", activity.course_id).single()

  // Get the courseId from the query parameter if it exists
  const courseId = searchParams.courseId || activity.course_id

  // If courseId exists, fetch all activities for this course to determine next and previous activity
  let nextActivityId = null
  let prevActivityId = null
  let isLastActivity = false
  let isFirstActivity = false

  if (courseId) {
    const { data: courseActivities } = await supabase
      .from("activities")
      .select("id, order_index, status")
      .eq("course_id", courseId)
      .eq("status", "published")
      .order("order_index", { ascending: true })

    if (courseActivities && courseActivities.length > 0) {
      // Find the current activity's position
      const currentActivityIndex = courseActivities.findIndex((a) => a.id === activity.id)

      // Determine if this is the first activity
      isFirstActivity = currentActivityIndex === 0

      // Determine if this is the last activity
      isLastActivity = currentActivityIndex === courseActivities.length - 1

      // If it's not the last activity, get the next one
      if (currentActivityIndex !== -1 && currentActivityIndex < courseActivities.length - 1) {
        nextActivityId = courseActivities[currentActivityIndex + 1].id
      }

      // If it's not the first activity, get the previous one
      if (currentActivityIndex > 0) {
        prevActivityId = courseActivities[currentActivityIndex - 1].id
      }
    }
  }

  // Determine referrer (course or activities page)
  const referrer = searchParams.referrer || (activity.course_id ? "course" : "activities")

  // Check if user has answered any questions
  const hasAnswers = progress?.answers && Object.keys(progress.answers).length > 0

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link
          href={
            referrer === "course" && activity.course_id
              ? `/dashboard/courses/${activity.course_id}`
              : "/dashboard/activities"
          }
          className="text-primary hover:underline"
        >
          ← Back to {referrer === "course" ? "Course" : "Activities"}
        </Link>
        {course && <div className="mt-1 text-sm text-muted-foreground">Course: {course.title}</div>}
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">{activity.title}</CardTitle>
          <CardDescription>{activity.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {activity.type === "reading" && (
            <ReadingActivity
              activity={activity}
              progress={progress}
              isLastActivity={isLastActivity}
              courseId={courseId}
              nextActivityId={nextActivityId}
            />
          )}
          {activity.type === "listening" && (
            <ListeningActivity
              activity={activity}
              progress={progress}
              isCompleted={progress?.completed}
              userAnswer={progress?.answers?.text}
              isLastActivity={isLastActivity}
              courseId={courseId}
              nextActivityId={nextActivityId}
            />
          )}
          {activity.type === "quiz" && (
            <MultipleChoiceActivity
              activity={activity}
              progress={progress}
              isLastActivity={isLastActivity}
              courseId={courseId}
              nextActivityId={nextActivityId}
            />
          )}
          {activity.type === "fill_blank" && (
            <FillBlanksActivity
              activity={activity}
              progress={progress}
              isLastActivity={isLastActivity}
              courseId={courseId}
              nextActivityId={nextActivityId}
            />
          )}
          {activity.type === "video" && (
            <VideoActivity
              activity={activity}
              progress={progress}
              isLastActivity={isLastActivity}
              allActivitiesCompleted={isLastActivity}
              courseId={courseId}
              nextActivityId={nextActivityId}
            />
          )}
          {activity.type === "drag_drop" && (
            <DragDropActivity
              activity={activity}
              progress={progress}
              isLastActivity={isLastActivity}
              courseId={courseId}
              nextActivityId={nextActivityId}
            />
          )}
          {activity.type === "match_lines" && (
            <MatchLinesActivity
              activity={activity}
              progress={progress}
              isLastActivity={isLastActivity}
              courseId={courseId}
              nextActivityId={nextActivityId}
            />
          )}
          {activity.type === "flip_cards" && (
            <FlipCardsActivity
              activity={activity}
              progress={progress}
              isLastActivity={isLastActivity}
              courseId={courseId}
              nextActivityId={nextActivityId}
            />
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <ActivityActions
            activityId={activity.id}
            score={progress?.score || 0}
            courseId={activity.course_id}
            nextActivityId={nextActivityId}
            prevActivityId={prevActivityId}
            referrer={referrer}
            hasAnswers={hasAnswers || false}
            isCompleted={progress?.completed || false}
            isLastActivity={isLastActivity}
            isFirstActivity={isFirstActivity}
          />
        </CardFooter>
      </Card>
    </div>
  )
}

