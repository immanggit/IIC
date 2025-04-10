"use client"

import { useSearchParams } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function LoginError() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  if (!error) return null

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {error === "session"
          ? "There was a problem with your session. Please log in again."
          : "An error occurred. Please try again."}
      </AlertDescription>
    </Alert>
  )
}

