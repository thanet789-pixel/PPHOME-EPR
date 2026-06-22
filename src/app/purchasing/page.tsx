"use client";

import React, { useState, useMemo } from "react";
import MainLayout from "@/components/MainLayout";
import { useData } from "../providers";
import Modal from "@/components/Modal";
import { 
  Plus, Search, ShoppingCart, CheckCircle, Clock, AlertCircle, 
  Printer, Edit3, Trash2, Building, Phone, Mail, FileText, 
  MapPin, PlusCircle, MinusCircle, Check, X, ShieldAlert,
  Calendar, Layers, Coins, CreditCard, LayoutGrid, Table, CheckSquare
} from "lucide-react";
import { Supplier, PurchaseOrder, PurchaseOrderItem, POStatus, TRANSLATE_PO_STATUS } from "@/lib/types";

// Thai Baht Text Converter Helper for Professional PO Invoices
function thaiBahtText(num: number): string {
  if (num === 0) return "ศูนย์บาทถ้วน";
  
  const thNum = ["ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
  const thDigit = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];
  
  const parts = num.toFixed(2).split(".");
  const bahtStr = parts[0];
  const satangStr = parts[1];
  
  let text = "";
  
  const convert = (str: string) => {
    let t = "";
    const len = str.length;
    for (let i = 0; i < len; i++) {
      const n = parseInt(str[i]);
      if (n !== 0) {
        if (i === len - 1 && n === 1 && len > 1 && str[len - 2] !== "0") {
          t += "เอ็ด";
        } else if (i === len - 2 && n === 2) {
          t += "ยี่สิบ";
        } else if (i === len - 2 && n === 1) {
          t += "สิบ";
        } else {
          t += thNum[n] + thDigit[len - 1 - i];
        }
      }
    }
    return t;
  };

  if (bahtStr.length > 6) {
    const millionPart = bahtStr.slice(0, -6);
    const lowerPart = bahtStr.slice(-6);
    text += convert(millionPart) + "ล้าน";
    text += convert(lowerPart);
  } else {
    text += convert(bahtStr);
  }
  
  if (text !== "") text += "บาท";
  
  if (parseInt(satangStr) === 0) {
    text += "ถ้วน";
  } else {
    if (satangStr === "50") {
      text += "ห้าสิบสตางค์";
    } else {
      text += convert(satangStr) + "สตางค์";
    }
  }
  return text;
}

