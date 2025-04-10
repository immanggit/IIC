import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProfileForm from "@/components/profile/profile-form"
import AccountSettings from "@/components/profile/account-settings"
import LearningStats from "@/components/profile/learning-stats"

export default async function ProfilePage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch user profile data
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch user progress data
  const { data: userProgress } = await supabase
    .from("user_progress")
    .select("*, activities(*), courses(*)")
    .eq("user_id", user.id)

  // Calculate learning stats
  const completedActivities = userProgress?.filter((progress) => progress.completed) || []
  const totalTimeSpent = completedActivities.reduce((total, activity) => total + (activity.time_spent || 0), 0)
  const learningStreak = profile?.learning_streak || 0

  // Get courses in progress
  const courseIds = [...new Set(userProgress?.map((progress) => progress.course_id) || [])]
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .in("id", courseIds.length > 0 ? courseIds : ["no-courses"])

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileForm profile={profile} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="account">
          <AccountSettings user={user} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

