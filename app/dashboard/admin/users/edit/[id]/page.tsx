import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import UserEditForm from "@/components/admin/user-edit-form"

export default async function EditUserPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Get current user
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    redirect("/login")
  }

  // Check if current user is admin
  const { data: currentProfile } = await supabase.from("profiles").select("role").eq("id", currentUser.id).single()

  if (currentProfile?.role !== "admin") {
    redirect("/dashboard")
  }

  // Get user to edit
  const { data: user } = await supabase.from("profiles").select("*").eq("id", params.id).single()

  if (!user) {
    redirect("/dashboard/admin?tab=users")
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit User</h1>
        <Button asChild variant="outline">
          <Link href="/dashboard/admin?tab=users">Back to Users</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
          <CardDescription>Edit user information and role</CardDescription>
        </CardHeader>
        <CardContent>
          <UserEditForm user={user} />
        </CardContent>
      </Card>
    </div>
  )
}

