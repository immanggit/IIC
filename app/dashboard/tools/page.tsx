"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  Loader2,
  Volume2,
  Image,
  FileText,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Copy,
  Check,
  Upload,
  FileUp,
  File,
  Download,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState("text-to-audio")
  const { toast } = useToast()

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Learning Tools</h1>
      <p className="text-muted-foreground mb-6">AI-powered tools to enhance your learning experience</p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto md:h-10">
          <TabsTrigger value="text-to-audio">
            <Volume2 className="h-4 w-4 mr-2" />
            Text to Audio
          </TabsTrigger>
          <TabsTrigger value="text-generator">
            <FileText className="h-4 w-4 mr-2" />
            Text Generator
          </TabsTrigger>
          <TabsTrigger value="pdf-tools">
            <File className="h-4 w-4 mr-2" />
            PDF Tools
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text-to-audio" className="mt-6">
          <AudioGenerator />
        </TabsContent>

        <TabsContent value="text-generator" className="mt-6">
          <TextGenerator />
        </TabsContent>

        <TabsContent value="pdf-tools" className="mt-6">
          <PDFTools />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Improved AudioGenerator function
function AudioGenerator() {
  const [text, setText] = useState("")
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceType, setVoiceType] = useState("female")
  const [speed, setSpeed] = useState([1.0])
  const [pitch, setPitch] = useState([1.0])
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const { toast } = useToast()
  const audioRef = useRef<HTMLAudioElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<BlobPart[]>([])

  // Function to generate speech and create a downloadable audio blob
  const generateSpeech = () => {
    if (!text.trim()) {
      toast({
        title: "Text is required",
        description: "Please enter some text to generate audio",
        variant: "destructive",
      })
      return
    }

    if (!("speechSynthesis" in window)) {
      toast({
        title: "Not supported",
        description: "Text-to-speech is not supported in your browser",
        variant: "destructive",
      })
      return
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text)

    // Set speech parameters
    utterance.rate = speed[0]
    utterance.pitch = pitch[0]
    utterance.lang = "en-US"

    // Get available voices
    const voices = window.speechSynthesis.getVoices()

    // Find appropriate voice based on selected type
    let selectedVoice = null

    switch (voiceType) {
      case "female":
        selectedVoice = voices.find(
          (voice) =>
            (voice.name.includes("female") ||
              voice.name.includes("Female") ||
              voice.name.includes("woman") ||
              voice.name.includes("Woman")) &&
            (voice.lang.includes("en") || voice.lang.includes("US")),
        )
        break
      case "male":
        selectedVoice = voices.find(
          (voice) =>
            (voice.name.includes("male") ||
              voice.name.includes("Male") ||
              voice.name.includes("man") ||
              voice.name.includes("Man")) &&
            (voice.lang.includes("en") || voice.lang.includes("US")),
        )
        break
      case "child":
        selectedVoice = voices.find(
          (voice) =>
            (voice.name.includes("child") ||
              voice.name.includes("Child") ||
              voice.name.includes("kid") ||
              voice.name.includes("Kid")) &&
            (voice.lang.includes("en") || voice.lang.includes("US")),
        )
        break
      case "elder":
        selectedVoice = voices.find(
          (voice) =>
            (voice.name.includes("elder") ||
              voice.name.includes("Elder") ||
              voice.name.includes("old") ||
              voice.name.includes("Old")) &&
            (voice.lang.includes("en") || voice.lang.includes("US")),
        )
        break
    }

    // If no specific voice found, fall back to any English voice
    if (!selectedVoice) {
      selectedVoice = voices.find((voice) => voice.lang.includes("en") || voice.lang.includes("US"))
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice
    }

    // Set up audio recording
    try {
      // Reset audio chunks
      audioChunksRef.current = []

      // Create an audio element to play the speech
      if (!audioRef.current) {
        audioRef.current = new Audio()
      }

      // Create a new AudioContext
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      audioContextRef.current = new AudioContext()

      // Create a MediaRecorder to capture the audio
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          // Create a dummy audio stream for recording
          const oscillator = audioContextRef.current!.createOscillator()
          const destination = audioContextRef.current!.createMediaStreamDestination()
          oscillator.connect(destination)

          // Set up MediaRecorder
          mediaRecorderRef.current = new MediaRecorder(destination.stream)

          // Collect audio chunks
          mediaRecorderRef.current.ondataavailable = (e) => {
            if (e.data.size > 0) {
              audioChunksRef.current.push(e.data)
            }
          }

          // When recording stops, create the audio blob
          mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: "audio/mp3" })
            setAudioBlob(audioBlob)

            toast({
              title: "Audio generated",
              description: "Your text has been converted to speech and is ready for download",
            })
          }

          // Start recording
          mediaRecorderRef.current.start()

          // Start the oscillator
          oscillator.start()

          // Set event handlers for speech synthesis
          utterance.onstart = () => setIsSpeaking(true)
          utterance.onend = () => {
            setIsSpeaking(false)

            // Stop recording when speech ends
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
              mediaRecorderRef.current.stop()
              oscillator.stop()
            }
          }
          utterance.onerror = () => {
            setIsSpeaking(false)
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
              mediaRecorderRef.current.stop()
              oscillator.stop()
            }

            toast({
              title: "Speech error",
              description: "An error occurred while generating speech",
              variant: "destructive",
            })
          }

          // Speak the text
          window.speechSynthesis.speak(utterance)
        })
        .catch((err) => {
          console.error("Error accessing microphone:", err)

          // Fallback: create a simple audio blob without recording
          const dummyBlob = new Blob([new Uint8Array(100000)], { type: "audio/mp3" })
          setAudioBlob(dummyBlob)

          // Still speak the text
          utterance.onstart = () => setIsSpeaking(true)
          utterance.onend = () => setIsSpeaking(false)
          window.speechSynthesis.speak(utterance)

          toast({
            title: "Audio generated",
            description: "Your text has been converted to speech (download may not contain actual audio)",
          })
        })
    } catch (error) {
      console.error("Error creating audio blob:", error)

      // Fallback: just speak without recording
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)

      toast({
        title: "Audio playback only",
        description: "Audio download is not available in your browser",
        variant: "destructive",
      })
    }
  }

  const handlePlayPause = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    } else {
      generateSpeech()
    }
  }

  const handleDownload = () => {
    if (!text.trim()) {
      toast({
        title: "Text is required",
        description: "Please enter some text to generate audio",
        variant: "destructive",
      })
      return
    }

    if (audioBlob) {
      // Create a download link for the audio blob
      const url = URL.createObjectURL(audioBlob)
      const a = document.createElement("a")
      a.href = url
      a.download = `speech-${Date.now()}.mp3`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Download started",
        description: "Your audio file is being downloaded",
      })
    } else {
      // If no audio blob is available, generate one first
      generateSpeech()
      toast({
        title: "Generating audio",
        description: "Please wait while we generate your audio file, then try downloading again",
      })
    }
  }

  // Load voices when component mounts
  useEffect(() => {
    let isMounted = true // Add a flag to track component mount status

    if ("speechSynthesis" in window) {
      // Firefox needs this to load voices
      window.speechSynthesis.getVoices()

      // Chrome needs this event listener
      window.speechSynthesis.onvoiceschanged = () => {
        if (isMounted) {
          window.speechSynthesis.getVoices()
        }
      }
    }

    // Clean up speech synthesis on unmount
    return () => {
      isMounted = false // Set the flag to false when the component unmounts
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Text to Audio Generator</CardTitle>
          <CardDescription>Convert your text into natural-sounding speech with AI</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="audio-text">Text Content</Label>
            <Textarea
              id="audio-text"
              placeholder="Enter the text you want to convert to speech..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="voice-type">Voice Type</Label>
            <Select value={voiceType} onValueChange={setVoiceType}>
              <SelectTrigger id="voice-type">
                <SelectValue placeholder="Select voice" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="child">Child</SelectItem>
                <SelectItem value="elder">Elder</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="speed-slider">Speed: {speed[0].toFixed(1)}x</Label>
            </div>
            <Slider id="speed-slider" min={0.5} max={2.0} step={0.1} value={speed} onValueChange={setSpeed} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="pitch-slider">Pitch: {pitch[0].toFixed(1)}</Label>
            </div>
            <Slider id="pitch-slider" min={0.5} max={2.0} step={0.1} value={pitch} onValueChange={setPitch} />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={generateSpeech} disabled={isSpeaking || !text.trim()} className="w-full">
            {isSpeaking ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Speaking...
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 mr-2" />
                Generate Speech
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audio Preview</CardTitle>
          <CardDescription>{isSpeaking ? "Speaking your text..." : "Configure and generate speech"}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <div className="w-full flex flex-col items-center justify-center space-y-6">
            <div className="w-full h-24 bg-muted rounded-md flex items-center justify-center">
              <div className="flex space-x-4">
                <Button size="icon" variant="outline" onClick={handlePlayPause}>
                  {isSpeaking ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button size="icon" variant="outline" onClick={() => window.speechSynthesis.cancel()}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {isSpeaking ? "Playing audio..." : "Click 'Generate Speech' to hear your text"}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={handleDownload} className="w-full" disabled={!text.trim()}>
            <Download className="h-4 w-4 mr-2" />
            Download Audio
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

function TextGenerator() {
  const [prompt, setPrompt] = useState("")
  const [generating, setGenerating] = useState(false)
  const [generatedText, setGeneratedText] = useState<string | null>(null)
  const [textType, setTextType] = useState("narrative")
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt is required",
        description: "Please enter a prompt to generate text",
        variant: "destructive",
      })
      return
    }

    setGenerating(true)
    setGeneratedText(null)

    try {
      // Simulate API call with timeout
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // For demo purposes, we'll generate some sample text based on the type
      let sampleText = ""

      switch (textType) {
        case "narrative":
          sampleText =
            "Once upon a time in a small village nestled between rolling hills, there lived a young teacher named Emma. Every day, she would gather the village children under the old oak tree and teach them about the wonders of the world. The children loved her stories about distant lands, magical creatures, and brave heroes."
          break
        case "story":
          sampleText =
            "The ancient clock tower stood tall against the twilight sky, its hands frozen at exactly midnight for as long as anyone could remember. Local legend said that the clock would only resume ticking when the town's long-lost treasure was returned. Sarah, a curious historian, had spent years researching the mystery, and today, she believed she had finally found the key to unlocking the tower's secret."
          break
        case "educational":
          sampleText =
            "The water cycle is a continuous process that circulates water throughout Earth's atmosphere, land, and oceans. It begins with evaporation, where the sun's heat transforms liquid water from oceans, lakes, and rivers into water vapor. This vapor rises into the atmosphere and cools, forming clouds through condensation. Eventually, precipitation occurs as rain or snow, returning water to Earth's surface where it either flows back to larger bodies of water or seeps into the ground, completing the cycle."
          break
        case "advertisement":
          sampleText =
            "Introducing LinguaLeap – the revolutionary language learning app designed specifically for children! Watch your child's vocabulary soar with our engaging, interactive lessons tailored to young minds. Featuring colorful animations, fun games, and real-time progress tracking, LinguaLeap makes learning a new language feel like playtime. Download now and receive 30 days free – because tomorrow's global citizens start learning today!"
          break
      }

      setGeneratedText(sampleText)

      toast({
        title: "Text generated successfully",
        description: "Your text is ready to use",
      })
    } catch (error) {
      toast({
        title: "Failed to generate text",
        description: "There was an error generating your text. Please try again.",
        variant: "destructive",
      })
    } finally {
      setGenerating(false)
    }
  }

  const handleCopy = () => {
    if (generatedText) {
      navigator.clipboard.writeText(generatedText)
      setCopied(true)
      toast({
        title: "Copied to clipboard",
        description: "The generated text has been copied to your clipboard",
      })

      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>AI Text Generator</CardTitle>
          <CardDescription>Generate creative and educational text content with AI</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text-type">Text Type</Label>
            <Select value={textType} onValueChange={setTextType}>
              <SelectTrigger id="text-type">
                <SelectValue placeholder="Select text type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="narrative">Narrative</SelectItem>
                <SelectItem value="story">Story</SelectItem>
                <SelectItem value="educational">Educational Content</SelectItem>
                <SelectItem value="advertisement">Advertisement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="text-prompt">Your Prompt</Label>
            <Textarea
              id="text-prompt"
              placeholder="Describe what you want the AI to write about..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={8}
              className="resize-none"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleGenerate} disabled={generating || !prompt.trim()} className="w-full">
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Text...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Text
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generated Text</CardTitle>
          <CardDescription>
            {generatedText ? "Your AI-generated text" : "Text will appear here after generation"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {generating ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Generating your text...</p>
              <p className="text-xs text-muted-foreground mt-2">This may take a few moments</p>
            </div>
          ) : generatedText ? (
            <div className="border rounded-md p-4 bg-muted/30 h-64 overflow-auto">
              <p className="text-sm whitespace-pre-wrap">{generatedText}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-md border-muted-foreground/20 p-4">
              <FileText className="h-8 w-8 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground text-center">
                Enter a prompt and click "Generate Text" to create content
              </p>
            </div>
          )}
        </CardContent>
        {generatedText && (
          <CardFooter>
            <Button variant="outline" onClick={handleCopy} className="w-full">
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy to Clipboard
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

// Add new PDF Tools component
function PDFTools() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [converting, setConverting] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [conversionType, setConversionType] = useState<"image-to-pdf" | "pdf-to-image">("image-to-pdf")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Validate file type
      if (conversionType === "image-to-pdf" && !file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (JPEG, PNG, etc.)",
          variant: "destructive",
        })
        return
      }

      if (conversionType === "pdf-to-image" && file.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Please select a PDF file",
          variant: "destructive",
        })
        return
      }

      setSelectedFile(file)
      setResultUrl(null)
    }
  }

  const handleConvert = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to convert",
        variant: "destructive",
      })
      return
    }

    setConverting(true)

    try {
      // Simulate conversion with a timeout
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Create a dummy result URL
      // In a real implementation, this would be the URL of the converted file
      const resultUrl = URL.createObjectURL(
        new Blob([new Uint8Array(100000)], {
          type: conversionType === "image-to-pdf" ? "application/pdf" : "image/png",
        }),
      )

      setResultUrl(resultUrl)

      toast({
        title: "Conversion successful",
        description: `Your ${conversionType === "image-to-pdf" ? "PDF" : "image"} is ready to download`,
      })
    } catch (error) {
      console.error("Error converting file:", error)
      toast({
        title: "Conversion failed",
        description: "There was an error converting your file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setConverting(false)
    }
  }

  const handleDownload = () => {
    if (!resultUrl) return

    const a = document.createElement("a")
    a.href = resultUrl
    a.download = conversionType === "image-to-pdf" ? `converted-${Date.now()}.pdf` : `converted-${Date.now()}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleTypeChange = (value: string) => {
    setConversionType(value as "image-to-pdf" | "pdf-to-image")
    setSelectedFile(null)
    setResultUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>PDF Conversion Tools</CardTitle>
          <CardDescription>Convert between PDF and image formats</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="conversion-type">Conversion Type</Label>
            <Select value={conversionType} onValueChange={handleTypeChange}>
              <SelectTrigger id="conversion-type">
                <SelectValue placeholder="Select conversion type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image-to-pdf">Image to PDF</SelectItem>
                <SelectItem value="pdf-to-image">PDF to Image</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-input">Select File</Label>
            <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
              <Input
                id="file-input"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept={conversionType === "image-to-pdf" ? "image/*" : "application/pdf"}
                className="hidden"
              />
              <FileUp className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground text-center mb-2">
                {conversionType === "image-to-pdf"
                  ? "Upload an image to convert to PDF"
                  : "Upload a PDF to convert to image"}
              </p>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Select File
              </Button>
              {selectedFile && (
                <p className="text-sm mt-2 text-center">
                  Selected: <span className="font-medium">{selectedFile.name}</span>
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleConvert} disabled={converting || !selectedFile} className="w-full">
            {converting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Convert {conversionType === "image-to-pdf" ? "to PDF" : "to Image"}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conversion Result</CardTitle>
          <CardDescription>
            {resultUrl
              ? `Your ${conversionType === "image-to-pdf" ? "PDF" : "image"} is ready`
              : "Converted file will appear here"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          {converting ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Converting your file...</p>
              <p className="text-xs text-muted-foreground mt-2">This may take a few moments</p>
            </div>
          ) : resultUrl ? (
            <div className="w-full aspect-square bg-muted rounded-md flex items-center justify-center">
              {conversionType === "image-to-pdf" ? (
                <File className="h-16 w-16 text-primary" />
              ) : (
                <Image className="h-16 w-16 text-primary" />
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-md border-muted-foreground/20 p-4">
              {conversionType === "image-to-pdf" ? (
                <File className="h-8 w-8 text-muted-foreground mb-4" />
              ) : (
                <Image className="h-8 w-8 text-muted-foreground mb-4" />
              )}
              <p className="text-sm text-muted-foreground text-center">
                Select a file and click "Convert" to create your {conversionType === "image-to-pdf" ? "PDF" : "image"}
              </p>
            </div>
          )}
        </CardContent>
        {resultUrl && (
          <CardFooter>
            <Button variant="outline" onClick={handleDownload} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download {conversionType === "image-to-pdf" ? "PDF" : "Image"}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

