"use client";

import React, { useState, useMemo, useEffect } from "react";
import MainLayout from "@/components/MainLayout";
import { useData } from "../providers";
import Modal from "@/components/Modal";
import { 
  Plus, Search, Edit3, UserCheck, ShieldAlert, Phone, Briefcase, 
  Trash2, Users, Calendar, DollarSign, Award, CreditCard, Heart, 
  MapPin, Activity, ChevronDown, ArrowUpDown, Info, Eye
} from "lucide-react";
import { RosterEmployee } from "@/lib/mockData";

// Preset avatars for professional woodworking / staff profiles
const AVATAR_PRESETS = [
  { name: "ช่างเทคนิค/CNC", url: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?q=80&w=150" },
  { name: "ช่างสี", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150" },
  { name: "นักออกแบบ", url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150" },
  { name: "ฝ่ายแอดมิน", url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=150" },
  { name: "วิศวกร/QC", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150" },
];

const THAI_BANKS = [
  "ธนาคารกสิกรไทย (KBank)",
  "ธนาคารไทยพาณิชย์ (SCB)",
  "ธนาคารกรุงเทพ (BBL)",
  "ธนาคารกรุงไทย (KTB)",
  "ธนาคารกรุงศรีอยุธยา (Krungsri)",
  "ธนาคารทหารไทยธนชาต (TTB)",
  "ธนาคารออมสิน (GSB)",
  "ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร (ธ.ก.ส.)",
  "ธนาคารแลนด์ แอนด์ เฮ้าส์ (LH Bank)",
  "ธนาคารเกียรตินาคินภัทร (KKP)",
  "อื่นๆ"
];

export default function EmployeesPage() {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useData();
  
  // Search, Filters & Sorting State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [deptFilter, setDeptFilter] = useState<string>("All");
  const [empTypeFilter, setEmpTypeFilter] = useState<string>("All");
  const [skillLevelFilter, setSkillLevelFilter] = useState<string>("All");
  const [sortField, setSortField] = useState<"name" | "joiningDate" | "salary">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Detail Modal & Edit Drawer State
  const [selectedEmp, setSelectedEmp] = useState<RosterEmployee | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDetailEmp, setSelectedDetailEmp] = useState<RosterEmployee | null>(null);
  const [activeTab, setActiveTab] = useState<"employment" | "personal" | "emergency">("employment");

  // Form Fields State
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"Active" | "On Leave" | "Suspended">("Active");
  const [image, setImage] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [salary, setSalary] = useState<number>(0);
  const [skills, setSkills] = useState("");
  const [citizenId, setCitizenId] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [address, setAddress] = useState("");
  const [employmentType, setEmploymentType] = useState<"Monthly" | "Daily">("Monthly");
  const [skillLevel, setSkillLevel] = useState<"Apprentice" | "Mid-Level" | "Senior" | "Master">("Mid-Level");
  const [bankName, setBankName] = useState("");
  const [bankAccountNo, setBankAccountNo] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  // Input Formatters
  const formatCitizenId = (val: string) => {
    const clean = val.replace(/\D/g, "");
    if (clean.length <= 1) return clean;
    if (clean.length <= 5) return `${clean[0]}-${clean.substring(1)}`;
    if (clean.length <= 10) return `${clean[0]}-${clean.substring(1, 5)}-${clean.substring(5)}`;
    if (clean.length <= 12) return `${clean[0]}-${clean.substring(1, 5)}-${clean.substring(5, 10)}-${clean.substring(10)}`;
    return `${clean[0]}-${clean.substring(1, 5)}-${clean.substring(5, 10)}-${clean.substring(10, 12)}-${clean[12]}`;
  };

  const formatBankAccount = (val: string) => {
    const clean = val.replace(/\D/g, "");
    if (clean.length <= 3) return clean;
    if (clean.length <= 4) return `${clean.substring(0, 3)}-${clean[3]}`;
    if (clean.length <= 9) return `${clean.substring(0, 3)}-${clean[3]}-${clean.substring(4)}`;
    return `${clean.substring(0, 3)}-${clean[3]}-${clean.substring(4, 9)}-${clean[9]}`;
  };

  const formatPhone = (val: string) => {
    const clean = val.replace(/\D/g, "");
    if (clean.length <= 3) return clean;
    if (clean.length <= 6) return `${clean.substring(0, 3)}-${clean.substring(3)}`;
    return `${clean.substring(0, 3)}-${clean.substring(3, 6)}-${clean.substring(6, 10)}`;
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

  // Open Add/Edit Actions
  const handleOpenDrawer = (emp: RosterEmployee, e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // Stop modal trigger when clicking edit button
    setSelectedEmp(emp);
    setName(emp.name);
    setNickname(emp.nickname || "");
    setDepartment(emp.department);
    setRole(emp.role);
    setPhone(formatPhone(emp.phone));
    setStatus(emp.status);
    setImage(emp.image || "");
    setJoiningDate(emp.joiningDate || new Date().toISOString().split("T")[0]);
    setSalary(emp.salary || (emp.employmentType === "Daily" ? 600 : 18000));
    setSkills(emp.skills ? emp.skills.join(", ") : "");
    setCitizenId(emp.citizenId ? formatCitizenId(emp.citizenId) : "");
    setBloodType(emp.bloodType || "");
    setAddress(emp.address || "");
    setEmploymentType(emp.employmentType || "Monthly");
    setSkillLevel(emp.skillLevel || "Mid-Level");
    setBankName(emp.bankName || "");
    setBankAccountNo(emp.bankAccountNo ? formatBankAccount(emp.bankAccountNo) : "");
    setBankAccountName(emp.bankAccountName || "");
    setEmergencyName(emp.emergencyName || "");
    setEmergencyRelation(emp.emergencyRelation || "");
    setEmergencyPhone(emp.emergencyPhone ? formatPhone(emp.emergencyPhone) : "");
    setIsDrawerOpen(true);
  };

  const handleOpenAddDrawer = () => {
    setSelectedEmp(null);
    setName("");
    setNickname("");
    setDepartment("");
    setRole("");
    setPhone("");
    setStatus("Active");
    setImage("");
    setJoiningDate(new Date().toISOString().split("T")[0]);
    setSalary(18000);
    setSkills("");
    setCitizenId("");
    setBloodType("");
    setAddress("");
    setEmploymentType("Monthly");
    setSkillLevel("Mid-Level");
    setBankName("");
    setBankAccountNo("");
    setBankAccountName("");
    setEmergencyName("");
    setEmergencyRelation("");
    setEmergencyPhone("");
    setIsDrawerOpen(true);
  };

  const handleOpenDetailModal = (emp: RosterEmployee) => {
    setSelectedDetailEmp(emp);
    setActiveTab("employment");
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !department || !role || !phone) {
      alert("กรุณากรอกข้อมูลหลักให้ครบถ้วน (ชื่อ, แผนก, ตำแหน่ง, เบอร์โทร)");
      return;
    }

    const skillsArray = skills
      ? skills.split(",").map(s => s.trim()).filter(s => s !== "")
      : [];

    const rawCitizenId = citizenId.replace(/\D/g, "");
    const rawBankAccountNo = bankAccountNo.replace(/\D/g, "");
    const rawPhone = phone.replace(/\D/g, "");
    const rawEmergencyPhone = emergencyPhone.replace(/\D/g, "");

    const payload = {
      name,
      nickname,
      department,
      role,
      phone: rawPhone,
      status,
      image: image || undefined,
      joiningDate: joiningDate || undefined,
      salary: salary || 0,
      skills: skillsArray,
      citizenId: rawCitizenId || undefined,
      bloodType: bloodType || undefined,
      address: address || undefined,
      employmentType,
      skillLevel,
      bankName: bankName || undefined,
      bankAccountNo: rawBankAccountNo || undefined,
      bankAccountName: bankAccountName || undefined,
      emergencyName: emergencyName || undefined,
      emergencyRelation: emergencyRelation || undefined,
      emergencyPhone: rawEmergencyPhone || undefined
    };

    try {
      if (selectedEmp) {
        // Edit Mode
        await updateEmployee(selectedEmp.id, payload);
        
        // Refresh local details view if currently viewed
        if (selectedDetailEmp && selectedDetailEmp.id === selectedEmp.id) {
          setSelectedDetailEmp({ id: selectedEmp.id, ...payload });
        }
        alert("บันทึกการแก้ไขข้อมูลพนักงานสำเร็จ!");
      } else {
        // Add Mode
        const newId = await addEmployee(payload);
        alert("เพิ่มพนักงานใหม่เข้าสู่ระบบสำเร็จ!");
      }
      setIsDrawerOpen(false);
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("⚠️ คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลพนักงานรายนี้ออกจากระบบโดยถาวร? ข้อมูลทั้งหมดจะไม่สามารถกู้คืนได้")) return;
    try {
      await deleteEmployee(id);
      setIsDrawerOpen(false);
      setSelectedDetailEmp(null);
      alert("ลบข้อมูลพนักงานออกจากระบบสำเร็จ!");
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  };

  // Safe Tenure Calculator
  const getTenure = (dateStr?: string) => {
    if (!dateStr) return "ไม่ระบุ";
    const join = new Date(dateStr);
    const now = new Date();
    if (isNaN(join.getTime())) return "ไม่ระบุ";

    let years = now.getFullYear() - join.getFullYear();
    let months = now.getMonth() - join.getMonth();
    let days = now.getDate() - join.getDate();

    if (days < 0) {
      months -= 1;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    if (years === 0 && months === 0) {
      const diffTime = Math.abs(now.getTime() - join.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} วัน`;
    }

    let result = "";
    if (years > 0) result += `${years} ปี `;
    if (months > 0) result += `${months} เดือน`;
    return result.trim();
  };

  // Filter & Sort Logic
  const filteredEmployees = useMemo(() => {
    return employees
      .filter(emp => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          emp.name.toLowerCase().includes(query) ||
          (emp.nickname && emp.nickname.toLowerCase().includes(query)) ||
          emp.department.toLowerCase().includes(query) ||
          emp.role.toLowerCase().includes(query) ||
          (emp.skills && emp.skills.some(s => s.toLowerCase().includes(query))) ||
          (emp.phone && emp.phone.includes(query));

        const matchesStatus = statusFilter === "All" || emp.status === statusFilter;
        const matchesDept = deptFilter === "All" || emp.department === deptFilter;
        const matchesEmpType = empTypeFilter === "All" || emp.employmentType === empTypeFilter;
        const matchesSkillLevel = skillLevelFilter === "All" || emp.skillLevel === skillLevelFilter;

        return matchesSearch && matchesStatus && matchesDept && matchesEmpType && matchesSkillLevel;
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];

        if (sortField === "salary") {
          valA = a.salary || 0;
          valB = b.salary || 0;
        } else if (sortField === "joiningDate") {
          valA = a.joiningDate || "1970-01-01";
          valB = b.joiningDate || "1970-01-01";
        } else {
          valA = a.name || "";
          valB = b.name || "";
        }

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [employees, searchQuery, statusFilter, deptFilter, empTypeFilter, skillLevelFilter, sortField, sortOrder]);

  // Statistics
  const totalCount = employees.length;
  const activeCount = employees.filter(e => e.status === "Active").length;
  const leaveCount = employees.filter(e => e.status === "On Leave").length;
  const suspendedCount = employees.filter(e => e.status === "Suspended").length;

  const departmentsList = useMemo(() => {
    const deps = new Set(employees.map(e => e.department));
    return ["All", ...Array.from(deps)];
  }, [employees]);

  // Thai Bank formatting helper for display
  const formatPhoneForDisplay = (num?: string) => {
    if (!num) return "ไม่ระบุ";
    const clean = num.replace(/\D/g, "");
    if (clean.length === 10) {
      return `${clean.substring(0, 3)}-${clean.substring(3, 6)}-${clean.substring(6)}`;
    }
    return num;
  };

  const getSkillLevelThai = (level?: string) => {
    switch (level) {
      case "Master": return "หัวหน้าช่าง (Master)";
      case "Senior": return "ช่างระดับสูง (Senior)";
      case "Mid-Level": return "ช่างระดับกลาง (Mid)";
      case "Apprentice": return "ช่างฝึกหัด (Apprentice)";
      default: return "ทั่วไป";
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 select-none text-left">
        
        {/* Page Title & Breadcrumb */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-card-border/60 pb-4">
          <div>
            <h1 className="text-2xl font-black text-primary tracking-tight">ระบบทะเบียนและจัดการกำลังพล</h1>
            <p className="text-xs text-foreground/45">บริหารจัดการข้อมูลบุคลากร ทักษะ ค่าจ้าง และข้อมูลติดต่อในระบบส่วนกลาง</p>
          </div>
          <button
            onClick={handleOpenAddDrawer}
            className="px-5 py-2.5 bg-primary text-gold border border-gold/30 rounded-xl text-xs font-black hover:bg-primary-light transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-gold/5 shrink-0"
          >
            <Plus className="h-4.5 w-4.5 text-gold" />
            <span>ลงทะเบียนพนักงานใหม่</span>
          </button>
        </div>

        {/* Premium KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 select-none">
          <div 
            onClick={() => setStatusFilter("All")}
            className={`premium-card p-4 flex items-center justify-between cursor-pointer transition-all duration-300 ${
              statusFilter === "All" 
                ? "border-gold bg-primary/10 shadow-lg -translate-y-1 ring-1 ring-gold/20" 
                : "hover:-translate-y-0.5 hover:bg-primary/5 hover:border-gold/20"
            }`}
          >
            <div className="space-y-1">
              <span className="text-[10px] font-black text-foreground/50 uppercase tracking-wider">กำลังพลรวมทั้งหมด</span>
              <h3 className="text-2xl font-black text-primary font-mono leading-none">{totalCount} <span className="text-xs font-bold text-foreground/50">คน</span></h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center border border-primary/10">
              <Users className="h-5.5 w-5.5 text-gold" />
            </div>
          </div>

          <div 
            onClick={() => setStatusFilter("Active")}
            className={`premium-card p-4 flex items-center justify-between cursor-pointer transition-all duration-300 ${
              statusFilter === "Active" 
                ? "border-emerald-500 bg-emerald-50/15 shadow-lg -translate-y-1 ring-1 ring-emerald-500/20" 
                : "hover:-translate-y-0.5 hover:bg-emerald-500/5 hover:border-emerald-500/20"
            }`}
          >
            <div className="space-y-1">
              <span className="text-[10px] font-black text-foreground/50 uppercase tracking-wider">ปฏิบัติงานปกติ (Active)</span>
              <h3 className="text-2xl font-black text-emerald-700 font-mono leading-none">{activeCount} <span className="text-xs font-bold text-foreground/50">คน</span></h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <UserCheck className="h-5.5 w-5.5 text-emerald-600" />
            </div>
          </div>

          <div 
            onClick={() => setStatusFilter("On Leave")}
            className={`premium-card p-4 flex items-center justify-between cursor-pointer transition-all duration-300 ${
              statusFilter === "On Leave" 
                ? "border-amber-500 bg-amber-50/15 shadow-lg -translate-y-1 ring-1 ring-amber-500/20" 
                : "hover:-translate-y-0.5 hover:bg-amber-500/5 hover:border-amber-500/20"
            }`}
          >
            <div className="space-y-1">
              <span className="text-[10px] font-black text-foreground/50 uppercase tracking-wider">ลางาน/พักงาน (On Leave)</span>
              <h3 className="text-2xl font-black text-amber-700 font-mono leading-none">{leaveCount} <span className="text-xs font-bold text-foreground/50">คน</span></h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Calendar className="h-5.5 w-5.5 text-amber-600" />
            </div>
          </div>

          <div 
            onClick={() => setStatusFilter("Suspended")}
            className={`premium-card p-4 flex items-center justify-between cursor-pointer transition-all duration-300 ${
              statusFilter === "Suspended" 
                ? "border-red-500 bg-red-50/15 shadow-lg -translate-y-1 ring-1 ring-red-500/20" 
                : "hover:-translate-y-0.5 hover:bg-red-500/5 hover:border-red-500/20"
            }`}
          >
            <div className="space-y-1">
              <span className="text-[10px] font-black text-foreground/50 uppercase tracking-wider">ระงับปฏิบัติการ (Suspended)</span>
              <h3 className="text-2xl font-black text-red-600 font-mono leading-none">{suspendedCount} <span className="text-xs font-bold text-foreground/50">คน</span></h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
              <ShieldAlert className="h-5.5 w-5.5 text-red-500" />
            </div>
          </div>
        </div>

        {/* Filters Controls Panel */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-card-border p-4 flex flex-col gap-4 shadow-sm select-none">
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
            
            {/* Search Input */}
            <div className="relative md:col-span-2 text-left">
              <span className="absolute inset-y-0 left-3 flex items-center text-primary/45">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อ, ชื่อเล่น, ตำแหน่ง หรือทักษะ..."
                className="w-full rounded-xl pl-9 pr-4 py-2 bg-background border border-card-border/60 text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-xs"
              />
            </div>

            {/* Department Filter */}
            <div className="flex flex-col gap-1">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="w-full rounded-xl px-3 py-2 bg-background border border-card-border/60 text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer text-xs font-bold"
              >
                <option value="All">ทุกแผนกสังกัด</option>
                {departmentsList.filter(d => d !== "All").map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Employment Type Filter */}
            <div className="flex flex-col gap-1">
              <select
                value={empTypeFilter}
                onChange={(e) => setEmpTypeFilter(e.target.value)}
                className="w-full rounded-xl px-3 py-2 bg-background border border-card-border/60 text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer text-xs font-bold"
              >
                <option value="All">ทุกประเภทสัญญาจ้าง</option>
                <option value="Monthly">พนักงานรายเดือน</option>
                <option value="Daily">พนักงานรายวัน</option>
              </select>
            </div>

            {/* Skill Level Filter */}
            <div className="flex flex-col gap-1">
              <select
                value={skillLevelFilter}
                onChange={(e) => setSkillLevelFilter(e.target.value)}
                className="w-full rounded-xl px-3 py-2 bg-background border border-card-border/60 text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer text-xs font-bold"
              >
                <option value="All">ทุกระดับช่างฝีมือ</option>
                <option value="Master">หัวหน้าช่าง (Master)</option>
                <option value="Senior">ช่างระดับสูง (Senior)</option>
                <option value="Mid-Level">ช่างระดับกลาง (Mid)</option>
                <option value="Apprentice">ช่างฝึกหัด (Apprentice)</option>
              </select>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-card-border/55 pt-3 gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black text-foreground/45 uppercase tracking-wider">จัดเรียงตาม:</span>
              
              <button
                onClick={() => {
                  if (sortField === "name") {
                    setSortOrder(o => o === "asc" ? "desc" : "asc");
                  } else {
                    setSortField("name");
                    setSortOrder("asc");
                  }
                }}
                className={`px-3 py-1 rounded-lg border text-[10px] font-bold transition-all flex items-center gap-1 ${
                  sortField === "name"
                    ? "bg-primary border-primary text-gold"
                    : "bg-white border-card-border text-foreground/70 hover:bg-background"
                }`}
              >
                ชื่อพนักงาน
                <ArrowUpDown className="h-3 w-3" />
              </button>

              <button
                onClick={() => {
                  if (sortField === "joiningDate") {
                    setSortOrder(o => o === "asc" ? "desc" : "asc");
                  } else {
                    setSortField("joiningDate");
                    setSortOrder("desc");
                  }
                }}
                className={`px-3 py-1 rounded-lg border text-[10px] font-bold transition-all flex items-center gap-1 ${
                  sortField === "joiningDate"
                    ? "bg-primary border-primary text-gold"
                    : "bg-white border-card-border text-foreground/70 hover:bg-background"
                }`}
              >
                อายุงาน / วันเข้าทำงาน
                <ArrowUpDown className="h-3 w-3" />
              </button>

              <button
                onClick={() => {
                  if (sortField === "salary") {
                    setSortOrder(o => o === "asc" ? "desc" : "asc");
                  } else {
                    setSortField("salary");
                    setSortOrder("desc");
                  }
                }}
                className={`px-3 py-1 rounded-lg border text-[10px] font-bold transition-all flex items-center gap-1 ${
                  sortField === "salary"
                    ? "bg-primary border-primary text-gold"
                    : "bg-white border-card-border text-foreground/70 hover:bg-background"
                }`}
              >
                อัตราค่าจ้าง
                <ArrowUpDown className="h-3 w-3" />
              </button>
            </div>

            <div className="text-[10px] text-foreground/50 font-bold">
              พบกำลังพลที่เข้าเกณฑ์ทั้งหมด <span className="text-primary font-bold font-mono">{filteredEmployees.length}</span> คน จากทั้งหมด {totalCount} คน
            </div>
          </div>

        </div>

        {/* Employees Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((emp) => {
            const skillLevelColor = 
              emp.skillLevel === "Master" ? "bg-amber-100 border-amber-300 text-amber-900" :
              emp.skillLevel === "Senior" ? "bg-purple-100 border-purple-300 text-purple-900" :
              emp.skillLevel === "Mid-Level" ? "bg-blue-100 border-blue-300 text-blue-900" :
              "bg-zinc-100 border-zinc-300 text-zinc-800";

            return (
              <div 
                key={emp.id}
                onClick={() => handleOpenDetailModal(emp)}
                className="premium-card p-5 flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg hover:border-gold/30 transition-all duration-300 relative group min-h-[220px] cursor-pointer"
              >
                {/* Floating Quick Action Buttons */}
                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDetailModal(emp);
                    }}
                    className="h-7.5 w-7.5 rounded-lg border border-card-border bg-white text-primary/70 hover:bg-primary/5 hover:text-gold flex items-center justify-center shadow-sm cursor-pointer"
                    title="ดูโปรไฟล์ละเอียด"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleOpenDrawer(emp, e)}
                    className="h-7.5 w-7.5 rounded-lg border border-card-border bg-white text-primary/70 hover:bg-primary/5 hover:text-gold flex items-center justify-center shadow-sm cursor-pointer"
                    title="แก้ไขข้อมูลพนักงาน"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Avatar & Header */}
                  <div className="flex items-center gap-3">
                    {emp.image ? (
                      <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-primary/20 bg-background shrink-0 shadow-sm relative">
                        <img
                          src={emp.image}
                          alt={emp.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 border border-primary/10 flex items-center justify-center text-primary font-black text-sm shrink-0 shadow-sm">
                        {emp.name.substring(0, 2)}
                      </div>
                    )}
                    <div className="space-y-0.5 text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-black text-primary leading-none">{emp.name}</span>
                        {emp.nickname && (
                          <span className="text-xs text-gold font-black">({emp.nickname})</span>
                        )}
                      </div>
                      <span className="text-[10px] text-foreground/45 font-bold uppercase tracking-wider block">{emp.department}</span>
                    </div>
                  </div>

                  {/* Level & Contract Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {emp.skillLevel && (
                      <span className={`px-2 py-0.5 rounded border text-[8px] font-black uppercase tracking-wider ${skillLevelColor}`}>
                        ⭐ {getSkillLevelThai(emp.skillLevel).split(" (")[0]}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded border text-[8px] font-black ${
                      emp.employmentType === "Daily"
                        ? "bg-teal-50 border-teal-100 text-teal-800"
                        : "bg-emerald-50 border-emerald-100 text-emerald-800"
                    }`}>
                      {emp.employmentType === "Daily" ? "พนักงานรายวัน" : "พนักงานรายเดือน"}
                    </span>
                  </div>

                  {/* Details List */}
                  <div className="space-y-2 border-t border-card-border/60 pt-3 text-[10px] text-foreground/75 text-left">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-3.5 w-3.5 text-primary/40" />
                        <span>ตำแหน่ง:</span>
                      </div>
                      <span className="font-black text-primary">{emp.role}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-primary/40" />
                        <span>อายุงาน:</span>
                      </div>
                      <span className="font-bold text-foreground/80">{getTenure(emp.joiningDate)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-3.5 w-3.5 text-primary/40" />
                        <span>อัตราค่าจ้าง:</span>
                      </div>
                      <span className="font-mono font-bold text-primary">
                        {(emp.salary || 0).toLocaleString()} บ. / {emp.employmentType === "Daily" ? "วัน" : "เดือน"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-primary/40" />
                        <span>เบอร์โทร:</span>
                      </div>
                      <span 
                        onClick={(e) => e.stopPropagation()} 
                        className="font-bold text-foreground/80 hover:text-gold"
                      >
                        <a href={`tel:${emp.phone}`}>{formatPhoneForDisplay(emp.phone)}</a>
                      </span>
                    </div>
                  </div>

                  {/* Skills Badges */}
                  {emp.skills && emp.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1.5 border-t border-card-border/40">
                      {emp.skills.slice(0, 3).map((skill, idx) => (
                        <span 
                          key={idx}
                          className="px-1.5 py-0.5 rounded bg-gold/5 border border-gold/15 text-gold text-[8px] font-extrabold uppercase tracking-wider"
                        >
                          {skill}
                        </span>
                      ))}
                      {emp.skills.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded bg-background border border-card-border text-foreground/45 text-[8px] font-bold">
                          +{emp.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                </div>

                {/* Footer Status Indicators */}
                <div className="flex items-center justify-between border-t border-card-border pt-3 mt-4 text-[9px] font-extrabold uppercase">
                  <span className="text-foreground/40 font-bold">รหัสกำลังพล: {emp.id}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      emp.status === "Active" 
                        ? "bg-emerald-500 animate-pulse" 
                        : emp.status === "On Leave"
                        ? "bg-amber-500 animate-pulse"
                        : "bg-red-500 animate-pulse"
                    }`} />
                    <span className={`px-2 py-0.5 rounded border ${
                      emp.status === "Active" 
                        ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                        : emp.status === "On Leave"
                        ? "bg-amber-50 border-amber-100 text-amber-700"
                        : "bg-red-50 border border-red-100 text-red-600"
                    }`}>
                      {emp.status === "Active" ? "ปฏิบัติงาน" : emp.status === "On Leave" ? "ลาหยุด" : "ระงับสิทธิ์"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* 1. Detailed Profile Viewer Modal */}
      <Modal
        isOpen={selectedDetailEmp !== null}
        onClose={() => setSelectedDetailEmp(null)}
        title="✨ แฟ้มประวัติกำลังพลโดยละเอียด (Employee Profile)"
        size="lg"
        type="modal"
      >
        {selectedDetailEmp && (
          <div className="text-left text-zinc-300">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-zinc-800 pb-5">
              
              {/* Photo */}
              {selectedDetailEmp.image ? (
                <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-gold/40 shadow-md shrink-0 bg-zinc-900">
                  <img
                    src={selectedDetailEmp.image}
                    alt={selectedDetailEmp.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-700 border border-zinc-700 flex items-center justify-center text-gold font-black text-2xl shrink-0 shadow-md">
                  {selectedDetailEmp.name.substring(0, 2)}
                </div>
              )}

              {/* Basic Info */}
              <div className="text-center sm:text-left space-y-1">
                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
                  <h2 className="text-xl font-black text-white">{selectedDetailEmp.name}</h2>
                  {selectedDetailEmp.nickname && (
                    <span className="px-2 py-0.5 rounded bg-gold/10 border border-gold/30 text-gold text-xs font-black">
                      ชื่อเล่น: {selectedDetailEmp.nickname}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 font-bold">{selectedDetailEmp.role} — {selectedDetailEmp.department}</p>
                <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                  <span className={`h-2 w-2 rounded-full ${
                    selectedDetailEmp.status === "Active" ? "bg-emerald-500" :
                    selectedDetailEmp.status === "On Leave" ? "bg-amber-500" : "bg-red-500"
                  }`} />
                  <span className="text-[10px] font-black text-zinc-300">
                    สถานะ: {
                      selectedDetailEmp.status === "Active" ? "ปฏิบัติงานปกติ" :
                      selectedDetailEmp.status === "On Leave" ? "ลาพักงาน" : "ระงับการทำงาน"
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Tabs Selector */}
            <div className="flex border-b border-zinc-800/80 text-xs font-black mt-4">
              <button
                onClick={() => setActiveTab("employment")}
                className={`flex-1 py-2.5 text-center border-b-2 transition-colors cursor-pointer ${
                  activeTab === "employment"
                    ? "border-gold text-gold"
                    : "border-transparent text-zinc-400 hover:text-white"
                }`}
              >
                💼 ข้อมูลการจ้างงาน & ทักษะ
              </button>
              <button
                onClick={() => setActiveTab("personal")}
                className={`flex-1 py-2.5 text-center border-b-2 transition-colors cursor-pointer ${
                  activeTab === "personal"
                    ? "border-gold text-gold"
                    : "border-transparent text-zinc-400 hover:text-white"
                }`}
              >
                💳 ประวัติส่วนตัว & การเงิน
              </button>
              <button
                onClick={() => setActiveTab("emergency")}
                className={`flex-1 py-2.5 text-center border-b-2 transition-colors cursor-pointer ${
                  activeTab === "emergency"
                    ? "border-gold text-gold"
                    : "border-transparent text-zinc-400 hover:text-white"
                }`}
              >
                🚨 ที่อยู่ & ติดต่อฉุกเฉิน
              </button>
            </div>

            {/* Tabs Content */}
            <div className="py-5 text-xs space-y-4">
              
              {/* Tab 1: Employment */}
              {activeTab === "employment" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/60">
                    <h3 className="text-[10px] font-black text-gold uppercase tracking-wider mb-2">ข้อมูลตำแหน่ง</h3>
                    <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                      <span className="text-zinc-400">แผนกสังกัด:</span>
                      <span className="font-bold text-white">{selectedDetailEmp.department}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                      <span className="text-zinc-400">ตำแหน่งงาน:</span>
                      <span className="font-bold text-white">{selectedDetailEmp.role}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                      <span className="text-zinc-400">ระดับช่างฝีมือ:</span>
                      <span className="font-bold text-white">{getSkillLevelThai(selectedDetailEmp.skillLevel)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">อายุงาน:</span>
                      <span className="font-bold text-gold">{getTenure(selectedDetailEmp.joiningDate)}</span>
                    </div>
                  </div>

                  <div className="space-y-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/60">
                    <h3 className="text-[10px] font-black text-gold uppercase tracking-wider mb-2">อัตราค่าตอบแทน</h3>
                    <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                      <span className="text-zinc-400">รูปแบบสัญญาจ้าง:</span>
                      <span className="font-bold text-white">
                        {selectedDetailEmp.employmentType === "Daily" ? "พนักงานรายวัน (Daily)" : "พนักงานรายเดือน (Monthly)"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                      <span className="text-zinc-400">อัตราค่าจ้าง:</span>
                      <span className="font-bold text-white">
                        {(selectedDetailEmp.salary || 0).toLocaleString()} บาท / {selectedDetailEmp.employmentType === "Daily" ? "วัน" : "เดือน"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">วันที่เริ่มงาน:</span>
                      <span className="font-bold text-white">{selectedDetailEmp.joiningDate || "ไม่ระบุ"}</span>
                    </div>
                  </div>

                  <div className="sm:col-span-2 space-y-2 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/60">
                    <h3 className="text-[10px] font-black text-gold uppercase tracking-wider mb-1">ทักษะและความเชี่ยวชาญ</h3>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedDetailEmp.skills && selectedDetailEmp.skills.length > 0 ? (
                        selectedDetailEmp.skills.map((skill, idx) => (
                          <span 
                            key={idx}
                            className="px-2.5 py-1 rounded bg-zinc-800 border border-zinc-700 text-gold text-[10px] font-bold"
                          >
                            🛠️ {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-zinc-500">ไม่มีระบุข้อมูลทักษะ</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Personal & Finance */}
              {activeTab === "personal" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/60">
                    <h3 className="text-[10px] font-black text-gold uppercase tracking-wider mb-2">ประวัติส่วนตัว</h3>
                    <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                      <span className="text-zinc-400">หมายเลขบัตรประชาชน:</span>
                      <span className="font-mono font-bold text-white">
                        {selectedDetailEmp.citizenId ? formatCitizenId(selectedDetailEmp.citizenId) : "ไม่ระบุ"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                      <span className="text-zinc-400">เบอร์โทรศัพท์:</span>
                      <span className="font-bold text-white hover:text-gold">
                        <a href={`tel:${selectedDetailEmp.phone}`}>{formatPhoneForDisplay(selectedDetailEmp.phone)}</a>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">หมู่เลือด (Blood Type):</span>
                      <span className="font-bold text-white font-mono">{selectedDetailEmp.bloodType || "ไม่ระบุ"}</span>
                    </div>
                  </div>

                  <div className="space-y-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/60">
                    <h3 className="text-[10px] font-black text-gold uppercase tracking-wider mb-2">ข้อมูลรับชำระเงินค่าจ้าง</h3>
                    <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                      <span className="text-zinc-400">ธนาคารปลายทาง:</span>
                      <span className="font-bold text-white">{selectedDetailEmp.bankName || "ไม่ระบุ"}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                      <span className="text-zinc-400">เลขที่บัญชีธนาคาร:</span>
                      <span className="font-mono font-bold text-white">
                        {selectedDetailEmp.bankAccountNo ? formatBankAccount(selectedDetailEmp.bankAccountNo) : "ไม่ระบุ"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">ชื่อบัญชี:</span>
                      <span className="font-bold text-white">{selectedDetailEmp.bankAccountName || "ไม่ระบุ"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Emergency & Address */}
              {activeTab === "emergency" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/60">
                    <h3 className="text-[10px] font-black text-gold uppercase tracking-wider mb-2">ผู้ติดต่อกรณีฉุกเฉิน</h3>
                    <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                      <span className="text-zinc-400">ชื่อผู้ติดต่อ:</span>
                      <span className="font-bold text-white">{selectedDetailEmp.emergencyName || "ไม่ระบุ"}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                      <span className="text-zinc-400">ความสัมพันธ์:</span>
                      <span className="font-bold text-white">{selectedDetailEmp.emergencyRelation || "ไม่ระบุ"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">เบอร์โทรศัพท์ฉุกเฉิน:</span>
                      {selectedDetailEmp.emergencyPhone ? (
                        <a 
                          href={`tel:${selectedDetailEmp.emergencyPhone}`}
                          className="font-bold text-gold flex items-center gap-1"
                        >
                          <Phone className="h-3 w-3" />
                          {formatPhoneForDisplay(selectedDetailEmp.emergencyPhone)}
                        </a>
                      ) : (
                        <span className="text-zinc-500">ไม่ระบุ</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/60">
                    <h3 className="text-[10px] font-black text-gold uppercase tracking-wider mb-2">ที่อยู่ตามทะเบียนบ้าน/ปัจจุบัน</h3>
                    <p className="text-zinc-300 leading-relaxed text-xs">
                      {selectedDetailEmp.address || "ไม่ระบุข้อมูลที่อยู่ติดต่อ"}
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Actions */}
            <div className="flex gap-3 border-t border-zinc-800 pt-4 mt-6">
              <button
                onClick={() => setSelectedDetailEmp(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-400 text-xs font-bold hover:bg-zinc-700 hover:text-white transition-colors cursor-pointer text-center"
              >
                ปิดหน้าต่าง
              </button>
              <button
                onClick={(e) => {
                  setSelectedDetailEmp(null);
                  handleOpenDrawer(selectedDetailEmp);
                }}
                className="flex-1 py-2.5 rounded-xl bg-primary text-gold border border-gold/30 text-xs font-black text-gold hover:bg-primary-light transition-all cursor-pointer text-center"
              >
                ✏️ แก้ไขข้อมูลพนักงาน
              </button>
            </div>

          </div>
        )}
      </Modal>

      {/* 2. Structured Sectioned Add/Edit Employee Drawer */}
      <Modal
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedEmp ? `✏️ แก้ไขแฟ้มประวัติ: ${selectedEmp.name}` : "ลงทะเบียนพนักงานใหม่"}
        size="md"
        type="drawer"
      >
        <form onSubmit={handleSubmit} className="space-y-5 text-left text-zinc-300 select-none pb-6">
          
          {/* Section 1: Basic Information */}
          <div className="space-y-4 border border-zinc-800 p-4 rounded-2xl bg-zinc-900/20">
            <h4 className="text-xs font-black text-gold border-b border-zinc-800/80 pb-2 flex items-center gap-1.5">
              <Info className="h-4 w-4 text-gold" />
              <span>ส่วนที่ 1: ข้อมูลประวัติทั่วไป</span>
            </h4>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">ชื่อจริง - นามสกุล *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น นายสมเกียรติ ยิ้มแย้ม"
                  className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-gold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">ชื่อเล่น</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="เช่น ช่างเกียรติ"
                  className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">เบอร์โทรศัพท์ติดต่อ *</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="08X-XXX-XXXX"
                  className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-gold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">เลขประจำตัวประชาชน</label>
                <input
                  type="text"
                  value={citizenId}
                  onChange={(e) => setCitizenId(formatCitizenId(e.target.value))}
                  placeholder="X-XXXX-XXXXX-XX-X"
                  className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">หมู่เลือด (Blood Type)</label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none cursor-pointer"
                >
                  <option value="">เลือกกรุ๊ปเลือด...</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="O">O</option>
                </select>
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">ที่อยู่ติดต่อปัจจุบัน</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="ระบุที่อยู่โดยละเอียด..."
                  rows={2}
                  className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-gold resize-none"
                />
              </div>

              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">ลิ้งค์รูปถ่ายพนักงาน (Photo URL)</label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-gold"
                />
                
                {/* Upload from local device */}
                <div className="flex flex-col gap-1.5 pt-1">
                  <span className="text-[9px] font-bold text-zinc-400">หรือ อัปโหลดรูปถ่ายพนักงานจากเครื่อง:</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, setImage)}
                    className="text-[10px] text-zinc-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:bg-zinc-800 file:text-gold hover:file:bg-zinc-700 cursor-pointer"
                  />
                </div>
                
                {/* Avatar Quick Presets */}
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-zinc-500">เลือกจากรูปโปรไฟล์สำเร็จรูปด่วน:</span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {AVATAR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImage(preset.url)}
                        className={`px-2 py-1 rounded bg-zinc-900 border text-[9px] font-bold transition-all hover:bg-zinc-800 ${
                          image === preset.url ? "border-gold text-gold" : "border-zinc-800 text-zinc-400"
                        }`}
                      >
                        👤 {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Section 2: Employment details */}
          <div className="space-y-4 border border-zinc-800 p-4 rounded-2xl bg-zinc-900/20">
            <h4 className="text-xs font-black text-gold border-b border-zinc-800/80 pb-2 flex items-center gap-1.5">
              <Briefcase className="h-4 w-4 text-gold" />
              <span>ส่วนที่ 2: ข้อมูลการจ้างงานและทักษะ</span>
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">แผนกสังกัด *</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none cursor-pointer"
                  required
                >
                  <option value="">เลือกแผนก...</option>
                  <option value="ฝ่ายตัด (CNC)">ฝ่ายตัด (CNC)</option>
                  <option value="ฝ่ายประกอบ">ฝ่ายประกอบ</option>
                  <option value="ฝ่ายสี">ฝ่ายสี</option>
                  <option value="ออกแบบ & ประเมินราคา">ออกแบบ & ประเมินราคา</option>
                  <option value="ฝ่ายควบคุมคุณภาพ (QC)">ฝ่ายควบคุมคุณภาพ (QC)</option>
                  <option value="ฝ่ายแอดมิน & ประสานงาน">ฝ่ายแอดมิน & ประสานงาน</option>
                  <option value="ช่างติดตั้งนอกสถานที่">ช่างติดตั้งนอกสถานที่</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">ตำแหน่งงาน *</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="เช่น ช่างประกอบตู้อาวุโส"
                  className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-gold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">ระดับช่างฝีมือ *</label>
                <select
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value as any)}
                  className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none cursor-pointer"
                  required
                >
                  <option value="Apprentice">ช่างฝึกหัด (Apprentice)</option>
                  <option value="Mid-Level">ช่างระดับกลาง (Mid-Level)</option>
                  <option value="Senior">ช่างระดับสูง (Senior)</option>
                  <option value="Master">หัวหน้าช่าง/ครูช่าง (Master)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">สถานะการทำงาน *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none cursor-pointer"
                  required
                >
                  <option value="Active">กำลังปฏิบัติงาน (Active)</option>
                  <option value="On Leave">ลาพักร้อน/ลาหยุด (On Leave)</option>
                  <option value="Suspended">ระงับปฏิบัติหน้าที่ (Suspended)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">ประเภทสัญญาจ้าง *</label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value as any)}
                  className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none cursor-pointer"
                  required
                >
                  <option value="Monthly">พนักงานรายเดือน</option>
                  <option value="Daily">พนักงานรายวัน</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">วันที่เริ่มปฏิบัติงาน *</label>
                <input
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-gold"
                  required
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  {employmentType === "Daily" ? "ค่าจ้างรายวัน (บาท/วัน) *" : "เงินเดือนประจำ (บาท/เดือน) *"}
                </label>
                <input
                  type="number"
                  min="0"
                  value={salary || ""}
                  onChange={(e) => setSalary(parseInt(e.target.value) || 0)}
                  placeholder={employmentType === "Daily" ? "ระบุค่าแรงต่อวัน..." : "ระบุเงินเดือน..."}
                  className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-gold"
                  required
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">ทักษะและความชำนาญหลัก (แยกด้วยเครื่องหมายจุลภาค ,)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="เช่น ทำสีพ่นไฮกลอส, ประกอบหน้าบานตู้, ใช้เลื่อยตัด CNC"
                  className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-gold"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Finance Bank Accounts */}
          <div className="space-y-4 border border-zinc-800 p-4 rounded-2xl bg-zinc-900/20">
            <h4 className="text-xs font-black text-gold border-b border-zinc-800/80 pb-2 flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-gold" />
              <span>ส่วนที่ 3: ข้อมูลบัญชีธนาคารสำหรับเงินเดือน</span>
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">ธนาคาร</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none cursor-pointer"
                >
                  <option value="">เลือกธนาคาร...</option>
                  {THAI_BANKS.map((bank) => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">เลขที่บัญชีธนาคาร</label>
                <input
                  type="text"
                  value={bankAccountNo}
                  onChange={(e) => setBankAccountNo(formatBankAccount(e.target.value))}
                  placeholder="XXX-X-XXXXX-X"
                  className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">ชื่อบัญชีธนาคาร</label>
                <input
                  type="text"
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value)}
                  placeholder="เช่น นายสมเกียรติ ยิ้มแย้ม"
                  className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-gold"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Emergency Contacts */}
          <div className="space-y-4 border border-zinc-800 p-4 rounded-2xl bg-zinc-900/20">
            <h4 className="text-xs font-black text-gold border-b border-zinc-800/80 pb-2 flex items-center gap-1.5">
              <Heart className="h-4 w-4 text-gold" />
              <span>ส่วนที่ 4: ข้อมูลติดต่อกรณีฉุกเฉิน</span>
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">ชื่อ-สกุลผู้ติดต่อกรณีฉุกเฉิน</label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="เช่น นางมะลิ ยิ้มแย้ม"
                  className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">ความสัมพันธ์</label>
                <input
                  type="text"
                  value={emergencyRelation}
                  onChange={(e) => setEmergencyRelation(e.target.value)}
                  placeholder="เช่น ภรรยา / บิดา / มารดา / บุตร"
                  className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">เบอร์โทรติดต่อฉุกเฉิน</label>
                <input
                  type="text"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(formatPhone(e.target.value))}
                  placeholder="08X-XXX-XXXX"
                  className="w-full rounded-xl px-4 py-2.5 text-xs bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-gold"
                />
              </div>
            </div>
          </div>

          {/* Drawer Actions */}
          <div className="flex flex-col gap-2 pt-4 border-t border-zinc-800/80">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-primary py-2.5 border border-gold/30 text-xs font-black text-gold hover:bg-primary-light transition-all cursor-pointer"
              >
                {selectedEmp ? "บันทึกการแก้ไขข้อมูล" : "บันทึกและลงทะเบียนใหม่"}
              </button>
            </div>
            {selectedEmp && (
              <button
                type="button"
                onClick={() => handleDelete(selectedEmp.id)}
                className="w-full mt-2 py-2.5 rounded-xl border border-red-500/30 bg-red-950/20 text-red-400 text-xs font-black hover:bg-red-950/40 hover:text-red-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                <span>ลบข้อมูลพนักงานรายนี้ออกจากระบบงานถาวร</span>
              </button>
            )}
          </div>

        </form>
      </Modal>

    </MainLayout>
  );
}
