"use client";

import React from "react";
import { Zap, Wallet, Activity, Gauge, AlertTriangle } from "lucide-react";
import StatCard from "@/components/shared/StatCard";
import { analyzePowerFactor } from "@/lib/analyzeStatus";
import type { RangeMode, DeviceIssue } from "@/data/mockData";

interface Props {
  range: RangeMode;
  rangeLabel: string;
  energyToday: { value: number; unit: string; changePct: number };
  cost: { value: number; changePct: number };
  peak: { value: number; time: string };
  powerFactor: number;
  devices: DeviceIssue[];
  onShowDevices: () => void;
}

export default function MetricPanel({
  range,
  rangeLabel,
  energyToday,
  cost,
  peak,
  powerFactor,
  devices,
  onShowDevices,
}: Props) {
  const pf = analyzePowerFactor(powerFactor);

  return (
    <>
      <StatCard
        icon={<Zap size={16} />}
        iconBg="#dcfce7"
        iconColor="#16a34a"
        title={`Energy ${rangeLabel}`}
        value={energyToday.value.toLocaleString()}
        unit={energyToday.unit}
        changePct={energyToday.changePct}
        sub="เทียบกับช่วงก่อนหน้า"
      />
      <StatCard
        icon={<Wallet size={16} />}
        iconBg="#dbeafe"
        iconColor="#2563eb"
        title="ค่าไฟฟ้าประมาณการ"
        value={cost.value.toLocaleString()}
        unit="บาท"
        changePct={cost.changePct}
        sub={rangeLabel}
      />
      <StatCard
        icon={<Activity size={16} />}
        iconBg="#ede9fe"
        iconColor="#7c3aed"
        title="Peak Demand"
        value={peak.value.toLocaleString()}
        unit="kW"
        sub={`เกิดขึ้นเมื่อ ${peak.time}`}
      />
      <StatCard
        icon={<Gauge size={16} />}
        iconBg="#fef9c3"
        iconColor="#ca8a04"
        title="Power Factor"
        value={powerFactor.toFixed(2)}
        sub={pf.message}
        warn={pf.isWarning}
      />
      <StatCard
        icon={<AlertTriangle size={16} />}
        iconBg="#fee2e2"
        iconColor="#dc2626"
        title="Status"
        value={`${devices.length} devices`}
        sub="ดูรายละเอียดเพิ่มเติม"
        onClick={onShowDevices}
      />
    </>
  );
}