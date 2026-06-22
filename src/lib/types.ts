export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  createdAt: string;
  taxId?: string;
  customerType?: 'Personal' | 'Corporate';
  lineId?: string;
  status?: 'Lead' | 'Active' | 'VIP' | 'Inactive';
  remarks?: string;
}

export type ProjectStatus = 'Planning' | 'In Progress' | 'Delayed' | 'Completed';

export interface Project {
  id: string;
  customerId: string;
  customerName: string;
  name: string;
  status: ProjectStatus;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  budget: number;
  paidAmount: number;
  createdAt: string;
  image?: string;
  description?: string;
  images?: string[];
}

export type PaymentStatus = 'Pending' | 'Paid' | 'Overdue';
export type PaymentType = 'Deposit' | 'Installment 1' | 'Installment 2' | 'Final Payment' | 'Custom';

export interface Payment {
  id: string;
  projectId: string;
  projectName: string;
  customerId: string;
  customerName: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  status: PaymentStatus;
  paidDate: string | null; // YYYY-MM-DD or null
  type: PaymentType;
  createdAt: string;
}

export interface UserSession {
  uid: string;
  email: string;
  displayName: string | null;
  role?: string;
}

export const TRANSLATE_PROJECT_STATUS: Record<ProjectStatus, string> = {
  Planning: "วางแผน",
  "In Progress": "กำลังดำเนินการ",
  Delayed: "ล่าช้า",
  Completed: "เสร็จสิ้น",
};

export const TRANSLATE_PAYMENT_STATUS: Record<PaymentStatus, string> = {
  Pending: "ค้างชำระ",
  Paid: "ชำระแล้ว",
  Overdue: "เกินกำหนด",
};

export const TRANSLATE_PAYMENT_TYPE: Record<PaymentType, string> = {
  Deposit: "เงินมัดจำ",
  "Installment 1": "งวดที่ 1",
  "Installment 2": "งวดที่ 2",
  "Final Payment": "งวดสุดท้าย",
  Custom: "งวดพิเศษ",
};

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  taxId: string;
  paymentTerms: string;
  productCategory: string;
  createdAt: string;
}

export type POStatus = 'Draft' | 'Sent' | 'Delivered' | 'Cancelled';

export interface PurchaseOrderItem {
  itemName: string;
  qty: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  projectAssociatedId?: string;
  projectName?: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  vatRate: number; // 0 or 7
  vatAmount: number;
  grandTotal: number;
  status: POStatus;
  date: string; // YYYY-MM-DD
  deliveryDate: string; // YYYY-MM-DD
  notes?: string;
  createdAt: string;
}

export const TRANSLATE_PO_STATUS: Record<POStatus, string> = {
  Draft: "ร่างใบสั่งซื้อ",
  Sent: "ส่งใบสั่งซื้อแล้ว",
  Delivered: "ได้รับสินค้าแล้ว",
  Cancelled: "ยกเลิกแล้ว"
};

