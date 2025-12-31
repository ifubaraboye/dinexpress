"use client";

import { RestaurantLayout } from "../components/RestaurantLayout";

export default function Grills() {
  const restaurantInfo = {
    name: "Grills",
    image: "/grillsheader.png",
    deliveryFee: 500,
    avgWait: "40 mins",
    rating: 4.8,
    reviews: 156
  };

  return <RestaurantLayout {...restaurantInfo} />;
}
