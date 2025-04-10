"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { BookOpen, Trophy, Loader2, TrendingUp, Star } from "lucide-react"
import CourseFilters from "@/components/courses/course-filters"
import { createClient } from "@/utils/supabase/client"
import { useInView } from "react-intersection-observer"

// Helper function to format enrollment numbers
function formatEnrollment(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  } else if (count >= 500) {
    return `${count}+`
  } else {
    return count.toString()
  }
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [userCourses, setUserCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [count, setCount] = useState(0)
  const [isAdmin, setIsAdmin] = useState(false)

  // Filters
  const [level, setLevel] = useState<string>("")
  const [sort, setSort] = useState<string>("recommended")
  const [showRecommended, setShowRecommended] = useState<boolean>(false)
  const [showPopular, setShowPopular] = useState<boolean>(false)

  // Pagination
  const pageSize = 9
  const [page, setPage] = useState(1)

  const supabase = createClient()

  // Intersection observer for infinite scroll
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  })

  // Load more courses when bottom is in view
  useEffect(() => {
    if (inView && hasMore && !loadingMore) {
      loadMoreCourses()
    }
  }, [inView])

  // Initial data load
  useEffect(() => {
    async function fetchInitialData() {
      setLoading(true)
      setError(null)

      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setLoading(false)
          return
        }

        // Check if user is admin or teacher
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

        setIsAdmin(profile?.role === "admin" || profile?.role === "teacher")

        // Get user progress for courses
        const { data: userCoursesData } = await supabase.from("user_courses").select("*").eq("user_id", user.id)

        setUserCourses(userCoursesData || [])

        // Load first page of courses
        await fetchCourses(1)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load courses. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [])

  // Reload courses when filters change
  useEffect(() => {
    if (!loading) {
      setCourses([])
      setPage(1)
      setHasMore(true)
      fetchCourses(1)
    }
  }, [level, sort, showRecommended, showPopular])

  // Function to fetch courses with pagination
  async function fetchCourses(pageNum: number) {
    const from = (pageNum - 1) * pageSize
    const to = from + pageSize - 1

    try {
      setLoadingMore(pageNum > 1)

      // Build query
      let query = supabase.from("courses").select("*", { count: "exact" }).eq("status", "published")

      // Apply filters
      if (level) {
        query = query.eq("level", level)
      }

      if (showRecommended) {
        query = query.eq("is_recommended", true)
      }

      if (showPopular) {
        query = query.gt("total_enrollment", 0)
      }

      // Apply sorting
      if (sort === "recommended") {
        // First recommended, then by popularity
        query = query.order("is_recommended", { ascending: false }).order("total_enrollment", { ascending: false })
      } else if (sort === "popular") {
        query = query.order("total_enrollment", { ascending: false })
      } else if (sort === "newest") {
        query = query.order("created_at", { ascending: false })
      } else if (sort === "oldest") {
        query = query.order("created_at", { ascending: true })
      } else if (sort === "a-z") {
        query = query.order("title", { ascending: true })
      } else if (sort === "z-a") {
        query = query.order("title", { ascending: false })
      }

      // Apply pagination
      query = query.range(from, to)

      // Execute query
      const { data: coursesData, error: coursesError, count: totalCount } = await query

      if (coursesError) throw coursesError

      if (pageNum === 1) {
        setCourses(coursesData || [])
      } else {
        setCourses((prev) => [...prev, ...(coursesData || [])])
      }

      setCount(totalCount || 0)
      setHasMore((coursesData?.length || 0) === pageSize)
      setPage(pageNum)
    } catch (err) {
      console.error("Error fetching courses:", err)
      setError("Failed to load courses. Please try again.")
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Load more courses for infinite scroll
  async function loadMoreCourses() {
    if (hasMore && !loadingMore) {
      await fetchCourses(page + 1)
    }
  }

  // Handle filter changes
  const handleFilterChange = (type: string, value: string | boolean) => {
    switch (type) {
      case "level":
        setLevel(value as string)
        break
      case "sort":
        setSort(value as string)
        break
      case "recommended":
        setShowRecommended(value as boolean)
        break
      case "popular":
        setShowPopular(value as boolean)
        break
    }
  }

  if (loading && page === 1) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">English Courses</h1>

      <div className="grid gap-6 md:grid-cols-[250px_1fr]">
        <div>
          <CourseFilters
            selectedLevel={level}
            selectedSort={sort}
            showRecommended={showRecommended}
            showPopular={showPopular}
            onFilterChange={handleFilterChange}
          />
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground">
              {count > 0 ? `Showing ${courses.length} of ${count} courses` : "No courses found"}
            </p>
          </div>

          {error && (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => fetchCourses(1)} variant="outline">
                Retry
              </Button>
            </div>
          )}

          {!error && courses.length === 0 && !loading ? (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-muted-foreground mb-4">No courses found matching your filters.</p>
              <Button
                onClick={() => {
                  setLevel("")
                  setSort("recommended")
                  setShowRecommended(false)
                  setShowPopular(false)
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {courses.map((course) => {
                  const userCourse = userCourses?.find((uc) => uc.course_id === course.id)
                  return (
                    <CourseCard
                      key={course.id}
                      course={course}
                      userProgress={userCourse?.progress || 0}
                      userScore={userCourse?.score || 0}
                      isTeacherOrAdmin={isAdmin}
                    />
                  )
                })}
              </div>

              {/* Infinite scroll loading indicator */}
              {hasMore && (
                <div ref={ref} className="flex justify-center py-8">
                  {loadingMore && (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <p>Loading more courses...</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function CourseCard({
  course,
  userProgress,
  userScore,
  isTeacherOrAdmin,
}: {
  course: any
  userProgress: number
  userScore: number
  isTeacherOrAdmin: boolean
}) {
  // Get badge color based on level
  const getBadgeColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "Intermediate":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "Advanced":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200"
      default:
        return ""
    }
  }

  // Get button color based on progress
  const getButtonColor = (progress: number) => {
    if (progress === 100) {
      return "bg-green-600 hover:bg-green-700"
    }

    switch (course.level) {
      case "Beginner":
        return "bg-green-600 hover:bg-green-700"
      case "Intermediate":
        return "bg-blue-600 hover:bg-blue-700"
      case "Advanced":
        return "bg-purple-600 hover:bg-purple-700"
      default:
        return ""
    }
  }

  return (
    <Card
      className={`overflow-hidden flex flex-col h-full ${course.is_recommended ? "border-2 border-yellow-400 bg-yellow-50" : ""}`}
    >
      <div className="aspect-video relative h-48">
        <img
          src={course.image_url || "/placeholder.svg?height=200&width=300"}
          alt={course.title}
          className="object-cover w-full h-full"
          loading="lazy"
        />
        <Badge className={`absolute top-2 right-2 ${getBadgeColor(course.level)}`}>{course.level || "Beginner"}</Badge>

        {course.is_recommended && (
          <div className="absolute top-2 left-2 z-10">
            <Badge className="bg-yellow-500 text-white flex items-center gap-1">
              <Star className="h-3 w-3" />
              <span>Recommended</span>
            </Badge>
          </div>
        )}

        {course.total_enrollment > 0 && (
          <div className="absolute bottom-2 left-2 z-10">
            <Badge variant="secondary" className="flex items-center gap-1 bg-white/90 backdrop-blur-sm">
              <TrendingUp className="h-3 w-3" />
              <span>{formatEnrollment(course.total_enrollment)} enrolled</span>
            </Badge>
          </div>
        )}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{course.title}</CardTitle>
        <CardDescription>{course.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2 flex-1">
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{userProgress}%</span>
          </div>
          <Progress value={userProgress} className="h-2" />

          {userProgress === 100 && (
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm font-medium">Score:</span>
              <div className="flex items-center">
                <Trophy className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="font-medium">{userScore}/5</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className={`w-full ${getButtonColor(userProgress)} flex`}>
          <Link href={`/dashboard/courses/${course.id}`}>
            <BookOpen className="h-4 w-4 mr-2" />
            {userProgress === 100 ? "Review Course" : userProgress > 0 ? "Continue Learning" : "Start Course"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

