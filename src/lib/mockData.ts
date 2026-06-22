import { Customer, Project, Payment, Supplier, PurchaseOrder } from "./types";

export const initialCustomers: Customer[] = [
  {
    id: "cust_1",
    name: "คุณสมชาย ใจดี",
    email: "somchai@eliteresidences.co.th",
    phone: "081-234-5678",
    company: "Elite Residences Bangkok",
    address: "88 Sukhumvit Rd, Khlong Toei, Bangkok 10110",
    createdAt: "2024-05-20T09:30:00Z"
  },
  {
    id: "cust_2",
    name: "คุณวิภา รุ่งเรือง",
    email: "wipa@signatureliving.co.th",
    phone: "089-876-5432",
    company: "Signature Living Suites",
    address: "456 Sathorn N Rd, Bang Rak, Bangkok 10500",
    createdAt: "2024-05-19T14:15:00Z"
  },
  {
    id: "cust_3",
    name: "คุณธนา พงศกร",
    email: "thana@cozycafes.com",
    phone: "062-345-6789",
    company: "Cozy Cafes Co., Ltd.",
    address: "12/4 Thong Lo Rd, Watthana, Bangkok 10110",
    createdAt: "2024-05-18T11:00:00Z"
  },
  {
    id: "cust_4",
    name: "คุณกมลวรรณ ทัศนา",
    email: "kamonwan@gmail.com",
    phone: "085-111-2222",
    company: "บ้านคุณกมลวรรณ",
    address: "789 Phaholyothin Rd, Chatuchak, Bangkok 10900",
    createdAt: "2024-05-17T15:30:00Z"
  }
];

export const initialProjects: Project[] = [
  {
    id: "proj_1",
    customerId: "cust_1",
    customerName: "คุณสมชาย ใจดี (Elite Residences)",
    name: "ชุดครัวบิวท์อิน Luxury Penthouse Kitchen",
    status: "Completed",
    startDate: "2024-03-01",
    endDate: "2024-05-15",
    budget: 750000,
    paidAmount: 750000,
    createdAt: "2024-02-28T08:00:00Z",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600",
    description: "งานบิวท์อินตู้ครัวสไตล์ Modern Luxury หน้าบานไฮกลอสสีขาว สลับกระจกกรอบอลูมิเนียมทอง ท็อปหินอ่อนลายคาราร่า อุปกรณ์ Fitting Hafele ทั้งชุด",
    images: [
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=300",
      "https://images.unsplash.com/photo-1556909212-d5b604ad0567?q=80&w=300",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=300"
    ]
  },
  {
    id: "proj_2",
    customerId: "cust_2",
    customerName: "คุณวิภา รุ่งเรือง (Signature Living)",
    name: "ตู้เสื้อผ้า Walk-in Closet & Bedroom Built-in",
    status: "In Progress",
    startDate: "2024-04-10",
    endDate: "2024-07-15",
    budget: 1200000,
    paidAmount: 600000,
    createdAt: "2024-04-08T09:30:00Z",
    image: "https://images.unsplash.com/photo-1558882224-cca166733360?q=80&w=600",
    description: "ตู้เสื้อผ้า Walk-in Closet สูงชนฝ้า โครง HMR ปิดลามิเนตลายผ้า หน้าบานกระจกเงาชาทอง ติดไฟ LED ซ่อนขอบภายในตู้ พร้อมงานตกแต่งผนังหัวเตียง",
    images: [
      "https://images.unsplash.com/photo-1558882224-cca166733360?q=80&w=300",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=300"
    ]
  },
  {
    id: "proj_3",
    customerId: "cust_3",
    customerName: "คุณธนา พงศกร (Cozy Cafes)",
    name: "เคาน์เตอร์ร้านกาแฟ Counter & Wall Panels",
    status: "Delayed",
    startDate: "2024-04-15",
    endDate: "2024-05-25",
    budget: 450000,
    paidAmount: 150000,
    createdAt: "2024-04-12T10:00:00Z",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600",
    description: "เคาน์เตอร์กาแฟและผนังตกแต่งไม้ระแนงยางพาราทำสีธรรมชาติ พร้อมชั้นวางสินค้าแบบลอฟท์ ท็อปเคาน์เตอร์ลามิเนตดำกันน้ำ",
    images: [
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=300"
    ]
  },
  {
    id: "proj_4",
    customerId: "cust_4",
    customerName: "คุณกมลวรรณ ทัศนา",
    name: "ชั้นวางทีวี Built-in Tv Console Unit",
    status: "Planning",
    startDate: "2024-05-28",
    endDate: "2024-08-30",
    budget: 320000,
    paidAmount: 0,
    createdAt: "2024-05-20T16:45:00Z",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600",
    description: "ตู้วางทีวีบิวท์อินยาว 4 เมตร โครงไม้โครงยางพาราบุแผ่น HMR ปิดผิวลามิเนตลายไม้โอ๊คตัดสีเทาเข้มด้าน พร้อมชั้นโชว์ไฟ LED ซ่อน",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=300"
    ]
  }
];

