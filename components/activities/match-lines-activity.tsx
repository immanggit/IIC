"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { saveActivityProgress } from "@/app/actions/activity-actions"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface MatchLinesActivityProps {
  activity: any
  progress?: any
  isLastActivity?: boolean
  courseId?: string
  nextActivityId?: string
}

interface TermProps {
  id: string
  text: string
  isSelected: boolean
  isMatched: boolean
  isCorrect: boolean | null
  onClick: () => void
}

const Term = ({ id, text, isSelected, isMatched, isCorrect, onClick }: TermProps) => {
  let bgColor = "bg-white"
  if (isSelected) bgColor = "bg-blue-100"
  else if (isMatched && isCorrect === true) bgColor = "bg-green-100"
  else if (isMatched && isCorrect === false) bgColor = "bg-red-100"

  return (
    <div
      id={id}
      className={`p-3 border rounded-md shadow-sm cursor-pointer ${bgColor} hover:bg-gray-50 transition-colors`}
      onClick={onClick}
    >
      {text}
    </div>
  )
}

export default function MatchLinesActivity({
  activity,
  progress,
  isLastActivity,
  courseId,
  nextActivityId,
}: MatchLinesActivityProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [startTime, setStartTime] = useState<number>(Date.now())

  // Extract pairs from activity content
  const pairs = activity.content?.pairs || []

  // State for tracking matches and selections
  const [matches, setMatches] = useState<Record<string, string>>({})
  const [results, setResults] = useState<Record<string, boolean>>({})
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null)

  // Canvas ref for drawing lines
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Initialize on component mount
  useEffect(() => {
    if (progress?.completed) {
      setIsCompleted(true)
      setScore(progress.score || 0)

      // If we have saved answers, restore them
      if (progress.answers && progress.answers.matches) {
        setMatches(progress.answers.matches)

        // Calculate results based on saved matches
        const savedResults: Record<string, boolean> = {}
        Object.entries(progress.answers.matches).forEach(([termId, matchId]) => {
          const [_, termPairId] = termId.split("-")
          const [__, matchPairId] = matchId.split("-")
          savedResults[termPairId] = termPairId === matchPairId
        })
        setResults(savedResults)

        // Redraw lines after a short delay to ensure elements are rendered
        setTimeout(drawAllLines, 100)
      }
    } else {
      setStartTime(Date.now())
    }

    // Set up canvas resize handler
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        canvasRef.current.width = containerRef.current.offsetWidth
        canvasRef.current.height = containerRef.current.offsetHeight
        drawAllLines()
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [progress])

  // Draw all matched lines
  const drawAllLines = () => {
    if (!canvasRef.current || !containerRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw each match line
    Object.entries(matches).forEach(([termId, matchId]) => {
      const termElement = document.getElementById(termId)
      const matchElement = document.getElementById(matchId)

      if (termElement && matchElement) {
        const termRect = termElement.getBoundingClientRect()
        const matchRect = matchElement.getBoundingClientRect()
        const containerRect = containerRef.current!.getBoundingClientRect()

        // Calculate positions relative to the container
        const startX = termRect.right - containerRect.left
        const startY = termRect.top + termRect.height / 2 - containerRect.top
        const endX = matchRect.left - containerRect.left
        const endY = matchRect.top + matchRect.height / 2 - containerRect.top

        // Get pair ID to determine if match is correct
        const [_, termPairId] = termId.split("-")
        const isCorrect = results[termPairId]

        // Set line style based on correctness
        ctx.lineWidth = 2
        if (isCorrect) {
          ctx.strokeStyle = "#10b981" // green
        } else {
          ctx.strokeStyle = "#ef4444" // red
        }

        // Draw line
        ctx.beginPath()
        ctx.moveTo(startX, startY)
        ctx.lineTo(endX, endY)
        ctx.stroke()
      }
    })
  }

  // Handle term or match click
  const handleItemClick = (id: string, type: "term" | "match") => {
    if (isCompleted) return

    // If no term is selected, select this one (if it's a term)
    if (!selectedTerm && type === "term") {
      setSelectedTerm(id)
      return
    }

    // If a term is already selected
    if (selectedTerm) {
      // If clicking the same term, deselect it
      if (selectedTerm === id) {
        setSelectedTerm(null)
        return
      }

      // If clicking a match and a term is selected, create a match
      if (type === "match") {
        const termId = selectedTerm
        const matchId = id

        // Extract pair IDs
        const [_, termPairId] = termId.split("-")
        const [__, matchPairId] = matchId.split("-")

        // Update matches
        setMatches((prev) => ({
          ...prev,
          [termId]: matchId,
        }))

        // Check if match is correct
        const isCorrect = termPairId === matchPairId

        // Update results
        setResults((prev) => ({
          ...prev,
          [termPairId]: isCorrect,
        }))

        // Clear selection
        setSelectedTerm(null)

        // Redraw lines
        setTimeout(drawAllLines, 50)
      }
    }
  }

  // Handle save/submit
  const handleSave = async () => {
    if (isCompleted) return

    setIsSubmitting(true)

    try {
      // Calculate score
      const totalPairs = pairs.length
      const correctMatches = Object.values(results).filter((r) => r === true).length
      const calculatedScore = Math.round((correctMatches / totalPairs) * 100)

      // Calculate time spent
      const timeSpent = Math.round((Date.now() - startTime) / 1000)

      // Save progress
      await saveActivityProgress(
        activity.id,
        calculatedScore,
        true, // completed
        { matches, results }, // answers
        timeSpent,
      )

      setScore(calculatedScore)
      setIsCompleted(true)

      toast({
        title: "Progress saved",
        description: `You scored ${calculatedScore}% on this activity.`,
      })
    } catch (error) {
      console.error("Error saving progress:", error)
      toast({
        title: "Error",
        description: "Failed to save your progress. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check if all terms have matches
  const allTermsMatched = pairs.every((pair) => Object.keys(matches).some((termId) => termId.includes(`-${pair.id}`)))

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">{activity.content?.title || "Match with Lines Activity"}</h3>
        <p className="text-muted-foreground">
          {activity.content?.instructions ||
            "Click on a term and then click on its matching definition to connect them with a line."}
        </p>
      </div>

      {isCompleted ? (
        <div className="bg-muted p-4 rounded-md mb-6">
          <h3 className="font-medium mb-2">Activity Completed</h3>
          <p>Your score: {score}%</p>
          {nextActivityId && (
            <Button asChild className="mt-4">
              <a href={`/dashboard/activities/${nextActivityId}?courseId=${courseId}`}>Next Activity</a>
            </Button>
          )}
        </div>
      ) : (
        <div className="relative" ref={containerRef}>
          <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Terms</h4>
              <div className="space-y-3">
                {pairs.map((pair: any) => {
                  const termId = `term-${pair.id}`
                  const isMatched = Object.keys(matches).includes(termId)
                  const isCorrect = isMatched ? results[pair.id] : null

                  return (
                    <Term
                      key={termId}
                      id={termId}
                      text={pair.term}
                      isSelected={selectedTerm === termId}
                      isMatched={isMatched}
                      isCorrect={isCorrect}
                      onClick={() => handleItemClick(termId, "term")}
                    />
                  )
                })}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Definitions</h4>
              <div className="space-y-3">
                {/* Shuffle the matches for display */}
                {[...pairs]
                  .sort(() => Math.random() - 0.5)
                  .map((pair: any) => {
                    const matchId = `match-${pair.id}`
                    const isMatched = Object.values(matches).includes(matchId)

                    // Find the term that matches this definition
                    const matchingTermId = Object.entries(matches).find(([_, mId]) => mId === matchId)?.[0]
                    const [_, termPairId] = matchingTermId ? matchingTermId.split("-") : ["", ""]
                    const isCorrect = isMatched ? results[termPairId] : null

                    return (
                      <Term
                        key={matchId}
                        id={matchId}
                        text={pair.match}
                        isSelected={false} // Matches can't be selected first
                        isMatched={isMatched}
                        isCorrect={isCorrect}
                        onClick={() => handleItemClick(matchId, "match")}
                      />
                    )
                  })}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} disabled={isSubmitting || !allTermsMatched}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save & Complete"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

