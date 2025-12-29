"use client";

import { RestaurantLayout } from "../components/RestaurantLayout";

export default function Dunnkayce() {
  const restaurantInfo = {
    id: "401dcac5-889d-4d12-9b33-475c3864fb58",
    name: "Dunnkayce",
    image: "/dunkhead.png",
    deliveryFee: 500,
    avgWait: "30 mins",
    rating: 4.5,
    reviews: 128
  };

  return <RestaurantLayout {...restaurantInfo} />;
}
