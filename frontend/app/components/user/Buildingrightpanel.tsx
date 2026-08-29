"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import MetricPanel from "./MetricPanel";
import type { RangeMode, DeviceIssue } from "@/data/mockData";

interface Props {
  range: RangeMode;
  rangeLabel: string;
  energyToday: { value: number; unit: string; changePct: number };
  cost: { value: number; changePct: number };
  peak: { value: number; time: string };
  powerFactor: number;
  devices: DeviceIssue[];
}

export default function Buildingrightpanel({
  range,
  rangeLabel,
  energyToday,
  cost,
  peak,
  powerFactor,
  devices,
}: Props) {
  const [showDevices, setShowDevices] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <MetricPanel
        range={range}
        rangeLabel={rangeLabel}
        energyToday={energyToday}
        cost={cost}
        peak={peak}
        powerFactor={powerFactor}
        devices={devices}
        onShowDevices={() => setShowDevices(true)}
      />

      {showDevices && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
          onClick={() => setShowDevices(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "var(--card-bg)", borderRadius: 12, padding: 20, width: 380, maxWidth: "90vw" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>อุปกรณ์ที่มีปัญหา</h3>
              <button onClick={() => setShowDevices(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            {devices.map((d) => (
              <div key={d.id} style={{ border: "1px solid var(--border-color)", borderRadius: 8, padding: 12, marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{d.name}</div>
                <div style={{ fontSize: 12.5, color: "var(--text-secondary)", margin: "2px 0" }}>{d.zone}</div>
                <div style={{ fontSize: 13, color: "#dc2626", fontWeight: 500 }}>{d.issue}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


// "use client";

// import React, { useState } from "react";
// import { X } from "lucide-react";
// import MetricPanel from "./MetricPanel";
// import type { RangeMode, DeviceIssue } from "@/data/mockData";

// interface Props {
//   range: RangeMode;
//   rangeLabel: string;
//   energyToday: { value: number; unit: string; changePct: number };
//   peak: { value: number; time: string };
//   devices: DeviceIssue[];
// }

// export default function Buildingrightpanel({
//   range,
//   rangeLabel,
//   energyToday,
//   peak,
//   devices,
// }: Props) {
//   const [showDevices, setShowDevices] = useState(false);

//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
//       <MetricPanel
//         range={range}
//         rangeLabel={rangeLabel}
//         energyToday={energyToday}
//         peak={peak}
//         devices={devices}
//         onShowDevices={() => setShowDevices(true)}
//       />

//       {showDevices && (
//         <div
//           style={{
//             position: "fixed",
//             inset: 0,
//             background: "rgba(0,0,0,0.4)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             zIndex: 50,
//           }}
//           onClick={() => setShowDevices(false)}
//         >
//           <div
//             onClick={(e) => e.stopPropagation()}
//             style={{ background: "var(--card-bg)", borderRadius: 12, padding: 20, width: 380, maxWidth: "90vw" }}
//           >
//             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
//               <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>อุปกรณ์ที่มีปัญหา</h3>
//               <button onClick={() => setShowDevices(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
//                 <X size={18} />
//               </button>
//             </div>
//             {devices.map((d) => (
//               <div key={d.id} style={{ border: "1px solid var(--border-color)", borderRadius: 8, padding: 12, marginBottom: 8 }}>
//                 <div style={{ fontWeight: 600, fontSize: 14 }}>{d.name}</div>
//                 <div style={{ fontSize: 12.5, color: "var(--text-secondary)", margin: "2px 0" }}>{d.zone}</div>
//                 <div style={{ fontSize: 13, color: "#dc2626", fontWeight: 500 }}>{d.issue}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }