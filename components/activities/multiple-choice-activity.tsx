"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { saveActivityProgress } from "@/app/actions/activity-actions"
import { useToast } from "@/components/ui/use-toast"

interface MultipleChoiceActivityProps {
  activity: any
  progress?: any
}

export default function MultipleChoiceActivity({ activity, progress }: MultipleChoiceActivityProps) {
  const [isChecking, setIsChecking] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>(progress?.answers || {})
  const [showResult, setShowResult] = useState(progress?.completed || false)
  const [score, setScore] = useState(progress?.score || 0)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Use real questions from activity content
  const questions = activity.content?.questions || []

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion]: answer,
    })
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const calculateScore = () => {
    let correctAnswers = 0
    for (let i = 0; i < questions.length; i++) {
      if (selectedAnswers[i] === questions[i].correctAnswer) {
        correctAnswers++
      }
    }
    // Calculate score out of 5
    return Math.round((correctAnswers / questions.length) * 5)
  }

  const handleSubmit = async () => {
    setIsSaving(true)
    const newScore = calculateScore()
    setScore(newScore)
    setShowResult(true)
    setIsChecking(true)

    try {
      const result = await saveActivityProgress(activity.id, newScore, true, selectedAnswers)

      if (!result.success) {
        throw new Error(result.error || "Failed to save progress")
      }

      toast({
        title: "Activity completed",
        description: "Your progress has been saved successfully.",
      })

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
      setIsChecking(false)
    }
  }

  // Initialize from saved progress
  useEffect(() => {
    if (progress?.completed && progress.answers) {
      setSelectedAnswers(progress.answers)
      setShowResult(true)
      setScore(progress.score || 0)
    }
  }, [progress])

  if (questions.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">No questions available for this activity.</p>
      </div>
    )
  }

  if (showResult) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-2xl font-bold mb-4">Quiz Results</h3>
            <div className="text-5xl font-bold mb-4">{score} / 5</div>
            <p className="text-lg mb-6">
              {score === 5
                ? "Perfect! You got all the answers correct!"
                : score >= 3
                  ? "Good job! You're doing well!"
                  : "Keep practicing to improve your score!"}
            </p>
            <div className="space-y-4 mb-6">
              {questions.map((q, index) => (
                <div key={index} className="flex items-start space-x-2 text-left">
                  {selectedAnswers[index] === q.correctAnswer ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">{q.question}</p>
                    <p className="text-sm">
                      Your answer:{" "}
                      <span
                        className={
                          selectedAnswers[index] === q.correctAnswer
                            ? "text-green-500 font-medium"
                            : "text-red-500 font-medium"
                        }
                      >
                        {selectedAnswers[index]}
                      </span>
                    </p>
                    {selectedAnswers[index] !== q.correctAnswer && (
                      <p className="text-sm">
                        Correct answer: <span className="text-green-500 font-medium">{q.correctAnswer}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          Question {currentQuestion + 1} of {questions.length}
        </h3>
        <div className="text-sm text-muted-foreground">
          {Object.keys(selectedAnswers).length} of {questions.length} answered
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <h4 className="text-xl font-semibold mb-4">{questions[currentQuestion]?.question}</h4>
          <RadioGroup value={selectedAnswers[currentQuestion]} onValueChange={handleAnswerSelect} className="space-y-3">
            {questions[currentQuestion]?.options.map((option, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 transition-colors"
              >
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
          Previous
        </Button>
        <Button onClick={handleNext} disabled={!selectedAnswers[currentQuestion]}>
          {currentQuestion === questions.length - 1 ? "Finish" : "Next"}
        </Button>
      </div>

      {!progress?.completed && (
        <div className="flex justify-end gap-2">
          <Button
            onClick={handleSubmit}
            disabled={Object.keys(selectedAnswers).length !== questions.length || isChecking}
          >
            {isChecking
              ? "Submitting..."
              : Object.keys(selectedAnswers).length !== questions.length
                ? `Answer all ${questions.length} questions (${Object.keys(selectedAnswers).length}/${
                    questions.length
                  })`
                : "Submit Answers"}
          </Button>
        </div>
      )}
    </div>
  )
}

