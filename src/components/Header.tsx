"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/providers";
import { Menu, Bell, Search } from "lucide-react";

interface HeaderProps {
  setMobileOpen: (open: boolean) => void;
}

export default function Header({ setMobileOpen }: HeaderProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [searchVal, setSearchVal] = useState("");

  if (!user) return null;

  // Derive page titles in Thai
  const getPageTitle = () => {
    switch (pathname) {
      case "/":
        return "ยินดีต้อนรับกลับ, " + (user.displayName || "Admin") + " 👋";
      case "/crm":
        return "ระบบบริหารความสัมพันธ์ลูกค้า (CRM)";
      case "/quotations":
        return "ระบบใบเสนอราคา (Quotations)";
      case "/boq":
        return "เครื่องคำนวณปริมาณวัสดุ (BOQ Calculator)";
      case "/inventory":
        return "ระบบบริหารคลังวัสดุ (Inventory)";
      case "/production":
        return "ระบบติดตามการผลิต (Production Control)";
      case "/projects":
        return "ระบบบริหารงานโครงการ (Projects)";
      case "/purchasing":
        return "ระบบจัดซื้อวัสดุ (Purchasing)";
      case "/payments":
        return "บัญชีและการเงิน (Accounting)";
      case "/employees":
        return "ทำเนียบพนักงาน (Employees)";
      case "/reports":
        return "รายงานสถิติระดับบริหาร (Executive Reports)";
      case "/settings":
        return "การตั้งค่าระบบ (Settings)";
      default:
        return "ระบบ PP HOME ERP";
    }
  };

  return (
    <header className="flex h-20 items-center justify-between border-b border-card-border bg-[#FFFFFF] px-8 shrink-0 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-card-border bg-background text-primary md:hidden transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-lg font-bold tracking-tight text-primary md:text-xl">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4.5">
        {/* Global Search Bar */}
        <div className="relative hidden md:block w-64">
          <span className="absolute inset-y-0 left-3 flex items-center text-primary/40">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="ค้นหา..."
            className="w-full rounded-xl pl-9 pr-4 py-2 text-xs bg-background border border-card-border text-foreground focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all placeholder:text-foreground/30"
          />
        </div>

        {/* Notifications Icon */}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-card-border bg-background text-primary hover:border-gold/40 hover:text-gold transition-colors">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-extrabold text-white">
            5
          </span>
        </button>

        {/* Language Switcher */}
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-card-border bg-background text-primary cursor-pointer hover:border-gold/40 transition-colors">
          <span className="text-base select-none">🇹🇭</span>
        </div>

        {/* Divider */}
        <div className="h-8 w-[1px] bg-card-border hidden sm:block" />

        {/* User Profile avatar block */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-xs font-bold text-primary">{user.displayName || "Admin"}</span>
            <span className="text-[9px] text-primary-light font-medium mt-0.5">
              {user.role === "Administrator" || !user.role ? "ผู้ดูแลระบบ" : user.role}
            </span>
          </div>
          <div className="h-9 w-9 rounded-xl border border-card-border bg-primary/5 text-primary flex items-center justify-center font-bold text-xs select-none">
            {user.displayName ? user.displayName.substring(0, 2).toUpperCase() : "AD"}
          </div>
        </div>
      </div>
    </header>
  );
}
