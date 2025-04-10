"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash, Volume2, CheckCircle, XCircle } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"

export type VocabularyWord = {
  id: string
  word: string
  definition: string
  phonetic: string
  category: string
  categoryId: string
  level: string
  status: string
  createdAt: string
}

// Function to generate phonetic text
const generatePhonetic = async (word: string): Promise<string> => {
  // This is a simple implementation - in a real app, you might use an API
  // For now, we'll use a basic algorithm to generate a phonetic representation
  const vowels = ["a", "e", "i", "o", "u"]
  let phonetic = "/"

  for (let i = 0; i < word.length; i++) {
    const char = word[i].toLowerCase()
    if (vowels.includes(char)) {
      // Add a phonetic symbol for vowels
      switch (char) {
        case "a":
          phonetic += "æ"
          break
        case "e":
          phonetic += "ɛ"
          break
        case "i":
          phonetic += "ɪ"
          break
        case "o":
          phonetic += "ɒ"
          break
        case "u":
          phonetic += "ʌ"
          break
        default:
          phonetic += char
      }
    } else {
      // Just add the consonant
      phonetic += char
    }
  }

  phonetic += "/"
  return phonetic
}

// Create columns with refresh callback
export const createVocabularyColumns = (onDataChange: () => void): ColumnDef<VocabularyWord>[] => [
  {
    accessorKey: "word",
    header: "Word",
  },
  {
    accessorKey: "definition",
    header: "Definition",
    cell: ({ row }) => {
      const definition = row.getValue("definition") as string
      return <span className="truncate max-w-[200px] block">{definition}</span>
    },
  },
  {
    accessorKey: "phonetic",
    header: "Phonetic",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "level",
    header: "Level",
    cell: ({ row }) => {
      const level = row.getValue("level") as string

      const getBadgeColor = (level: string) => {
        switch (level) {
          case "Beginner":
            return "bg-green-100 text-green-800 hover:bg-green-200"
          case "Intermediate":
            return "bg-blue-100 text-blue-800 hover:bg-blue-200"
          case "Advanced":
            return "bg-purple-100 text-purple-800 hover:bg-purple-200"
          default:
            return "bg-gray-100 text-gray-800 hover:bg-gray-200"
        }
      }

      return <Badge className={getBadgeColor(level)}>{level}</Badge>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant={status === "published" ? "default" : "outline"}>
          {status === "published" ? "Published" : "Draft"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const word = row.original
      const [isSpeaking, setIsSpeaking] = useState(false)
      const { toast } = useToast()
      const router = useRouter()
      const supabase = createClient()

      const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this vocabulary word? This action cannot be undone.")) {
          return
        }

        try {
          // Delete from vocabulary_words table
          const { error } = await supabase.from("vocabulary_words").delete().eq("id", word.id)

          if (error) throw error

          toast({
            title: "Word deleted",
            description: "The vocabulary word has been deleted successfully.",
          })

          onDataChange()
        } catch (error: any) {
          console.error("Error deleting vocabulary word:", error)
          toast({
            title: "Error",
            description: error.message || "Failed to delete vocabulary word.",
            variant: "destructive",
          })
        }
      }

      const handleGeneratePhonetic = async () => {
        try {
          const phonetic = await generatePhonetic(word.word)

          // Update the phonetic in the database
          const { error } = await supabase.from("vocabulary_words").update({ phonetic }).eq("id", word.id)

          if (error) throw error

          toast({
            title: "Phonetic updated",
            description: `Phonetic for "${word.word}" has been updated to "${phonetic}".`,
          })

          onDataChange()
        } catch (error: any) {
          console.error("Error generating phonetic:", error)
          toast({
            title: "Error",
            description: error.message || "Failed to generate phonetic.",
            variant: "destructive",
          })
        }
      }

      const handleChangeStatus = async (newStatus: string) => {
        try {
          const { error } = await supabase.from("vocabulary_words").update({ status: newStatus }).eq("id", word.id)

          if (error) throw error

          toast({
            title: "Status updated",
            description: `"${word.word}" is now ${newStatus}.`,
          })

          onDataChange()
        } catch (error: any) {
          console.error("Error updating status:", error)
          toast({
            title: "Error",
            description: error.message || "Failed to update status.",
            variant: "destructive",
          })
        }
      }

      const speakWord = () => {
        if ("speechSynthesis" in window && !isSpeaking) {
          setIsSpeaking(true)
          const utterance = new SpeechSynthesisUtterance(word.word)
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

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={speakWord} className="cursor-pointer">
              <Volume2 className="h-4 w-4 mr-2" />
              Pronounce
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleGeneratePhonetic} className="cursor-pointer">
              Generate Phonetic
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href={`/dashboard/admin/vocabulary/edit/${word.id}`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {word.status === "draft" ? (
              <DropdownMenuItem onClick={() => handleChangeStatus("published")} className="cursor-pointer">
                <CheckCircle className="h-4 w-4 mr-2" />
                Publish
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => handleChangeStatus("draft")} className="cursor-pointer">
                <XCircle className="h-4 w-4 mr-2" />
                Unpublish
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="text-red-600 cursor-pointer">
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

// Default columns for static usage
export const columns: ColumnDef<VocabularyWord>[] = createVocabularyColumns(() => {})

