// import React from "react";
// import BuildingDetailClient from "@/components/user/buildings/BuildingDetailClient" ;

// // ตัวอย่างการดึงข้อมูลตาม ID (หรือดึงจาก Database/API)
// export default async function BuildingAlertsPage({
//   params,
// }: {
//   params: Promise<{ id: string }>;
// }) {
//   const { id } = await params;

//   const buildingData = {
//     id,
//     name: `อาคารเรียนรวม (Building ${id})`,
//     locationName: "มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร",
//     lat: 17.289,
//     lng: 104.112,
//   };

//   return <BuildingDetailClient building={buildingData}  />;
// }