export const initialPayments: Payment[] = [
  {
    id: "pay_1",
    projectId: "proj_1",
    projectName: "ชุดครัวบิวท์อิน Luxury Penthouse Kitchen",
    customerId: "cust_1",
    customerName: "คุณสมชาย ใจดี",
    amount: 375000,
    dueDate: "2024-03-01",
    status: "Paid",
    paidDate: "2024-03-01",
    type: "Deposit",
    createdAt: "2024-02-28T08:15:00Z"
  },
  {
    id: "pay_2",
    projectId: "proj_1",
    projectName: "ชุดครัวบิวท์อิน Luxury Penthouse Kitchen",
    customerId: "cust_1",
    customerName: "คุณสมชาย ใจดี",
    amount: 375000,
    dueDate: "2024-05-15",
    status: "Paid",
    paidDate: "2024-05-15",
    type: "Final Payment",
    createdAt: "2024-02-28T08:15:00Z"
  },
  {
    id: "pay_3",
    projectId: "proj_2",
    projectName: "ตู้เสื้อผ้า Walk-in Closet & Bedroom Built-in",
    customerId: "cust_2",
    customerName: "คุณวิภา รุ่งเรือง",
    amount: 600000,
    dueDate: "2024-04-10",
    status: "Paid",
    paidDate: "2024-04-09",
    type: "Deposit",
    createdAt: "2024-04-08T09:45:00Z"
  },
  {
    id: "pay_4",
    projectId: "proj_2",
    projectName: "ตู้เสื้อผ้า Walk-in Closet & Bedroom Built-in",
    customerId: "cust_2",
    customerName: "คุณวิภา รุ่งเรือง",
    amount: 300000,
    dueDate: "2024-06-15",
    status: "Pending",
    paidDate: null,
    type: "Installment 1",
    createdAt: "2024-04-08T09:45:00Z"
  },
  {
    id: "pay_5",
    projectId: "proj_2",
    projectName: "ตู้เสื้อผ้า Walk-in Closet & Bedroom Built-in",
    customerId: "cust_2",
    customerName: "คุณวิภา รุ่งเรือง",
    amount: 300000,
    dueDate: "2024-07-15",
    status: "Pending",
    paidDate: null,
    type: "Final Payment",
    createdAt: "2024-04-08T09:45:00Z"
  },
  {
    id: "pay_6",
    projectId: "proj_3",
    projectName: "เคาน์เตอร์ร้านกาแฟ Counter & Wall Panels",
    customerId: "cust_3",
    customerName: "คุณธนา พงศกร",
    amount: 150000,
    dueDate: "2024-04-15",
    status: "Paid",
    paidDate: "2024-04-14",
    type: "Deposit",
    createdAt: "2024-04-12T10:15:00Z"
  },
  {
    id: "pay_7",
    projectId: "proj_3",
    projectName: "เคาน์เตอร์ร้านกาแฟ Counter & Wall Panels",
    customerId: "cust_3",
    customerName: "คุณธนา พงศกร",
    amount: 300000,
    dueDate: "2024-05-25",
    status: "Overdue",
    paidDate: null,
    type: "Final Payment",
    createdAt: "2024-04-12T10:15:00Z"
  }
];

// --- EXTENDED ERP DATA FOR INVENTORY & PRODUCTION ---
export interface MaterialItem {
  id: string;
  name: string;
  stock: number;
  unit: string;
  minStock: number;
}

