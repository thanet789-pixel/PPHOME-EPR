"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  Customer, 
  Project, 
  Payment, 
  UserSession,
  Supplier,
  PurchaseOrder
} from "@/lib/types";
import { auth, db, isFirebaseConfigured } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword as fbSignIn, 
  signOut as fbSignOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy
} from "firebase/firestore";
import { 
  initialCustomers, 
  initialProjects, 
  initialPayments,
  initialMaterials,
  initialProductionOrders,
  initialEmployees,
  initialSuppliers,
  initialPurchaseOrders,
  MaterialItem,
  ProductionOrder,
  RosterEmployee
} from "@/lib/mockData";


// --- AUTH CONTEXT ---
interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isFirebase: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface ColorTheme {
  id: string;
  name: string;
  primary: string;
  primaryLight: string;
  gold: string;
  background: string;
  cardBg: string;
  foreground: string;
  isPreset?: boolean;
}

export interface BackgroundImage {
  id: string;
  name: string;
  url: string;
  isPreset?: boolean;
}

export const presetThemes: ColorTheme[] = [
  {
    id: "luxury-forest",
    name: "Luxury Forest Green (Default)",
    primary: "#0F2D24",
    primaryLight: "#1F5A46",
    gold: "#D4AF37",
    background: "#F8F8F6",
    cardBg: "#FFFFFF",
    foreground: "#1A1A1A",
    isPreset: true
  },
  {
    id: "classic-blue",
    name: "Classic Royal Blue (น้ำเงินคลาสสิก)",
    primary: "#1E3A8A",
    primaryLight: "#3B82F6",
    gold: "#F59E0B",
    background: "#F3F4F6",
    cardBg: "#FFFFFF",
    foreground: "#111827",
    isPreset: true
  },
  {
    id: "imperial-burgundy",
    name: "Imperial Burgundy (แดงสไตล์จักรพรรดิ)",
    primary: "#5C061C",
    primaryLight: "#8B1E3F",
    gold: "#D4AF37",
    background: "#FAF7F8",
    cardBg: "#FFFFFF",
    foreground: "#1C0208",
    isPreset: true
  },
  {
    id: "charcoal-gold",
    name: "Modern Charcoal Gold (เทาและทอง)",
    primary: "#1E1E24",
    primaryLight: "#3F3F46",
    gold: "#D4AF37",
    background: "#F4F4F5",
    cardBg: "#FFFFFF",
    foreground: "#09090B",
    isPreset: true
  },
  {
    id: "luxury-dark",
    name: "Luxury Dark Mode (โหมดมืดหรูหรา)",
    primary: "#0D0E12",
    primaryLight: "#1C1D24",
    gold: "#D4AF37",
    background: "#12131A",
    cardBg: "#1E1F29",
    foreground: "#F3F4F6",
    isPreset: true
  }
];

export const presetBgs: BackgroundImage[] = [
  {
    id: "default-gradient",
    name: "ลายเฉดสีเริ่มต้น (Default Gradient)",
    url: "radial-gradient(at 0% 0%, rgba(15, 45, 36, 0.03) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(212, 175, 55, 0.03) 0px, transparent 50%)",
    isPreset: true
  },
  {
    id: "classic-oak",
    name: "ลายไม้โอ๊คคลาสสิก (Classic Oak)",
    url: "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?q=80&w=1200",
    isPreset: true
  },
  {
    id: "carrara-marble",
    name: "หินอ่อนขาวคาราร่า (Carrara Marble)",
    url: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=1200",
    isPreset: true
  },
  {
    id: "concrete-loft",
    name: "คอนกรีตลอฟท์ (Concrete Loft)",
    url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=1200",
    isPreset: true
  }
];

