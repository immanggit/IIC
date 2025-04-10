"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Trophy, Maximize, Minimize, Play, Pause } from "lucide-react"
import { saveActivityProgress } from "@/app/actions/activity-actions"
import { useToast } from "@/components/ui/use-toast"

interface VideoActivityProps {
  activity: any
  progress?: any
  isLastActivity?: boolean
  allActivitiesCompleted?: boolean
  courseId?: string
  nextActivityId?: string
}

export default function VideoActivity({
  activity,
  progress,
  isLastActivity = false,
  allActivitiesCompleted = false,
  courseId,
  nextActivityId,
}: VideoActivityProps) {
  const [activeTab, setActiveTab] = useState("video")
  const [showQuestions, setShowQuestions] = useState(progress?.completed || false)
  const [answers, setAnswers] = useState<Record<string, string>>(progress?.answers || {})
  const [submitted, setSubmitted] = useState(progress?.completed || false)
  const [videoError, setVideoError] = useState(false)
  const [score, setScore] = useState(progress?.score || 0)
  const [videoWatched, setVideoWatched] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLIFrameElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Sample video content and questions
  const content = activity.content || {
    videoId: "", // Will be handled with a fallback
    title: "Learn Colors with Animals",
    description: "Watch this fun video to learn about different colors and animals!",
    questions: [
      {
        id: "q1",
        text: "What color is the elephant in the video?",
        options: ["Gray", "Blue", "Pink", "Green"],
        correct: "Gray",
      },
      {
        id: "q2",
        text: "Which animal is yellow in the video?",
        options: ["Lion", "Giraffe", "Tiger", "Monkey"],
        correct: "Giraffe",
      },
      { id: "q3", text: "What color is the frog?", options: ["Red", "Blue", "Green", "Orange"], correct: "Green" },
      {
        id: "q4",
        text: "Which animal is red in the video?",
        options: ["Bird", "Fish", "Crab", "Fox"],
        correct: "Crab",
      },
    ],
  }

  // Check if videoId is valid
  const videoId = content.videoId || ""
  const hasValidVideo = videoId.length > 0

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers({
      ...answers,
      [questionId]: answer,
    })
  }

  const handleSubmit = async () => {
    setIsSaving(true)
    setSubmitted(true)
    const newScore = getScore()
    setScore(newScore)

    try {
      const result = await saveActivityProgress(activity.id, newScore, true, answers)

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

  // Handle video errors
  const handleVideoError = () => {
    console.error("Video error occurred")
    setVideoError(true)
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return

    if (!isFullscreen) {
      if (videoContainerRef.current.requestFullscreen) {
        videoContainerRef.current.requestFullscreen()
      } else if ((videoContainerRef.current as any).webkitRequestFullscreen) {
        ;(videoContainerRef.current as any).webkitRequestFullscreen()
      } else if ((videoContainerRef.current as any).msRequestFullscreen) {
        ;(videoContainerRef.current as any).msRequestFullscreen()
      }
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        ;(document as any).webkitExitFullscreen()
      } else if ((document as any).msExitFullscreen) {
        ;(document as any).msExitFullscreen()
      }
      setIsFullscreen(false)
    }
  }

  // Toggle play/pause
  const togglePlayPause = () => {
    if (!videoRef.current) return

    try {
      if (!isPlaying) {
        // Play video and enter fullscreen
        videoRef.current.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', "*")
        setIsPlaying(true)
        if (!isFullscreen) toggleFullscreen()
      } else {
        // Pause video and exit fullscreen
        videoRef.current.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', "*")
        setIsPlaying(false)
        if (isFullscreen) toggleFullscreen()
      }
    } catch (error) {
      console.error("Error controlling video:", error)
    }
  }

  // Mark video as watched after a certain time
  useEffect(() => {
    if (activeTab === "video" && !videoWatched) {
      const timer = setTimeout(() => {
        setVideoWatched(true)
      }, 30000) // Mark as watched after 30 seconds
      return () => clearTimeout(timer)
    }
  }, [activeTab, videoWatched])

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
      if (!document.fullscreenElement && isPlaying) {
        // If exiting fullscreen and video is playing, pause it
        if (videoRef.current) {
          videoRef.current.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', "*")
          setIsPlaying(false)
        }
      }
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange)
    document.addEventListener("mozfullscreenchange", handleFullscreenChange)
    document.addEventListener("MSFullscreenChange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange)
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange)
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange)
    }
  }, [isPlaying])

  // Initialize from saved progress
  useEffect(() => {
    if (progress?.completed) {
      setShowQuestions(true)
      setActiveTab("quiz")
      if (progress.answers) {
        setAnswers(progress.answers)
      }
      setSubmitted(true)
      setVideoWatched(true)
    }
  }, [progress])

  const handleBackToCourse = () => {
    if (courseId) {
      router.push(`/dashboard/courses/${courseId}`)
    } else {
      router.push("/dashboard/activities")
    }
  }

  const allQuestionsAnswered = Object.keys(answers).length === content.questions.length

  return (
    <div className="space-y-6">
      {isLastActivity && allActivitiesCompleted && submitted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center mb-6">
          <Trophy className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-700 mb-2">Congratulations!</h2>
          <p className="text-green-600 mb-4">
            You've completed all activities in this course. Great job on your learning journey!
          </p>
          <Button onClick={handleBackToCourse} className="bg-green-600 hover:bg-green-700">
            Back to Course
          </Button>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="video">Video</TabsTrigger>
          <TabsTrigger value="quiz" disabled={!showQuestions}>
            Quiz
          </TabsTrigger>
        </TabsList>

        <TabsContent value="video" className="mt-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              {hasValidVideo ? (
                <div
                  ref={videoContainerRef}
                  className={`aspect-video relative ${isFullscreen ? "fixed inset-0 z-50 bg-black" : ""}`}
                >
                  {videoError ? (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <Alert variant="destructive" className="max-w-md">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Video Error</AlertTitle>
                        <AlertDescription>
                          The video could not be loaded. Please try again later or continue to the quiz.
                        </AlertDescription>
                      </Alert>
                    </div>
                  ) : (
                    <>
                      <iframe
                        ref={videoRef}
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&disablekb=1&fs=0&modestbranding=1&rel=0&controls=0&showinfo=0&iv_load_policy=3&playsinline=1`}
                        title={content.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen={true}
                        onError={handleVideoError}
                      ></iframe>
                      <div className="absolute bottom-4 right-4 flex space-x-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="opacity-70 hover:opacity-100"
                          onClick={togglePlayPause}
                        >
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="opacity-70 hover:opacity-100"
                          onClick={toggleFullscreen}
                        >
                          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="aspect-video flex items-center justify-center bg-muted">
                  <Alert className="max-w-md">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>No Video Available</AlertTitle>
                    <AlertDescription>
                      There is no video for this activity. You can proceed directly to the quiz.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold">{content.title}</h3>
                <p className="text-muted-foreground">{content.description}</p>
              </div>
            </CardContent>
          </Card>

          {!showQuestions && (
            <Button
              onClick={() => {
                setShowQuestions(true)
                setActiveTab("quiz")
              }}
              className="w-full mt-4"
              disabled={!videoWatched}
            >
              {videoWatched ? "I've Watched the Video" : "Please watch the video first"}
            </Button>
          )}
        </TabsContent>

        <TabsContent value="quiz" className="mt-4">
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Video Quiz</h3>

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
              <Button onClick={handleSubmit} className="w-full" disabled={!allQuestionsAnswered || isSaving}>
                {isSaving ? "Submitting..." : "Submit Answers"}
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
                <div className="mt-4 flex justify-center gap-2">
                  <Button onClick={() => setActiveTab("video")} variant="outline">
                    Watch Video Again
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

