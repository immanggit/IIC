import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import FlashcardComponent from "@/components/vocabulary/flashcard"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function FlashcardsPage() {
  const supabase = createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch vocabulary words - only published
  const { data: words } = await supabase
    .from("vocabulary_words")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link href="/dashboard/vocabulary" className="text-primary hover:underline inline-flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Vocabulary
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Vocabulary Flashcards</CardTitle>
        </CardHeader>
        <CardContent>
          <FlashcardComponent words={words || []} userId={user.id} />
        </CardContent>
      </Card>
    </div>
  )
}

