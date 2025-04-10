"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

export async function addVocabulary(formData: FormData) {
  try {
    const supabase = createClient()

    const word = formData.get("word") as string
    const translation = formData.get("translation") as string
    const definition = formData.get("definition") as string
    const example = formData.get("example") as string
    const phonetic = formData.get("phonetic") as string
    const level = formData.get("level") as string
    const category_id = formData.get("category") as string

    const { data, error } = await supabase
      .from("vocabulary_words")
      .insert([
        {
          word,
          translation,
          definition,
          example,
          phonetic,
          level,
          category_id,
        },
      ])
      .select()

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    revalidatePath("/dashboard/admin")
    revalidatePath("/dashboard/vocabulary")

    // Redirect to the vocabulary tab
    redirect("/dashboard/admin?tab=vocabulary")

    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error("Error adding vocabulary:", error)
    return {
      success: false,
      error: "An unexpected error occurred",
    }
  }
}

export async function updateVocabulary(formData: FormData) {
  try {
    const supabase = createClient()

    const id = formData.get("id") as string
    const word = formData.get("word") as string
    const translation = formData.get("translation") as string
    const definition = formData.get("definition") as string
    const example = formData.get("example") as string
    const phonetic = formData.get("phonetic") as string
    const level = formData.get("level") as string
    const category_id = formData.get("category") as string

    const { data, error } = await supabase
      .from("vocabulary_words")
      .update({
        word,
        translation,
        definition,
        example,
        phonetic,
        level,
        category_id,
      })
      .eq("id", id)
      .select()

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    revalidatePath("/dashboard/admin")
    revalidatePath("/dashboard/vocabulary")

    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error("Error updating vocabulary:", error)
    return {
      success: false,
      error: "An unexpected error occurred",
    }
  }
}

export async function deleteVocabulary(id: string) {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("vocabulary_words").delete().eq("id", id)

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    revalidatePath("/dashboard/admin")
    revalidatePath("/dashboard/vocabulary")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error deleting vocabulary:", error)
    return {
      success: false,
      error: "An unexpected error occurred",
    }
  }
}

export async function markVocabularyAsLearned(vocabularyId: string, userId: string) {
  try {
    const supabase = createClient()

    // Check if the record already exists
    const { data: existingRecord, error: checkError } = await supabase
      .from("user_vocabulary")
      .select("*")
      .eq("user_id", userId)
      .eq("vocabulary_id", vocabularyId)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 is the error code for "no rows returned"
      return {
        success: false,
        error: checkError.message,
      }
    }

    // If the record exists, update it, otherwise insert a new one
    let result
    if (existingRecord) {
      result = await supabase
        .from("user_vocabulary")
        .update({
          is_learned: true,
          learned_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("vocabulary_id", vocabularyId)
    } else {
      result = await supabase.from("user_vocabulary").insert([
        {
          user_id: userId,
          vocabulary_id: vocabularyId,
          is_learned: true,
          learned_at: new Date().toISOString(),
        },
      ])
    }

    if (result.error) {
      return {
        success: false,
        error: result.error.message,
      }
    }

    revalidatePath("/dashboard/vocabulary")
    revalidatePath("/dashboard/vocabulary/flashcards")
    revalidatePath("/dashboard/progress")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error marking vocabulary as learned:", error)
    return {
      success: false,
      error: "An unexpected error occurred",
    }
  }
}

export async function markVocabularyAsNotLearned(vocabularyId: string, userId: string) {
  try {
    const supabase = createClient()

    const { error } = await supabase
      .from("user_vocabulary")
      .update({
        is_learned: false,
        learned_at: null,
      })
      .eq("user_id", userId)
      .eq("vocabulary_id", vocabularyId)

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    revalidatePath("/dashboard/vocabulary")
    revalidatePath("/dashboard/vocabulary/flashcards")
    revalidatePath("/dashboard/progress")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error marking vocabulary as not learned:", error)
    return {
      success: false,
      error: "An unexpected error occurred",
    }
  }
}

