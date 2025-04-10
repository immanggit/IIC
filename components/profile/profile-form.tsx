"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Upload, Save } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ProfileFormProps {
  profile: any
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const [fullName, setFullName] = useState(profile?.full_name || "")
  const [bio, setBio] = useState(profile?.bio || "")
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "")
  const [yearOfBirth, setYearOfBirth] = useState(profile?.year_of_birth?.toString() || "2000")
  const [loading, setLoading] = useState(false)

  // Learning preferences state
  const [preferredLevel, setPreferredLevel] = useState(profile?.preferred_level || "Beginner")
  const [dailyTarget, setDailyTarget] = useState(profile?.daily_target?.toString() || "15")
  const [learningGoals, setLearningGoals] = useState<string[]>(profile?.learning_goals || [])
  const [isEditingPreferences, setIsEditingPreferences] = useState(false)

  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  // Generate years for the year picker (from 1950 to current year)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1949 }, (_, i) => (currentYear - i).toString())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          bio: bio,
          avatar_url: avatarUrl,
          year_of_birth: Number.parseInt(yearOfBirth),
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id)

      if (error) throw error

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    const fileExt = file.name.split(".").pop()
    const fileName = `${profile.id}.${fileExt}`
    const filePath = `avatars/${fileName}`

    setLoading(true)

    try {
      // Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)

      setAvatarUrl(data.publicUrl)

      toast({
        title: "Avatar uploaded",
        description: "Your avatar has been uploaded successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload avatar.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleLearningGoal = (goal: string) => {
    if (learningGoals.includes(goal)) {
      setLearningGoals(learningGoals.filter((g) => g !== goal))
    } else {
      setLearningGoals([...learningGoals, goal])
    }
  }

  const savePreferences = async () => {
    setLoading(true)

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          preferred_level: preferredLevel,
          daily_target: Number.parseInt(dailyTarget),
          learning_goals: learningGoals,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id)

      if (error) throw error

      toast({
        title: "Preferences updated",
        description: "Your learning preferences have been updated successfully.",
      })

      setIsEditingPreferences(false)
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update preferences.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="w-24 h-24">
            <AvatarImage src={avatarUrl} alt={fullName} />
            <AvatarFallback>
              <User className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>

          <div className="flex items-center">
            <Label htmlFor="avatar" className="cursor-pointer text-sm px-3 py-1 border rounded-md hover:bg-muted">
              <Upload className="h-4 w-4 inline mr-1" />
              Change Avatar
            </Label>
            <Input id="avatar" type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="yearOfBirth">Year of Birth</Label>
          <Select value={yearOfBirth} onValueChange={setYearOfBirth}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us a bit about yourself"
            rows={4}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </form>

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Learning Preferences</h3>
            <Button variant="outline" size="sm" onClick={() => setIsEditingPreferences(!isEditingPreferences)}>
              {isEditingPreferences ? "Cancel" : "Edit"}
            </Button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Preferred Level</Label>
              <RadioGroup
                value={preferredLevel}
                onValueChange={setPreferredLevel}
                className="md:flex md:space-x-2"
                disabled={!isEditingPreferences}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Beginner" id="beginner" />
                  <Label htmlFor="beginner" className="cursor-pointer">
                    Beginner
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Intermediate" id="intermediate" />
                  <Label htmlFor="intermediate" className="cursor-pointer">
                    Intermediate
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Advanced" id="advanced" />
                  <Label htmlFor="advanced" className="cursor-pointer">
                    Advanced
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Learning Goals</Label>
              <div className="flex flex-wrap gap-2">
                {["Reading", "Listening", "Speaking", "Writing", "Vocabulary", "Grammar"].map((goal) => (
                  <Button
                    key={goal}
                    type="button"
                    variant={learningGoals.includes(goal) ? "default" : "outline"}
                    size="sm"
                    onClick={() => isEditingPreferences && toggleLearningGoal(goal)}
                    className={!isEditingPreferences ? "cursor-default" : ""}
                    disabled={!isEditingPreferences}
                  >
                    {goal}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Daily Learning Target</Label>
              <RadioGroup
                value={dailyTarget}
                onValueChange={setDailyTarget}
                className="md:flex md:space-x-2"
                disabled={!isEditingPreferences}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="15" id="15min" />
                  <Label htmlFor="15min" className="cursor-pointer">
                    15 minutes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="30" id="30min" />
                  <Label htmlFor="30min" className="cursor-pointer">
                    30 minutes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="45" id="45min" />
                  <Label htmlFor="45min" className="cursor-pointer">
                    45 minutes
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {isEditingPreferences && (
              <Button onClick={savePreferences} disabled={loading} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save Preferences"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

