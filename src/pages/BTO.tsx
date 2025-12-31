"use client";

import { RestaurantLayout } from "../components/RestaurantLayout";

export default function BTO() {
  const restaurantInfo = {
    name: "BTO",
    image: "/btoheader.png",
    deliveryFee: 500,
    avgWait: "35 mins",
    rating: 4.2,
    reviews: 95
  };

  return <RestaurantLayout {...restaurantInfo} />;
}
