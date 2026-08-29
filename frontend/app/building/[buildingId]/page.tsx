import { notFound } from "next/navigation";
import { buildings } from "@/data/buildings";
import BuildingDetailClient from "@/components/user/BuildingDetailClient";


interface PageProps {
  params: Promise<{ buildingId: string }>;
}

export default async function BuildingDetailPage({ params }: PageProps) {  
  const { buildingId } = await params;                                     
  const building = buildings.find((b) => b.id === buildingId);

  if (!building) {
    notFound();
  }

    return <BuildingDetailClient building={building} />;
  
}

