"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isUp: boolean;
  };
  onClick?: () => void;
}

export default function StatCard({ title, value, subtext, icon: Icon, trend, onClick }: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl bg-white border border-card-border p-6 flex flex-col justify-between h-40 transition-all duration-300 hover:shadow-md hover:border-gold/30 hover:-translate-y-0.5 ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      {/* Decorative subtle gradient background glow */}
      <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-gradient-to-tr from-gold/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />

      <div className="flex items-start justify-between">
        <div className="space-y-1.5 max-w-[75%]">
          <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider block">{title}</span>
          <h3 className="text-2xl font-black tracking-tight text-primary mt-1 md:text-3xl truncate">
            {value}
          </h3>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/5 text-primary border border-card-border transition-all duration-300 group-hover:scale-105 group-hover:bg-primary group-hover:text-gold shadow-inner">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-1.5 pt-3.5 border-t border-card-border mt-auto">
        <span className="text-xs font-semibold text-foreground/50">{subtext}</span>
        {trend && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-md flex items-center leading-none ${
            trend.isUp 
              ? "bg-[#22C55E]/10 text-[#22C55E]" 
              : "bg-[#EF4444]/10 text-[#EF4444]"
          }`}>
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