// --- DATA CONTEXT ---
interface DataContextType {
  customers: Customer[];
  projects: Project[];
  payments: Payment[];
  materials: MaterialItem[];
  productionOrders: ProductionOrder[];
  employees: RosterEmployee[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  loading: boolean;
  addCustomer: (c: Omit<Customer, "id" | "createdAt">) => Promise<string>;
  updateCustomer: (id: string, c: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addProject: (p: Omit<Project, "id" | "createdAt" | "paidAmount">) => Promise<string>;
  updateProject: (id: string, p: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addPayment: (p: Omit<Payment, "id" | "createdAt">) => Promise<string>;
  updatePayment: (id: string, p: Partial<Payment>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  updateMaterial: (id: string, m: Partial<MaterialItem>) => Promise<void>;
  addProductionOrder: (o: Omit<ProductionOrder, "id">) => Promise<string>;
  updateProductionOrder: (id: string, o: Partial<ProductionOrder>) => Promise<void>;
  addEmployee: (e: Omit<RosterEmployee, "id">) => Promise<string>;
  updateEmployee: (id: string, e: Partial<RosterEmployee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  addSupplier: (s: Omit<Supplier, "id" | "createdAt">) => Promise<string>;
  updateSupplier: (id: string, s: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  addPurchaseOrder: (p: Omit<PurchaseOrder, "id" | "createdAt">) => Promise<string>;
  updatePurchaseOrder: (id: string, p: Partial<PurchaseOrder>) => Promise<void>;
  deletePurchaseOrder: (id: string) => Promise<void>;

  currentTheme: ColorTheme;
  customThemes: ColorTheme[];
  currentBg: BackgroundImage | null;
  customBgs: BackgroundImage[];
  selectTheme: (id: string) => void;
  addCustomTheme: (theme: ColorTheme) => void;
  updateCustomTheme: (id: string, theme: Partial<ColorTheme>) => void;
  deleteCustomTheme: (id: string) => void;
  selectBg: (id: string) => void;
  addCustomBg: (bg: BackgroundImage) => void;
  deleteCustomBg: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isFirebase] = useState(!!(isFirebaseConfigured && auth));

  // Data States
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([]);
  const [employees, setEmployees] = useState<RosterEmployee[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Theme states
  const [currentTheme, setCurrentTheme] = useState<ColorTheme>(presetThemes[0]);
  const [customThemes, setCustomThemes] = useState<ColorTheme[]>([]);
  const [currentBg, setCurrentBg] = useState<BackgroundImage | null>(presetBgs[0]);
  const [customBgs, setCustomBgs] = useState<BackgroundImage[]>([]);

  // DOM styling injection
  const applyTheme = (theme: ColorTheme) => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    root.style.setProperty("--primary", theme.primary);
    root.style.setProperty("--primary-light", theme.primaryLight);
    root.style.setProperty("--gold", theme.gold);
    root.style.setProperty("--background", theme.background);
    root.style.setProperty("--card-bg", theme.cardBg);
    root.style.setProperty("--foreground", theme.foreground);
  };

  const applyBg = (bg: BackgroundImage | null) => {
    if (typeof window === "undefined") return;
    if (!bg) {
      document.body.style.backgroundImage = "";
      return;
    }
    if (bg.url.startsWith("radial-gradient") || bg.url.startsWith("linear-gradient")) {
      document.body.style.backgroundImage = bg.url;
      document.body.style.backgroundSize = "";
      document.body.style.backgroundAttachment = "fixed";
    } else {
      document.body.style.backgroundImage = `url('${bg.url}')`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundAttachment = "fixed";
    }
  };

  useEffect(() => {
    if (currentTheme) {
      applyTheme(currentTheme);
    }
  }, [currentTheme]);

  useEffect(() => {
    applyBg(currentBg);
  }, [currentBg]);

  // Load theme and wallpaper preferences
  useEffect(() => {
    if (typeof window === "undefined") return;

    let loadedThemes: ColorTheme[] = [];
    const localThemes = localStorage.getItem("pphome_custom_themes");
    if (localThemes) {
      try {
        loadedThemes = JSON.parse(localThemes);
        setCustomThemes(loadedThemes);
      } catch (e) {
        console.error(e);
      }
    }

    const selThemeId = localStorage.getItem("pphome_selected_theme");
    if (selThemeId) {
      const preset = presetThemes.find(t => t.id === selThemeId);
      const custom = loadedThemes.find(t => t.id === selThemeId);
      const active = preset || custom || presetThemes[0];
      setCurrentTheme(active);
    }

    let loadedBgs: BackgroundImage[] = [];
    const localBgs = localStorage.getItem("pphome_custom_bgs");
    if (localBgs) {
      try {
        loadedBgs = JSON.parse(localBgs);
        setCustomBgs(loadedBgs);
      } catch (e) {
        console.error(e);
      }
    }

    const selBgId = localStorage.getItem("pphome_selected_bg");
    if (selBgId) {
      const preset = presetBgs.find(b => b.id === selBgId);
      const custom = loadedBgs.find(b => b.id === selBgId);
      const active = preset || custom || presetBgs[0];
      setCurrentBg(active);
    } else if (selBgId === "") {
      setCurrentBg(null);
    }
  }, []);

  const selectTheme = (id: string) => {
    const preset = presetThemes.find(t => t.id === id);
    const custom = customThemes.find(t => t.id === id);
    const theme = preset || custom;
    if (theme) {
      setCurrentTheme(theme);
      localStorage.setItem("pphome_selected_theme", id);
    }
  };

  const addCustomTheme = (theme: ColorTheme) => {
    const next = [...customThemes, theme];
    setCustomThemes(next);
    localStorage.setItem("pphome_custom_themes", JSON.stringify(next));
  };

  const updateCustomTheme = (id: string, updatedTheme: Partial<ColorTheme>) => {
    const next = customThemes.map(t => t.id === id ? { ...t, ...updatedTheme } : t);
    setCustomThemes(next);
    localStorage.setItem("pphome_custom_themes", JSON.stringify(next));
    if (currentTheme.id === id) {
      const active = next.find(t => t.id === id);
      if (active) setCurrentTheme(active);
    }
  };

  const deleteCustomTheme = (id: string) => {
    const next = customThemes.filter(t => t.id !== id);
    setCustomThemes(next);
    localStorage.setItem("pphome_custom_themes", JSON.stringify(next));
    if (currentTheme.id === id) {
      selectTheme("luxury-forest");
    }
  };

  const selectBg = (id: string) => {
    const preset = presetBgs.find(b => b.id === id);
    const custom = customBgs.find(b => b.id === id);
    const bg = preset || custom;
    if (bg) {
      setCurrentBg(bg);
      localStorage.setItem("pphome_selected_bg", id);
    } else if (id === "") {
      setCurrentBg(null);
      localStorage.setItem("pphome_selected_bg", "");
    }
  };

  const addCustomBg = (bg: BackgroundImage) => {
    const next = [...customBgs, bg];
    setCustomBgs(next);
    localStorage.setItem("pphome_custom_bgs", JSON.stringify(next));
  };

  const deleteCustomBg = (id: string) => {
    const next = customBgs.filter(b => b.id !== id);
    setCustomBgs(next);
    localStorage.setItem("pphome_custom_bgs", JSON.stringify(next));
    if (currentBg?.id === id) {
      selectBg("default-gradient");
    }
  };

  // 1. AUTHENTICATION SYNC
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          setUser({
            uid: fbUser.uid,
            email: fbUser.email || "",
            displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "User",
          });
        } else {
          setUser(null);
        }
        setAuthLoading(false);
      });
      return unsubscribe;
    } else {
      // Mock mode authentication initialization
      const localUser = localStorage.getItem("pphome_user");
      if (localUser) {
        try {
          const parsed = JSON.parse(localUser);
          Promise.resolve().then(() => {
            setUser(parsed);
            setAuthLoading(false);
          });
          return;
        } catch {
          localStorage.removeItem("pphome_user");
        }
      }
      Promise.resolve().then(() => setAuthLoading(false));
    }
  }, []);

  // 2. DATA SYNCHRONIZATION
  useEffect(() => {
    // If auth is still loading, wait
    if (authLoading) return;

    // If user is not logged in, clear data states and return
    if (!user) {
      Promise.resolve().then(() => {
        setCustomers([]);
        setProjects([]);
        setPayments([]);
        setDataLoading(false);
      });
      return;
    }

    if (isFirebaseConfigured && db) {
      setDataLoading(true);
      // Real-time Firestore sync
      const qCustomers = query(collection(db, "customers"), orderBy("name", "asc"));
      const unsubCustomers = onSnapshot(qCustomers, (snapshot) => {
        const list: Customer[] = [];
        snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Customer));
        setCustomers(list);
      }, (err) => console.error("Firestore customer sync error:", err));

      const qProjects = query(collection(db, "projects"), orderBy("startDate", "desc"));
      const unsubProjects = onSnapshot(qProjects, (snapshot) => {
        const list: Project[] = [];
        snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Project));
        setProjects(list);
      }, (err) => console.error("Firestore project sync error:", err));

      const qPayments = query(collection(db, "payments"), orderBy("dueDate", "asc"));
      const unsubPayments = onSnapshot(qPayments, (snapshot) => {
        const list: Payment[] = [];
        snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Payment));
        setPayments(list);
        setDataLoading(false);
      }, (err) => {
        console.error("Firestore payment sync error:", err);
        setDataLoading(false);
      });

      return () => {
        unsubCustomers();
        unsubProjects();
        unsubPayments();
      };
    } else {
      // Mock Mode localStorage synchronization
      setDataLoading(true);
      
      let localCust = localStorage.getItem("pphome_customers");
      let localProj = localStorage.getItem("pphome_projects");
      let localPay = localStorage.getItem("pphome_payments");
      let localMat = localStorage.getItem("pphome_materials");
      let localProd = localStorage.getItem("pphome_production_orders");
      let localEmp = localStorage.getItem("pphome_employees");
      let localSup = localStorage.getItem("pphome_suppliers");
      let localPO = localStorage.getItem("pphome_purchase_orders");

      if (!localCust) {
        localStorage.setItem("pphome_customers", JSON.stringify(initialCustomers));
        localCust = JSON.stringify(initialCustomers);
      }
      if (!localProj) {
        localStorage.setItem("pphome_projects", JSON.stringify(initialProjects));
        localProj = JSON.stringify(initialProjects);
      }
      if (!localPay) {
        localStorage.setItem("pphome_payments", JSON.stringify(initialPayments));
        localPay = JSON.stringify(initialPayments);
      }
      if (!localMat) {
        localStorage.setItem("pphome_materials", JSON.stringify(initialMaterials));
        localMat = JSON.stringify(initialMaterials);
      }
      if (!localProd) {
        localStorage.setItem("pphome_production_orders", JSON.stringify(initialProductionOrders));
        localProd = JSON.stringify(initialProductionOrders);
      }
      if (!localEmp) {
        localStorage.setItem("pphome_employees", JSON.stringify(initialEmployees));
        localEmp = JSON.stringify(initialEmployees);
      }
      if (!localSup) {
        localStorage.setItem("pphome_suppliers", JSON.stringify(initialSuppliers));
        localSup = JSON.stringify(initialSuppliers);
      }
      if (!localPO) {
        localStorage.setItem("pphome_purchase_orders", JSON.stringify(initialPurchaseOrders));
        localPO = JSON.stringify(initialPurchaseOrders);
      }

      setCustomers(JSON.parse(localCust));
      setProjects(JSON.parse(localProj));
      setPayments(JSON.parse(localPay));
      setMaterials(JSON.parse(localMat));
      setProductionOrders(JSON.parse(localProd));
      setEmployees(JSON.parse(localEmp));
      setSuppliers(JSON.parse(localSup));
      setPurchaseOrders(JSON.parse(localPO));
      setDataLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  // AUTH ACTIONS
  const login = async (email: string, password: string) => {
    if (isFirebaseConfigured && auth) {
      await fbSignIn(auth, email, password);
    } else {
      // Mock Login validation
      if (email === "demo@pphome.com" && password === "password123") {
        const demoUser: UserSession = {
          uid: "demo_uid",
          email: "demo@pphome.com",
          displayName: "PP Admin",
          role: "Contractor Admin"
        };
        localStorage.setItem("pphome_user", JSON.stringify(demoUser));
        setUser(demoUser);
      } else {
        throw new Error("Invalid credentials. Try demo@pphome.com with password123");
      }
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await fbSignOut(auth);
    } else {
      localStorage.removeItem("pphome_user");
      setUser(null);
    }
  };

  // DATABASE WRITES (Live Firestore or Mock localStorage)
  
  // Customers Actions
  const addCustomer = async (c: Omit<Customer, "id" | "createdAt">): Promise<string> => {
    const newId = `cust_${Date.now()}`;
    const newCust: Customer = {
      id: newId,
      ...c,
      createdAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured && db) {
      const docRef = await addDoc(collection(db, "customers"), {
        name: c.name,
        email: c.email,
        phone: c.phone,
        company: c.company,
        address: c.address,
        createdAt: newCust.createdAt
      });
      return docRef.id;
    } else {
      const updated = [...customers, newCust].sort((a, b) => a.name.localeCompare(b.name));
      localStorage.setItem("pphome_customers", JSON.stringify(updated));
      setCustomers(updated);
      return newId;
    }
  };

  const updateCustomer = async (id: string, c: Partial<Customer>) => {
    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, "customers", id), c);
    } else {
      const updated = customers.map((item) => (item.id === id ? { ...item, ...c } : item));
      localStorage.setItem("pphome_customers", JSON.stringify(updated));
      setCustomers(updated);
    }
  };

  const deleteCustomer = async (id: string) => {
    if (isFirebaseConfigured && db) {
      await deleteDoc(doc(db, "customers", id));
    } else {
      const updated = customers.filter((item) => item.id !== id);
      localStorage.setItem("pphome_customers", JSON.stringify(updated));
      setCustomers(updated);
    }
  };

  // Projects Actions
  const addProject = async (p: Omit<Project, "id" | "createdAt" | "paidAmount">): Promise<string> => {
    const newId = `proj_${Date.now()}`;
    const newProj: Project = {
      id: newId,
      ...p,
      paidAmount: 0,
      createdAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured && db) {
      const docRef = await addDoc(collection(db, "projects"), {
        ...p,
        paidAmount: 0,
        createdAt: newProj.createdAt
      });
      return docRef.id;
    } else {
      const updated = [newProj, ...projects];
      localStorage.setItem("pphome_projects", JSON.stringify(updated));
      setProjects(updated);
      return newId;
    }
  };

  const updateProject = async (id: string, p: Partial<Project>) => {
    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, "projects", id), p);
    } else {
      const updated = projects.map((item) => (item.id === id ? { ...item, ...p } : item));
      localStorage.setItem("pphome_projects", JSON.stringify(updated));
      setProjects(updated);
    }
  };

  const deleteProject = async (id: string) => {
    if (isFirebaseConfigured && db) {
      await deleteDoc(doc(db, "projects", id));
    } else {
      const updated = projects.filter((item) => item.id !== id);
      localStorage.setItem("pphome_projects", JSON.stringify(updated));
      setProjects(updated);
    }
  };

  // Payments Actions
  const addPayment = async (p: Omit<Payment, "id" | "createdAt">): Promise<string> => {
    const newId = `pay_${Date.now()}`;
    const newPay: Payment = {
      id: newId,
      ...p,
      createdAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured && db) {
      const docRef = await addDoc(collection(db, "payments"), {
        ...p,
        createdAt: newPay.createdAt
      });
      
      // Update Project paidAmount if status is Paid
      if (p.status === "Paid") {
        const project = projects.find((proj) => proj.id === p.projectId);
        if (project) {
          const newPaid = (project.paidAmount || 0) + p.amount;
          await updateDoc(doc(db, "projects", p.projectId), { paidAmount: newPaid });
        }
      }
      return docRef.id;
    } else {
      const updated = [...payments, newPay].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
      localStorage.setItem("pphome_payments", JSON.stringify(updated));
      setPayments(updated);

      // Update project budget progress
      if (p.status === "Paid") {
        const updatedProjects = projects.map((proj) => {
          if (proj.id === p.projectId) {
            return { ...proj, paidAmount: proj.paidAmount + p.amount };
          }
          return proj;
        });
        localStorage.setItem("pphome_projects", JSON.stringify(updatedProjects));
        setProjects(updatedProjects);
      }
      return newId;
    }
  };

  const updatePayment = async (id: string, p: Partial<Payment>) => {
    // We need to check if payment status changes to update corresponding project paidAmount
    const currentPay = payments.find((item) => item.id === id);
    const wasPaid = currentPay?.status === "Paid";
    const isNowPaid = p.status === "Paid" || (currentPay?.status === "Paid" && p.status !== "Pending" && p.status !== "Overdue");
    
    // Amount difference for payment update
    const prevAmount = currentPay?.amount || 0;
    const newAmount = p.amount !== undefined ? p.amount : prevAmount;
    
    let paidDiff = 0;
    if (wasPaid && !isNowPaid) {
      paidDiff = -prevAmount; // Deduct original paid amount
    } else if (!wasPaid && isNowPaid) {
      paidDiff = newAmount; // Add new paid amount
    } else if (wasPaid && isNowPaid && prevAmount !== newAmount) {
      paidDiff = newAmount - prevAmount; // Adjust the difference
    }

    const targetProjId = currentPay?.projectId || "";

    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, "payments", id), p);
      if (targetProjId && paidDiff !== 0) {
        const project = projects.find((proj) => proj.id === targetProjId);
        if (project) {
          const newPaid = Math.max(0, (project.paidAmount || 0) + paidDiff);
          await updateDoc(doc(db, "projects", targetProjId), { paidAmount: newPaid });
        }
      }
    } else {
      const updated = payments.map((item) => (item.id === id ? { ...item, ...p } : item));
      localStorage.setItem("pphome_payments", JSON.stringify(updated));
      setPayments(updated);

      if (targetProjId && paidDiff !== 0) {
        const updatedProjects = projects.map((proj) => {
          if (proj.id === targetProjId) {
            return { ...proj, paidAmount: Math.max(0, proj.paidAmount + paidDiff) };
          }
          return proj;
        });
        localStorage.setItem("pphome_projects", JSON.stringify(updatedProjects));
        setProjects(updatedProjects);
      }
    }
  };

  const deletePayment = async (id: string) => {
    const currentPay = payments.find((item) => item.id === id);
    const wasPaid = currentPay?.status === "Paid";
    const targetProjId = currentPay?.projectId || "";
    const prevAmount = currentPay?.amount || 0;

    if (isFirebaseConfigured && db) {
      await deleteDoc(doc(db, "payments", id));
      if (targetProjId && wasPaid) {
        const project = projects.find((proj) => proj.id === targetProjId);
        if (project) {
          const newPaid = Math.max(0, (project.paidAmount || 0) - prevAmount);
          await updateDoc(doc(db, "projects", targetProjId), { paidAmount: newPaid });
        }
      }
    } else {
      const updated = payments.filter((item) => item.id !== id);
      localStorage.setItem("pphome_payments", JSON.stringify(updated));
      setPayments(updated);

      if (targetProjId && wasPaid) {
        const updatedProjects = projects.map((proj) => {
          if (proj.id === targetProjId) {
            return { ...proj, paidAmount: Math.max(0, proj.paidAmount - prevAmount) };
          }
          return proj;
        });
        localStorage.setItem("pphome_projects", JSON.stringify(updatedProjects));
        setProjects(updatedProjects);
      }
    }
  };

  const updateMaterial = async (id: string, m: Partial<MaterialItem>) => {
    const updated = materials.map((item) => (item.id === id ? { ...item, ...m } : item));
    localStorage.setItem("pphome_materials", JSON.stringify(updated));
    setMaterials(updated);
  };

  const addProductionOrder = async (o: Omit<ProductionOrder, "id">): Promise<string> => {
    const newId = `JOB-2024-${Math.floor(100 + Math.random() * 900)}`;
    const newOrder: ProductionOrder = { id: newId, ...o };
    const updated = [newOrder, ...productionOrders];
    localStorage.setItem("pphome_production_orders", JSON.stringify(updated));
    setProductionOrders(updated);
    return newId;
  };

  const updateProductionOrder = async (id: string, o: Partial<ProductionOrder>) => {
    const updated = productionOrders.map((item) => (item.id === id ? { ...item, ...o } : item));
    localStorage.setItem("pphome_production_orders", JSON.stringify(updated));
    setProductionOrders(updated);
  };

  const addEmployee = async (e: Omit<RosterEmployee, "id">): Promise<string> => {
    const newId = `emp_${Date.now()}`;
    const newEmp: RosterEmployee = { id: newId, ...e };
    const updated = [...employees, newEmp];
    localStorage.setItem("pphome_employees", JSON.stringify(updated));
    setEmployees(updated);
    return newId;
  };

  const updateEmployee = async (id: string, e: Partial<RosterEmployee>) => {
    const updated = employees.map((item) => (item.id === id ? { ...item, ...e } : item));
    localStorage.setItem("pphome_employees", JSON.stringify(updated));
    setEmployees(updated);
  };

  const deleteEmployee = async (id: string) => {
    const updated = employees.filter((item) => item.id !== id);
    localStorage.setItem("pphome_employees", JSON.stringify(updated));
    setEmployees(updated);
  };

  // Suppliers Actions
  const addSupplier = async (s: Omit<Supplier, "id" | "createdAt">): Promise<string> => {
    const newId = `sup_${Date.now()}`;
    const newSup: Supplier = {
      id: newId,
      ...s,
      createdAt: new Date().toISOString()
    };
    const updated = [...suppliers, newSup];
    localStorage.setItem("pphome_suppliers", JSON.stringify(updated));
    setSuppliers(updated);
    return newId;
  };

  const updateSupplier = async (id: string, s: Partial<Supplier>) => {
    const updated = suppliers.map((item) => (item.id === id ? { ...item, ...s } : item));
    localStorage.setItem("pphome_suppliers", JSON.stringify(updated));
    setSuppliers(updated);
  };

  const deleteSupplier = async (id: string) => {
    const updated = suppliers.filter((item) => item.id !== id);
    localStorage.setItem("pphome_suppliers", JSON.stringify(updated));
    setSuppliers(updated);
  };

  // Helper function to update stocks from PO
  const updateInventoryFromPO = (po: PurchaseOrder) => {
    let inventoryChanged = false;
    const currentMaterials = [...materials];

    po.items.forEach(poItem => {
      // Find matching material item by name (case-insensitive, matching first part)
      const matchIndex = currentMaterials.findIndex(m => 
        m.name.toLowerCase().trim() === poItem.itemName.toLowerCase().trim() ||
        poItem.itemName.toLowerCase().includes(m.name.toLowerCase()) ||
        m.name.toLowerCase().includes(poItem.itemName.toLowerCase())
      );

      if (matchIndex !== -1) {
        currentMaterials[matchIndex] = {
          ...currentMaterials[matchIndex],
          stock: currentMaterials[matchIndex].stock + poItem.qty
        };
        inventoryChanged = true;
      }
    });

    if (inventoryChanged) {
      localStorage.setItem("pphome_materials", JSON.stringify(currentMaterials));
      setMaterials(currentMaterials);
    }
  };

  // Purchase Orders Actions
  const addPurchaseOrder = async (po: Omit<PurchaseOrder, "id" | "createdAt">): Promise<string> => {
    const newId = `PO-2026-${String(purchaseOrders.length + 1).padStart(3, '0')}`;
    const newPO: PurchaseOrder = {
      id: newId,
      ...po,
      createdAt: new Date().toISOString()
    };
    const updated = [newPO, ...purchaseOrders];
    localStorage.setItem("pphome_purchase_orders", JSON.stringify(updated));
    setPurchaseOrders(updated);

    if (newPO.status === "Delivered") {
      updateInventoryFromPO(newPO);
    }

    return newId;
  };

  const updatePurchaseOrder = async (id: string, po: Partial<PurchaseOrder>) => {
    const oldPO = purchaseOrders.find(p => p.id === id);
    const isTransitioningToDelivered = oldPO && oldPO.status !== "Delivered" && po.status === "Delivered";

    const updated = purchaseOrders.map((item) => (item.id === id ? { ...item, ...po } : item));
    localStorage.setItem("pphome_purchase_orders", JSON.stringify(updated));
    setPurchaseOrders(updated);

    if (isTransitioningToDelivered) {
      const fullPO = updated.find(p => p.id === id);
      if (fullPO) {
        updateInventoryFromPO(fullPO);
      }
    }
  };

  const deletePurchaseOrder = async (id: string) => {
    const updated = purchaseOrders.filter((item) => item.id !== id);
    localStorage.setItem("pphome_purchase_orders", JSON.stringify(updated));
    setPurchaseOrders(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading: authLoading, login, logout, isFirebase }}>
      <DataContext.Provider value={{ 
        customers, 
        projects, 
        payments, 
        materials,
        productionOrders,
        employees,
        suppliers,
        purchaseOrders,
        loading: dataLoading,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addProject,
        updateProject,
        deleteProject,
        addPayment,
        updatePayment,
        deletePayment,
        updateMaterial,
        addProductionOrder,
        updateProductionOrder,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        addPurchaseOrder,
        updatePurchaseOrder,
        deletePurchaseOrder,
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
      }}>
        {children}
      </DataContext.Provider>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
