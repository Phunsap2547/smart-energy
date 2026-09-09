"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, FormEvent } from "react";
import { Building } from "@/types/building";
import AdminTopbar from "@/components/admin/AdminTopbar";
import AdminMap from "@/components/admin/AdminMap";
import BuildingDrawer from "@/components/admin/BuildingDrawer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminMapView() {
  const router = useRouter();

  const [panelOpen, setPanelOpen] = useState(false);
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

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("adminToken");
  };

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

  useEffect(() => {
    fetchBuildings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
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
    setImagePreview(b.image_url || null);
    setError(null);
  };

  const handleMarkerClick = (b: Building) => {
    router.push(`/admin/buildings/${b.id}`);
  };

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
    return data.url;
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
        imageUrl = await uploadBuildingImage(imageFile);
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

  return (
    <div className="w-full h-screen relative overflow-hidden">
      <AdminTopbar
        panelOpen={panelOpen}
        onTogglePanel={() => {
          if (!panelOpen) resetForm();
          setPanelOpen((v) => !v);
        }}
      />

      <AdminMap
        buildings={buildings}
        panelOpen={panelOpen}
        draftLat={form.lat}
        draftLng={form.lng}
        draftName={form.name}
        onPickLocation={handlePickLocation}
        onMarkerClick={handleMarkerClick}
      />

      <BuildingDrawer
        panelOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        error={error}
        form={form}
        editingId={editingId}
        imagePreview={imagePreview}
        imageFile={imageFile}
        submitting={submitting}
        loading={loading}
        buildings={buildings}
        onChange={handleChange}
        onImageChange={handleImageChange}
        onSubmit={handleSubmit}
        onResetForm={resetForm}
        onStartEdit={handleStartEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}