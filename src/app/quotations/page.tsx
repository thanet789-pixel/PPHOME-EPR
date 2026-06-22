"use client";

import React, { useState, useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import { useData } from "../providers";
import { Plus, Trash2, FileText, Send, CheckCircle2, RefreshCw } from "lucide-react";

interface QuotationItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  materialCost: number;
  laborCost: number;
}

export default function QuotationPage() {
  const { customers } = useData();
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || "");
  const [discount, setDiscount] = useState(0);
  const [vatRate] = useState(7); // Standard 7% VAT
  const [status, setStatus] = useState<"Draft" | "Pending" | "Approved" | "Rejected">("Draft");
  const [version, setVersion] = useState(1);
  const [showInvoiceMock, setShowInvoiceMock] = useState(false);

  // Temporary BOQ import states
  const [tempBOQ, setTempBOQ] = useState<QuotationItem | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const localBOQ = localStorage.getItem("pphome_temp_boq");
    if (localBOQ) {
      try {
        setTempBOQ(JSON.parse(localBOQ));
      } catch (e) {
        console.error("Error reading temp boq", e);
      }
    }
  }, []);

  const handleImportBOQ = () => {
    if (!tempBOQ) return;
    setItems([...items, tempBOQ]);
    localStorage.removeItem("pphome_temp_boq");
    setTempBOQ(null);
    alert("นำเข้ารายการคำนวณ BOQ เข้าสู่ใบเสนอราคาสำเร็จ!");
  };

  const [items, setItems] = useState<QuotationItem[]>([
    { id: "item_1", name: "ตู้ครัวบิวท์อิน โครง HMR หน้าบานไฮกรอส", qty: 1, price: 150000, materialCost: 65000, laborCost: 25000 },
    { id: "item_2", name: "ท็อปเคาน์เตอร์ครัว หินควอตซ์ขาว", qty: 1, price: 65000, materialCost: 35000, laborCost: 10000 },
    { id: "item_3", name: "ตู้เสื้อผ้า Walk-in Closet หน้าบานกระจกชาทอง", qty: 1, price: 120000, materialCost: 50000, laborCost: 18000 }
  ]);

  const handleAddItem = () => {
    const newItem: QuotationItem = {
      id: `item_${Date.now()}`,
      name: "เฟอร์นิเจอร์สั่งทำพิเศษ",
      qty: 1,
      price: 10000,
      materialCost: 4000,
      laborCost: 1500
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof QuotationItem, val: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: val };
        // Auto estimate selling price based on cost plus markups if price is 0
        return updated;
      }
      return item;
    }));
  };

  // Automated pricing math
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const totalMaterialCost = items.reduce((acc, item) => acc + (item.materialCost * item.qty), 0);
  const totalLaborCost = items.reduce((acc, item) => acc + (item.laborCost * item.qty), 0);
  
  const discountAmount = discount;
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const vatAmount = Math.round((afterDiscount * vatRate) / 100);
  const grandTotal = afterDiscount + vatAmount;

  const totalCost = totalMaterialCost + totalLaborCost;
  const profitAmount = grandTotal - vatAmount - totalCost;
  const profitMarginPercent = subtotal > 0 ? Math.round((profitAmount / (grandTotal - vatAmount)) * 100) : 0;

  const selectedCust = customers.find(c => c.id === selectedCustomerId) || customers[0];

  return (
    <MainLayout>
      <div className="flex flex-col lg:flex-row gap-6 select-none text-left">
        
        {/* Left Side: Quotation Builder Form */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Dynamic BOQ Import Banner */}
          {tempBOQ && (
            <div className="p-4 bg-primary text-gold border border-gold/30 rounded-2xl flex items-center justify-between gap-4 fade-in-up text-xs shadow-md">
              <div className="space-y-0.5 text-left">
                <span className="font-black text-white block">💡 ตรวจพบรายการคำนวณวัสดุจาก BOQ Calculator</span>
                <p className="text-white/85 text-[10px]">ชิ้นงาน: {tempBOQ.name} (ราคา {tempBOQ.price.toLocaleString()} บ.)</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { localStorage.removeItem("pphome_temp_boq"); setTempBOQ(null); }}
                  className="px-3 py-1.5 rounded-xl border border-white/20 text-white/70 hover:text-white text-[10px] font-black cursor-pointer"
                >
                  ล้างรายการ
                </button>
                <button
                  type="button"
                  onClick={handleImportBOQ}
                  className="px-3.5 py-1.5 rounded-xl bg-gold text-primary hover:bg-gold/90 text-[10px] font-black cursor-pointer"
                >
                  + นำเข้าใบเสนอราคา
                </button>
              </div>
            </div>
          )}

          {/* Header metadata */}
          <div className="premium-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-card-border pb-3">
              <h3 className="text-sm font-black text-primary flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-gold" />
                <span>ตัวสร้างใบเสนอราคา / สั่งทำเฟอร์นิเจอร์</span>
              </h3>
              <div className="flex items-center gap-2.5 text-[9px] font-extrabold">
                <span className="bg-primary/5 text-primary border border-card-border px-2 py-0.5 rounded">
                  เวอร์ชัน: V{version}.0
                </span>
                <span className={`px-2 py-0.5 rounded border ${
                  status === "Approved" 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : status === "Pending"
                    ? "bg-amber-50 border-amber-200 text-amber-700"
                    : "bg-background border-card-border text-foreground/60"
                }`}>
                  สถานะ: {status === "Draft" ? "ร่างแบบ" : status === "Pending" ? "รออนุมัติ" : status === "Approved" ? "อนุมัติแล้ว" : "ปฏิเสธ"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-foreground/50 uppercase tracking-wider">เลือกข้อมูลลูกค้า</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 bg-background border border-card-border focus:outline-none"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.company ? `(${c.company})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-foreground/50 uppercase tracking-wider">การดำเนินงาน</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setStatus("Pending"); setVersion(v => v + 1); }}
                    className="flex-1 py-2 bg-primary/5 border border-card-border rounded-xl text-[10px] font-extrabold text-primary hover:bg-primary hover:text-gold flex items-center justify-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>ส่งขออนุมัติสั่งผลิต</span>
                  </button>
                  <button
                    onClick={() => { setStatus("Approved"); }}
                    className="flex-1 py-2 bg-primary text-gold border border-gold/30 rounded-xl text-[10px] font-extrabold hover:bg-primary-light flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    <span>อนุมัติชิ้นงาน</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items List */}
          <div className="premium-card p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-card-border pb-3">
              <h4 className="text-xs font-black text-primary tracking-widest uppercase">รายการประเมินราคางานไม้</h4>
              <button
                onClick={handleAddItem}
                className="btn-primary text-[10px] py-1.5 px-3 rounded-lg"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>เพิ่มรายการ</span>
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div 
                  key={item.id} 
                  className="rounded-xl border border-card-border p-4 space-y-3 hover:border-gold/30 transition-all relative group"
                >
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="absolute top-4 right-4 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    title="ลบรายการ"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[8px] font-bold text-foreground/40 uppercase">ชื่อรายการ / ข้อมูลบิ้วท์อิน</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdateItem(item.id, "name", e.target.value)}
                        className="w-full rounded-lg px-2.5 py-1.5 bg-background border border-card-border focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-foreground/40 uppercase">จำนวน (ชิ้น/ชุด)</label>
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) => handleUpdateItem(item.id, "qty", parseInt(e.target.value) || 0)}
                        className="w-full rounded-lg px-2.5 py-1.5 bg-background border border-card-border focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-[10px] font-semibold text-foreground/70">
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-foreground/40 uppercase">ค่าวัสดุประเมิน (บาท)</label>
                      <input
                        type="number"
                        value={item.materialCost}
                        onChange={(e) => handleUpdateItem(item.id, "materialCost", parseFloat(e.target.value) || 0)}
                        className="w-full rounded-lg px-2.5 py-1.5 bg-background border border-card-border focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-foreground/40 uppercase">ค่าแรงประกอบช่าง (บาท)</label>
                      <input
                        type="number"
                        value={item.laborCost}
                        onChange={(e) => handleUpdateItem(item.id, "laborCost", parseFloat(e.target.value) || 0)}
                        className="w-full rounded-lg px-2.5 py-1.5 bg-background border border-card-border focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-foreground/40 uppercase">ราคาเสนอขาย (บาท)</label>
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => handleUpdateItem(item.id, "price", parseFloat(e.target.value) || 0)}
                        className="w-full rounded-lg px-2.5 py-1.5 bg-background border border-card-border focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side: Financial Margins & Invoice Preview */}
        <div className="w-full lg:w-96 flex flex-col gap-6 shrink-0">
          
          {/* Summary Math Panel */}
          <div className="premium-card p-6 space-y-4">
            <h4 className="text-xs font-black text-primary tracking-widest uppercase border-b border-card-border pb-3">สรุปงบการเงินการผลิต</h4>
            
            <div className="space-y-2 text-xs font-semibold text-foreground/70">
              <div className="flex justify-between">
                <span>ราคารวมทั้งหมด (Subtotal)</span>
                <span className="text-primary">{subtotal.toLocaleString()} บาท</span>
              </div>
              <div className="flex justify-between items-center">
                <span>ส่วนลดพิเศษ (บาท)</span>
                <input
                  type="number"
                  value={discount || ""}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-24 text-right rounded-lg px-2 py-1 bg-background border border-card-border focus:outline-none text-xs"
                />
              </div>
              <div className="flex justify-between">
                <span>ภาษีมูลค่าเพิ่ม (VAT {vatRate}%)</span>
                <span className="text-primary">{vatAmount.toLocaleString()} บาท</span>
              </div>
              <div className="h-[1px] bg-card-border my-1" />
              <div className="flex justify-between text-sm font-black text-primary">
                <span>ยอดเงินสุทธิ (Grand Total)</span>
                <span className="text-gold">{grandTotal.toLocaleString()} บาท</span>
              </div>
            </div>

            <div className="border-t border-card-border pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-foreground/50">
                <span>ต้นทุนรวม (วัสดุ + แรง)</span>
                <span>{totalCost.toLocaleString()} บาท</span>
              </div>
              <div className="flex justify-between text-foreground/50">
                <span>กำไรขั้นต้นประเมิน</span>
                <span className="text-emerald-600 font-extrabold">{profitAmount.toLocaleString()} บาท</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-gold bg-primary/5 p-2 rounded-lg border border-gold/15">
                <span>อัตรากำไร (Margin)</span>
                <span>{profitMarginPercent}%</span>
              </div>
            </div>

            <button
              onClick={() => setShowInvoiceMock(true)}
              className="w-full py-2.5 bg-primary text-white hover:bg-primary-light transition-all rounded-xl text-xs font-bold shadow-md shadow-primary/10 flex items-center justify-center gap-1.5"
            >
              <Send className="h-4 w-4 text-gold" />
              <span>พิมพ์ใบเสนอราคา (PDF)</span>
            </button>
          </div>
        </div>

      </div>

      {/* Mock Invoice PDF Overlay */}
      {showInvoiceMock && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 border border-gold/20 flex flex-col justify-between h-[85vh]">
            <div className="space-y-6 overflow-y-auto pr-1">
              
              {/* Invoice Brand header */}
              <div className="flex justify-between border-b border-primary/20 pb-4">
                <div className="text-left space-y-1">
                  <span className="text-base font-black text-primary leading-none uppercase">PP HOME</span>
                  <p className="text-[10px] text-foreground/50">88 Furniture Factory Rd, Bangkok</p>
                  <p className="text-[9px] text-foreground/40">โทร: 02-123-4567 • www.pphomefurniture.com</p>
                </div>
                <div className="text-right space-y-1">
                  <h3 className="text-base font-black text-primary uppercase">ใบเสนอราคา / QUOTATION</h3>
                  <p className="text-[9px] text-foreground/50 font-bold">เลขที่เอกสาร: QT-2024-001</p>
                  <p className="text-[9px] text-foreground/50">วันที่: {new Date().toLocaleDateString("th-TH")}</p>
                </div>
              </div>

              {/* Client Info */}
              <div className="grid grid-cols-2 gap-4 text-left text-xs text-foreground/70">
                <div className="space-y-0.5">
                  <span className="text-[8px] font-black text-foreground/40 uppercase">ผู้เสนอราคา / Estimator</span>
                  <p className="font-extrabold text-primary">PP HOME Estimation Team</p>
                  <p className="text-[10px]">คุณรวิภา สุวรรณ</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[8px] font-black text-foreground/40 uppercase">ลูกค้าผู้รับเสนอราคา / Customer</span>
                  <p className="font-extrabold text-primary">{selectedCust?.name || "คุณลูกค้า"}</p>
                  <p className="text-[10px]">{selectedCust?.company || "บ้านลูกค้า"}</p>
                  <p className="text-[9px] text-foreground/50">{selectedCust?.phone}</p>
                </div>
              </div>

              {/* Invoice Items table */}
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-primary/20 text-primary font-black uppercase text-[10px]">
                    <th className="py-2">รายการบิ้วท์อิน</th>
                    <th className="py-2 text-right">จำนวน</th>
                    <th className="py-2 text-right">ราคาหน่วย</th>
                    <th className="py-2 text-right">ราคารวม (บาท)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border text-foreground/80 font-medium">
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 text-left text-primary font-bold">{item.name}</td>
                      <td className="py-2.5 text-right">{item.qty}</td>
                      <td className="py-2.5 text-right">{item.price.toLocaleString()}</td>
                      <td className="py-2.5 text-right">{(item.price * item.qty).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end pt-4 border-t border-primary/10">
                <div className="w-64 text-xs font-bold text-foreground/70 space-y-1.5 text-right">
                  <div className="flex justify-between">
                    <span>มูลค่าราคารวม (Subtotal):</span>
                    <span>{subtotal.toLocaleString()} บาท</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>ส่วนลดเงินสด (Discount):</span>
                      <span>-{discount.toLocaleString()} บาท</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>ภาษีมูลค่าเพิ่ม (VAT 7%):</span>
                    <span>{vatAmount.toLocaleString()} บาท</span>
                  </div>
                  <div className="h-[1px] bg-primary/20 my-1" />
                  <div className="flex justify-between text-sm font-black text-primary">
                    <span>ยอดสุทธิทั้งสิ้น (Grand Total):</span>
                    <span className="text-gold">{grandTotal.toLocaleString()} บาท</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="flex gap-4 border-t border-card-border pt-4">
              <button
                onClick={() => setShowInvoiceMock(false)}
                className="flex-1 py-2.5 border border-card-border bg-background rounded-xl text-xs font-bold text-foreground/60 hover:text-foreground"
              >
                ปิดหน้าต่าง
              </button>
              <button
                onClick={() => { alert("ส่งอีเมลใบเสนอราคาไปยัง " + selectedCust?.email + " สำเร็จ!"); setShowInvoiceMock(false); }}
                className="flex-1 py-2.5 bg-primary text-gold border border-gold/30 rounded-xl text-xs font-black hover:bg-primary-light"
              >
                ส่งอีเมลให้ลูกค้า
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
