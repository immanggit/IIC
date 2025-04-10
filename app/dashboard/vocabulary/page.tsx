"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Search, Loader2, BookOpen, BookmarkCheck } from "lucide-react"
import { Input } from "@/components/ui/input"
import VocabularyCard from "@/components/vocabulary/vocabulary-card"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function VocabularyPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [words, setWords] = useState<any[]>([])
  const [filteredWords, setFilteredWords] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [userId, setUserId] = useState<string | null>(null)
  const [learnedWords, setLearnedWords] = useState<string[]>([])
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        setUserId(data.user.id)
      }
    }

    fetchUser()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)

      // Fetch vocabulary categories
      const { data: categoriesData } = await supabase
        .from("vocabulary_categories")
        .select("*")
        .order("name", { ascending: true })

      // Fetch vocabulary words - only published
      const { data: wordsData } = await supabase
        .from("vocabulary_words")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false })

      // Fetch learned words if user is logged in
      let learnedWordsIds: string[] = []
      if (userId) {
        const { data: userVocabulary } = await supabase
          .from("user_vocabulary")
          .select("word_id")
          .eq("user_id", userId)
          .eq("is_learned", true)

        if (userVocabulary) {
          learnedWordsIds = userVocabulary.map((item) => item.word_id)
          setLearnedWords(learnedWordsIds)
        }
      }

      // Mark words as learned
      const wordsWithLearnedStatus =
        wordsData?.map((word) => ({
          ...word,
          isLearned: learnedWordsIds.includes(word.id),
        })) || []

      setCategories(categoriesData || [])
      setWords(wordsWithLearnedStatus)
      setFilteredWords(wordsWithLearnedStatus)
      setIsLoading(false)
    }

    fetchData()
  }, [userId])

  // Filter words based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredWords(words)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = words.filter(
        (word) => word.word.toLowerCase().includes(query) || word.definition.toLowerCase().includes(query),
      )
      setFilteredWords(filtered)
    }
  }, [searchQuery, words])

  // Filter words based on active tab
  useEffect(() => {
    if (activeTab === "all") {
      setFilteredWords(
        words.filter((word) =>
          searchQuery
            ? word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
              word.definition.toLowerCase().includes(searchQuery.toLowerCase())
            : true,
        ),
      )
    } else if (activeTab === "learned") {
      setFilteredWords(
        words.filter(
          (word) =>
            learnedWords.includes(word.id) &&
            (searchQuery
              ? word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
                word.definition.toLowerCase().includes(searchQuery.toLowerCase())
              : true),
        ),
      )
    } else if (activeTab === "flashcards") {
      // No filtering for flashcards tab
    } else if (activeTab.startsWith("category-")) {
      const categoryId = activeTab.replace("category-", "")
      setFilteredWords(
        words.filter(
          (word) =>
            word.category_id === categoryId &&
            (searchQuery
              ? word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
                word.definition.toLowerCase().includes(searchQuery.toLowerCase())
              : true),
        ),
      )
    }
  }, [activeTab, words, searchQuery, learnedWords])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Get word counts by category
  const getWordCountByCategory = (categoryId: string) => {
    return words.filter((word) => word.category_id === categoryId).length
  }

  // Handle learn status change
  const handleLearnStatusChange = (wordId: string, isLearned: boolean) => {
    // Update learnedWords state
    if (isLearned) {
      setLearnedWords((prev) => [...prev, wordId])
    } else {
      setLearnedWords((prev) => prev.filter((id) => id !== wordId))
    }

    // Update words state
    setWords((prev) => prev.map((word) => (word.id === wordId ? { ...word, isLearned } : word)))
  }

  if (isLoading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading vocabulary...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Vocabulary Builder</h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search words..." className="pl-8" value={searchQuery} onChange={handleSearch} />
        </div>
      </div>

      {/* Vocabulary Stats */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Words</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{words.length}</div>
            <p className="text-xs text-muted-foreground">in vocabulary</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Learned Words</CardTitle>
            <BookmarkCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{learnedWords.length}</div>
            <p className="text-xs text-muted-foreground">
              {learnedWords.length > 0
                ? `${Math.round((learnedWords.length / words.length) * 100)}% of total vocabulary`
                : "Start learning new words!"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full flex flex-wrap h-auto py-2">
          <TabsTrigger value="all" className="rounded-md">
            All Words ({words.length})
          </TabsTrigger>
          <TabsTrigger value="learned" className="rounded-md">
            Learned ({learnedWords.length})
          </TabsTrigger>
          <TabsTrigger value="flashcards" className="rounded-md">
            Flashcards
          </TabsTrigger>
          {categories?.map((category) => (
            <TabsTrigger key={category.id} value={`category-${category.id}`} className="rounded-md">
              {category.name} ({getWordCountByCategory(category.id)})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {filteredWords.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-muted-foreground mb-4">No vocabulary words found matching your search.</p>
              {searchQuery && (
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredWords.map((word) => (
                <VocabularyCard
                  key={word.id}
                  word={word}
                  userId={userId || undefined}
                  onLearnStatusChange={handleLearnStatusChange}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="learned" className="mt-6">
          {filteredWords.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-muted-foreground mb-4">
                {learnedWords.length === 0
                  ? "You haven't learned any words yet."
                  : "No learned words found matching your search."}
              </p>
              {searchQuery && (
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredWords.map((word) => (
                <VocabularyCard
                  key={word.id}
                  word={word}
                  userId={userId || undefined}
                  onLearnStatusChange={handleLearnStatusChange}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="flashcards" className="mt-6">
          <div className="flex justify-center">
            <Link href="/dashboard/vocabulary/flashcards">
              <Button size="lg">Start Flashcard Practice</Button>
            </Link>
          </div>
        </TabsContent>

        {categories?.map((category) => (
          <TabsContent key={category.id} value={`category-${category.id}`} className="mt-6">
            {filteredWords.length === 0 ? (
              <div className="text-center py-12 border rounded-lg">
                <p className="text-muted-foreground mb-4">
                  No vocabulary words found in this category matching your search.
                </p>
                {searchQuery && (
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredWords
                  .filter((word) => word.category_id === category.id)
                  .map((word) => (
                    <VocabularyCard
                      key={word.id}
                      word={word}
                      userId={userId || undefined}
                      onLearnStatusChange={handleLearnStatusChange}
                    />
                  ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

