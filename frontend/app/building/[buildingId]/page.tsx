import { notFound } from "next/navigation";
import { buildings } from "@/data/buildings";
import BuildingDetailClient from "@/components/building-detail/BuildingDetailClient";


interface PageProps {
  params: Promise<{ buildingId: string }>;
}

export default async function BuildingDetailPage({ params }: PageProps) {  // 👈 2. เพิ่ม async
  const { buildingId } = await params;                                     // 👈 3. await ก่อนใช้
  const building = buildings.find((b) => b.id === buildingId);

  if (!building) {
    notFound();
  }

    return <BuildingDetailClient building={building} />;


  // return (
  //   <div className="min-h-screen" style={{ backgroundColor: theme.page.background }}>
  //     {/* แถบด้านบน มีปุ่มย้อนกลับไปหน้าแผนที่ */}
  //     <div
  //       className="flex items-center gap-3 px-6 py-4"
  //       style={{
  //         background: `linear-gradient(90deg, ${theme.topbar.gradientFrom} 0%, ${theme.topbar.gradientTo} 100%)`,
  //       }}
  //     >
        
  //       <Link href="/" className="text-white flex items-center gap-2">
  //         <ArrowLeft size={20} />
  //         กลับไปหน้าแผนที่
  //       </Link>
  //     </div>
      

  //     <div className="px-8 py-6">
  //       <h1
  //         className="text-xl font-bold mb-6 bg-white inline-block px-6 py-3 rounded-card shadow-card"
  //         style={{ color: theme.page.heading }}
  //       >
  //         {building.name}

  //       </h1>
        
  //     </div>
  //     </div>
  // );
  
}