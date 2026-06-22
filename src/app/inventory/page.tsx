"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import MainLayout from "@/components/MainLayout";
import { useData } from "../providers";
import Modal from "@/components/Modal";
import { Plus, Search, Box, ChevronRight, QrCode, AlertOctagon, History, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { MaterialItem } from "@/lib/mockData";

function InventoryPageContent() {
  const { materials, updateMaterial } = useData();
  const searchParams = useSearchParams();
  const searchParam = searchParams.get("search");
  const materialIdParam = searchParams.get("materialId");
  const actionParam = searchParams.get("action");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(materials[0]?.id || null);

  useEffect(() => {
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    if (materialIdParam && materials && materials.length > 0) {
      setSelectedMaterialId(materialIdParam);
    } else if (searchParam && materials && materials.length > 0) {
      const matched = materials.find(m => m.name.toLowerCase().includes(searchParam.toLowerCase()));
      if (matched) {
        setSelectedMaterialId(matched.id);
      }
    }
  }, [searchParam, materialIdParam, materials]);
  
  // Transaction Adjust Modal
  const [isOpen, setIsOpen] = useState(false);
  const [actionType, setActionType] = useState<"receive" | "issue" | "adjust">("receive");
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [notes, setNotes] = useState("");

  const activeMaterial = materials.find(m => m.id === selectedMaterialId) || materials[0];

  const handleOpenModal = (type: "receive" | "issue" | "adjust") => {
    setActionType(type);
    setAdjustQty(0);
    setNotes("");
    setIsOpen(true);
  };

  useEffect(() => {
    if (actionParam === "issue") {
      handleOpenModal("issue");
    } else if (actionParam === "receive") {
      handleOpenModal("receive");
    }
  }, [actionParam]);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMaterial || adjustQty <= 0) return;

    let newStock = activeMaterial.stock;
    if (actionType === "receive") {
      newStock += adjustQty;
    } else if (actionType === "issue") {
      newStock = Math.max(0, newStock - adjustQty);
    } else {
      newStock = adjustQty;
    }

    try {
      await updateMaterial(activeMaterial.id, { stock: newStock });
      setIsOpen(false);
      
      // Save Transaction Log mock
      const newLog = {
        type: actionType,
        qty: adjustQty,
        date: new Date().toLocaleDateString("th-TH"),
        notes: notes || "การปรับปรุงคลังสินค้าทั่วไป"
      };
      
      const prevLogs = localStorage.getItem(`pphome_logs_${activeMaterial.id}`) || "[]";
      const parsedLogs = JSON.parse(prevLogs);
      parsedLogs.unshift(newLog);
      localStorage.setItem(`pphome_logs_${activeMaterial.id}`, JSON.stringify(parsedLogs));

    } catch (err) {
      console.error(err);
    }
  };

  // Safe checks for material stock levels
  const isLowStock = (mat: MaterialItem) => mat.stock <= mat.minStock;

  const filteredMaterials = materials.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Retrieve mock logs
  const getLogs = () => {
    if (!activeMaterial) return [];
    const prevLogs = localStorage.getItem(`pphome_logs_${activeMaterial.id}`);
    if (prevLogs) return JSON.parse(prevLogs);
    
    // Default mock logs
    return [
      { type: "receive", qty: 25, date: "15 พ.ค. 2024", notes: "รับเข้าจากร้านค้าวัสดุไทยพัฒนา" },
      { type: "issue", qty: 10, date: "12 พ.ค. 2024", notes: "เบิกไปใช้ตัดงานสั่งทำ JOB-2024-089" },
      { type: "receive", qty: 50, date: "05 พ.ค. 2024", notes: "นำเข้าคลังวัสดุรับสินค้าล็อตหลัก" }
    ];
  };

  const transactionLogs = getLogs();

  return (
    <MainLayout>
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)] select-none text-left">
        
        {/* Left Side: Materials list */}
        <div className="w-full lg:w-96 flex flex-col gap-4 bg-white border border-card-border rounded-2xl p-4 shrink-0 overflow-y-auto">
          <div className="flex items-center justify-between border-b border-card-border pb-2">
            <h3 className="text-xs font-bold text-primary tracking-widest uppercase">รายการสต็อกวัสดุ</h3>
            <span className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100 flex items-center gap-1">
              <AlertOctagon className="h-3 w-3" />
              <span>เตือนวิกฤต {materials.filter(m => isLowStock(m)).length} รายการ</span>
            </span>
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-3.5 flex items-center text-primary/40">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาวัสดุ..."
              className="w-full rounded-xl pl-9 pr-4 py-2 text-xs bg-background border border-card-border text-foreground placeholder:text-foreground/30 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
            {filteredMaterials.map((mat) => {
              const low = isLowStock(mat);
              return (
                <div
                  key={mat.id}
                  onClick={() => setSelectedMaterialId(mat.id)}
                  className={`rounded-xl border p-3.5 cursor-pointer text-left transition-all ${
                    selectedMaterialId === mat.id 
                      ? "bg-primary/5 border-gold text-primary shadow-sm"
                      : "border-card-border hover:border-gold/30 hover:bg-background/20"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold block">{mat.name}</span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded leading-none ${
                      low ? "bg-red-50 border border-red-100 text-red-600" : "bg-primary/5 border border-card-border text-primary-light"
                    }`}>
                      {mat.stock} {mat.unit}
                    </span>
                  </div>
                  {low && (
                    <span className="text-[8px] font-extrabold text-red-500 block mt-1 flex items-center gap-0.5">
                      <AlertOctagon className="h-2.5 w-2.5" />
                      <span>วัสดุต่ำกว่าเกณฑ์ความปลอดภัย</span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Stock Movement History & QR Code */}
        {activeMaterial ? (
          <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2">
            
            {/* Top Detail & Stock actions */}
            <div className="premium-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <span className="text-[9px] font-black text-gold uppercase tracking-wider">รหัสวัสดุ: {activeMaterial.id}</span>
                <h2 className="text-lg font-black text-primary leading-tight">{activeMaterial.name}</h2>
                <p className="text-[11px] text-foreground/50 font-bold">สต็อกปัจจุบัน: <span className={isLowStock(activeMaterial) ? "text-red-500 font-extrabold" : "text-primary"}>{activeMaterial.stock} {activeMaterial.unit}</span> (เกณฑ์ต่ำสุด: {activeMaterial.minStock} {activeMaterial.unit})</p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenModal("receive")}
                  className="px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-700 transition-colors"
                >
                  <ArrowDownLeft className="h-4 w-4 text-white" />
                  <span>รับของเข้า</span>
                </button>
                <button
                  onClick={() => handleOpenModal("issue")}
                  className="px-3.5 py-2 bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-red-600 transition-colors"
                >
                  <ArrowUpRight className="h-4 w-4 text-white" />
                  <span>เบิกชิ้นงาน</span>
                </button>
                <button
                  onClick={() => handleOpenModal("adjust")}
                  className="px-3.5 py-2 bg-primary/5 text-primary border border-card-border rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-primary hover:text-gold transition-all"
                >
                  <span>ปรับสต็อก</span>
                </button>
              </div>
            </div>

            {/* Split layout: QR barcode mockup + stock movements ledger */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* QR and Barcode scan */}
              <div className="premium-card p-6 flex flex-col items-center justify-center text-center gap-4">
                <span className="text-[10px] font-black text-primary tracking-widest uppercase">เครื่องสแกนบาร์โค้ด QR</span>
                <div className="h-28 w-28 bg-[#0F2D24]/5 border border-primary/10 rounded-2xl flex items-center justify-center text-primary/70 relative p-4">
                  <QrCode className="h-full w-full text-primary" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-primary block">QR CODE ID</span>
                  <p className="text-[9px] text-foreground/40 font-mono tracking-wider">pphome-inv-{activeMaterial.id}</p>
                </div>
              </div>

              {/* Transactions logs ledger */}
              <div className="premium-card p-6 md:col-span-2 flex flex-col justify-between">
                <div className="border-b border-card-border pb-3 mb-4 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-primary tracking-widest uppercase flex items-center gap-1.5">
                    <History className="h-4 w-4 text-gold" />
                    <span>ประวัติความเคลื่อนไหวคลัง</span>
                  </h3>
                </div>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {transactionLogs.map((log: any, idx: number) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between border border-card-border p-3 rounded-xl hover:border-gold/25 transition-all text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                          log.type === "receive" 
                            ? "bg-emerald-50 border border-emerald-100 text-emerald-600"
                            : log.type === "issue"
                            ? "bg-red-50 border border-red-100 text-red-500"
                            : "bg-primary/5 border border-card-border text-primary"
                        }`}>
                          {log.type === "receive" ? "+" : "-"}
                        </div>
                        <div className="space-y-0.5 text-left">
                          <span className="text-xs font-bold text-primary block">{log.notes}</span>
                          <span className="text-[9px] text-foreground/40 font-semibold">{log.date}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-xs font-extrabold block ${
                          log.type === "receive" ? "text-emerald-600" : log.type === "issue" ? "text-red-500" : "text-primary"
                        }`}>
                          {log.type === "receive" ? "+" : log.type === "issue" ? "-" : ""}{log.qty}
                        </span>
                        <span className="text-[8px] text-foreground/40 font-semibold uppercase">{activeMaterial.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-card-border bg-white rounded-2xl">
            <Box className="h-10 w-10 text-primary/30 mb-2" />
            <span className="text-sm font-semibold text-primary/50">ยังไม่มีประวัติในคลังสินค้า</span>
          </div>
        )}

      </div>

      {/* Adjust Modal Dialog */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={actionType === "receive" ? "รับวัสดุเพิ่มเข้าคลัง" : actionType === "issue" ? "เบิกจ่ายวัสดุช่างประกอบ" : "ตั้งค่าปริมาณวัสดุใหม่"}
        size="md"
        type="modal"
      >
        <form onSubmit={handleAdjustSubmit} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">ระบุจำนวนสินค้า ({activeMaterial?.unit})</label>
            <input
              type="number"
              value={adjustQty || ""}
              onChange={(e) => setAdjustQty(parseInt(e.target.value) || 0)}
              className="w-full rounded-xl px-4 py-2.5 text-xs bg-background border border-card-border text-foreground focus:outline-none"
              min="1"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">บันทึกช่วยจำ (Notes)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ระบุเหตุผล เช่น สั่งซื้อใหม่, เบิกตัดงานครัว ฯลฯ..."
              rows={2}
              className="w-full rounded-xl px-4 py-2.5 text-xs bg-background border border-card-border text-foreground focus:outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4 select-none">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 rounded-xl border border-card-border bg-background py-2.5 text-xs font-bold text-foreground/60 hover:text-foreground"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-white hover:bg-primary-light transition-all"
            >
              ยืนยันการทำรายการ
            </button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
}

export default function InventoryPage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="flex h-[60vh] w-full items-center justify-center animate-pulse">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent" />
            <span className="text-sm font-semibold text-primary/70">กำลังโหลดข้อมูลคลังสินค้า...</span>
          </div>
        </div>
      </MainLayout>
    }>
      <InventoryPageContent />
    </Suspense>
  );
}
