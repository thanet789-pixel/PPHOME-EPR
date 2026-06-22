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
  Tag,
  Clock,
  MessageSquare,
  FileText
} from "lucide-react";
import { Customer } from "@/lib/types";

function CRMPageContent() {
  const { customers, projects, payments, addCustomer, updateCustomer, deleteCustomer } = useData();
  const searchParams = useSearchParams();
  const customerIdParam = searchParams.get("customerId");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(customers[0]?.id || null);

  useEffect(() => {
    if (customerIdParam && customers && customers.length > 0) {
      const exists = customers.some(c => c.id === customerIdParam);
      if (exists) {
        setSelectedCustomerId(customerIdParam);
      }
    }
  }, [customerIdParam, customers]);
  
  // Drawer/Form state
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [address, setAddress] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const activeCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];

  const handleOpenDrawer = (cust: Customer | null = null) => {
    if (cust) {
      setSelectedCustomer(cust);
      setName(cust.name);
      setEmail(cust.email);
      setPhone(cust.phone);
      setCompany(cust.company);
      setAddress(cust.address);
    } else {
      setSelectedCustomer(null);
      setName("");
      setEmail("");
      setPhone("");
      setCompany("");
      setAddress("");
    }
    setFormError(null);
    setIsOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsOpen(false);
    setSelectedCustomer(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      setFormError("กรุณากรอกชื่อ, อีเมล และเบอร์โทรศัพท์");
      return;
    }

    try {
      if (selectedCustomer) {
        await updateCustomer(selectedCustomer.id, { name, email, phone, company, address });
      } else {
        const newId = await addCustomer({ name, email, phone, company, address });
        setSelectedCustomerId(newId);
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
        setSelectedCustomerId(customers.find(c => c.id !== id)?.id || null);
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

  // Active customer helper datasets
  const activeProjects = projects.filter(p => p.customerId === activeCustomer?.id);
  const activePayments = payments.filter(p => p.customerId === activeCustomer?.id);

  // Hardcoded mockup timeline events for demonstration
  const timelineEvents = [
    { type: "call", title: "โทรศัพท์ติดต่อประเมินราคาหน้างาน", date: "20 พ.ค. 2024 - 10:15 น.", detail: "คุยรายละเอียดโครงเตียง ตู้ครัว และตู้เสื้อผ้าขนาดใหญ่", staff: "คุณรวิภา (Estimator)" },
    { type: "chat", title: "ส่งข้อมูลบิ้วท์อินผ่าน Line OA", date: "19 พ.ค. 2024 - 14:30 น.", detail: "ส่งภาพห้องอ้างอิงและขนาดแปลนบ้านเบื้องต้นให้ช่างตัดไม้ประเมินแผ่นไม้", staff: "Line Bot AI / แอดมิน" },
    { type: "system", title: "ลงทะเบียนประวัติในระบบ ERP", date: "18 พ.ค. 2024 - 11:00 น.", detail: "ขึ้นทะเบียนประวัติลูกค้าเพื่อเปิดงานสั่งซื้อ", staff: "ระบบ ERP" }
  ];

  return (
    <MainLayout>
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)] select-none">
        
        {/* Left Side: Customer Lists Column (Desktop only) */}
        <div className="hidden lg:flex w-full lg:w-96 flex-col gap-4 bg-white border border-card-border rounded-2xl p-4 shrink-0 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-primary tracking-widest uppercase">รายชื่อลูกค้า</h3>
            <button
              onClick={() => handleOpenDrawer(null)}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-gold hover:bg-primary-light transition-all"
              title="เพิ่มลูกค้าใหม่"
            >
              <Plus className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-3.5 flex items-center text-primary/40">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาลูกค้า..."
              className="w-full rounded-xl pl-9 pr-4 py-2 text-xs bg-background border border-card-border text-foreground placeholder:text-foreground/30 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
            {filteredCustomers.map((cust) => (
              <div
                key={cust.id}
                onClick={() => setSelectedCustomerId(cust.id)}
                className={`rounded-xl border p-3 cursor-pointer text-left transition-all ${
                  selectedCustomerId === cust.id 
                    ? "bg-primary/5 border-gold text-primary shadow-sm"
                    : "border-card-border hover:border-gold/30 hover:bg-background/20"
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold block">{cust.name}</span>
                  <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-primary/10 text-primary-light uppercase">
                    {cust.company ? "บริษัท" : "บุคคล"}
                  </span>
                </div>
                {cust.company && (
                  <span className="text-[10px] text-foreground/50 block mt-1">{cust.company}</span>
                )}
                <span className="text-[9px] text-foreground/40 block mt-0.5">{cust.phone}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Details & Timeline Column */}
        {activeCustomer ? (
          <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2">
            
            {/* Mobile Customer Dropdown Selector & Add Button */}
            <div className="lg:hidden flex items-end gap-3 bg-white border border-card-border rounded-2xl p-4 mb-2 select-none">
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-[10px] font-extrabold text-gold tracking-widest uppercase">เลือกข้อมูลลูกค้า</label>
                <select
                  value={selectedCustomerId || ""}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full rounded-xl bg-background border border-card-border px-3.5 py-2.5 text-xs font-bold text-primary focus:outline-none focus:border-gold/50 transition-all cursor-pointer"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.company ? `(${c.company})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => handleOpenDrawer(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-gold hover:bg-primary-light border border-card-border transition-all"
                title="เพิ่มลูกค้าใหม่"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            
            {/* Top Detail Card */}
            <div className="premium-card p-6 relative">
              <div className="absolute top-6 right-6 flex gap-2">
                <button
                  onClick={() => handleOpenDrawer(activeCustomer)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-card-border bg-background text-primary hover:border-gold/40 hover:text-gold transition-all"
                  title="แก้ไขข้อมูลลูกค้า"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(activeCustomer.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-card-border bg-background text-red-500 hover:bg-red-50 transition-all"
                  title="ลบลูกค้า"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-black text-primary leading-tight">{activeCustomer.name}</h2>
                  {activeCustomer.company && (
                    <span className="text-xs font-bold text-gold flex items-center gap-1.5 mt-1.5">
                      <Building2 className="h-3.5 w-3.5" />
                      <span>{activeCustomer.company}</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-card-border pt-4 text-xs text-foreground/70">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary/40" />
                    <span>{activeCustomer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary/40" />
                    <span>{activeCustomer.phone}</span>
                  </div>
                  {activeCustomer.address && (
                    <div className="flex items-start gap-2 col-span-1 md:col-span-3">
                      <MapPin className="h-4 w-4 text-primary/40 shrink-0 mt-0.5" />
                      <span>{activeCustomer.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Google Map Card */}
            {activeCustomer.address && (
              <div className="premium-card p-5 space-y-4">
                <div className="border-b border-card-border pb-2.5 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-primary tracking-widest uppercase flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-gold" />
                    <span>แผนที่บ้านลูกค้า / สถานที่ส่งมอบติดตั้ง (Google Maps)</span>
                  </h3>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeCustomer.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-gold font-black hover:underline"
                  >
                    เปิดใน Google Maps ↗
                  </a>
                </div>

                <div className="rounded-xl overflow-hidden border border-card-border shadow-inner bg-background h-64 relative">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(activeCustomer.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  />
                </div>
              </div>
            )}

            {/* Split Grid: Timeline Events & Quotation/Projects history */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Timeline Activities */}
              <div className="premium-card p-6 flex flex-col justify-between">
                <div className="border-b border-card-border pb-3 mb-4">
                  <h3 className="text-xs font-bold text-primary tracking-widest uppercase">บันทึกกิจกรรมล่าสุด</h3>
                </div>

                <div className="space-y-4 flex-1">
                  {timelineEvents.map((ev, i) => (
                    <div key={i} className="flex gap-3 relative pb-4 last:pb-0">
                      {/* Vertical line indicator */}
                      {i < timelineEvents.length - 1 && (
                        <div className="absolute left-[9px] top-6 bottom-0 w-[1px] bg-card-border" />
                      )}
                      
                      <div className="h-4.5 w-4.5 rounded-full bg-primary/10 border border-gold/30 flex items-center justify-center shrink-0 mt-1">
                        {ev.type === "call" ? (
                          <Phone className="h-2 w-2 text-primary" />
                        ) : ev.type === "chat" ? (
                          <MessageSquare className="h-2 w-2 text-primary" />
                        ) : (
                          <Clock className="h-2 w-2 text-primary" />
                        )}
                      </div>

                      <div className="space-y-0.5 text-left">
                        <span className="text-xs font-bold text-primary block leading-none">{ev.title}</span>
                        <p className="text-[10px] text-foreground/60 mt-1">{ev.detail}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] text-foreground/40 font-semibold">{ev.date}</span>
                          <span className="h-1 w-1 rounded-full bg-foreground/20" />
                          <span className="text-[8px] font-bold text-primary-light uppercase bg-primary/5 px-1.5 py-0.2 rounded border border-card-border">
                            {ev.staff}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects & Quotations History */}
              <div className="space-y-6">
                
                {/* Projects History Card */}
                <div className="premium-card p-5">
                  <div className="border-b border-card-border pb-2.5 mb-3 flex items-center justify-between">
                    <h3 className="text-[10px] font-bold text-primary tracking-widest uppercase flex items-center gap-1.5">
                      <FolderOpen className="h-3.5 w-3.5 text-gold" />
                      <span>ประวัติโครงการ ({activeProjects.length})</span>
                    </h3>
                  </div>

                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {activeProjects.length === 0 ? (
                      <p className="text-[10px] text-foreground/40 text-center py-4">ไม่มีประวัติโครงการในระบบ</p>
                    ) : (
                      activeProjects.map(p => (
                        <div key={p.id} className="flex gap-2 items-center text-xs p-2 rounded-xl border border-card-border bg-background/25">
                          {p.image && (
                            <div className="h-10 w-14 rounded-lg overflow-hidden border border-card-border/80 bg-zinc-150 shrink-0">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 space-y-0.5 text-left">
                            <span className="text-xs font-bold text-primary block truncate max-w-[150px]">{p.name}</span>
                            <span className="text-[9px] text-foreground/40">งบประมาณ: {p.budget.toLocaleString()} บาท</span>
                          </div>
                          <span className="text-[9px] font-extrabold bg-primary/5 text-primary-light px-2 py-0.5 rounded border border-card-border shrink-0">
                            {p.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Payments History Card */}
                <div className="premium-card p-5">
                  <div className="border-b border-card-border pb-2.5 mb-3 flex items-center justify-between">
                    <h3 className="text-[10px] font-bold text-primary tracking-widest uppercase flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-gold" />
                      <span>ประวัติใบเสนอราคา & งวดเงิน ({activePayments.length})</span>
                    </h3>
                  </div>

                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {activePayments.length === 0 ? (
                      <p className="text-[10px] text-foreground/40 text-center py-4">ไม่มีประวัติงวดการชำระเงิน</p>
                    ) : (
                      activePayments.map(pay => (
                        <div key={pay.id} className="flex justify-between items-center text-xs p-2 rounded-xl border border-card-border bg-background/25">
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-primary block">{pay.projectName} - {pay.type}</span>
                            <span className="text-[9px] text-foreground/40">ยอดเงิน: {pay.amount.toLocaleString()} บาท</span>
                          </div>
                          <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border ${
                            pay.status === "Paid" 
                              ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                              : "bg-amber-50 border-amber-100 text-amber-700"
                          }`}>
                            {pay.status === "Paid" ? "ชำระแล้ว" : "ค้างชำระ"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-card-border bg-white rounded-2xl">
            <UserPlus className="h-10 w-10 text-primary/30 mb-2" />
            <span className="text-sm font-semibold text-primary/50">ยังไม่มีรายชื่อลูกค้าขึ้นทะเบียน</span>
          </div>
        )}

      </div>

      {/* Slide-over Drawer for Registration Form */}
      <Modal
        isOpen={isOpen}
        onClose={handleCloseDrawer}
        title={selectedCustomer ? "แก้ไขข้อมูลลูกค้า" : "เพิ่มลูกค้าใหม่"}
        size="md"
        type="drawer"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-600">
              {formError}
            </div>
          )}

          <div className="space-y-1 text-left">
            <label className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">ชื่อ-นามสกุล</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น คุณสมศักดิ์ รักดี"
              className="w-full rounded-xl px-4 py-2.5 text-xs bg-background border border-card-border text-foreground focus:outline-none focus:border-gold/50 transition-all"
              required
            />
          </div>

          <div className="space-y-1 text-left">
            <label className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">อีเมล</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="เช่น somsak@example.com"
              className="w-full rounded-xl px-4 py-2.5 text-xs bg-background border border-card-border text-foreground focus:outline-none focus:border-gold/50 transition-all"
              required
            />
          </div>

          <div className="space-y-1 text-left">
            <label className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">เบอร์โทรศัพท์</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="เช่น 081-234-5678"
              className="w-full rounded-xl px-4 py-2.5 text-xs bg-background border border-card-border text-foreground focus:outline-none focus:border-gold/50 transition-all"
              required
            />
          </div>

          <div className="space-y-1 text-left">
            <label className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">บริษัท (ถ้ามี)</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="เช่น บริษัท สยามเฟอร์นิเจอร์ จำกัด"
              className="w-full rounded-xl px-4 py-2.5 text-xs bg-background border border-card-border text-foreground focus:outline-none focus:border-gold/50 transition-all"
            />
          </div>

          <div className="space-y-1 text-left">
            <label className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">ที่อยู่</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="กรอกที่อยู่โดยละเอียด..."
              rows={3}
              className="w-full rounded-xl px-4 py-2.5 text-xs bg-background border border-card-border text-foreground focus:outline-none focus:border-gold/50 transition-all resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4 select-none">
            <button
              type="button"
              onClick={handleCloseDrawer}
              className="flex-1 rounded-xl border border-card-border bg-background py-2.5 text-xs font-bold text-foreground/60 hover:text-foreground transition-all"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-white hover:bg-primary-light transition-all shadow-md shadow-primary/10"
            >
              {selectedCustomer ? "บันทึกการแก้ไข" : "บันทึกลูกค้า"}
            </button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
}

export default function CRMPage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="flex h-[60vh] w-full items-center justify-center animate-pulse">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent" />
            <span className="text-sm font-semibold text-primary/70">กำลังโหลดระบบบริหารลูกค้า (CRM)...</span>
          </div>
        </div>
      </MainLayout>
    }>
      <CRMPageContent />
    </Suspense>
  );
}
