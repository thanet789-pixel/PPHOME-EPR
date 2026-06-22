"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import MainLayout from "@/components/MainLayout";
import { useData } from "../providers";
import Modal from "@/components/Modal";
import { 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  Building2, 
  MapPin, 
  UserPlus, 
  Edit3, 
  Trash2,
  FolderOpen,
  CalendarDays,
  MessageSquare,
  Bookmark,
  FileText
} from "lucide-react";
import { Customer } from "@/lib/types";

function CustomersPageContent() {
  const { customers, projects, addCustomer, updateCustomer, deleteCustomer } = useData();
  const searchParams = useSearchParams();
  const actionParam = searchParams.get("action");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Drawer/Form state
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [address, setAddress] = useState("");
  const [taxId, setTaxId] = useState("");
  const [customerType, setCustomerType] = useState<'Personal' | 'Corporate'>("Personal");
  const [lineId, setLineId] = useState("");
  const [status, setStatus] = useState<'Lead' | 'Active' | 'VIP' | 'Inactive'>("Active");
  const [remarks, setRemarks] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const handleOpenDrawer = (cust: Customer | null = null) => {
    if (cust) {
      setSelectedCustomer(cust);
      setName(cust.name);
      setEmail(cust.email);
      setPhone(cust.phone);
      setCompany(cust.company);
      setAddress(cust.address);
      setTaxId(cust.taxId || "");
      setCustomerType(cust.customerType || "Personal");
      setLineId(cust.lineId || "");
      setStatus(cust.status || "Active");
      setRemarks(cust.remarks || "");
    } else {
      setSelectedCustomer(null);
      setName("");
      setEmail("");
      setPhone("");
      setCompany("");
      setAddress("");
      setTaxId("");
      setCustomerType("Personal");
      setLineId("");
      setStatus("Active");
      setRemarks("");
    }
    setFormError(null);
    setIsOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsOpen(false);
    setSelectedCustomer(null);
  };

  useEffect(() => {
    if (actionParam === "new" || actionParam === "add") {
      handleOpenDrawer(null);
    }
  }, [actionParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      setFormError("กรุณากรอกชื่อ, อีเมล และเบอร์โทรศัพท์");
      return;
    }

    try {
      const payload = {
        name,
        email,
        phone,
        company: customerType === "Corporate" ? company : "",
        address,
        taxId: customerType === "Corporate" ? taxId : "",
        customerType,
        lineId,
        status,
        remarks
      };

      if (selectedCustomer) {
        // Edit Customer
        await updateCustomer(selectedCustomer.id, payload);
      } else {
        // Add Customer
        await addCustomer(payload);
      }
      handleCloseDrawer();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการบันทึกข้อมูลลูกค้า";
      setFormError(errMsg);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลลูกค้ารายนี้? ข้อมูลโครงการและประวัติทางการเงินทั้งหมดจะยังคงอยู่ในระบบ")) {
      try {
        await deleteCustomer(id);
      } catch (err) {
        console.error("Failed to delete customer:", err);
      }
    }
  };

  // Live query matching
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  return (
    <MainLayout>
      {/* 1. TOP HEADER & SEARCH SEARCHBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-3.5 flex items-center text-zinc-500">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อ, บริษัท, อีเมล หรือเบอร์โทร..."
            className="w-full rounded-xl pl-10 pr-4 py-3 text-sm glass-input"
          />
        </div>

        <button
          onClick={() => handleOpenDrawer(null)}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4.5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 active:scale-98 transition-all shrink-0"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>ลงทะเบียนลูกค้าใหม่</span>
        </button>
      </div>

      {/* 2. CUSTOMERS GRID */}
      {filteredCustomers.length === 0 ? (
        <div className="flex h-[45vh] w-full flex-col items-center justify-center rounded-2xl bg-zinc-900/10 border border-zinc-900 border-dashed text-zinc-500 text-sm gap-2">
          <UserPlus className="h-10 w-10 text-zinc-600 mb-2" />
          <span>ไม่พบข้อมูลลูกค้าในระบบ</span>
          <p className="text-xs text-zinc-600">ลองปรับปรุงคำค้นหา หรือกดปุ่มเพิ่มข้อมูลลูกค้ารายใหม่ด้านบน</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((cust) => {
            // Count projects for this client
            const clientProjectsCount = projects.filter((p) => p.customerId === cust.id).length;

            return (
              <div 
                key={cust.id} 
                className="rounded-2xl glass-card p-6 flex flex-col justify-between relative group"
              >
                {/* Actions quick utility */}
                <div className="absolute top-5 right-5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => handleOpenDrawer(cust)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/40 text-indigo-400 hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all shadow-inner"
                    title="แก้ไขข้อมูลลูกค้า"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cust.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/40 text-rose-400 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all shadow-inner"
                    title="ลบข้อมูลลูกค้า"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="space-y-4 text-left">
                  {/* Name block */}
                  <div className="space-y-2 pr-16 text-left">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="text-base font-bold text-white leading-tight">{cust.name}</h3>
                      {/* Status Badge */}
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase border leading-none ${
                        cust.status === "VIP" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                        cust.status === "Lead" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                        cust.status === "Inactive" ? "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" :
                        "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}>
                        {cust.status === "VIP" ? "VIP" :
                         cust.status === "Lead" ? "ผู้สนใจ" :
                         cust.status === "Inactive" ? "เลิกติดต่อ" : "ลูกค้าทั่วไป"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-md border leading-none ${
                        cust.customerType === "Corporate" 
                          ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" 
                          : "bg-zinc-800 border-zinc-700 text-zinc-400"
                      }`}>
                        {cust.customerType === "Corporate" ? "นิติบุคคล" : "บุคคลธรรมดา"}
                      </span>
                      {cust.company && (
                        <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1">
                          <Building2 className="h-3 w-3 shrink-0" />
                          <span>{cust.company}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details block */}
                  <div className="space-y-2 border-t border-zinc-900/40 pt-4 text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                      <span className="truncate">{cust.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                      <span>{cust.phone}</span>
                    </div>
                    {cust.lineId && (
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                        <span>Line ID: <span className="text-emerald-400 font-semibold">{cust.lineId}</span></span>
                      </div>
                    )}
                    {cust.customerType === "Corporate" && cust.taxId && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                        <span>เลขผู้เสียภาษี: <span className="text-zinc-300 font-bold">{cust.taxId}</span></span>
                      </div>
                    )}
                    {cust.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-3.5 w-3.5 text-zinc-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-2 leading-relaxed">{cust.address}</span>
                      </div>
                    )}
                    {cust.remarks && (
                      <div className="mt-3 p-2.5 rounded-xl bg-zinc-950/20 border border-zinc-800/80 text-[10px] text-zinc-500 italic leading-snug">
                        💡 {cust.remarks}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer status (Projects count) */}
                <div className="flex items-center justify-between border-t border-zinc-900/40 pt-4 mt-6 text-[11px] font-semibold">
                  <div className="flex items-center gap-1.5 text-zinc-500">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                    <span>เริ่มติดต่อ: {new Date(cust.createdAt).toLocaleDateString("th-TH", { year: "numeric", month: "short" })}</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400 bg-emerald-500/5 px-2.5 py-0.5 rounded-full border border-emerald-500/10">
                    <FolderOpen className="h-3.5 w-3.5 shrink-0" />
                    <span>{clientProjectsCount} โปรเจกต์</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. SLIDE OVER FORM DRAWER */}
      <Modal
        isOpen={isOpen}
        onClose={handleCloseDrawer}
        title={selectedCustomer ? "แก้ไขข้อมูลลูกค้า" : "เพิ่มลูกค้ารายใหม่"}
        size="md"
        type="drawer"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs text-rose-400">
              {formError}
            </div>
          )}

          {/* Customer Type Selector */}
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-black text-zinc-400 tracking-wider uppercase">ประเภทลูกค้า</label>
            <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              <button
                type="button"
                onClick={() => setCustomerType("Personal")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  customerType === "Personal"
                    ? "bg-[#0F2D24] text-gold border border-gold/25"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                บุคคลธรรมดา
              </button>
              <button
                type="button"
                onClick={() => setCustomerType("Corporate")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  customerType === "Corporate"
                    ? "bg-[#0F2D24] text-gold border border-gold/25"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                นิติบุคคล
              </button>
            </div>
          </div>

          {/* Status Selector */}
          <div className="space-y-1 text-left">
            <label className="text-[10px] font-black text-zinc-400 tracking-wider uppercase">สถานะลูกค้า</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full rounded-xl px-4 py-3 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-gold/50 transition-all font-bold cursor-pointer"
            >
              <option value="Active">ลูกค้าทั่วไป (Active)</option>
              <option value="Lead">ผู้สนใจติดต่อสอบถาม (Lead)</option>
              <option value="VIP">ลูกค้า VIP สำคัญพิเศษ (VIP)</option>
              <option value="Inactive">เลิกติดต่อชั่วคราว (Inactive)</option>
            </select>
          </div>

          {/* Basic Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-400 tracking-wider uppercase">ชื่อ-นามสกุล</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น สมชาย เลิศพิพัฒน์"
                className="w-full rounded-xl px-4 py-3 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-gold/50 transition-all"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-400 tracking-wider uppercase">เบอร์โทรศัพท์</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="เช่น 081-234-5678"
                className="w-full rounded-xl px-4 py-3 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-gold/50 transition-all"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-400 tracking-wider uppercase">ที่อยู่อีเมล</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="เช่น somchai@company.co.th"
                className="w-full rounded-xl px-4 py-3 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-gold/50 transition-all"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-400 tracking-wider uppercase">Line ID</label>
              <input
                type="text"
                value={lineId}
                onChange={(e) => setLineId(e.target.value)}
                placeholder="เช่น somchai_line"
                className="w-full rounded-xl px-4 py-3 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-gold/50 transition-all"
              />
            </div>
          </div>

          {/* Corporate specific fields */}
          {customerType === "Corporate" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left border-t border-zinc-900/60 pt-4 fade-in">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-400 tracking-wider uppercase">บริษัท / ห้างร้าน</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="เช่น บริษัท พีพีการค้า จำกัด"
                  className="w-full rounded-xl px-4 py-3 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-gold/50 transition-all"
                  required={customerType === "Corporate"}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-400 tracking-wider uppercase">เลขประจำตัวผู้เสียภาษี (13 หลัก)</label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="เช่น 0105563000123"
                  maxLength={13}
                  className="w-full rounded-xl px-4 py-3 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-gold/50 transition-all"
                />
              </div>
            </div>
          )}

          {/* Shipping Address */}
          <div className="space-y-1 text-left">
            <label className="text-[10px] font-black text-zinc-400 tracking-wider uppercase">ที่อยู่จัดส่งเอกสาร / ออกใบเสร็จ</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="กรอกที่อยู่โดยละเอียด เช่น บ้านเลขที่ ซอย ถนน แขวง เขต..."
              rows={3}
              className="w-full rounded-xl px-4 py-3 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-gold/50 transition-all resize-none"
            />
          </div>

          {/* Remarks/Preferences */}
          <div className="space-y-1 text-left">
            <label className="text-[10px] font-black text-zinc-400 tracking-wider uppercase">หมายเหตุความต้องการลูกค้า (Remarks & Preferences)</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="ข้อตกลงพิเศษ เช่น ลูกค้าชอบโทนสีไม้วอลนัท, อุปกรณ์ฟิตติ้งแบบ Soft Close แบรนด์ Hafele..."
              rows={2}
              className="w-full rounded-xl px-4 py-3 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-gold/50 transition-all resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 select-none">
            <button
              type="button"
              onClick={handleCloseDrawer}
              className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/20 py-3 text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800/40 transition-all cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-[#0F2D24] text-gold border border-gold/30 py-3 text-xs font-black hover:bg-[#1E483B] active:scale-98 transition-all shadow-lg"
            >
              {selectedCustomer ? "บันทึกการแก้ไข" : "ลงทะเบียนลูกค้ารายใหม่"}
            </button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
}

export default function CustomersPage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="flex h-[60vh] w-full items-center justify-center animate-pulse">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent" />
            <span className="text-sm font-semibold text-primary/70">กำลังโหลดระบบข้อมูลลูกค้า...</span>
          </div>
        </div>
      </MainLayout>
    }>
      <CustomersPageContent />
    </Suspense>
  );
}
