"use client";

import React from "react";
import MainLayout from "@/components/MainLayout";
import { BarChart3, TrendingUp, DollarSign, Box, FolderKanban, Users } from "lucide-react";

export default function ReportsPage() {
  // Mock executive data
  const monthlyRevenue = [
    { month: "ม.ค.", revenue: 3200000, cost: 2400000, profit: 800000 },
    { month: "ก.พ.", revenue: 3800000, cost: 2850000, profit: 950000 },
    { month: "มี.ค.", revenue: 4800000, cost: 3600000, profit: 1200000 },
    { month: "เม.ย.", revenue: 4200000, cost: 3150000, profit: 1050000 },
    { month: "พ.ค.", revenue: 5800000, cost: 4350000, profit: 1450000 },
    { month: "มิ.ย.", revenue: 5820000, cost: 4364000, profit: 1456000 }
  ];

  const totalRevenueYTD = monthlyRevenue.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalCostYTD = monthlyRevenue.reduce((acc, curr) => acc + curr.cost, 0);
  const totalProfitYTD = monthlyRevenue.reduce((acc, curr) => acc + curr.profit, 0);
  const averageMargin = Math.round((totalProfitYTD / totalRevenueYTD) * 100);

  return (
    <MainLayout>
      <div className="space-y-6 select-none text-left">
        
        {/* Top summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="premium-card p-5 space-y-3">
            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider block">รายได้สะสมปีนี้ (YTD Revenue)</span>
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-primary">{totalRevenueYTD.toLocaleString()} บาท</h3>
              <div className="h-8 w-8 rounded-lg bg-[#0F2D24]/5 border border-primary/10 flex items-center justify-center text-primary">
                <TrendingUp className="h-4.5 w-4.5" />
              </div>
            </div>
          </div>

          <div className="premium-card p-5 space-y-3">
            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider block">กำไรสะสมปีนี้ (YTD Profit)</span>
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-emerald-600">{totalProfitYTD.toLocaleString()} บาท</h3>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <DollarSign className="h-4.5 w-4.5" />
              </div>
            </div>
          </div>

          <div className="premium-card p-5 space-y-3">
            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider block">อัตรากำไรเฉลี่ย (Average Margin)</span>
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-gold">{averageMargin}%</h3>
              <div className="h-8 w-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-gold">
                <BarChart3 className="h-4.5 w-4.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Detailed financial matrix table */}
        <div className="premium-card p-6 flex flex-col justify-between">
          <div className="border-b border-card-border pb-3 mb-4 flex items-center justify-between">
            <h3 className="text-xs font-bold text-primary tracking-widest uppercase">รายงานเปรียบเทียบงบประมาณการผลิต (Financial Matrix)</h3>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-card-border text-foreground/40 font-bold">
                  <th className="py-2.5">รอบเดือน</th>
                  <th className="py-2.5 text-right">ยอดรับรายได้</th>
                  <th className="py-2.5 text-right">ต้นทุนวัสดุและแรงช่าง</th>
                  <th className="py-2.5 text-right">ผลกำไรสุทธิ</th>
                  <th className="py-2.5 text-right">คิดเป็นอัตรา %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border text-foreground/80 font-medium">
                {monthlyRevenue.map((row, idx) => (
                  <tr key={idx} className="hover:bg-background/40 transition-colors">
                    <td className="py-3 font-bold text-primary">{row.month}</td>
                    <td className="py-3 text-right">{row.revenue.toLocaleString()} บาท</td>
                    <td className="py-3 text-right text-foreground/60">{row.cost.toLocaleString()} บาท</td>
                    <td className="py-3 text-right font-extrabold text-emerald-600">{row.profit.toLocaleString()} บาท</td>
                    <td className="py-3 text-right font-bold text-gold">
                      {Math.round((row.profit / row.revenue) * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}
