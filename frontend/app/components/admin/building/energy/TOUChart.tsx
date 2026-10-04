// 'use client';

// import React, { useState, useEffect } from 'react';
// import { Clock, DollarSign, Lightbulb, RefreshCw } from 'lucide-react';
// import { supabase } from '@/lib/supabase';

// interface TOUChartProps {
//   buildingId: string;
//   selectedDate?: string;
//   timeRange?: 'day' | '7d' | '30d';
// }

// interface TOUData {
//   onPeakKwh: number;
//   offPeakKwh: number;
//   totalKwh: number;
//   onPeakCost: number;
//   offPeakCost: number;
//   totalCost: number;
//   onPeakPct: number;
//   offPeakPct: number;
//   potentialSavings: number;
// }

// const ON_PEAK_RATE = 4.32;
// const OFF_PEAK_RATE = 2.63;

// export default function TOUChart({ buildingId, selectedDate, timeRange = 'day' }: TOUChartProps) {
//   const [loading, setLoading] = useState<boolean>(true);
//   const [touData, setTouData] = useState<TOUData>({
//     onPeakKwh: 0,
//     offPeakKwh: 0,
//     totalKwh: 0,
//     onPeakCost: 0,
//     offPeakCost: 0,
//     totalCost: 0,
//     onPeakPct: 0,
//     offPeakPct: 0,
//     potentialSavings: 0,
//   });

//   useEffect(() => {
//     const fetchTOUData = async () => {
//       if (!buildingId) return;
//       setLoading(true);

//       try {
//         const { data: devices } = await supabase
//           .from('devices')
//           .select('id')
//           .eq('building_id', buildingId);

//         const deviceIds = devices?.map((d) => d.id) || [];
//         if (deviceIds.length === 0) {
//           setLoading(false);
//           return;
//         }

//         const baseDate = selectedDate ? new Date(selectedDate) : new Date();
//         let startDate = new Date(baseDate);
//         let endDate = new Date(baseDate);

//         if (timeRange === 'day') {
//           startDate.setHours(0, 0, 0, 0);
//           endDate.setHours(23, 59, 59, 999);
//         } else if (timeRange === '7d') {
//           startDate.setDate(baseDate.getDate() - 6);
//           startDate.setHours(0, 0, 0, 0);
//           endDate.setHours(23, 59, 59, 999);
//         } else if (timeRange === '30d') {
//           startDate.setDate(baseDate.getDate() - 29);
//           startDate.setHours(0, 0, 0, 0);
//           endDate.setHours(23, 59, 59, 999);
//         }

//         const { data: readings, error } = await supabase
//           .from('energy_readings')
//           .select('reading_time, energy_kwh, power_kw')
//           .in('device_id', deviceIds)
//           .gte('reading_time', startDate.toISOString())
//           .lte('reading_time', endDate.toISOString())
//           .order('reading_time', { ascending: true });

//         if (error || !readings || readings.length === 0) {
//           setLoading(false);
//           return;
//         }

//         // คำนวณช่วงเวลาด้วยการ Integrate ค่า power_kw ประจำจุดอ่านค่า
//         let rawOnPeak = 0;
//         let rawOffPeak = 0;

//         for (let i = 1; i < readings.length; i++) {
//           const prev = readings[i - 1];
//           const curr = readings[i];
//           const currDate = new Date(curr.reading_time);
//           const prevDate = new Date(prev.reading_time);

//           // คำนวณระยะห่างเวลา (ชั่วโมง)
//           const timeDiffHours = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60);
          
//           // ป้องกันค่าผิดปกติจาก Gap ที่ห่างเกิน 2 ชั่วโมง
//           if (timeDiffHours > 0 && timeDiffHours < 2) {
//             const avgPower = ((curr.power_kw ?? 0) + (prev.power_kw ?? 0)) / 2;
//             const deltaKwh = avgPower * timeDiffHours;

