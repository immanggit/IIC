"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { VolumeIcon as VolumeUp, Play, Pause } from "lucide-react"
import { ActivityActions } from "@/components/activities/activity-actions"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { saveActivityProgress } from "@/app/actions/activity-actions"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/utils/supabase/client"

interface ListeningActivityProps {
  activity: any
  onComplete?: (score: number) => void
  isCompleted?: boolean
  userAnswer?: string
  isLastActivity?: boolean
  courseId?: string
  nextActivityId?: string
  progress?: any
}

export default function ListeningActivity({
  activity,
  onComplete = () => {}, // Provide a default empty function
  isCompleted = false,
  userAnswer = "",
  isLastActivity = false,
  courseId,
  nextActivityId,
  progress,
}: ListeningActivityProps) {
  const [answers, setAnswers] = useState<Record<string, string>>(progress?.answers || {})
  const [isChecking, setIsChecking] = useState(false)
  const [submitted, setSubmitted] = useState(progress?.completed || false)
  const [score, setScore] = useState(progress?.score || 0)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [readingTime, setReadingTime] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const synth = typeof window !== "undefined" ? window.speechSynthesis : null
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  // Get content from activity
  const content = activity.content || {
    transcript: "This is a sample transcript for the listening activity.",
    audioFile: "",
    questions: [
      {
        id: "q1",
        text: "What is this activity about?",
        options: ["Reading", "Listening", "Writing", "Speaking"],
        correct: "Listening",
      },
    ],
  }

  // Handle audio playback
  const toggleAudio = () => {
    if (content.audioFile) {
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause()
        } else {
          audioRef.current.play()
        }
        setIsPlaying(!isPlaying)
      }
    } else {
      speakText()
    }
  }

  // Text-to-speech function
  const speakText = () => {
    if (!synth) return

    // Ensure content.transcript is a string
    let textToSpeak = String(content.transcript || "")

    // If the transcript is HTML, extract the text content
    if (textToSpeak.includes("<") && textToSpeak.includes(">")) {
      textToSpeak = textToSpeak.replace(/<[^>]*>/g, "")
    }

    if (!textToSpeak.trim()) return

    // Cancel any ongoing speech
    synth.cancel()

    if (isSpeaking) {
      setIsSpeaking(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak)

    // Set a slower speech rate (0.7 is slower than the default 1.0)
    utterance.rate = 0.7

    // Try to use a female voice if available
    const voices = synth.getVoices()
    const femaleVoice = voices.find((voice) => voice.name.includes("female") || voice.name.includes("Female"))
    if (femaleVoice) {
      utterance.voice = femaleVoice
    }

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    synth.speak(utterance)
  }

  // Handle answer selection
  const handleAnswerSelect = (questionId: string, answer: string) => {
    if (submitted) return // Don't allow changes if already submitted

    setAnswers({
      ...answers,
      [questionId]: answer,
    })
  }

  // Calculate score based on correct answers
  const getScore = () => {
    let correct = 0
    content.questions.forEach((question: any) => {
      if (answers[question.id] === question.correct) {
        correct++
      }
    })
    return Math.round((correct / content.questions.length) * 5) // Convert to score out of 5
  }

  // Handle submit
  const handleSubmit = async () => {
    // Check if all questions are answered
    if (Object.keys(answers).length !== content.questions.length) {
      toast({
        title: "Please answer all questions",
        description: "You need to answer all questions before submitting",
        variant: "destructive",
      })
      return
    }

    setIsChecking(true)
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

      const result = await saveActivityProgress(activityId, scoreValue, true, answers, readingTime)

      if (!result.success) {
        throw new Error(result.error || "Failed to save progress")
      }

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
      setIsChecking(false)
    }
  }

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (synth) {
        synth.cancel()
      }
    }
  }, [])

  // Track time spent
  useEffect(() => {
    if (!progress?.completed) {
      const interval = setInterval(() => {
        setReadingTime((prev) => prev + 1)
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [progress?.completed])

  // Initialize from saved progress
  useEffect(() => {
    if (progress?.completed) {
      setSubmitted(true)
      if (progress.answers) {
        setAnswers(progress.answers)
      }
    }
  }, [progress])

  return (
    <div ref={contentRef}>
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="md:flex justify-between items-center">
              <h3 className="text-lg font-medium">Listen and answer the questions</h3>
              <Button onClick={toggleAudio} variant="outline" className="flex items-center gap-2">
                {content.audioFile ? (
                  <>
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {isPlaying ? "Pause" : "Play Audio"}
                  </>
                ) : (
                  <>
                    <VolumeUp className="h-4 w-4" />
                    {isSpeaking ? "Stop" : "Listen"}
                  </>
                )}
              </Button>
            </div>

            {content.audioFile && (
              <audio ref={audioRef} src={content.audioFile} onEnded={() => setIsPlaying(false)} className="hidden" />
            )}

            {submitted ? (
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
            ) : (
              <>
                <div className="bg-muted p-4 rounded-md mt-2">
                  <p className="text-sm text-muted-foreground">
                    Listen to the audio and answer the questions below. You can play the audio as many times as you
                    need.
                  </p>
                </div>

                <div className="space-y-6 mt-4">
                  {content.questions.map((question: any, index: number) => (
                    <div key={question.id} className="space-y-3">
                      <h4 className="font-medium">
                        {index + 1}. {question.text}
                      </h4>
                      <RadioGroup
                        value={answers[question.id] || ""}
                        onValueChange={(value) => handleAnswerSelect(question.id, value)}
                        className="space-y-2"
                      >
                        {question.options.map((option: string) => (
                          <div key={option} className="flex items-center space-x-2">
                            <RadioGroupItem
                              value={option}
                              id={`${question.id}-${option}`}
                              disabled={submitted}
                              className={
                                submitted && option === question.correct
                                  ? "text-green-600 border-green-600"
                                  : submitted && answers[question.id] === option && option !== question.correct
                                    ? "text-red-600 border-red-600"
                                    : ""
                              }
                            />
                            <Label
                              htmlFor={`${question.id}-${option}`}
                              className={
                                submitted && option === question.correct
                                  ? "text-green-600"
                                  : submitted && answers[question.id] === option && option !== question.correct
                                    ? "text-red-600"
                                    : ""
                              }
                            >
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                      {submitted && answers[question.id] !== question.correct && (
                        <p className="text-sm text-red-500">Correct answer: {question.correct}</p>
                      )}
                    </div>
                  ))}
                </div>

                {!progress?.completed && (
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={handleSubmit}
                      disabled={Object.keys(answers).length !== content.questions.length || isChecking}
                    >
                      {isChecking
                        ? "Submitting..."
                        : Object.keys(answers).length !== content.questions.length
                          ? `Answer all ${content.questions.length} questions (${Object.keys(answers).length}/${
                              content.questions.length
                            })`
                          : "Submit Answers"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
      <ActivityActions
        isLastActivity={isLastActivity}
        onComplete={() => onComplete(score)}
        completed={submitted}
        userScore={score}
        userAnswer={userAnswer}
        courseId={courseId}
        activityId={activity.id}
        nextActivityId={nextActivityId}
      />
    </div>
  )
}

