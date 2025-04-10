"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CheckCircle, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { saveActivityProgress } from "@/app/actions/activity-actions"
import { useToast } from "@/components/ui/use-toast"

// Update the interface to include new props
interface FillBlanksActivityProps {
  activity: any
  progress?: any
  isLastActivity?: boolean
  courseId?: string
  nextActivityId?: string
}

// Update the component parameters to include new props
export default function FillBlanksActivity({
  activity,
  progress,
  isLastActivity = false,
  courseId,
  nextActivityId,
}: FillBlanksActivityProps) {
  const [answers, setAnswers] = useState<Record<string, string>>(progress?.answers || {})
  const [submitted, setSubmitted] = useState(progress?.completed || false)
  const [score, setScore] = useState(progress?.score || 0)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Sample fill in the blanks exercise
  const content = activity.content || {
    title: "Animals and Their Homes",
    instructions: "Fill in the blanks with the correct animal names.",
    sentences: [
      { id: "s1", text: "A _____ lives in a den.", answer: "fox" },
      { id: "s2", text: "A _____ builds a nest in trees.", answer: "bird" },
      { id: "s3", text: "A _____ lives in a hive and makes honey.", answer: "bee" },
      { id: "s4", text: "A _____ builds a dam in the river.", answer: "beaver" },
      { id: "s5", text: "A _____ carries its home on its back.", answer: "snail" },
    ],
  }

  const handleAnswerChange = (sentenceId: string, value: string) => {
    setAnswers({
      ...answers,
      [sentenceId]: value,
    })
  }

  const handleSubmit = async () => {
    // Validate that all questions have answers
    if (Object.keys(answers).length !== content.sentences.length) {
      return // Don't submit if not all questions are answered
    }

    setIsSaving(true)
    setSubmitted(true)
    const newScore = getScore()
    setScore(newScore)

    try {
      // Save progress to the database
      if (activity.id) {
        // Pass individual parameters to match the function signature
        await saveActivityProgress(
          String(activity.id), // activityId as string
          newScore, // score
          true, // completed
          answers, // answers
          0, // timeSpent (Fill blanks doesn't track time)
        )

        toast({
          title: "Activity completed",
          description: "Your progress has been saved successfully.",
        })
      }
    } catch (error) {
      console.error("Error saving progress:", error)
      toast({
        title: "Error saving progress",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
      // Refresh the page to show updated progress
      router.refresh()
    }
  }

  const getScore = () => {
    let correct = 0
    content.sentences.forEach((sentence: any) => {
      if (answers[sentence.id]?.toLowerCase() === sentence.answer.toLowerCase()) {
        correct++
      }
    })
    // Calculate score out of 5
    return Math.round((correct / content.sentences.length) * 5)
  }

  const renderSentence = (sentence: any) => {
    // Split the text by the blank placeholder
    const parts = sentence.text.split("_____")

    // Ensure we don't have more than 2 parts (1 blank)
    // If there are more blanks, we'll only use the first one
    const firstPart = parts[0] || ""
    const secondPart = parts.slice(1).join(" _____ ") || ""

    return (
      <div className="flex items-center flex-wrap">
        <span>{firstPart}</span>
        <Input
          value={answers[sentence.id] || ""}
          onChange={(e) => handleAnswerChange(sentence.id, e.target.value)}
          className="w-32 inline-block mx-2"
          disabled={submitted}
        />
        <span>{secondPart}</span>

        {submitted && (
          <span className="ml-2">
            {answers[sentence.id]?.toLowerCase() === sentence.answer.toLowerCase() ? (
              <CheckCircle className="h-5 w-5 text-green-500 inline" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500 inline" />
            )}
          </span>
        )}
      </div>
    )
  }

  // Initialize from saved progress
  useEffect(() => {
    if (progress?.completed && progress.answers) {
      setAnswers(progress.answers)
      setSubmitted(true)
      setScore(progress.score || 0)
    }
  }, [progress])

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground">{content.instructions}</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          {content.sentences.map((sentence: any) => (
            <div key={sentence.id} className="py-2">
              {renderSentence(sentence)}
              {submitted && answers[sentence.id]?.toLowerCase() !== sentence.answer.toLowerCase() && (
                <p className="text-sm text-red-500 mt-1">Correct answer: {sentence.answer}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {!submitted ? (
        <Button
          onClick={handleSubmit}
          className="w-full"
          disabled={Object.keys(answers).length !== content.sentences.length || isSaving}
        >
          {isSaving
            ? "Saving..."
            : Object.keys(answers).length !== content.sentences.length
              ? `Fill all ${content.sentences.length} blank(s)`
              : "Check Answers"}
        </Button>
      ) : (
        <div className="bg-muted p-4 rounded-md text-center">
          <p className="text-lg font-semibold">Your score: {score} out of 5</p>
          <p className="text-muted-foreground">
            {score === 5
              ? "Perfect! Great job!"
              : score > 2
                ? "Good job! Keep practicing!"
                : "Keep practicing to improve your score!"}
          </p>
        </div>
      )}
    </div>
  )
}

