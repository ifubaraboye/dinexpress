"use client";

import { RestaurantLayout } from "../components/RestaurantLayout";

export default function Grills() {
  const restaurantInfo = {
    id: "14f26bab-610d-4ad8-baf4-5f1aafd97d9c",
    name: "Grills",
    image: "/grillsheader.png",
    deliveryFee: 500,
    avgWait: "40 mins",
    rating: 4.8,
    reviews: 156
  };

  return <RestaurantLayout {...restaurantInfo} />;
}
