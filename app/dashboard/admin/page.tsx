"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, BookOpen, Activity, Search, GraduationCap, Loader2, BookMarked } from "lucide-react"
import DataTable from "@/components/admin/data-table"
import { columns as userColumns } from "@/components/admin/user-columns"
import { columns as courseColumns } from "@/components/admin/course-columns"
import { createColumns } from "@/components/admin/activity-columns"
import { columns as studentColumns } from "@/components/admin/student-columns"
import { createVocabularyColumns } from "@/components/admin/vocabulary-columns"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/utils/supabase/client"

export default function AdminDashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // State
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [vocabulary, setVocabulary] = useState<any[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const selectedCoursesRef = useRef<any[]>([])
  const selectedActivitiesRef = useRef<any[]>([])

  // Filters from URL
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "users")
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [courseStatus, setCourseStatus] = useState(searchParams.get("courseStatus") || "")
  const [activityStatus, setActivityStatus] = useState(searchParams.get("activityStatus") || "")
  const [activityType, setActivityType] = useState(searchParams.get("activityType") || "")
  const [courseLevel, setCourseLevel] = useState(searchParams.get("courseLevel") || "")
  const [vocabularyLevel, setVocabularyLevel] = useState(searchParams.get("vocabularyLevel") || "")
  const [vocabularyCategory, setVocabularyCategory] = useState(searchParams.get("vocabularyCategory") || "")
  const [vocabularyStatus, setVocabularyStatus] = useState(searchParams.get("vocabularyStatus") || "")

  // Create activity columns with refresh callback
  const activityColumns = createColumns(() => loadActivities())

  // Create vocabulary columns with refresh callback
  const vocabularyColumns = createVocabularyColumns(() => loadVocabulary())

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalCourses: 0,
    publishedCourses: 0,
    totalActivities: 0,
    publishedActivities: 0,
    totalVocabulary: 0,
    newUsers: 0,
  })

  // Handlers
  const handleDuplicateCourse = async () => {
    if (selectedCoursesRef.current.length === 0) {
      alert("Please select at least one course to duplicate.")
      return
    }

    try {
      for (const course of selectedCoursesRef.current) {
        // Get the course data
        const { data: courseData } = await supabase.from("courses").select("*").eq("id", course.id).single()

        if (!courseData) continue

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
        const { data: activities } = await supabase.from("activities").select("*").eq("course_id", course.id)

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
          await supabase.from("activities").insert(newActivities)
        }
      }

      alert(`Successfully duplicated ${selectedCoursesRef.current.length} course(s).`)

      // Clear selection
      selectedCoursesRef.current = []

      // Reload courses
      loadCourses()
    } catch (error: any) {
      console.error("Error duplicating courses:", error)
      alert(`Error duplicating courses: ${error.message}`)
    }
  }

  const handleDuplicateActivity = async () => {
    if (selectedActivitiesRef.current.length === 0) {
      alert("Please select at least one activity to duplicate.")
      return
    }

    try {
      for (const activity of selectedActivitiesRef.current) {
        // Get the activity data
        const { data: activityData } = await supabase.from("activities").select("*").eq("id", activity.id).single()

        if (!activityData) continue

        // Create a new activity with the same data but as draft
        await supabase.from("activities").insert({
          ...activityData,
          id: undefined, // Let Supabase generate a new ID
          title: `${activityData.title} (Copy)`,
          status: "draft",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }

      alert(`Successfully duplicated ${selectedActivitiesRef.current.length} activity(ies).`)

      // Clear selection
      selectedActivitiesRef.current = []

      // Reload activities
      loadActivities()
    } catch (error: any) {
      console.error("Error duplicating activities:", error)
      alert(`Error duplicating activities: ${error.message}`)
    }
  }

  // Handle selected rows
  const handleSelectedCourses = useCallback((rows: any[]) => {
    selectedCoursesRef.current = rows
  }, [])

  const handleSelectedActivities = useCallback((rows: any[]) => {
    selectedActivitiesRef.current = rows
  }, [])

  // Check if user is admin and load initial data
  useEffect(() => {
    async function checkAdminAndLoadData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/login")
          return
        }

        // Check if user is admin
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

        if (profile?.role !== "admin" && profile?.role !== "teacher") {
          router.push("/dashboard")
          return
        }

        setIsAdmin(true)

        // Load data based on active tab
        loadData()
      } catch (error) {
        console.error("Error checking admin status:", error)
      }
    }

    checkAdminAndLoadData()
  }, [])

  // Load data when filters change
  useEffect(() => {
    if (isAdmin) {
      loadData()
      updateUrl()
    }
  }, [
    isAdmin,
    activeTab,
    searchQuery,
    courseStatus,
    activityStatus,
    activityType,
    courseLevel,
    vocabularyLevel,
    vocabularyCategory,
    vocabularyStatus,
  ])

  // Update URL with current filters
  const updateUrl = () => {
    const params = new URLSearchParams()

    if (activeTab) params.set("tab", activeTab)
    if (searchQuery) params.set("search", searchQuery)

    if (activeTab === "courses") {
      if (courseStatus) params.set("courseStatus", courseStatus)
      if (courseLevel) params.set("courseLevel", courseLevel)
    } else if (activeTab === "activities") {
      if (activityStatus) params.set("activityStatus", activityStatus)
      if (activityType) params.set("activityType", activityType)
    } else if (activeTab === "vocabulary") {
      if (vocabularyLevel) params.set("vocabularyLevel", vocabularyLevel)
      if (vocabularyCategory) params.set("vocabularyCategory", vocabularyCategory)
      if (vocabularyStatus) params.set("vocabularyStatus", vocabularyStatus)
    }

    router.push(`/dashboard/admin?${params.toString()}`, { scroll: false })
  }

  // Load data based on active tab and filters
  const loadData = async () => {
    setLoading(true)

    try {
      // Always load stats
      await loadStats()

      // Load tab-specific data
      switch (activeTab) {
        case "users":
          await loadUsers()
          break
        case "courses":
          await loadCourses()
          break
        case "activities":
          await loadActivities()
          break
        case "students":
          await loadStudents()
          break
        case "vocabulary":
          await loadVocabulary()
          break
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Load stats
  const loadStats = async () => {
    // Fetch users count
    const { data: usersData } = await supabase.from("profiles").select("id, role, created_at")

    const totalUsers = usersData?.length || 0
    const totalTeachers = usersData?.filter((u) => u.role === "teacher" || u.role === "admin").length || 0
    const totalStudents = usersData?.filter((u) => u.role === "user").length || 0
    const newUsers =
      usersData?.filter((u) => {
        try {
          return new Date(u.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
        } catch (error) {
          return false
        }
      }).length || 0

    // Fetch courses count
    const { data: coursesData } = await supabase.from("courses").select("id, status")

    const totalCourses = coursesData?.length || 0
    const publishedCourses = coursesData?.filter((c) => c.status === "published").length || 0

    // Fetch activities count
    const { data: activitiesData } = await supabase.from("activities").select("id, status")

    const totalActivities = activitiesData?.length || 0
    const publishedActivities = activitiesData?.filter((a) => a.status === "published").length || 0

    // Fetch vocabulary count
    const { data: vocabularyData } = await supabase.from("vocabulary_words").select("id")
    const totalVocabulary = vocabularyData?.length || 0

    setStats({
      totalUsers,
      totalTeachers,
      totalStudents,
      totalCourses,
      publishedCourses,
      totalActivities,
      publishedActivities,
      totalVocabulary,
      newUsers,
    })
  }

  // Load users - show all users
  const loadUsers = async () => {
    let query = supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        email,
        role,
        created_at
      `)
      .order("created_at", { ascending: false })

    if (searchQuery) {
      query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
    }

    const { data } = await query

    // Format users data
    const formattedUsers =
      data?.map((user) => ({
        id: user.id || "",
        name: user.full_name || "",
        email: user.email || "",
        role: user.role || "user",
        createdAt: user.created_at ? new Date(user.created_at).toLocaleDateString() : "",
      })) || []

    setUsers(formattedUsers)
  }

  // Load courses
  const loadCourses = async () => {
    let query = supabase
      .from("courses")
      .select(`
        id,
        title,
        level,
        status,
        created_at,
        total_enrollment,
        categories (
          name
        )
      `)
      .order("created_at", { ascending: false })

    if (searchQuery) {
      query = query.ilike("title", `%${searchQuery}%`)
    }

    if (courseStatus) {
      query = query.eq("status", courseStatus)
    }

    if (courseLevel) {
      query = query.eq("level", courseLevel)
    }

    const { data } = await query

    // Format courses data
    const formattedCourses =
      data?.map((course) => ({
        id: course.id || "",
        title: course.title || "",
        category: course.categories?.name || "Uncategorized",
        level: course.level || "Beginner",
        status: course.status || "draft",
        enrollment: course.total_enrollment || 0,
        createdAt: course.created_at ? new Date(course.created_at).toLocaleDateString() : "",
      })) || []

    setCourses(formattedCourses)
  }

  // Load activities
  const loadActivities = async () => {
    let query = supabase
      .from("activities")
      .select(`
        id,
        title,
        type,
        status,
        course_id,
        created_at,
        courses (
          title
        )
      `)
      .order("created_at", { ascending: false })

    if (searchQuery) {
      query = query.ilike("title", `%${searchQuery}%`)
    }

    if (activityStatus) {
      query = query.eq("status", activityStatus)
    }

    if (activityType) {
      query = query.eq("type", activityType)
    }

    const { data } = await query

    // Format activities data
    const formattedActivities =
      data?.map((activity) => ({
        id: activity.id || "",
        title: activity.title || "",
        type: activity.type || "",
        course: activity.courses?.title || "Unknown Course",
        courseId: activity.course_id || "",
        status: activity.status || "draft",
        createdAt: activity.created_at ? new Date(activity.created_at).toLocaleDateString() : "",
      })) || []

    setActivities(formattedActivities)
  }

  // Load vocabulary
  const loadVocabulary = async () => {
    let query = supabase
      .from("vocabulary_words")
      .select(`
        id,
        word,
        definition,
        phonetic,
        level,
        status,
        created_at,
        vocabulary_categories (
          id,
          name
        )
      `)
      .order("created_at", { ascending: false })

    if (searchQuery) {
      query = query.or(`word.ilike.%${searchQuery}%,definition.ilike.%${searchQuery}%`)
    }

    if (vocabularyLevel) {
      query = query.eq("level", vocabularyLevel)
    }

    if (vocabularyCategory) {
      query = query.eq("category_id", vocabularyCategory)
    }

    if (vocabularyStatus) {
      query = query.eq("status", vocabularyStatus)
    }

    const { data } = await query

    // Get vocabulary categories for filter
    const { data: categories } = await supabase
      .from("vocabulary_categories")
      .select("id, name")
      .order("name", { ascending: true })

    // Format vocabulary data
    const formattedVocabulary =
      data?.map((word) => ({
        id: word.id || "",
        word: word.word || "",
        definition: word.definition || "",
        phonetic: word.phonetic || "",
        category: word.vocabulary_categories?.name || "Uncategorized",
        categoryId: word.vocabulary_categories?.id || "",
        level: word.level || "Beginner",
        status: word.status || "draft",
        createdAt: word.created_at ? new Date(word.created_at).toLocaleDateString() : "",
        categories: categories || [],
      })) || []

    setVocabulary(formattedVocabulary)
  }

  // Load students - show all profiles
  const loadStudents = async () => {
    // Fetch all profiles
    let query = supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        email,
        created_at,
        learning_streak,
        last_activity_date
      `)
      .order("created_at", { ascending: false })

    if (searchQuery) {
      query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
    }

    const { data: profiles } = await query

    // Get user progress data for students
    const profileIds = profiles?.map((profile) => profile.id) || []

    if (profileIds.length > 0) {
      // Get user_courses data for accurate progress tracking
      const { data: userCourses } = await supabase
        .from("user_courses")
        .select("user_id, course_id, progress")
        .in("user_id", profileIds)

      // Calculate progress for each student
      const formattedStudents =
        profiles?.map((profile) => {
          const userCoursesData = userCourses?.filter((uc) => uc.user_id === profile.id) || []
          const totalProgress = userCoursesData.reduce((sum, course) => sum + (course.progress || 0), 0)
          const avgProgress = userCoursesData.length > 0 ? Math.round(totalProgress / userCoursesData.length) : 0
          const completedCourses = userCoursesData.filter((course) => course.progress === 100).length
          const inProgressCourses = userCoursesData.length - completedCourses

          return {
            id: profile.id || "",
            name: profile.full_name || "",
            email: profile.email || "",
            progress: avgProgress,
            coursesCompleted: completedCourses,
            coursesInProgress: inProgressCourses,
            streak: profile.learning_streak || 0,
            lastActive: profile.last_activity_date
              ? new Date(profile.last_activity_date).toLocaleDateString()
              : "Never",
            createdAt: profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "",
          }
        }) || []

      setStudents(formattedStudents)
    } else {
      setStudents([])
    }
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Handle filter changes
  const handleFilterChange = (type: string, value: string) => {
    switch (type) {
      case "courseStatus":
        setCourseStatus(value)
        break
      case "courseLevel":
        setCourseLevel(value)
        break
      case "activityStatus":
        setActivityStatus(value)
        break
      case "activityType":
        setActivityType(value)
        break
      case "vocabularyLevel":
        setVocabularyLevel(value)
        break
      case "vocabularyCategory":
        setVocabularyCategory(value)
        break
      case "vocabularyStatus":
        setVocabularyStatus(value)
        break
    }
  }

  // Clear filters
  const clearFilters = () => {
    if (activeTab === "courses") {
      setCourseStatus("")
      setCourseLevel("")
    } else if (activeTab === "activities") {
      setActivityStatus("")
      setActivityType("")
    } else if (activeTab === "vocabulary") {
      setVocabularyLevel("")
      setVocabularyCategory("")
      setVocabularyStatus("")
    }

    setSearchQuery("")
  }

  if (!isAdmin) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Admin Dashboard</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalTeachers} teachers, {stats.totalStudents} students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">{stats.publishedCourses} published</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActivities}</div>
            <p className="text-xs text-muted-foreground">{stats.publishedActivities} published</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vocabulary</CardTitle>
            <BookMarked className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVocabulary}</div>
            <p className="text-xs text-muted-foreground">Total words</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-5 h-auto md:h-10">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader className="block md:flex flex-row items-center justify-between">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage users and their roles</CardDescription>
              </div>
              <div className="relative w-full md:w-64 mt-4 md:mt-0">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search users..." value={searchQuery} onChange={handleSearch} className="pl-8" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <DataTable columns={userColumns} data={users} onDataChange={loadUsers} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="mt-6">
          <Card>
            <CardHeader className="flex flex-col space-y-4">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <div>
                  <CardTitle>Course Management</CardTitle>
                  <CardDescription>Manage courses and their status</CardDescription>
                </div>
                <div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-0">
                  <Button asChild className="w-full">
                    <Link href="/dashboard/admin/courses/new">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Create Course
                    </Link>
                  </Button>
                  <Button variant="outline" onClick={handleDuplicateCourse} className="w-full">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Duplicate Selected
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <div className="flex flex-wrap gap-2 mt-2 w-full md:w-auto">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search courses..."
                      value={searchQuery}
                      onChange={handleSearch}
                      className="pl-8"
                    />
                  </div>
                  <select
                    className="px-3 py-2 border rounded-md w-full md:w-auto"
                    value={courseStatus}
                    onChange={(e) => handleFilterChange("courseStatus", e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                  <select
                    className="px-3 py-2 border rounded-md w-full md:w-auto"
                    value={courseLevel}
                    onChange={(e) => handleFilterChange("courseLevel", e.target.value)}
                  >
                    <option value="">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                {(courseStatus || courseLevel || searchQuery) && (
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  </div>
                )}
                {courseStatus && (
                  <Badge variant="outline" className="mt-2">
                    Status: {courseStatus.charAt(0).toUpperCase() + courseStatus.slice(1)}
                  </Badge>
                )}
                {courseLevel && (
                  <Badge variant="outline" className="mt-2">
                    Level: {courseLevel}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <DataTable
                  columns={courseColumns}
                  data={courses}
                  onDataChange={loadCourses}
                  enableRowSelection={true}
                  getSelectedRows={handleSelectedCourses}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="mt-6">
          <Card>
            <CardHeader className="flex flex-col space-y-4">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <div>
                  <CardTitle>Activity Management</CardTitle>
                  <CardDescription>Manage activities and their status</CardDescription>
                </div>
                <div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-0">
                  <Button asChild className="w-full">
                    <Link href="/dashboard/admin/activities/new">
                      <Activity className="h-4 w-4 mr-2" />
                      Create Activity
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/dashboard/admin/activities/reorder">
                      <Activity className="h-4 w-4 mr-2" />
                      Reorder Activities
                    </Link>
                  </Button>
                  <Button variant="outline" onClick={handleDuplicateActivity} className="w-full">
                    <Activity className="h-4 w-4 mr-2" />
                    Duplicate Selected
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <div className="flex flex-wrap gap-2 mt-2 w-full md:w-auto">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search activities..."
                      value={searchQuery}
                      onChange={handleSearch}
                      className="pl-8"
                    />
                  </div>
                  <select
                    className="px-3 py-2 border rounded-md w-full md:w-auto"
                    value={activityStatus}
                    onChange={(e) => handleFilterChange("activityStatus", e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                  <select
                    className="px-3 py-2 border rounded-md w-full md:w-auto"
                    value={activityType}
                    onChange={(e) => handleFilterChange("activityType", e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="reading">Reading</option>
                    <option value="listening">Listening</option>
                    <option value="quiz">Quiz</option>
                    <option value="fill_blank">Fill Blanks</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                {(activityStatus || activityType || searchQuery) && (
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  </div>
                )}
                {activityStatus && (
                  <Badge variant="outline" className="mt-2">
                    Status: {activityStatus.charAt(0).toUpperCase() + activityStatus.slice(1)}
                  </Badge>
                )}
                {activityType && (
                  <Badge variant="outline" className="mt-2">
                    Type: {activityType.charAt(0).toUpperCase() + activityType.slice(1).replace("_", " ")}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <DataTable
                  columns={activityColumns}
                  data={activities}
                  onDataChange={loadActivities}
                  enableRowSelection={true}
                  getSelectedRows={handleSelectedActivities}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vocabulary" className="mt-6">
          <Card>
            <CardHeader className="flex flex-col space-y-4">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <div>
                  <CardTitle>Vocabulary Management</CardTitle>
                  <CardDescription>Manage vocabulary words and categories</CardDescription>
                </div>
                <div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-0">
                  <Button asChild className="w-full">
                    <Link href="/dashboard/admin/vocabulary/new">
                      <BookMarked className="h-4 w-4 mr-2" />
                      Add Word
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <div className="flex flex-wrap gap-2 mt-2 w-full md:w-auto">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search vocabulary..."
                      value={searchQuery}
                      onChange={handleSearch}
                      className="pl-8"
                    />
                  </div>
                  <select
                    className="px-3 py-2 border rounded-md w-full md:w-auto"
                    value={vocabularyLevel}
                    onChange={(e) => handleFilterChange("vocabularyLevel", e.target.value)}
                  >
                    <option value="">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                  <select
                    className="px-3 py-2 border rounded-md w-full md:w-auto"
                    value={vocabularyStatus}
                    onChange={(e) => handleFilterChange("vocabularyStatus", e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                  <select
                    className="px-3 py-2 border rounded-md w-full md:w-auto"
                    value={vocabularyCategory}
                    onChange={(e) => handleFilterChange("vocabularyCategory", e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {vocabulary[0]?.categories?.map((category: any) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                {(vocabularyLevel || vocabularyCategory || vocabularyStatus || searchQuery) && (
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  </div>
                )}
                {vocabularyLevel && (
                  <Badge variant="outline" className="mt-2">
                    Level: {vocabularyLevel}
                  </Badge>
                )}
                {vocabularyStatus && (
                  <Badge variant="outline" className="mt-2">
                    Status: {vocabularyStatus.charAt(0).toUpperCase() + vocabularyStatus.slice(1)}
                  </Badge>
                )}
                {vocabularyCategory && vocabulary[0]?.categories && (
                  <Badge variant="outline" className="mt-2">
                    Category: {vocabulary[0].categories.find((c: any) => c.id === vocabularyCategory)?.name || ""}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <DataTable columns={vocabularyColumns} data={vocabulary} onDataChange={loadVocabulary} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="mt-6">
          <Card>
            <CardHeader className="flex flex-col space-y-4">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <div>
                  <CardTitle>Student Management</CardTitle>
                  <CardDescription>View and manage student progress</CardDescription>
                </div>
                <Button asChild className="mt-4 md:mt-0 self-start">
                  <Link href="/dashboard/admin/students/export">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Export Student Data
                  </Link>
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="pl-8"
                  />
                </div>
                {searchQuery && (
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <DataTable columns={studentColumns} data={students} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

