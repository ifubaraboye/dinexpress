import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Link } from "react-router-dom"
import RateOrderModal from "./RateOrderModal"

/* ----------------------------------------
   Local Order type (NO API dependency)
---------------------------------------- */
interface LocalOrder {
  id: string | number
  total: number
  created_at: string
  recipient_name: string
  account_number?: string
  order_items?: Array<{
    id: number
    menu_item_id?: number
  }>
}

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
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [hasRated, setHasRated] = useState(false)
  const [checkingRating, setCheckingRating] = useState(true)

  if (!order) return null

  /* ----------------------------------------
     Check if order has been rated
  ---------------------------------------- */
  useEffect(() => {
    const checkIfRated = async () => {
      if (!order?.id) {
        setCheckingRating(false)
        return
      }

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null

      if (!token) {
        setCheckingRating(false)
        return
      }

      try {
        const API_BASE_URL =
          import.meta.env.VITE_API_URL || "http://localhost:5000"

        if (order.order_items?.length) {
          const menuItemId = order.order_items[0]?.menu_item_id

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
          }
        }
      } catch (err) {
        console.error("Error checking rating:", err)
      } finally {
        setCheckingRating(false)
      }
    }

    if (isOpen) checkIfRated()
  }, [order, isOpen])

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
                className="w-[120px] rounded-md object-cover"
              />
            </div>

            <div className="text-lg font-semibold mb-1">Thank you!</div>
            <p className="text-sm text-gray-600 mb-4">
              Your order has been delivered successfully.
            </p>

            <hr className="border-dashed my-4" />

            <div className="space-y-4 text-sm">
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

              <div>
                <p className="font-medium">DATE & TIME</p>
                <p>{formatDateTime(order.created_at)}</p>
              </div>
            </div>

            <hr className="border-dashed my-4" />

            <p className="text-sm mb-4">
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
                <Button disabled>Checking…</Button>
              ) : hasRated ? (
                <div className="bg-green-50 border rounded-xl p-3 text-sm">
                  You’ve already rated this order
                </div>
              ) : (
                <Button
                  className="bg-red-600 text-white"
                  onClick={() => setShowRatingModal(true)}
                >
                  Rate Order
                </Button>
              )}

              <Link to="/">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={onClose}
                >
                  Home Page
                </Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* <RateOrderModal
        isOpen={showRatingModal}
        onClose={handleRatingComplete}
        order={order}
        onOpenComplaintModal={() => {}}
      /> */}
    </>
  )
}
