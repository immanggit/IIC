import Link from "next/link"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/server"
import { ArrowLeft } from "lucide-react"
import VocabularyPractice from "@/components/vocabulary/vocabulary-practice"

export default async function VocabularyPracticePage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Fetch the specific vocabulary word
  const { data: word } = await supabase.from("vocabulary_words").select("*").eq("id", params.id).single()

  if (!word) {
    notFound()
  }

  // Fetch additional words for practice
  const { data: relatedWords } = await supabase
    .from("vocabulary_words")
    .select("*")
    .eq("level", word.level)
    .neq("id", word.id)
    .limit(5)

  const practiceWords = [word, ...(relatedWords || [])].sort(() => Math.random() - 0.5)

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link href="/dashboard/vocabulary" className="text-primary hover:underline inline-flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Vocabulary
        </Link>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Practice: {word.word}</CardTitle>
        </CardHeader>
        <CardContent>
          <VocabularyPractice word={word} relatedWords={practiceWords} />
        </CardContent>
      </Card>
    </div>
  )
}