//             const dayOfWeek = currDate.getDay();
//             const hour = currDate.getHours();
//             const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
//             const isOnPeakHour = hour >= 9 && hour < 22;

//             if (!isWeekend && isOnPeakHour) {
//               rawOnPeak += deltaKwh;
//             } else {
//               rawOffPeak += deltaKwh;
//             }
//           }
//         }

//         // หา Delta kWh รวมจากค่าสะสมจริงจุดแรกถึงจุดสุดท้าย
//         const startEnergy = readings[0].energy_kwh ?? 0;
//         const endEnergy = readings[readings.length - 1].energy_kwh ?? 0;
//         const actualTotalKwh = Math.max(0, endEnergy - startEnergy);

//         // Normalize ให้ยอดรวมของ TOU ตรงกับ Delta kWh จริงบน EnergySummary พอดี
//         const computedSum = rawOnPeak + rawOffPeak;
//         let onPeakKwhSum = rawOnPeak;
//         let offPeakKwhSum = rawOffPeak;

//         if (computedSum > 0 && actualTotalKwh > 0) {
//           const ratio = actualTotalKwh / computedSum;
//           onPeakKwhSum = rawOnPeak * ratio;
//           offPeakKwhSum = rawOffPeak * ratio;
//         }

//         const totalKwh = onPeakKwhSum + offPeakKwhSum;
//         const onPeakCost = onPeakKwhSum * ON_PEAK_RATE;
//         const offPeakCost = offPeakKwhSum * OFF_PEAK_RATE;
//         const totalCost = onPeakCost + offPeakCost;

//         const onPeakPct = totalKwh > 0 ? (onPeakKwhSum / totalKwh) * 100 : 0;
//         const offPeakPct = totalKwh > 0 ? (offPeakKwhSum / totalKwh) * 100 : 0;

//         const shiftedKwh = onPeakKwhSum * 0.15;
//         const potentialSavings = shiftedKwh * (ON_PEAK_RATE - OFF_PEAK_RATE);

//         setTouData({
//           onPeakKwh: onPeakKwhSum,
//           offPeakKwh: offPeakKwhSum,
//           totalKwh,
//           onPeakCost,
//           offPeakCost,
//           totalCost,
//           onPeakPct,
//           offPeakPct,
//           potentialSavings,
//         });
//       } catch (err) {
//         console.error('TOU Calculation Error:', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTOUData();
//   }, [buildingId, selectedDate, timeRange]);

//   const formatNum = (val: number, decimals = 1) =>
//     val.toLocaleString('th-TH', {
//       minimumFractionDigits: decimals,
//       maximumFractionDigits: decimals,
//     });

//   return (
//     <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-2.5">
//           <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
//             <Clock className="w-5 h-5" />
//           </div>
//           <div>
//             <h2 className="text-base font-bold text-slate-800">
//               วิเคราะห์ช่วงเวลาใช้ไฟฟ้า (TOU Analysis)
//             </h2>
//             <p className="text-xs text-slate-500">
//               สัดส่วนการใช้พลังงานช่วง On-Peak (09:00-22:00 น.) และ Off-Peak
//             </p>
//           </div>
//         </div>
//         <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 font-medium rounded-full">
//           อัตราก้าวหน้า
//         </span>
//       </div>

//       {loading ? (
//         <div className="h-48 flex items-center justify-center text-slate-400 gap-2">
//           <RefreshCw className="w-5 h-5 animate-spin" />
//           <span className="text-xs font-medium">กำลังคำนวณข้อมูล TOU...</span>
//         </div>
//       ) : (
//         <>
//           {/* Progress / Ratio Bar */}
//           <div className="space-y-2">
//             <div className="flex justify-between text-xs font-semibold">
//               <span className="text-amber-600 flex items-center gap-1">
//                 ● On-Peak ({formatNum(touData.onPeakPct, 1)}%)
//               </span>
//               <span className="text-emerald-600 flex items-center gap-1">
//                 Off-Peak ({formatNum(touData.offPeakPct, 1)}%) ●
//               </span>
//             </div>

