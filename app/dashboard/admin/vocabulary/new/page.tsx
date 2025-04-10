import { VocabularyForm } from "@/components/admin/vocabulary-form"

export default function NewVocabularyPage() {
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">Add New Vocabulary</h1>
      <VocabularyForm />
    </div>
  )
}

