import { createServerClient } from "@/utils/supabase/server"
import { VocabularyForm } from "@/components/admin/vocabulary-form"
import { notFound } from "next/navigation"

export default async function EditVocabularyPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerClient()

  const { data: vocabulary, error } = await supabase.from("vocabulary").select("*").eq("id", params.id).single()

  if (error || !vocabulary) {
    notFound()
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">Edit Vocabulary</h1>
      <VocabularyForm vocabulary={vocabulary} />
    </div>
  )
}

