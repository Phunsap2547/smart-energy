//app/admin/page.tsx

import Sidebar from "@/components/shared/Sidebar";
import TopBar from "@/components/shared/TopBar";
import EnergyConsumptionChart from "@/components/charts/EnergyConsumptionChart";
import TotalEnergyChart from "@/components/charts/TotalEnergyChart";
import theme from "@/config/theme.js";

export default function AdminPage() {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: theme.page.background }}>
      <Sidebar />
      <main className="flex-1">
        <TopBar />
         <h1
            className="mb-[40px] mt-[20px] font-bold px-[6px] py-[10px] rounded-card shadow-card text-center text-[25px] " 
            style={{ color: theme.page.heading }}
          >
            Smart energy management system in academic building
          </h1>
       
      </main>
    </div>
  );
}