"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/utils/supabase/client"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

const activityFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  course_id: z.string().min(1, { message: "Please select a course" }),
  type: z.enum(["reading", "listening", "quiz", "fill_blank", "video", "drag_drop", "match_lines", "flip_cards"]),
  status: z.enum(["draft", "published"]),
  order_index: z.number().optional(),
  content: z.any().optional(),
})

interface ActivityFormProps {
  courses: { id: string; title: string }[]
  activity?: any
  initialCourseId?: string
  initialOrderIndex?: number
}

export default function ActivityForm({ courses, activity, initialCourseId, initialOrderIndex }: ActivityFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const isEditing = !!activity

  // Initialize form with activity data if editing
  const form = useForm<z.infer<typeof activityFormSchema>>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      title: activity?.title || "",
      description: activity?.description || "",
      course_id: activity?.course_id || initialCourseId || "",
      type: activity?.type || "reading",
      status: activity?.status || "draft",
      order_index: activity?.order_index || initialOrderIndex || 1,
      content: activity?.content || {},
    },
  })

  async function onSubmit(values: z.infer<typeof activityFormSchema>) {
    setIsSubmitting(true)

    try {
      let result

      if (isEditing) {
        // Update existing activity
        const { error } = await supabase
          .from("activities")
          .update({
            title: values.title,
            description: values.description,
            course_id: values.course_id,
            type: values.type,
            status: values.status,
            order_index: values.order_index,
            content: values.content,
            updated_at: new Date().toISOString(),
          })
          .eq("id", activity.id)

        if (error) throw error
        result = { success: true, id: activity.id }
      } else {
        // Create new activity
        const { data, error } = await supabase
          .from("activities")
          .insert({
            title: values.title,
            description: values.description,
            course_id: values.course_id,
            type: values.type,
            status: values.status,
            order_index: values.order_index,
            content: values.content,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) throw error
        result = { success: true, id: data.id }
      }

      toast({
        title: isEditing ? "Activity updated" : "Activity created",
        description: isEditing
          ? "The activity has been updated successfully."
          : "The activity has been created successfully.",
      })

      // Redirect to reorder page if status is published, otherwise to activities tab
      if (values.status === "published") {
        router.push("/dashboard/admin/activities/reorder")
        // Add a small delay before refreshing to ensure the redirect happens
        setTimeout(() => {
          window.location.reload()
        }, 500)
      } else {
        router.push("/dashboard/admin?tab=activities")
      }
    } catch (error: any) {
      console.error("Error submitting activity:", error)
      toast({
        title: "Error",
        description: error.message || "An error occurred while saving the activity.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Generate content template based on activity type
  const generateContentTemplate = (type: string) => {
    switch (type) {
      case "reading":
        return {
          text: "Enter the reading text here...",
          questions: [
            {
              question: "Sample question 1?",
              options: ["Option 1", "Option 2", "Option 3", "Option 4"],
              correctAnswer: "Option 1",
            },
          ],
        }
      case "listening":
        return {
          audioUrl: "",
          transcript: "Enter the transcript here...",
          questions: [
            {
              question: "Sample question 1?",
              options: ["Option 1", "Option 2", "Option 3", "Option 4"],
              correctAnswer: "Option 1",
            },
          ],
        }
      case "quiz":
        return {
          questions: [
            {
              question: "Sample question 1?",
              options: ["Option 1", "Option 2", "Option 3", "Option 4"],
              correctAnswer: "Option 1",
            },
          ],
        }
      case "fill_blank":
        return {
          title: "Fill in the Blanks Exercise",
          instructions: "Fill in the blanks with the correct words.",
          sentences: [
            { id: "s1", text: "The cat sat on the _____.", answer: "mat" },
            { id: "s2", text: "I like to eat _____ for breakfast.", answer: "cereal" },
          ],
        }
      case "video":
        return {
          videoId: "", // YouTube video ID
          title: "Video Title",
          description: "Video description goes here...",
          questions: [
            {
              id: "q1",
              text: "Sample question 1?",
              options: ["Option 1", "Option 2", "Option 3", "Option 4"],
              correct: "Option 1",
            },
          ],
        }
      case "drag_drop":
        return {
          title: "Drag and Drop Exercise",
          instructions: "Drag the items on the left and drop them on their matching items on the right.",
          pairs: [
            {
              id: "p1",
              term: "Term 1",
              match: "Definition 1",
              image: "https://example.com/image1.jpg", // Optional
            },
            {
              id: "p2",
              term: "Term 2",
              match: "Definition 2",
              image: "https://example.com/image2.jpg", // Optional
            },
          ],
        }
      case "match_lines":
        return {
          title: "Match with Lines Exercise",
          instructions: "Click on a term and then click on its matching definition to connect them with a line.",
          pairs: [
            {
              id: "p1",
              term: "Term 1",
              match: "Definition 1",
            },
            {
              id: "p2",
              term: "Term 2",
              match: "Definition 2",
            },
          ],
        }
      case "flip_cards":
        return {
          title: "Flip Card Matching Exercise",
          instructions: "Flip cards to find matching pairs of terms and definitions.",
          pairs: [
            {
              id: "p1",
              term: "Term 1",
              match: "Definition 1",
            },
            {
              id: "p2",
              term: "Term 2",
              match: "Definition 2",
            },
          ],
        }
      default:
        return {}
    }
  }

  // Update content when activity type changes
  const handleTypeChange = (type: string) => {
    // Only update content if it's a new activity or if the type has changed
    if (!isEditing || type !== activity?.type) {
      form.setValue("content", generateContentTemplate(type))
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Activity title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="course_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Activity description" rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Activity Type</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value)
                    handleTypeChange(value)
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="reading">Reading</SelectItem>
                    <SelectItem value="listening">Listening</SelectItem>
                    <SelectItem value="quiz">Multiple Choice</SelectItem>
                    <SelectItem value="fill_blank">Fill in the Blanks</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="drag_drop">Drag and Drop</SelectItem>
                    <SelectItem value="match_lines">Match with Lines</SelectItem>
                    <SelectItem value="flip_cards">Flip Cards</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>This determines the type of activity and its content structure.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Draft activities are not visible to students.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="order_index"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order Index</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    {...field}
                    onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <FormDescription>Determines the order of activities in a course.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content (JSON)</FormLabel>
              <FormControl>
                <Textarea
                  rows={10}
                  value={JSON.stringify(field.value, null, 2)}
                  onChange={(e) => {
                    try {
                      field.onChange(JSON.parse(e.target.value))
                    } catch (error) {
                      // If JSON is invalid, just store the raw string
                      field.onChange(e.target.value)
                    }
                  }}
                  className="font-mono text-sm"
                />
              </FormControl>
              <FormDescription>
                Edit the JSON content directly. Be careful to maintain valid JSON format.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? "Updating..." : "Creating..."}
            </>
          ) : isEditing ? (
            "Update Activity"
          ) : (
            "Create Activity"
          )}
        </Button>
      </form>
    </Form>
  )
}