export const initialMaterials: MaterialItem[] = [
  { id: "mat_1", name: "HMR 15 mm", stock: 12, unit: "แผ่น", minStock: 20 },
  { id: "mat_2", name: "บานพับ Soft Close", stock: 18, unit: "ชิ้น", minStock: 50 },
  { id: "mat_3", name: "รางลิ้นชัก 45 cm", stock: 15, unit: "ชุด", minStock: 30 },
  { id: "mat_4", name: "มือจับอลูมิเนียม", stock: 22, unit: "ชิ้น", minStock: 40 },
  { id: "mat_5", name: "ลามิเนตขาวด้าน", stock: 8, unit: "แผ่น", minStock: 15 },
  { id: "mat_6", name: "ไม้โครงยางพารา 1x2", stock: 120, unit: "เส้น", minStock: 50 },
  { id: "mat_7", name: "กาวตราช้างขวดใหญ่", stock: 45, unit: "ขวด", minStock: 20 }
];

export interface ProductionOrder {
  id: string;
  name: string;
  customerName: string;
  status: "Design" | "Cutting" | "Assembly" | "Painting" | "QC" | "Delivery";
  dueDate: string;
}

export const initialProductionOrders: ProductionOrder[] = [
  { id: "JOB-2024-089", name: "ชุดครัวบิวท์อิน", customerName: "คุณสมชาย ใจดี", status: "Assembly", dueDate: "25 พ.ค. 2024" },
  { id: "JOB-2024-088", name: "ตู้เสื้อผ้า Walk-in", customerName: "คุณวิภา รุ่งเรือง", status: "QC", dueDate: "22 พ.ค. 2024" },
  { id: "JOB-2024-087", name: "เคาน์เตอร์ร้านกาแฟ", customerName: "คุณธนา พงศกร", status: "Delivery", dueDate: "20 พ.ค. 2024" },
  { id: "JOB-2024-086", name: "ชั้นวางทีวี", customerName: "คุณกมลวรรณ", status: "Design", dueDate: "28 พ.ค. 2024" }
];

export interface RosterEmployee {
  id: string;
  name: string;
  department: string;
  role: string;
  phone: string;
  status: "Active" | "On Leave" | "Suspended";
  image?: string;
  joiningDate?: string;
  salary?: number;
  skills?: string[];
  nickname?: string;
  citizenId?: string;
  bloodType?: string;
  address?: string;
  employmentType?: "Monthly" | "Daily";
  skillLevel?: "Apprentice" | "Mid-Level" | "Senior" | "Master";
  bankName?: string;
  bankAccountNo?: string;
  bankAccountName?: string;
  emergencyName?: string;
  emergencyRelation?: string;
  emergencyPhone?: string;
}

