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
import { MoreHorizontal, UserCog, UserMinus, Mail, Edit } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"

export type User = {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.getValue("email") as string
      return (
        <div className="flex items-center">
          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>{email}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string

      const getBadgeColor = (role: string) => {
        switch (role) {
          case "admin":
            return "bg-red-100 text-red-800 hover:bg-red-200"
          case "teacher":
            return "bg-blue-100 text-blue-800 hover:bg-blue-200"
          default:
            return "bg-gray-100 text-gray-800 hover:bg-gray-200"
        }
      }

      return <Badge className={getBadgeColor(role)}>{role.charAt(0).toUpperCase() + role.slice(1)}</Badge>
    },
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const user = row.original
      const { toast } = useToast()
      const router = useRouter()
      const supabase = createClient()
      const meta = table.options.meta as { onDataChange?: () => void }

      const handleRoleChange = async (userId: string, newRole: string) => {
        try {
          // Update role in profile
          await supabase
            .from("profiles")
            .update({
              role: newRole,
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId)

          toast({
            title: "Role updated",
            description: `User role has been updated to ${newRole}.`,
          })

          // Call the onDataChange callback if provided
          if (meta?.onDataChange) {
            meta.onDataChange()
          }
        } catch (error) {
          console.error("Error updating role:", error)
          toast({
            title: "Error",
            description: "Failed to update user role.",
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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.email)} className="cursor-pointer">
              Copy email
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href={`/dashboard/admin/users/edit/${user.id}`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit User
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleRoleChange(user.id, "teacher")}
              disabled={user.role === "teacher"}
              className="cursor-pointer"
            >
              <UserCog className="h-4 w-4 mr-2" />
              Make Teacher
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleRoleChange(user.id, "user")}
              disabled={user.role === "user"}
              className="cursor-pointer"
            >
              <UserMinus className="h-4 w-4 mr-2" />
              Revoke Teacher Role
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

