"use client";

import { RestaurantLayout } from "../components/RestaurantLayout";

export default function Dunnkayce() {
  const restaurantInfo = {
    name: "Dunnkayce",
    image: "/dunkhead.png",
    deliveryFee: 500,
    avgWait: "30 mins",
    rating: 4.5,
    reviews: 128
  };

  return <RestaurantLayout {...restaurantInfo} />;
}
