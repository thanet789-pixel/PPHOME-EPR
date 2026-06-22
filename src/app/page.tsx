"use client";

import React, { useState } from "react";
import MainLayout from "@/components/MainLayout";
import { useData } from "./providers";
import { useRouter } from "next/navigation";
import StatCard from "@/components/StatCard";
import DashboardCharts from "@/components/DashboardCharts";
import { 
  Coins, 
  TrendingUp, 
  Percent, 
  Users, 
  Wrench, 
  Box, 
  Plus, 
  BellRing, 
  ArrowUpRight,
  ShieldAlert,
  AlertTriangle,
  FolderOpen
} from "lucide-react";
import Link from "next/link";

// Helper to format Date in Thai
const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = [
      "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
      "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
  } catch {
    return dateStr;
  }
};

// Helper to calculate days left
const getDaysLeftText = (endDateStr: string, status: string) => {
  if (status === "Completed") return "ส่งมอบแล้ว";
  try {
    const end = new Date(endDateStr);
    const today = new Date();
    today.setHours(0,0,0,0);
    end.setHours(0,0,0,0);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "วันนี้";
    if (diffDays < 0) return `เกินกำหนด ${Math.abs(diffDays)} วัน`;
    return `อีก ${diffDays} วัน`;
  } catch {
    return "";
  }
};

// Helper for status badge
const getProjectStatusBadge = (status: string) => {
  switch (status) {
    case "Completed":
      return (
        <span className="px-2.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-50 border border-emerald-200 text-emerald-700">
          ส่งมอบงาน
        </span>
      );
    case "In Progress":
    case "Production":
      return (
        <span className="px-2.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-50 border border-amber-200 text-amber-700">
          กำลังผลิต
        </span>
      );
    case "Delayed":
      return (
        <span className="px-2.5 py-0.5 rounded text-[9px] font-extrabold bg-red-50 border border-red-200 text-red-700">
          ล่าช้า
        </span>
      );
    case "Planning":
    case "Lead":
    case "Survey":
    case "Design":
      return (
        <span className="px-2.5 py-0.5 rounded text-[9px] font-extrabold bg-blue-50 border border-blue-200 text-blue-700">
          ออกแบบ
        </span>
      );
    case "Installation":
      return (
        <span className="px-2.5 py-0.5 rounded text-[9px] font-extrabold bg-indigo-50 border border-indigo-200 text-indigo-700">
          ติดตั้ง
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-0.5 rounded text-[9px] font-extrabold bg-zinc-50 border border-zinc-200 text-zinc-700">
          {status}
        </span>
      );
  }
};

// Helper for stock color
const getStockColorClass = (stock: number, minStock: number) => {
  if (stock <= minStock * 0.5) return "text-red-500 font-black";
  if (stock <= minStock) return "text-amber-500 font-black";
  return "text-emerald-500 font-black";
};

