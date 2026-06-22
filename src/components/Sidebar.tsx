"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/providers";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Calculator, 
  Box, 
  Wrench, 
  FolderKanban, 
  ShoppingCart, 
  Coins, 
  UserCheck, 
  BarChart3, 
  Settings,
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  X,
  Landmark,
  Calendar
} from "lucide-react";

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "ปฏิทินงาน", href: "/calendar", icon: Calendar },
    { name: "CRM ลูกค้า", href: "/crm", icon: Users },
    { name: "ใบเสนอราคา", href: "/quotations", icon: FileText },
    { name: "BOQ Calculator", href: "/boq", icon: Calculator },
    { name: "สต็อกวัสดุ", href: "/inventory", icon: Box },
    { name: "งานผลิต", href: "/production", icon: Wrench },
    { name: "โครงการ", href: "/projects", icon: FolderKanban },
    { name: "จัดซื้อ", href: "/purchasing", icon: ShoppingCart },
    { name: "บัญชีและการเงิน", href: "/payments", icon: Coins },
    { name: "พนักงาน", href: "/employees", icon: UserCheck },
    { name: "รายงาน", href: "/reports", icon: BarChart3 },
    { name: "ตั้งค่า", href: "/settings", icon: Settings },
  ];

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const renderSidebarContent = () => (
    <div className="flex h-full flex-col justify-between py-6 px-4 select-none">
      {/* Brand logo */}
      <div>
        <div className={`flex items-center gap-3 px-2 ${collapsed ? "justify-center" : ""}`}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-gold/90 to-amber-500 text-white font-extrabold text-xl shadow-md shadow-gold/20">
            <Landmark className="h-5.5 w-5.5 text-[#0F2D24]" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight text-white text-base leading-none">PP HOME</span>
              <span className="text-[8px] text-gold font-bold tracking-widest uppercase mt-1">Furniture & Design</span>
            </div>
          )}
        </div>

        {/* Navigation links */}
        <nav className="mt-8 space-y-1 overflow-y-auto max-h-[50vh] pr-1 scrollbar-thin">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 group ${
                  isActive
                    ? "bg-[#1F5A46] text-gold border-l-2 border-gold shadow-md shadow-black/10"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                } ${collapsed ? "justify-center" : ""}`}
                title={collapsed ? item.name : undefined}
              >
                <Icon className={`h-[16px] w-[16px] transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-gold" : "text-white/60 group-hover:text-white"}`} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Decorative Room Card at Bottom */}
      <div className="space-y-4">
        {!collapsed && (
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 p-4 flex flex-col justify-end h-32 group/card">
            {/* Background image */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover/card:scale-105"
              style={{ backgroundImage: `url('/kitchen.png')` }}
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            
            <div className="relative z-10 space-y-1">
              <span className="text-[10px] font-extrabold text-gold tracking-widest uppercase">PP HOME</span>
              <p className="text-[9px] font-semibold text-white leading-tight">Built-in Furniture</p>
              <p className="text-[8px] text-white/60 font-medium">ออกแบบอย่างพิถีพิถัน ผลิตอย่างมืออาชีพ</p>
            </div>
          </div>
        )}

        {/* User profile & logout */}
        <div className="border-t border-white/10 pt-4">
          {!collapsed ? (
            <div className="flex items-center justify-between rounded-xl bg-white/5 border border-white/5 p-2.5 mb-2">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold border border-gold/30 font-bold text-xs">
                  {user.displayName ? user.displayName[0].toUpperCase() : "U"}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-bold text-white truncate leading-none">{user.displayName}</span>
                  <span className="text-[9px] text-white/50 truncate mt-1">
                    {user.role === "Administrator" || !user.role ? "ผู้ดูแลระบบ" : user.role}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/15 text-gold border border-gold/30 font-bold text-xs">
                {user.displayName ? user.displayName[0].toUpperCase() : "U"}
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 ${
              collapsed ? "justify-center" : ""
            }`}
            title="ออกจากระบบ"
          >
            <LogOut className="h-[16px] w-[16px]" />
            {!collapsed && <span>ออกจากระบบ</span>}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile Drawer (Left sliding pane) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-[#0F2D24] border-r border-white/5 md:hidden transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-5 right-5 text-white/60 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
        {renderSidebarContent()}
      </aside>

      {/* Desktop Persistent Collapsible Sidebar */}
      <aside
        className={`hidden md:block shrink-0 border-r border-white/5 bg-[#0F2D24] transition-all duration-300 relative ${
          collapsed ? "w-20" : "w-60"
        }`}
      >
        {/* Collapse toggle button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-7 -right-3 z-30 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-[#0F2D24] text-gold hover:text-white shadow-md"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
        <div className="h-full flex flex-col justify-between">
          {renderSidebarContent()}
        </div>
      </aside>
    </>
  );
}
