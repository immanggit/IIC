"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash, CheckCircle, XCircle, Users, Copy } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { updateCourseStatus } from "@/app/actions/admin-actions"

export type Course = {
  id: string
  title: string
  category: string
  level: string
  status: string
  enrollment: number
  createdAt: string
}

export const columns: ColumnDef<Course>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="px-1">
        <input
          type="checkbox"
          className="form-checkbox h-4 w-4 text-primary border-gray-300 rounded"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="px-1">
        <input
          type="checkbox"
          className="form-checkbox h-4 w-4 text-primary border-gray-300 rounded"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "level",
    header: "Level",
    cell: ({ row }) => {
      const level = row.getValue("level") as string

      const getBadgeColor = (level: string) => {
        switch (level) {
          case "Beginner":
            return "bg-green-100 text-green-800 hover:bg-green-200"
          case "Intermediate":
            return "bg-blue-100 text-blue-800 hover:bg-blue-200"
          case "Advanced":
            return "bg-purple-100 text-purple-800 hover:bg-purple-200"
          default:
            return "bg-gray-100 text-gray-800 hover:bg-gray-200"
        }
      }

      return <Badge className={getBadgeColor(level)}>{level}</Badge>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string

      return (
        <Badge variant={status === "published" ? "default" : "outline"}>
          {status === "published" ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      )
    },
  },
  {
    accessorKey: "enrollment",
    header: "Enrollment",
    cell: ({ row }) => {
      const enrollment = row.getValue("enrollment") as number
      return <span>{enrollment} students</span>
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const course = row.original
      const { toast } = useToast()
      const router = useRouter()
      const supabase = createClient()
      const meta = table.options.meta as { onDataChange?: () => void }

      const togglePublishStatus = async (courseId: string, currentStatus: string) => {
        try {
          const newStatus = currentStatus === "published" ? "draft" : "published"

          // If setting to draft, show a confirmation dialog
          if (newStatus === "draft") {
            if (!confirm("Setting this course to draft will also set all its activities to draft. Continue?")) {
              return
            }
          }

          const result = await updateCourseStatus(courseId, newStatus)

          if (result.success) {
            toast({
              title: `Course ${newStatus === "published" ? "published" : "unpublished"}`,
              description: `The course has been ${newStatus === "published" ? "published" : "set to draft"}.`,
            })

            // Call the onDataChange callback if provided
            if (meta?.onDataChange) {
              meta.onDataChange()
            }
          } else {
            throw new Error(result.error)
          }
        } catch (error: any) {
          console.error("Error updating course status:", error)
          toast({
            title: "Error",
            description: error.message || "Failed to update course status.",
            variant: "destructive",
          })
        }
      }

      const deleteCourse = async (courseId: string) => {
        if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
          return
        }

        try {
          // First check if there are any activities associated with this course
          const { data: activities } = await supabase.from("activities").select("id").eq("course_id", courseId)

          if (activities && activities.length > 0) {
            if (
              !confirm(
                `This course has ${activities.length} activities. Deleting it will also delete all associated activities. Continue?`,
              )
            ) {
              return
            }

            // Delete all activities first
            await supabase.from("activities").delete().eq("course_id", courseId)
          }

          // Delete user_courses entries
          await supabase.from("user_courses").delete().eq("course_id", courseId)

          // Delete user_progress entries
          await supabase.from("user_progress").delete().eq("course_id", courseId)

          // Finally delete the course
          const { error } = await supabase.from("courses").delete().eq("id", courseId)

          if (error) throw error

          toast({
            title: "Course deleted",
            description: "The course has been deleted successfully.",
          })

          // Call the onDataChange callback if provided
          if (meta?.onDataChange) {
            meta.onDataChange()
          }
        } catch (error: any) {
          console.error("Error deleting course:", error)
          toast({
            title: "Error",
            description: error.message || "Failed to delete course.",
            variant: "destructive",
          })
        }
      }

      const duplicateCourse = async (courseId: string) => {
        try {
          // Get the course data
          const { data: courseData } = await supabase.from("courses").select("*").eq("id", courseId).single()

          if (!courseData) throw new Error("Course not found")

          // Create a new course with the same data but as draft
          const { data: newCourse, error } = await supabase
            .from("courses")
            .insert({
              ...courseData,
              id: undefined, // Let Supabase generate a new ID
              title: `${courseData.title} (Copy)`,
              status: "draft",
              total_enrollment: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()

          if (error) throw error

          // Get the activities for the original course
          const { data: activities } = await supabase.from("activities").select("*").eq("course_id", courseId)

          if (activities && activities.length > 0 && newCourse && newCourse.length > 0) {
            // Duplicate each activity for the new course
            const newActivities = activities.map((activity) => ({
              ...activity,
              id: undefined, // Let Supabase generate a new ID
              course_id: newCourse[0].id,
              status: "draft",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }))

            // Insert the new activities
            const { error: activitiesError } = await supabase.from("activities").insert(newActivities)

            if (activitiesError) throw activitiesError
          }

          toast({
            title: "Course duplicated",
            description: "The course has been duplicated successfully.",
          })

          // Call the onDataChange callback if provided
          if (meta?.onDataChange) {
            meta.onDataChange()
          }
        } catch (error: any) {
          console.error("Error duplicating course:", error)
          toast({
            title: "Error",
            description: error.message || "Failed to duplicate course.",
            variant: "destructive",
          })
        }
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href={`/dashboard/courses/${course.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href={`/dashboard/admin/courses/edit/${course.id}`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href={`/dashboard/admin/courses/${course.id}/enrollments`}>
                <Users className="h-4 w-4 mr-2" />
                View Enrollments
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => togglePublishStatus(course.id, course.status)} className="cursor-pointer">
              {course.status === "published" ? (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Unpublish
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Publish
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => duplicateCourse(course.id)} className="cursor-pointer">
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => deleteCourse(course.id)}
              className="text-red-600 focus:text-red-600 cursor-pointer"
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

