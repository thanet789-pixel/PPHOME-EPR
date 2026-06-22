"use client";

import React, { useState, useEffect, useMemo } from "react";
import MainLayout from "@/components/MainLayout";
import { useData } from "../providers";
import Modal from "@/components/Modal";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Tag, 
  MapPin, 
  CheckCircle,
  AlertCircle,
  FileText,
  Search,
  Users,
  Trash2,
  Check,
  Edit3,
  X,
  Phone,
  SlidersHorizontal,
  Briefcase,
  User,
  Info
} from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;  // YYYY-MM-DD
  startTime?: string; // HH:MM
  endTime?: string;   // HH:MM
  type: "survey" | "delivery" | "payment" | "milestone" | "meeting" | "other";
  status: "pending" | "completed" | "cancelled";
  notes?: string;
  customerId?: string;
  customerName?: string;
  projectId?: string;
  projectName?: string;
  assignees?: string[]; // Employee IDs
  location?: string;
  isSystemGenerated?: boolean;
}

export default function CalendarPage() {
  const { projects, payments, employees, customers } = useData();

  // Core navigation states
  const [viewMode, setViewMode] = useState<"month" | "week" | "day" | "agenda">("month");
  const [currentDate, setCurrentDate] = useState<Date>(new Date("2026-06-21")); // Set to active June 2026 ERP timeline
  const [selectedDateStr, setSelectedDateStr] = useState<string>("2026-06-21");
  
  // Custom events stored locally
  const [customEvents, setCustomEvents] = useState<CalendarEvent[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilters, setTypeFilters] = useState<string[]>([
    "survey", "delivery", "payment", "milestone", "meeting", "other"
  ]);
  const [statusFilters, setStatusFilters] = useState<string[]>([
    "pending", "completed", "cancelled"
  ]);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | null>(null);

  // Modal State & Form Values
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formType, setFormType] = useState<CalendarEvent["type"]>("survey");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formStartTime, setFormStartTime] = useState("");
  const [formEndTime, setFormEndTime] = useState("");
  const [formIsAllDay, setFormIsAllDay] = useState(false);
  const [formNotes, setFormNotes] = useState("");
  const [formCustomerId, setFormCustomerId] = useState("");
  const [formCustomerName, setFormCustomerName] = useState("");
  const [formProjectId, setFormProjectId] = useState("");
  const [formProjectName, setFormProjectName] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formStatus, setFormStatus] = useState<CalendarEvent["status"]>("pending");
  const [formAssignees, setFormAssignees] = useState<string[]>([]);

  // Load custom events from LocalStorage
  useEffect(() => {
    const localVal = localStorage.getItem("pphome_calendar_events");
    if (localVal) {
      try {
        setCustomEvents(JSON.parse(localVal));
      } catch (e) {
        console.error("Error reading calendar events", e);
      }
    } else {
      // Seed default mockup events for June 2026
      const seedEvents: CalendarEvent[] = [
        {
          id: "mock_1",
          title: "วัดขนาดตู้ครัวคอนโดลุมพินี",
          startDate: "2026-06-15",
          endDate: "2026-06-15",
          startTime: "10:00",
          endTime: "12:00",
          type: "survey",
          status: "completed",
          notes: "สเก็ตช์วัดระยะท่อน้ำและตำแหน่งปลั๊กเตาไฟฟ้า",
          customerName: "คุณสมชาย ใจดี",
          location: "88 Sukhumvit Rd, Khlong Toei, Bangkok 10110",
          assignees: ["emp_4", "emp_2"]
        },
        {
          id: "mock_2",
          title: "สำรวจพื้นที่บิ้วท์อินบ้านเดี่ยวแสนสิริ",
          startDate: "2026-06-22",
          endDate: "2026-06-22",
          startTime: "14:00",
          endTime: "16:30",
          type: "survey",
          status: "pending",
          notes: "คุยสไตล์การตกแต่งห้องนั่งเล่นและห้องนอนใหญ่",
          customerName: "คุณวิภา รุ่งเรือง",
          location: "456 Sathorn N Rd, Bang Rak, Bangkok 10500",
          assignees: ["emp_4"]
        },
        {
          id: "mock_3",
          title: "ส่งมอบติดตั้งตู้ทีวี Thonglor Penthouse",
          startDate: "2026-06-25",
          endDate: "2026-06-25",
          startTime: "13:00",
          endTime: "17:00",
          type: "delivery",
          status: "pending",
          notes: "ทีมช่างหน้างานแจ้งส่งงานช่วงบ่าย",
          customerName: "คุณสมชาย ใจดี",
          location: "88 Sukhumvit Rd, Khlong Toei, Bangkok 10110",
          assignees: ["emp_2", "emp_3"]
        },
        {
          id: "mock_4",
          title: "ประกอบบานประตูตู้เสื้อผ้าหน้างาน",
          startDate: "2026-06-18",
          endDate: "2026-06-18",
          startTime: "09:00",
          endTime: "12:00",
          type: "milestone",
          status: "completed",
          notes: "ประกอบบานตู้เสื้อผ้าและฟิตติ้งแม่เหล็กที่โรงงาน",
          assignees: ["emp_2"]
        },
        {
          id: "mock_5",
          title: "ประชุมสรุปแบบดีไซน์ Luxury Penthouse",
          startDate: "2026-06-21",
          endDate: "2026-06-21",
          startTime: "10:30",
          endTime: "12:00",
          type: "meeting",
          status: "pending",
          notes: "ประชุมทีมสรุปแบบสเปควัสดุ HMR พ่นสีพรีเมียมสีเขียว Forest Green",
          assignees: ["emp_4", "emp_5"]
        },
        {
          id: "mock_6",
          title: "ตรวจรับไม้บอร์ด HMR และกาวที่คลังสินค้า",
          startDate: "2026-06-21",
          endDate: "2026-06-21",
          startTime: "14:00",
          endTime: "15:30",
          type: "other",
          status: "completed",
          notes: "เช็คสเปคและความเรียบร้อยของไม้โครงยางพาราที่นำเข้ามาสำหรับงานครัว",
          assignees: ["emp_1", "emp_5"]
        }
      ];
      localStorage.setItem("pphome_calendar_events", JSON.stringify(seedEvents));
      setCustomEvents(seedEvents);
    }
  }, []);

  // Save helper
  const saveEventsLocally = (newEvents: CalendarEvent[]) => {
    setCustomEvents(newEvents);
    localStorage.setItem("pphome_calendar_events", JSON.stringify(newEvents));
  };

  // Compile System-Generated Events + Custom Events
  const allEvents = useMemo(() => {
    const list: CalendarEvent[] = [...customEvents];

    // 1. Project start & end dates
    projects.forEach(p => {
      if (p.startDate) {
        list.push({
          id: `proj_start_${p.id}`,
          title: `เริ่มโครงการ: ${p.name}`,
          startDate: p.startDate,
          endDate: p.startDate,
          type: "milestone",
          status: p.status === "Completed" ? "completed" : "pending",
          notes: `ระบบอัตโนมัติ: แผนงานเริ่มดำเนินโครงการสำหรับ ${p.customerName}`,
          customerName: p.customerName.split(" (")[0],
          projectId: p.id,
          isSystemGenerated: true
        });
      }
      if (p.endDate) {
        list.push({
          id: `proj_end_${p.id}`,
          title: `กำหนดส่งมอบโครงการ: ${p.name}`,
          startDate: p.endDate,
          endDate: p.endDate,
          type: "delivery",
          status: p.status === "Completed" ? "completed" : "pending",
          notes: `ระบบอัตโนมัติ: กำหนดนัดส่งมอบชิ้นงาน/ติดตั้งเฟอร์นิเจอร์และปิดโครงการ`,
          customerName: p.customerName.split(" (")[0],
          projectId: p.id,
          isSystemGenerated: true
        });
      }
    });

    // 2. Payment due dates
    payments.forEach(pay => {
      if (pay.dueDate) {
        list.push({
          id: `pay_due_${pay.id}`,
          title: `เรียกเก็บเงิน: ${pay.type} (${pay.amount.toLocaleString()} บ.)`,
          startDate: pay.dueDate,
          endDate: pay.dueDate,
          type: "payment",
          status: pay.status === "Paid" ? "completed" : pay.status === "Overdue" ? "cancelled" : "pending",
          notes: `ระบบอัตโนมัติ: นัดชำระค่างวดงานเฟอร์นิเจอร์ โครงการ "${pay.projectName}" ของลูกค้า ${pay.customerName}`,
          customerName: pay.customerName,
          projectId: pay.projectId,
          isSystemGenerated: true
        });
      }
    });

    return list;
  }, [customEvents, projects, payments]);

  // Apply filters & search
  const filteredEvents = useMemo(() => {
    return allEvents.filter(ev => {
      // 1. Search Query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchTitle = ev.title.toLowerCase().includes(query);
        const matchNotes = ev.notes?.toLowerCase().includes(query) || false;
        const matchCustomer = ev.customerName?.toLowerCase().includes(query) || false;
        const matchProject = ev.projectName?.toLowerCase().includes(query) || false;
        const matchLoc = ev.location?.toLowerCase().includes(query) || false;
        if (!matchTitle && !matchNotes && !matchCustomer && !matchProject && !matchLoc) {
          return false;
        }
      }

      // 2. Type Filter
      if (!typeFilters.includes(ev.type)) {
        return false;
      }

      // 3. Status Filter
      if (!statusFilters.includes(ev.status)) {
        return false;
      }

      // 4. Employee/Assignee Filter
      if (selectedAssigneeId) {
        if (!ev.assignees || !ev.assignees.includes(selectedAssigneeId)) {
          return false;
        }
      }

      return true;
    });
  }, [allEvents, searchQuery, typeFilters, statusFilters, selectedAssigneeId]);

  // Metrics summary calculated from the active month
  const activeMonthStats = useMemo(() => {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    const monthEvs = filteredEvents.filter(e => {
      const d = new Date(e.startDate);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    const total = monthEvs.length;
    const surveys = monthEvs.filter(e => e.type === "survey").length;
    const deliveries = monthEvs.filter(e => e.type === "delivery").length;
    const completed = monthEvs.filter(e => e.status === "completed").length;

    return { total, surveys, deliveries, completed };
  }, [filteredEvents, currentDate]);

  // Calendar Utility Calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  const dayNames = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

  const handleNavigate = (direction: "prev" | "next") => {
    if (viewMode === "month") {
      setCurrentDate(new Date(year, month + (direction === "next" ? 1 : -1), 1));
    } else if (viewMode === "week") {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7));
      setCurrentDate(newDate);
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + (direction === "next" ? 1 : -1));
      setCurrentDate(newDate);
    }
  };

  const handleGoToToday = () => {
    setCurrentDate(new Date("2026-06-21"));
    setSelectedDateStr("2026-06-21");
  };

  // Month View Days generator
  const monthCells = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    
    // Padding
    for (let i = 0; i < firstDay; i++) {
      cells.push(null);
    }
    // Days
    for (let i = 1; i <= totalDays; i++) {
      cells.push(new Date(year, month, i));
    }
    return cells;
  }, [year, month]);

  // Week View Days generator
  const weekDays = useMemo(() => {
    const start = new Date(currentDate);
    const day = start.getDay(); // 0: Sun, 1: Mon...
    start.setDate(start.getDate() - day); // Align to Sunday
    
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      days.push(new Date(start));
      start.setDate(start.getDate() + 1);
    }
    return days;
  }, [currentDate]);

  // Get events on a specific day string
  const getEventsForDate = (dateStr: string) => {
    return filteredEvents.filter(e => e.startDate === dateStr);
  };

  // Visual event types theme matching design
  const typeThemes: Record<string, { bg: string, text: string, border: string, dot: string, title: string }> = {
    survey: { 
      bg: "bg-cyan-50/70", 
      text: "text-cyan-800", 
      border: "border-cyan-200 border-l-cyan-500", 
      dot: "bg-cyan-500",
      title: "วัดหน้างาน" 
    },
    delivery: { 
      bg: "bg-emerald-50/70", 
      text: "text-emerald-800", 
      border: "border-emerald-200 border-l-emerald-500", 
      dot: "bg-emerald-500",
      title: "ติดตั้ง/จัดส่ง" 
    },
    payment: { 
      bg: "bg-purple-50/70", 
      text: "text-purple-800", 
      border: "border-purple-200 border-l-purple-500", 
      dot: "bg-purple-500",
      title: "ค่างวดเงิน" 
    },
    milestone: { 
      bg: "bg-amber-50/70", 
      text: "text-amber-800", 
      border: "border-amber-200 border-l-amber-500", 
      dot: "bg-amber-500",
      title: "แผนงานหลัก" 
    },
    meeting: { 
      bg: "bg-blue-50/70", 
      text: "text-blue-800", 
      border: "border-blue-200 border-l-blue-500", 
      dot: "bg-blue-500",
      title: "ประชุมทีม" 
    },
    other: { 
      bg: "bg-zinc-50", 
      text: "text-zinc-700", 
      border: "border-zinc-200 border-l-zinc-500", 
      dot: "bg-zinc-500",
      title: "อื่นๆ" 
    }
  };

  // Status Labels in Thai
  const statusLabels = {
    pending: { label: "รอดำเนินการ", style: "bg-amber-100 text-amber-800 border-amber-200" },
    completed: { label: "เสร็จสิ้น", style: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    cancelled: { label: "ยกเลิก", style: "bg-rose-100 text-rose-800 border-rose-200" }
  };

  // Position calculation helper for Week & Day grids (Time: 08:00 - 19:00, 11 hours)
  const getEventPosition = (startTime?: string, endTime?: string) => {
    if (!startTime) return { top: "0%", height: "100%" };
    
    const startParts = startTime.split(":");
    const endParts = (endTime || "18:00").split(":");
    
    const startHour = parseFloat(startParts[0]) + parseFloat(startParts[1] || "0") / 60;
    const endHour = parseFloat(endParts[0]) + parseFloat(endParts[1] || "0") / 60;
    
    const minHour = 8;
    const maxHour = 19;
    const totalHours = maxHour - minHour;
    
    const start = Math.max(minHour, Math.min(maxHour, startHour));
    const end = Math.max(minHour, Math.min(maxHour, endHour));
    const duration = Math.max(0.5, end - start); // Min 30 mins
    
    const topPercent = ((start - minHour) / totalHours) * 100;
    const heightPercent = (duration / totalHours) * 100;
    
    return {
      top: `${topPercent}%`,
      height: `${heightPercent}%`
    };
  };

  // Form Operations
  const handleOpenCreateModal = (dateStr?: string) => {
    const defaultDate = dateStr || selectedDateStr;
    setFormTitle("");
    setFormType("survey");
    setFormStartDate(defaultDate);
    setFormEndDate(defaultDate);
    setFormStartTime("09:00");
    setFormEndTime("11:00");
    setFormIsAllDay(false);
    setFormNotes("");
    setFormCustomerId("");
    setFormCustomerName("");
    setFormProjectId("");
    setFormProjectName("");
    setFormLocation("");
    setFormStatus("pending");
    setFormAssignees([]);
    setSelectedEvent(null);
    setIsCreateOpen(true);
  };

  const handleOpenEditModal = (ev: CalendarEvent) => {
    setSelectedEvent(ev);
    setFormTitle(ev.title);
    setFormType(ev.type);
    setFormStartDate(ev.startDate);
    setFormEndDate(ev.endDate || ev.startDate);
    setFormStartTime(ev.startTime || "09:00");
    setFormEndTime(ev.endTime || "11:00");
    setFormIsAllDay(!ev.startTime);
    setFormNotes(ev.notes || "");
    setFormCustomerId(ev.customerId || "");
    setFormCustomerName(ev.customerName || "");
    setFormProjectId(ev.projectId || "");
    setFormProjectName(ev.projectName || "");
    setFormLocation(ev.location || "");
    setFormStatus(ev.status);
    setFormAssignees(ev.assignees || []);
    setIsEditOpen(true);
  };

  // Auto fill when project changes
  const handleProjectChange = (projId: string) => {
    setFormProjectId(projId);
    if (!projId) {
      setFormProjectName("");
      return;
    }
    const proj = projects.find(p => p.id === projId);
    if (proj) {
      setFormProjectName(proj.name);
      setFormCustomerId(proj.customerId);
      setFormCustomerName(proj.customerName.split(" (")[0]);
      // Attempt to load customer default address as site location
      const cust = customers.find(c => c.id === proj.customerId);
      if (cust) {
        setFormLocation(cust.address);
      }
    }
  };

  // Auto fill when customer changes
  const handleCustomerChange = (custId: string) => {
    setFormCustomerId(custId);
    if (!custId) {
      setFormCustomerName("");
      return;
    }
    const cust = customers.find(c => c.id === custId);
    if (cust) {
      setFormCustomerName(cust.name);
      setFormLocation(cust.address);
    }
  };

  // Multiple Assignees selection handler
  const handleToggleAssignee = (empId: string) => {
    if (formAssignees.includes(empId)) {
      setFormAssignees(formAssignees.filter(id => id !== empId));
    } else {
      setFormAssignees([...formAssignees, empId]);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formStartDate) return;

    const newEv: CalendarEvent = {
      id: `custom_${Date.now()}`,
      title: formTitle,
      type: formType,
      startDate: formStartDate,
      endDate: formEndDate || formStartDate,
      startTime: formIsAllDay ? undefined : formStartTime,
      endTime: formIsAllDay ? undefined : formEndTime,
      notes: formNotes,
      customerId: formCustomerId || undefined,
      customerName: formCustomerName || undefined,
      projectId: formProjectId || undefined,
      projectName: formProjectName || undefined,
      location: formLocation || undefined,
      status: formStatus,
      assignees: formAssignees
    };

    saveEventsLocally([newEv, ...customEvents]);
    setIsCreateOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || selectedEvent.isSystemGenerated) return;

    const updatedEv: CalendarEvent = {
      ...selectedEvent,
      title: formTitle,
      type: formType,
      startDate: formStartDate,
      endDate: formEndDate || formStartDate,
      startTime: formIsAllDay ? undefined : formStartTime,
      endTime: formIsAllDay ? undefined : formEndTime,
      notes: formNotes,
      customerId: formCustomerId || undefined,
      customerName: formCustomerName || undefined,
      projectId: formProjectId || undefined,
      projectName: formProjectName || undefined,
      location: formLocation || undefined,
      status: formStatus,
      assignees: formAssignees
    };

    const nextEvents = customEvents.map(ev => ev.id === selectedEvent.id ? updatedEv : ev);
    saveEventsLocally(nextEvents);
    setIsEditOpen(false);
  };

  const handleDeleteEvent = () => {
    if (!selectedEvent || selectedEvent.isSystemGenerated) return;
    const nextEvents = customEvents.filter(ev => ev.id !== selectedEvent.id);
    saveEventsLocally(nextEvents);
    setIsEditOpen(false);
  };

  const handleToggleStatus = (ev: CalendarEvent) => {
    if (ev.isSystemGenerated) return;
    const nextStatus: CalendarEvent["status"] = ev.status === "completed" ? "pending" : "completed";
    const updated: CalendarEvent = { ...ev, status: nextStatus };
    const nextEvents = customEvents.map(item => item.id === ev.id ? updated : item);
    saveEventsLocally(nextEvents);
  };

  // Toggle checklist mock for Day View side panel
  const [dayChecklist, setDayChecklist] = useState<Record<string, boolean>>({
    confirm: true,
    load: false,
    arrive: false,
    report: false
  });

  const toggleChecklist = (key: string) => {
    setDayChecklist({ ...dayChecklist, [key]: !dayChecklist[key] });
  };

  // Active day events list
  const activeDayEvents = useMemo(() => {
    const list = getEventsForDate(selectedDateStr);
    return list.sort((a, b) => (a.startTime || "00:00").localeCompare(b.startTime || "00:00"));
  }, [selectedDateStr, filteredEvents]);

  return (
    <MainLayout>
      <div className="space-y-6">
        
        {/* Page Top Header with Title & Stats Widget */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
          <div>
            <h1 className="text-2xl font-black text-primary">ปฏิทินปฏิบัติงาน & คิวจัดส่ง</h1>
            <p className="text-xs text-foreground/50 mt-1 font-bold">
              PP HOME ERP • ตารางนัดสำรวจหน้างานคิวติดตั้งและกำหนดชำระค่างวด
            </p>
          </div>
          <button 
            onClick={() => handleOpenCreateModal()}
            className="btn-primary text-xs font-black shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4 text-gold" />
            <span>สร้างตารางนัดหมาย</span>
          </button>
        </div>

        {/* Analytics Top Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left select-none">
          <div 
            onClick={() => {
              setTypeFilters(["survey", "delivery", "payment", "milestone", "meeting", "other"]);
              setStatusFilters(["pending", "completed", "cancelled"]);
            }}
            className="bg-white border border-card-border rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-gold/30 hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
              <CalendarIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="text-[10px] text-foreground/45 font-black uppercase tracking-wider block">นัดหมายทั้งหมด (เดือนนี้)</span>
              <span className="text-lg font-black text-primary">{activeMonthStats.total} รายการ</span>
            </div>
          </div>
          <div 
            onClick={() => {
              setTypeFilters(["survey"]);
              setStatusFilters(["pending", "completed", "cancelled"]);
            }}
            className="bg-white border border-card-border rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-gold/30 hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="h-10 w-10 rounded-xl bg-cyan-50 flex items-center justify-center shrink-0">
              <Search className="h-5 w-5 text-cyan-600" />
            </div>
            <div>
              <span className="text-[10px] text-foreground/45 font-black uppercase tracking-wider block">สำรวจหน้างาน (Survey)</span>
              <span className="text-lg font-black text-cyan-800">{activeMonthStats.surveys} งาน</span>
            </div>
          </div>
          <div 
            onClick={() => {
              setTypeFilters(["delivery"]);
              setStatusFilters(["pending", "completed", "cancelled"]);
            }}
            className="bg-white border border-card-border rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-gold/30 hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <span className="text-[10px] text-foreground/45 font-black uppercase tracking-wider block">คิวติดตั้ง & จัดส่ง (Delivery)</span>
              <span className="text-lg font-black text-emerald-800">{activeMonthStats.deliveries} ครั้ง</span>
            </div>
          </div>
          <div 
            onClick={() => {
              setStatusFilters(["completed"]);
              setTypeFilters(["survey", "delivery", "payment", "milestone", "meeting", "other"]);
            }}
            className="bg-white border border-card-border rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-gold/30 hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
              <CheckCircle className="h-5 w-5 text-gold" />
            </div>
            <div>
              <span className="text-[10px] text-foreground/45 font-black uppercase tracking-wider block">ดำเนินการสำเร็จแล้ว</span>
              <span className="text-lg font-black text-primary">{activeMonthStats.completed} นัดหมาย</span>
            </div>
          </div>
        </div>

        {/* Main Work Area */}
        <div className="flex flex-col xl:flex-row gap-6">
          
          {/* Left Filter & Team Sidebar */}
          <div className="w-full xl:w-72 shrink-0 space-y-5 text-left">
            
            {/* Search and Core Filters Card */}
            <div className="bg-white border border-card-border rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-card-border pb-3">
                <SlidersHorizontal className="h-4 w-4 text-gold" />
                <h3 className="text-xs font-black text-primary uppercase tracking-wider">แผงควบคุมตัวกรอง</h3>
              </div>

              {/* Keyword Search */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-foreground/45 uppercase tracking-wide">ค้นหาคำสำคัญ</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ค้นหา ชื่องาน ลูกค้า ที่อยู่..."
                    className="w-full rounded-xl bg-background border border-card-border pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-gold/50"
                  />
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-foreground/40" />
                </div>
              </div>

              {/* Event Type Filters */}
              <div className="space-y-2 pt-2 border-t border-card-border/60">
                <label className="text-[10px] font-black text-foreground/45 uppercase tracking-wide block">ประเภทงานนัดหมาย</label>
                <div className="space-y-1.5">
                  {Object.entries(typeThemes).map(([type, theme]) => {
                    const checked = typeFilters.includes(type);
                    return (
                      <label key={type} className="flex items-center gap-2.5 text-xs text-foreground/75 cursor-pointer hover:text-primary transition-colors">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setTypeFilters(checked ? typeFilters.filter(t => t !== type) : [...typeFilters, type]);
                          }}
                          className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                        />
                        <span className={`h-2.5 w-2.5 rounded-full ${theme.dot}`} />
                        <span className="font-semibold">{theme.title}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Status Filters */}
              <div className="space-y-2 pt-2 border-t border-card-border/60">
                <label className="text-[10px] font-black text-foreground/45 uppercase tracking-wide block">สถานะนัดหมาย</label>
                <div className="space-y-1.5">
                  {[
                    { val: "pending", name: "รอดำเนินการ (Pending)" },
                    { val: "completed", name: "ดำเนินการเสร็จสิ้น (Completed)" },
                    { val: "cancelled", name: "ยกเลิกการนัด (Cancelled)" }
                  ].map((s) => {
                    const checked = statusFilters.includes(s.val);
                    return (
                      <label key={s.val} className="flex items-center gap-2.5 text-xs text-foreground/75 cursor-pointer hover:text-primary transition-colors">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setStatusFilters(checked ? statusFilters.filter(item => item !== s.val) : [...statusFilters, s.val]);
                          }}
                          className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                        />
                        <span className="font-semibold">{s.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Team Roster Filter Card */}
            <div className="bg-white border border-card-border rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-card-border pb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gold" />
                  <h3 className="text-xs font-black text-primary uppercase tracking-wider">ช่าง & พนักงานหน้างาน</h3>
                </div>
                {selectedAssigneeId && (
                  <button 
                    onClick={() => setSelectedAssigneeId(null)}
                    className="text-[9px] text-gold font-black hover:underline"
                  >
                    ล้างการเลือก
                  </button>
                )}
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {employees.map((emp) => {
                  const isSelected = selectedAssigneeId === emp.id;
                  
                  // Calculate tasks assigned to this employee this month
                  const empTasks = filteredEvents.filter(ev => ev.assignees?.includes(emp.id)).length;

                  return (
                    <div
                      key={emp.id}
                      onClick={() => setSelectedAssigneeId(isSelected ? null : emp.id)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 text-left ${
                        isSelected 
                          ? "bg-primary border-gold text-white" 
                          : "bg-background/40 border-card-border hover:border-gold/30 hover:bg-background/70"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          isSelected ? "bg-gold text-primary" : "bg-primary text-gold"
                        }`}>
                          {emp.name.split(" ")[0].slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-[10px] font-black truncate block leading-tight ${isSelected ? "text-white" : "text-primary"}`}>
                            {emp.name}
                          </p>
                          <span className={`text-[8px] font-bold block ${isSelected ? "text-white/60" : "text-foreground/40"}`}>
                            {emp.role}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[8px] font-black ${
                        isSelected ? "bg-white/10 text-gold" : "bg-primary/5 text-primary"
                      }`}>
                        {empTasks} งาน
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Main Calendar Grid Sheet */}
          <div className="flex-1 min-w-0 bg-white border border-card-border rounded-2xl p-5 shadow-sm flex flex-col gap-4 overflow-hidden">
            
            {/* Toolbar Month Selector + View Mode Switcher */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-card-border pb-4">
              
              {/* Month Navigation */}
              <div className="flex items-center gap-3 self-center md:self-auto">
                <CalendarIcon className="h-5 w-5 text-gold shrink-0" />
                <h2 className="text-base font-black text-primary uppercase select-none w-44 text-center md:text-left">
                  {viewMode === "month" && `${monthNames[month]} ${year + 543}`}
                  {viewMode === "week" && `สัปดาห์ที่ 3 • ${monthNames[month]} ${year + 543}`}
                  {viewMode === "day" && `${new Date(selectedDateStr).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })}`}
                  {viewMode === "agenda" && "รายการนัดหมายทั้งหมด"}
                </h2>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleNavigate("prev")}
                    className="h-8 w-8 rounded-lg border border-card-border flex items-center justify-center text-primary/70 hover:bg-primary/5 hover:text-gold transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleGoToToday}
                    className="px-2.5 py-1.5 rounded-lg border border-card-border text-[9px] font-black text-primary/70 hover:bg-primary/5 hover:text-gold transition-colors cursor-pointer"
                  >
                    วันนี้
                  </button>
                  <button
                    onClick={() => handleNavigate("next")}
                    className="h-8 w-8 rounded-lg border border-card-border flex items-center justify-center text-primary/70 hover:bg-primary/5 hover:text-gold transition-colors cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* View Switcher Tabs */}
              <div className="bg-background p-1 rounded-xl flex items-center self-stretch md:self-auto gap-0.5 text-center">
                {[
                  { id: "month", title: "รายเดือน" },
                  { id: "week", title: "รายสัปดาห์" },
                  { id: "day", title: "รายวัน" },
                  { id: "agenda", title: "ตารางสรุป" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setViewMode(tab.id as any)}
                    className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                      viewMode === tab.id
                        ? "bg-primary text-gold shadow-sm"
                        : "text-foreground/50 hover:text-primary"
                    }`}
                  >
                    {tab.title}
                  </button>
                ))}
              </div>
            </div>

            {/* View Render Logic */}
            <div className="flex-1 overflow-y-auto">
              
              {/* 1. MONTH VIEW */}
              {viewMode === "month" && (
                <div className="flex flex-col gap-2">
                  
                  {/* Days of week header */}
                  <div className="grid grid-cols-7 text-center text-[10px] font-black uppercase text-foreground/45 border-b border-card-border pb-2">
                    {dayNames.map(d => <div key={d}>{d}</div>)}
                  </div>

                  {/* Month Grid Cells */}
                  <div className="grid grid-cols-7 gap-2 min-h-[480px]">
                    {monthCells.map((cell, idx) => {
                      if (cell === null) {
                        return (
                          <div 
                            key={`empty_${idx}`} 
                            className="rounded-xl border border-dashed border-card-border/40 bg-background/20 min-h-[80px]"
                          />
                        );
                      }

                      const cellStr = cell.toISOString().split("T")[0];
                      const cellEvents = getEventsForDate(cellStr);
                      const isSelected = selectedDateStr === cellStr;
                      const isToday = cellStr === "2026-06-21";

                      return (
                        <div
                          key={cellStr}
                          onClick={() => {
                            setSelectedDateStr(cellStr);
                          }}
                          onDoubleClick={() => handleOpenCreateModal(cellStr)}
                          className={`rounded-xl border p-2 flex flex-col justify-between cursor-pointer min-h-[90px] transition-all hover:shadow-sm text-left ${
                            isSelected 
                              ? "bg-primary/5 border-gold ring-1 ring-gold/45"
                              : isToday
                              ? "border-primary bg-primary/5"
                              : "border-card-border hover:border-gold/30 hover:bg-background/30"
                          }`}
                        >
                          {/* Cell top header */}
                          <div className="flex justify-between items-center leading-none">
                            <span className={`text-[10px] font-black h-5 w-5 flex items-center justify-center rounded-full ${
                              isToday ? "bg-primary text-gold" : "text-primary"
                            }`}>
                              {cell.getDate()}
                            </span>
                            {cellEvents.length > 0 && (
                              <span className="text-[8px] font-black text-foreground/40">
                                {cellEvents.length} งาน
                              </span>
                            )}
                          </div>

                          {/* Event list (compact capsules) */}
                          <div className="space-y-1 mt-2 flex-1 flex flex-col justify-end overflow-hidden max-h-[60px]">
                            {cellEvents.slice(0, 2).map((ev) => {
                              const theme = typeThemes[ev.type] || typeThemes.other;
                              return (
                                <div
                                  key={ev.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEditModal(ev);
                                  }}
                                  className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${theme.bg} ${theme.text} ${theme.border} border-l-2 truncate block leading-tight hover:brightness-95`}
                                >
                                  {ev.startTime ? `${ev.startTime} ` : ""}{ev.title}
                                </div>
                              );
                            })}
                            {cellEvents.length > 2 && (
                              <div className="text-[7.5px] text-foreground/45 font-black text-center pt-0.5">
                                + อีก {cellEvents.length - 2} รายการ
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. WEEK VIEW (Professional Timetable Layout) */}
              {viewMode === "week" && (
                <div className="flex flex-col h-[580px] overflow-x-auto min-w-[700px] border border-card-border rounded-xl">
                  
                  {/* Grid Columns Header */}
                  <div className="grid grid-cols-8 border-b border-card-border bg-background/50 sticky top-0 z-10">
                    <div className="border-r border-card-border p-2.5 text-center text-[9px] font-black text-foreground/40 uppercase">เวลา</div>
                    {weekDays.map((day, idx) => {
                      const dayStr = day.toISOString().split("T")[0];
                      const isToday = dayStr === "2026-06-21";
                      return (
                        <div 
                          key={idx}
                          className={`p-2.5 text-center border-r border-card-border text-xs font-black select-none ${
                            isToday ? "bg-primary/5 text-gold border-r-gold" : "text-primary"
                          }`}
                        >
                          <span className="block text-[9px] text-foreground/40 font-bold uppercase">{dayNames[day.getDay()]}</span>
                          <span className={`${isToday ? "underline decoration-gold decoration-2" : ""}`}>{day.getDate()}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Grid Timeline Slots */}
                  <div className="flex-1 flex relative h-[500px]">
                    
                    {/* Time sidebar */}
                    <div className="w-[12.5%] shrink-0 border-r border-card-border bg-background/10 flex flex-col justify-between text-center select-none py-1 text-[9px] font-bold text-foreground/40">
                      {Array.from({ length: 11 }).map((_, idx) => (
                        <div key={idx} className="h-10 flex items-center justify-center border-b border-card-border/30">
                          {String(idx + 8).padStart(2, "0")}:00 น.
                        </div>
                      ))}
                    </div>

                    {/* Columns grid */}
                    <div className="flex-1 grid grid-cols-7 relative">
                      
                      {/* Drawing Grid Horizontal lines */}
                      {Array.from({ length: 11 }).map((_, idx) => (
                        <div 
                          key={idx}
                          className="absolute left-0 right-0 border-b border-card-border/30 pointer-events-none"
                          style={{ top: `${(idx / 11) * 100}%` }}
                        />
                      ))}

                      {/* Day Event Containers */}
                      {weekDays.map((day, dIdx) => {
                        const dayStr = day.toISOString().split("T")[0];
                        const dayEvents = getEventsForDate(dayStr);
                        const timedEvents = dayEvents.filter(e => e.startTime);
                        const allDayEvents = dayEvents.filter(e => !e.startTime);

                        return (
                          <div 
                            key={dIdx}
                            onClick={() => handleOpenCreateModal(dayStr)}
                            className="relative border-r border-card-border/60 h-full cursor-pointer hover:bg-background/10 transition-colors"
                          >
                            
                            {/* All day events capsule block */}
                            {allDayEvents.length > 0 && (
                              <div className="absolute top-1 left-0.5 right-0.5 z-10 space-y-1 pointer-events-auto">
                                {allDayEvents.map(ev => {
                                  const theme = typeThemes[ev.type] || typeThemes.other;
                                  return (
                                    <div
                                      key={ev.id}
                                      onClick={(e) => { e.stopPropagation(); handleOpenEditModal(ev); }}
                                      className={`text-[7px] font-black px-1 py-0.5 rounded truncate border ${theme.bg} ${theme.text} ${theme.border} cursor-pointer`}
                                    >
                                      📌 {ev.title}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Timed events absolutely mapped */}
                            {timedEvents.map(ev => {
                              const pos = getEventPosition(ev.startTime, ev.endTime);
                              const theme = typeThemes[ev.type] || typeThemes.other;
                              return (
                                <div
                                  key={ev.id}
                                  onClick={(e) => { e.stopPropagation(); handleOpenEditModal(ev); }}
                                  className={`absolute left-1 right-1 rounded-lg p-2 border-l-4 shadow-xs hover:shadow transition-all overflow-hidden flex flex-col justify-between cursor-pointer ${theme.bg} ${theme.text} ${theme.border} text-left`}
                                  style={{ top: pos.top, height: pos.height }}
                                >
                                  <div className="min-w-0">
                                    <span className="text-[7.5px] font-black opacity-60 block truncate">
                                      {ev.startTime} - {ev.endTime}
                                    </span>
                                    <h4 className="text-[9px] font-extrabold truncate mt-0.5 text-primary leading-tight">
                                      {ev.title}
                                    </h4>
                                  </div>
                                  {ev.customerName && (
                                    <span className="text-[7px] font-bold block truncate opacity-70 mt-1">
                                      👤 {ev.customerName}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. DAY VIEW TIMELINE & OPERATION PANE */}
              {viewMode === "day" && (
                <div className="flex flex-col lg:flex-row gap-6 h-[500px]">
                  
                  {/* Left: Timeline grid (60% width) */}
                  <div className="flex-1 flex border border-card-border rounded-xl overflow-hidden relative">
                    
                    {/* Time labels */}
                    <div className="w-20 border-r border-card-border bg-background/25 flex flex-col justify-between py-2 text-center text-[10px] font-bold text-foreground/40">
                      {Array.from({ length: 11 }).map((_, idx) => (
                        <div key={idx} className="h-10 flex items-center justify-center">
                          {String(idx + 8).padStart(2, "0")}:00
                        </div>
                      ))}
                    </div>

                    {/* Timeline box */}
                    <div className="flex-1 relative bg-white">
                      
                      {/* Horizontal lines */}
                      {Array.from({ length: 11 }).map((_, idx) => (
                        <div 
                          key={idx}
                          className="absolute left-0 right-0 border-b border-card-border/30 pointer-events-none"
                          style={{ top: `${(idx / 11) * 100}%` }}
                        />
                      ))}

                      {/* Day events blocks */}
                      <div className="absolute inset-0 p-1">
                        {activeDayEvents.map(ev => {
                          const pos = getEventPosition(ev.startTime, ev.endTime);
                          const theme = typeThemes[ev.type] || typeThemes.other;
                          return (
                            <div
                              key={ev.id}
                              onClick={() => handleOpenEditModal(ev)}
                              className={`absolute left-2 right-2 rounded-xl p-3 border-l-4 shadow-sm hover:shadow transition-all flex justify-between items-start cursor-pointer text-left ${theme.bg} ${theme.text} ${theme.border}`}
                              style={{ top: pos.top, height: pos.height }}
                            >
                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3 w-3 opacity-60" />
                                  <span className="text-[9px] font-black uppercase tracking-wide">
                                    {ev.startTime ? `${ev.startTime} - ${ev.endTime}` : "ทั้งวัน"}
                                  </span>
                                  {ev.isSystemGenerated && (
                                    <span className="text-[7.5px] bg-primary/10 text-primary border border-primary/20 px-1 rounded font-black">ดึงข้อมูลระบบ</span>
                                  )}
                                </div>
                                <h4 className="text-xs font-black text-primary truncate">{ev.title}</h4>
                                {ev.location && (
                                  <div className="flex items-center gap-1 text-[8.5px] opacity-75 truncate">
                                    <MapPin className="h-2.5 w-2.5 shrink-0" />
                                    <span>{ev.location}</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-2.5 shrink-0">
                                {ev.customerName && (
                                  <div className="text-right hidden sm:block">
                                    <span className="text-[8px] text-foreground/40 font-bold block leading-none">ลูกค้า</span>
                                    <span className="text-[10px] font-black text-primary">{ev.customerName}</span>
                                  </div>
                                )}
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black border ${statusLabels[ev.status].style}`}>
                                  {statusLabels[ev.status].label}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                        {activeDayEvents.length === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center text-xs text-foreground/40 font-bold border border-dashed border-card-border m-2 rounded-xl">
                            ไม่มีกำหนดนัดหมายในวันที่เลือก
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Operational Panel (40% width) */}
                  <div className="w-full lg:w-80 shrink-0 bg-background/50 border border-card-border rounded-xl p-4 flex flex-col gap-4 text-left">
                    <div className="border-b border-card-border pb-2.5">
                      <h4 className="text-xs font-black text-primary uppercase">ขั้นตอนปฏิบัติตามแผนติดตั้ง</h4>
                      <p className="text-[9px] text-foreground/45 mt-0.5">โปรเช็คเช็คลิสต์เมื่อทีมช่างหน้างานดำเนินขั้นตอน</p>
                    </div>

                    {/* Operational Checklists */}
                    <div className="space-y-2">
                      {[
                        { key: "confirm", text: "โทรคอนเฟิร์มและยืนยันเวลานัดหมายล่วงหน้า 24 ชม." },
                        { key: "load", text: "ตรวจรับไม้/ฟิตติ้งและโหลดขึ้นรถกระบะขนส่ง" },
                        { key: "arrive", text: "ทีมช่างเดินทางถึงสถานที่นัดหมายหน้างาน" },
                        { key: "report", text: "ตรวจความเรียบร้อยและถ่ายภาพบันทึกส่งรายงานลูกค้า" }
                      ].map((item) => (
                        <div 
                          key={item.key}
                          onClick={() => toggleChecklist(item.key)}
                          className="flex items-start gap-3 p-2.5 bg-white border border-card-border rounded-xl cursor-pointer hover:border-gold/30 transition-colors"
                        >
                          <div className={`h-4.5 w-4.5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                            dayChecklist[item.key] ? "bg-primary border-primary text-gold" : "border-card-border text-transparent"
                          }`}>
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                          <span className={`text-[10px] font-bold leading-snug ${dayChecklist[item.key] ? "text-foreground/40 line-through" : "text-foreground"}`}>
                            {item.text}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Assigned Personnel contacts */}
                    <div className="mt-2 flex-1 flex flex-col justify-end">
                      <h5 className="text-[10px] font-black text-primary uppercase tracking-wider mb-2">เจ้าหน้าที่ผู้รับผิดชอบงานวันนี้</h5>
                      
                      <div className="space-y-2 bg-white p-3 rounded-xl border border-card-border">
                        {employees.slice(0, 2).map((emp) => (
                          <div key={emp.id} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-primary text-gold flex items-center justify-center text-[9px] font-bold">
                                {emp.name.split(" ")[0].slice(0, 2)}
                              </div>
                              <div>
                                <p className="text-[9.5px] font-black text-primary leading-tight">{emp.name}</p>
                                <span className="text-[8px] text-foreground/40 block leading-none">{emp.role}</span>
                              </div>
                            </div>
                            <a 
                              href={`tel:${emp.phone}`}
                              className="h-6 w-6 rounded-lg bg-primary/5 text-primary hover:bg-primary hover:text-gold flex items-center justify-center transition-colors"
                            >
                              <Phone className="h-3 w-3" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. AGENDA / LEDGER LIST VIEW */}
              {viewMode === "agenda" && (
                <div className="space-y-5 text-left">
                  
                  {/* Table Headers */}
                  <div className="grid grid-cols-12 text-[10px] font-black uppercase text-foreground/45 border-b border-card-border pb-2 px-3">
                    <div className="col-span-2">เวลา / วันที่</div>
                    <div className="col-span-1">ประเภท</div>
                    <div className="col-span-3">ชื่องานนัดหมาย</div>
                    <div className="col-span-2">ลูกค้า & โครงการ</div>
                    <div className="col-span-2">พนักงานคุมงาน</div>
                    <div className="col-span-1 text-center">สถานะ</div>
                    <div className="col-span-1 text-right">จัดการ</div>
                  </div>

                  {/* List Content */}
                  <div className="space-y-3">
                    {filteredEvents.map((ev) => {
                      const theme = typeThemes[ev.type] || typeThemes.other;
                      return (
                        <div
                          key={ev.id}
                          className="grid grid-cols-12 items-center bg-background/25 border border-card-border rounded-xl p-3.5 hover:border-gold/30 hover:bg-background/40 transition-all text-xs"
                        >
                          {/* Date / Time */}
                          <div className="col-span-2 space-y-0.5 text-left">
                            <span className="font-extrabold text-primary block">
                              {new Date(ev.startDate).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                            <div className="flex items-center gap-1 text-[9px] text-foreground/40 font-bold">
                              <Clock className="h-3 w-3 shrink-0" />
                              <span>{ev.startTime ? `${ev.startTime} - ${ev.endTime}` : "ทั้งวัน"}</span>
                            </div>
                          </div>

                          {/* Type */}
                          <div className="col-span-1">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black border ${theme.bg} ${theme.text} ${theme.border}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${theme.dot}`} />
                              {theme.title}
                            </span>
                          </div>

                          {/* Title / Address */}
                          <div className="col-span-3 space-y-1 text-left pr-4">
                            <h4 className="font-black text-primary leading-tight">{ev.title}</h4>
                            {ev.location && (
                              <div className="flex items-center gap-1 text-[9.5px] text-foreground/50">
                                <MapPin className="h-3 w-3 text-gold shrink-0" />
                                <span className="truncate">{ev.location}</span>
                              </div>
                            )}
                          </div>

                          {/* Customer & Project */}
                          <div className="col-span-2 space-y-0.5 text-left">
                            {ev.customerName ? (
                              <span className="font-bold text-foreground block truncate">👤 {ev.customerName}</span>
                            ) : (
                              <span className="text-foreground/40 block">—</span>
                            )}
                            {ev.projectName && (
                              <span className="text-[9.5px] text-foreground/45 block truncate">📁 {ev.projectName}</span>
                            )}
                          </div>

                          {/* Staff Assignees bubble list */}
                          <div className="col-span-2 flex items-center gap-1">
                            {ev.assignees && ev.assignees.length > 0 ? (
                              ev.assignees.map((empId) => {
                                const emp = employees.find(e => e.id === empId);
                                if (!emp) return null;
                                return (
                                  <div 
                                    key={empId}
                                    title={`${emp.name} (${emp.role})`}
                                    className="h-6 w-6 rounded-full bg-primary text-gold border border-white flex items-center justify-center text-[9px] font-black shrink-0 cursor-pointer"
                                  >
                                    {emp.name.split(" ")[0].slice(0, 2)}
                                  </div>
                                );
                              })
                            ) : (
                              <span className="text-foreground/40 font-semibold">—</span>
                            )}
                          </div>

                          {/* Status */}
                          <div className="col-span-1 flex justify-center">
                            <button
                              onClick={() => handleToggleStatus(ev)}
                              disabled={ev.isSystemGenerated}
                              className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border transition-all text-center ${statusLabels[ev.status].style} ${
                                ev.isSystemGenerated ? "" : "hover:brightness-95 cursor-pointer"
                              }`}
                            >
                              {statusLabels[ev.status].label}
                            </button>
                          </div>

                          {/* Actions */}
                          <div className="col-span-1 flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(ev)}
                              className="h-7 w-7 rounded-lg border border-card-border hover:border-gold/30 flex items-center justify-center text-primary/70 hover:bg-primary/5 transition-colors cursor-pointer"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {filteredEvents.length === 0 && (
                      <div className="py-20 text-center text-xs text-foreground/40 font-bold border border-dashed border-card-border rounded-xl">
                        ไม่พบข้อมูลตารางนัดหมายตามเงื่อนไขที่เลือก
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CREATE MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="บันทึกรายการนัดหมายใหม่"
        size="lg"
        type="drawer"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-left text-xs">
          
          <div className="space-y-1">
            <label className="text-[10px] font-black text-foreground/45 uppercase">ชื่องานนัดหมาย / กิจกรรม</label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="เช่น เข้าวัดระยะท่อน้ำคอนโด, ส่งมอบงานสีบิลท์อินตู้ทีวี"
              className="premium-input w-full"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-foreground/45 uppercase">ประเภทกิจกรรม</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as any)}
                className="premium-input w-full"
              >
                <option value="survey">สำรวจหน้างาน (Survey)</option>
                <option value="delivery">ติดตั้ง / จัดส่งสินค้า (Delivery)</option>
                <option value="payment">งวดชำระค่างาน (Payment)</option>
                <option value="milestone">กำหนดการส่งงานหลัก (Milestone)</option>
                <option value="meeting">ประชุมงานดีไซน์ (Meeting)</option>
                <option value="other">อื่นๆ (General)</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-foreground/45 uppercase">สถานะนัดหมาย</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as any)}
                className="premium-input w-full"
              >
                <option value="pending">รอดำเนินการ (Pending)</option>
                <option value="completed">เสร็จสิ้น (Completed)</option>
                <option value="cancelled">ยกเลิกนัดหมาย (Cancelled)</option>
              </select>
            </div>
          </div>

          {/* Date and Time selectors */}
          <div className="bg-background/40 p-4 rounded-xl border border-card-border space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-black text-primary uppercase">ระบุเวลาตามความสะดวกของลูกค้า</span>
              <label className="flex items-center gap-1.5 text-[10px] font-black cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsAllDay}
                  onChange={() => setFormIsAllDay(!formIsAllDay)}
                  className="rounded text-primary h-3.5 w-3.5"
                />
                <span>กิจกรรมทั้งวัน (All Day)</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-foreground/50 uppercase">วันที่นัดหมายเริ่มต้น</label>
                <input
                  type="date"
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                  className="premium-input w-full py-2"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-foreground/50 uppercase">วันที่สิ้นสุด</label>
                <input
                  type="date"
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                  className="premium-input w-full py-2"
                />
              </div>
            </div>

            {!formIsAllDay && (
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-foreground/50 uppercase">เวลาเข้าหน้างาน</label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="premium-input w-full py-2"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-foreground/50 uppercase">เวลาสิ้นสุดประมาณการ</label>
                  <input
                    type="time"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="premium-input w-full py-2"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ERP Project Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-foreground/45 uppercase">เชื่อมโยงโครงการ (ERP Project)</label>
              <select
                value={formProjectId}
                onChange={(e) => handleProjectChange(e.target.value)}
                className="premium-input w-full text-xs"
              >
                <option value="">— ไม่ระบุ / นัดหมายทั่วไป —</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-foreground/45 uppercase">รายชื่อลูกค้าผู้ประสานงาน</label>
              {formProjectId ? (
                <div className="premium-input w-full bg-zinc-100 border-zinc-200 text-foreground/50 select-none flex items-center font-bold">
                  {formCustomerName || "— ดึงข้อมูลจากโครงการอัตโนมัติ —"}
                </div>
              ) : (
                <select
                  value={formCustomerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="premium-input w-full text-xs"
                >
                  <option value="">— ไม่ระบุ / ลูกค้าทั่วไป —</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Location & address */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-foreground/45 uppercase">สถานที่ปฏิบัติงาน / แผนที่หน้างาน</label>
            <input
              type="text"
              value={formLocation}
              onChange={(e) => setFormLocation(e.target.value)}
              placeholder="กรอกข้อมูลที่อยู่ เลขห้อง หรือข้อมูลจัดส่งหน้างาน..."
              className="premium-input w-full"
            />
          </div>

          {/* Staff Assignees selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-foreground/45 uppercase block">จัดส่งมอบพนักงาน / ช่างฟิตติ้ง (Assign Team)</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-background/30 p-3 rounded-xl border border-card-border">
              {employees.map(emp => {
                const checked = formAssignees.includes(emp.id);
                return (
                  <label key={emp.id} className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-background transition-colors text-[10.5px]">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleAssignee(emp.id)}
                      className="rounded text-primary h-3.5 w-3.5 shrink-0"
                    />
                    <span className="font-bold truncate text-primary/95">{emp.name.split(" ")[0]}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-foreground/45 uppercase">ข้อความรายละเอียดเพิ่มเติม</label>
            <textarea
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="ระบุข้อควรระวังหน้างาน เช่น อาคารห้ามเข้าก่อน 9:00 น. หรือข้อห้ามเสียงดังช่วงบ่าย..."
              rows={2}
              className="premium-input w-full resize-none focus:outline-none"
            />
          </div>

          {/* Footer Submit */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="flex-1 rounded-xl border border-card-border bg-background py-2.5 text-[10px] font-black text-foreground/60 hover:text-foreground cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-primary py-2.5 text-[10px] font-black text-gold hover:bg-primary-light transition-all cursor-pointer"
            >
              บันทึกกำหนดนัดหมาย
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT & VIEW MODAL */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={selectedEvent?.isSystemGenerated ? "รายละเอียดตารางนัดหมายระบบ" : "แก้ไขการนัดหมายหน้างาน"}
        size="lg"
        type="drawer"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-left text-xs">
          {selectedEvent?.isSystemGenerated && (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl flex gap-3 text-primary text-[10.5px] leading-relaxed">
              <Info className="h-5 w-5 text-gold shrink-0 mt-0.5" />
              <div>
                <span className="font-black text-primary block">ตารางนัดหมายดึงอัตโนมัติจากระบบ</span>
                ข้อมูลนี้เป็นของโครงการหรือข้อมูลการชำระเงิน คุณสามารถเปลี่ยนสถานะโครงการผ่านหน้ารายละเอียดหลักได้โดยตรง รายละเอียดนี้แสดงเพื่อตรวจสอบตารางการปฏิบัติงานเท่านั้น
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black text-foreground/45 uppercase">ชื่องานนัดหมาย / กิจกรรม</label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="premium-input w-full disabled:bg-zinc-100 disabled:text-foreground/40 disabled:border-zinc-200"
              disabled={selectedEvent?.isSystemGenerated}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-foreground/45 uppercase">ประเภทกิจกรรม</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as any)}
                className="premium-input w-full disabled:bg-zinc-100 disabled:text-foreground/40"
                disabled={selectedEvent?.isSystemGenerated}
              >
                <option value="survey">สำรวจหน้างาน (Survey)</option>
                <option value="delivery">ติดตั้ง / จัดส่งสินค้า (Delivery)</option>
                <option value="payment">งวดชำระค่างาน (Payment)</option>
                <option value="milestone">กำหนดการส่งงานหลัก (Milestone)</option>
                <option value="meeting">ประชุมงานดีไซน์ (Meeting)</option>
                <option value="other">อื่นๆ (General)</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-foreground/45 uppercase">สถานะนัดหมาย</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as any)}
                className="premium-input w-full disabled:bg-zinc-100 disabled:text-foreground/40"
                disabled={selectedEvent?.isSystemGenerated}
              >
                <option value="pending">รอดำเนินการ (Pending)</option>
                <option value="completed">เสร็จสิ้น (Completed)</option>
                <option value="cancelled">ยกเลิกนัดหมาย (Cancelled)</option>
              </select>
            </div>
          </div>

          {/* Date and Time */}
          <div className="bg-background/40 p-4 rounded-xl border border-card-border space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-black text-primary uppercase">เวลาเปิดงานนัดหมาย</span>
              {!selectedEvent?.isSystemGenerated && (
                <label className="flex items-center gap-1.5 text-[10px] font-black cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsAllDay}
                    onChange={() => setFormIsAllDay(!formIsAllDay)}
                    className="rounded text-primary h-3.5 w-3.5"
                  />
                  <span>กิจกรรมทั้งวัน (All Day)</span>
                </label>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-foreground/50 uppercase">วันที่เริ่มต้น</label>
                <input
                  type="date"
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                  className="premium-input w-full py-2 disabled:bg-zinc-100 disabled:text-foreground/40"
                  disabled={selectedEvent?.isSystemGenerated}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-foreground/50 uppercase">วันที่สิ้นสุด</label>
                <input
                  type="date"
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                  className="premium-input w-full py-2 disabled:bg-zinc-100 disabled:text-foreground/40"
                  disabled={selectedEvent?.isSystemGenerated}
                />
              </div>
            </div>

            {!formIsAllDay && (
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-foreground/50 uppercase">เวลาเริ่มต้น</label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="premium-input w-full py-2 disabled:bg-zinc-100 disabled:text-foreground/40"
                    disabled={selectedEvent?.isSystemGenerated}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-foreground/50 uppercase">เวลาสิ้นสุด</label>
                  <input
                    type="time"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="premium-input w-full py-2 disabled:bg-zinc-100 disabled:text-foreground/40"
                    disabled={selectedEvent?.isSystemGenerated}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Customer / Project Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-foreground/45 uppercase">โครงการ (Project)</label>
              <select
                value={formProjectId}
                onChange={(e) => handleProjectChange(e.target.value)}
                className="premium-input w-full text-xs disabled:bg-zinc-100 disabled:text-foreground/40"
                disabled={selectedEvent?.isSystemGenerated}
              >
                <option value="">— ไม่ระบุโครงการ —</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-foreground/45 uppercase">รายชื่อลูกค้าผู้ติดต่อ</label>
              {selectedEvent?.isSystemGenerated || formProjectId ? (
                <div className="premium-input w-full bg-zinc-100 border-zinc-200 text-foreground/50 select-none flex items-center font-bold">
                  {formCustomerName || "— ดึงข้อมูลอัตโนมัติ —"}
                </div>
              ) : (
                <select
                  value={formCustomerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="premium-input w-full text-xs"
                >
                  <option value="">— ไม่ระบุ / ลูกค้าทั่วไป —</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-foreground/45 uppercase">แผนที่และที่อยู่ในการจัดส่งติดตั้ง</label>
            <input
              type="text"
              value={formLocation}
              onChange={(e) => setFormLocation(e.target.value)}
              className="premium-input w-full disabled:bg-zinc-100 disabled:text-foreground/40"
              disabled={selectedEvent?.isSystemGenerated}
            />
          </div>

          {/* Assignees (Disabled if system event) */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-foreground/45 uppercase block">ช่างและฝ่ายประกอบที่ได้รับมอบหมาย</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-background/30 p-3 rounded-xl border border-card-border">
              {employees.map(emp => {
                const checked = formAssignees.includes(emp.id);
                return (
                  <label 
                    key={emp.id} 
                    className={`flex items-center gap-2 p-1.5 rounded transition-colors text-[10.5px] ${
                      selectedEvent?.isSystemGenerated ? "cursor-default" : "cursor-pointer hover:bg-background"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleAssignee(emp.id)}
                      disabled={selectedEvent?.isSystemGenerated}
                      className="rounded text-primary h-3.5 w-3.5 shrink-0"
                    />
                    <span className="font-bold truncate text-primary/95">{emp.name.split(" ")[0]}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-foreground/45 uppercase">บันทึกเพิ่มเติมจากหน้างาน</label>
            <textarea
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              rows={2}
              className="premium-input w-full resize-none focus:outline-none disabled:bg-zinc-100 disabled:text-foreground/40"
              disabled={selectedEvent?.isSystemGenerated}
            />
          </div>

          {/* Actions Bottom Bar */}
          <div className="flex justify-between items-center gap-3 pt-3">
            {!selectedEvent?.isSystemGenerated ? (
              <>
                <button
                  type="button"
                  onClick={handleDeleteEvent}
                  className="px-3.5 py-2.5 rounded-xl border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 font-black text-[10px] flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>ลบการนัด</span>
                </button>
                
                <div className="flex gap-2.5 flex-1 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-card-border bg-background font-black text-[10px] text-foreground/60 hover:text-foreground cursor-pointer"
                  >
                    ปิดหน้าต่าง
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-primary font-black text-[10px] text-gold hover:bg-primary-light transition-all flex-1 sm:flex-none cursor-pointer"
                  >
                    บันทึกข้อมูล
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="w-full rounded-xl bg-primary py-2.5 text-[10px] font-black text-gold hover:bg-primary-light cursor-pointer"
              >
                รับทราบรายละเอียด
              </button>
            )}
          </div>
        </form>
      </Modal>

    </MainLayout>
  );
}
