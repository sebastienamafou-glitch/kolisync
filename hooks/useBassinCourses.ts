"use client";

import { useState } from "react";

export function useBassinCourses(initialOrders: any[], preferredZone: string | null) {
  const [showOnlyMyZone, setShowOnlyMyZone] = useState(true);

  const filteredOrders = showOnlyMyZone && preferredZone
    ? initialOrders.filter(order => order.commune === preferredZone)
    : initialOrders;

  return {
    filteredOrders,
    showOnlyMyZone,
    setShowOnlyMyZone,
    hasZonePreference: !!preferredZone
  };
}
