import { BookOpen, Headphones, CheckSquare, Edit3, Youtube, BookMarked } from "lucide-react"

export default function FeaturesSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Learning Features</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our platform offers a variety of interactive activities to make learning English fun and engaging for
              children.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <BookOpen className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Reading Activities</h3>
            <p className="text-center text-muted-foreground">
              Engaging stories and passages with comprehension questions to improve reading skills.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Headphones className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Listening Exercises</h3>
            <p className="text-center text-muted-foreground">
              Audio-based activities to enhance listening comprehension and pronunciation.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <CheckSquare className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Multiple Choice</h3>
            <p className="text-center text-muted-foreground">
              Fun quizzes with multiple choice questions to test knowledge and understanding.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Edit3 className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Fill in the Blanks</h3>
            <p className="text-center text-muted-foreground">
              Interactive exercises to practice grammar and vocabulary by completing sentences.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Youtube className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Video Quizzes</h3>
            <p className="text-center text-muted-foreground">
              Learn from YouTube videos with integrated quizzes to test comprehension.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <BookMarked className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Vocabulary Builder</h3>
            <p className="text-center text-muted-foreground">
              Build vocabulary with flashcards, games, and interactive exercises.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

