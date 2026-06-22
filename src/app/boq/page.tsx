"use client";

import React, { useState, useMemo, useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import { 
  Calculator, 
  Plus, 
  RotateCcw, 
  Wrench, 
  Layers, 
  Sliders, 
  Database,
  ArrowRight,
  Printer,
  ChevronDown,
  Info
} from "lucide-react";

interface SubCategory {
  id: string;
  name: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultDepth: number;
  hasDoors: boolean;
  hasDrawers: boolean;
  isSliding?: boolean;
  isWetArea?: boolean;
}

interface Category {
  id: string;
  name: string;
  subcategories: SubCategory[];
}

const CATEGORIES: Category[] = [
  {
    id: "kitchen",
    name: "ชุดห้องครัว (Kitchen Built-in)",
    subcategories: [
      { id: "k-upper", name: "ตู้แขวนติดผนังบน (Upper Cabinet)", defaultWidth: 1200, defaultHeight: 800, defaultDepth: 350, hasDoors: true, hasDrawers: false },
      { id: "k-lower", name: "ตู้เคาน์เตอร์ล่าง (Lower Cabinet)", defaultWidth: 1200, defaultHeight: 850, defaultDepth: 600, hasDoors: true, hasDrawers: true },
      { id: "k-sink", name: "ตู้ล่างอ่างล้างจานทนชื้นสูง (Sink Cabinet)", defaultWidth: 1000, defaultHeight: 850, defaultDepth: 600, hasDoors: true, hasDrawers: false, isWetArea: true },
      { id: "k-tall", name: "ตู้สูงอเนกประสงค์/ตู้แพนทรี (Tall Cabinet)", defaultWidth: 800, defaultHeight: 2200, defaultDepth: 600, hasDoors: true, hasDrawers: true },
      { id: "k-fridge", name: "ตู้ครอบตู้เย็นดีไซน์โมเดิร์น (Fridge Enclosure)", defaultWidth: 1000, defaultHeight: 2200, defaultDepth: 700, hasDoors: false, hasDrawers: false },
      { id: "k-island", name: "เคาน์เตอร์ไอส์แลนด์เตรียมอาหาร (Island Counter)", defaultWidth: 1500, defaultHeight: 850, defaultDepth: 800, hasDoors: true, hasDrawers: true }
    ]
  },
  {
    id: "bedroom",
    name: "ชุดห้องนอน (Bedroom Built-in)",
    subcategories: [
      { id: "b-wardrobe-hinged", name: "ตู้เสื้อผ้าบานเปิด (Hinged Wardrobe)", defaultWidth: 1800, defaultHeight: 2400, defaultDepth: 600, hasDoors: true, hasDrawers: true },
      { id: "b-wardrobe-sliding", name: "ตู้เสื้อผ้าบานเลื่อน (Sliding Wardrobe)", defaultWidth: 2000, defaultHeight: 2400, defaultDepth: 650, hasDoors: true, hasDrawers: true, isSliding: true },
      { id: "b-walkin", name: "ตู้เสื้อผ้า Walk-in Closet (Open Closet)", defaultWidth: 1800, defaultHeight: 2400, defaultDepth: 550, hasDoors: false, hasDrawers: true },
      { id: "b-bed", name: "เตียงนอนบิวท์อินมีช่องเก็บของ (Storage Bed)", defaultWidth: 1950, defaultHeight: 1100, defaultDepth: 2100, hasDoors: false, hasDrawers: true },
      { id: "b-vanity", name: "โต๊ะเครื่องแป้งบิวท์อิน (Vanity Table)", defaultWidth: 1000, defaultHeight: 750, defaultDepth: 450, hasDoors: false, hasDrawers: true },
      { id: "b-panel", name: "แผงผนังตกแต่งหัวเตียง (Bedside Accent Panel)", defaultWidth: 2800, defaultHeight: 2400, defaultDepth: 100, hasDoors: false, hasDrawers: false }
    ]
  },
  {
    id: "living",
    name: "ชุดห้องนั่งเล่นและโถงทางเข้า (Living Room & Foyer)",
    subcategories: [
      { id: "l-tv", name: "แผงตกแต่งผนังและชั้นวางทีวี (TV Wall Console)", defaultWidth: 2400, defaultHeight: 2200, defaultDepth: 400, hasDoors: true, hasDrawers: true },
      { id: "l-display", name: "ตู้โชว์กระจกและชั้นหนังสือสูง (Glass Display)", defaultWidth: 1600, defaultHeight: 2200, defaultDepth: 350, hasDoors: true, hasDrawers: false },
      { id: "l-shoe", name: "ตู้รองเท้าบิวท์อินและม้านั่งยาว (Shoe Cabinet & Bench)", defaultWidth: 1200, defaultHeight: 2200, defaultDepth: 350, hasDoors: true, hasDrawers: true },
      { id: "l-partition", name: "ฉากระแนงไม้กั้นห้อง/พาร์ทิชัน (Partition Divider)", defaultWidth: 1200, defaultHeight: 2600, defaultDepth: 150, hasDoors: false, hasDrawers: false },
      { id: "l-credenza", name: "ตู้ไซด์บอร์ดคอนโซลเตี้ย (Low Credenza Console)", defaultWidth: 1800, defaultHeight: 750, defaultDepth: 400, hasDoors: true, hasDrawers: true }
    ]
  },
  {
    id: "bathroom",
    name: "ชุดห้องน้ำทนน้ำสูง (Bathroom Built-in)",
    subcategories: [
      { id: "ba-vanity", name: "เคาน์เตอร์ตู้ใต้ซิงค์อ่างล้างหน้า (Sink Vanity Cabinet)", defaultWidth: 1000, defaultHeight: 800, defaultDepth: 550, hasDoors: true, hasDrawers: false, isWetArea: true },
      { id: "ba-mirror", name: "ตู้ยาสามัญ/ตู้แขวนกระจกเงา (Medicine Cabinet)", defaultWidth: 800, defaultHeight: 700, defaultDepth: 180, hasDoors: true, hasDrawers: false, isWetArea: true }
    ]
  },
  {
    id: "office",
    name: "ชุดห้องทำงาน (Home Office)",
    subcategories: [
      { id: "o-desk", name: "โต๊ะทำงานผู้บริหารบิวท์อิน (Executive Desk)", defaultWidth: 1600, defaultHeight: 750, defaultDepth: 600, hasDoors: false, hasDrawers: true },
      { id: "o-filing", name: "ตู้เอกสารบิวท์อินขนาดใหญ่ (Filing Cabinet)", defaultWidth: 1200, defaultHeight: 1800, defaultDepth: 400, hasDoors: true, hasDrawers: true }
    ]
  },
  {
    id: "laundry",
    name: "ชุดห้องซักรีดและห้องเก็บของ (Laundry & Utility)",
    subcategories: [
      { id: "ld-washer", name: "เคาน์เตอร์ตู้วางเครื่องซัก/อบผ้า (Washer Cabinet)", defaultWidth: 1400, defaultHeight: 2200, defaultDepth: 600, hasDoors: true, hasDrawers: false, isWetArea: true },
      { id: "ld-storage", name: "ตู้เก็บน้ำยาและอุปกรณ์ทำความสะอาด (Supply Storage)", defaultWidth: 800, defaultHeight: 2200, defaultDepth: 600, hasDoors: true, hasDrawers: false, isWetArea: true }
    ]
  }
];

interface DatabaseItem {
  id: string;
  name: string;
  price: number;
  unit: string;
}

const CABINET_BOARDS: DatabaseItem[] = [
  { id: "pb-15", name: "ไม้ Particle Board (PB) E1 15 มม.", price: 350, unit: "แผ่น" },
  { id: "mdf-15", name: "ไม้ MDF เกรดมาตรฐานทั่วไป 15 มม.", price: 450, unit: "แผ่น" },
  { id: "mdf-18", name: "ไม้ MDF หนาพิเศษทำหน้าบาน 18 มม.", price: 550, unit: "แผ่น" },
  { id: "hmr-15", name: "ไม้ HMR ทนชื้นสีเขียวเกรด A 15 มม.", price: 680, unit: "แผ่น" },
  { id: "hmr-18", name: "ไม้ HMR ทนชื้นหนาพิเศษรับน้ำหนัก 18 มม.", price: 820, unit: "แผ่น" },
  { id: "plywood-15", name: "ไม้อัดยางเกรด AA แกนไม้แน่น 15 มม.", price: 1100, unit: "แผ่น" },
  { id: "plywood-18", name: "ไม้อัดยางเกรด AA หนาพิเศษ 18 มม.", price: 1350, unit: "แผ่น" },
  { id: "plaswood-15", name: "แผ่นพลาสวูดทนน้ำ 100% (กันปลวก) 15 มม.", price: 1350, unit: "แผ่น" },
  { id: "plaswood-18", name: "แผ่นพลาสวูดกันน้ำ 100% หนาพิเศษ 18 มม.", price: 1600, unit: "แผ่น" },
  { id: "teak-15", name: "ไม้อัดโครงสักธรรมชาติแท้เกรดพรีเมียม 15 มม.", price: 2200, unit: "แผ่น" },
  { id: "teak-18", name: "ไม้อัดโครงสักธรรมชาติแท้พรีเมียมหนา 18 มม.", price: 2600, unit: "แผ่น" }
];

const HINGES: DatabaseItem[] = [
  { id: "hinge-std", name: "บานพับ Soft-Close จังหวะเดียวมาตรฐาน", price: 65, unit: "ชิ้น" },
  { id: "hinge-hafele", name: "บานพับ Hafele Metalla Soft-Close (เยอรมัน)", price: 150, unit: "ชิ้น" },
  { id: "hinge-blum", name: "บานพับ Blum Clip Top Soft-Close (ออสเตรีย)", price: 220, unit: "ชิ้น" },
  { id: "hinge-salice", name: "บานพับ Salice Titanium Soft-Close (อิตาลีรมดำ)", price: 320, unit: "ชิ้น" },
  { id: "hinge-blum-glass", name: "บานพับสำหรับบานเปิดกระจก Blum Cristallo", price: 380, unit: "ชิ้น" }
];

const DRAWER_SLIDES: DatabaseItem[] = [
  { id: "slide-std", name: "รางลูกปืนลิ้นชัก Soft-Close ติดข้างตู้ 45 ซม.", price: 180, unit: "คู่" },
  { id: "slide-hafele-under", name: "รางซ่อนใต้ลิ้นชัก Hafele Soft-Close 2 ตอน", price: 750, unit: "คู่" },
  { id: "slide-blum-single", name: "รางซ่อนใต้ลิ้นชัก Blum Tandem Single-Extension", price: 950, unit: "คู่" },
  { id: "slide-blum-antaro", name: "รางกล่องลิ้นชักสำเร็จรูปขอบเหล็ก Blum Tandembox antaro", price: 1850, unit: "คู่" },
  { id: "slide-blum-legrabox", name: "รางลิ้นชักหรูสุดขอบบางพิเศษ Blum Legrabox pure", price: 3500, unit: "คู่" }
];

const SLIDING_TRACKS: DatabaseItem[] = [
  { id: "slide-track-std", name: "รางบานเลื่อนอลูมิเนียมโปรไฟล์ทั่วไป (1.8 ม.)", price: 650, unit: "ชุด" },
  { id: "slide-track-hafele", name: "ชุดล้อบานเลื่อนแขวนสลิงปิดนุ่มนวล Hafele Silent 80/A", price: 1900, unit: "ชุด" },
  { id: "slide-track-premium", name: "ระบบบานเลื่อนแขวน Soft-Closing คู่นำเข้าสูง OPENTEC", price: 3200, unit: "ชุด" },
  { id: "slide-track-flush", name: "ระบบเลื่อนเรียบระนาบปิดสนิท Cinetto PS10 (อิตาลี)", price: 7500, unit: "ชุด" }
];

const HANDLES: DatabaseItem[] = [
  { id: "handle-none", name: "ตัวกดกระเด้งแม่เหล็กติดซ่อนบาน (Tip-On / Push-to-Open)", price: 65, unit: "ชิ้น" },
  { id: "handle-std", name: "มือจับโปรไฟล์อลูมิเนียมฝังขอบหน้าบานสไตล์โมเดิร์น", price: 120, unit: "ชิ้น" },
  { id: "handle-hafele", name: "มือจับ Zinc Alloy สีดำด้าน Hafele Contemporary", price: 190, unit: "ชิ้น" },
  { id: "handle-premium", name: "มือจับทองเหลืองแท้ขัดขนแมว (Solid Brass Gold)", price: 350, unit: "ชิ้น" },
  { id: "handle-leather", name: "มือจับหนังแท้เย็บขอบประกอบทองเหลือง Luxury Leather", price: 550, unit: "ชิ้น" }
];

const DOOR_MATERIALS: DatabaseItem[] = [
  { id: "door-melamine", name: "หน้าบานชิ้นงานเคลือบผิวเมลามีนเกรด E1", price: 650, unit: "ตร.ม." },
  { id: "door-laminate", name: "หน้าบานลามิเนตมาตรฐานบนแผ่น MDF (Formica)", price: 1100, unit: "ตร.ม." },
  { id: "door-matt", name: "หน้าบานต้านลายนิ้วมือผิวสัมผัสด้าน Super Matt", price: 1600, unit: "ตร.ม." },
  { id: "door-acrylic", name: "หน้าบานไม้ MDF เคลือบอะคริลิคเงาสูงเกรดกระจก (High-Gloss)", price: 1800, unit: "ตร.ม." },
  { id: "door-paint-pu", name: "หน้าบานทำสีพ่นอุตสาหกรรม PU พ่นสี 5 ชั้นกึ่งเงากึ่งด้าน", price: 2200, unit: "ตร.ม." },
  { id: "door-teak", name: "หน้าบานปิดผิววีเนียร์ไม้อัดสักพ่นเคลือบแล็กเกอร์ด้าน", price: 2600, unit: "ตร.ม." },
  { id: "door-glass", name: "หน้าบานกระจกเงา/กระจกสีชาโครงกรอบอลูมิเนียม Euro Frame", price: 3800, unit: "ตร.ม." }
];

const CABINET_FINISHES: DatabaseItem[] = [
  { id: "finish-melamine", name: "ผิวปิดเมลามีนภายในตู้ (ลายผ้า/เทาขาว)", price: 280, unit: "แผ่น" },
  { id: "finish-pvc-lam", name: "แผ่นลามิเนต PVC ลายลายไม้/หิน อัดกาวภายนอกตู้", price: 380, unit: "แผ่น" },
  { id: "finish-premium-lam", name: "แผ่นลามิเนตนำเข้าพรีเมียม Formica Premium Design", price: 650, unit: "แผ่น" },
  { id: "finish-teak-vene", name: "แผ่นไม้วีเนียร์ปิดผิวสักลายลายเส้นขนานธรรมชาติ", price: 950, unit: "แผ่น" },
  { id: "finish-lacquer", name: "สีพ่นแล็กเกอร์โพลียูรีเทนเคลือบแข็งตัวตู้ภายนอก", price: 1200, unit: "แผ่น" }
];

export default function BOQCalculatorPage() {
  const [selectedCatId, setSelectedCatId] = useState<string>("kitchen");
  const [selectedSubId, setSelectedSubId] = useState<string>("k-lower");

  // Dimensional parameters
  const [width, setWidth] = useState<number>(1200);
  const [height, setHeight] = useState<number>(850);
  const [depth, setDepth] = useState<number>(600);
  const [doorsCount, setDoorsCount] = useState<number>(2);
  const [drawersCount, setDrawersCount] = useState<number>(2);

  // Dropdown states
  const [boardId, setBoardId] = useState<string>("hmr-15");
  const [hingeId, setHingeId] = useState<string>("hinge-std");
  const [slideId, setSlideId] = useState<string>("slide-std");
  const [slideTrackId, setSlideTrackId] = useState<string>("slide-track-std");
  const [handleId, setHandleId] = useState<string>("handle-std");
  const [doorMatId, setDoorMatId] = useState<string>("door-acrylic");
  const [finishId, setFinishId] = useState<string>("finish-pvc-lam");

  const [markupPercent, setMarkupPercent] = useState<number>(35);

  // Load from localStorage or defaults
  const [boards, setBoards] = useState<DatabaseItem[]>(CABINET_BOARDS);
  const [hinges, setHinges] = useState<DatabaseItem[]>(HINGES);
  const [slides, setSlides] = useState<DatabaseItem[]>(DRAWER_SLIDES);
  const [tracks, setTracks] = useState<DatabaseItem[]>(SLIDING_TRACKS);
  const [handles, setHandles] = useState<DatabaseItem[]>(HANDLES);
  const [doorMaterials, setDoorMaterials] = useState<DatabaseItem[]>(DOOR_MATERIALS);
  const [finishes, setFinishes] = useState<DatabaseItem[]>(CABINET_FINISHES);
  const [dbLoaded, setDbLoaded] = useState<boolean>(false);

  // Manage Modal States
  const [isManageModalOpen, setIsManageModalOpen] = useState<boolean>(false);
  const [manageSection, setManageSection] = useState<string>("boards");

  // Form states inside modal
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [formName, setFormName] = useState<string>("");
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formUnit, setFormUnit] = useState<string>("");

  useEffect(() => {
    const loadDb = (key: string, defaults: DatabaseItem[]) => {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaults;
    };
    setBoards(loadDb("pphome_db_boards", CABINET_BOARDS));
    setHinges(loadDb("pphome_db_hinges", HINGES));
    setSlides(loadDb("pphome_db_slides", DRAWER_SLIDES));
    setTracks(loadDb("pphome_db_tracks", SLIDING_TRACKS));
    setHandles(loadDb("pphome_db_handles", HANDLES));
    setDoorMaterials(loadDb("pphome_db_door_mats", DOOR_MATERIALS));
    setFinishes(loadDb("pphome_db_finishes", CABINET_FINISHES));
    setDbLoaded(true);
  }, []);

  const saveToStorage = (key: string, list: DatabaseItem[]) => {
    localStorage.setItem(key, JSON.stringify(list));
  };

  const handleResetDatabase = () => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการคืนค่าเริ่มต้นสำหรับฐานข้อมูลวัสดุทั้งหมด? รายการที่คุณกำหนดเองจะถูกลบ")) {
      localStorage.removeItem("pphome_db_boards");
      localStorage.removeItem("pphome_db_hinges");
      localStorage.removeItem("pphome_db_slides");
      localStorage.removeItem("pphome_db_tracks");
      localStorage.removeItem("pphome_db_handles");
      localStorage.removeItem("pphome_db_door_mats");
      localStorage.removeItem("pphome_db_finishes");
      
      setBoards(CABINET_BOARDS);
      setHinges(HINGES);
      setSlides(DRAWER_SLIDES);
      setTracks(SLIDING_TRACKS);
      setHandles(HANDLES);
      setDoorMaterials(DOOR_MATERIALS);
      setFinishes(CABINET_FINISHES);
      
      setEditingItemId(null);
      setFormName("");
      setFormPrice(0);
      setFormUnit("");
      alert("คืนค่าเริ่มต้นฐานข้อมูลสำเร็จ!");
    }
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || formPrice <= 0 || !formUnit) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง");
      return;
    }

    const newItem: DatabaseItem = {
      id: editingItemId || `${manageSection}_${Date.now()}`,
      name: formName,
      price: formPrice,
      unit: formUnit
    };

    let updatedList: DatabaseItem[] = [];

    if (manageSection === "boards") {
      updatedList = editingItemId
        ? boards.map(item => item.id === editingItemId ? newItem : item)
        : [...boards, newItem];
      setBoards(updatedList);
      saveToStorage("pphome_db_boards", updatedList);
    } else if (manageSection === "hinges") {
      updatedList = editingItemId
        ? hinges.map(item => item.id === editingItemId ? newItem : item)
        : [...hinges, newItem];
      setHinges(updatedList);
      saveToStorage("pphome_db_hinges", updatedList);
    } else if (manageSection === "slides") {
      updatedList = editingItemId
        ? slides.map(item => item.id === editingItemId ? newItem : item)
        : [...slides, newItem];
      setSlides(updatedList);
      saveToStorage("pphome_db_slides", updatedList);
    } else if (manageSection === "tracks") {
      updatedList = editingItemId
        ? tracks.map(item => item.id === editingItemId ? newItem : item)
        : [...tracks, newItem];
      setTracks(updatedList);
      saveToStorage("pphome_db_tracks", updatedList);
    } else if (manageSection === "handles") {
      updatedList = editingItemId
        ? handles.map(item => item.id === editingItemId ? newItem : item)
        : [...handles, newItem];
      setHandles(updatedList);
      saveToStorage("pphome_db_handles", updatedList);
    } else if (manageSection === "doorMaterials") {
      updatedList = editingItemId
        ? doorMaterials.map(item => item.id === editingItemId ? newItem : item)
        : [...doorMaterials, newItem];
      setDoorMaterials(updatedList);
      saveToStorage("pphome_db_door_mats", updatedList);
    } else if (manageSection === "finishes") {
      updatedList = editingItemId
        ? finishes.map(item => item.id === editingItemId ? newItem : item)
        : [...finishes, newItem];
      setFinishes(updatedList);
      saveToStorage("pphome_db_finishes", updatedList);
    }

    setEditingItemId(null);
    setFormName("");
    setFormPrice(0);
    setFormUnit("");
    alert("บันทึกรายการวัสดุสำเร็จ!");
  };

  const handleDeleteItem = (idToDelete: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?")) return;

    let updatedList: DatabaseItem[] = [];

    if (manageSection === "boards") {
      updatedList = boards.filter(item => item.id !== idToDelete);
      setBoards(updatedList);
      saveToStorage("pphome_db_boards", updatedList);
    } else if (manageSection === "hinges") {
      updatedList = hinges.filter(item => item.id !== idToDelete);
      setHinges(updatedList);
      saveToStorage("pphome_db_hinges", updatedList);
    } else if (manageSection === "slides") {
      updatedList = slides.filter(item => item.id !== idToDelete);
      setSlides(updatedList);
      saveToStorage("pphome_db_slides", updatedList);
    } else if (manageSection === "tracks") {
      updatedList = tracks.filter(item => item.id !== idToDelete);
      setTracks(updatedList);
      saveToStorage("pphome_db_tracks", updatedList);
    } else if (manageSection === "handles") {
      updatedList = handles.filter(item => item.id !== idToDelete);
      setHandles(updatedList);
      saveToStorage("pphome_db_handles", updatedList);
    } else if (manageSection === "doorMaterials") {
      updatedList = doorMaterials.filter(item => item.id !== idToDelete);
      setDoorMaterials(updatedList);
      saveToStorage("pphome_db_door_mats", updatedList);
    } else if (manageSection === "finishes") {
      updatedList = finishes.filter(item => item.id !== idToDelete);
      setFinishes(updatedList);
      saveToStorage("pphome_db_finishes", updatedList);
    }
  };

  const handleStartEdit = (item: DatabaseItem) => {
    setEditingItemId(item.id);
    setFormName(item.name);
    setFormPrice(item.price);
    setFormUnit(item.unit);
  };

  const activeManageList = useMemo(() => {
    if (manageSection === "boards") return boards;
    if (manageSection === "hinges") return hinges;
    if (manageSection === "slides") return slides;
    if (manageSection === "tracks") return tracks;
    if (manageSection === "handles") return handles;
    if (manageSection === "doorMaterials") return doorMaterials;
    if (manageSection === "finishes") return finishes;
    return [];
  }, [manageSection, boards, hinges, slides, tracks, handles, doorMaterials, finishes]);

  const activeCategory = CATEGORIES.find(c => c.id === selectedCatId) || CATEGORIES[0];
  const activeSubCategory = activeCategory.subcategories.find(s => s.id === selectedSubId) || activeCategory.subcategories[0];

  const handleCategoryChange = (catId: string) => {
    setSelectedCatId(catId);
    const cat = CATEGORIES.find(c => c.id === catId);
    if (cat && cat.subcategories.length > 0) {
      const sub = cat.subcategories[0];
      setSelectedSubId(sub.id);
      setWidth(sub.defaultWidth);
      setHeight(sub.defaultHeight);
      setDepth(sub.defaultDepth);
      setDoorsCount(sub.hasDoors ? 2 : 0);
      setDrawersCount(sub.hasDrawers ? 2 : 0);
      if (sub.isWetArea) {
        setBoardId("plaswood-15");
      } else {
        setBoardId("hmr-15");
      }
    }
  };

  const handleSubCategoryChange = (subId: string) => {
    setSelectedSubId(subId);
    let sub: SubCategory | undefined;
    for (const c of CATEGORIES) {
      const s = c.subcategories.find(x => x.id === subId);
      if (s) {
        sub = s;
        break;
      }
    }
    if (sub) {
      setWidth(sub.defaultWidth);
      setHeight(sub.defaultHeight);
      setDepth(sub.defaultDepth);
      setDoorsCount(sub.hasDoors ? 2 : 0);
      setDrawersCount(sub.hasDrawers ? 2 : 0);
      if (sub.isWetArea) {
        setBoardId("plaswood-15");
      } else {
        setBoardId("hmr-15");
      }
    }
  };

  const handleReset = () => {
    handleCategoryChange("kitchen");
  };

  // Calculation math in a useMemo
  const boqDetails = useMemo(() => {
    const wM = width / 1000;
    const hM = height / 1000;
    const dM = depth / 1000;

    // Standard cabinet structure surfaces
    const sideArea = 2 * (hM * dM);
    const topBottomArea = 2 * (wM * dM);
    const shelvesArea = 3 * (wM * dM); // assumes average 3 shelves inside
    const backArea = hM * wM;

    let totalAreaM2 = sideArea + topBottomArea + shelvesArea + backArea;
    
    // Geometry Adjustments per SubCategory
    if (selectedSubId === "b-bed") {
      // Bed box: Sides 2 * Width * Height + Top board (Width * Depth)
      totalAreaM2 = 2 * (wM * 0.4) + 2 * (dM * 0.4) + (wM * dM);
    } else if (selectedSubId === "l-partition") {
      // Partition: Grids/slats. Estimate area as height * width
      totalAreaM2 = hM * wM * 0.5;
    } else if (selectedSubId === "b-panel") {
      // Wall Panel: face area plus 15% framework structure
      totalAreaM2 = hM * wM * 1.15;
    } else if (selectedSubId === "k-fridge") {
      // Fridge enclosure: 2 sides (Height * Depth) + 1 top (Width * Depth)
      totalAreaM2 = 2 * (hM * dM) + (wM * dM);
    }

    const boardCoverage = 2.97; // 1.22m x 2.44m per sheet
    const sheetsNeeded = Math.max(1, Math.ceil(totalAreaM2 / boardCoverage));

    // Exterior finishing sheet coverage (usually 60% of total wood area)
    const exteriorArea = totalAreaM2 * 0.6;
    const finishSheetsNeeded = Math.max(1, Math.ceil(exteriorArea / boardCoverage));

    // PVC Edge Banding perimeter
    const edgeLengthM = Math.ceil(2 * hM * 2 + 2 * wM * 2 + 3 * wM * 2);

    // Fitting selections & quantities
    const hingesCount = activeSubCategory.isSliding ? 0 : doorsCount * 3;
    const slidesCount = drawersCount;
    const tracksCount = activeSubCategory.isSliding ? 1 : 0;
    const handlesCount = doorsCount + drawersCount;

    // Door Surface Area (for door finish)
    const doorAreaM2 = activeSubCategory.hasDoors ? (wM * hM) : 0;

    // Prices lookup
    const selectedBoard = boards.find(b => b.id === boardId) || boards[0] || CABINET_BOARDS[0];
    const selectedHinge = hinges.find(h => h.id === hingeId) || hinges[0] || HINGES[0];
    const selectedSlide = slides.find(s => s.id === slideId) || slides[0] || DRAWER_SLIDES[0];
    const selectedTrack = tracks.find(t => t.id === slideTrackId) || tracks[0] || SLIDING_TRACKS[0];
    const selectedHandle = handles.find(h => h.id === handleId) || handles[0] || HANDLES[0];
    const selectedDoorMat = doorMaterials.find(d => d.id === doorMatId) || doorMaterials[0] || DOOR_MATERIALS[0];
    const selectedFinish = finishes.find(f => f.id === finishId) || finishes[0] || CABINET_FINISHES[0];

    // Compute line items cost
    const items = [
      {
        name: `แผ่นโครงตู้: ${selectedBoard.name}`,
        qty: sheetsNeeded,
        unit: selectedBoard.unit,
        price: selectedBoard.price,
        total: sheetsNeeded * selectedBoard.price
      },
      {
        name: `วัสดุปิดผิวตัวตู้: ${selectedFinish.name}`,
        qty: finishSheetsNeeded,
        unit: selectedFinish.unit,
        price: selectedFinish.price,
        total: finishSheetsNeeded * selectedFinish.price
      },
      {
        name: `ขอบขอบ PVC Edge Band (ปิดขอบทำสี)`,
        qty: edgeLengthM,
        unit: "เมตร",
        price: 25,
        total: edgeLengthM * 25
      }
    ];

    if (hingesCount > 0) {
      items.push({
        name: `บานพับถ้วย: ${selectedHinge.name}`,
        qty: hingesCount,
        unit: selectedHinge.unit,
        price: selectedHinge.price,
        total: hingesCount * selectedHinge.price
      });
    }

    if (slidesCount > 0) {
      items.push({
        name: `รางลิ้นชัก: ${selectedSlide.name}`,
        qty: slidesCount,
        unit: selectedSlide.unit,
        price: selectedSlide.price,
        total: slidesCount * selectedSlide.price
      });
    }

    if (tracksCount > 0) {
      items.push({
        name: `รางบานเลื่อน: ${selectedTrack.name}`,
        qty: tracksCount,
        unit: selectedTrack.unit,
        price: selectedTrack.price,
        total: tracksCount * selectedTrack.price
      });
    }

    if (handlesCount > 0) {
      items.push({
        name: `อุปกรณ์เปิดตู้: ${selectedHandle.name}`,
        qty: handlesCount,
        unit: selectedHandle.unit,
        price: selectedHandle.price,
        total: handlesCount * selectedHandle.price
      });
    }

    if (doorAreaM2 > 0) {
      items.push({
        name: `ผิวหน้าบานประตู: ${selectedDoorMat.name}`,
        qty: parseFloat(doorAreaM2.toFixed(2)),
        unit: selectedDoorMat.unit,
        price: selectedDoorMat.price,
        total: Math.ceil(doorAreaM2 * selectedDoorMat.price)
      });
    }

    // Material cost sum
    const materialCostTotal = items.reduce((acc, item) => acc + item.total, 0);

    // Labor cost sum based on complexity of categories
    let baseLabor = 3500;
    if (selectedCatId === "kitchen") {
      baseLabor = 4500;
    } else if (selectedCatId === "bedroom") {
      baseLabor = activeSubCategory.isSliding ? 6000 : 4000;
    } else if (selectedCatId === "living") {
      baseLabor = 3800;
    } else if (selectedCatId === "bathroom") {
      baseLabor = 3000;
    } else if (selectedCatId === "office") {
      baseLabor = 3000;
    } else if (selectedCatId === "laundry") {
      baseLabor = 3500;
    }

    const laborCostTotal = baseLabor + (drawersCount * 500) + (doorsCount * 400);

    // Summing costing
    const totalCost = materialCostTotal + laborCostTotal;
    const sellingPrice = Math.ceil(totalCost * (1 + markupPercent / 100));
    const profitAmount = sellingPrice - totalCost;

    return {
      lineItems: items,
      materialCost: materialCostTotal,
      laborCost: laborCostTotal,
      totalCost,
      sellingPrice,
      profitAmount
    };
  }, [
    selectedCatId,
    selectedSubId,
    width,
    height,
    depth,
    doorsCount,
    drawersCount,
    boardId,
    hingeId,
    slideId,
    slideTrackId,
    handleId,
    doorMatId,
    finishId,
    markupPercent,
    activeSubCategory,
    boards,
    hinges,
    slides,
    tracks,
    handles,
    doorMaterials,
    finishes
  ]);

  // Send to Quotation Builder via temporary localStorage
  const handleSendToQuotation = () => {
    const quotationItem = {
      id: `boq_item_${Date.now()}`,
      name: `${activeCategory.name.split(" (")[0]} - ${activeSubCategory.name.split(" (")[0]} (บิวท์อิน ${width}x${height}x${depth} มม.)`,
      qty: 1,
      price: boqDetails.sellingPrice,
      materialCost: boqDetails.materialCost,
      laborCost: boqDetails.laborCost
    };

    localStorage.setItem("pphome_temp_boq", JSON.stringify(quotationItem));
    alert("ส่งข้อมูลประมาณราคาของชิ้นงานนี้ไปยังตัวสร้างใบเสนอราคาเรียบร้อยแล้ว! สามารถเปิดเมนู 'ใบเสนอราคา' เพื่อนำเข้าสู่บิลใบเสนอราคา");
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        
        {/* Page Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
          <div>
            <h1 className="text-2xl font-black text-primary">คำนวณปริมาณวัสดุไม้ & ฟิตติ้ง (BOQ)</h1>
            <p className="text-xs text-foreground/50 mt-1 font-bold">
              PP HOME ERP • ระบบประเมินแผ่นไม้ อุปกรณ์ฟิตติ้งขอบตกแต่ง และค่าแรงช่างตามขนาดจริง
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsManageModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl border border-gold/30 bg-primary text-xs font-black text-gold hover:bg-primary-light flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
            >
              <Database className="h-4 w-4" />
              <span>จัดการฐานข้อมูลวัสดุ</span>
            </button>
            <button 
              onClick={handleReset}
              className="px-3.5 py-2.5 rounded-xl border border-card-border bg-white text-xs font-black text-primary/70 hover:bg-primary/5 hover:text-gold flex items-center gap-2 cursor-pointer transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>ล้างค่าทั้งหมด</span>
            </button>
          </div>
        </div>

        {/* Main calculation workspace */}
        <div className="flex flex-col xl:flex-row gap-6 text-left select-none">
          
          {/* Left Inputs Panels (60% width) */}
          <div className="flex-1 space-y-6">
            
            {/* Category and Dimensions Selection */}
            <div className="premium-card p-6 space-y-5">
              <div className="border-b border-card-border pb-3 flex items-center gap-2">
                <Layers className="h-4.5 w-4.5 text-gold" />
                <h3 className="text-xs font-black text-primary uppercase tracking-wider">เลือกประเภทเฟอร์นิเจอร์สั่งทำ</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-foreground/45 uppercase">หมวดหมู่หลัก (Category)</label>
                  <select
                    value={selectedCatId}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="premium-input w-full cursor-pointer"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-foreground/45 uppercase">ประเภทชิ้นงานย่อย (Subcategory)</label>
                  <select
                    value={selectedSubId}
                    onChange={(e) => handleSubCategoryChange(e.target.value)}
                    className="premium-input w-full cursor-pointer"
                  >
                    {activeCategory.subcategories.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dimensions specs slider/inputs */}
              <div className="space-y-4 pt-3 border-t border-card-border/60">
                <h4 className="text-[10px] font-black text-primary uppercase tracking-wider">ขนาดระบุสเปคโครงไม้บิวท์อิน (มิลลิเมตร)</h4>
                
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-foreground/50">ความกว้าง (Width)</label>
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(parseInt(e.target.value) || 0)}
                      className="premium-input w-full"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-foreground/50">ความสูง (Height)</label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(parseInt(e.target.value) || 0)}
                      className="premium-input w-full"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-foreground/50">ความลึก (Depth)</label>
                    <input
                      type="number"
                      value={depth}
                      onChange={(e) => setDepth(parseInt(e.target.value) || 0)}
                      className="premium-input w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Conditional doors and drawers */}
              {(activeSubCategory.hasDoors || activeSubCategory.hasDrawers) && (
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-card-border/60 text-xs">
                  {activeSubCategory.hasDoors && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-foreground/45 uppercase">จำนวนบานประตูเปิดตู้ (บาน)</label>
                      <input
                        type="number"
                        value={doorsCount}
                        onChange={(e) => setDoorsCount(parseInt(e.target.value) || 0)}
                        className="premium-input w-full"
                        min="0"
                      />
                    </div>
                  )}
                  {activeSubCategory.hasDrawers && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-foreground/45 uppercase">จำนวนกล่องลิ้นชัก (ลิ้นชัก)</label>
                      <input
                        type="number"
                        value={drawersCount}
                        onChange={(e) => setDrawersCount(parseInt(e.target.value) || 0)}
                        className="premium-input w-full"
                        min="0"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Fittings & materials dropdown parameters database */}
            <div className="premium-card p-6 space-y-5">
              <div className="border-b border-card-border pb-3 flex items-center gap-2">
                <Database className="h-4.5 w-4.5 text-gold" />
                <h3 className="text-xs font-black text-primary uppercase tracking-wider">เลือกเกรดวัสดุไม้ & อุปกรณ์ฟิตติ้ง</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                
                {/* Core Board */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-foreground/45 uppercase">แผ่นไม้โครงสร้างหลัก (Core Board)</label>
                  <select
                    value={boardId}
                    onChange={(e) => setBoardId(e.target.value)}
                    className="premium-input w-full cursor-pointer"
                  >
                    {boards.map(b => (
                      <option key={b.id} value={b.id}>{b.name} (แผ่นละ {b.price} บ.)</option>
                    ))}
                  </select>
                </div>

                {/* Cabinet Finish */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-foreground/45 uppercase">วัสดุปิดผิวตัวตู้ (Exterior Finish)</label>
                  <select
                    value={finishId}
                    onChange={(e) => setFinishId(e.target.value)}
                    className="premium-input w-full cursor-pointer"
                  >
                    {finishes.map(f => (
                      <option key={f.id} value={f.id}>{f.name} ({f.price} บ./หน่วย)</option>
                    ))}
                  </select>
                </div>

                {/* Conditional hinges or sliding tracks */}
                {!activeSubCategory.isSliding && activeSubCategory.hasDoors && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-foreground/45 uppercase">เกรดบานพับถ้วย Soft-Close</label>
                    <select
                      value={hingeId}
                      onChange={(e) => setHingeId(e.target.value)}
                      className="premium-input w-full cursor-pointer"
                    >
                      {hinges.map(h => (
                        <option key={h.id} value={h.id}>{h.name} (ตัวละ {h.price} บ.)</option>
                      ))}
                    </select>
                  </div>
                )}

                {activeSubCategory.isSliding && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-foreground/45 uppercase">เกรดระบบรางบานเลื่อน</label>
                    <select
                      value={slideTrackId}
                      onChange={(e) => setSlideTrackId(e.target.value)}
                      className="premium-input w-full cursor-pointer"
                    >
                      {tracks.map(t => (
                        <option key={t.id} value={t.id}>{t.name} (ชุดละ {t.price} บ.)</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Drawer Slides */}
                {activeSubCategory.hasDrawers && drawersCount > 0 && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-foreground/45 uppercase">เกรดรางลิ้นชัก</label>
                    <select
                      value={slideId}
                      onChange={(e) => setSlideId(e.target.value)}
                      className="premium-input w-full cursor-pointer"
                    >
                      {slides.map(s => (
                        <option key={s.id} value={s.id}>{s.name} (คู่ละ {s.price} บ.)</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Handles */}
                {(activeSubCategory.hasDoors || activeSubCategory.hasDrawers) && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-foreground/45 uppercase">เกรดอุปกรณ์มือจับเปิดตู้</label>
                    <select
                      value={handleId}
                      onChange={(e) => setHandleId(e.target.value)}
                      className="premium-input w-full cursor-pointer"
                    >
                      {handles.map(h => (
                        <option key={h.id} value={h.id}>{h.name} (ชิ้นละ {h.price} บ.)</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Door Materials */}
                {activeSubCategory.hasDoors && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-foreground/45 uppercase">วัสดุผิวหน้าบานประตู</label>
                    <select
                      value={doorMatId}
                      onChange={(e) => setDoorMatId(e.target.value)}
                      className="premium-input w-full cursor-pointer"
                    >
                      {doorMaterials.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.price} บ./ตร.ม.)</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Detailed Cost Breakdown (40% width) */}
          <div className="w-full xl:w-96 shrink-0 space-y-6">
            
            {/* BOQ Tabular ledger Card */}
            <div className="premium-card p-5 space-y-4">
              <div className="border-b border-card-border pb-3 flex items-center justify-between">
                <h4 className="text-xs font-black text-primary tracking-widest uppercase">ประมาณการวัสดุ Wood & Fittings</h4>
                <Printer className="h-4 w-4 text-foreground/40 hover:text-gold cursor-pointer" onClick={() => window.print()} />
              </div>

              {/* Material items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[10px] select-none">
                  <thead>
                    <tr className="border-b border-card-border pb-1.5 text-foreground/45 font-black uppercase">
                      <th className="py-1">รายการวัสดุ</th>
                      <th className="py-1 text-center">จำนวน</th>
                      <th className="py-1 text-right">ราคารวม</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border/40 font-bold text-foreground/75">
                    {boqDetails.lineItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-background/25">
                        <td className="py-1.5 pr-2 leading-snug">{item.name}</td>
                        <td className="py-1.5 text-center text-primary">{item.qty} {item.unit}</td>
                        <td className="py-1.5 text-right font-mono">{item.total.toLocaleString()} บ.</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary pricing calculations */}
              <div className="border-t border-card-border pt-4 space-y-2.5 text-[11px] font-bold text-foreground/50">
                <div className="flex justify-between">
                  <span>ต้นทุนวัสดุรวม (Material Cost)</span>
                  <span className="text-primary">{boqDetails.materialCost.toLocaleString()} บาท</span>
                </div>
                <div className="flex justify-between">
                  <span>ค่าแรงประกอบช่างผลิตหน้างาน</span>
                  <span className="text-primary">{boqDetails.laborCost.toLocaleString()} บาท</span>
                </div>
                <div className="flex justify-between">
                  <span>ต้นทุนรวมผลิตสุทธิ (Net Cost)</span>
                  <span className="text-primary font-extrabold">{boqDetails.totalCost.toLocaleString()} บาท</span>
                </div>
                
                {/* Profit/Markup modifier */}
                <div className="pt-2 border-t border-card-border/40 flex items-center justify-between gap-4">
                  <span className="text-[10px] font-black text-foreground/45 uppercase shrink-0">บวกกำไรประเมิน (%)</span>
                  <div className="flex items-center gap-2 max-w-[120px]">
                    <input
                      type="number"
                      value={markupPercent}
                      onChange={(e) => setMarkupPercent(parseInt(e.target.value) || 0)}
                      className="premium-input py-1 px-2 text-center text-primary font-black"
                      min="0"
                    />
                    <span className="font-black">%</span>
                  </div>
                </div>

                <div className="h-[1px] bg-card-border my-1" />

                <div className="flex justify-between items-center text-xs font-black text-primary">
                  <span>ราคาขายเสนอแนะ (+{markupPercent}%)</span>
                  <span className="text-gold text-sm font-black">{boqDetails.sellingPrice.toLocaleString()} บาท</span>
                </div>
                
                <div className="flex justify-between items-center text-[9px] font-black uppercase text-gold bg-primary/5 p-2 rounded-xl border border-gold/15 mt-2.5">
                  <span>ผลกำไรขั้นต้นประมาณการ</span>
                  <span>{boqDetails.profitAmount.toLocaleString()} บาท</span>
                </div>
              </div>

              {/* ERP operations integration */}
              <div className="pt-4 border-t border-card-border flex flex-col gap-2">
                <button
                  onClick={handleSendToQuotation}
                  className="w-full py-2.5 bg-primary text-gold border border-gold/30 rounded-xl text-xs font-black hover:bg-primary-light transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-primary/10"
                >
                  <ArrowRight className="h-4 w-4" />
                  <span>ส่งข้อมูลประเมินนี้ไปยังใบเสนอราคา</span>
                </button>
              </div>
            </div>

            {/* Informational tip box */}
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex gap-3 text-primary text-[10px] leading-relaxed text-left">
              <Info className="h-5 w-5 text-gold shrink-0 mt-0.5" />
              <div>
                <span className="font-black text-primary block uppercase mb-0.5">การเชื่อมโยงระบบ ERP</span>
                ระบบจะคำนวณปริมาณไม้ แผ่นผิว และราคาฟิตติ้งที่ใช้จริงตามเกรดที่เลือก และบันทึกเป็นค่านำเข้าชั่วคราว คุณสามารถนำไปโหลดใช้เป็นแถวบิลการสั่งผลิตในเมนู **ใบเสนอราคา** ได้ทันที
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Manage Database Modal */}
      {isManageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-card-border w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-left">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-card-border flex justify-between items-center bg-primary text-gold">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                <h2 className="text-sm font-black uppercase tracking-wider">จัดการคลังฐานข้อมูลวัสดุ & อุปกรณ์ฟิตติ้ง</h2>
              </div>
              <button
                onClick={() => {
                  setIsManageModalOpen(false);
                  setEditingItemId(null);
                }}
                className="text-gold/75 hover:text-gold font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              {/* Sidebar - Database Sections */}
              <div className="w-full md:w-56 bg-background/40 border-r border-card-border p-4 flex flex-col gap-1 shrink-0 overflow-y-auto">
                <span className="text-[9px] font-black text-foreground/45 uppercase px-2 mb-2">หมวดข้อมูลหลัก</span>
                {[
                  { id: "boards", name: "แผ่นไม้โครงสร้างหลัก" },
                  { id: "finishes", name: "วัสดุปิดผิวตัวตู้" },
                  { id: "hinges", name: "เกรดบานพับถ้วย" },
                  { id: "tracks", name: "ระบบรางบานเลื่อน" },
                  { id: "slides", name: "เกรดรางลิ้นชัก" },
                  { id: "handles", name: "อุปกรณ์มือจับตู้" },
                  { id: "doorMaterials", name: "วัสดุผิวหน้าบานประตู" }
                ].map(sec => (
                  <button
                    key={sec.id}
                    onClick={() => {
                      setManageSection(sec.id);
                      setEditingItemId(null);
                      setFormName("");
                      setFormPrice(0);
                      setFormUnit("");
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      manageSection === sec.id
                        ? "bg-primary text-gold"
                        : "hover:bg-primary/5 text-primary/75"
                    }`}
                  >
                    {sec.name}
                  </button>
                ))}
                
                <div className="mt-auto pt-4 border-t border-card-border/50">
                  <button
                    onClick={handleResetDatabase}
                    className="w-full py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-black hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>คืนค่าเริ่มต้นทั้งหมด</span>
                  </button>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
                
                {/* Add / Edit Form */}
                <form onSubmit={handleSaveItem} className="bg-background/25 border border-card-border/80 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center gap-2 pb-1 border-b border-card-border/60">
                    <Plus className="h-4 w-4 text-gold" />
                    <h4 className="text-[11px] font-black text-primary uppercase">
                      {editingItemId ? "แก้ไขรายละเอียดรายการ" : "เพิ่มรายการใหม่"}
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-semibold">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-foreground/50">ชื่อรายการวัสดุ</label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="ระบุชื่อเกรด / รุ่น..."
                        className="premium-input w-full"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-foreground/50">ราคาต่อหน่วย (บาท)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formPrice === 0 ? "" : formPrice}
                        onChange={(e) => setFormPrice(parseInt(e.target.value) || 0)}
                        placeholder="ระบุราคา..."
                        className="premium-input w-full"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-foreground/50">หน่วยนับ</label>
                      <input
                        type="text"
                        required
                        value={formUnit}
                        onChange={(e) => setFormUnit(e.target.value)}
                        placeholder="เช่น แผ่น, ชิ้น, คู่, ชุด, ตร.ม."
                        className="premium-input w-full"
                        list="standard-units"
                      />
                      <datalist id="standard-units">
                        <option value="แผ่น" />
                        <option value="ชิ้น" />
                        <option value="คู่" />
                        <option value="ชุด" />
                        <option value="ตร.ม." />
                      </datalist>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    {editingItemId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItemId(null);
                          setFormName("");
                          setFormPrice(0);
                          setFormUnit("");
                        }}
                        className="px-4 py-2 border border-card-border bg-white text-xs font-bold rounded-xl text-foreground/60 hover:bg-background cursor-pointer"
                      >
                        ยกเลิก
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-5 py-2 bg-primary border border-gold/30 text-gold text-xs font-black rounded-xl hover:bg-primary-light transition-colors cursor-pointer"
                    >
                      {editingItemId ? "อัปเดตรายการ" : "เพิ่มลงคลังฐานข้อมูล"}
                    </button>
                  </div>
                </form>

                {/* Items List Table */}
                <div className="space-y-2 flex-1">
                  <h4 className="text-[10px] font-black text-foreground/45 uppercase tracking-wider">รายการทั้งหมดในฐานข้อมูล</h4>
                  <div className="border border-card-border rounded-2xl overflow-hidden bg-white">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-primary/5 border-b border-card-border text-foreground/45 font-black uppercase text-[10px]">
                          <th className="py-2.5 px-4">ชื่อรายการ</th>
                          <th className="py-2.5 px-4 text-center">ราคาต่อหน่วย</th>
                          <th className="py-2.5 px-4 text-center">หน่วยนับ</th>
                          <th className="py-2.5 px-4 text-right">การจัดการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-card-border/40 font-bold text-foreground/75">
                        {activeManageList.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-foreground/35">
                              ไม่มีข้อมูลสำหรับหมวดหมู่นี้
                            </td>
                          </tr>
                        ) : (
                          activeManageList.map(item => (
                            <tr key={item.id} className="hover:bg-background/25">
                              <td className="py-2 px-4 leading-normal">{item.name}</td>
                              <td className="py-2 px-4 text-center font-mono">{item.price.toLocaleString()} บ.</td>
                              <td className="py-2 px-4 text-center text-primary">{item.unit}</td>
                              <td className="py-2 px-4 text-right space-x-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(item)}
                                  className="px-2.5 py-1 text-[10px] border border-card-border bg-white text-primary hover:bg-primary/5 rounded-lg cursor-pointer"
                                >
                                  แก้ไข
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="px-2.5 py-1 text-[10px] border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg cursor-pointer"
                                >
                                  ลบ
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
