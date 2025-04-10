import { NextResponse } from "next/server"
import OpenAI from "openai"

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { prompt, style, aspectRatio } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Determine the size based on aspect ratio
    let size = "1024x1024" // Default square
    if (aspectRatio === "portrait") {
      size = "1024x1792"
    } else if (aspectRatio === "landscape") {
      size = "1792x1024"
    } else if (aspectRatio === "wide") {
      size = "1792x1024" // Closest to 16:9 that DALL-E supports
    }

    // Generate the image
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: size as "1024x1024" | "1024x1792" | "1792x1024",
      style: style as "vivid" | "natural",
      quality: "standard",
    })

    // Return the image URL
    return NextResponse.json({ url: response.data[0].url })
  } catch (error: any) {
    console.error("Error generating image:", error)
    return NextResponse.json({ error: error.message || "Failed to generate image" }, { status: 500 })
  }
}

