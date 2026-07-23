import { Zap, Building2, Gauge, AlertTriangle } from "lucide-react";
import Sidebar from "@/components/shared/Sidebar";
import TopBar from "@/components/shared/TopBar";
import { StatCard, StatusCard } from "@/components/shared/StatCard";
import EnergyConsumptionChart from "@/components/charts/EnergyConsumptionChart";
import TotalEnergyChart from "@/components/charts/TotalEnergyChart";
import MapCard from "@/components/MapCard";
import theme from "@/config/theme.js";
import { statCards } from "@/data/mockData";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: theme.page.background }}>
      <Sidebar />

      <main className="flex-1">
        <TopBar />

        <div className="px-[8px] pb-[20px] relative">
          <h1
            className="mb-[30px] bg-white px-[6px] py-[10px] rounded-card shadow-card text-center " 
            style={{ 
              color: theme.page.heading }}
          >
            Smart energy management system in academic building
          </h1>

          {/* Stat cards */}
          <div className="flex gap-[30px] mb-[30px] flex-wrap"
          /*style={{ 
               background: theme.stats.energyToday.energytodayPillBg, }}*/
          >
            <StatCard
              variant="energyToday"
              icon={<Zap size={50} />}
              title="Energy Today"
              value={statCards.energyToday.value}
              unit={statCards.energyToday.unit}
              badgeText={statCards.energyToday.status}
            />
            <StatCard
              variant="realPower"
              icon={<Building2 size={50} />}
              title="Real Power"
              value={statCards.realPower.value}
              unit={statCards.realPower.unit}
              badgeText={statCards.realPower.status}
            />
            <StatCard
              variant="powerFactor"
              icon={<Gauge size={50} />}
              title="Power Factor"
              value={statCards.powerFactor.value}
              badgeText={statCards.powerFactor.status}
            />
            <StatusCard
              icon={<AlertTriangle size={50} />}
              count={statCards.statusAlert.count}
              label={statCards.statusAlert.label}
            />
          </div>

          {/* Charts */}
          <div className="flex gap-[30px] mb-[30px] flex-col lg:flex-row">
            <EnergyConsumptionChart />
            <TotalEnergyChart />
          </div>

          {/* Map */}
          <div className="max-w-xl mx-auto">
            <MapCard />
          </div>
        </div>
      </main>
    </div>
  );
}
