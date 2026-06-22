"use client";

import React, { useState } from "react";
import { ProductionOrder } from "@/lib/mockData";
import { useRouter } from "next/navigation";

interface ChartsProps {
  productionOrders: ProductionOrder[];
}

export default function DashboardCharts({ productionOrders }: ChartsProps) {
  const router = useRouter();
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; val: string; date: string } | null>({
    x: 236, // Centered on May
    y: 110,
    val: "580,000 บาท",
    date: "20 พ.ค. 2024"
  });

  // Monthly sales data matching the curve in reference image (roughly)
  const sales2024 = [300000, 380000, 480000, 420000, 580000, 490000, 810000, 580000, 540000, 720000, 650000, 920000];
  const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  
  const width = 600;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;
  
  const maxVal = 1200000;
  
  // Coordinates mapping
  const getCoordinates = (data: number[]) => {
    return data.map((val, idx) => {
      const x = paddingX + (idx * (width - paddingX * 2)) / (data.length - 1);
      const y = height - paddingY - (val / maxVal) * (height - paddingY * 2);
      return { x, y, val, month: months[idx] };
    });
  };

  const points2024 = getCoordinates(sales2024);

  const getPath = (points: { x: number; y: number }[]) => {
    return points.reduce((acc, p, idx) => {
      return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, "");
  };

  const linePath2024 = getPath(points2024);

  const areaPath2024 = points2024.length > 0 
    ? `${linePath2024} L ${points2024[points2024.length - 1].x} ${height - paddingY} L ${points2024[0].x} ${height - paddingY} Z`
    : "";

  // Donut chart stages matching the reference image exactly
  const stages = [
    { name: "ออกแบบ", key: "Design", count: 4, color: "#22D3EE" }, // Cyan
    { name: "CNC", key: "Cutting", count: 3, color: "#FB923C" }, // Orange
    { name: "ประกอบ", key: "Assembly", count: 6, color: "#3B82F6" }, // Blue
    { name: "พ่นสี", key: "Painting", count: 2, color: "#EC4899" }, // Pink
    { name: "QC", key: "QC", count: 2, color: "#F59E0B" }, // Yellow/Amber
    { name: "จัดส่ง", key: "Delivery", count: 1, color: "#10B981" } // Green
  ];

  const totalOrders = 18;

  // Donut sectors computation
  let accumulatedPercent = 0;
  const donutRadius = 38;
  const donutCircumference = 2 * Math.PI * donutRadius;

  const donutSectors = stages.map(s => {
    const percent = s.count / totalOrders;
    const strokeDasharray = `${percent * donutCircumference} ${donutCircumference}`;
    const strokeDashoffset = -accumulatedPercent * donutCircumference;
    accumulatedPercent += percent;
    return { ...s, strokeDasharray, strokeDashoffset };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none text-left">
      {/* Sales Trend Line Chart Card */}
      <div className="lg:col-span-2 premium-card p-6 flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-card-border pb-3.5 mb-4">
          <h3 className="text-sm font-bold text-primary">กราฟยอดขายรายเดือน</h3>
          <select className="text-xs bg-background border border-card-border rounded-lg px-2.5 py-1 font-bold text-foreground/75 outline-none">
            <option>ปี 2024</option>
          </select>
        </div>

        {/* SVG Drawing area */}
        <div className="relative mt-2 h-[200px] w-full">
          <svg className="h-full w-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="primaryAreaGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0F2D24" stopOpacity="0.10" />
                <stop offset="100%" stopColor="#0F2D24" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0.25, 0.5, 0.75, 1].map((p, i) => {
              const y = paddingY + p * (height - paddingY * 2);
              return (
                <line 
                  key={i}
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="rgba(15, 45, 36, 0.05)"
                  strokeWidth="1"
                />
              );
            })}

            {/* 2024 Area under the curve */}
            {areaPath2024 && (
              <path d={areaPath2024} fill="url(#primaryAreaGlow)" />
            )}

            {/* 2024 Main curve line */}
            {linePath2024 && (
              <path 
                d={linePath2024}
                fill="none"
                stroke="#0F2D24"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Interactive Dot pointers for 2024 */}
            {points2024.map((p, idx) => (
              <g 
                key={idx} 
                className="cursor-pointer"
                onMouseEnter={() => {
                  setHoveredPoint({
                    x: p.x,
                    y: p.y,
                    val: p.val.toLocaleString() + " บาท",
                    date: p.month + " 2024"
                  });
                }}
              >
                <circle 
                  cx={p.x}
                  cy={p.y}
                  r="4.5"
                  fill="#FFFFFF"
                  stroke="#0F2D24"
                  strokeWidth="2.5"
                  className="transition-all duration-200 hover:r-[6.5px]"
                />
              </g>
            ))}
          </svg>

          {/* HTML Interactive Tooltip matching the screenshot */}
          {hoveredPoint && (
            <div 
              className="absolute z-20 pointer-events-none rounded-lg bg-[#0F2D24] text-white px-3 py-1.5 text-[10px] shadow-lg flex flex-col items-center gap-0.5 border border-gold/20"
              style={{ 
                left: `${(hoveredPoint.x / width) * 100}%`,
                top: `${(hoveredPoint.y / height) * 100 - 32}%`,
                transform: "translateX(-50%)"
              }}
            >
              <span className="font-extrabold text-gold leading-none">{hoveredPoint.val}</span>
              <span className="text-[8px] text-white/60 font-semibold mt-0.5">{hoveredPoint.date}</span>
            </div>
          )}
        </div>

        {/* Labels for Months */}
        <div className="flex justify-between px-7 text-[10px] font-bold text-foreground/50 mt-1 border-t border-card-border pt-3">
          {months.map((m, i) => (
            <span key={i}>{m}</span>
          ))}
        </div>
      </div>

      {/* Production Donut Chart Card */}
      <div className="premium-card p-6 flex flex-col justify-between">
        <div className="border-b border-card-border pb-3.5 mb-4">
          <h3 className="text-sm font-bold text-primary">สถานะงานผลิต</h3>
        </div>

        <div className="flex flex-row items-center justify-center gap-5 py-4">
          {/* Radial circular progress bar */}
          <div 
            onClick={() => router.push("/production")}
            className="relative flex h-28 w-28 shrink-0 items-center justify-center cursor-pointer hover:scale-105 transition-all"
            title="คลิกเพื่อดูคิวงานผลิตช่าง"
          >
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={donutRadius}
                fill="transparent"
                stroke="rgba(15, 45, 36, 0.03)"
                strokeWidth="11"
              />
              {donutSectors.map((sector, idx) => (
                <circle
                  key={idx}
                  cx="50"
                  cy="50"
                  r={donutRadius}
                  fill="transparent"
                  stroke={sector.color}
                  strokeWidth="11"
                  strokeDasharray={sector.strokeDasharray}
                  strokeDashoffset={sector.strokeDashoffset}
                  className="transition-all duration-700 ease-out"
                />
              ))}
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black text-primary leading-none">{totalOrders}</span>
              <span className="text-[9px] text-foreground/45 font-bold mt-1">งาน</span>
            </div>
          </div>

          {/* Legend and stats */}
          <div className="flex flex-col justify-center space-y-1.5 w-full max-w-[120px]">
            {donutSectors.map((sector, idx) => (
              <div 
                key={idx} 
                onClick={() => router.push("/production")}
                className="flex items-center justify-between text-[11px] font-bold cursor-pointer hover:text-gold transition-colors"
                title={`ดูคิวงานผลิตขั้นตอน ${sector.name}`}
              >
                <div className="flex items-center gap-2 text-foreground/60">
                  <span 
                    className="h-2 w-2 rounded-full shrink-0" 
                    style={{ backgroundColor: sector.color }}
                  />
                  <span>{sector.name}</span>
                </div>
                <span className="text-primary font-bold">{sector.count} งาน</span>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={() => router.push("/production")}
          className="w-full text-center py-2.5 border-t border-card-border text-xs font-bold text-primary/70 hover:text-gold transition-colors mt-2 cursor-pointer"
        >
          ดูทั้งหมด →
        </button>
      </div>
    </div>
  );
}