export default function Dashboard() {
  const router = useRouter();
  const { 
    customers, 
    productionOrders, 
    materials,
    projects,
    loading,
    addCustomer,
    addProductionOrder
  } = useData();

  const [quickActionMsg, setQuickActionMsg] = useState<string | null>(null);

  // Get top 4 recent projects
  const recentProjects = React.useMemo(() => {
    if (!projects) return [];
    return [...projects]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
  }, [projects]);

  // Get top 5 low stock materials (stock <= minStock)
  const lowStockMaterials = React.useMemo(() => {
    if (!materials) return [];
    return materials
      .filter((m) => m.stock <= m.minStock)
      .slice(0, 5);
  }, [materials]);

  // Get top 3 recent customers (sorted by createdAt or just take first 3)
  const recentCustomers = React.useMemo(() => {
    if (!customers) return [];
    return [...customers]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  }, [customers]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex h-[60vh] w-full items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent" />
            <span className="text-sm font-semibold text-primary/70">กำลังรวบรวมข้อมูล ERP...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Handle Quick Actions
  const handleQuickAction = async (action: string) => {
    try {
      if (action === "quotation") {
        setQuickActionMsg("ย้ายไปที่เมนู ใบเสนอราคา เพื่อกรอกประเมินราคาใหม่");
        setTimeout(() => setQuickActionMsg(null), 3000);
      } else if (action === "customer") {
        const testName = "คุณลูกค้าใหม่ " + Math.floor(10 + Math.random() * 90);
        await addCustomer({
          name: testName,
          email: "customer@newerp.com",
          phone: "089-999-8888",
          company: "บริษัท จำลอง จำกัด",
          address: "กรุงเทพมหานคร"
        });
        setQuickActionMsg(`เพิ่มลูกค้าตัวอย่าง: ${testName} สำเร็จ!`);
        setTimeout(() => setQuickActionMsg(null), 3000);
      } else if (action === "production") {
        await addProductionOrder({
          name: "เฟอร์นิเจอร์ใหม่บิวท์อิน",
          customerName: "คุณสมชาย ใจดี",
          status: "Design",
          dueDate: "30 พ.ค. 2569"
        });
        setQuickActionMsg("เปิดงานผลิตใหม่ JOB-2024-New สำเร็จ!");
        setTimeout(() => setQuickActionMsg(null), 3000);
      } else if (action === "material") {
        setQuickActionMsg("เบิกวัสดุในสต็อกสำเร็จ! เข้าสู่หน้าสต็อกวัสดุเพื่อดูรายละเอียด");
        setTimeout(() => setQuickActionMsg(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <MainLayout>
      {/* Quick Action message toast */}
      {quickActionMsg && (
        <div className="fixed top-5 right-5 z-50 rounded-xl bg-primary text-gold border border-gold/30 px-5 py-3 text-xs font-bold shadow-xl animate-bounce">
          {quickActionMsg}
        </div>
      )}

      {/* 1. QUICK ACTIONS BUTTONS BLOCK */}
      <div className="flex flex-wrap items-center justify-end gap-3 select-none">
        <button 
          onClick={() => router.push("/quotations")}
          className="btn-primary text-sm py-2 px-4 shadow-sm bg-[#0F2D24] text-white flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5 text-gold" />
          <span>สร้างใบเสนอราคา</span>
        </button>
        <button 
          onClick={() => router.push("/customers?action=new")}
          className="btn-primary text-sm py-2 px-4 shadow-sm bg-[#0F2D24] text-white flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5 text-gold" />
          <span>เพิ่มลูกค้า</span>
        </button>
        <button 
          onClick={() => router.push("/projects?action=new")}
          className="btn-primary text-sm py-2 px-4 shadow-sm bg-[#0F2D24] text-white flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5 text-gold" />
          <span>เปิดงานผลิต</span>
        </button>
        <button 
          onClick={() => router.push("/inventory?action=issue")}
          className="btn-gold text-sm py-2 px-4 shadow-sm bg-[#B88E2F] hover:bg-[#A37B24] text-white flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5 text-white" />
          <span>เบิกวัสดุ</span>
        </button>
      </div>

      {/* 2. TOP STAT CARDS GRID (4 Cards matching the reference image) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
        <StatCard
          title="ยอดขายวันนี้"
          value="580,000 บาท"
          subtext="12.5% จากเมื่อวาน"
          icon={Coins}
          trend={{ value: "↑ 12.5% จากเมื่อวาน", isUp: true }}
          onClick={() => router.push("/payments")}
          bgClass="bg-[#EAF5F0]"
        />
        <StatCard
          title="ยอดขายเดือนนี้"
          value="5,820,000 บาท"
          subtext="18.3% จากเดือนที่แล้ว"
          icon={TrendingUp}
          trend={{ value: "↑ 18.3% จากเดือนที่แล้ว", isUp: true }}
          onClick={() => router.push("/payments")}
          bgClass="bg-[#EBF5F8]"
        />
        <StatCard
          title="กำไรสุทธิเดือนนี้"
          value="1,456,000 บาท"
          subtext="15.7% จากเดือนที่แล้ว"
          icon={Percent}
          trend={{ value: "↑ 15.7% จากเดือนที่แล้ว", isUp: true }}
          onClick={() => router.push("/reports")}
          bgClass="bg-[#FAF5E6]"
        />
        <StatCard
          title="ลูกค้าใหม่เดือนนี้"
          value="12 ราย"
          subtext="9 ราย จากเดือนที่แล้ว"
          icon={Users}
          trend={{ value: "↑ 9 ราย จากเดือนที่แล้ว", isUp: true }}
          onClick={() => router.push("/crm")}
          bgClass="bg-[#F5EAF5]"
        />
      </div>

      {/* 3. MIDDLE ROW: CHARTS & NOTIFICATIONS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Charts: occupy 3 columns (Line + Donut) */}
        <div className="lg:col-span-3">
          <DashboardCharts productionOrders={productionOrders} />
        </div>

        {/* Right Column: Notification Panel */}
        <div className="premium-card p-6 flex flex-col justify-between select-none text-left bg-[#FDF2F4]">
          <div className="border-b border-card-border pb-3.5 mb-4">
            <h3 className="text-sm font-bold text-primary flex items-center gap-2">
              <BellRing className="h-4.5 w-4.5 text-primary" />
              <span>แจ้งเตือน</span>
            </h3>
          </div>

          <div className="space-y-4 flex-1">
            <div 
              onClick={() => router.push("/inventory?search=HMR 15 mm")}
              className="flex items-start gap-3 border-b border-card-border pb-3 cursor-pointer hover:bg-primary/5 p-2 rounded-xl transition-all"
            >
              <div className="h-7 w-7 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0 mt-0.5 border border-red-100 animate-pulse">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-primary">วัสดุใกล้หมด</p>
                <p className="text-[10px] text-foreground/60 leading-tight">HMR 15 mm เหลือ 12 แผ่น</p>
                <span className="text-[9px] text-foreground/40 font-semibold block mt-1">10 นาทีที่แล้ว</span>
              </div>
            </div>

            <div 
              onClick={() => router.push("/projects?projectId=proj_4")}
              className="flex items-start gap-3 border-b border-card-border pb-3 cursor-pointer hover:bg-primary/5 p-2 rounded-xl transition-all"
            >
              <div className="h-7 w-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 border border-amber-100">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-primary">งานใกล้ส่งมอบ</p>
                <p className="text-[10px] text-foreground/60 leading-tight">บ้านคุณสมชาย - ชั้นวางทีวี ครบกำหนดวันนี้</p>
                <span className="text-[9px] text-foreground/40 font-semibold block mt-1">1 ชั่วโมงที่แล้ว</span>
              </div>
            </div>

            <div 
              onClick={() => router.push("/quotations")}
              className="flex items-start gap-3 cursor-pointer hover:bg-primary/5 p-2 rounded-xl transition-all"
            >
              <div className="h-7 w-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 border border-blue-100">
                <FolderOpen className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-primary">ใบเสนอราคาอนุมัติ</p>
                <p className="text-[10px] text-foreground/60 leading-tight">Q-2024-056 ขออนุมัติโดย คุณรวิภา</p>
                <span className="text-[9px] text-foreground/40 font-semibold block mt-1">2 ชั่วโมงที่แล้ว</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => router.push("/calendar")}
            className="w-full text-center py-2 border-t border-card-border text-xs font-bold text-primary/70 hover:text-gold transition-colors mt-4 cursor-pointer"
          >
            ดูทั้งหมด →
          </button>
        </div>
      </div>

      {/* 4. BOTTOM ROW: RECENT JOBS, LOW STOCK & CUSTOMERS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 select-none mt-2">
        {/* Left (col-span-2): Recent Jobs */}
        <div className="lg:col-span-2 premium-card p-6 flex flex-col justify-between text-left bg-[#F2F8F5]">
          <div className="flex items-center justify-between border-b border-card-border pb-3.5 mb-4">
            <h3 className="text-sm font-bold text-primary">งานล่าสุด</h3>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-card-border text-foreground/40 font-bold uppercase">
                  <th className="py-2.5">รหัสงาน</th>
                  <th className="py-2.5">ชื่องาน</th>
                  <th className="py-2.5">ลูกค้า</th>
                  <th className="py-2.5">สถานะ</th>
                  <th className="py-2.5">กำหนดส่งมอบ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border text-foreground/80 font-medium">
                {recentProjects.length > 0 ? (
                  recentProjects.map((proj, idx) => {
                    const daysLeftText = getDaysLeftText(proj.endDate, proj.status);
                    const formattedDate = formatDate(proj.endDate);
                    const displayId = `JOB-2024-${String(89 - idx).padStart(3, "0")}`;
                    
                    return (
                      <tr 
                        key={proj.id}
                        onClick={() => router.push(`/projects?projectId=${proj.id}`)}
                        className="hover:bg-primary/5 transition-colors cursor-pointer"
                      >
                        <td className="py-3 font-bold text-foreground/50">{displayId}</td>
                        <td className="py-3 font-bold text-primary">{proj.name}</td>
                        <td className="py-3">{proj.customerName.split(" (")[0]}</td>
                        <td className="py-3">
                          {getProjectStatusBadge(proj.status)}
                        </td>
                        <td className="py-3 text-foreground/60 leading-tight">
                          <span className="block font-bold">{formattedDate}</span>
                          <span className={`text-[9px] font-semibold block mt-0.5 ${
                            proj.status === "Completed" ? "text-emerald-600" :
                            daysLeftText.includes("เกินกำหนด") ? "text-red-500" : "text-amber-500"
                          }`}>{daysLeftText}</span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-foreground/45 font-semibold">ไม่มีงานโครงการล่าสุด</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <button 
            onClick={() => router.push("/projects")}
            className="w-full text-center py-2.5 border-t border-card-border text-xs font-bold text-primary/70 hover:text-gold transition-colors mt-2 cursor-pointer"
          >
            ดูทั้งหมด →
          </button>
        </div>

        {/* Middle (col-span-1): Low Stock Materials */}
        <div className="premium-card p-6 flex flex-col justify-between text-left bg-[#FCF7F2]">
          <div className="flex items-center justify-between border-b border-card-border pb-3.5 mb-4">
            <h3 className="text-sm font-bold text-primary">วัสดุใกล้หมด</h3>
          </div>

          <div className="space-y-1.5 flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-foreground/40 font-bold border-b border-card-border pb-2 block w-full flex justify-between">
                  <th className="text-left w-2/5">รายการ</th>
                  <th className="text-center w-1/5">คงเหลือ</th>
                  <th className="text-right w-1/5">หน่วย</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border block w-full">
                {lowStockMaterials.length > 0 ? (
                  lowStockMaterials.map((mat) => (
                    <tr 
                      key={mat.id}
                      onClick={() => router.push(`/inventory?search=${encodeURIComponent(mat.name)}&materialId=${mat.id}`)}
                      className="flex justify-between items-center py-2.5 hover:bg-primary/5 transition-colors cursor-pointer rounded-lg px-1"
                    >
                      <td className="text-left font-bold text-primary w-2/5 truncate">{mat.name}</td>
                      <td className={`text-center w-1/5 ${getStockColorClass(mat.stock, mat.minStock)}`}>
                        {mat.stock}
                      </td>
                      <td className="text-right text-foreground/50 w-1/5">{mat.unit}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="flex justify-center py-8">
                    <td className="text-foreground/45 font-semibold text-xs">ไม่มีวัสดุใกล้หมดเกณฑ์</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <button 
            onClick={() => router.push("/inventory")}
            className="w-full text-center py-2.5 border-t border-card-border text-xs font-bold text-primary/70 hover:text-gold transition-colors mt-2 cursor-pointer"
          >
            ดูทั้งหมด →
          </button>
        </div>

        {/* Right (col-span-1): Recent Customers List */}
        <div className="premium-card p-6 flex flex-col justify-between text-left bg-[#F5F7FC]">
          <div className="flex items-center justify-between border-b border-card-border pb-3.5 mb-4">
            <h3 className="text-sm font-bold text-primary">ลูกค้าล่าสุด</h3>
          </div>

          <div className="space-y-4 flex-1">
            {recentCustomers.length > 0 ? (
              recentCustomers.map((cust) => {
                const initials = cust.name.replace("คุณ", "").substring(0, 2);
                const dateText = formatDate(cust.createdAt);
                
                return (
                  <div 
                    key={cust.id}
                    onClick={() => router.push(`/crm?customerId=${cust.id}`)}
                    className="flex items-center gap-3 cursor-pointer hover:bg-primary/5 p-2 rounded-xl transition-all"
                  >
                    <div className="h-9 w-9 rounded-full border border-card-border bg-[#0F2D24]/5 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                      {initials}
                    </div>
                    <div className="space-y-0.5 leading-none">
                      <span className="text-xs font-extrabold text-primary block">{cust.name}</span>
                      <span className="text-[10px] text-foreground/50 font-bold block mt-1">{cust.phone}</span>
                      <span className="text-[9px] text-foreground/40 font-semibold block mt-0.5">เพิ่มเมื่อ {dateText}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-foreground/45 font-semibold text-xs">
                ไม่มีลูกค้าใหม่ล่าสุด
              </div>
            )}
          </div>

          <button 
            onClick={() => router.push("/customers")}
            className="w-full text-center py-2.5 border-t border-card-border text-xs font-bold text-primary/70 hover:text-gold transition-colors mt-2 cursor-pointer"
          >
            ดูทั้งหมด →
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
