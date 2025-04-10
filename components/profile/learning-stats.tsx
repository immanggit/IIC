"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Clock, Star } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Loader2 } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

interface LearningStatsProps {
  completedActivities: number
  totalTimeSpent: number
  learningStreak: number
  courses: any[]
  progress: any[]
}

export default function LearningStats({
  completedActivities,
  totalTimeSpent,
  learningStreak,
  courses,
  progress,
}: LearningStatsProps) {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("activity")
  const [weeklyData, setWeeklyData] = useState<any[]>([])
  const [activityTypeData, setActivityTypeData] = useState<any[]>([])
  const supabase = createClient()

  // Format time spent
  const formatTimeSpent = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  useEffect(() => {
    const prepareChartData = async () => {
      setLoading(true)

      try {
        // Prepare data for activity type chart
        const typeData = [
          {
            name: "Reading",
            value: progress.filter((p) => p.activities?.type === "reading" && p.completed).length || 0,
          },
          {
            name: "Listening",
            value: progress.filter((p) => p.activities?.type === "listening" && p.completed).length || 0,
          },
          { name: "Quiz", value: progress.filter((p) => p.activities?.type === "quiz" && p.completed).length || 0 },
          {
            name: "Fill Blanks",
            value: progress.filter((p) => p.activities?.type === "fill_blank" && p.completed).length || 0,
          },
          { name: "Video", value: progress.filter((p) => p.activities?.type === "video" && p.completed).length || 0 },
        ].filter((item) => item.value > 0)

        // If no data, add a placeholder
        if (typeData.length === 0) {
          typeData.push({ name: "No Activities", value: 1 })
        }

        setActivityTypeData(typeData)

        // Prepare data for weekly activity chart
        const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        const today = new Date().getDay() // 0 = Sunday, 1 = Monday, etc.

        // Create realistic weekly data based on completed activities
        const weeklyActivityData = daysOfWeek.map((day, index) => {
          // Adjust index to match JavaScript's day numbering (0 = Sunday)
          const adjustedIndex = (index + 1) % 7
          const dayDiff = (today - adjustedIndex + 7) % 7
          const targetDate = new Date()
          targetDate.setDate(targetDate.getDate() - dayDiff)

          // Format date to YYYY-MM-DD for comparison
          const dateStr = targetDate.toISOString().split("T")[0]

          // Count activities completed on this day
          const activitiesCompleted = progress.filter((activity) => {
            if (!activity.completed) return false
            const activityDate = new Date(activity.updated_at).toISOString().split("T")[0]
            return activityDate === dateStr
          }).length

          return {
            name: day,
            activities: activitiesCompleted,
            minutes: activitiesCompleted * 5, // Estimate 5 minutes per activity
          }
        })

        setWeeklyData(weeklyActivityData)
      } catch (error) {
        console.error("Error preparing chart data:", error)
      } finally {
        setLoading(false)
      }
    }

    prepareChartData()
  }, [progress])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  // Colors for pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  // Custom tooltip for bar chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="font-medium">{label}</p>
          <p className="text-sm">{`Activities: ${payload[0].value}`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Activities Completed</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedActivities}</div>
            <p className="text-xs text-muted-foreground">
              {completedActivities > 10 ? "Great progress!" : "Keep going!"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Time Spent Learning</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTimeSpent(totalTimeSpent)}</div>
            <p className="text-xs text-muted-foreground">Total learning time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Learning Streak</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{learningStreak} days</div>
            <p className="text-xs text-muted-foreground">{learningStreak > 5 ? "Impressive streak!" : "Keep it up!"}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity" className="w-full" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="activity">Activity Breakdown</TabsTrigger>
          <TabsTrigger value="progress">Course Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
              <CardDescription>Your learning activity over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="activities" name="Activities Completed" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Types</CardTitle>
              <CardDescription>Breakdown of completed activities by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={activityTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {activityTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Progress</CardTitle>
              <CardDescription>Your progress in current courses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {courses.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">You haven't started any courses yet.</p>
              ) : (
                courses.map((course) => {
                  // Calculate course progress
                  const courseProgress = progress.filter((p) => p.course_id === course.id)
                  const completedActivities = courseProgress.filter((p) => p.completed).length
                  const progressPercentage =
                    courseProgress.length > 0 ? Math.round((completedActivities / courseProgress.length) * 100) : 0

                  return (
                    <div key={course.id} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{course.title}</span>
                        <span>{progressPercentage}%</span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {completedActivities} of {courseProgress.length} activities completed
                      </p>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

