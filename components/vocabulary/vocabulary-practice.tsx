"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Volume2, CheckCircle, XCircle, Loader2 } from "lucide-react"

interface VocabularyPracticeProps {
  word: any
  relatedWords: any[]
}

export default function VocabularyPractice({ word, relatedWords }: VocabularyPracticeProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Generate practice questions
  const questions = [
    {
      type: "definition",
      question: "What is the definition of '" + word.word + "'?",
      options: generateDefinitionOptions(word, relatedWords),
      correctAnswer: word.definition,
    },
    {
      type: "word",
      question: "Which word matches this definition: '" + word.definition + "'?",
      options: generateWordOptions(word, relatedWords),
      correctAnswer: word.word,
    },
    {
      type: "example",
      question: "Choose the correct example sentence for the word '" + word.word + "':",
      options: generateExampleOptions(word, relatedWords),
      correctAnswer: word.example,
    },
  ]

  function generateDefinitionOptions(mainWord: any, otherWords: any[]) {
    const options = [mainWord.definition]
    const availableWords = [...otherWords].filter((w) => w.id !== mainWord.id)

    while (options.length < 4 && availableWords.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableWords.length)
      const randomWord = availableWords.splice(randomIndex, 1)[0]
      options.push(randomWord.definition)
    }

    return shuffleArray(options)
  }

  function generateWordOptions(mainWord: any, otherWords: any[]) {
    const options = [mainWord.word]
    const availableWords = [...otherWords].filter((w) => w.id !== mainWord.id)

    while (options.length < 4 && availableWords.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableWords.length)
      const randomWord = availableWords.splice(randomIndex, 1)[0]
      options.push(randomWord.word)
    }

    return shuffleArray(options)
  }

  function generateExampleOptions(mainWord: any, otherWords: any[]) {
    const options = [mainWord.example]
    const availableWords = [...otherWords].filter((w) => w.id !== mainWord.id)

    while (options.length < 4 && availableWords.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableWords.length)
      const randomWord = availableWords.splice(randomIndex, 1)[0]
      options.push(randomWord.example)
    }

    return shuffleArray(options)
  }

  function shuffleArray(array: any[]) {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion]: answer,
    })
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      calculateScore()
      setShowResult(true)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const calculateScore = () => {
    let correctAnswers = 0
    for (let i = 0; i < questions.length; i++) {
      if (selectedAnswers[i] === questions[i].correctAnswer) {
        correctAnswers++
      }
    }
    setScore(correctAnswers)
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswers({})
    setShowResult(false)
    setScore(0)
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

  if (showResult) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-2xl font-bold mb-4">Practice Results</h3>
            <div className="text-5xl font-bold mb-4">
              {score} / {questions.length}
            </div>
            <p className="text-lg mb-6">
              {score === questions.length
                ? "Perfect! You've mastered this word!"
                : score >= questions.length / 2
                  ? "Good job! Keep practicing!"
                  : "Keep practicing to improve your score!"}
            </p>
            <div className="space-y-4 mb-6">
              {questions.map((q, index) => (
                <div key={index} className="flex items-start space-x-2 text-left">
                  {selectedAnswers[index] === q.correctAnswer ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">{q.question}</p>
                    <p className="text-sm">
                      Your answer:{" "}
                      <span
                        className={
                          selectedAnswers[index] === q.correctAnswer
                            ? "text-green-500 font-medium"
                            : "text-red-500 font-medium"
                        }
                      >
                        {selectedAnswers[index]}
                      </span>
                    </p>
                    {selectedAnswers[index] !== q.correctAnswer && (
                      <p className="text-sm">
                        Correct answer: <span className="text-green-500 font-medium">{q.correctAnswer}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={resetQuiz}>Practice Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          Question {currentQuestion + 1} of {questions.length}
        </h3>
        <Button variant="outline" size="sm" onClick={speakWord} disabled={isSpeaking}>
          {isSpeaking ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Volume2 className="h-4 w-4 mr-2" />}
          Pronounce
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <h4 className="text-xl font-semibold mb-4">{questions[currentQuestion].question}</h4>
          <RadioGroup value={selectedAnswers[currentQuestion]} onValueChange={handleAnswerSelect} className="space-y-3">
            {questions[currentQuestion].options.map((option, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 transition-colors"
              >
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
          Previous
        </Button>
        <Button onClick={handleNext} disabled={!selectedAnswers[currentQuestion]}>
          {currentQuestion === questions.length - 1 ? "Finish" : "Next"}
        </Button>
      </div>
    </div>
  )
}

