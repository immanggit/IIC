"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

export default function ExportReportButton() {
  const [isExporting, setIsExporting] = useState(false)

  const exportToPDF = async () => {
    setIsExporting(true)
    try {
      const contentElement = document.querySelector(".container") as HTMLElement
      if (!contentElement) {
        throw new Error("Content element not found")
      }

      // Create a clone of the element to avoid modifying the original
      const clone = contentElement.cloneNode(true) as HTMLElement

      // Remove the export button from the clone
      const exportButton = clone.querySelector("button:has(.lucide-download)")
      if (exportButton) {
        exportButton.remove()
      }

      // Set styles for PDF generation
      clone.style.width = "800px"
      clone.style.padding = "20px"
      clone.style.backgroundColor = "white"
      document.body.appendChild(clone)

      // Create canvas from the element
      const canvas = await html2canvas(clone, {
        scale: 1,
        useCORS: true,
        logging: false,
      })

      // Remove the clone from the DOM
      document.body.removeChild(clone)

      // Create PDF
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      })

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height)
      pdf.save("learning-progress-report.pdf")
    } catch (error) {
      console.error("Error exporting to PDF:", error)
      alert("Failed to export report. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button variant="outline" onClick={exportToPDF} disabled={isExporting}>
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </>
      )}
    </Button>
  )
}

