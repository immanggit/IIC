"use client"

import { createClient } from "@/utils/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import CourseForm from "@/components/admin/course-form"

export default async function EditCoursePage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Check if user is admin or teacher
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin" && profile?.role !== "teacher") {
    redirect("/dashboard")
  }

  // Fetch course data
  const { data: course } = await supabase.from("courses").select("*").eq("id", params.id).single()

  if (!course) {
    notFound()
  }

  // Fetch categories for the form
  const { data: categories } = await supabase.from("categories").select("*").order("name", { ascending: true })

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Course</CardTitle>
          <CardDescription>Update the course details</CardDescription>
        </CardHeader>
        <CardContent>
          <CourseForm categories={categories || []} course={course} />
        </CardContent>
      </Card>
    </div>
  )
}

