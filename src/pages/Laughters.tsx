"use client";

import { RestaurantLayout } from "../components/RestaurantLayout";

export default function Laughters() {
  const restaurantInfo = {
    name: "The Laughters Kitchen",
    image: "/laughheader.png",
    deliveryFee: 500,
    avgWait: "25 mins",
    rating: 4.7,
    reviews: 210
  };

  return <RestaurantLayout {...restaurantInfo} />;
}