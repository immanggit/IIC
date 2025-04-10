import type React from "react"
import { Montserrat } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { createClient } from "@/utils/supabase/server"
import Script from "next/script"

import "./globals.css"

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
})

export const metadata = {
  title: "KidsEnglish - Fun Learning Platform",
  description: "Interactive English learning platform for children",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let session = null

  try {
    const supabase = createClient()
    const { data } = await supabase.auth.getSession()
    session = data.session
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error)
    // Continue rendering without session
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer />
        <Script id="onesignal-init">
          {`
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            OneSignalDeferred.push(async function(OneSignal) {
              await OneSignal.init({
                appId: "bf82e8f1-21f7-4ee7-bfbf-fb5e14a710a4",
                safari_web_id: "web.onesignal.auto.65a2ca34-f112-4f9d-a5c6-253c0b61cb9f",
                notifyButton: {
                  enable: true,
                },
              });
            });
          `}
        </Script>
      </head>
      <body className={`${montserrat.variable} font-sans overflow-x-hidden`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'