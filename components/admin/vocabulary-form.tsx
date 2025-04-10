"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addVocabulary, updateVocabulary } from "@/app/actions/vocabulary-actions"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { createClient } from "@/utils/supabase/client"

interface VocabularyFormProps {
  vocabulary?: any
}

export function VocabularyForm({ vocabulary }: VocabularyFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const supabase = createClient()

  // Form state
  const [word, setWord] = useState(vocabulary?.word || "")
  const [translation, setTranslation] = useState(vocabulary?.translation || "")
  const [definition, setDefinition] = useState(vocabulary?.definition || "")
  const [example, setExample] = useState(vocabulary?.example || "")
  const [phonetic, setPhonetic] = useState(vocabulary?.phonetic || "")
  const [level, setLevel] = useState(vocabulary?.level || "beginner")
  const [category, setCategory] = useState(vocabulary?.category_id || "")
  const [status, setStatus] = useState(vocabulary?.status || "draft")

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("vocabulary_categories")
        .select("id, name")
        .order("name", { ascending: true })

      setCategories(data || [])

      // If editing and we have a category_id, set it
      if (vocabulary?.category_id) {
        setCategory(vocabulary.category_id)
      } else if (data && data.length > 0) {
        // Otherwise set the first category as default
        setCategory(data[0].id)
      }
    }

    fetchCategories()
  }, [vocabulary])

  // Generate phonetic text when word changes
  const handleWordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWord = e.target.value
    setWord(newWord)

    if (newWord && newWord.length > 0) {
      // Simple phonetic generation
      const newPhonetic = generateSimplePhonetic(newWord)
      setPhonetic(newPhonetic)
    }
  }

  // Simple phonetic generator
  const generateSimplePhonetic = (word: string) => {
    return `/${word.toLowerCase().replace(/[aeiou]/g, (match) => {
      switch (match) {
        case "a":
          return "ə"
        case "e":
          return "ɛ"
        case "i":
          return "ɪ"
        case "o":
          return "ɒ"
        case "u":
          return "ʌ"
        default:
          return match
      }
    })}/`
  }

  // Form validation
  const validateForm = () => {
    if (!word) {
      toast({ title: "Error", description: "Word is required", variant: "destructive" })
      return false
    }
    if (!translation) {
      toast({ title: "Error", description: "Translation is required", variant: "destructive" })
      return false
    }
    if (!definition) {
      toast({ title: "Error", description: "Definition is required", variant: "destructive" })
      return false
    }
    if (!example) {
      toast({ title: "Error", description: "Example is required", variant: "destructive" })
      return false
    }
    if (!category) {
      toast({ title: "Error", description: "Category is required", variant: "destructive" })
      return false
    }
    return true
  }

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const formData = new FormData()

      if (vocabulary?.id) {
        formData.append("id", vocabulary.id)
      }

      formData.append("word", word)
      formData.append("translation", translation)
      formData.append("definition", definition)
      formData.append("example", example)
      formData.append("phonetic", phonetic)
      formData.append("level", level)
      formData.append("category_id", category)
      formData.append("status", status)

      const result = vocabulary?.id ? await updateVocabulary(formData) : await addVocabulary(formData)

      if (result.success) {
        toast({
          title: vocabulary?.id ? "Vocabulary updated" : "Vocabulary added",
          description: vocabulary?.id
            ? "The vocabulary has been updated successfully."
            : "The vocabulary has been added successfully.",
        })
        router.push("/dashboard/admin?tab=vocabulary")
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error || "Something went wrong",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{vocabulary?.id ? "Edit Vocabulary" : "Add Vocabulary"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="word">Word</Label>
            <Input id="word" value={word} onChange={handleWordChange} placeholder="Enter word" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="translation">Translation</Label>
            <Input
              id="translation"
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              placeholder="Enter translation"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="definition">Definition</Label>
            <Textarea
              id="definition"
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              placeholder="Enter definition"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="example">Example</Label>
            <Textarea
              id="example"
              value={example}
              onChange={(e) => setExample(e.target.value)}
              placeholder="Enter example"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phonetic">Phonetic</Label>
            <Input
              id="phonetic"
              value={phonetic}
              onChange={(e) => setPhonetic(e.target.value)}
              placeholder="Enter phonetic"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Level</Label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : vocabulary?.id ? "Update Vocabulary" : "Add Vocabulary"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

