"use client"

import type React from "react"

import Link from "next/link"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, RotateCw, Volume2, Loader2, BookmarkCheck } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/components/ui/use-toast"

interface FlashcardProps {
  words: any[]
  userId?: string
}

export default function FlashcardComponent({ words, userId }: FlashcardProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [completed, setCompleted] = useState<number[]>([])
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [learnedWords, setLearnedWords] = useState<string[]>([])
  const supabase = createClient()
  const { toast } = useToast()

  const currentWord = words[currentIndex]

  // Fetch learned words
  useEffect(() => {
    const fetchLearnedWords = async () => {
      if (!userId) return

      const { data } = await supabase
        .from("user_vocabulary")
        .select("word_id")
        .eq("user_id", userId)
        .eq("is_learned", true)

      if (data) {
        setLearnedWords(data.map((item) => item.word_id))
      }
    }

    fetchLearnedWords()
  }, [userId])

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setFlipped(false)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setFlipped(false)
    }
  }

  const handleFlip = () => {
    setFlipped(!flipped)
  }

  const markAsLearned = async () => {
    if (!userId) return

    setIsLoading(true)
    try {
      // Check if entry exists
      const { data } = await supabase
        .from("user_vocabulary")
        .select("*")
        .eq("user_id", userId)
        .eq("word_id", currentWord.id)
        .single()

      if (data) {
        // Update existing entry
        await supabase
          .from("user_vocabulary")
          .update({
            is_learned: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", data.id)
      } else {
        // Create new entry
        await supabase.from("user_vocabulary").insert({
          user_id: userId,
          word_id: currentWord.id,
          is_learned: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }

      // Add to local state
      setLearnedWords((prev) => [...prev, currentWord.id])

      // Add to completed
      if (!completed.includes(currentIndex)) {
        setCompleted([...completed, currentIndex])
      }

      toast({
        title: "Word marked as learned",
        description: `"${currentWord.word}" has been added to your learned vocabulary.`,
      })

      // Move to next word
      handleNext()
    } catch (error) {
      console.error("Error marking word as learned:", error)
      toast({
        title: "Error",
        description: "Failed to mark word as learned.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetFlashcards = () => {
    setCurrentIndex(0)
    setFlipped(false)
    setCompleted([])
  }

  const speakWord = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }

    if ("speechSynthesis" in window && !isSpeaking && currentWord) {
      setIsSpeaking(true)
      const utterance = new SpeechSynthesisUtterance(currentWord.word)
      utterance.lang = "en-US"
      utterance.onend = () => {
        setIsSpeaking(false)
      }
      utterance.onerror = () => {
        setIsSpeaking(false)
      }
      window.speechSynthesis.speak(utterance)
    }
  }

  // Auto-speak when card changes
  useEffect(() => {
    if (currentWord && !flipped) {
      // Add a small delay to ensure the component is fully rendered
      const timer = setTimeout(() => {
        speakWord()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [currentIndex, flipped])

  if (!words.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No vocabulary words available.</p>
        <Button asChild>
          <Link href="/dashboard/vocabulary">Back to Vocabulary</Link>
        </Button>
      </div>
    )
  }

  const isWordLearned = currentWord && learnedWords.includes(currentWord.id)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Card {currentIndex + 1} of {words.length}
        </div>
        <div className="text-sm text-muted-foreground">{completed.length} learned</div>
      </div>

      <div className="relative w-full h-64 cursor-pointer perspective-1000" onClick={handleFlip}>
        <div
          className={`absolute w-full h-full transition-transform duration-500 transform-style-3d ${flipped ? "rotate-y-180" : ""}`}
        >
          <Card className="absolute w-full h-full backface-hidden flex items-center justify-center p-6">
            <CardContent className="text-center p-0">
              <div className="text-3xl font-bold mb-4">{currentWord.word}</div>
              <div className="text-muted-foreground">{currentWord.phonetic || ""}</div>
              <Button
                variant="ghost"
                size="icon"
                className="mt-4"
                onClick={(e) => {
                  e.stopPropagation()
                  speakWord()
                }}
                disabled={isSpeaking}
              >
                {isSpeaking ? <Loader2 className="h-5 w-5 animate-spin" /> : <Volume2 className="h-5 w-5" />}
              </Button>
              <div className="mt-4 text-sm text-muted-foreground">Click to see definition</div>
            </CardContent>
          </Card>

          <Card className="absolute w-full h-full backface-hidden rotate-y-180 flex items-center justify-center p-6">
            <CardContent className="text-center p-0">
              <div className="text-xl font-medium mb-2">Definition:</div>
              <div className="mb-4">{currentWord.definition}</div>
              <div className="text-xl font-medium mb-2">Example:</div>
              <div className="italic">{currentWord.example}</div>
              <div className="mt-4 text-sm text-muted-foreground">Click to see word</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <Button variant="outline" size="icon" onClick={handlePrevious} disabled={currentIndex === 0 || isSpeaking}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" onClick={resetFlashcards}>
            <RotateCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          {!isWordLearned && userId && (
            <Button onClick={markAsLearned} disabled={isLoading || completed.includes(currentIndex)}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <BookmarkCheck className="h-4 w-4 mr-2" />
              )}
              {completed.includes(currentIndex) ? "Learned" : "Mark as Learned"}
            </Button>
          )}
          {isWordLearned && (
            <Button variant="outline" className="bg-green-50 text-green-600 border-green-200" disabled>
              <BookmarkCheck className="h-4 w-4 mr-2" />
              Already Learned
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={currentIndex === words.length - 1 || isSpeaking}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
        <div
          className="bg-primary h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
        ></div>
      </div>
    </div>
  )
}

