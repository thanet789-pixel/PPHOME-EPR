"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import MainLayout from "@/components/MainLayout";
import { useData } from "../providers";
import Modal from "@/components/Modal";
import { 
  Plus, Search, Calendar, Coins, User, Clock, AlertCircle, 
  Edit3, Trash2, LayoutGrid, FolderKanban, ArrowRight, ArrowLeft,
  Eye, Image as ImageIcon, FileText, Layers, X, Users, Ruler,
  PenTool, CheckSquare, Cpu, Wrench, Truck, Shield
} from "lucide-react";
import { Project, ProjectStatus } from "@/lib/types";

// Extended Kanban statuses for Furniture manufacturing workflow with icons and phase groupings
const KANBAN_COLUMNS = [
  { id: "Lead", label: "ผู้สนใจ", color: "border-t-zinc-400 text-zinc-600 bg-zinc-50", icon: Users, phase: "Pre" },
  { id: "Survey", label: "สำรวจหน้างาน", color: "border-t-blue-500 text-blue-800 bg-blue-50/30", icon: Ruler, phase: "Pre" },
  { id: "Design", label: "เขียนแบบ", color: "border-t-pink-500 text-pink-800 bg-pink-50/30", icon: PenTool, phase: "Pre" },
  { id: "Quotation", label: "เสนอราคา", color: "border-t-purple-500 text-purple-800 bg-purple-50/30", icon: FileText, phase: "Pre" },
  { id: "Approved", label: "อนุมัติสั่งผลิต", color: "border-t-indigo-500 text-indigo-800 bg-indigo-50/30", icon: CheckSquare, phase: "Exec" },
  { id: "Production", label: "กำลังผลิต CNC", color: "border-t-amber-500 text-amber-800 bg-amber-50/30", icon: Cpu, phase: "Exec" },
  { id: "Installation", label: "กำลังติดตั้ง", color: "border-t-cyan-500 text-cyan-800 bg-cyan-50/30", icon: Wrench, phase: "Exec" },
  { id: "Completed", label: "ส่งมอบงาน", color: "border-t-green-600 text-green-800 bg-green-50/30", icon: Truck, phase: "Post" },
  { id: "Warranty", label: "รับประกัน", color: "border-t-rose-500 text-rose-800 bg-rose-50/30", icon: Shield, phase: "Post" }
];

// Presets for cover images
const PROJECT_COVER_PRESETS = [
  { name: "ห้องครัว Luxury", url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600" },
  { name: "Walk-in Closet", url: "https://images.unsplash.com/photo-1558882224-cca166733360?q=80&w=600" },
  { name: "เคาน์เตอร์กาแฟ", url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600" },
  { name: "ชั้นวางทีวีบิวท์อิน", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600" },
];

function ProjectsPageContent() {
  const { projects, customers, addProject, updateProject, deleteProject } = useData();
  const searchParams = useSearchParams();
  const projectIdParam = searchParams.get("projectId");
  const actionParam = searchParams.get("action");
  
  // Search, View, Filters & Sorting State
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "board">("board");
  const [activePhaseFilter, setActivePhaseFilter] = useState<"All" | "Pre" | "Exec" | "Post">("All");
  
  // Drawer/Form State
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Project Detail Popup Modal State
  const [selectedDetailProject, setSelectedDetailProject] = useState<Project | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    if (projectIdParam && projects && projects.length > 0) {
      const proj = projects.find((p) => p.id === projectIdParam);
      if (proj) {
        setSelectedDetailProject(proj);
      }
    }
  }, [projectIdParam, projects]);

  // Form Fields
  const [name, setName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [status, setStatus] = useState<string>("Lead");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState(0);
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState(""); // comma-separated strings
  const [formError, setFormError] = useState<string | null>(null);

  const handleOpenDrawer = (proj: Project | null = null, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (proj) {
      setSelectedProject(proj);
      setName(proj.name);
      setCustomerId(proj.customerId);
      setStatus(proj.status || "Lead");
      setStartDate(proj.startDate);
      setEndDate(proj.endDate);
      setBudget(proj.budget);
      setImage(proj.image || "");
      setDescription(proj.description || "");
      setImages(proj.images ? proj.images.join(", ") : "");
    } else {
      setSelectedProject(null);
      setName("");
      setCustomerId(customers[0]?.id || "");
      setStatus("Lead");
      setStartDate(new Date().toISOString().split("T")[0]);
      setEndDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
      setBudget(0);
      setImage("");
      setDescription("");
      setImages("");
    }
    setFormError(null);
    setIsOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsOpen(false);
    setSelectedProject(null);
  };

  useEffect(() => {
    if (actionParam === "new" || actionParam === "add") {
      handleOpenDrawer(null);
    }
  }, [actionParam]);

  const handleOpenDetailModal = (proj: Project) => {
    setSelectedDetailProject(proj);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setImageState: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("ขนาดไฟล์ภาพต้องไม่เกิน 2MB เพื่อหลีกเลี่ยงโควตาความจำระบบเต็ม");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageState(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleMultipleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const loadedBase64s: string[] = [];
    let processed = 0;
    
    const validFiles = Array.from(files).filter(file => {
      if (file.size > 2 * 1024 * 1024) {
        alert(`ไฟล์ ${file.name} มีขนาดใหญ่เกิน 2MB และจะไม่ถูกบันทึก`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          loadedBase64s.push(event.target.result as string);
        }
        processed++;
        if (processed === validFiles.length) {
          setImages(prev => {
            const existing = prev ? prev.split(",").map(s => s.trim()).filter(s => s !== "") : [];
            const combined = [...existing, ...loadedBase64s];
            return combined.join(", ");
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !customerId || !startDate || !endDate || budget <= 0) {
      setFormError("กรุณากรอกข้อมูลโครงการให้ครบทุกช่อง และระบุงบประมาณให้ถูกต้อง");
      return;
    }

    const selectedCust = customers.find((c) => c.id === customerId);
    if (!selectedCust) {
      setFormError("ข้อมูลลูกค้าที่เลือกไม่ถูกต้อง");
      return;
    }

    const customerName = selectedCust.company 
      ? `${selectedCust.name} (${selectedCust.company})`
      : selectedCust.name;

    const galleryArray = images
      ? images.split(",").map(url => url.trim()).filter(url => url !== "")
      : [];

    const payload = {
      name,
      customerId,
      customerName,
      status: status as ProjectStatus,
      startDate,
      endDate,
      budget,
      image: image || undefined,
      description: description || undefined,
      images: galleryArray.length > 0 ? galleryArray : undefined
    };

    try {
      if (selectedProject) {
        await updateProject(selectedProject.id, payload);
        
        // Refresh local details view if currently viewed
        if (selectedDetailProject && selectedDetailProject.id === selectedProject.id) {
          setSelectedDetailProject({ 
            id: selectedProject.id, 
            paidAmount: selectedProject.paidAmount, 
            createdAt: selectedProject.createdAt,
            ...payload 
          });
        }
        alert("บันทึกการแก้ไขข้อมูลโครงการสำเร็จ!");
      } else {
        await addProject(payload);
        alert("สร้างโครงการใหม่ในระบบสำเร็จ!");
      }
      handleCloseDrawer();
    } catch (err: any) {
      setFormError(err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูลโครงการ");
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm("⚠️ คุณแน่ใจหรือว่าต้องการลบโครงการนี้? ข้อมูลการเงินเบิกจ่ายทั้งหมดจะยังคงอยู่ แต่โครงการนี้จะถูกถอดออกจากระบบประวัติอย่างถาวร")) {
      try {
        await deleteProject(id);
        setSelectedDetailProject(null);
        handleCloseDrawer();
        alert("ลบข้อมูลโครงการสำเร็จ!");
      } catch (err) {
        console.error("Failed to delete project:", err);
        alert("เกิดข้อผิดพลาดในการลบโครงการ");
      }
    }
  };

  const moveProjectStage = async (proj: Project, direction: "next" | "prev", e: React.MouseEvent) => {
    e.stopPropagation();
    const currentIndex = KANBAN_COLUMNS.findIndex(col => col.id === proj.status);
    if (currentIndex === -1) return;
    
    let newIndex = currentIndex;
    if (direction === "next" && currentIndex < KANBAN_COLUMNS.length - 1) {
      newIndex = currentIndex + 1;
    } else if (direction === "prev" && currentIndex > 0) {
      newIndex = currentIndex - 1;
    }

    if (newIndex !== currentIndex) {
      const newStatus = KANBAN_COLUMNS[newIndex].id as ProjectStatus;
      await updateProject(proj.id, { status: newStatus });

      if (selectedDetailProject && selectedDetailProject.id === proj.id) {
        setSelectedDetailProject({ ...selectedDetailProject, status: newStatus });
      }
    }
  };

  // Safe checks for project statuses
  const getProjectColumn = (proj: Project) => {
    const basicMapping: Record<string, string> = {
      "Planning": "Lead",
      "In Progress": "Production",
      "Delayed": "Quotation",
      "Completed": "Completed"
    };
    return KANBAN_COLUMNS.some(col => col.id === proj.status) 
      ? proj.status 
      : (basicMapping[proj.status] || "Lead");
  };

  // Helper to calculate total/remaining days
  const getTimelineInfo = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const today = new Date();
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return { totalDays: 0, daysLeft: 0, progress: 0 };
    
    const totalTime = end.getTime() - start.getTime();
    const totalDays = Math.ceil(totalTime / (1000 * 60 * 60 * 24));
    
    const timeLeft = end.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
    
    let progress = 0;
    if (totalDays > 0) {
      const daysPassed = totalDays - (daysLeft > 0 ? daysLeft : 0);
      progress = Math.round((daysPassed / totalDays) * 100);
      if (progress > 100) progress = 100;
      if (progress < 0) progress = 0;
    }
    
    return { 
      totalDays, 
      daysLeft: daysLeft > 0 ? daysLeft : 0, 
      progress 
    };
  };

  // Filter columns based on Phase selection
  const visibleColumns = useMemo(() => {
    if (activePhaseFilter === "All") return KANBAN_COLUMNS;
    return KANBAN_COLUMNS.filter(col => col.phase === activePhaseFilter);
  }, [activePhaseFilter]);

  // Filter projects by search query
  const filteredProjects = projects.filter((p) => {
    const query = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(query) || 
           p.customerName.toLowerCase().includes(query) ||
           (p.description && p.description.toLowerCase().includes(query));
  });

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 text-left select-none">
        
        {/* Page Title & Breadcrumb */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-card-border/60 pb-4">
          <div>
            <h1 className="text-2xl font-black text-primary tracking-tight">กระดานติดตามและบริหารโครงการ</h1>
            <p className="text-xs text-foreground/45">ติดตามสถานะการออกแบบ ผลิต ติดตั้งงานบิวท์อินเฟอร์นิเจอร์ และความคืบหน้าการชำระเงิน</p>
          </div>
          
          {/* View togglers & New Project */}
          <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto">
            <div className="flex bg-white rounded-xl border border-card-border p-1 shadow-sm shrink-0">
              <button
                onClick={() => setViewMode("board")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === "board" 
                    ? "bg-primary text-gold" 
                    : "text-foreground/60 hover:text-foreground"
                }`}
              >
                <FolderKanban className="h-3.5 w-3.5" />
                <span>กระดานคัมบัง</span>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === "list" 
                    ? "bg-primary text-gold" 
                    : "text-foreground/60 hover:text-foreground"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>รายการตาราง</span>
              </button>
            </div>

            <button
              onClick={() => handleOpenDrawer(null)}
              className="px-5 py-2.5 bg-primary text-gold border border-gold/30 rounded-xl text-xs font-black hover:bg-primary-light transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Plus className="h-4.5 w-4.5 text-gold" />
              <span>สร้างโครงการใหม่</span>
            </button>
          </div>
        </div>

        {/* Controls Grid (Search & Phase Filters) */}
        <div className="flex flex-col gap-4 bg-white/80 backdrop-blur-md rounded-2xl border border-card-border p-4 shadow-sm">
          {/* Search bar */}
          <div className="relative max-w-md w-full">
            <span className="absolute inset-y-0 left-3.5 flex items-center text-primary/40">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อโครงการ หรือลูกค้ารับบริการ..."
              className="w-full rounded-xl pl-9 pr-4 py-2 text-xs bg-background border border-card-border/60 text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary text-xs"
            />
          </div>

          {/* Phase Filter Tabs (Kanban Group Toggles) */}
          {viewMode === "board" && (
            <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-wider select-none">
              <button
                onClick={() => setActivePhaseFilter("All")}
                className={`px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                  activePhaseFilter === "All"
                    ? "bg-primary border-primary text-gold shadow-sm"
                    : "bg-white border-card-border text-foreground/60 hover:bg-background"
                }`}
              >
                💼 ทั้งหมด ({projects.length})
              </button>
              <button
                onClick={() => setActivePhaseFilter("Pre")}
                className={`px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                  activePhaseFilter === "Pre"
                    ? "bg-primary border-primary text-gold shadow-sm"
                    : "bg-white border-card-border text-foreground/60 hover:bg-background"
                }`}
              >
                📐 1. เตรียมงาน & ออกแบบ ({projects.filter(p => KANBAN_COLUMNS.find(c => c.id === getProjectColumn(p))?.phase === "Pre").length})
              </button>
              <button
                onClick={() => setActivePhaseFilter("Exec")}
                className={`px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                  activePhaseFilter === "Exec"
                    ? "bg-primary border-primary text-gold shadow-sm"
                    : "bg-white border-card-border text-foreground/60 hover:bg-background"
                }`}
              >
                🛠️ 2. ผลิต & ติดตั้ง ({projects.filter(p => KANBAN_COLUMNS.find(c => c.id === getProjectColumn(p))?.phase === "Exec").length})
              </button>
              <button
                onClick={() => setActivePhaseFilter("Post")}
                className={`px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                  activePhaseFilter === "Post"
                    ? "bg-primary border-primary text-gold shadow-sm"
                    : "bg-white border-card-border text-foreground/60 hover:bg-background"
                }`}
              >
                📦 3. ส่งมอบ & ประกัน ({projects.filter(p => KANBAN_COLUMNS.find(c => c.id === getProjectColumn(p))?.phase === "Post").length})
              </button>
            </div>
          )}
        </div>

        {/* 2. KANBAN BOARD VIEW */}
        {viewMode === "board" ? (
          <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-17.5rem)] select-none">
            {visibleColumns.map((col) => {
              const colProjects = filteredProjects.filter(p => getProjectColumn(p) === col.id);
              const totalColBudget = colProjects.reduce((sum, p) => sum + p.budget, 0);

              return (
                <div 
                  key={col.id}
                  className="w-72 shrink-0 flex flex-col gap-3 rounded-2xl bg-zinc-50 border border-card-border p-3 shadow-inner"
                >
                  {/* Column header */}
                  <div className={`border-t-4 ${col.color} pt-2.5 flex flex-col gap-1.5`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <col.icon className="h-4 w-4 text-primary" />
                        <span className="text-sm font-black text-primary leading-none">{col.label}</span>
                      </div>
                      <span className="h-4.5 w-4.5 rounded-full bg-primary/5 text-primary text-xs font-bold flex items-center justify-center border border-card-border">
                        {colProjects.length}
                      </span>
                    </div>

                    {/* Column Budgets summary */}
                    {totalColBudget > 0 && (
                      <div className="flex justify-between items-center text-xs font-black text-foreground/45">
                        <span>งบประมาณสะสม:</span>
                        <span className="text-primary font-mono">{totalColBudget.toLocaleString()} บ.</span>
                      </div>
                    )}
                  </div>

                  {/* Column body (scrollable list of cards) */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {colProjects.length === 0 ? (
                      <div className="flex h-24 flex-col items-center justify-center rounded-xl border border-dashed border-card-border/70 text-xs text-foreground/30 font-semibold bg-white/50">
                        ไม่มีโครงการในขั้นนี้
                      </div>
                    ) : (
                      colProjects.map((p) => {
                        const progressPerc = p.budget > 0 ? Math.round((p.paidAmount / p.budget) * 100) : 0;
                        return (
                          <div 
                            key={p.id}
                            onClick={() => handleOpenDetailModal(p)}
                            className="rounded-xl border border-card-border bg-white p-3 shadow-sm space-y-3 hover:border-gold/30 hover:shadow-md transition-all group cursor-pointer relative"
                          >
                            {/* Project cover photo if exists */}
                            {p.image && (
                              <div className="h-24 w-full rounded-lg overflow-hidden border border-card-border/55 bg-background relative shrink-0">
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            )}

                            <div className="space-y-1">
                              <span className="text-xs text-foreground/50 font-bold block leading-none truncate mb-0.5">{p.customerName}</span>
                              <span className="text-sm font-black text-primary block leading-tight group-hover:text-gold transition-colors">{p.name}</span>
                            </div>

                            <div className="space-y-1.5 border-t border-card-border/60 pt-2 text-xs font-bold">
                              <div className="flex items-center justify-between text-foreground/50">
                                <span>งบประมาณ:</span>
                                <span className="text-primary font-mono font-black">{p.budget.toLocaleString()} บ.</span>
                              </div>
                              <div className="relative h-1.5 w-full rounded-full bg-background overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${progressPerc === 100 ? "bg-emerald-500" : "bg-gold"}`}
                                  style={{ width: `${progressPerc}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-[10px] text-foreground/40 font-semibold leading-none">
                                <span>เบิกเงิน {progressPerc}%</span>
                                <span className="font-mono">คงเหลือ {(p.budget - p.paidAmount).toLocaleString()} บ.</span>
                              </div>
                            </div>

                            {/* Actions and arrows navigation */}
                            <div className="flex items-center justify-between pt-2 border-t border-card-border/60">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenDetailModal(p);
                                  }}
                                  className="h-5.5 w-5.5 rounded bg-primary/5 text-primary border border-card-border flex items-center justify-center hover:bg-primary hover:text-gold cursor-pointer"
                                  title="ดูรายละเอียด"
                                >
                                  <Eye className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={(e) => handleOpenDrawer(p, e)}
                                  className="h-5.5 w-5.5 rounded bg-primary/5 text-primary border border-card-border flex items-center justify-center hover:bg-primary hover:text-gold cursor-pointer"
                                  title="แก้ไข"
                                >
                                  <Edit3 className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={(e) => handleDelete(p.id, e)}
                                  className="h-5.5 w-5.5 rounded bg-red-50 text-red-500 border border-red-100 flex items-center justify-center hover:bg-red-500 hover:text-white cursor-pointer"
                                  title="ลบ"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                              
                              <div className="flex gap-1">
                                <button
                                  onClick={(e) => moveProjectStage(p, "prev", e)}
                                  className="h-5 w-5 rounded-full bg-background border border-card-border flex items-center justify-center text-primary/60 hover:text-gold cursor-pointer"
                                  title="ย้อนขั้น"
                                >
                                  <ArrowLeft className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={(e) => moveProjectStage(p, "next", e)}
                                  className="h-5 w-5 rounded-full bg-background border border-card-border flex items-center justify-center text-primary/60 hover:text-gold cursor-pointer"
                                  title="เลื่อนขั้น"
                                >
                                  <ArrowRight className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* 3. TABLE/GRID LIST VIEW (Professional Data Table) */
          <div className="bg-white rounded-2xl border border-card-border shadow-sm overflow-hidden select-none">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs min-w-[900px]">
                <thead>
                  <tr className="border-b border-card-border bg-background/50 text-foreground/45 font-bold text-xs uppercase tracking-wider">
                    <th className="px-5 py-3.5">ชื่อโครงการ / ลูกค้ารับบริการ</th>
                    <th className="px-4 py-3.5">ขั้นตอนสถานะ</th>
                    <th className="px-4 py-3.5">กำหนดการและระยะเวลา</th>
                    <th className="px-4 py-3.5 text-right">งบประมาณโครงการ</th>
                    <th className="px-5 py-3.5">ความก้าวหน้าการเบิกจ่าย</th>
                    <th className="px-5 py-3.5 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border text-foreground/80 font-medium">
                  {filteredProjects.map((p) => {
                    const progressPerc = p.budget > 0 ? Math.round((p.paidAmount / p.budget) * 100) : 0;
                    const timeline = getTimelineInfo(p.startDate, p.endDate);
                    const columnLabel = KANBAN_COLUMNS.find(c => c.id === getProjectColumn(p))?.label || p.status;
                    
                    return (
                      <tr 
                        key={p.id} 
                        onClick={() => handleOpenDetailModal(p)}
                        className="hover:bg-background/40 transition-colors cursor-pointer"
                      >
                        {/* Project Name & Image */}
                        <td className="px-5 py-3 flex items-center gap-3">
                          {p.image ? (
                            <div className="h-10 w-14 rounded-lg overflow-hidden border border-card-border/80 bg-zinc-100 shrink-0">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-10 w-14 rounded-lg border border-dashed border-card-border bg-primary/5 flex items-center justify-center text-foreground/20 shrink-0">
                              <ImageIcon className="h-4 w-4" />
                            </div>
                          )}
                          <div className="text-left leading-tight">
                            <span className="text-sm font-black text-primary block">{p.name}</span>
                            <span className="text-xs text-foreground/45 font-bold block mt-0.5">{p.customerName}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <span className="px-2.5 py-0.5 rounded-lg border text-xs font-black bg-primary/5 text-primary border-card-border">
                            {columnLabel}
                          </span>
                        </td>

                        {/* Timeline */}
                        <td className="px-4 py-3 text-left">
                          <div className="text-xs font-bold text-foreground/60">{p.startDate} ถึง {p.endDate}</div>
                          <div className="flex items-center gap-1.5 mt-1 text-[10px] font-semibold text-foreground/40 leading-none">
                            <Clock className="h-3 w-3 text-primary/45" />
                            {timeline.daysLeft > 0 ? (
                              <span className="text-gold font-bold">เหลือ {timeline.daysLeft} วัน</span>
                            ) : (
                              <span className="text-emerald-600 font-bold">ส่งมอบเรียบร้อย</span>
                            )}
                            <span className="h-1.5 w-1.5 rounded-full bg-foreground/20" />
                            <span>รวม {timeline.totalDays} วัน</span>
                          </div>
                        </td>

                        {/* Budget */}
                        <td className="px-4 py-3 text-right font-mono font-black text-primary text-sm">
                          {p.budget.toLocaleString()} บาท
                        </td>

                        {/* Payment progress */}
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2 max-w-[150px]">
                            <div className="relative h-1.5 flex-1 rounded-full bg-background overflow-hidden border border-card-border/40">
                              <div 
                                className={`h-full rounded-full ${progressPerc === 100 ? "bg-emerald-500" : "bg-gold"}`}
                                style={{ width: `${progressPerc}%` }}
                              />
                            </div>
                            <span className="text-xs font-black font-mono text-primary shrink-0">{progressPerc}%</span>
                          </div>
                          <span className="text-[10px] text-foreground/40 font-semibold block mt-0.5">
                            เบิก {p.paidAmount.toLocaleString()} บ. / เหลือ {(p.budget - p.paidAmount).toLocaleString()} บ.
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenDetailModal(p)}
                              className="h-6.5 w-6.5 rounded bg-primary/5 text-primary border border-card-border flex items-center justify-center hover:bg-primary hover:text-gold cursor-pointer"
                              title="ดูรายละเอียด"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenDrawer(p)}
                              className="h-6.5 w-6.5 rounded bg-primary/5 text-primary border border-card-border flex items-center justify-center hover:bg-primary hover:text-gold cursor-pointer"
                              title="แก้ไข"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="h-6.5 w-6.5 rounded bg-red-50 text-red-500 border border-red-100 flex items-center justify-center hover:bg-red-500 hover:text-white cursor-pointer"
                              title="ลบ"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* 1. Project Detail Viewer Modal */}
      <Modal
        isOpen={selectedDetailProject !== null}
        onClose={() => setSelectedDetailProject(null)}
        title="✨ ข้อมูลโครงสร้างและประวัติโครงการโดยละเอียด (Project Sheet)"
        size="lg"
        type="modal"
      >
        {selectedDetailProject && (
          <div className="text-left text-zinc-300 space-y-4">
            
            {/* Cover Banner Area */}
            {selectedDetailProject.image ? (
              <div className="h-44 w-full rounded-xl overflow-hidden border border-zinc-800 relative shadow bg-zinc-950">
                <img
                  src={selectedDetailProject.image}
                  alt={selectedDetailProject.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                  <span className="px-2 py-0.5 rounded bg-gold text-primary text-xs font-black uppercase tracking-wider w-fit mb-1.5 shadow">
                    📌 {KANBAN_COLUMNS.find(c => c.id === getProjectColumn(selectedDetailProject))?.label || selectedDetailProject.status}
                  </span>
                  <h2 className="text-xl font-black text-white leading-tight">{selectedDetailProject.name}</h2>
                  <p className="text-xs text-zinc-300 font-bold">ลูกค้า: {selectedDetailProject.customerName}</p>
                </div>
              </div>
            ) : (
              <div className="h-28 w-full rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 flex flex-col items-center justify-center text-zinc-500 gap-1.5">
                <ImageIcon className="h-7 w-7 text-zinc-600" />
                <div>
                  <h2 className="text-base font-black text-zinc-300 text-center">{selectedDetailProject.name}</h2>
                  <p className="text-xs text-zinc-400 text-center">ลูกค้า: {selectedDetailProject.customerName}</p>
                </div>
              </div>
            )}

            {/* 9-Stage Stepper Tracker */}
            <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/60 overflow-x-auto select-none">
              <h3 className="text-xs font-black text-gold uppercase tracking-wider mb-3 flex items-center gap-1">
                <Layers className="h-4 w-4 text-gold" />
                <span>แผนภาพขั้นตอนการดำเนินโครงการ (Stage Tracker)</span>
              </h3>
              
              <div className="flex items-center justify-between min-w-[640px] pt-1">
                {KANBAN_COLUMNS.map((col, idx) => {
                  const currentStageIdx = KANBAN_COLUMNS.findIndex(c => c.id === getProjectColumn(selectedDetailProject));
                  const isCompleted = idx < currentStageIdx;
                  const isActive = idx === currentStageIdx;
                  
                  return (
                    <React.Fragment key={col.id}>
                      {/* Step Indicator */}
                      <div className="flex flex-col items-center gap-1 relative z-10">
                        <div className={`h-8 w-8 rounded-full border flex items-center justify-center transition-all ${
                          isCompleted 
                            ? "bg-emerald-950/60 border-emerald-500 text-emerald-400 font-black" 
                            : isActive 
                            ? "bg-gold/15 border-gold text-gold shadow-md shadow-gold/5 animate-pulse" 
                            : "bg-zinc-950 border-zinc-800 text-zinc-600"
                        }`}>
                          {isCompleted ? (
                            <span className="text-xs font-black">✓</span>
                          ) : (
                            <col.icon className="h-3.5 w-3.5" />
                          )}
                        </div>
                        <span className={`text-[10px] font-bold ${
                          isCompleted ? "text-emerald-500" : isActive ? "text-gold font-extrabold" : "text-zinc-500"
                        }`}>
                          {col.label}
                        </span>
                      </div>
                      
                      {/* Connecting Line */}
                      {idx < KANBAN_COLUMNS.length - 1 && (
                        <div className={`flex-1 h-[2px] mx-1 -mt-4 transition-all ${
                          idx < currentStageIdx 
                            ? "bg-emerald-600" 
                            : "bg-zinc-800"
                        }`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Content Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              
              {/* Column 1: Financial Ledger & Schedule */}
              <div className="space-y-4">
                
                {/* Financial Overview */}
                <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/60 space-y-3">
                  <h3 className="text-xs font-black text-gold uppercase tracking-wider flex items-center gap-1 border-b border-zinc-800/80 pb-2">
                    <Coins className="h-4 w-4 text-gold" />
                    <span>ข้อมูลการเงินและเบิกจ่าย</span>
                  </h3>
                  <div className="flex justify-between border-b border-zinc-800/60 pb-1.5">
                    <span className="text-zinc-400">งบประมาณรวมโครงการ:</span>
                    <span className="font-mono font-black text-white">{selectedDetailProject.budget.toLocaleString()} บาท</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-800/60 pb-1.5">
                    <span className="text-zinc-400">ชำระ/เบิกจ่ายแล้ว:</span>
                    <span className="font-mono font-bold text-emerald-400">+{selectedDetailProject.paidAmount.toLocaleString()} บาท</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">ยอดคงเหลือค้างชำระ:</span>
                    <span className="font-mono font-black text-rose-400">
                      {(selectedDetailProject.budget - selectedDetailProject.paidAmount).toLocaleString()} บาท
                    </span>
                  </div>

                  {/* Drawdown Progress Bar */}
                  <div className="space-y-1 pt-2">
                    <div className="relative h-2 w-full rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
                      <div 
                        className="h-full bg-gradient-to-r from-gold to-amber-500 rounded-full"
                        style={{ width: `${(selectedDetailProject.paidAmount / selectedDetailProject.budget) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-500 font-bold">
                      <span>เบิกเงินสะสม {Math.round((selectedDetailProject.paidAmount / selectedDetailProject.budget) * 100)}%</span>
                      <span>คงเหลือ {100 - Math.round((selectedDetailProject.paidAmount / selectedDetailProject.budget) * 100)}%</span>
                    </div>
                  </div>
                </div>

                {/* Timeline and Dates */}
                <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/60 space-y-3">
                  <h3 className="text-xs font-black text-gold uppercase tracking-wider flex items-center gap-1 border-b border-zinc-800/80 pb-2">
                    <Calendar className="h-4 w-4 text-gold" />
                    <span>ข้อมูลระยะเวลาการดำเนินงาน</span>
                  </h3>
                  <div className="flex justify-between border-b border-zinc-800/60 pb-1.5">
                    <span className="text-zinc-400">วันเริ่มสัญญางาน:</span>
                    <span className="font-bold text-white">{selectedDetailProject.startDate}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-800/60 pb-1.5">
                    <span className="text-zinc-400">กำหนดส่งมอบงาน:</span>
                    <span className="font-bold text-white">{selectedDetailProject.endDate}</span>
                  </div>
                  
                  {(() => {
                    const info = getTimelineInfo(selectedDetailProject.startDate, selectedDetailProject.endDate);
                    return (
                      <div className="space-y-2 pt-1">
                        <div className="flex justify-between">
                          <span className="text-zinc-400">ระยะเวลารวม:</span>
                          <span className="font-bold text-white">{info.totalDays} วัน</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">วันคงเหลือตามกำหนด:</span>
                          {info.daysLeft > 0 ? (
                            <span className="font-black text-gold">เหลืออีก {info.daysLeft} วัน</span>
                          ) : (
                            <span className="font-black text-emerald-400">สิ้นสุดกำหนดการแล้ว</span>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

              </div>

              {/* Column 2: Scope Description & Images Gallery */}
              <div className="space-y-4">
                
                {/* Project Scope Description */}
                <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/60 space-y-2">
                  <h3 className="text-xs font-black text-gold uppercase tracking-wider flex items-center gap-1 border-b border-zinc-800/80 pb-2">
                    <FileText className="h-4 w-4 text-gold" />
                    <span>รายละเอียดโครงการ / ขอบเขตงาน</span>
                  </h3>
                  <p className="text-zinc-300 leading-relaxed text-sm">
                    {selectedDetailProject.description || "ไม่ได้กรอกรายละเอียดขอบเขตของโครงการนี้"}
                  </p>
                </div>

                {/* Progress Gallery */}
                <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/60 space-y-2">
                  <h3 className="text-xs font-black text-gold uppercase tracking-wider flex items-center gap-1 border-b border-zinc-800/80 pb-2">
                    <ImageIcon className="h-4 w-4 text-gold" />
                    <span>รูปภาพความคืบหน้าการทำงาน ({selectedDetailProject.images?.length || 0})</span>
                  </h3>
                  
                  {selectedDetailProject.images && selectedDetailProject.images.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      {selectedDetailProject.images.map((img, idx) => (
                        <div 
                          key={idx}
                          onClick={() => setLightboxImage(img)}
                          className="h-16 rounded-lg overflow-hidden border border-zinc-800 hover:border-gold cursor-pointer transition-all bg-zinc-950 relative"
                        >
                          <img
                            src={img}
                            alt={`Progress ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-500 italic text-xs pt-1">ยังไม่มีรูปถ่ายความคืบหน้าโครงการ</p>
                  )}
                </div>

              </div>

            </div>

            {/* Bottom Modal Actions */}
            <div className="flex gap-3 border-t border-zinc-800 pt-4 mt-6">
              <button
                onClick={() => setSelectedDetailProject(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-400 text-xs font-bold hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer text-center"
              >
                ปิดหน้าต่าง
              </button>
              <button
                onClick={(e) => {
                  setSelectedDetailProject(null);
                  handleOpenDrawer(selectedDetailProject);
                }}
                className="flex-1 py-2.5 rounded-xl bg-primary text-gold border border-gold/30 text-xs font-black text-gold hover:bg-primary-light transition-all cursor-pointer text-center"
              >
                ✏️ แก้ไขข้อมูลโครงการ
              </button>
            </div>

          </div>
        )}
      </Modal>

      {/* 2. Lightbox Gallery Overlay inside Modal */}
      {lightboxImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <button 
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer shadow"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={lightboxImage}
            alt="Preview"
            className="max-h-[85vh] max-w-full object-contain rounded-lg border border-zinc-800 shadow-2xl"
          />
        </div>
      )}

      {/* 3. Slide-over Form Drawer */}
      <Modal
        isOpen={isOpen}
        onClose={handleCloseDrawer}
        title={selectedProject ? `✏️ แก้ไขโครงการ: ${selectedProject.name}` : "ลงทะเบียนสร้างโครงการใหม่"}
        size="md"
        type="drawer"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-left text-zinc-300 pb-8">
          {formError && (
            <div className="rounded-xl bg-red-950/20 border border-red-500/30 p-3 text-xs text-red-400 font-bold">
              ⚠️ {formError}
            </div>
          )}

          {/* Section 1: Basic Info */}
          <div className="space-y-4 border border-zinc-800 p-4 rounded-2xl bg-zinc-900/20">
            <h4 className="text-xs font-black text-gold border-b border-zinc-800/80 pb-2 flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-gold" />
              <span>ส่วนที่ 1: ข้อมูลโครงการหลัก</span>
            </h4>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">ชื่อโครงการ *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น บิ้วท์อินตู้วางทีวีไม้โอ๊คลายเสี้ยนดำ"
                className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-gold"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">ลูกค้าผู้รับบริการ *</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none cursor-pointer"
                required
              >
                <option value="">เลือกรายชื่อลูกค้า...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company ? `(${c.company})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">ขั้นตอนการดำเนินโครงการ *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none cursor-pointer"
                required
              >
                {KANBAN_COLUMNS.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: Planning & Timeline */}
          <div className="space-y-4 border border-zinc-800 p-4 rounded-2xl bg-zinc-900/20">
            <h4 className="text-xs font-black text-gold border-b border-zinc-800/80 pb-2 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-gold" />
              <span>ส่วนที่ 2: งบประมาณและกำหนดการ</span>
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">วันเริ่มโครงการ *</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">กำหนดส่งมอบงาน *</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">งบประมาณโครงการรวม (บาท) *</label>
              <input
                type="number"
                value={budget || ""}
                onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                placeholder="ระบุมูลค่างานสัญญาจ้าง..."
                className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-gold"
                min="1"
                required
              />
            </div>
          </div>

          {/* Section 3: Media and Description */}
          <div className="space-y-4 border border-zinc-800 p-4 rounded-2xl bg-zinc-900/20">
            <h4 className="text-xs font-black text-gold border-b border-zinc-800/80 pb-2 flex items-center gap-1.5">
              <ImageIcon className="h-4 w-4 text-gold" />
              <span>ส่วนที่ 3: ขอบเขตงานและรูปภาพประกอบ</span>
            </h4>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">รายละเอียดขอบเขตโครงการ</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ระบุข้อกำหนด ข้อมูลวัสดุ บานพับ โครงสร้างตู้ หรือแผงตกแต่งผนัง..."
                rows={3}
                className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-gold resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">ลิงก์รูปถ่ายปกโครงการ (Cover Photo URL)</label>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-gold"
              />

              {/* Upload cover image locally */}
              <div className="flex flex-col gap-1.5 pt-1">
                <span className="text-[9px] font-bold text-zinc-400">หรือ อัปโหลดรูปภาพปกจากเครื่องคอมพิวเตอร์ของคุณ:</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, setImage)}
                  className="text-[10px] text-zinc-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:bg-zinc-800 file:text-gold hover:file:bg-zinc-700 cursor-pointer"
                />
              </div>

              {/* Cover Presets */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-zinc-500">เลือกด่วนจากภาพบิวท์อินสำเร็จรูป:</span>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  {PROJECT_COVER_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImage(preset.url)}
                      className={`px-2 py-1 rounded bg-zinc-900 border text-[9px] font-bold transition-all hover:bg-zinc-800 ${
                        image === preset.url ? "border-gold text-gold" : "border-zinc-800 text-zinc-400"
                      }`}
                    >
                      🏡 {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">คลังภาพประกอบ (Gallery URLs คั่นด้วยเครื่องหมายจุลภาค ,)</label>
              <input
                type="text"
                value={images}
                onChange={(e) => setImages(e.target.value)}
                placeholder="ลิงก์รูปภาพ 1, ลิงก์รูปภาพ 2, ..."
                className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-gold"
              />

              {/* Upload gallery images locally */}
              <div className="flex flex-col gap-1.5 pt-1">
                <span className="text-[9px] font-bold text-zinc-400">หรือ เลือกรูปความคืบหน้าโครงการเพิ่มเติมจากเครื่อง:</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleMultipleImagesUpload}
                  className="text-[10px] text-zinc-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:bg-zinc-800 file:text-gold hover:file:bg-zinc-700 cursor-pointer"
                />
              </div>
              <span className="text-[8px] text-zinc-500 leading-none">สามารถใส่ลิงก์รูปถ่ายไซต์งานหลายๆ ลิงก์โดยคั่นด้วยเครื่องหมายจุลภาค (,) เพื่อแสดงผลแบบสไลด์ในหน้ารายละเอียดโครงการ</span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col gap-2 pt-4 border-t border-zinc-800/80">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCloseDrawer}
                className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-primary py-2.5 border border-gold/30 text-xs font-black text-gold hover:bg-primary-light transition-all cursor-pointer"
              >
                {selectedProject ? "บันทึกการแก้ไขโครงการ" : "บันทึกและสร้างโครงการ"}
              </button>
            </div>
            
            {selectedProject && (
              <button
                type="button"
                onClick={(e) => handleDelete(selectedProject.id, e)}
                className="w-full mt-2 py-2.5 rounded-xl border border-red-500/30 bg-red-950/20 text-red-400 text-xs font-black hover:bg-red-950/40 hover:text-red-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                <span>ลบโครงการนี้ออกจากระบบประวัติถาวร</span>
              </button>
            )}
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="flex h-[60vh] w-full items-center justify-center animate-pulse">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent" />
            <span className="text-sm font-semibold text-primary/70">กำลังโหลดระบบกระดานโครงการ...</span>
          </div>
        </div>
      </MainLayout>
    }>
      <ProjectsPageContent />
    </Suspense>
  );
}
