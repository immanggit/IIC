"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Volume2, Loader2, BookmarkCheck, BookmarkPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/components/ui/use-toast"

interface VocabularyCardProps {
  word: any
  userId?: string
  onLearnStatusChange?: (wordId: string, isLearned: boolean) => void
}

export default function VocabularyCard({ word, userId, onLearnStatusChange }: VocabularyCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLearned, setIsLearned] = useState(word.isLearned || false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  // Check if word is already learned
  useEffect(() => {
    const checkIfLearned = async () => {
      if (!userId) return

      const { data } = await supabase
        .from("user_vocabulary")
        .select("*")
        .eq("user_id", userId)
        .eq("word_id", word.id)
        .single()

      if (data) {
        setIsLearned(data.is_learned)
      }
    }

    checkIfLearned()
  }, [userId, word.id])

  // Text-to-speech function
  const speakWord = () => {
    if ("speechSynthesis" in window && !isSpeaking) {
      setIsSpeaking(true)
      const utterance = new SpeechSynthesisUtterance(word.word)

      // Set to English language
      utterance.lang = "en-US"

      // Set speech rate to 0.7 (slower)
      utterance.rate = 0.7

      // Get available voices
      const voices = window.speechSynthesis.getVoices()

      // Try to find a female English voice
      const femaleVoice = voices.find(
        (voice) =>
          (voice.name.includes("female") ||
            voice.name.includes("Female") ||
            voice.name.includes("woman") ||
            voice.name.includes("Woman") ||
            voice.name.includes("girl") ||
            voice.name.includes("Girl")) &&
          (voice.lang.includes("en") || voice.lang.includes("US")),
      )

      // If a female voice is found, use it
      if (femaleVoice) {
        utterance.voice = femaleVoice
      } else {
        // If no female voice is found, try to find any English voice
        const englishVoice = voices.find((voice) => voice.lang.includes("en") || voice.lang.includes("US"))
        if (englishVoice) {
          utterance.voice = englishVoice
        }
      }

      utterance.onend = () => {
        setIsSpeaking(false)
      }
      utterance.onerror = () => {
        setIsSpeaking(false)
      }

      window.speechSynthesis.speak(utterance)
    }
  }

  // Handle pronunciation
  const handlePronunciation = () => {
    // If already speaking or playing, do nothing
    if (isPlaying || isSpeaking) return

    // Use text-to-speech
    speakWord()
  }

  // Handle practice button click
  const handlePractice = () => {
    router.push("/dashboard/vocabulary/flashcards")
  }

  // Handle mark as learned
  const handleLearnToggle = async () => {
    if (!userId) {
      toast({
        title: "Login Required",
        description: "Please login to mark words as learned",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Check if the word is already in user_vocabulary
      const { data: existingEntry } = await supabase
        .from("user_vocabulary")
        .select("*")
        .eq("user_id", userId)
        .eq("word_id", word.id)
        .single()

      if (existingEntry) {
        // Update existing entry
        const { error } = await supabase
          .from("user_vocabulary")
          .update({ is_learned: !isLearned, updated_at: new Date().toISOString() })
          .eq("id", existingEntry.id)

        if (error) throw error
      } else {
        // Create new entry
        const { error } = await supabase.from("user_vocabulary").insert({
          user_id: userId,
          word_id: word.id,
          is_learned: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (error) throw error
      }

      // Update local state
      const newLearnedStatus = !isLearned
      setIsLearned(newLearnedStatus)

      // Notify parent component about the change
      if (onLearnStatusChange) {
        onLearnStatusChange(word.id, newLearnedStatus)
      }

      toast({
        title: newLearnedStatus ? "Word Learned" : "Word Unmarked",
        description: newLearnedStatus
          ? `You've marked "${word.word}" as learned`
          : `You've unmarked "${word.word}" as learned`,
      })
    } catch (error: any) {
      console.error("Error toggling learn status:", error)
      toast({
        title: "Error",
        description: "Failed to update word status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Get badge color based on level
  const getBadgeColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-100 text-green-800"
      case "Intermediate":
        return "bg-blue-100 text-blue-800"
      case "Advanced":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-primary/10 text-primary"
    }
  }

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="aspect-video relative h-48">
        <img
          src={
            word.image_url ||
            "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=3546&auto=format&fit=crop" ||
            "/placeholder.svg" ||
            "/placeholder.svg"
          }
          alt={word.word}
          className="h-full w-full object-cover"
        />
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <CardTitle>{word.word}</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handlePronunciation}
              disabled={isPlaying || isSpeaking}
              aria-label={`Pronounce ${word.word}`}
            >
              {isPlaying || isSpeaking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
          <div className={`text-sm px-2 py-1 rounded-md ${getBadgeColor(word.level || "Beginner")}`}>
            {word.level || "Beginner"}
          </div>
        </div>
        <CardDescription>{word.phonetic || "/fəˈnetɪk/"}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-2">
          <div>
            <span className="font-medium">Definition:</span> {word.definition}
          </div>
          <div>
            <span className="font-medium">Example:</span> {word.example}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button size="sm" variant="outline" onClick={handlePronunciation} disabled={isSpeaking}>
          {isSpeaking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Volume2 className="h-4 w-4 mr-2" />}
          Pronounce
        </Button>

        {isLearned ? (
          <Button
            size="sm"
            variant="outline"
            className="bg-green-50 text-green-600 border-green-200"
            onClick={handleLearnToggle}
            disabled={isLoading}
          >
            <BookmarkCheck className="h-4 w-4 mr-2" />
            Learned
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={handleLearnToggle} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <BookmarkPlus className="h-4 w-4 mr-2" />}
            Mark as Learned
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

