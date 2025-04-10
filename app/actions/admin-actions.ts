"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateCourseStatus(courseId: string, newStatus: string) {
  try {
    const supabase = createClient()

    // Update course status
    await supabase
      .from("courses")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", courseId)

    // If setting to draft, also set all activities to draft
    if (newStatus === "draft") {
      await supabase
        .from("activities")
        .update({
          status: "draft",
          updated_at: new Date().toISOString(),
        })
        .eq("course_id", courseId)
    }

    revalidatePath("/dashboard/admin")
    revalidatePath("/dashboard/courses")
    revalidatePath("/dashboard/activities")

    return { success: true }
  } catch (error: any) {
    console.error("Error updating course status:", error)
    return { success: false, error: error.message || "Failed to update course status" }
  }
}

export async function updateActivityStatus(activityId: string, newStatus: string, courseId: string) {
  try {
    const supabase = createClient()

    // Check if the course is published
    if (newStatus === "published") {
      const { data: course } = await supabase.from("courses").select("status").eq("id", courseId).single()

      if (course?.status !== "published") {
        return {
          success: false,
          error: "Cannot publish an activity when its course is in draft status. Please publish the course first.",
        }
      }
    }

    // Update activity status
    await supabase
      .from("activities")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", activityId)

    revalidatePath("/dashboard/admin")
    revalidatePath("/dashboard/activities")

    return { success: true }
  } catch (error: any) {
    console.error("Error updating activity status:", error)
    return { success: false, error: error.message || "Failed to update activity status" }
  }
}

export async function duplicateCourse(courseId: string) {
  try {
    const supabase = createClient()

    // Get the course data
    const { data: course, error: courseError } = await supabase.from("courses").select("*").eq("id", courseId).single()

    if (courseError || !course) {
      throw new Error(courseError?.message || "Course not found")
    }

    // Create a new course with the same data but as a draft
    const { data: newCourse, error: newCourseError } = await supabase
      .from("courses")
      .insert({
        ...course,
        id: undefined, // Let the database generate a new ID
        title: `${course.title} (Copy)`,
        status: "draft",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (newCourseError || !newCourse) {
      throw new Error(newCourseError?.message || "Failed to create duplicate course")
    }

    // Get all activities for the original course
    const { data: activities, error: activitiesError } = await supabase
      .from("activities")
      .select("*")
      .eq("course_id", courseId)
      .order("order_index", { ascending: true })

    if (activitiesError) {
      throw new Error(activitiesError.message || "Failed to get course activities")
    }

    // Duplicate all activities for the new course
    if (activities && activities.length > 0) {
      const newActivities = activities.map((activity) => ({
        ...activity,
        id: undefined, // Let the database generate a new ID
        course_id: newCourse.id,
        status: "draft",
        order_index: null, // Set order_index to null for duplicated activities
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      const { error: newActivitiesError } = await supabase.from("activities").insert(newActivities)

      if (newActivitiesError) {
        throw new Error(newActivitiesError.message || "Failed to duplicate course activities")
      }
    }

    revalidatePath("/dashboard/admin")
    return { success: true, courseId: newCourse.id }
  } catch (error: any) {
    console.error("Error duplicating course:", error)
    return { success: false, error: error.message || "Failed to duplicate course" }
  }
}

export async function duplicateActivity(activityId: string) {
  try {
    const supabase = createClient()

    // Get the activity data
    const { data: activity, error: activityError } = await supabase
      .from("activities")
      .select("*")
      .eq("id", activityId)
      .single()

    if (activityError || !activity) {
      throw new Error(activityError?.message || "Activity not found")
    }

    // Create a new activity with the same data but as a draft
    const { data: newActivity, error: newActivityError } = await supabase
      .from("activities")
      .insert({
        ...activity,
        id: undefined, // Let the database generate a new ID
        title: `${activity.title} (Copy)`,
        status: "draft",
        order_index: null, // Set order_index to null for duplicated activities
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (newActivityError || !newActivity) {
      throw new Error(newActivityError?.message || "Failed to create duplicate activity")
    }

    revalidatePath("/dashboard/admin")
    return { success: true, activityId: newActivity.id }
  } catch (error: any) {
    console.error("Error duplicating activity:", error)
    return { success: false, error: error.message || "Failed to duplicate activity" }
  }
}

