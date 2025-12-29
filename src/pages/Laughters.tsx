"use client";

import { RestaurantLayout } from "../components/RestaurantLayout";

export default function Laughters() {
  const restaurantInfo = {
    id: "cfdff904-fcf5-4902-a0e5-96c7cf850dde",
    name: "The Laughters Kitchen",
    image: "/laughheader.png",
    deliveryFee: 500,
    avgWait: "25 mins",
    rating: 4.7,
    reviews: 210
  };

  return <RestaurantLayout {...restaurantInfo} />;
}