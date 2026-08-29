"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Tooltip, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { useRouter } from "next/navigation";
import { useEffect, useState, FormEvent } from "react";
import theme from "@/config/theme.js";
import { UserCircle2, X, Settings2, Pencil, Trash2, Plus, ImagePlus } from "lucide-react";
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// กำหนด Custom Marker Icon เพื่อแก้ปัญหาหมุดแสดงผลไม่ถูกต้องใน Next.js
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// หมุด "ร่าง" ใช้ตอนกำลังเพิ่ม/แก้ไขอาคาร เพื่อพรีวิวตำแหน่งก่อนบันทึกจริง
const draftIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  className: "opacity-60 saturate-0",
});

const statusColorMap: Record<string, string> = {
  Normal: theme.stats?.energyToday?.border || "#10b981",
  Warning: theme.stats?.powerFactor?.border || "#f59e0b",
  Critical: theme.stats?.status?.background || "#ef4444",
};

interface Building {
  id: number;
  name: string;
  location: string | null;
  lat: number;
  lng: number;
  status?: string;
  image_url?: string | null;
}

const DEFAULT_CENTER: [number, number] = [13.7563, 100.5018];

// จับคลิกบนแผนที่ตอนแผงเปิดอยู่ แล้วส่ง lat/lng กลับไปเติมในฟอร์ม
function LocationPicker({
  active,
  onPick,
}: {
  active: boolean;
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      if (!active) return;
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// เลื่อน/ซูมแผนที่ไปหาตำแหน่งอาคารอัตโนมัติ หลังโหลดข้อมูลเสร็จ (ทำครั้งเดียวตอนข้อมูลมาถึง)
// - อาคารเดียว: ซูมเข้าไปตรงจุดนั้น
// - หลายอาคาร: fitBounds ให้เห็นหมุดทั้งหมดพอดีจอ
function MapAutoFit({ buildings }: { buildings: Building[] }) {
  const map = useMap();
  const [hasFitted, setHasFitted] = useState(false);

  useEffect(() => {
    if (buildings.length === 0 || hasFitted) return;

    if (buildings.length === 1) {
      map.setView([buildings[0].lat, buildings[0].lng], 17);
    } else {
      const bounds = L.latLngBounds(
        buildings.map((b) => [b.lat, b.lng] as [number, number])
      );
      map.fitBounds(bounds, { padding: [60, 60] });
    }
    setHasFitted(true);
  }, [buildings, hasFitted, map]);

  return null;
}

export default function AdminMapView() {
  const router = useRouter();

  // ควบคุมการเปิด/ปิด Drawer จัดการอาคาร
  const [panelOpen, setPanelOpen] = useState(false);

  // แหล่งข้อมูลเดียว ใช้ทั้งวาดหมุดบนแผนที่ และแสดง/แก้ไขในแผง
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: "",
    location: "",
    lat: "",
    lng: "",
    image_url: "",
  });

  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("adminToken");
  };

  // ดึงข้อมูลอาคารจาก API เดียวกับที่ฟอร์มใช้บันทึก — ทำให้แผนที่กับแผงซิงค์กันเสมอ
  const fetchBuildings = async () => {
    const token = getToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/admin/buildings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("adminToken");
        router.push("/admin/login");
        return;
      }
      if (!res.ok) throw new Error("โหลดข้อมูลอาคารไม่สำเร็จ");
      const data: Building[] = await res.json();
      setBuildings(data);
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  // --- เพิ่มใน อัปรูป ---
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    form.image_url || null // ถ้าเป็นโหมดแก้ไข ให้โชว์รูปเดิมก่อน
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file)); // preview ทันทีแบบ local
  };

  // โหลดทันทีตอนเข้าเพจ เพื่อให้หมุดบนแผนที่ขึ้นครบตั้งแต่แรก ไม่ต้องรอเปิดแผงก่อน
  useEffect(() => {
    fetchBuildings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ name: "", location: "", lat: "", lng: "", image_url: "" });
    setEditingId(null);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleStartEdit = (b: Building) => {
    setForm({
      name: b.name,
      location: b.location || "",
      lat: String(b.lat),
      lng: String(b.lng),
      image_url: b.image_url || "",
    });
    setEditingId(b.id);
    setImageFile(null);
    setImagePreview(b.image_url || null); // โชว์รูปเดิมตอนกดแก้ไข
    setError(null);
  };

  // ใหม่: คลิกหมุด -> ไปหน้าแสดงข้อมูลอาคาร
  const handleMarkerClick = (b: Building) => {
    router.push(`/admin/buildings/${b.id}`);
  };
  // คลิกบนแผนที่ตอนเปิดแผงจัดการ = เติม lat/lng ให้ฟอร์มอัตโนมัติ (ใช้ได้ทั้งตอนเพิ่มใหม่และแก้ไข)
  const handlePickLocation = (lat: number, lng: number) => {
    setForm((f) => ({ ...f, lat: String(lat), lng: String(lng) }));
  };

  async function uploadBuildingImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const token = getToken();
    const res = await fetch(`${API_URL}/api/admin/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) throw new Error("อัปโหลดรูปไม่สำเร็จ");
    const data = await res.json();
    return data.url; // สมมติ API คืน { url: "https://..." }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError("กรุณากรอกชื่ออาคาร");
      return;
    }
    if (form.lat === "" || form.lng === "") {
      setError("กรุณาระบุพิกัด lat และ lng");
      return;
    }

    const token = getToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = form.image_url;

      if (imageFile) {
        imageUrl = await uploadBuildingImage(imageFile); // อัปโหลดรูปก่อน ได้ URL กลับมา
      }

      const isEditingNow = editingId !== null;
      const url = isEditingNow
        ? `${API_URL}/api/admin/buildings/${editingId}`
        : `${API_URL}/api/admin/buildings`;

      const res = await fetch(url, {
        method: isEditingNow ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          location: form.location || null,
          lat: Number(form.lat),
          lng: Number(form.lng),
          image_url: imageUrl || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.message || (isEditingNow ? "แก้ไขอาคารไม่สำเร็จ" : "เพิ่มอาคารไม่สำเร็จ")
        );
      }

      resetForm();
      setPanelOpen(false);
      await fetchBuildings();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSubmitting(false);
    }
  };

  // ลบอาคาร
  const handleDelete = async (id: number) => {
    if (!confirm("ยืนยันการลบอาคารนี้?")) return;

    const token = getToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/admin/buildings/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("ลบอาคารไม่สำเร็จ");

      if (editingId === id) resetForm();
      await fetchBuildings();
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาดในการลบอาคาร");
    }
  };

  const isEditing = editingId !== null;
  const hasDraftLocation = panelOpen && form.lat !== "" && form.lng !== "";

  return (
    <div className="w-full h-screen relative overflow-hidden">
      {/* Topbar ลอยด้านบนแผนที่ */}
      <div
        className="absolute top-0 left-0 right-0 z-[1000] px-6 py-3 shadow-md flex items-center justify-between"
        style={{
          background: `linear-gradient(90deg, ${theme.topbar.gradientFrom} 0%, ${theme.topbar.gradientTo} 100%)`,
        }}
      >
        <div>
          <h1 className="text-white font-bold text-lg ml-10">
            Smart Energy Management System
          </h1>
          <p className="text-white/80 text-xs sm:text-sm ml-12">
            แผงควบคุมผู้ดูแลระบบ — จัดการอาคารบนแผนที่
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* ปุ่มเปิด/ปิด แผงจัดการอาคาร */}
          <button
            onClick={() => {
              if (!panelOpen) resetForm();
              setPanelOpen((v) => !v);
            }}
            className="flex items-center justify-center gap-1.5 px-4 h-[36px] text-sm font-semibold transition-opacity hover:opacity-90"
            style={{
              background: theme.topbar.adminPillBg,
              color: theme.topbar.adminText,
              borderRadius: theme.radius.pill,
            }}
          >
            <Settings2 size={16} />
            <span>จัดการอาคาร</span>
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-1.5 px-4 h-[36px] text-sm font-semibold"
            style={{
              background: theme.topbar.adminPillBg,
              color: theme.topbar.adminText,
              borderRadius: theme.radius.pill,
            }}
          >
            <UserCircle2 size={18} />
            <span>User</span>
          </Link>
        </div>
      </div>

      {/* ตัวแสดงผลแผนที่ Leaflet — ใช้ข้อมูลจาก API เดียวกับแผงจัดการ */}
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* คลิกบนแผนที่ตอนแผงจัดการเปิดอยู่ = เซ็ต lat/lng ให้ฟอร์มอัตโนมัติ */}
        <LocationPicker active={panelOpen} onPick={handlePickLocation} />

        {/* พอโหลดอาคารเสร็จ ให้เลื่อน/ซูมแผนที่ไปหาตำแหน่งอาคารอัตโนมัติ แก้ปัญหาเปิดมาแล้วเห็นแต่กรุงเทพ */}
        <MapAutoFit buildings={buildings} />

        {buildings.map((building) => (
          <Marker
            key={building.id}
            position={[building.lat, building.lng]}
            icon={markerIcon}
            eventHandlers={{
              click: () => handleMarkerClick(building),
            }}
          >
            <Tooltip
              direction="top"
              offset={[0, -35]}
              opacity={1}
              permanent
              className="!bg-white !border-none !shadow-lg !rounded-lg"
            >
              <div className="text-sm min-w-[140px] p-1">
                <p className="font-semibold text-gray-800">{building.name}</p>
                {building.status && (
                  <span
                    className="inline-block text-[11px] font-bold px-2 py-0.5 rounded text-white mt-1"
                    style={{
                      backgroundColor:
                        statusColorMap[building.status] || "#6b7280",
                    }}
                  >
                    {building.status}
                  </span>
                )}
              </div>
            </Tooltip>
          </Marker>
        ))}

        {/* หมุดร่าง — แสดงตำแหน่งที่กำลังจะบันทึก (เพิ่มใหม่ หรือกำลังแก้ไข) ก่อนกดยืนยัน */}
        {hasDraftLocation && (
          <Marker
            position={[Number(form.lat), Number(form.lng)]}
            icon={draftIcon}
          >
            <Tooltip permanent direction="top" offset={[0, -35]} opacity={0.9}>
              {form.name || "ตำแหน่งที่เลือก (ยังไม่บันทึก)"}
            </Tooltip>
          </Marker>
        )}
      </MapContainer>

      {/* Overlay มืดด้านหลัง เมื่อเปิด Drawer */}
      <div
        onClick={() => setPanelOpen(false)}
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 z-[1400] ${panelOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
      />

      {/* Drawer จัดการอาคาร เลื่อนออกจากขวา */}
      <div
        className={`absolute top-0 right-0 h-full w-full sm:w-[440px] bg-white shadow-2xl z-[1500] flex flex-col transition-transform duration-300 ease-out ${panelOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* หัวแผง */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{
            background: `linear-gradient(90deg, ${theme.topbar.gradientFrom} 0%, ${theme.topbar.gradientTo} 100%)`,
          }}
        >
          <div>
            <h2 className="text-white font-bold text-base">จัดการอาคาร</h2>
            <p className="text-white/70 text-xs">เพิ่ม แก้ไข หรือลบอาคารในระบบ</p>
          </div>
          <button
            onClick={() => setPanelOpen(false)}
            className="text-white/90 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition"
            aria-label="ปิดแผงจัดการอาคาร"
          >
            <X size={20} />
          </button>
        </div>

        {/* เนื้อหา scroll ได้ */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {error && (
            <div className="mb-4 p-3 rounded bg-red-100 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* ฟอร์มเพิ่ม/แก้ไข */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 mb-6 p-4 border rounded-xl bg-gray-50"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                {isEditing ? (
                  <>
                    <Pencil size={14} /> แก้ไขอาคาร: {form.name || "-"}
                  </>
                ) : (
                  <>
                    <Plus size={14} /> เพิ่มอาคารใหม่
                  </>
                )}
              </h3>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs font-semibold text-gray-500 hover:underline"
                >
                  ยกเลิก
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600">
                ชื่ออาคาร *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                placeholder="เช่น อาคารวิศวกรรม"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600">
                รูปภาพอาคาร
              </label>

              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="preview"
                  className="w-full h-40 object-cover rounded-lg mb-2 border"
                />
              )}

              <label className="flex items-center justify-center gap-1.5 w-full border-2 border-dashed rounded-lg px-3 py-3 text-sm text-gray-500 bg-white cursor-pointer hover:bg-gray-50 transition">
                <ImagePlus size={16} />
                {imageFile ? imageFile.name : "เลือกรูปภาพ"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">
                  Latitude *
                </label>
                <input
                  name="lat"
                  type="number"
                  step="any"
                  value={form.lat}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                  placeholder="13.7563"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">
                  Longitude *
                </label>
                <input
                  name="lng"
                  type="number"
                  step="any"
                  value={form.lng}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                  placeholder="100.5018"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold disabled:opacity-50 hover:bg-blue-700 transition"
            >
              {submitting
                ? "กำลังบันทึก..."
                : isEditing
                  ? "บันทึกการแก้ไข"
                  : "เพิ่มอาคาร"}
            </button>
          </form>

          {/* รายการอาคาร */}
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            รายการอาคารทั้งหมด ({buildings.length})
          </h3>

          {loading ? (
            <p className="text-sm text-gray-500">กำลังโหลดข้อมูล...</p>
          ) : buildings.length === 0 ? (
            <p className="text-sm text-gray-500">ยังไม่มีข้อมูลอาคาร</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {buildings.map((b) => (
                <li
                  key={b.id}
                  className={`flex items-center justify-between border rounded-lg px-3 py-2.5 ${editingId === b.id ? "bg-blue-50 border-blue-200" : "bg-white"
                    }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {b.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {b.location || "-"} · {b.lat}, {b.lng}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button
                      onClick={() => handleStartEdit(b)}
                      className="p-1.5 rounded hover:bg-blue-50 text-blue-600"
                      aria-label={`แก้ไข ${b.name}`}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="p-1.5 rounded hover:bg-red-50 text-red-600"
                      aria-label={`ลบ ${b.name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

