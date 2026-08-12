// ข้อมูลอาคาร/มิเตอร์ ที่จะโชว์เป็นหมุดบนแผนที่หน้าแรก
// ถ้าจะเพิ่มอาคารอื่นในอนาคต เพิ่ม object ใหม่ในนี้ได้เลย ไม่ต้องแก้โค้ดแผนที่

export interface BuildingMeter {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: "Normal" | "Warning" | "Critical";
  //photoUrl: string;
}

export const buildings: BuildingMeter[] = [
  {
    id: "building-22",
    name: "อาคาร 22 ปฏิบัติการ",
    lat: 17.2876875,   
    lng: 104.1073281,  
    status: "Warning",
    //photoUrl: "/images/building-22.jpg",
  },
  //เพิ่มอาคารถัดไปตรงนี้ เช่น:
  {
    id: "building-1",
    name: "อาคาร 9 เทคโนโลยีสารสนเทศ",
    lat: 17.288381,
    lng: 104.1057858,
    status: "Normal",
  },

];