"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { saveActivityProgress } from "@/app/actions/activity-actions"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"

interface FlipCardsActivityProps {
  activity: any
  progress?: any
  isLastActivity?: boolean
  courseId?: string
  nextActivityId?: string
}

interface FlipCardProps {
  id: string
  content: string
  isFlipped: boolean
  isMatched: boolean
  onClick: () => void
}

const FlipCard = ({ id, content, isFlipped, isMatched, onClick }: FlipCardProps) => {
  return (
    <div className="relative h-32 cursor-pointer perspective-500" onClick={onClick}>
      <motion.div
        className={`absolute inset-0 w-full h-full rounded-md backface-hidden transition-all duration-500 ${isMatched ? "pointer-events-none" : ""}`}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 w-full h-full bg-primary rounded-md flex items-center justify-center text-white font-bold text-xl">
          ?
        </div>
      </motion.div>

      <motion.div
        className="absolute inset-0 w-full h-full rounded-md backface-hidden transition-all duration-500"
        animate={{ rotateY: isFlipped ? 0 : -180 }}
        transition={{ duration: 0.5 }}
        style={{ backfaceVisibility: "hidden" }}
      >
        <div
          className={`absolute inset-0 w-full h-full p-3 flex items-center justify-center text-center rounded-md ${isMatched ? "bg-green-100" : "bg-white"} border shadow-sm`}
        >
          {content}
        </div>
      </motion.div>
    </div>
  )
}

export default function FlipCardsActivity({
  activity,
  progress,
  isLastActivity,
  courseId,
  nextActivityId,
}: FlipCardsActivityProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [startTime, setStartTime] = useState<number>(Date.now())

  // Extract pairs from activity content
  const pairs = activity.content?.pairs || []

  // State for tracking cards
  const [cards, setCards] = useState<any[]>([])
  const [flippedCards, setFlippedCards] = useState<string[]>([])
  const [matchedPairs, setMatchedPairs] = useState<string[]>([])

  // Initialize on component mount
  useEffect(() => {
    if (pairs.length > 0) {
      // Create cards from pairs (terms and matches)
      const allCards = pairs.flatMap((pair) => [
        { id: `term-${pair.id}`, content: pair.term, pairId: pair.id, type: "term" },
        { id: `match-${pair.id}`, content: pair.match, pairId: pair.id, type: "match" },
      ])

      // Shuffle the cards
      setCards([...allCards].sort(() => Math.random() - 0.5))
    }

    // Set completion status from progress
    if (progress?.completed) {
      setIsCompleted(true)
      setScore(progress.score || 0)

      // If we have saved answers, restore matched pairs
      if (progress.answers && progress.answers.matchedPairs) {
        setMatchedPairs(progress.answers.matchedPairs)
      }
    } else {
      setStartTime(Date.now())
    }
  }, [pairs, progress])

  // Handle card click
  const handleCardClick = (cardId: string) => {
    if (isCompleted || matchedPairs.includes(cardId.split("-")[1])) return

    // Don't allow clicking more than 2 cards at once
    if (flippedCards.length === 2) return

    // Don't allow clicking the same card twice
    if (flippedCards.includes(cardId)) return

    // Flip the card
    setFlippedCards((prev) => [...prev, cardId])

    // If this is the second card, check for a match
    if (flippedCards.length === 1) {
      const firstCard = cards.find((card) => card.id === flippedCards[0])
      const secondCard = cards.find((card) => card.id === cardId)

      // Check if the pair IDs match
      if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
        // It's a match!
        setMatchedPairs((prev) => [...prev, firstCard.pairId])
        // Clear flipped cards after a short delay
        setTimeout(() => {
          setFlippedCards([])
        }, 1000)
      } else {
        // Not a match, flip cards back after a delay
        setTimeout(() => {
          setFlippedCards([])
        }, 1500)
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
      const correctMatches = matchedPairs.length
      const calculatedScore = Math.round((correctMatches / totalPairs) * 100)

      // Calculate time spent
      const timeSpent = Math.round((Date.now() - startTime) / 1000)

      // Save progress
      await saveActivityProgress(
        activity.id,
        calculatedScore,
        true, // completed
        { matchedPairs }, // answers
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

  // Check if all pairs are matched
  const allPairsMatched = matchedPairs.length === pairs.length

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">{activity.content?.title || "Flip Cards Activity"}</h3>
        <p className="text-muted-foreground">
          {activity.content?.instructions || "Flip cards to find matching pairs of terms and definitions."}
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
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {cards.map((card) => (
              <FlipCard
                key={card.id}
                id={card.id}
                content={card.content}
                isFlipped={flippedCards.includes(card.id) || matchedPairs.includes(card.pairId)}
                isMatched={matchedPairs.includes(card.pairId)}
                onClick={() => handleCardClick(card.id)}
              />
            ))}
          </div>

          <div className="mt-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">
                Matched: {matchedPairs.length} of {pairs.length} pairs
              </p>
            </div>

            <Button onClick={handleSave} disabled={isSubmitting}>
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
        </>
      )}
    </div>
  )
}

