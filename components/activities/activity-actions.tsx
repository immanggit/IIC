"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { saveActivityProgress } from "@/app/actions/activity-actions"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react"

interface ActivityActionsProps {
  activityId: string
  score: number
  courseId?: string
  nextActivityId?: string
  prevActivityId?: string
  referrer: string
  hasAnswers: boolean
  isCompleted?: boolean
  isLastActivity?: boolean
  isFirstActivity?: boolean
}

export function ActivityActions({
  activityId,
  score,
  courseId,
  nextActivityId,
  prevActivityId,
  referrer,
  hasAnswers,
  isCompleted = false,
  isLastActivity = false,
  isFirstActivity = false,
}: ActivityActionsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleComplete = async () => {
    setIsSubmitting(true)
    try {
      await saveActivityProgress(activityId, score, true)
      router.refresh()
    } catch (error) {
      console.error("Error saving progress:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full md:flex justify-between space-y-3 md:space-y-0">
      <div>
        {!isFirstActivity && prevActivityId && (
          <Button asChild variant="outline" className="mr-2">
            <Link
              href={`/dashboard/activities/${prevActivityId}?referrer=${referrer}${courseId ? `&courseId=${courseId}` : ""}`}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous Activity
            </Link>
          </Button>
        )}
      </div>

      <div>
        {isCompleted && !isLastActivity && nextActivityId && (
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link
              href={`/dashboard/activities/${nextActivityId}?referrer=${referrer}${courseId ? `&courseId=${courseId}` : ""}`}
            >
              Next Activity
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        )}

        {isCompleted && isLastActivity && courseId && (
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href={`/dashboard/courses/${courseId}`}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Course
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}

export default ActivityActions