export const initialEmployees: RosterEmployee[] = [
  { 
    id: "emp_1", 
    name: "สมเกียรติ ยิ้มแย้ม", 
    nickname: "ช่างเกียรติ",
    department: "ฝ่ายตัด (CNC)", 
    role: "CNC Lead Operator", 
    phone: "082-123-4567", 
    status: "Active", 
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150",
    joiningDate: "2022-03-15",
    salary: 24000,
    skills: ["CNC Panel Saw", "AutoCAD Layout", "Wood Cutting"],
    citizenId: "1100200345678",
    bloodType: "A",
    address: "12/3 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110",
    employmentType: "Monthly",
    skillLevel: "Senior",
    bankName: "ธนาคารกสิกรไทย",
    bankAccountNo: "012-3-45678-9",
    bankAccountName: "นายสมเกียรติ ยิ้มแย้ม",
    emergencyName: "นางมะลิ ยิ้มแย้ม",
    emergencyRelation: "ภรรยา",
    emergencyPhone: "082-987-6543"
  },
  { 
    id: "emp_2", 
    name: "ธัญญา ช่างประกอบ", 
    nickname: "ช่างธัญ",
    department: "ฝ่ายประกอบ", 
    role: "Master Carpenter", 
    phone: "084-765-4321", 
    status: "Active", 
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150",
    joiningDate: "2021-08-01",
    salary: 28000,
    skills: ["Cabinet Assembly", "Solid Wood Joinery", "Fitting Installation"],
    citizenId: "3100500987654",
    bloodType: "O",
    address: "45/1 หมู่ 5 ต.บางใหญ่ อ.บางใหญ่ จ.นนทบุรี 11140",
    employmentType: "Monthly",
    skillLevel: "Master",
    bankName: "ธนาคารไทยพาณิชย์",
    bankAccountNo: "405-1-23456-7",
    bankAccountName: "นายธัญญา ช่างประกอบ",
    emergencyName: "นายทองดี ช่างประกอบ",
    emergencyRelation: "บิดา",
    emergencyPhone: "085-333-2211"
  },
  { 
    id: "emp_3", 
    name: "วิชาญ พ่นสี", 
    nickname: "ช่างชาญ",
    department: "ฝ่ายสี", 
    role: "Lead Spray Painter", 
    phone: "086-111-2222", 
    status: "Active", 
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150",
    joiningDate: "2023-01-10",
    salary: 750,
    skills: ["PU Paint Spraying", "High-Gloss Lacquer", "Surface Polishing"],
    citizenId: "1200300456123",
    bloodType: "B",
    address: "89 ถ.ลาดพร้าว แขวงจอมพล เขตจตุจักร กรุงเทพฯ 10900",
    employmentType: "Daily",
    skillLevel: "Senior",
    bankName: "ธนาคารกรุงเทพ",
    bankAccountNo: "101-4-56789-0",
    bankAccountName: "นายวิชาญ พ่นสี",
    emergencyName: "นางสมศรี พ่นสี",
    emergencyRelation: "มารดา",
    emergencyPhone: "081-444-5555"
  },
  { 
    id: "emp_4", 
    name: "รวิภา สุวรรณ", 
    nickname: "คุณกิ๊ฟ",
    department: "ออกแบบ & ประเมินราคา", 
    role: "Interior Estimator", 
    phone: "088-222-3333", 
    status: "Active", 
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150",
    joiningDate: "2022-11-01",
    salary: 32000,
    skills: ["BOQ Estimating", "3ds Max / SketchUp", "Material Sourcing"],
    citizenId: "1100900223344",
    bloodType: "AB",
    address: "202 คอนโดลุมพินี ซ.อารีย์ ถ.พหลโยธิน แขวงสามเสนใน เขตพญาไท กรุงเทพฯ 10400",
    employmentType: "Monthly",
    skillLevel: "Senior",
    bankName: "ธนาคารกรุงไทย",
    bankAccountNo: "002-1-98765-4",
    bankAccountName: "นางสาวรวิภา สุวรรณ",
    emergencyName: "นายประสงค์ สุวรรณ",
    emergencyRelation: "พี่ชาย",
    emergencyPhone: "087-654-3210"
  },
  { 
    id: "emp_5", 
    name: "อนันต์ ตรวจงาน", 
    nickname: "ช่างนัน",
    department: "ฝ่ายควบคุมคุณภาพ (QC)", 
    role: "QC Inspector", 
    phone: "089-333-4444", 
    status: "Active", 
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150",
    joiningDate: "2023-06-20",
    salary: 25000,
    skills: ["Quality Inspection", "Dimension Check", "Furniture Testing"],
    citizenId: "3400100778899",
    bloodType: "A",
    address: "15/9 ซ.รัชดาภิเษก 36 แขวงจันทรเกษม เขตจตุจักร กรุงเทพฯ 10900",
    employmentType: "Monthly",
    skillLevel: "Mid-Level",
    bankName: "ธนาคารทหารไทยธนชาต",
    bankAccountNo: "238-2-34567-8",
    bankAccountName: "นายอนันต์ ตรวจงาน",
    emergencyName: "นางแก้ว ตรวจงาน",
    emergencyRelation: "มารดา",
    emergencyPhone: "086-999-8888"
  }
];

