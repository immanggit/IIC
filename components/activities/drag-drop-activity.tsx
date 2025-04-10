"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { saveActivityProgress } from "@/app/actions/activity-actions"
import { useToast } from "@/components/ui/use-toast"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { restrictToWindowEdges } from "@dnd-kit/modifiers"
import { Loader2 } from "lucide-react"

interface DragDropActivityProps {
  activity: any
  progress?: any
  isLastActivity?: boolean
  courseId?: string
  nextActivityId?: string
}

interface DraggableItemProps {
  id: string
  term: string
  isCorrect: boolean | null
}

interface DroppableZoneProps {
  id: string
  match: string
  image?: string
  onDrop: (id: string, itemId: string) => void
  correctItemId?: string
  currentItemId?: string
  isCorrect: boolean | null
}

const DraggableItem = ({ id, term, isCorrect }: DraggableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  let bgColor = "bg-white"
  if (isCorrect === true) bgColor = "bg-green-100"
  else if (isCorrect === false) bgColor = "bg-red-100"

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-3 mb-2 border rounded-md shadow-sm cursor-grab ${bgColor} hover:shadow-md transition-shadow`}
    >
      {term}
    </div>
  )
}

const DroppableZone = ({ id, match, image, onDrop, correctItemId, currentItemId, isCorrect }: DroppableZoneProps) => {
  let borderColor = "border-gray-200"
  if (isCorrect === true) borderColor = "border-green-500"
  else if (isCorrect === false) borderColor = "border-red-500"

  return (
    <div
      className={`p-4 border-2 ${borderColor} rounded-md min-h-[100px] flex flex-col items-center justify-center transition-colors`}
      data-id={id}
    >
      {image && (
        <div className="mb-2 w-full">
          <img src={image || "/placeholder.svg"} alt={match} className="w-full h-32 object-cover rounded-md" />
        </div>
      )}
      <p className="text-center">{match}</p>
      {currentItemId && (
        <div className="mt-2 p-2 bg-blue-50 rounded-md w-full text-center">
          {currentItemId.split("-")[1]} {/* Display the term that was dropped */}
        </div>
      )}
    </div>
  )
}

export default function DragDropActivity({
  activity,
  progress,
  isLastActivity,
  courseId,
  nextActivityId,
}: DragDropActivityProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [startTime, setStartTime] = useState<number>(Date.now())

  // Extract pairs from activity content
  const pairs = activity.content?.pairs || []

  // State for tracking matches
  const [matches, setMatches] = useState<Record<string, string | null>>({})
  const [results, setResults] = useState<Record<string, boolean | null>>({})

  // Create draggable items from pairs
  const [items, setItems] = useState<string[]>([])

  // Initialize on component mount
  useEffect(() => {
    if (pairs.length > 0) {
      // Create item IDs from pairs
      const initialItems = pairs.map((pair: any) => `item-${pair.term}-${pair.id}`)
      // Shuffle the items
      setItems([...initialItems].sort(() => Math.random() - 0.5))

      // Initialize matches with null values
      const initialMatches: Record<string, string | null> = {}
      const initialResults: Record<string, boolean | null> = {}
      pairs.forEach((pair: any) => {
        initialMatches[pair.id] = null
        initialResults[pair.id] = null
      })
      setMatches(initialMatches)
      setResults(initialResults)
    }

    // Set completion status from progress
    if (progress?.completed) {
      setIsCompleted(true)
      setScore(progress.score || 0)

      // If we have saved answers, restore them
      if (progress.answers && progress.answers.matches) {
        setMatches(progress.answers.matches)

        // Calculate results based on saved matches
        const savedResults: Record<string, boolean | null> = {}
        Object.entries(progress.answers.matches).forEach(([zoneId, itemId]) => {
          if (itemId) {
            const correctPair = pairs.find((p: any) => p.id === zoneId)
            const droppedTerm = String(itemId).split("-")[1]
            savedResults[zoneId] = correctPair.term === droppedTerm
          } else {
            savedResults[zoneId] = null
          }
        })
        setResults(savedResults)
      }
    }

    // Set start time for new attempts
    if (!progress?.completed) {
      setStartTime(Date.now())
    }
  }, [pairs, progress])

  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      // Get the drop zone ID
      const zoneId = String(over.id)
      // Get the dragged item ID
      const itemId = String(active.id)

      // Update matches
      setMatches((prev) => ({
        ...prev,
        [zoneId]: itemId,
      }))

      // Check if match is correct
      const correctPair = pairs.find((p: any) => p.id === zoneId)
      const droppedTerm = itemId.split("-")[1]

      // Update results
      setResults((prev) => ({
        ...prev,
        [zoneId]: correctPair.term === droppedTerm,
      }))

      // Update items order
      setItems((items) => {
        const oldIndex = items.indexOf(itemId)
        const newIndex = items.indexOf(itemId)
        return arrayMove(items, oldIndex, newIndex)
      })
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

  // Check if all zones have matches
  const allZonesHaveMatches = Object.values(matches).every((match) => match !== null)

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">{activity.content?.title || "Drag and Drop Activity"}</h3>
        <p className="text-muted-foreground">
          {activity.content?.instructions || "Match the items by dragging and dropping."}
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToWindowEdges]}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Terms</h4>
              <SortableContext items={items}>
                {items.map((id) => {
                  const termPart = id.split("-")[1]
                  // Find which zone this item is currently matched with
                  const matchedZoneId = Object.entries(matches).find(([_, itemId]) => itemId === id)?.[0]
                  // Determine if this match is correct
                  const isCorrect = matchedZoneId ? results[matchedZoneId] : null

                  return <DraggableItem key={id} id={id} term={termPart} isCorrect={isCorrect} />
                })}
              </SortableContext>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Definitions</h4>
              <div className="grid grid-cols-1 gap-4">
                {pairs.map((pair: any) => (
                  <DroppableZone
                    key={pair.id}
                    id={pair.id}
                    match={pair.match}
                    image={pair.image}
                    onDrop={(zoneId, itemId) => {
                      setMatches((prev) => ({ ...prev, [zoneId]: itemId }))
                    }}
                    correctItemId={`item-${pair.term}-${pair.id}`}
                    currentItemId={matches[pair.id]}
                    isCorrect={results[pair.id]}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} disabled={isSubmitting || !allZonesHaveMatches}>
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
        </DndContext>
      )}
    </div>
  )
}

