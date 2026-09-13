// "use client";

// import React from "react";
// import { RefreshCw, MoreVertical } from "lucide-react";

// export default function BuildingHeader() {
//   return (
//     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
//       <div>
//         <h1 className="text-2xl font-bold text-gray-900">ภาพรวมระบบ</h1>
//         <p className="text-xs text-gray-500 mt-0.5">
//           สรุปสถานะระบบไฟฟ้าแบบ Real-time
//         </p>
//       </div>

//       <div className="flex items-center gap-2">
//         <button className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 shadow-2xs">
//           <RefreshCw size={14} className="text-gray-500" />
//           <span>Realtime - 7 วันที่ผ่านมา</span>
//         </button>
//         <button className="p-1.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 shadow-2xs">
//           <MoreVertical size={16} />
//         </button>
//       </div>
//     </div>
//   );
// }