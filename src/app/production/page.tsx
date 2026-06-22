"use client";

import React, { useState } from "react";
import MainLayout from "@/components/MainLayout";
import { useData } from "../providers";
import { Wrench, ShieldAlert, Play, Cpu, CalendarClock, History, CheckCircle } from "lucide-react";

export default function ProductionPage() {
  const { productionOrders, updateProductionOrder } = useData();
  const [activeTab, setActiveTab] = useState<"queue" | "machines" | "materials">("queue");

  const handleStartProduction = async (id: string, stage: any) => {
    try {
      await updateProductionOrder(id, { status: stage });
      alert(`อัปเดตชิ้นงานเป็นขั้นตอน: ${stage} สำเร็จ!`);
    } catch (err) {
      console.error(err);
    }
  };

  // CNC Machine Status mockups
  const machinesList = [
    { id: "CNC-01", name: "CNC Panel Saw Machine", status: "Running", load: "JOB-2024-089", operator: "สมเกียรติ ยิ้มแย้ม", speed: "12,000 RPM" },
    { id: "CNC-02", name: "CNC Edge Banding Machine", status: "Idle", load: "None", operator: "ธัญญา ช่างประกอบ", speed: "0 RPM" },
    { id: "CNC-03", name: "Router Engraving Machine", status: "Maintenance", load: "Under Calibration", operator: "วิชาญ พ่นสี", speed: "0 RPM" }
  ];

  // Material consumption estimates
  const materialEstimates = [
    { id: "est_1", job: "JOB-2024-089", material: "HMR 15 mm", estimatedQty: 8, unit: "แผ่น", status: "Consumed" },
    { id: "est_2", job: "JOB-2024-088", material: "ลามิเนตขาวด้าน", estimatedQty: 5, unit: "แผ่น", status: "Staged" },
    { id: "est_3", job: "JOB-2024-087", material: "บานพับ Soft Close", estimatedQty: 12, unit: "ชิ้น", status: "Pending" }
  ];

  return (
    <MainLayout>
      <div className="space-y-6 select-none text-left">
        
        {/* Navigation tabs */}
        <div className="flex bg-white rounded-xl border border-card-border p-1 self-start max-w-md">
          <button
            onClick={() => setActiveTab("queue")}
            className={`flex-1 p-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "queue" 
                ? "bg-primary text-gold" 
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            <CalendarClock className="h-4 w-4" />
            <span>คิวงานผลิตช่าง</span>
          </button>
          <button
            onClick={() => setActiveTab("machines")}
            className={`flex-1 p-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "machines" 
                ? "bg-primary text-gold" 
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            <Cpu className="h-4 w-4" />
            <span>สถานะเครื่อง CNC</span>
          </button>
          <button
            onClick={() => setActiveTab("materials")}
            className={`flex-1 p-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "materials" 
                ? "bg-primary text-gold" 
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            <Wrench className="h-4 w-4" />
            <span>ประมาณการใช้วัสดุ</span>
          </button>
        </div>

        {/* Tab 1: Queue list */}
        {activeTab === "queue" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Main production queue table */}
            <div className="premium-card p-6 flex flex-col justify-between md:col-span-2">
              <div className="border-b border-card-border pb-3 mb-4 flex items-center justify-between">
                <h3 className="text-xs font-bold text-primary tracking-widest uppercase">คิวงานบิ้วท์อินโรงงาน (Production Roster)</h3>
              </div>

              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-card-border text-foreground/40 font-bold">
                      <th className="py-2">หมายเลขสั่งผลิต</th>
                      <th className="py-2">ชื่องาน</th>
                      <th className="py-2">เจ้าของงาน</th>
                      <th className="py-2">ขั้นตอนปัจจุบัน</th>
                      <th className="py-2 text-right">เลื่อนลำดับงาน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border text-foreground/80 font-medium">
                    {productionOrders.map((order) => {
                      const stages = ["Design", "Cutting", "Assembly", "Painting", "QC", "Delivery"];
                      const currentIdx = stages.indexOf(order.status);
                      const nextStage = currentIdx < stages.length - 1 ? stages[currentIdx + 1] : null;

                      return (
                        <tr key={order.id} className="hover:bg-background/40 transition-colors">
                          <td className="py-3 font-bold text-primary">{order.id}</td>
                          <td className="py-3 font-bold">{order.name}</td>
                          <td className="py-3 text-foreground/60">{order.customerName}</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-lg border text-[9px] font-extrabold bg-primary/5 text-primary border-card-border uppercase">
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            {nextStage ? (
                              <button
                                onClick={() => handleStartProduction(order.id, nextStage)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[9px] font-bold hover:bg-emerald-700 transition-colors"
                              >
                                <Play className="h-2.5 w-2.5 text-white" />
                                <span>เลื่อนไป {nextStage}</span>
                              </button>
                            ) : (
                              <span className="text-[9px] text-emerald-600 font-extrabold flex items-center justify-end gap-1">
                                <CheckCircle className="h-3.5 w-3.5" />
                                <span>ติดตั้งเรียบร้อย</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: CNC Machines */}
        {activeTab === "machines" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {machinesList.map((mach) => (
              <div 
                key={mach.id}
                className="premium-card p-6 flex flex-col justify-between gap-4"
              >
                <div className="flex items-center justify-between border-b border-card-border pb-3">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black text-gold block">{mach.id}</span>
                    <span className="text-xs font-black text-primary block leading-none">{mach.name}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border ${
                    mach.status === "Running" 
                      ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                      : mach.status === "Idle"
                      ? "bg-background border-card-border text-foreground/50"
                      : "bg-red-50 border border-red-100 text-red-600 animate-pulse"
                  }`}>
                    {mach.status === "Running" ? "กำลังทำงาน" : mach.status === "Idle" ? "พร้อมใช้" : "ซ่อมบำรุง"}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-foreground/70">
                  <div className="flex justify-between">
                    <span>คิวงานที่จ่ายเข้าระบบ</span>
                    <span className="text-primary font-bold">{mach.load}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ช่างควบคุม CNC</span>
                    <span className="text-primary font-bold">{mach.operator}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ความเร็วใบตัด</span>
                    <span className="text-primary font-bold font-mono">{mach.speed}</span>
                  </div>
                </div>

                {mach.status === "Maintenance" && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-100 p-2.5 rounded-lg text-[10px] text-red-700 font-semibold leading-tight">
                    <ShieldAlert className="h-4 w-4 shrink-0 text-red-500" />
                    <span>แจ้งปัญหา: ใบมีดสึกหรอ อยู่ระหว่างเปลี่ยนอะไหล่</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Materials Consumption */}
        {activeTab === "materials" && (
          <div className="premium-card p-6 flex flex-col justify-between">
            <div className="border-b border-card-border pb-3 mb-4 flex items-center justify-between">
              <h3 className="text-xs font-bold text-primary tracking-widest uppercase">ประมาณการและการเบิกใช้วัสดุงานเฟอร์นิเจอร์ (Material Bill of Materials)</h3>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-card-border text-foreground/40 font-bold">
                    <th className="py-2">หมายเลขคิวผลิต</th>
                    <th className="py-2">รายการวัสดุบอร์ด</th>
                    <th className="py-2 text-right">จำนวนประเมินใช้วันนี้</th>
                    <th className="py-2 text-right">สถานะการเบิกคลัง</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border text-foreground/80 font-medium">
                  {materialEstimates.map((est) => (
                    <tr key={est.id}>
                      <td className="py-3 font-bold text-primary">{est.job}</td>
                      <td className="py-3">{est.material}</td>
                      <td className="py-3 text-right">{est.estimatedQty} {est.unit}</td>
                      <td className="py-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                          est.status === "Consumed" 
                            ? "bg-emerald-50 text-emerald-700"
                            : est.status === "Staged"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-amber-50 text-amber-700"
                        }`}>
                          {est.status === "Consumed" ? "เบิกจ่ายช่างแล้ว" : est.status === "Staged" ? "ตัดเรียงแล้ว" : "รอนำจ่าย"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
}
