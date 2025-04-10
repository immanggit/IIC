import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1600')] bg-center bg-no-repeat bg-cover opacity-10"></div>

      <div className="container relative z-10">
        <div className="grid gap-12 md:grid-cols-2 items-center">
          <div className="space-y-6 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Learn English <span className="text-primary">the Fun Way</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Interactive lessons, games, and activities designed to make learning English enjoyable and effective for
              children.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button size="lg" asChild className="text-base">
                <Link href="/register">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base">
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-video rounded-xl overflow-hidden shadow-2xl">
              <img
                src="/placeholder.svg?height=400&width=600"
                alt="Children learning English"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  >
                    <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"></path>
                    <path d="M10 2c1 .5 2 2 2 5"></path>
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Fun Learning</p>
                  <p className="text-sm text-muted-foreground">Interactive & Engaging</p>
                </div>
              </div>
            </div>

            <div className="absolute -top-6 -right-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-green-600"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <path d="m9 11 3 3L22 4"></path>
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Track Progress</p>
                  <p className="text-sm text-muted-foreground">See Your Growth</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection

