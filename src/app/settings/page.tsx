"use client";

import React, { useState } from "react";
import MainLayout from "@/components/MainLayout";
import { useAuth, useData, presetThemes, presetBgs, ColorTheme, BackgroundImage } from "../providers";
import { 
  Settings, 
  Shield, 
  Building, 
  Database, 
  Globe, 
  Paintbrush, 
  Image as ImageIcon,
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Check, 
  RefreshCw, 
  Heart,
  Palette,
  X
} from "lucide-react";

export default function SettingsPage() {
  const { user, isFirebase } = useAuth();
  const { 
    currentTheme,
    customThemes,
    currentBg,
    customBgs,
    selectTheme,
    addCustomTheme,
    updateCustomTheme,
    deleteCustomTheme,
    selectBg,
    addCustomBg,
    deleteCustomBg
  } = useData();
  
  // Tabs Navigation
  const [activeTab, setActiveTab] = useState<"general" | "theme" | "system">("general");

  // Company Profile Settings states
  const [companyName, setCompanyName] = useState("PP HOME CO., LTD.");
  const [branch, setBranch] = useState("กรุงเทพฯ สำนักงานใหญ่");
  const [taxId, setTaxId] = useState("0105563024890");

  // Theme Creator Form States
  const [showThemeForm, setShowThemeForm] = useState(false);
  const [editingThemeId, setEditingThemeId] = useState<string | null>(null);
  const [themeName, setThemeName] = useState("");
  const [primary, setPrimary] = useState("#0F2D24");
  const [primaryLight, setPrimaryLight] = useState("#1F5A46");
  const [gold, setGold] = useState("#D4AF37");
  const [background, setBackground] = useState("#F8F8F6");
  const [cardBg, setCardBg] = useState("#FFFFFF");
  const [foreground, setForeground] = useState("#1A1A1A");

  // Background Creator Form States
  const [showBgForm, setShowBgForm] = useState(false);
  const [bgName, setBgName] = useState("");
  const [bgUrl, setBgUrl] = useState("");

  const handleSaveCompany = () => {
    alert("บันทึกข้อมูลองค์กรและรายละเอียดระบบ ERP สำเร็จ!");
  };

  const handleSaveTheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!themeName) return;

    if (editingThemeId) {
      updateCustomTheme(editingThemeId, {
        name: themeName,
        primary,
        primaryLight,
        gold,
        background,
        cardBg,
        foreground
      });
      setEditingThemeId(null);
    } else {
      const newTheme: ColorTheme = {
        id: `theme_${Date.now()}`,
        name: themeName,
        primary,
        primaryLight,
        gold,
        background,
        cardBg,
        foreground
      };
      addCustomTheme(newTheme);
      // Select newly created theme immediately
      selectTheme(newTheme.id);
    }

    // Reset Form
    setThemeName("");
    setShowThemeForm(false);
  };

  const handleEditTheme = (theme: ColorTheme) => {
    setEditingThemeId(theme.id);
    setThemeName(theme.name);
    setPrimary(theme.primary);
    setPrimaryLight(theme.primaryLight);
    setGold(theme.gold);
    setBackground(theme.background);
    setCardBg(theme.cardBg);
    setForeground(theme.foreground);
    setShowThemeForm(true);
  };

  const handleCancelThemeEdit = () => {
    setEditingThemeId(null);
    setThemeName("");
    setShowThemeForm(false);
  };

  const handleSaveBg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bgName || !bgUrl) return;

    const newBg: BackgroundImage = {
      id: `bg_${Date.now()}`,
      name: bgName,
      url: bgUrl
    };
    addCustomBg(newBg);
    selectBg(newBg.id);

    setBgName("");
    setBgUrl("");
    setShowBgForm(false);
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6 text-left select-none">
        
        {/* Header Title */}
        <div>
          <h1 className="text-2xl font-black text-primary">ตั้งค่าและปรับแต่งระบบ</h1>
          <p className="text-xs text-foreground/50 mt-1 font-bold">
            ปรับแต่งสเปคธีม สีขององค์กร รูปภาพพื้นหลัง และจัดการบัญชีผู้ใช้งาน PP HOME ERP
          </p>
        </div>

        {/* Dynamic Tab Selector */}
        <div className="flex border-b border-card-border pb-px gap-2 text-center">
          {[
            { id: "general", title: "ข้อมูลบริษัท & องค์กร", icon: Building },
            { id: "theme", title: "ปรับแต่งธีม & สีพื้นหลัง", icon: Palette },
            { id: "system", title: "ความปลอดภัย & ระบบหลังบ้าน", icon: Shield }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-black text-xs transition-all cursor-pointer ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-foreground/45 hover:text-primary"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{tab.title}</span>
              </button>
            );
          })}
        </div>

        {/* 1. GENERAL COMPANY TAB */}
        {activeTab === "general" && (
          <div className="space-y-6 fade-in-up">
            <div className="premium-card p-6 space-y-5">
              <div className="border-b border-card-border pb-3 flex items-center gap-2">
                <Building className="h-4.5 w-4.5 text-gold" />
                <h3 className="text-xs font-black text-primary uppercase tracking-wider">โปรไฟล์ข้อมูลองค์กร</h3>
              </div>

              <div className="space-y-4 text-xs font-bold">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-foreground/45 uppercase">ชื่อบริษัทผู้มีสิทธิ์ใช้งาน</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="premium-input w-full"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-foreground/45 uppercase">ชื่อสาขา</label>
                    <input
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="premium-input w-full"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-foreground/45 uppercase">เลขประจำตัวผู้เสียภาษี (Tax ID)</label>
                    <input
                      type="text"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      className="premium-input w-full font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveCompany}
              className="w-full py-3 bg-primary text-gold border border-gold/30 rounded-xl text-xs font-black shadow-md shadow-primary/10 cursor-pointer"
            >
              บันทึกรายละเอียดข้อมูลทั่วไป
            </button>
          </div>
        )}

        {/* 2. THEME & WALLPAPER TAB */}
        {activeTab === "theme" && (
          <div className="space-y-6 fade-in-up text-xs">
            
            {/* Presets Theme selection */}
            <div className="premium-card p-6 space-y-4">
              <div className="border-b border-card-border pb-3 flex items-center gap-2">
                <Paintbrush className="h-4.5 w-4.5 text-gold" />
                <h3 className="text-xs font-black text-primary uppercase tracking-wider">เลือกโทนสีระบบสำเร็จรูป (Preset Themes)</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {presetThemes.map((theme) => {
                  const isSelected = currentTheme.id === theme.id;
                  return (
                    <div
                      key={theme.id}
                      onClick={() => selectTheme(theme.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-3 text-left ${
                        isSelected 
                          ? "bg-primary/5 border-gold ring-1 ring-gold/45 shadow-inner" 
                          : "bg-white border-card-border hover:border-gold/30 hover:bg-background/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-primary leading-tight block">{theme.name}</span>
                        {isSelected && <Check className="h-4 w-4 text-gold shrink-0 stroke-[3]" />}
                      </div>

                      {/* Color dots preview */}
                      <div className="flex gap-1.5 pt-1.5 border-t border-card-border/60">
                        <span className="h-4 w-4 rounded-full border border-card-border" style={{ backgroundColor: theme.primary }} title="Primary" />
                        <span className="h-4 w-4 rounded-full border border-card-border" style={{ backgroundColor: theme.primaryLight }} title="Secondary" />
                        <span className="h-4 w-4 rounded-full border border-card-border" style={{ backgroundColor: theme.gold }} title="Gold Accent" />
                        <span className="h-4 w-4 rounded-full border border-card-border" style={{ backgroundColor: theme.background }} title="Background" />
                        <span className="h-4 w-4 rounded-full border border-card-border" style={{ backgroundColor: theme.cardBg }} title="Card Background" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Theme selection & CRUD */}
            <div className="premium-card p-6 space-y-4">
              <div className="border-b border-card-border pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="h-4.5 w-4.5 text-gold" />
                  <h3 className="text-xs font-black text-primary uppercase tracking-wider">ธีมปรับแต่งเองภายนอก (Custom Color Themes)</h3>
                </div>
                {!showThemeForm && (
                  <button
                    onClick={() => {
                      setEditingThemeId(null);
                      setThemeName("");
                      setShowThemeForm(true);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-primary text-gold hover:bg-primary-light rounded-lg text-[10px] font-black cursor-pointer"
                  >
                    <Plus className="h-3 w-3 text-gold" />
                    <span>สร้างธีมสีใหม่</span>
                  </button>
                )}
              </div>

              {/* Theme creator/editor form popup-inline */}
              {showThemeForm && (
                <form onSubmit={handleSaveTheme} className="bg-background/40 p-4 rounded-2xl border border-card-border space-y-4">
                  <div className="flex justify-between items-center border-b border-card-border pb-2">
                    <span className="text-[10px] font-black text-primary uppercase">
                      {editingThemeId ? "แก้ไขรายละเอียดสเปคสีธีม" : "สร้างสเปคชุดสีธีมใหม่"}
                    </span>
                    <button type="button" onClick={handleCancelThemeEdit} className="text-foreground/45 hover:text-primary">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9.5px] font-black text-foreground/45 uppercase">ชื่อธีมปรับแต่ง</label>
                    <input
                      type="text"
                      value={themeName}
                      onChange={(e) => setThemeName(e.target.value)}
                      placeholder="เช่น Luxury Orange, Classic Deep Red"
                      className="premium-input w-full"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-bold">
                    {/* Primary Color */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-foreground/45 uppercase">สีหลัก (Primary)</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={primary}
                          onChange={(e) => setPrimary(e.target.value)}
                          className="w-10 h-10 p-0.5 rounded-lg border border-card-border cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          value={primary}
                          onChange={(e) => setPrimary(e.target.value)}
                          className="premium-input w-full font-mono text-center p-1"
                        />
                      </div>
                    </div>

                    {/* Secondary Color */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-foreground/45 uppercase">สีรอง (Secondary)</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={primaryLight}
                          onChange={(e) => setPrimaryLight(e.target.value)}
                          className="w-10 h-10 p-0.5 rounded-lg border border-card-border cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          value={primaryLight}
                          onChange={(e) => setPrimaryLight(e.target.value)}
                          className="premium-input w-full font-mono text-center p-1"
                        />
                      </div>
                    </div>

                    {/* Gold Accent Color */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-foreground/45 uppercase">สีทองทองเหลือง (Gold)</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={gold}
                          onChange={(e) => setGold(e.target.value)}
                          className="w-10 h-10 p-0.5 rounded-lg border border-card-border cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          value={gold}
                          onChange={(e) => setGold(e.target.value)}
                          className="premium-input w-full font-mono text-center p-1"
                        />
                      </div>
                    </div>

                    {/* Background Color */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-foreground/45 uppercase">สีพื้นหลังแอพ (Background)</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={background}
                          onChange={(e) => setBackground(e.target.value)}
                          className="w-10 h-10 p-0.5 rounded-lg border border-card-border cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          value={background}
                          onChange={(e) => setBackground(e.target.value)}
                          className="premium-input w-full font-mono text-center p-1"
                        />
                      </div>
                    </div>

                    {/* Card Bg Color */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-foreground/45 uppercase">สีพื้นหลังการ์ด (Card)</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={cardBg}
                          onChange={(e) => setCardBg(e.target.value)}
                          className="w-10 h-10 p-0.5 rounded-lg border border-card-border cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          value={cardBg}
                          onChange={(e) => setCardBg(e.target.value)}
                          className="premium-input w-full font-mono text-center p-1"
                        />
                      </div>
                    </div>

                    {/* Text Foreground Color */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-foreground/45 uppercase">สีตัวหนังสือ (Text)</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={foreground}
                          onChange={(e) => setForeground(e.target.value)}
                          className="w-10 h-10 p-0.5 rounded-lg border border-card-border cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          value={foreground}
                          onChange={(e) => setForeground(e.target.value)}
                          className="premium-input w-full font-mono text-center p-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={handleCancelThemeEdit}
                      className="px-4 py-2 border border-card-border rounded-xl text-foreground/60 hover:text-foreground cursor-pointer"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="btn-primary text-[10px] py-2 px-4 shadow-sm cursor-pointer"
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>{editingThemeId ? "บันทึกการแก้ไขสเปคสี" : "บันทึกธีมปรับแต่ง"}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Custom Themes Listing */}
              {customThemes.length === 0 ? (
                <div className="py-8 text-center text-foreground/40 font-bold border border-dashed border-card-border rounded-2xl bg-background/5 select-none">
                  ยังไม่มีธีมที่สร้างขึ้นเอง คุณสามารถคลิกสร้างธีมสีและเปลี่ยนสีได้ทันทีจากภายนอก
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {customThemes.map((theme) => {
                    const isSelected = currentTheme.id === theme.id;
                    return (
                      <div
                        key={theme.id}
                        className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-3 text-left relative ${
                          isSelected 
                            ? "bg-primary/5 border-gold ring-1 ring-gold/45 shadow-inner" 
                            : "bg-white border-card-border hover:border-gold/30 hover:bg-background/20"
                        }`}
                      >
                        <div onClick={() => selectTheme(theme.id)} className="cursor-pointer flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-primary leading-tight block pr-6 truncate">{theme.name}</span>
                            {isSelected && <Check className="h-4 w-4 text-gold shrink-0 stroke-[3]" />}
                          </div>

                          {/* Color dots preview */}
                          <div className="flex gap-1.5 pt-3 border-t border-card-border/40 mt-3">
                            <span className="h-4 w-4 rounded-full border border-card-border" style={{ backgroundColor: theme.primary }} title="Primary" />
                            <span className="h-4 w-4 rounded-full border border-card-border" style={{ backgroundColor: theme.primaryLight }} title="Secondary" />
                            <span className="h-4 w-4 rounded-full border border-card-border" style={{ backgroundColor: theme.gold }} title="Gold" />
                            <span className="h-4 w-4 rounded-full border border-card-border" style={{ backgroundColor: theme.background }} title="Background" />
                            <span className="h-4 w-4 rounded-full border border-card-border" style={{ backgroundColor: theme.cardBg }} title="Card Bg" />
                          </div>
                        </div>

                        {/* Edit / Delete actions overlay */}
                        <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1">
                          <button
                            onClick={() => handleEditTheme(theme)}
                            className="h-6 w-6 rounded bg-primary/5 text-primary hover:bg-primary hover:text-gold flex items-center justify-center transition-colors cursor-pointer"
                            title="แก้ไขสเปคสี"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => deleteCustomTheme(theme.id)}
                            className="h-6 w-6 rounded bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                            title="ลบธีม"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Presets Background wallpapers */}
            <div className="premium-card p-6 space-y-4">
              <div className="border-b border-card-border pb-3 flex items-center gap-2">
                <ImageIcon className="h-4.5 w-4.5 text-gold" />
                <h3 className="text-xs font-black text-primary uppercase tracking-wider">ภาพพื้นหลังระบบ (Wallpapers Presets)</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {/* No BG selection */}
                <div
                  onClick={() => selectBg("")}
                  className={`rounded-2xl border p-2 text-center cursor-pointer transition-all flex flex-col justify-between h-28 relative overflow-hidden ${
                    currentBg === null 
                      ? "border-gold ring-1 ring-gold/45" 
                      : "border-card-border hover:border-gold/30"
                  }`}
                >
                  <div className="flex-1 bg-zinc-200/50 rounded-xl flex items-center justify-center text-primary/40 font-black text-[9px] uppercase">
                    ไม่มีรูปพื้นหลัง
                  </div>
                  <span className="text-[9px] font-black text-primary mt-2 block truncate">ไม่มีวอลเปเปอร์</span>
                  {currentBg === null && <Check className="absolute top-2 right-2 h-4.5 w-4.5 text-gold bg-primary/90 rounded-full p-0.5 stroke-[3] z-10" />}
                </div>

                {presetBgs.map((bg) => {
                  const isSelected = currentBg?.id === bg.id;
                  const isGradient = bg.url.startsWith("radial-gradient") || bg.url.startsWith("linear-gradient");
                  return (
                    <div
                      key={bg.id}
                      onClick={() => selectBg(bg.id)}
                      className={`rounded-2xl border p-2 text-center cursor-pointer transition-all flex flex-col justify-between h-28 relative overflow-hidden ${
                        isSelected 
                          ? "border-gold ring-1 ring-gold/45" 
                          : "border-card-border hover:border-gold/30"
                      }`}
                    >
                      {isGradient ? (
                        <div 
                          className="flex-1 rounded-xl"
                          style={{ backgroundImage: bg.url }}
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={bg.url} 
                          alt={bg.name}
                          className="flex-1 w-full rounded-xl object-cover"
                        />
                      )}
                      <span className="text-[9.5px] font-black text-primary mt-2 block truncate">{bg.name.split(" (")[0]}</span>
                      {isSelected && <Check className="absolute top-2 right-2 h-4.5 w-4.5 text-gold bg-primary/90 rounded-full p-0.5 stroke-[3] z-10" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom background image URL adder */}
            <div className="premium-card p-6 space-y-4">
              <div className="border-b border-card-border pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4.5 w-4.5 text-gold" />
                  <h3 className="text-xs font-black text-primary uppercase tracking-wider">เพิ่มรูปภาพพื้นหลังเอง (Custom Wallpapers)</h3>
                </div>
                {!showBgForm && (
                  <button
                    onClick={() => setShowBgForm(true)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-primary text-gold hover:bg-primary-light rounded-lg text-[10px] font-black cursor-pointer"
                  >
                    <Plus className="h-3 w-3 text-gold" />
                    <span>เพิ่มวอลเปเปอร์</span>
                  </button>
                )}
              </div>

              {showBgForm && (
                <form onSubmit={handleSaveBg} className="bg-background/40 p-4 rounded-2xl border border-card-border space-y-4">
                  <div className="flex justify-between items-center border-b border-card-border pb-2">
                    <span className="text-[10px] font-black text-primary uppercase">เพิ่มที่อยู่วอลเปเปอร์ใหม่</span>
                    <button type="button" onClick={() => setShowBgForm(false)} className="text-foreground/45 hover:text-primary">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-bold">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-foreground/45 uppercase">ชื่อเรียกรูปภาพ</label>
                      <input
                        type="text"
                        value={bgName}
                        onChange={(e) => setBgName(e.target.value)}
                        placeholder="เช่น ดีไซน์ลอฟท์ปูนเปียก, ออฟฟิศ PP"
                        className="premium-input w-full"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-foreground/45 uppercase">ลิงก์รูปภาพ URL (Image URL)</label>
                      <input
                        type="url"
                        value={bgUrl}
                        onChange={(e) => setBgUrl(e.target.value)}
                        placeholder="เช่น https://images.unsplash.com/photo-..."
                        className="premium-input w-full text-xs font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowBgForm(false)}
                      className="px-4 py-2 border border-card-border rounded-xl text-foreground/60 hover:text-foreground cursor-pointer"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="btn-primary text-[10px] py-2 px-4 shadow-sm cursor-pointer"
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>บันทึกรูปพื้นหลัง</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Custom Bgs list */}
              {customBgs.length === 0 ? (
                <div className="py-8 text-center text-foreground/40 font-bold border border-dashed border-card-border rounded-2xl bg-background/5 select-none">
                  ยังไม่มีรูปภาพพื้นหลังที่เพิ่มเข้ามา สามารถอัปโหลดลิงก์รูปภาพมาเป็นฉากหลังระดับองค์กรได้จากภายนอก
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {customBgs.map((bg) => {
                    const isSelected = currentBg?.id === bg.id;
                    return (
                      <div
                        key={bg.id}
                        className={`rounded-2xl border p-2 text-center cursor-pointer transition-all flex flex-col justify-between h-28 relative overflow-hidden ${
                          isSelected 
                            ? "border-gold ring-1 ring-gold/45" 
                            : "border-card-border hover:border-gold/30"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={bg.url} 
                          alt={bg.name}
                          onClick={() => selectBg(bg.id)}
                          className="flex-1 w-full rounded-xl object-cover cursor-pointer"
                        />
                        <span onClick={() => selectBg(bg.id)} className="text-[9.5px] font-black text-primary mt-2 block truncate cursor-pointer pr-4">
                          {bg.name}
                        </span>
                        
                        {isSelected && <Check className="absolute top-2 right-2 h-4.5 w-4.5 text-gold bg-primary/90 rounded-full p-0.5 stroke-[3] z-10" />}

                        {/* Delete custom bg */}
                        <button
                          onClick={() => deleteCustomBg(bg.id)}
                          className="absolute right-1 bottom-1 h-5 w-5 bg-rose-50 text-rose-600 rounded hover:bg-rose-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer z-10"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* 3. SYSTEM SECURITY TAB */}
        {activeTab === "system" && (
          <div className="space-y-6 fade-in-up">
            
            {/* Database Sync */}
            <div className="premium-card p-6 space-y-5">
              <div className="border-b border-card-border pb-3 flex items-center gap-2">
                <Database className="h-4.5 w-4.5 text-gold" />
                <h3 className="text-xs font-black text-primary uppercase tracking-wider">ระบบความปลอดภัยฐานข้อมูล</h3>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-card-border bg-background/50">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-primary block">Firebase Cloud Firestore Connection</span>
                    <p className="text-[9px] text-foreground/50 font-bold">
                      {isFirebase 
                        ? "สถานะ: เชื่อมโยงฐานข้อมูล Firebase สำเร็จ การอัพเดทจะเป็นเรียลไทม์" 
                        : "สถานะ: ทำงานในระบบจำลอง (LocalStorage Demo mode)"
                      }
                    </p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border ${
                    isFirebase 
                      ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                      : "bg-amber-50 border-amber-100 text-amber-700"
                  }`}>
                    {isFirebase ? "Connected" : "Demo Mode"}
                  </span>
                </div>
              </div>
            </div>

            {/* Roster Roles */}
            <div className="premium-card p-6 space-y-5">
              <div className="border-b border-card-border pb-3 flex items-center gap-2">
                <Shield className="h-4.5 w-4.5 text-gold" />
                <h3 className="text-xs font-black text-primary uppercase tracking-wider">บัญชี & สิทธิ์ผู้ใช้งาน</h3>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-3.5 rounded-xl border border-card-border bg-background/25">
                  <span className="font-bold text-primary">สิทธิ์การดำเนินงานบัญชีปัจจุบัน</span>
                  <span className="text-primary font-black uppercase bg-primary/5 px-2 py-0.5 rounded border border-card-border">
                    {user?.role || "ผู้ดูแลระบบระดับสูง (Super Admin)"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
}
