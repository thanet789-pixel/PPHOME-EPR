"use client";

import React, { useState } from "react";
import MainLayout from "@/components/MainLayout";
import { useData } from "../providers";
import Modal from "@/components/Modal";
import { 
  Plus, 
  Search, 
  CreditCard, 
  Calendar, 
  Check, 
  Clock, 
  AlertCircle, 
  Edit3, 
  Trash2,
  CalendarCheck
} from "lucide-react";
import { Payment, PaymentStatus, PaymentType, TRANSLATE_PAYMENT_STATUS, TRANSLATE_PAYMENT_TYPE } from "@/lib/types";

export default function PaymentsPage() {
  const { payments, projects, addPayment, updatePayment, deletePayment } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Drawer/Form State
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Form Fields
  const [projectId, setProjectId] = useState("");
  const [amount, setAmount] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<PaymentStatus>("Pending");
  const [type, setType] = useState<PaymentType>("Deposit");
  const [paidDate, setPaidDate] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const handleOpenDrawer = (pay: Payment | null = null) => {
    if (pay) {
      setSelectedPayment(pay);
      setProjectId(pay.projectId);
      setAmount(pay.amount);
      setDueDate(pay.dueDate);
      setStatus(pay.status);
      setType(pay.type);
      setPaidDate(pay.paidDate || "");
    } else {
      setSelectedPayment(null);
      setProjectId(projects[0]?.id || "");
      setAmount(0);
      setDueDate(new Date().toISOString().split("T")[0]);
      setStatus("Pending");
      setType("Deposit");
      setPaidDate("");
    }
    setFormError(null);
    setIsOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsOpen(false);
    setSelectedPayment(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || amount <= 0 || !dueDate || !type) {
      setFormError("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }

    const selectedProj = projects.find((p) => p.id === projectId);
    if (!selectedProj) {
      setFormError("โครงการที่เลือกไม่ถูกต้อง");
      return;
    }

    try {
      const dataPayload = {
        projectId,
        projectName: selectedProj.name,
        customerId: selectedProj.customerId,
        customerName: selectedProj.customerName.split(" (")[0], // Keep simple name
        amount,
        dueDate,
        status,
        type,
        paidDate: status === "Paid" ? (paidDate || new Date().toISOString().split("T")[0]) : null
      };

      if (selectedPayment) {
        await updatePayment(selectedPayment.id, dataPayload);
      } else {
        await addPayment(dataPayload);
      }
      handleCloseDrawer();
    } catch (err: any) {
      setFormError(err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูลการชำระเงิน");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการงวดชำระนี้? ยอดรวมการจ่ายเงินของโปรเจกต์จะถูกคำนวณใหม่โดยอัตโนมัติ")) {
      try {
        await deletePayment(id);
      } catch (err) {
        console.error("Failed to delete payment:", err);
      }
    }
  };

  const handleQuickPaid = async (pay: Payment) => {
    try {
      await updatePayment(pay.id, {
        status: "Paid",
        paidDate: new Date().toISOString().split("T")[0]
      });
    } catch (err) {
      console.error("Failed to quick clear payment:", err);
    }
  };

  // Filter Matching
  const filteredPayments = payments.filter((pay) => {
    const matchesSearch = pay.projectName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          pay.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter !== "All") {
      matchesStatus = pay.status === statusFilter;
    }
    
    return matchesSearch && matchesStatus;
  });

  const statusBadge = (s: PaymentStatus) => {
    switch (s) {
      case "Paid":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Overdue":
        return "bg-red-50 text-red-600 border-red-100 animate-pulse";
      default:
        return "bg-amber-50 text-amber-700 border-amber-100";
    }
  };

  return (
    <MainLayout>
      {/* 1. FILTERS, SEARCH & TRIGGER BUTTON */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        <div className="flex flex-1 flex-col sm:flex-row gap-3 max-w-2xl">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-3.5 flex items-center text-primary/40">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาตามชื่อลูกค้า หรือโปรเจกต์..."
              className="w-full rounded-xl pl-9 pr-4 py-2 text-xs bg-white border border-card-border text-foreground placeholder:text-foreground/30 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-card-border overflow-x-auto shrink-0">
            {["All", "Pending", "Paid", "Overdue"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-all duration-200 shrink-0 ${
                  statusFilter === s 
                    ? "bg-primary text-gold shadow-sm" 
                    : "text-foreground/60 hover:text-foreground"
                }`}
              >
                {s === "All" ? "ทั้งหมด" : TRANSLATE_PAYMENT_STATUS[s as PaymentStatus] || s}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => handleOpenDrawer(null)}
          className="btn-primary text-xs py-2 px-4 shadow-sm"
        >
          <Plus className="h-4 w-4 text-gold" />
          <span>ออกใบเรียกเก็บเงินใหม่</span>
        </button>
      </div>

      {/* 2. LEDGER GRID / TABLE */}
      {filteredPayments.length === 0 ? (
        <div className="flex h-[45vh] w-full flex-col items-center justify-center rounded-2xl bg-white border border-card-border text-foreground/40 text-xs gap-2">
          <CreditCard className="h-10 w-10 text-primary/30 mb-2" />
          <span className="font-bold text-primary/70">ไม่พบใบเรียกเก็บเงินค้างจ่ายในระบบ</span>
          <p className="text-[10px] text-foreground/30">ลองปรับปรุงตัวกรอง หรือสร้างประวัติเรียกเก็บเงินงวดงานครั้งใหม่ด้านบน</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-card-border overflow-hidden select-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-card-border bg-[#0F2D24]/5 text-primary font-black uppercase text-[10px]">
                  <th className="py-3.5 px-6">ลูกค้า & โปรเจกต์</th>
                  <th className="py-3.5 px-6">งวดชำระ</th>
                  <th className="py-3.5 px-6">จำนวนเงิน (บาท)</th>
                  <th className="py-3.5 px-6">วันครบกำหนด</th>
                  <th className="py-3.5 px-6">สถานะ</th>
                  <th className="py-3.5 px-6 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border text-foreground/80 font-medium">
                {filteredPayments.map((pay) => (
                  <tr 
                    key={pay.id} 
                    className="hover:bg-background/40 transition-colors group"
                  >
                    <td className="py-4 px-6 text-left">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-primary">{pay.customerName}</span>
                        <span className="text-[10px] text-foreground/50 max-w-[240px] truncate">{pay.projectName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="rounded-lg bg-background border border-card-border px-2 py-0.5 text-[10px] font-bold text-primary-light">
                        {TRANSLATE_PAYMENT_TYPE[pay.type]}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-extrabold text-primary">
                      {pay.amount.toLocaleString()} บาท
                    </td>
                    <td className="py-4 px-6">
                      {pay.status === "Paid" ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="line-through text-foreground/40">{pay.dueDate}</span>
                          <span className="text-[9px] text-emerald-600 font-extrabold flex items-center gap-1">
                            <CalendarCheck className="h-3 w-3 shrink-0" />
                            <span>ได้รับเงินเมื่อ: {pay.paidDate}</span>
                          </span>
                        </div>
                      ) : (
                        <span className={pay.status === "Overdue" ? "text-red-500 font-extrabold" : ""}>{pay.dueDate}</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-extrabold ${statusBadge(pay.status)}`}>
                        {pay.status === "Paid" && <Check className="h-3 w-3" />}
                        {pay.status === "Overdue" && <AlertCircle className="h-3 w-3" />}
                        {pay.status === "Pending" && <Clock className="h-3 w-3" />}
                        <span>{TRANSLATE_PAYMENT_STATUS[pay.status]}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                        {pay.status !== "Paid" && (
                          <button
                            onClick={() => handleQuickPaid(pay)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all"
                            title="ยืนยันได้รับเงินงวดนี้"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenDrawer(pay)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-card-border bg-background text-primary hover:text-gold transition-all"
                          title="แก้ไขงวดชำระ"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(pay.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                          title="ลบงวดชำระ"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. INVOICE FORM DRAWER */}
      <Modal
        isOpen={isOpen}
        onClose={handleCloseDrawer}
        title={selectedPayment ? "แก้ไขรายละเอียดงวดชำระ" : "เพิ่มงวดเรียกเก็บเงินใหม่"}
        size="md"
        type="drawer"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-left select-none">
          {formError && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-600">
              {formError}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">โปรเจกต์ที่เกี่ยวข้อง</label>
            {projects.length === 0 ? (
              <p className="text-xs text-red-500">ไม่พบรายชื่อโปรเจกต์ที่ดำเนินงานอยู่ กรุณาสร้างโปรเจกต์ก่อน</p>
            ) : (
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-xs bg-background border border-card-border text-foreground"
                required
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.customerName.split(" (")[0]})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">ประเภทงวดชำระ</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as PaymentType)}
              className="w-full rounded-xl px-4 py-2.5 text-xs bg-background border border-card-border text-foreground"
              required
            >
              <option value="Deposit">เงินมัดจำ</option>
              <option value="Installment 1">งวดที่ 1</option>
              <option value="Installment 2">งวดที่ 2</option>
              <option value="Final Payment">งวดสุดท้าย</option>
              <option value="Custom">งวดพิเศษ</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">ยอดเรียกเก็บ (บาท)</label>
            <input
              type="number"
              value={amount || ""}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              placeholder="เช่น 150000"
              className="w-full rounded-xl px-4 py-2.5 text-xs bg-background border border-card-border text-foreground focus:outline-none"
              min="1"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">วันครบกำหนดชำระ</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-xs bg-background border border-card-border text-foreground"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">สถานะใบเรียกเก็บเงิน</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PaymentStatus)}
              className="w-full rounded-xl px-4 py-2.5 text-xs bg-background border border-card-border text-foreground"
              required
            >
              <option value="Pending">ค้างชำระ</option>
              <option value="Paid">ชำระแล้ว</option>
              <option value="Overdue">เกินกำหนด</option>
            </select>
          </div>

          {status === "Paid" && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">วันที่ได้รับชำระ</label>
              <input
                type="date"
                value={paidDate}
                onChange={(e) => setPaidDate(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-xs bg-background border border-card-border text-foreground"
                required
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCloseDrawer}
              className="flex-1 rounded-xl border border-card-border bg-background py-2.5 text-xs font-bold text-foreground/60 hover:text-foreground"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={projects.length === 0}
              className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-white hover:bg-primary-light transition-all disabled:opacity-50"
            >
              {selectedPayment ? "บันทึกการเรียกเก็บ" : "สร้างกำหนดชำระ"}
            </button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
}
