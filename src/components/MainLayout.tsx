"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/providers";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { 
  Package, 
  Layers, 
  CircleDollarSign, 
  Users2, 
  Landmark,
  Home,
  Calendar,
  Calculator,
  FolderKanban
} from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const mobileMenuItems = [
    { name: "หน้าหลัก", href: "/", icon: Home },
    { name: "ปฏิทิน", href: "/calendar", icon: Calendar },
    { name: "BOQ", href: "/boq", icon: Calculator },
    { name: "โครงการ", href: "/projects", icon: FolderKanban },
  ];

  // Security guard checking for logged in user session
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0F2D24]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gold border-t-transparent" />
          <span className="text-sm font-semibold text-white/70">กำลังเปิดระบบความปลอดภัย PP HOME ERP...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Let the redirect trigger in useEffect
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-transparent">
      {/* Persisted Collapsible Sidebar (Left Pane) */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content (Right Pane) */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* App Header */}
        <Header setMobileOpen={setMobileOpen} />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto px-6 py-6 pb-20">
          <div className="mx-auto max-w-7xl space-y-6 fade-in-up">
            {children}
          </div>
        </main>

        {/* Premium Bottom Status Bar */}
        <footer className="absolute bottom-0 left-0 right-0 h-14 bg-[#051A14] border-t border-white/5 hidden md:flex items-center justify-between px-6 z-30 text-white/90">
          <div className="flex items-center gap-8 overflow-x-auto no-scrollbar py-1">
            {/* Stat 1 */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gold">
                <Package className="h-4.5 w-4.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-white/40 leading-none">สินค้าทั้งหมด</span>
                <span className="text-xs font-bold mt-0.5"><span className="text-gold">152</span> รายการ</span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-6 w-[1px] bg-white/10 hidden sm:block" />

            {/* Stat 2 */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gold">
                <Layers className="h-4.5 w-4.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-white/40 leading-none">วัสดุในสต็อก</span>
                <span className="text-xs font-bold mt-0.5"><span className="text-gold">1,245</span> รายการ</span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-6 w-[1px] bg-white/10 hidden sm:block" />

            {/* Stat 3 */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gold">
                <CircleDollarSign className="h-4.5 w-4.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-white/40 leading-none">มูลค่าสต็อกรวม</span>
                <span className="text-xs font-bold mt-0.5"><span className="text-gold">2,850,000</span> บาท</span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-6 w-[1px] bg-white/10 hidden sm:block" />

            {/* Stat 4 */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gold">
                <Users2 className="h-4.5 w-4.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-white/40 leading-none">พนักงานทั้งหมด</span>
                <span className="text-xs font-bold mt-0.5"><span className="text-gold">30</span> คน</span>
              </div>
            </div>
          </div>

          {/* Logo on Right */}
          <div className="hidden md:flex items-center gap-2 text-gold">
            <Landmark className="h-4.5 w-4.5" />
            <span className="text-xs font-extrabold tracking-wider uppercase">PP HOME</span>
            <span className="text-[9px] text-white/40 font-medium tracking-widest">FURNITURE & DESIGN</span>
          </div>
        </footer>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 bg-[#051A14] border-t border-white/10 backdrop-blur-md md:hidden flex items-center justify-around px-2 shadow-2xl">
          {mobileMenuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 relative ${
                  isActive ? "text-gold" : "text-white/60 hover:text-white"
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-gold rounded-full" />
                )}
                <Icon className={`h-5 w-5 ${isActive ? "text-gold scale-110" : "text-white/60"}`} />
                <span className="text-[10px] font-semibold mt-1 tracking-wider">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