//             {/* Stacked Bar Graph */}
//             <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex p-0.5">
//               <div
//                 style={{ width: `${touData.onPeakPct}%` }}
//                 className="bg-amber-500 h-full rounded-l-full transition-all duration-500"
//                 title={`On-Peak: ${formatNum(touData.onPeakKwh)} kWh`}
//               />
//               <div
//                 style={{ width: `${touData.offPeakPct}%` }}
//                 className="bg-emerald-500 h-full rounded-r-full transition-all duration-500"
//                 title={`Off-Peak: ${formatNum(touData.offPeakKwh)} kWh`}
//               />
//             </div>
//           </div>

//           {/* Cards เปรียบเทียบ 2 ฝั่ง */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             {/* On-Peak Card */}
//             <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100/80">
//               <div className="flex justify-between items-start mb-2">
//                 <span className="text-xs font-bold text-amber-800">ช่วง On-Peak</span>
//                 <span className="text-[10px] font-semibold px-2 py-0.5 bg-amber-200/60 text-amber-800 rounded">
//                   ฿{ON_PEAK_RATE}/หน่วย
//                 </span>
//               </div>
//               <div className="flex items-baseline gap-1.5">
//                 <span className="text-2xl font-extrabold text-amber-900">
//                   {formatNum(touData.onPeakKwh, 1)}
//                 </span>
//                 <span className="text-xs text-amber-700 font-medium">kWh</span>
//               </div>
//               <p className="text-xs text-amber-700/80 mt-1 flex items-center gap-1">
//                 <DollarSign className="w-3.5 h-3.5" />
//                 ประมาณการค่าไฟ: <strong>{formatNum(touData.onPeakCost, 0)} บาท</strong>
//               </p>
//             </div>

//             {/* Off-Peak Card */}
//             <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100/80">
//               <div className="flex justify-between items-start mb-2">
//                 <span className="text-xs font-bold text-emerald-800">ช่วง Off-Peak</span>
//                 <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-200/60 text-emerald-800 rounded">
//                   ฿{OFF_PEAK_RATE}/หน่วย
//                 </span>
//               </div>
//               <div className="flex items-baseline gap-1.5">
//                 <span className="text-2xl font-extrabold text-emerald-900">
//                   {formatNum(touData.offPeakKwh, 1)}
//                 </span>
//                 <span className="text-xs text-emerald-700 font-medium">kWh</span>
//               </div>
//               <p className="text-xs text-emerald-700/80 mt-1 flex items-center gap-1">
//                 <DollarSign className="w-3.5 h-3.5" />
//                 ประมาณการค่าไฟ: <strong>{formatNum(touData.offPeakCost, 0)} บาท</strong>
//               </p>
//             </div>
//           </div>

//           {/* Automated Insight / Load Shifting Suggestion */}
//           <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-3">
//             <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0 mt-0.5">
//               <Lightbulb className="w-4 h-4" />
//             </div>
//             <div className="text-xs space-y-1">
//               <span className="font-bold text-slate-800 block">
//                 คำแนะนำการลดค่าใช้จ่าย (Load Shifting):
//               </span>
//               <p className="text-slate-600 leading-relaxed">
//                 หากวางแผนปรับเวลาการทำงานของอุปกรณ์ที่ใช้ไฟสูง (เช่น ปั๊มน้ำ, ระบบชาร์จ หรือเครื่องจักร) จากช่วง On-Peak ไปยัง Off-Peak เพียง 15% จะสามารถประหยัดค่าไฟฟ้าได้ประมาณ{' '}
//                 <strong className="text-emerald-600 font-bold underline">
//                   {formatNum(touData.potentialSavings, 0)} บาท
//                 </strong>{' '}
//                 ในรอบเวลานี้
//               </p>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }