//app/admin/page.tsx

import Sidebar from "@/components/shared/Sidebar";
import TopBar from "@/components/shared/TopBar";
import { StatCard, StatusCard } from "@/components/shared/StatCard";
import EnergyConsumptionChart from "@/components/charts/EnergyConsumptionChart";
import TotalEnergyChart from "@/components/charts/TotalEnergyChart";
import MapCard from "@/components/MapCard";
import DeviceStatusTable from "@/components/admin/DeviceStatusTable";
import RecentAlertsList from "@/components/admin/RecentAlertsList";
import AIInsightsPanel from "@/components/admin/AIInsightsPanel";
import theme from "@/config/theme.js";

export default function AdminPage() {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: theme.page.background }}>
      <Sidebar />
      <main className="flex-1">
        <TopBar />
         
         <EnergyConsumptionChart />
         <TotalEnergyChart />
         <MapCard/>
         <DeviceStatusTable />
        <RecentAlertsList />
        <AIInsightsPanel /> 
      </main>
    </div>
  );
}