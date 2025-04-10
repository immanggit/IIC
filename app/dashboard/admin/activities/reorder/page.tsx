"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ArrowUp, ArrowDown, Save, ArrowLeft, GripVertical } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

export default function ReorderActivitiesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true)
      const { data } = await supabase.from("courses").select("id, title").order("title")
      setCourses(data || [])
      setIsLoading(false)
    }

    fetchCourses()
  }, [])

  useEffect(() => {
    const fetchActivities = async () => {
      if (!selectedCourse) return

      setIsLoading(true)
      const { data } = await supabase
        .from("activities")
        .select("id, title, type, order_index")
        .eq("course_id", selectedCourse)
        .order("order_index", { ascending: true })
        .order("created_at", { ascending: true })

      // Ensure all activities have an order_index
      const activitiesWithOrder = (data || []).map((activity, index) => ({
        ...activity,
        order_index: activity.order_index || index + 1,
      }))

      setActivities(activitiesWithOrder)
      setIsLoading(false)
    }

    fetchActivities()
  }, [selectedCourse])

  const moveActivity = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === activities.length - 1)) {
      return
    }

    const newActivities = [...activities]
    const swapIndex = direction === "up" ? index - 1 : index + 1

    // Swap the activities
    ;[newActivities[index], newActivities[swapIndex]] = [newActivities[swapIndex], newActivities[index]]

    // Update order_index values
    newActivities.forEach((activity, i) => {
      activity.order_index = i + 1
    })

    setActivities(newActivities)
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(activities)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update order_index values
    const updatedItems = items.map((item, index) => ({
      ...item,
      order_index: index + 1,
    }))

    setActivities(updatedItems)
  }

  const saveOrder = async () => {
    if (!selectedCourse || activities.length === 0) return

    setIsSaving(true)

    try {
      // Update each activity with its new order_index
      for (const activity of activities) {
        const orderData = {
          order_index: activity.order_index,
        }
        const { error } = await supabase.from("activities").update(orderData).eq("id", activity.id)
      }

      toast({
        title: "Order saved",
        description: "The activity order has been updated successfully.",
      })

      router.refresh()
    } catch (error) {
      console.error("Error saving activity order:", error)
      toast({
        title: "Error",
        description: "Failed to save activity order.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case "reading":
        return "📚"
      case "listening":
        return "🎧"
      case "quiz":
        return "❓"
      case "fill_blank":
        return "✏️"
      case "video":
        return "🎬"
      default:
        return "📝"
    }
  }

  return (
    <div className="container py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/admin?tab=activities">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Reorder Activities</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Activities</CardTitle>
          <CardDescription>Drag and drop activities to reorder them within a course</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="course-select" className="text-sm font-medium">
                Select Course
              </label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-full md:w-[300px]">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading && selectedCourse ? (
              <div className="text-center py-8">Loading activities...</div>
            ) : selectedCourse && activities.length === 0 ? (
              <div className="text-center py-8">No activities found for this course.</div>
            ) : selectedCourse ? (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button onClick={saveOrder} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Order"}
                  </Button>
                </div>

                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="activities">
                    {(provided) => (
                      <div className="border rounded-md" {...provided.droppableProps} ref={provided.innerRef}>
                        {activities.map((activity, index) => (
                          <Draggable key={activity.id} draggableId={activity.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="flex items-center justify-between p-4 border-b last:border-b-0"
                              >
                                <div className="flex items-center gap-3">
                                  <div {...provided.dragHandleProps} className="cursor-grab">
                                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                  <span className="text-lg font-medium bg-muted w-8 h-8 rounded-full flex items-center justify-center">
                                    {index + 1}
                                  </span>
                                  <span className="text-xl mr-2">{getActivityTypeIcon(activity.type)}</span>
                                  <span>{activity.title}</span>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => moveActivity(index, "up")}
                                    disabled={index === 0}
                                  >
                                    <ArrowUp className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => moveActivity(index, "down")}
                                    disabled={index === activities.length - 1}
                                  >
                                    <ArrowDown className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

