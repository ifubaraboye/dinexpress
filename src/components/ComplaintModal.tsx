"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ComplaintModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: string
  customerEmail?: string  // Pass from auth/order if available
  customerName?: string   // Pass from auth/order if available
}

export default function ComplaintModal({
  isOpen,
  onClose,
  orderId,
  customerEmail = "",
  customerName = "",
}: ComplaintModalProps) {
  const [report, setReport] = useState("")
  const [email, setEmail] = useState(customerEmail)
  const [name, setName] = useState(customerName)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (report.trim().length < 10) {
      toast.error("Your report must be at least 10 characters.")
      return
    }

    if (!email || !email.includes("@")) {
      toast.error("Please provide a valid email address.")
      return
    }

    try {
      setLoading(true)

      const res = await fetch("/api/send-complaint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          report,
          customerEmail: email,
          customerName: name,
        }),
      })

      if (!res.ok) throw new Error("Email failed")

      toast.success("Issue report sent successfully! We'll respond within 24 hours.")
      setReport("")
      onClose()
    } catch (err) {
      console.error(err)
      toast.error("Failed to send report. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm w-full rounded-2xl shadow-md">
        <DialogHeader>
          <DialogTitle className="text-center">Report an Issue</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4 p-6">
          {/* Order ID */}
          <div>
            <label className="text-sm font-medium text-gray-700">Order ID</label>
            <input
              type="text"
              value={orderId}
              readOnly
              className="w-full mt-2 p-3 rounded-xl bg-gray-100 text-gray-700 outline-none"
            />
          </div>

          {/* Customer Name */}
          <div>
            <label className="text-sm font-medium text-gray-700">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full mt-2 p-3 rounded-xl bg-gray-100 text-gray-700 outline-none"
              required
            />
          </div>

          {/* Customer Email */}
          <div>
            <label className="text-sm font-medium text-gray-700">Your Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full mt-2 p-3 rounded-xl bg-gray-100 text-gray-700 outline-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              We'll use this to respond to your complaint.
            </p>
          </div>

          {/* Report Input */}
          <div>
            <label className="text-sm font-medium text-gray-700">Describe the issue</label>
            <textarea
              value={report}
              onChange={(e) => setReport(e.target.value)}
              placeholder="Tell us what went wrong..."
              className="w-full mt-2 p-3 rounded-xl bg-gray-100 text-gray-700 outline-none resize-none h-28"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum 10 characters required.
            </p>
          </div>

          {/* Info */}
          <div className="flex items-center text-xs text-red-600 gap-1">
            <AlertCircle size={14} />
            <span>We'll reach out within 24 hours.</span>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-3 text-sm font-medium"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </div>
            ) : (
              "Send Report"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}