export default function PurchasingPage() {
  const { 
    suppliers, 
    purchaseOrders, 
    projects,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder
  } = useData();

  // Navigation & Search States
  const [activeTab, setActiveTab] = useState<"pos" | "suppliers">("pos");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Advanced Filter States
  const [activeStatusFilter, setActiveStatusFilter] = useState<"All" | POStatus>("All");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<"All" | string>("All");
  const [supplierViewMode, setSupplierViewMode] = useState<"table" | "grid">("grid");

  // Supplier Form Drawer States
  const [isSupplierOpen, setIsSupplierOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [supName, setSupName] = useState("");
  const [supContact, setSupContact] = useState("");
  const [supPhone, setSupPhone] = useState("");
  const [supEmail, setSupEmail] = useState("");
  const [supAddress, setSupAddress] = useState("");
  const [supTaxId, setSupTaxId] = useState("");
  const [supTerms, setSupTerms] = useState("");
  const [supCategory, setSupCategory] = useState("");

  // Purchase Order Form Drawer States
  const [isPOOpen, setIsPOOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [poSupplierId, setPoSupplierId] = useState("");
  const [poProjectId, setPoProjectId] = useState("");
  const [poDate, setPoDate] = useState("");
  const [poDeliveryDate, setPoDeliveryDate] = useState("");
  const [poNotes, setPoNotes] = useState("");
  const [poStatus, setPoStatus] = useState<POStatus>("Draft");
  const [poItems, setPoItems] = useState<Omit<PurchaseOrderItem, "totalPrice">[]>([
    { itemName: "", qty: 1, unit: "หน่วย", pricePerUnit: 0 }
  ]);
  const [poVatToggle, setPoVatToggle] = useState(true); // 7% VAT default
  const [poError, setPoError] = useState<string | null>(null);

  // Printing Overlay & Lightbox States
  const [printPO, setPrintPO] = useState<PurchaseOrder | null>(null);

  // Unique Categories from registered suppliers
  const supplierCategories = useMemo(() => {
    const cats = new Set(suppliers.map(s => s.productCategory.trim()).filter(Boolean));
    return Array.from(cats);
  }, [suppliers]);

  // Calculations for active PO form
  const formSubtotal = useMemo(() => {
    return poItems.reduce((sum, item) => sum + (item.qty * item.pricePerUnit), 0);
  }, [poItems]);

  const formVat = useMemo(() => {
    return poVatToggle ? Math.round(formSubtotal * 0.07 * 100) / 100 : 0;
  }, [formSubtotal, poVatToggle]);

  const formGrandTotal = useMemo(() => {
    return formSubtotal + formVat;
  }, [formSubtotal, formVat]);

  // Purchase Order Metrics for KPI Cards
  const poMetrics = useMemo(() => {
    const total = purchaseOrders.length;
    const pending = purchaseOrders.filter(p => p.status === "Sent").length;
    const delivered = purchaseOrders.filter(p => p.status === "Delivered").length;
    const totalSpend = purchaseOrders
      .filter(p => p.status === "Delivered" || p.status === "Sent")
      .reduce((sum, p) => sum + p.grandTotal, 0);
    return { total, pending, delivered, totalSpend };
  }, [purchaseOrders]);

  // Filtered Suppliers & POs
  const filteredSuppliers = useMemo(() => {
    let result = suppliers;
    const q = searchQuery.toLowerCase().trim();
    
    if (q) {
      result = result.filter(s => 
        s.name.toLowerCase().includes(q) ||
        s.contactPerson.toLowerCase().includes(q) ||
        s.productCategory.toLowerCase().includes(q) ||
        s.taxId.includes(q)
      );
    }
    
    if (activeCategoryFilter !== "All") {
      result = result.filter(s => s.productCategory.trim() === activeCategoryFilter);
    }
    
    return result;
  }, [suppliers, searchQuery, activeCategoryFilter]);

  const filteredPOs = useMemo(() => {
    let result = purchaseOrders;
    const q = searchQuery.toLowerCase().trim();
    
    if (q) {
      result = result.filter(po => 
        po.id.toLowerCase().includes(q) ||
        po.supplierName.toLowerCase().includes(q) ||
        (po.projectName && po.projectName.toLowerCase().includes(q))
      );
    }

    if (activeStatusFilter !== "All") {
      result = result.filter(po => po.status === activeStatusFilter);
    }
    
    return result;
  }, [purchaseOrders, searchQuery, activeStatusFilter]);

  // Supplier Form Handlers
  const handleOpenSupplierDrawer = (sup: Supplier | null = null) => {
    if (sup) {
      setSelectedSupplier(sup);
      setSupName(sup.name);
      setSupContact(sup.contactPerson);
      setSupPhone(sup.phone);
      setSupEmail(sup.email);
      setSupAddress(sup.address);
      setSupTaxId(sup.taxId);
      setSupTerms(sup.paymentTerms);
      setSupCategory(sup.productCategory);
    } else {
      setSelectedSupplier(null);
      setSupName("");
      setSupContact("");
      setSupPhone("");
      setSupEmail("");
      setSupAddress("");
      setSupTaxId("");
      setSupTerms("เครดิต 30 วัน");
      setSupCategory("");
    }
    setIsSupplierOpen(true);
  };

  const handleSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName || !supContact || !supPhone || !supTaxId || !supCategory) {
      alert("กรุณากรอกข้อมูลคู่ค้าที่จำเป็นให้ครบถ้วน");
      return;
    }

    const payload = {
      name: supName,
      contactPerson: supContact,
      phone: supPhone,
      email: supEmail,
      address: supAddress,
      taxId: supTaxId,
      paymentTerms: supTerms,
      productCategory: supCategory
    };

    try {
      if (selectedSupplier) {
        await updateSupplier(selectedSupplier.id, payload);
        alert("แก้ไขข้อมูลคู่ค้าสำเร็จ!");
      } else {
        await addSupplier(payload);
        alert("ลงทะเบียนคู่ค้าใหม่สำเร็จ!");
      }
      setIsSupplierOpen(false);
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  const handleDeleteSupplier = async (id: string, name: string) => {
    if (confirm(`⚠️ ยืนยันการลบข้อมูลคู่ค้า "${name}"? ข้อมูลสั่งซื้อเก่าทั้งหมดจะยังคงอยู่ แต่คู่ค้านี้จะถูกถอดออกจากระบบตัวเลือก`)) {
      try {
        await deleteSupplier(id);
        alert("ลบข้อมูลคู่ค้าสำเร็จ!");
      } catch (err) {
        console.error(err);
        alert("เกิดข้อผิดพลาดในการลบ");
      }
    }
  };

  // PO Form Handlers
  const handleOpenPODrawer = (po: PurchaseOrder | null = null) => {
    setPoError(null);
    if (po) {
      setSelectedPO(po);
      setPoSupplierId(po.supplierId);
      setPoProjectId(po.projectAssociatedId || "");
      setPoDate(po.date);
      setPoDeliveryDate(po.deliveryDate);
      setPoNotes(po.notes || "");
      setPoStatus(po.status);
      setPoVatToggle(po.vatRate > 0);
      setPoItems(po.items.map(item => ({
        itemName: item.itemName,
        qty: item.qty,
        unit: item.unit,
        pricePerUnit: item.pricePerUnit
      })));
    } else {
      setSelectedPO(null);
      setPoSupplierId(suppliers[0]?.id || "");
      setPoProjectId("");
      setPoDate(new Date().toISOString().split("T")[0]);
      setPoDeliveryDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
      setPoNotes("");
      setPoStatus("Draft");
      setPoVatToggle(true);
      setPoItems([{ itemName: "", qty: 1, unit: "หน่วย", pricePerUnit: 0 }]);
    }
    setIsPOOpen(true);
  };

  const handleAddPOItem = () => {
    setPoItems([...poItems, { itemName: "", qty: 1, unit: "หน่วย", pricePerUnit: 0 }]);
  };

  const handleRemovePOItem = (idx: number) => {
    if (poItems.length === 1) return;
    setPoItems(poItems.filter((_, i) => i !== idx));
  };

  const handlePOItemChange = (idx: number, field: keyof Omit<PurchaseOrderItem, "totalPrice">, val: any) => {
    const updated = poItems.map((item, i) => {
      if (i === idx) {
        return { ...item, [field]: val };
      }
      return item;
    });
    setPoItems(updated);
  };

  const handlePOSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPoError(null);

    if (!poSupplierId || !poDate || !poDeliveryDate) {
      setPoError("กรุณากรอกข้อมูลวันที่และเลือกซัพพลายเออร์คู่ค้า");
      return;
    }

    // Validate items
    const hasEmptyItem = poItems.some(item => !item.itemName.trim() || item.qty <= 0 || item.pricePerUnit < 0);
    if (hasEmptyItem) {
      setPoError("กรุณาระบุรายละเอียดรายการและราคาต่อหน่วยให้ถูกต้องในทุกช่อง");
      return;
    }

    const selectedSup = suppliers.find(s => s.id === poSupplierId);
    if (!selectedSup) {
      setPoError("ไม่พบข้อมูลซัพพลายเออร์ที่เลือก");
      return;
    }

    const selectedProj = projects.find(p => p.id === poProjectId);

    const itemsPayload: PurchaseOrderItem[] = poItems.map(item => ({
      itemName: item.itemName,
      qty: item.qty,
      unit: item.unit,
      pricePerUnit: item.pricePerUnit,
      totalPrice: item.qty * item.pricePerUnit
    }));

    const payload = {
      supplierId: poSupplierId,
      supplierName: selectedSup.name,
      projectAssociatedId: poProjectId || undefined,
      projectName: selectedProj ? selectedProj.name : undefined,
      items: itemsPayload,
      subtotal: formSubtotal,
      vatRate: poVatToggle ? 7 : 0,
      vatAmount: formVat,
      grandTotal: formGrandTotal,
      status: poStatus,
      date: poDate,
      deliveryDate: poDeliveryDate,
      notes: poNotes || undefined
    };

    try {
      if (selectedPO) {
        await updatePurchaseOrder(selectedPO.id, payload);
        alert("แก้ไขใบสั่งจัดซื้อ PO สำเร็จ!");
      } else {
        await addPurchaseOrder(payload);
        alert("สร้างใบสั่งจัดซื้อ PO ใหม่ในฐานข้อมูลสำเร็จ!");
      }
      setIsPOOpen(false);
    } catch (err: any) {
      setPoError(err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูลจัดซื้อ");
    }
  };

  const handleQuickReceivePO = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("📦 ยืนยันการรับสินค้าเข้าสต็อกตามใบจัดซื้อนี้? ระบบจะทำการอัปเดตจำนวนวัสดุในคลังให้ทันที")) {
      try {
        await updatePurchaseOrder(id, { status: "Delivered" });
        alert("รับสินค้าเข้าสู่คลังวัสดุสำเร็จ!");
      } catch (err) {
        console.error(err);
        alert("เกิดข้อผิดพลาดในการนำเข้าสต็อก");
      }
    }
  };

  const handleDeletePO = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`⚠️ คุณแน่ใจหรือว่าต้องการลบใบสั่งซื้อ PO "${id}"? การลบนี้ไม่สามารถย้อนคืนได้`)) {
      try {
        await deletePurchaseOrder(id);
        alert("ลบใบสั่งซื้อ PO สำเร็จ!");
      } catch (err) {
        console.error(err);
        alert("เกิดข้อผิดพลาดในการลบใบสั่งซื้อ");
      }
    }
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <MainLayout>
      {/* Printable Area Wrapper for browser print stylesheet injection */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          nav, aside, header, button, .no-print, .kpi-card {
            display: none !important;
          }
          .print-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            color: black !important;
          }
          table {
            border-collapse: collapse !important;
          }
          th, td {
            border: 1px solid #ddd !important;
            padding: 8px !important;
          }
        }
      `}</style>

      <div className="flex flex-col gap-6 text-left select-none no-print">
        
        {/* Title Section */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-card-border/60 pb-4">
          <div>
            <h1 className="text-2xl font-black text-primary tracking-tight">ระบบบริหารงานจัดซื้อและซัพพลายเออร์</h1>
            <p className="text-xs text-foreground/45 font-bold mt-0.5">ออกใบสั่งจัดซื้อวัสดุ (Purchase Order) บันทึกรายรับสินค้าเข้าคลัง และจัดการรายชื่อบริษัทคู่ค้า</p>
          </div>

          {/* Action buttons based on active tab */}
          <div>
            {activeTab === "pos" ? (
              <button
                onClick={() => handleOpenPODrawer(null)}
                className="px-5 py-2.5 bg-primary text-gold border border-gold/30 rounded-xl text-xs font-black hover:bg-primary-light transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Plus className="h-4.5 w-4.5 text-gold" />
                <span>สร้างใบสั่งจัดซื้อวัสดุ (PO)</span>
              </button>
            ) : (
              <button
                onClick={() => handleOpenSupplierDrawer(null)}
                className="px-5 py-2.5 bg-primary text-gold border border-gold/30 rounded-xl text-xs font-black hover:bg-primary-light transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Plus className="h-4.5 w-4.5 text-gold" />
                <span>ลงทะเบียนคู่ค้าใหม่ (Supplier)</span>
              </button>
            )}
          </div>
        </div>

        {/* KPI Metrics Dashboard Cards */}
        {activeTab === "pos" ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 kpi-card">
            {/* Card 1: Total POs */}
            <div 
              onClick={() => setActiveStatusFilter("All")}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                activeStatusFilter === "All"
                  ? "bg-primary border-gold text-gold shadow-md"
                  : "bg-white border-card-border text-foreground hover:border-primary/45"
              }`}
            >
              <div className="flex justify-between items-start">
                <span className={`text-[10px] font-black uppercase tracking-wider ${activeStatusFilter === "All" ? "text-gold/60" : "text-foreground/50"}`}>ใบสั่งจัดซื้อทั้งหมด</span>
                <ShoppingCart className={`h-4.5 w-4.5 ${activeStatusFilter === "All" ? "text-gold" : "text-primary/60"}`} />
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-black">{poMetrics.total}</span>
                <span className="text-[10px] font-bold opacity-60">ฉบับ</span>
              </div>
            </div>

            {/* Card 2: Sent/Pending */}
            <div 
              onClick={() => setActiveStatusFilter("Sent")}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                activeStatusFilter === "Sent"
                  ? "bg-primary border-gold text-gold shadow-md"
                  : "bg-white border-card-border text-foreground hover:border-primary/45"
              }`}
            >
              <div className="flex justify-between items-start">
                <span className={`text-[10px] font-black uppercase tracking-wider ${activeStatusFilter === "Sent" ? "text-gold/60" : "text-foreground/50"}`}>อยู่ระหว่างจัดส่ง (Sent)</span>
                <Clock className="h-4.5 w-4.5 text-blue-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className={`text-2xl font-black ${activeStatusFilter === "Sent" ? "text-gold" : "text-blue-600"}`}>{poMetrics.pending}</span>
                <span className="text-[10px] font-bold opacity-60">ฉบับ</span>
              </div>
            </div>

            {/* Card 3: Delivered */}
            <div 
              onClick={() => setActiveStatusFilter("Delivered")}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                activeStatusFilter === "Delivered"
                  ? "bg-primary border-gold text-gold shadow-md"
                  : "bg-white border-card-border text-foreground hover:border-primary/45"
              }`}
            >
              <div className="flex justify-between items-start">
                <span className={`text-[10px] font-black uppercase tracking-wider ${activeStatusFilter === "Delivered" ? "text-gold/60" : "text-foreground/50"}`}>รับเข้าสต็อกแล้ว (Received)</span>
                <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className={`text-2xl font-black ${activeStatusFilter === "Delivered" ? "text-gold" : "text-emerald-600"}`}>{poMetrics.delivered}</span>
                <span className="text-[10px] font-bold opacity-60">ฉบับ</span>
              </div>
            </div>

            {/* Card 4: Total Spend */}
            <div className="p-4 rounded-2xl border bg-white border-card-border text-foreground">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black text-foreground/50 uppercase tracking-wider">มูลค่าจัดซื้อสะสม (Delivered & Sent)</span>
                <Coins className="h-4.5 w-4.5 text-gold" />
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-xl font-black text-primary">{poMetrics.totalSpend.toLocaleString()}</span>
                <span className="text-[10px] font-bold text-foreground/45">บาท</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 kpi-card">
            {/* Card 1: Suppliers Count */}
            <div className="p-4 rounded-2xl border bg-white border-card-border text-foreground">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black text-foreground/50 uppercase tracking-wider">คู่ค้าจดทะเบียนสะสม</span>
                <Building className="h-4.5 w-4.5 text-primary/60" />
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-primary">{suppliers.length}</span>
                <span className="text-[10px] font-bold text-foreground/45">ราย</span>
              </div>
            </div>

            {/* Card 2: Categories Count */}
            <div className="p-4 rounded-2xl border bg-white border-card-border text-foreground">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black text-foreground/50 uppercase tracking-wider">หมวดหมู่กลุ่มวัสดุหลัก</span>
                <Layers className="h-4.5 w-4.5 text-primary/60" />
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-primary">
                  {supplierCategories.length}
                </span>
                <span className="text-[10px] font-bold text-foreground/45">ประเภท</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Controls, Search Bar, and Toggles */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white/80 backdrop-blur-md rounded-2xl border border-card-border p-4 shadow-sm">
          {/* Tab Switchers */}
          <div className="flex bg-zinc-100 rounded-xl p-1 shadow-sm border border-card-border/50 shrink-0">
            <button
              onClick={() => {
                setActiveTab("pos");
                setSearchQuery("");
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "pos"
                  ? "bg-primary text-gold shadow"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>ใบสั่งจัดซื้อวัสดุ (POs)</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("suppliers");
                setSearchQuery("");
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "suppliers"
                  ? "bg-primary text-gold shadow"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              <Building className="h-3.5 w-3.5" />
              <span>ซัพพลายเออร์คู่ค้า (Suppliers)</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto md:flex-1 md:max-w-md">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-3.5 flex items-center text-primary/40">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === "pos" ? "ค้นหารหัส PO, คู่ค้า หรือโครงการ..." : "ค้นหาซัพพลายเออร์, ผู้ติดต่อ, หรือหมวดหมู่..."}
                className="w-full rounded-xl pl-9 pr-4 py-2 text-xs bg-background border border-card-border/60 text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary text-xs"
              />
            </div>
            
            {/* View Grid/Table Toggle for Suppliers tab */}
            {activeTab === "suppliers" && (
              <div className="flex bg-zinc-100 rounded-lg p-0.5 border border-card-border/50 shrink-0">
                <button
                  onClick={() => setSupplierViewMode("grid")}
                  className={`p-1.5 rounded-md cursor-pointer transition-all ${
                    supplierViewMode === "grid" ? "bg-white text-primary shadow-sm" : "text-foreground/45 hover:text-foreground"
                  }`}
                  title="ดูแบบการ์ด"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setSupplierViewMode("table")}
                  className={`p-1.5 rounded-md cursor-pointer transition-all ${
                    supplierViewMode === "table" ? "bg-white text-primary shadow-sm" : "text-foreground/45 hover:text-foreground"
                  }`}
                  title="ดูแบบตาราง"
                >
                  <Table className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab content 1: Purchase Orders list */}
        {activeTab === "pos" && (
          <div className="space-y-4">
            
            {/* PO Status Tabs bar */}
            <div className="flex flex-wrap gap-1.5 border-b border-card-border/50 pb-2 text-[10px] font-black uppercase tracking-wider">
              <button
                onClick={() => setActiveStatusFilter("All")}
                className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  activeStatusFilter === "All"
                    ? "bg-primary border-primary text-gold shadow-sm"
                    : "bg-white border-card-border text-foreground/50 hover:bg-zinc-50"
                }`}
              >
                ทั้งหมด ({purchaseOrders.length})
              </button>
              <button
                onClick={() => setActiveStatusFilter("Draft")}
                className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  activeStatusFilter === "Draft"
                    ? "bg-amber-600 border-amber-600 text-white shadow-sm"
                    : "bg-white border-card-border text-foreground/50 hover:bg-zinc-50"
                }`}
              >
                📝 ร่างใบสั่งซื้อ ({purchaseOrders.filter(p => p.status === "Draft").length})
              </button>
              <button
                onClick={() => setActiveStatusFilter("Sent")}
                className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  activeStatusFilter === "Sent"
                    ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                    : "bg-white border-card-border text-foreground/50 hover:bg-zinc-50"
                }`}
              >
                🚚 สั่งซื้อแล้ว ({purchaseOrders.filter(p => p.status === "Sent").length})
              </button>
              <button
                onClick={() => setActiveStatusFilter("Delivered")}
                className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  activeStatusFilter === "Delivered"
                    ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                    : "bg-white border-card-border text-foreground/50 hover:bg-zinc-50"
                }`}
              >
                ✅ ได้รับสินค้าแล้ว ({purchaseOrders.filter(p => p.status === "Delivered").length})
              </button>
              <button
                onClick={() => setActiveStatusFilter("Cancelled")}
                className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  activeStatusFilter === "Cancelled"
                    ? "bg-rose-600 border-rose-600 text-white shadow-sm"
                    : "bg-white border-card-border text-foreground/50 hover:bg-zinc-50"
                }`}
              >
                ❌ ยกเลิกแล้ว ({purchaseOrders.filter(p => p.status === "Cancelled").length})
              </button>
            </div>

            {/* PO Ledger Table */}
            <div className="bg-white rounded-2xl border border-card-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs min-w-[950px]">
                  <thead>
                    <tr className="border-b border-card-border bg-[#0f2d24]/5 text-primary font-black uppercase text-xs tracking-wider">
                      <th className="px-5 py-3.5">หมายเลข PO & วันที่ออก</th>
                      <th className="px-4 py-3.5">ซัพพลายเออร์คู่ค้า</th>
                      <th className="px-4 py-3.5">โครงการที่เชื่อมโยง</th>
                      <th className="px-4 py-3.5 text-center">รายการวัสดุ</th>
                      <th className="px-4 py-3.5 text-right">ยอดรวมสุทธิ (บาท)</th>
                      <th className="px-4 py-3.5 text-center">สถานะเอกสาร</th>
                      <th className="px-5 py-3.5 text-right">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border text-foreground/80 font-medium">
                    {filteredPOs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-foreground/30 italic">
                          ❌ ไม่พบข้อมูลใบสั่งจัดซื้อตามเงื่อนไขที่เลือก
                        </td>
                      </tr>
                    ) : (
                      filteredPOs.map((po) => {
                        const totalItemsCount = po.items.reduce((sum, item) => sum + item.qty, 0);
                        return (
                          <tr 
                            key={po.id} 
                            onClick={() => setPrintPO(po)}
                            className="hover:bg-background/40 transition-colors cursor-pointer"
                          >
                            {/* PO ID & Date */}
                            <td className="px-5 py-3.5">
                              <span className="text-sm font-black text-primary block leading-none">{po.id}</span>
                              <span className="text-xs text-foreground/45 font-bold block mt-1.5">{po.date}</span>
                            </td>
                            
                            {/* Supplier */}
                            <td className="px-4 py-3.5 text-sm font-black text-foreground/85">
                              {po.supplierName}
                            </td>

                            {/* Linked Project */}
                            <td className="px-4 py-3.5">
                              {po.projectName ? (
                                <span className="px-2.5 py-1 rounded bg-primary/5 text-primary border border-primary/10 text-xs font-black block w-fit">
                                  📁 {po.projectName}
                                </span>
                              ) : (
                                <span className="text-foreground/30 italic text-xs">ไม่ได้ผูกกับโครงการ</span>
                              )}
                            </td>

                            {/* Item count */}
                            <td className="px-4 py-3.5 text-center font-mono font-bold text-foreground/60 text-xs">
                              <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-foreground/60 border border-zinc-200/80 mr-1">{po.items.length} รายการ</span>
                              <span>({totalItemsCount} ชิ้น)</span>
                            </td>

                            {/* Grand Total */}
                            <td className="px-4 py-3.5 text-right font-mono font-black text-primary text-sm">
                              {po.grandTotal.toLocaleString()} บาท
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3.5 text-center">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-black ${
                                po.status === "Delivered"
                                  ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                                  : po.status === "Sent"
                                  ? "bg-blue-50 border-blue-100 text-blue-700"
                                  : po.status === "Cancelled"
                                  ? "bg-rose-50 border-rose-100 text-rose-700"
                                  : "bg-amber-50 border-amber-100 text-amber-700"
                              }`}>
                                {po.status === "Delivered" && <CheckCircle className="h-3 w-3" />}
                                {po.status === "Sent" && <Clock className="h-3 w-3" />}
                                {po.status === "Draft" && <AlertCircle className="h-3 w-3" />}
                                <span>{TRANSLATE_PO_STATUS[po.status]}</span>
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex justify-end items-center gap-1.5">
                                {po.status === "Sent" && (
                                  <button
                                    onClick={(e) => handleQuickReceivePO(po.id, e)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black cursor-pointer shadow-sm transition-colors"
                                    title="ตรวจรับสินค้าเข้าคลัง"
                                  >
                                    รับเข้าคลัง
                                  </button>
                                )}
                                <button
                                  onClick={() => setPrintPO(po)}
                                  className="h-7 w-7 rounded-lg bg-primary/5 text-primary border border-card-border flex items-center justify-center hover:bg-primary hover:text-gold cursor-pointer"
                                  title="ดูรายละเอียด / พิมพ์"
                                >
                                  <Printer className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleOpenPODrawer(po)}
                                  className="h-7 w-7 rounded-lg bg-primary/5 text-primary border border-card-border flex items-center justify-center hover:bg-primary hover:text-gold cursor-pointer"
                                  title="แก้ไข"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={(e) => handleDeletePO(po.id, e)}
                                  className="h-7 w-7 rounded-lg bg-red-50 text-red-500 border border-red-100 flex items-center justify-center hover:bg-red-500 hover:text-white cursor-pointer"
                                  title="ลบ"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab content 2: Suppliers Directory */}
        {activeTab === "suppliers" && (
          <div className="space-y-4">
            
            {/* Supplier Category quick buttons bar */}
            <div className="flex flex-wrap gap-1.5 border-b border-card-border/50 pb-2 text-[10px] font-black uppercase tracking-wider">
              <button
                onClick={() => setActiveCategoryFilter("All")}
                className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  activeCategoryFilter === "All"
                    ? "bg-primary border-primary text-gold shadow-sm"
                    : "bg-white border-card-border text-foreground/50 hover:bg-zinc-50"
                }`}
              >
                ทั้งหมด ({suppliers.length})
              </button>
              {supplierCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    activeCategoryFilter === cat
                      ? "bg-primary border-primary text-gold shadow-sm"
                      : "bg-white border-card-border text-foreground/50 hover:bg-zinc-50"
                  }`}
                >
                  ⚙️ {cat} ({suppliers.filter(s => s.productCategory.trim() === cat).length})
                </button>
              ))}
            </div>

            {/* Visual Grid mode rendering */}
            {supplierViewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSuppliers.length === 0 ? (
                  <div className="col-span-full bg-white rounded-2xl border border-card-border p-12 text-center text-foreground/30 italic">
                    ❌ ไม่พบรายชื่อคู่ค้าตามหมวดหมู่หรือคำค้นหาที่เลือก
                  </div>
                ) : (
                  filteredSuppliers.map((sup) => (
                    <div 
                      key={sup.id}
                      onClick={() => handleOpenSupplierDrawer(sup)}
                      className="bg-white rounded-2xl border border-card-border p-4 shadow-sm hover:shadow-md hover:border-gold/30 transition-all cursor-pointer flex flex-col justify-between group gap-4 text-xs"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="px-2 py-0.5 rounded bg-primary/5 text-primary border border-primary/10 text-[9px] font-black uppercase tracking-wider block w-fit mb-1.5">
                              ⚙️ {sup.productCategory}
                            </span>
                            <h3 className="text-sm font-black text-[#0f2d24] group-hover:text-gold transition-colors">{sup.name}</h3>
                          </div>
                          <span className="h-7 w-7 rounded-full bg-primary/5 text-primary flex items-center justify-center border border-card-border shrink-0 font-bold">
                            PO
                          </span>
                        </div>

                        {/* Details grid inside card */}
                        <div className="space-y-1.5 text-foreground/75 leading-relaxed pt-1.5 border-t border-card-border/60">
                          <div><strong>ผู้ประสานงานหลัก:</strong> {sup.contactPerson}</div>
                          <div><strong>เลขผู้เสียภาษี:</strong> <span className="font-mono">{sup.taxId}</span></div>
                          <div className="flex items-center gap-1.5">
                            <strong>เบอร์โทรศัพท์:</strong> 
                            <a href={`tel:${sup.phone}`} onClick={e => e.stopPropagation()} className="text-primary font-bold hover:underline">{sup.phone}</a>
                          </div>
                          {sup.email && (
                            <div className="truncate"><strong>อีเมลบิล:</strong> {sup.email}</div>
                          )}
                          {sup.address && (
                            <div className="text-[10px] text-foreground/45 mt-1 leading-normal line-clamp-2">
                              <strong>ที่อยู่:</strong> {sup.address}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card bottom actions */}
                      <div className="flex justify-between items-center border-t border-card-border/60 pt-2.5 mt-1 text-[11px] font-bold text-primary">
                        <span>เงื่อนไข: {sup.paymentTerms}</span>
                        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpenSupplierDrawer(sup)}
                            className="h-6.5 w-6.5 rounded bg-zinc-50 border border-card-border text-foreground/60 hover:bg-primary hover:text-gold flex items-center justify-center cursor-pointer"
                            title="แก้ไขข้อมูล"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSupplier(sup.id, sup.name)}
                            className="h-6.5 w-6.5 rounded bg-red-50 text-red-500 border border-red-100 flex items-center justify-center hover:bg-red-500 hover:text-white cursor-pointer"
                            title="ลบ"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              /* Traditional Table mode rendering */
              <div className="bg-white rounded-2xl border border-card-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-xs min-w-[950px]">
                    <thead>
                      <tr className="border-b border-card-border bg-[#0f2d24]/5 text-primary font-black uppercase text-xs tracking-wider">
                        <th className="px-5 py-3.5">ซัพพลายเออร์คู่ค้า / ผู้ติดต่อ</th>
                        <th className="px-4 py-3.5">หมวดหมู่สินค้า</th>
                        <th className="px-4 py-3.5">ข้อมูลการติดต่อ</th>
                        <th className="px-4 py-3.5">เลขผู้เสียภาษี</th>
                        <th className="px-4 py-3.5">เงื่อนไขการค้า (Terms)</th>
                        <th className="px-5 py-3.5 text-right">การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-card-border text-foreground/80 font-medium">
                      {filteredSuppliers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-foreground/30 italic">
                            ❌ ไม่พบข้อมูลคู่ค้าที่ค้นหา
                          </td>
                        </tr>
                      ) : (
                        filteredSuppliers.map((sup) => (
                          <tr 
                            key={sup.id} 
                            onClick={() => handleOpenSupplierDrawer(sup)}
                            className="hover:bg-background/40 transition-colors cursor-pointer"
                          >
                            <td className="px-5 py-3">
                              <span className="text-sm font-black text-primary block leading-none">{sup.name}</span>
                              <span className="text-xs text-foreground/45 font-bold block mt-1.5">ผู้ติดต่อ: {sup.contactPerson}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2.5 py-0.5 rounded-lg border text-xs font-black bg-gold/10 text-primary border-gold/20">
                                ⚙️ {sup.productCategory}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-left">
                              <div className="flex items-center gap-1.5 text-foreground/70">
                                <Phone className="h-3 w-3 text-primary/45" />
                                <a href={`tel:${sup.phone}`} onClick={e => e.stopPropagation()} className="hover:text-primary hover:underline">{sup.phone}</a>
                              </div>
                              {sup.email && (
                                <div className="flex items-center gap-1.5 text-foreground/45 text-[10px] mt-1 font-semibold">
                                  <Mail className="h-3 w-3 text-primary/40" />
                                  <a href={`mailto:${sup.email}`} onClick={e => e.stopPropagation()} className="hover:text-primary hover:underline">{sup.email}</a>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 font-mono text-foreground/60 text-xs font-bold">
                              {sup.taxId}
                            </td>
                            <td className="px-4 py-3 text-xs text-primary font-bold">
                              {sup.paymentTerms}
                            </td>
                            <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenSupplierDrawer(sup)}
                                  className="h-6.5 w-6.5 rounded bg-primary/5 text-primary border border-card-border flex items-center justify-center hover:bg-primary hover:text-gold cursor-pointer"
                                  title="แก้ไข"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSupplier(sup.id, sup.name)}
                                  className="h-6.5 w-6.5 rounded bg-red-50 text-red-500 border border-red-100 flex items-center justify-center hover:bg-red-500 hover:text-white cursor-pointer"
                                  title="ลบ"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* 1. Supplier Add/Edit Drawer Modal */}
      <Modal
        isOpen={isSupplierOpen}
        onClose={() => setIsSupplierOpen(false)}
        title={selectedSupplier ? `✏️ แก้ไขข้อมูลคู่ค้า: ${selectedSupplier.name}` : "ลงทะเบียนซัพพลายเออร์/คู่ค้าใหม่"}
        size="md"
        type="drawer"
      >
        <form onSubmit={handleSupplierSubmit} className="space-y-4 text-left text-zinc-300 pb-8">
          <div className="space-y-4 border border-zinc-800 p-4 rounded-2xl bg-zinc-900/20 text-xs font-semibold">
            <h4 className="text-xs font-black text-gold border-b border-zinc-800/80 pb-2 flex items-center gap-1.5">
              <Building className="h-4 w-4 text-gold" />
              <span>ข้อมูลนิติบุคคลและผู้ติดต่อ</span>
            </h4>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">ชื่อบริษัทคู่ค้า (ภาษาไทย) *</label>
              <input
                type="text"
                value={supName}
                onChange={(e) => setSupName(e.target.value)}
                placeholder="เช่น บริษัท ไม้อัดไทยพัฒนา จำกัด"
                className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-gold"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">ชื่อผู้ประสานงานหลัก *</label>
                <input
                  type="text"
                  value={supContact}
                  onChange={(e) => setSupContact(e.target.value)}
                  placeholder="เช่น คุณวิชัย"
                  className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-gold"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">เลขผู้เสียภาษี (13 หลัก) *</label>
                <input
                  type="text"
                  value={supTaxId}
                  onChange={(e) => setSupTaxId(e.target.value)}
                  placeholder="เช่น 0105530123456"
                  maxLength={13}
                  className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-gold font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">เบอร์โทรศัพท์ติดต่อ *</label>
                <input
                  type="text"
                  value={supPhone}
                  onChange={(e) => setSupPhone(e.target.value)}
                  placeholder="เช่น 02-555-0199"
                  className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-gold"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">อีเมลสำหรับส่ง PO</label>
                <input
                  type="email"
                  value={supEmail}
                  onChange={(e) => setSupEmail(e.target.value)}
                  placeholder="sales@company.com"
                  className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">เงื่อนไขการชำระเงิน (Terms)</label>
                <select
                  value={supTerms}
                  onChange={(e) => setSupTerms(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none cursor-pointer"
                >
                  <option value="เครดิต 30 วัน">เครดิต 30 วัน</option>
                  <option value="เครดิต 15 วัน">เครดิต 15 วัน</option>
                  <option value="มัดจำ 50% / จ่ายงวดสุดท้าย">มัดจำ 50% / จ่ายงวดสุดท้าย</option>
                  <option value="โอนสด / จ่ายก่อนส่งของ">โอนสด / จ่ายก่อนส่งของ</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">หมวดหมู่สินค้าหลัก *</label>
                <input
                  type="text"
                  value={supCategory}
                  onChange={(e) => setSupCategory(e.target.value)}
                  placeholder="เช่น ฟิตติ้ง, สีพ่น, ไม้โครง"
                  className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-gold"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">ที่อยู่สำนักงาน / ที่อยู่จัดส่งบิล</label>
              <textarea
                value={supAddress}
                onChange={(e) => setSupAddress(e.target.value)}
                placeholder="บ้านเลขที่, แขวง, เขต, จังหวัด, รหัสไปรษณีย์"
                rows={3}
                className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-gold resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 text-center select-none">
            <button
              type="button"
              onClick={() => setIsSupplierOpen(false)}
              className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-400 text-xs font-bold hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-primary border border-gold/30 text-xs font-black text-gold hover:bg-primary-light transition-all cursor-pointer"
            >
              🚀 ยืนยันบันทึกข้อมูล
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. Purchase Order Creator/Edit Drawer Modal */}
      <Modal
        isOpen={isPOOpen}
        onClose={() => setIsPOOpen(false)}
        title={selectedPO ? `✏️ แก้ไขใบสั่งซื้อ: ${selectedPO.id}` : "สร้างใบเสนอสั่งจัดซื้อวัสดุ (Purchase Order)"}
        size="lg"
        type="drawer"
      >
        <form onSubmit={handlePOSubmit} className="space-y-4 text-left text-zinc-300 pb-8">
          {poError && (
            <div className="rounded-xl bg-red-950/20 border border-red-500/30 p-3 text-xs text-red-400 font-bold">
              ⚠️ {poError}
            </div>
          )}

          {/* Section 1: Header details */}
          <div className="space-y-4 border border-zinc-800 p-4 rounded-2xl bg-zinc-900/20 text-xs font-semibold">
            <h4 className="text-xs font-black text-gold border-b border-zinc-800/80 pb-2 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-gold" />
              <span>ส่วนที่ 1: ข้อมูลใบสั่งซื้อหลัก</span>
            </h4>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">เลือกผู้ค้าซัพพลายเออร์ *</label>
              {suppliers.length === 0 ? (
                <div className="text-rose-400 text-[10px] font-bold py-1">
                  ⚠️ ยังไม่ได้ลงทะเบียนคู่ค้า กรุณาไปลงทะเบียนในแถบคู่ค้าก่อนสร้างใบสั่งซื้อ
                </div>
              ) : (
                <select
                  value={poSupplierId}
                  onChange={(e) => setPoSupplierId(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none cursor-pointer"
                  required
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.productCategory})</option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">วันที่เอกสาร *</label>
                <input
                  type="date"
                  value={poDate}
                  onChange={(e) => setPoDate(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">กำหนดการส่งมอบ *</label>
                <input
                  type="date"
                  value={poDeliveryDate}
                  onChange={(e) => setPoDeliveryDate(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">เชื่อมโยงไปยังโครงการ (Project)</label>
                <select
                  value={poProjectId}
                  onChange={(e) => setPoProjectId(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none cursor-pointer"
                >
                  <option value="">ไม่ได้ระบุ (ซื้อของเข้าคลังส่วนกลาง)</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">สถานะใบสั่งซื้อ *</label>
                <select
                  value={poStatus}
                  onChange={(e) => setPoStatus(e.target.value as POStatus)}
                  className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none cursor-pointer"
                  required
                >
                  <option value="Draft">ร่างใบสั่งจัดซื้อ (Draft)</option>
                  <option value="Sent">สั่งซื้อแล้ว / อยู่ระหว่างส่งของ (Sent)</option>
                  <option value="Delivered">ได้รับของเรียบร้อย / เข้าสต็อก (Delivered)</option>
                  <option value="Cancelled">ยกเลิกรายการสั่งจัดซื้อ (Cancelled)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">หมายเหตุจัดส่ง / ข้อความแจ้งซัพพลายเออร์</label>
              <input
                type="text"
                value={poNotes}
                onChange={(e) => setPoNotes(e.target.value)}
                placeholder="เช่น ให้จัดส่งหน้างาน Penthouse สุขุมวิท โทรประสานงานก่อนส่ง 1 ชม."
                className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2: PO Line Items */}
          <div className="space-y-4 border border-zinc-800 p-4 rounded-2xl bg-zinc-900/20 text-xs font-semibold">
            <div className="flex justify-between items-center border-b border-zinc-800/80 pb-2">
              <h4 className="text-xs font-black text-gold flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-gold" />
                <span>ส่วนที่ 2: รายการจัดซื้อวัสดุ ({poItems.length} รายการ)</span>
              </h4>
              <button
                type="button"
                onClick={handleAddPOItem}
                className="flex items-center gap-1 text-[10px] font-black text-gold hover:text-amber-300 transition-colors cursor-pointer bg-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-700"
              >
                <PlusCircle className="h-3.5 w-3.5 text-gold" />
                <span>เพิ่มสินค้า</span>
              </button>
            </div>

            {/* Clear Columns Headers Layout */}
            <div className="grid grid-cols-12 gap-2 text-[9px] font-black text-zinc-500 uppercase tracking-wider pb-1 pr-9 no-print">
              <div className="col-span-1 text-center">ลำดับ</div>
              <div className="col-span-5">รายละเอียดวัสดุ/สินค้า</div>
              <div className="col-span-2 text-center">จำนวน</div>
              <div className="col-span-2">หน่วย</div>
              <div className="col-span-2 text-right">ราคา/หน่วย</div>
            </div>

            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {poItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center border-b border-zinc-800/40 pb-2">
                  {/* Item Index */}
                  <span className="col-span-1 text-[10px] text-zinc-400 font-black text-center">{idx + 1}</span>
                  
                  {/* Item Name */}
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={item.itemName}
                      onChange={(e) => handlePOItemChange(idx, "itemName", e.target.value)}
                      placeholder="เช่น ไม้อัด HMR 15mm หรือ บานพับ Metalla"
                      className="w-full rounded-xl px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none"
                      required
                    />
                  </div>

                  {/* Quantity */}
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.qty}
                      onChange={(e) => handlePOItemChange(idx, "qty", parseInt(e.target.value) || 0)}
                      className="w-full rounded-xl px-2 py-1.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none font-mono text-center"
                      min="1"
                      required
                    />
                  </div>

                  {/* Unit */}
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => handlePOItemChange(idx, "unit", e.target.value)}
                      placeholder="เช่น แผ่น, ชิ้น"
                      className="w-full rounded-xl px-2 py-1.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none"
                      required
                    />
                  </div>

                  {/* Price per unit */}
                  <div className="col-span-2 relative flex items-center gap-1">
                    <input
                      type="number"
                      value={item.pricePerUnit}
                      onChange={(e) => handlePOItemChange(idx, "pricePerUnit", parseFloat(e.target.value) || 0)}
                      className="w-full rounded-xl px-2.5 py-1.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none font-mono text-right"
                      min="0"
                      required
                    />
                    
                    {/* Delete row */}
                    {poItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePOItem(idx)}
                        className="text-rose-500 hover:text-rose-400 cursor-pointer p-1"
                        title="ลบแถวนี้"
                      >
                        <MinusCircle className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Ledger Summaries and Toggles */}
          <div className="space-y-3 border border-zinc-800 p-4 rounded-2xl bg-zinc-900/20 text-xs font-semibold">
            <h4 className="text-xs font-black text-gold border-b border-zinc-800/80 pb-2 flex items-center gap-1.5">
              <Coins className="h-4 w-4 text-gold" />
              <span>ส่วนที่ 3: สรุปงบการเงินจัดซื้อ</span>
            </h4>

            <div className="flex justify-between items-center py-1">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">คำนวณภาษีมูลค่าเพิ่ม (VAT 7%):</span>
                <button
                  type="button"
                  onClick={() => setPoVatToggle(!poVatToggle)}
                  className={`w-9 h-5 rounded-full transition-colors cursor-pointer relative ${
                    poVatToggle ? "bg-gold" : "bg-zinc-700"
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-zinc-950 transition-transform ${
                    poVatToggle ? "translate-x-4" : ""
                  }`} />
                </button>
              </div>
              <span className="text-zinc-500 text-[10px] italic">ภาษีคิดจากยอดสุทธิสะสม</span>
            </div>

            <div className="flex justify-between border-b border-zinc-800/60 pb-1.5">
              <span className="text-zinc-400">ราคาสินค้ารวม (Subtotal):</span>
              <span className="font-mono font-bold text-white">{formSubtotal.toLocaleString()} บาท</span>
            </div>
            <div className="flex justify-between border-b border-zinc-800/60 pb-1.5">
              <span className="text-zinc-400">ภาษีมูลค่าเพิ่ม (VAT {poVatToggle ? "7%" : "0%"}):</span>
              <span className="font-mono font-bold text-white">+{formVat.toLocaleString()} บาท</span>
            </div>
            <div className="flex justify-between items-center text-sm font-black pt-1">
              <span className="text-gold">ยอดเงินสุทธิสั่งจ่าย (Grand Total):</span>
              <span className="font-mono text-gold text-base">{formGrandTotal.toLocaleString()} บาท</span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 text-center select-none">
            <button
              type="button"
              onClick={() => setIsPOOpen(false)}
              className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-400 text-xs font-bold hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-primary border border-gold/30 text-xs font-black text-gold hover:bg-primary-light transition-all cursor-pointer"
            >
              ✍️ ออกใบสั่งจัดซื้อ / อัปเดต PO
            </button>
          </div>
        </form>
      </Modal>

      {/* 3. Printable Invoice Overlay Sheet (A4 PDF Form) */}
      {printPO && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto no-print">
          
          {/* Main Overlay Frame */}
          <div className="w-full max-w-4xl bg-white text-black rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
            
            {/* Top Toolbar (Non-printable) */}
            <div className="bg-zinc-900 text-white px-6 py-3 flex justify-between items-center border-b border-zinc-800 shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4.5 w-4.5 text-gold" />
                <span className="text-xs font-black">พิมพ์เอกสารทางการ Purchase Order ใบจัดซื้อวัสดุ</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleTriggerPrint}
                  className="px-4 py-1.5 bg-primary hover:bg-primary-light text-gold border border-gold/30 rounded-lg text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>พิมพ์เอกสาร / บันทึก PDF</span>
                </button>
                <button
                  onClick={() => setPrintPO(null)}
                  className="h-8 w-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Document sheet area (optimized for printing) */}
            <div className="flex-1 overflow-y-auto bg-zinc-100 p-6 flex justify-center">
              
              {/* Actual paper sheet layout */}
              <div 
                id="print-section"
                className="print-container w-full max-w-[800px] bg-white border border-zinc-200 shadow-md p-8 text-left text-xs font-medium text-black leading-relaxed relative flex flex-col justify-between"
                style={{ minHeight: "1123px", fontFamily: "sans-serif" }} // A4 proportions
              >
                
                {/* Header Content */}
                <div className="space-y-6">
                  {/* Top Letterhead */}
                  <div className="flex justify-between items-start border-b-2 border-primary pb-5">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded bg-[#0F2D24] text-white flex items-center justify-center font-serif text-lg font-black tracking-widest border border-amber-400">
                          PP
                        </div>
                        <div>
                          <h2 className="text-base font-black tracking-tight text-[#0F2D24]">บริษัท พีพี โฮม บิวท์อิน จำกัด</h2>
                          <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider leading-none">PP HOME BUILT-IN CO., LTD.</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-semibold max-w-sm pt-1 leading-normal">
                        สำนักงานใหญ่: 888 ซอยรามคำแหง 53 แขวงพลับพลา เขตวังทองหลาง กรุงเทพมหานคร 10310 <br />
                        เลขประจำตัวผู้เสียภาษีอากร: 0105566123456 | โทรศัพท์: 081-888-9999
                      </p>
                    </div>
                    
                    <div className="text-right space-y-1">
                      <h1 className="text-lg font-black tracking-widest text-[#0F2D24] uppercase border-b border-[#0F2D24] pb-1">ใบสั่งซื้อวัสดุ</h1>
                      <h2 className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">PURCHASE ORDER</h2>
                      <div className="text-[10px] pt-2 space-y-0.5">
                        <div><strong className="text-zinc-700">เลขที่ PO:</strong> <span className="font-mono font-bold">{printPO.id}</span></div>
                        <div><strong className="text-zinc-700">วันที่สั่งซื้อ:</strong> <span className="font-mono">{printPO.date}</span></div>
                        <div><strong className="text-zinc-700">กำหนดส่งของ:</strong> <span className="font-mono font-bold text-[#0F2D24]">{printPO.deliveryDate}</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Supplier & Delivery Address Grid */}
                  <div className="grid grid-cols-2 gap-6 text-[10px] border-b border-zinc-200 pb-5">
                    {/* Supplier details */}
                    <div className="space-y-1.5 border-r border-zinc-100 pr-4">
                      <h3 className="font-black text-[#0F2D24] border-b border-zinc-100 pb-0.5 uppercase tracking-wide">ผู้ขาย (VENDOR)</h3>
                      <p className="font-bold text-sm text-zinc-800 leading-tight">{printPO.supplierName}</p>
                      {(() => {
                        const vendor = suppliers.find(s => s.id === printPO.supplierId);
                        return (
                          <div className="space-y-0.5 text-zinc-600">
                            <div><strong>ที่อยู่:</strong> {vendor?.address || "ไม่ได้บันทึกที่อยู่คู่ค้า"}</div>
                            <div><strong>ผู้ติดต่อ:</strong> {vendor?.contactPerson}</div>
                            <div><strong>เบอร์โทรศัพท์:</strong> {vendor?.phone} | <strong>อีเมล:</strong> {vendor?.email || "-"}</div>
                            <div><strong>เลขผู้เสียภาษี:</strong> <span className="font-mono">{vendor?.taxId}</span></div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Delivery / Shipping details */}
                    <div className="space-y-1.5 pl-2">
                      <h3 className="font-black text-[#0F2D24] border-b border-zinc-100 pb-0.5 uppercase tracking-wide">สถานที่จัดส่งวัสดุ (SHIP TO)</h3>
                      <p className="font-bold text-zinc-800 leading-tight">หน้างานโครงการของบริษัท</p>
                      <div className="space-y-0.5 text-zinc-600">
                        {printPO.projectName ? (
                          <>
                            <div><strong>โครงการเชื่อมโยง:</strong> <span className="text-primary font-bold">{printPO.projectName}</span></div>
                            {(() => {
                              const proj = projects.find(p => p.id === printPO.projectAssociatedId);
                              return proj ? (
                                <div><strong>ที่อยู่จัดส่ง:</strong> {proj.description || "จัดส่งตามหน้างานโครงการ"}</div>
                              ) : (
                                <div><strong>ที่อยู่จัดส่ง:</strong> จัดส่งหน้างานบิวท์อินของลูกค้าโครงการ</div>
                              );
                            })()}
                          </>
                        ) : (
                          <>
                            <div><strong>จัดส่ง:</strong> คลังสินค้าส่วนกลาง บริษัท พีพี โฮม จำกัด</div>
                            <div><strong>ที่อยู่จัดส่ง:</strong> 888 ซอยรามคำแหง 53 แขวงพลับพลา เขตวังทองหลาง กรุงเทพฯ 10310</div>
                          </>
                        )}
                        <div className="pt-1.5"><strong className="text-zinc-800">หมายเหตุสำคัญ:</strong> {printPO.notes || "กรุณาตรวจสอบของและโทรประสานงานล่วงหน้า"}</div>
                      </div>
                    </div>
                  </div>

                  {/* Items List Table */}
                  <div className="space-y-2">
                    <table className="w-full border border-zinc-300 text-[10px] leading-tight">
                      <thead>
                        <tr className="bg-zinc-50 border-b border-zinc-300 text-zinc-700 font-bold text-center">
                          <th className="py-2 px-3 w-10 text-center border-r border-zinc-300">ลำดับ</th>
                          <th className="py-2 px-3 text-left border-r border-zinc-300">รายการสินค้า / วัสดุ (Description)</th>
                          <th className="py-2 px-3 w-16 border-r border-zinc-300">จำนวน</th>
                          <th className="py-2 px-3 w-16 border-r border-zinc-300">หน่วย</th>
                          <th className="py-2 px-3 w-24 text-right border-r border-zinc-300">ราคา/หน่วย</th>
                          <th className="py-2 px-3 w-28 text-right">รวมเป็นเงิน</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 text-zinc-700">
                        {printPO.items.map((item, idx) => (
                          <tr key={idx} className="align-middle">
                            <td className="py-2 px-3 text-center border-r border-zinc-300 font-mono">{idx + 1}</td>
                            <td className="py-2 px-3 border-r border-zinc-300 font-bold text-zinc-800">{item.itemName}</td>
                            <td className="py-2 px-3 text-center border-r border-zinc-300 font-mono">{item.qty}</td>
                            <td className="py-2 px-3 text-center border-r border-zinc-300">{item.unit}</td>
                            <td className="py-2 px-3 text-right border-r border-zinc-300 font-mono">{item.pricePerUnit.toLocaleString()}</td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-zinc-900">{item.totalPrice.toLocaleString()}</td>
                          </tr>
                        ))}
                        
                        {/* Empty padding rows to look like real PO paper */}
                        {printPO.items.length < 8 && Array.from({ length: 8 - printPO.items.length }).map((_, i) => (
                          <tr key={`pad-${i}`} className="h-8">
                            <td className="border-r border-zinc-300">&nbsp;</td>
                            <td className="border-r border-zinc-300">&nbsp;</td>
                            <td className="border-r border-zinc-300">&nbsp;</td>
                            <td className="border-r border-zinc-300">&nbsp;</td>
                            <td className="border-r border-zinc-300">&nbsp;</td>
                            <td>&nbsp;</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Calculations & Baht Text Summary */}
                  <div className="flex justify-between items-start pt-2 border-t border-zinc-200">
                    {/* Baht Text String */}
                    <div className="border border-zinc-300 px-4 py-2.5 rounded bg-zinc-50 max-w-md w-full min-h-[42px] flex items-center">
                      <span className="text-[10px] font-bold text-zinc-700">
                        ตัวอักษร: ({thaiBahtText(printPO.grandTotal)})
                      </span>
                    </div>

                    {/* Financial Summaries table */}
                    <div className="w-64 space-y-1.5 text-[10px] pr-2 text-zinc-700">
                      <div className="flex justify-between">
                        <span>ราคารวมสินค้า (Subtotal):</span>
                        <span className="font-mono font-bold">{printPO.subtotal.toLocaleString()} บ.</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ภาษีมูลค่าเพิ่ม (VAT {printPO.vatRate}%):</span>
                        <span className="font-mono font-bold">+{printPO.vatAmount.toLocaleString()} บ.</span>
                      </div>
                      <div className="flex justify-between border-t border-zinc-300 pt-1.5 font-black text-sm text-[#0F2D24]">
                        <span>ยอดเงินสุทธิ (Grand Total):</span>
                        <span className="font-mono">{printPO.grandTotal.toLocaleString()} บ.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Signatures Area */}
                <div className="space-y-6 pt-10">
                  {/* Terms and conditions */}
                  <div className="border border-zinc-200 p-2.5 rounded text-[9px] text-zinc-500 leading-normal">
                    <strong>เงื่อนไขการค้าและส่งมอบ:</strong> <br />
                    1. กรุณาส่งของตามวันที่และสถานที่ตามระบุในใบ PO นี้อย่างเคร่งครัด <br />
                    2. การชำระเงินจะดำเนินการตามเงื่อนไขเครดิต <span className="font-bold text-zinc-700">({(() => {
                      const vendor = suppliers.find(s => s.id === printPO.supplierId);
                      return vendor?.paymentTerms || "โอนเงินสด";
                    })()})</span> หลังจากการตรวจรับของหน้างานเสร็จสิ้นพร้อมใบส่งของที่ถูกต้องเรียบร้อยแล้ว
                  </div>

                  {/* Authorized Signatures Layout */}
                  <div className="grid grid-cols-3 gap-4 pt-4 text-[9px] text-center text-zinc-600">
                    <div className="space-y-10 border border-zinc-200 p-4 rounded bg-zinc-50/50">
                      <span>ผู้จัดทำ / PREPARED BY</span>
                      <div className="space-y-1">
                        <div className="h-[1px] bg-zinc-300 mx-auto w-32" />
                        <div>(......................................................)</div>
                        <div className="text-[8px] text-zinc-400 font-bold">วันที่: ....../......./.......</div>
                      </div>
                    </div>
                    
                    <div className="space-y-10 border border-zinc-200 p-4 rounded bg-zinc-50/50">
                      <span>ผู้ตรวจสอบ / CHECKED BY</span>
                      <div className="space-y-1">
                        <div className="h-[1px] bg-zinc-300 mx-auto w-32" />
                        <div>(......................................................)</div>
                        <div className="text-[8px] text-zinc-400 font-bold">วันที่: ....../......./.......</div>
                      </div>
                    </div>

                    <div className="space-y-10 border border-zinc-200 p-4 rounded bg-zinc-50/50">
                      <span className="font-black text-primary">ผู้อนุมัติสั่งซื้อ / AUTHORIZED BY</span>
                      <div className="space-y-1">
                        <div className="h-[1px] bg-zinc-300 mx-auto w-32" />
                        <div>(......................................................)</div>
                        <div className="text-[8px] text-zinc-400 font-bold">วันที่: ....../......./.......</div>
                      </div>
                    </div>
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
