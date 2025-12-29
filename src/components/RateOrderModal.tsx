"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import RateOrderModal from "./RateOrderModal"

/* =========================
   Local Types (NO API)
   ========================= */

interface LocalOrder {
  id: string | number
  total: number
  created_at: string
  recipient_name: string
  account_number?: string | null
  runner_id?: string | number | null
  order_items?: Array<{
    id: number
    quantity: number
    menu_item_id?: number
    menu_items?: {
      id?: number
    }
  }>
}

/* =========================
   Order Success Modal
   ========================= */

export default function OrderSuccessModal({
  isOpen,
  onClose,
  order,
  onOpenComplaintModal,
}: {
  isOpen: boolean
  onClose: () => void
  order: LocalOrder | null
  onOpenComplaintModal: () => void
}) {
  if (!order) return null

  const [showRatingModal, setShowRatingModal] = useState(false)
  const [hasRated, setHasRated] = useState(false)
  const [checkingRating, setCheckingRating] = useState(true)

  /* =========================
     Check rating status
     ========================= */

  useEffect(() => {
    const checkIfRated = async () => {
      if (!order?.id) {
        setCheckingRating(false)
        return
      }

      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null

      if (!token) {
        setCheckingRating(false)
        return
      }

      try {
        const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000"


        if (order.order_items && order.order_items.length > 0) {
          const firstOrderItem = order.order_items[0]
          const menuItemId = firstOrderItem.menu_item_id

          if (!menuItemId) return

          const res = await fetch(`${API_BASE_URL}/ratings`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              menu_item_id: menuItemId,
              rating: 5,
              comment: "test",
            }),
          })

          if (res.status === 409) {
            setHasRated(true)
          } else if (res.ok) {
            setHasRated(false)
          }
        }
      } catch (err) {
        console.error("Error checking rating status:", err)
      } finally {
        setCheckingRating(false)
      }
    }

    if (isOpen) checkIfRated()
  }, [order, isOpen])

  /* =========================
     Helpers
     ========================= */

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return (
      date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }) +
      " | " +
      date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: false,
      })
    )
  }

  const handleRatingComplete = () => {
    setShowRatingModal(false)
    setHasRated(true)
    onClose()
  }

  /* =========================
     Render
     ========================= */

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-sm w-full rounded-2xl shadow-md">
          <DialogHeader>
            <DialogTitle className="sr-only">
              Order Delivered
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <img
                src="/mnt/data/15694026-d827-4479-bf66-970251e58cc6.png"
                alt="Preview"
                width={120}
                height={240}
                className="rounded-md object-cover"
              />
            </div>

            <div className="text-lg font-semibold mb-1">Thank you!</div>
            <p className="text-sm text-gray-600 mb-4">
              Your order has been delivered successfully.
            </p>

            <hr className="border-dashed border-gray-300 my-4" />

            <div className="flex flex-col gap-y-4 text-sm text-gray-700 mb-3">
              <div>
                <p className="font-medium">TICKET ID</p>
                <p>{order.id}</p>
              </div>

              <div>
                <p className="font-medium">Amount</p>
                <p className="font-semibold">
                  ₦{order.total.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="text-sm text-gray-700 mb-5">
              <p className="font-medium">DATE & TIME</p>
              <p>{formatDateTime(order.created_at)}</p>
            </div>

            <div className="bg-gray-100 rounded-xl p-3 flex items-center gap-3 mb-5">
              <img
                src="/mastercard.png"
                alt="Mastercard"
                width={36}
                height={36}
              />
              <div className="text-left">
                <p className="font-medium text-gray-800">
                  {order.recipient_name}
                </p>
                {order.account_number && (
                  <p className="text-sm text-gray-600">
                    ****{order.account_number.slice(-4)}
                  </p>
                )}
              </div>
            </div>

            <hr className="border-dashed border-gray-300 my-4" />

            <p className="text-sm text-gray-600 mb-4">
              Problem with your order?{" "}
              <button
                onClick={onOpenComplaintModal}
                className="text-red-600 font-medium"
              >
                Report Issue
              </button>
            </p>

            <div className="flex flex-col gap-3">
              {checkingRating ? (
                <Button
                  className="bg-gray-400 text-white w-full"
                  disabled
                >
                  Checking...
                </Button>
              ) : hasRated ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm font-medium text-green-700">
                    You've already rated this order
                  </span>
                </div>
              ) : (
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white w-full"
                  onClick={() => setShowRatingModal(true)}
                >
                  Rate Order
                </Button>
              )}

              <Link to="/">
                <Button
                  variant="outline"
                  className="border-red-600 text-red-600 hover:bg-red-50 w-full"
                  onClick={onClose}
                >
                  Home Page
                </Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rating Modal */}
      {/* <RateOrderModal
        isOpen={showRatingModal}
        onClose={handleRatingComplete}
        order={order}
      /> */}
    </>
  )
}