export const initialSuppliers: Supplier[] = [
  {
    id: "sup_1",
    name: "บริษัท ไม้อัดไทยพัฒนา จำกัด",
    contactPerson: "คุณวิชัย เกียรติสุรนนท์",
    phone: "02-555-0199",
    email: "contact@thaiplywood.co.th",
    address: "99 ถ.รามอินทรา แขวงอนุสาวรีย์ เขตบางเขน กรุงเทพฯ 10220",
    taxId: "0105530123456",
    paymentTerms: "เครดิต 30 วัน",
    productCategory: "ไม้โครง & ไม้อัด HMR",
    createdAt: "2024-01-10T08:00:00Z"
  },
  {
    id: "sup_2",
    name: "บริษัท ฮาเฟเล่ (ประเทศไทย) จำกัด",
    contactPerson: "คุณกิตติพงษ์ สมประสงค์",
    phone: "02-768-7100",
    email: "info@hafele.co.th",
    address: "57 ซ.สุขุมวิท 64 แขวงบางจาก เขตพระโขนง กรุงเทพฯ 10260",
    taxId: "0105537022334",
    paymentTerms: "ชำระเงินสด / โอนจ่าย",
    productCategory: "ฟิตติ้ง & อุปกรณ์บานพับ",
    createdAt: "2024-01-12T09:00:00Z"
  },
  {
    id: "sup_3",
    name: "บริษัท สยามลามิเนต เซ็นเตอร์ จำกัด",
    contactPerson: "คุณณัฐพล รุ่งเรือง",
    phone: "02-943-8888",
    email: "sales@siamlaminate.com",
    address: "18/5 ถ.ประดิษฐ์มนูธรรม แขวงลาดพร้าว เขตลาดพร้าว กรุงเทพฯ 10230",
    taxId: "0105545088990",
    paymentTerms: "เครดิต 15 วัน",
    productCategory: "แผ่นลามิเนต & กาวทาไม้",
    createdAt: "2024-02-01T10:00:00Z"
  }
];

export const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: "PO-2024-001",
    supplierId: "sup_1",
    supplierName: "บริษัท ไม้อัดไทยพัฒนา จำกัด",
    projectAssociatedId: "proj_1",
    projectName: "ชุดครัวบิวท์อิน Luxury Penthouse Kitchen",
    items: [
      { itemName: "ไม้บอร์ด HMR 15 mm (4x8 ฟุต)", qty: 50, unit: "แผ่น", pricePerUnit: 600, totalPrice: 30000 },
      { itemName: "กาวตราช้าง ขวดใหญ่", qty: 20, unit: "ขวด", pricePerUnit: 200, totalPrice: 4000 }
    ],
    subtotal: 34000,
    vatRate: 7,
    vatAmount: 2380,
    grandTotal: 36380,
    status: "Delivered",
    date: "2024-05-15",
    deliveryDate: "2024-05-18",
    notes: "ส่งของหน้างาน Penthouse โครงการ Elite Residences",
    createdAt: "2024-05-15T09:00:00Z"
  },
  {
    id: "PO-2024-002",
    supplierId: "sup_2",
    supplierName: "บริษัท ฮาเฟเล่ (ประเทศไทย) จำกัด",
    projectAssociatedId: "proj_2",
    projectName: "ตู้เสื้อผ้า Walk-in Closet & Bedroom Built-in",
    items: [
      { itemName: "บานพับ Soft Close Metalla", qty: 200, unit: "ชิ้น", pricePerUnit: 80, totalPrice: 16000 },
      { itemName: "รางลิ้นชักลูกปืน 45 cm", qty: 50, unit: "ชุด", pricePerUnit: 200, totalPrice: 10000 }
    ],
    subtotal: 26000,
    vatRate: 7,
    vatAmount: 1820,
    grandTotal: 27820,
    status: "Sent",
    date: "2024-05-18",
    deliveryDate: "2024-05-22",
    notes: "จัดส่งของไปที่คลังสินค้าโรงงานหลักเพื่อประกอบโครง",
    createdAt: "2024-05-18T10:30:00Z"
  },
  {
    id: "PO-2024-003",
    supplierId: "sup_3",
    supplierName: "บริษัท สยามลามิเนต เซ็นเตอร์ จำกัด",
    projectAssociatedId: "proj_3",
    projectName: "เคาน์เตอร์ร้านกาแฟ Counter & Wall Panels",
    items: [
      { itemName: "ลามิเนตขาวด้านสยาม", qty: 30, unit: "แผ่น", pricePerUnit: 380, totalPrice: 11400 }
    ],
    subtotal: 11400,
    vatRate: 0,
    vatAmount: 0,
    grandTotal: 11400,
    status: "Draft",
    date: "2024-05-20",
    deliveryDate: "2024-05-25",
    notes: "ใบเสนอราคารอการอนุมัติโอนเงินมัดจำวัสดุ",
    createdAt: "2024-05-20T14:15:00Z"
  }
];

