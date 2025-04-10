"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Eye } from "lucide-react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export type Student = {
  id: string
  name: string
  email: string
  progress: number
  coursesCompleted: number
  coursesInProgress: number
  streak: number
  lastActive: string
  createdAt: string
}

export const columns: ColumnDef<Student>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="pl-0">
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-medium cursor-pointer">
        <Link href={`/dashboard/admin/students/${row.original.id}`}>{row.original.name}</Link>
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "progress",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Progress
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const progress = row.original.progress

      return (
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs">
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )
    },
  },
  {
    accessorKey: "coursesCompleted",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Completed
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const completed = row.original.coursesCompleted
      return <Badge variant="outline">{completed} courses</Badge>
    },
  },
  {
    accessorKey: "coursesInProgress",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          In Progress
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const inProgress = row.original.coursesInProgress
      return <Badge variant="outline">{inProgress} courses</Badge>
    },
  },
  {
    accessorKey: "streak",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Streak
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const streak = row.original.streak

      return <Badge variant={streak > 5 ? "default" : "outline"}>{streak} days</Badge>
    },
  },
  {
    accessorKey: "lastActive",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Last Active
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      // Format the date properly
      const lastActive = row.original.lastActive
      if (!lastActive) return <span className="text-muted-foreground">Never</span>

      try {
        // Try to format the date
        const date = new Date(lastActive)
        const formattedDate = new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(date)

        return <span>{formattedDate}</span>
      } catch (error) {
        // If there's an error formatting, just return the raw value
        return <span>{lastActive}</span>
      }
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex justify-end">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/admin/students/${row.original.id}`}>
              <Eye className="h-4 w-4" />
              <span className="sr-only">View</span>
            </Link>
          </Button>
        </div>
      )
    },
  },
]

