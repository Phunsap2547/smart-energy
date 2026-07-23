"use client";

import { MapPin } from "lucide-react";
import theme from "@/config/theme.js";
import { buildingLocation } from "@/data/mockData";

export default function MapCard() {
  const mapSrc = `https://maps.google.com/maps?q=${buildingLocation.lat},${buildingLocation.lng}&z=16&output=embed`;

  return (
    <div className="rounded-card overflow-hidden shadow-card bg-white">
      <div
        className="flex items-center gap-[2px] px-[20px] py-[10px] font-medium text-[22px] ml-[10px]"
        style={{ color: theme.panels.map.headerColor }}
      >
        <MapPin size={26} />
        Map
      </div>
      <div className="h-[1000px] w-[1300px] px-[150px] ml-[2px]">
        <iframe
          title="building-location"
          src={mapSrc}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
        />
      </div>
    </div>
  );
}
