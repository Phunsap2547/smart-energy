"use client";

import { FormEvent } from "react";
import theme from "@/config/theme.js";
import { X, Pencil, Trash2, Plus, ImagePlus } from "lucide-react";

// กำหนด Type ของ Building ในไฟล์นี้โดยตรง ไม่ต้อง import จาก @/types/building
interface Building {
  id: number;
  name: string;
  location?: string;
  lat: number | string;
  lng: number | string;
  image_url?: string;
  [key: string]: any;
}

interface BuildingDrawerProps {
  panelOpen: boolean;
  onClose: () => void;
  error: string | null;
  form: {
    name: string;
    location: string;
    lat: string;
    lng: string;
    image_url: string;
  };
  editingId: number | null;
  imagePreview: string | null;
  imageFile: File | null;
  submitting: boolean;
  loading: boolean;
  buildings: Building[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: FormEvent) => void;
  onResetForm: () => void;
  onStartEdit: (b: Building) => void;
  onDelete: (id: number) => void;
}

export default function BuildingDrawer({
  panelOpen,
  onClose,
  error,
  form,
  editingId,
  imagePreview,
  imageFile,
  submitting,
  loading,
  buildings,
  onChange,
  onImageChange,
  onSubmit,
  onResetForm,
  onStartEdit,
  onDelete,
}: BuildingDrawerProps) {
  const isEditing = editingId !== null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 z-[1400] ${
          panelOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <div
        className={`absolute top-0 right-0 h-full w-full sm:w-[440px] bg-white shadow-2xl z-[1500] flex flex-col transition-transform duration-300 ease-out ${
          panelOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
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
            onClick={onClose}
            className="text-white/90 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition"
            aria-label="ปิดแผงจัดการอาคาร"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {error && (
            <div className="mb-4 p-3 rounded bg-red-100 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form
            onSubmit={onSubmit}
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
                  onClick={onResetForm}
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
                onChange={onChange}
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
                  onChange={onImageChange}
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
                  onChange={onChange}
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
                  onChange={onChange}
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
                  className={`flex items-center justify-between border rounded-lg px-3 py-2.5 ${
                    editingId === b.id ? "bg-blue-50 border-blue-200" : "bg-white"
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
                      onClick={() => onStartEdit(b)}
                      className="p-1.5 rounded hover:bg-blue-50 text-blue-600"
                      aria-label={`แก้ไข ${b.name}`}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => onDelete(b.id)}
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
    </>
  );
}