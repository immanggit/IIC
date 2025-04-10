"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import { saveActivityProgress } from "@/app/actions/activity-actions"
import { useToast } from "@/components/ui/use-toast"

// Update the interface to include new props
interface ReadingActivityProps {
  activity: any
  progress?: any
  isLastActivity?: boolean
  courseId?: string
  nextActivityId?: string
}

// Update the component parameters to include new props
export default function ReadingActivity({
  activity,
  progress,
  isLastActivity = false,
  courseId,
  nextActivityId,
}: ReadingActivityProps) {
  const [showQuestions, setShowQuestions] = useState(progress?.completed || false)
  const [answers, setAnswers] = useState<Record<string, string>>(progress?.answers || {})
  const [submitted, setSubmitted] = useState(progress?.completed || false)
  const [score, setScore] = useState(progress?.score || 0)
  const [isSaving, setIsSaving] = useState(false)
  const [readingTime, setReadingTime] = useState(0)
  const [readingComplete, setReadingComplete] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Get content from activity
  const content = activity.content || {
    text: "Once upon a time, there was a little girl named Lily. Lily loved to read books about animals. Her favorite animals were elephants. Elephants are very big and have long trunks. They use their trunks to pick up food and water. Elephants live in Africa and Asia. They eat plants and can live for many years. Lily wanted to see real elephants one day. She asked her parents to take her to the zoo. At the zoo, Lily saw many animals, but she was most excited to see the elephants. The elephants were very big and friendly. Lily was very happy that day.",
    questions: [
      { id: "q1", text: "What was the girl's name?", options: ["Lucy", "Lily", "Lisa", "Laura"], correct: "Lily" },
      {
        id: "q2",
        text: "What animals did Lily like the most?",
        options: ["Lions", "Tigers", "Elephants", "Giraffes"],
        correct: "Elephants",
      },
      {
        id: "q3",
        text: "Where do elephants live?",
        options: ["Europe and America", "Africa and Asia", "Australia", "Antarctica"],
        correct: "Africa and Asia",
      },
      {
        id: "q4",
        text: "What do elephants eat?",
        options: ["Meat", "Fish", "Plants", "Everything"],
        correct: "Plants",
      },
      {
        id: "q5",
        text: "Where did Lily go to see elephants?",
        options: ["Forest", "Park", "Zoo", "School"],
        correct: "Zoo",
      },
    ],
  }

  // Calculate reading time based on word count (average reading speed: 200 words per minute)
  useEffect(() => {
    if (!progress?.completed && !readingComplete) {
      // Extract text content from HTML if it's HTML
      const textContent = content.text.replace(/<[^>]*>/g, "")
      const wordCount = textContent.split(/\s+/).length
      const estimatedReadingTimeInSeconds = Math.ceil((wordCount / 200) * 60)

      // Set minimum reading time to 10 seconds for testing purposes
      const minReadingTime = Math.max(10, estimatedReadingTimeInSeconds)

      // Start timer
      const timer = setTimeout(() => {
        setReadingComplete(true)
      }, minReadingTime * 1000)

      // Track reading time
      const interval = setInterval(() => {
        setReadingTime((prev) => prev + 1)
      }, 1000)

      return () => {
        clearTimeout(timer)
        clearInterval(interval)
      }
    }
  }, [content.text, progress?.completed, readingComplete])

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers({
      ...answers,
      [questionId]: answer,
    })
  }

  const handleSubmit = async () => {
    // Check if all questions are answered
    if (Object.keys(answers).length !== content.questions.length) {
      return // Don't proceed if not all questions are answered
    }

    setIsSaving(true)
    setSubmitted(true)
    const newScore = getScore()
    setScore(newScore)

    // Save progress to Supabase
    try {
      // Validate activity ID
      if (!activity.id) {
        throw new Error("Activity ID is missing")
      }

      // Ensure we're passing valid data
      const activityId = String(activity.id)
      const scoreValue = Number(newScore)

      console.log("Saving progress with:", {
        activityId,
        score: scoreValue,
        completed: true,
        answersCount: Object.keys(answers).length,
        timeSpent: readingTime,
      })

      const result = await saveActivityProgress(activityId, scoreValue, true, answers, readingTime)

      if (!result.success) {
        throw new Error(result.error || "Failed to save progress")
      }

      console.log("Progress saved successfully:", result.data)

      // Refresh the page data
      router.refresh()
    } catch (error: any) {
      console.error("Error saving progress:", error)
      toast({
        title: "Error saving progress",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getScore = () => {
    let correct = 0
    content.questions.forEach((question: any) => {
      if (answers[question.id] === question.correct) {
        correct++
      }
    })
    return Math.round((correct / content.questions.length) * 5) // Convert to score out of 5
  }

  // Initialize from saved progress
  useEffect(() => {
    if (progress?.completed) {
      setShowQuestions(true)
      setSubmitted(true)
      setReadingComplete(true)
      if (progress.answers) {
        setAnswers(progress.answers)
      }
    }
  }, [progress])

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="prose max-w-none">
            {/* Render HTML content safely */}
            <div dangerouslySetInnerHTML={{ __html: content.text }} />
          </div>
        </CardContent>
      </Card>

      {!showQuestions ? (
        <Button onClick={() => setShowQuestions(true)} className="w-full" disabled={!readingComplete || isSaving}>
          {readingComplete
            ? "I've Finished Reading"
            : `Please read for ${Math.ceil((content.text.replace(/<[^>]*>/g, "").split(/\s+/).length / 200) * 60)} seconds...`}
        </Button>
      ) : (
        <div className="space-y-6">
          <Separator />
          <h3 className="text-xl font-semibold">Comprehension Questions</h3>

          {content.questions.map((question: any, index: number) => (
            <div key={question.id} className="space-y-3">
              <h4 className="font-medium">
                {index + 1}. {question.text}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {question.options.map((option: string) => (
                  <div key={option} className="flex items-center">
                    <Button
                      variant={answers[question.id] === option ? "default" : "outline"}
                      className={`w-full justify-start ${
                        submitted && option === question.correct ? "bg-green-500 hover:bg-green-600" : ""
                      } ${
                        submitted && answers[question.id] === option && option !== question.correct
                          ? "bg-red-500 hover:bg-red-600"
                          : ""
                      }`}
                      onClick={() => !submitted && handleAnswerSelect(question.id, option)}
                      disabled={submitted || isSaving}
                    >
                      {option}
                    </Button>
                  </div>
                ))}
              </div>
              {submitted && answers[question.id] !== question.correct && (
                <p className="text-sm text-red-500">Correct answer: {question.correct}</p>
              )}
            </div>
          ))}

          {!submitted ? (
            <Button
              onClick={handleSubmit}
              className="w-full"
              disabled={Object.keys(answers).length !== content.questions.length || isSaving}
            >
              {isSaving
                ? "Submitting..."
                : Object.keys(answers).length !== content.questions.length
                  ? `Answer all ${content.questions.length} questions (${Object.keys(answers).length}/${content.questions.length})`
                  : "Submit Answers"}
            </Button>
          ) : (
            <div className="bg-muted p-4 rounded-md text-center">
              <p className="text-lg font-semibold">Your score: {getScore()} out of 5</p>
              <p className="text-muted-foreground">
                {getScore() === 5
                  ? "Perfect! Great job!"
                  : getScore() > 2.5
                    ? "Good job! Keep practicing!"
                    : "Keep practicing to improve your score!"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

