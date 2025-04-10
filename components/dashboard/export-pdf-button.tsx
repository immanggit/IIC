"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface ExportPDFButtonProps {
  userData: any
  progressData: any
  courseData: any
}

export default function ExportPDFButton({ userData, progressData, courseData }: ExportPDFButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const handleExport = async () => {
    setIsExporting(true)

    try {
      // Create a new PDF document
      const doc = new jsPDF()

      // Add title
      doc.setFontSize(20)
      doc.text("Learning Progress Report", 105, 15, { align: "center" })

      // Add date
      doc.setFontSize(10)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 22, { align: "center" })

      // Add user info
      doc.setFontSize(14)
      doc.text("Student Information", 14, 35)

      doc.setFontSize(12)
      doc.text(`Name: ${userData.full_name || "Not provided"}`, 14, 45)
      doc.text(`Email: ${userData.email || "Not provided"}`, 14, 52)
      doc.text(`Learning Streak: ${userData.learning_streak || 0} days`, 14, 59)

      // Add progress summary
      doc.setFontSize(14)
      doc.text("Progress Summary", 14, 75)

      doc.setFontSize(12)
      const completedActivities = progressData.filter((p: any) => p.completed).length
      doc.text(`Activities Completed: ${completedActivities}`, 14, 85)
      doc.text(`Courses Enrolled: ${courseData.length}`, 14, 92)

      const completedCourses = courseData.filter((c: any) => c.progress === 100).length
      doc.text(`Courses Completed: ${completedCourses}`, 14, 99)

      // Add course progress table
      doc.setFontSize(14)
      doc.text("Course Progress", 14, 115)

      // Create course table data
      const courseTableData = courseData.map((course: any) => [
        course.courses?.title || course.title || "Unknown Course",
        `${course.progress || 0}%`,
        course.progress === 100 ? "Completed" : "In Progress",
      ])

      // Add course table
      autoTable(doc, {
        startY: 120,
        head: [["Course Name", "Progress", "Status"]],
        body: courseTableData,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185] },
      })

      // Add recent activities table
      const recentActivities = [...progressData]
        .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 5)

      if (recentActivities.length > 0) {
        doc.setFontSize(14)
        const finalY = (doc as any).lastAutoTable.finalY || 120
        doc.text("Recent Activities", 14, finalY + 15)

        // Create activities table data
        const activityTableData = recentActivities.map((progress: any) => [
          progress.activities?.title || "Unknown Activity",
          progress.completed ? "Completed" : "In Progress",
          progress.score !== null ? `${progress.score}/5` : "N/A",
          new Date(progress.updated_at).toLocaleDateString(),
        ])

        // Add activities table
        autoTable(doc, {
          startY: finalY + 20,
          head: [["Activity", "Status", "Score", "Date"]],
          body: activityTableData,
          theme: "grid",
          headStyles: { fillColor: [41, 128, 185] },
        })
      }

      // Add footer
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(10)
        doc.text("English Learning Platform - Progress Report", 105, doc.internal.pageSize.height - 10, {
          align: "center",
        })
      }

      // Save the PDF
      doc.save("learning-progress-report.pdf")

      toast({
        title: "PDF Exported Successfully",
        description: "Your progress report has been downloaded.",
      })
    } catch (error) {
      console.error("Error exporting PDF:", error)
      toast({
        title: "Export Failed",
        description: "There was an error exporting your progress report.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button onClick={handleExport} disabled={isExporting} variant="outline" size="sm">
      {isExporting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Export PDF Report
        </>
      )}
    </Button>
  )
}

