"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash, Eye, CheckCircle, XCircle, Copy } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { updateActivityStatus } from "@/app/actions/admin-actions"

// Create columns with status toggle functionality
export const createColumns = (onStatusChange: () => void): ColumnDef<any>[] => [
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
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      const formattedType = type.charAt(0).toUpperCase() + type.slice(1).replace("_", " ")
      return <span>{formattedType}</span>
    },
  },
  {
    accessorKey: "course",
    header: "Course",
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
    accessorKey: "createdAt",
    header: "Created",
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const activity = row.original
      const [isUpdating, setIsUpdating] = useState(false)
      const { toast } = useToast()
      const supabase = createClient()
      const meta = table.options.meta as { onDataChange?: () => void }

      const handleStatusToggle = async () => {
        setIsUpdating(true)
        try {
          const newStatus = activity.status === "published" ? "draft" : "published"

          const result = await updateActivityStatus(activity.id, newStatus, activity.courseId)

          if (result.success) {
            toast({
              title: `Activity ${newStatus === "published" ? "published" : "unpublished"}`,
              description: `The activity has been ${newStatus === "published" ? "published" : "set to draft"}.`,
            })

            // Call the onDataChange callback if provided
            if (meta?.onDataChange) {
              meta.onDataChange()
            } else {
              onStatusChange()
            }
          } else {
            throw new Error(result.error)
          }
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.message || "Failed to update status",
            variant: "destructive",
          })
        } finally {
          setIsUpdating(false)
        }
      }

      const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this activity? This action cannot be undone.")) {
          return
        }

        try {
          const { error } = await supabase.from("activities").delete().eq("id", activity.id)

          if (error) throw error

          toast({
            title: "Activity deleted",
            description: "The activity has been deleted successfully.",
          })

          // Call the onDataChange callback if provided
          if (meta?.onDataChange) {
            meta.onDataChange()
          } else {
            onStatusChange()
          }
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.message || "Failed to delete activity",
            variant: "destructive",
          })
        }
      }

      const duplicateActivity = async () => {
        try {
          // Get the activity data
          const { data: activityData } = await supabase.from("activities").select("*").eq("id", activity.id).single()

          if (!activityData) throw new Error("Activity not found")

          // Create a new activity with the same data but as draft
          const { data: newActivity, error } = await supabase
            .from("activities")
            .insert({
              ...activityData,
              id: undefined, // Let Supabase generate a new ID
              title: `${activityData.title} (Copy)`,
              status: "draft",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()

          if (error) throw error

          toast({
            title: "Activity duplicated",
            description: "The activity has been duplicated successfully.",
          })

          // Call the onDataChange callback if provided
          if (meta?.onDataChange) {
            meta.onDataChange()
          } else {
            onStatusChange()
          }
        } catch (error: any) {
          console.error("Error duplicating activity:", error)
          toast({
            title: "Error",
            description: error.message || "Failed to duplicate activity.",
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
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/activities/${activity.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/admin/activities/edit/${activity.id}`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleStatusToggle} disabled={isUpdating}>
              {activity.status === "published" ? (
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
            <DropdownMenuItem onClick={duplicateActivity}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

// Default columns for static usage
export const columns: ColumnDef<any>[] = createColumns(() => {})

