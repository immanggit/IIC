"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface ExportEnrollmentsPDFProps {
  courseData: any
  enrollmentsData: any[]
}

export default function ExportEnrollmentsPDFButton({ courseData, enrollmentsData }: ExportEnrollmentsPDFProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const handleExport = async () => {
    setIsExporting(true)

    try {
      // Create a new PDF document
      const doc = new jsPDF()

      // Add title
      doc.setFontSize(20)
      doc.text("Course Enrollments Report", 105, 15, { align: "center" })

      // Add date
      doc.setFontSize(10)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 22, { align: "center" })

      // Add course info
      doc.setFontSize(14)
      doc.text("Course Information", 14, 35)

      doc.setFontSize(12)
      doc.text(`Title: ${courseData.title || "Not provided"}`, 14, 45)
      doc.text(`Level: ${courseData.level || "Not provided"}`, 14, 52)
      doc.text(`Status: ${courseData.status || "Not provided"}`, 14, 59)
      doc.text(`Total Enrollments: ${enrollmentsData.length || 0}`, 14, 66)

      // Add enrollments table
      doc.setFontSize(14)
      doc.text("Enrolled Students", 14, 80)

      // Create enrollments table data
      const enrollmentsTableData = enrollmentsData.map((enrollment) => [
        enrollment.profiles?.full_name || "Unknown",
        enrollment.profiles?.email || "Unknown",
        `${enrollment.progress || 0}%`,
        `${enrollment.score || 0}/5`,
        new Date(enrollment.created_at).toLocaleDateString(),
        new Date(enrollment.updated_at).toLocaleDateString(),
      ])

      // Add enrollments table
      autoTable(doc, {
        startY: 85,
        head: [["Student Name", "Email", "Progress", "Score", "Enrolled On", "Last Activity"]],
        body: enrollmentsTableData,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185] },
      })

      // Add footer
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(10)
        doc.text("English Learning Platform - Course Enrollments Report", 105, doc.internal.pageSize.height - 10, {
          align: "center",
        })
      }

      // Save the PDF
      doc.save(`course-enrollments-${courseData.title.replace(/\s+/g, "-").toLowerCase()}.pdf`)

      toast({
        title: "PDF Exported Successfully",
        description: "Your course enrollments report has been downloaded.",
      })
    } catch (error) {
      console.error("Error exporting PDF:", error)
      toast({
        title: "Export Failed",
        description: "There was an error exporting your course enrollments report.",
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

