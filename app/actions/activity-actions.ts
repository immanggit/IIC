"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export async function saveActivityProgress(
  activityId: string,
  score: number,
  completed: boolean,
  answers?: Record<string, any>,
  timeSpent?: number,
) {
  try {
    // Create a Supabase client with the user's session cookie
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Authentication error:", userError)
      return { success: false, error: userError?.message || "User not authenticated" }
    }

    console.log("Current user:", user.id)

    // Get the activity to find its course_id
    const { data: activity, error: activityError } = await supabase
      .from("activities")
      .select("course_id")
      .eq("id", activityId)
      .single()

    if (activityError || !activity) {
      console.error("Activity error:", activityError)
      return { success: false, error: activityError?.message || "Activity not found" }
    }

    console.log("Activity course_id:", activity.course_id)

    // Check if user is enrolled in the course
    const { data: userCourse, error: userCourseError } = await supabase
      .from("user_courses")
      .select("*")
      .eq("user_id", user.id)
      .eq("course_id", activity.course_id)
      .single()

    if (userCourseError && userCourseError.code !== "PGRST116") {
      console.error("Error checking user course:", userCourseError)
    }

    // If user is not enrolled, enroll them automatically
    if (!userCourse) {
      console.log("Auto-enrolling user in course:", activity.course_id)

      const { error: enrollError } = await supabase.from("user_courses").insert([
        {
          user_id: user.id,
          course_id: activity.course_id,
          progress: 0,
          score: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])

      if (enrollError) {
        console.error("Error enrolling user:", enrollError)
        // Continue anyway, as this shouldn't block progress saving
      } else {
        // Update the course's total_enrollment count
        // First, get the current enrollment count
        const { data: course } = await supabase
          .from("courses")
          .select("total_enrollment")
          .eq("id", activity.course_id)
          .single()

        // Increment the enrollment count
        await supabase
          .from("courses")
          .update({
            total_enrollment: (course?.total_enrollment || 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", activity.course_id)
      }
    }

    // Check if progress already exists
    const { data: existingProgress, error: progressError } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("activity_id", activityId)
      .single()

    if (progressError && progressError.code !== "PGRST116") {
      // PGRST116 is the error code for "no rows returned" which is expected if no progress exists
      console.error("Error checking existing progress:", progressError)
    }

    console.log("Existing progress:", existingProgress ? "Found" : "Not found")

    const progressData = {
      user_id: user.id,
      activity_id: activityId,
      course_id: activity.course_id,
      score,
      completed,
      answers,
      time_spent: timeSpent || existingProgress?.time_spent || 0,
      updated_at: new Date().toISOString(),
    }

    let result

    if (existingProgress && existingProgress.id) {
      console.log("Updating existing progress with ID:", existingProgress.id)
      // Update existing progress with explicit WHERE clause
      result = await supabase
        .from("user_progress")
        .update(progressData)
        .eq("id", existingProgress.id)
        .eq("user_id", user.id) // Add this to satisfy RLS policy
        .select()
    } else {
      console.log("Inserting new progress")
      // Insert new progress
      result = await supabase
        .from("user_progress")
        .insert([{ ...progressData, created_at: new Date().toISOString() }])
        .select()
    }

    if (result.error) {
      console.error("Error saving progress:", result.error)
      return { success: false, error: result.error.message }
    }

    console.log("Progress saved successfully:", result.data)

    // Update course progress
    await updateCourseProgress(user.id, activity.course_id, supabase)

    // Revalidate paths
    revalidatePath(`/dashboard/activities/${activityId}`)
    revalidatePath(`/dashboard/courses/${activity.course_id}`)
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/progress")

    return { success: true, data: result.data }
  } catch (error: any) {
    console.error("Error in saveActivityProgress:", error)
    return { success: false, error: error.message }
  }
}

async function updateCourseProgress(userId: string, courseId: string, supabase: any) {
  try {
    // Get all published activities for the course
    const { data: activities, error: activitiesError } = await supabase
      .from("activities")
      .select("id")
      .eq("course_id", courseId)
      .eq("status", "published")

    if (activitiesError) {
      console.error("Error fetching activities:", activitiesError)
      return
    }

    if (!activities || activities.length === 0) {
      console.log("No published activities found for course:", courseId)
      return
    }

    // Get completed activities for the user in this course
    const { data: completedActivities, error: completedError } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .eq("completed", true)

    if (completedError) {
      console.error("Error fetching completed activities:", completedError)
      return
    }

    // Calculate progress percentage
    const totalActivities = activities.length
    const completedCount = completedActivities?.length || 0
    const progressPercentage = Math.round((completedCount / totalActivities) * 100)

    // Calculate average score
    let totalScore = 0
    if (completedActivities && completedActivities.length > 0) {
      totalScore = completedActivities.reduce((sum, activity) => sum + (activity.score || 0), 0)
    }
    const averageScore = completedCount > 0 ? Math.round(totalScore / completedCount) : 0

    console.log("Updating course progress:", {
      userId,
      courseId,
      progressPercentage,
      averageScore,
      completedCount,
      totalActivities,
    })

    // Update course progress in user_courses table
    const { data: existingUserCourse, error: userCourseError } = await supabase
      .from("user_courses")
      .select("*")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .single()

    if (userCourseError && userCourseError.code !== "PGRST116") {
      console.error("Error fetching user course:", userCourseError)
    }

    const userCourseData = {
      progress: progressPercentage,
      score: averageScore,
      updated_at: new Date().toISOString(),
    }

    if (existingUserCourse && existingUserCourse.id) {
      // Make sure we have a valid ID before updating
      const { error: updateError } = await supabase
        .from("user_courses")
        .update(userCourseData)
        .eq("id", existingUserCourse.id)
        .eq("user_id", userId) // Add this to satisfy RLS policy

      if (updateError) {
        console.error("Error updating user course:", updateError)
      }
    } else {
      const { error: insertError } = await supabase.from("user_courses").insert([
        {
          user_id: userId,
          course_id: courseId,
          progress: progressPercentage,
          score: averageScore,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])

      if (insertError) {
        console.error("Error inserting user course:", insertError)
      }
    }
  } catch (error) {
    console.error("Error updating course progress:", error)
  }
}

