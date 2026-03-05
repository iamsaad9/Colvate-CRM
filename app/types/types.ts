// ─── Deal ──────────────────────────────────────────────────────────────────
export enum UserRole {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  SALES = "SALES",
}

export interface User {
  id: string;
  companyId: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string | null;
  isActive: boolean;
  reportsToId?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// ─── Deal ──────────────────────────────────────────────────────────────────
export type DealStage = "PROSPECT" | "NEGOTIATION" | "WON" | "LOST";

export interface Deal {
  id: string;
  companyId: string;
  customerId: string;
  services: Service[];
  title: string;
  value: number;
  stage: DealStage;
  expectedCloseDate?: string | null;
  assignedTo?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    avatar?: string;
  };
}

// ─── Lead ──────────────────────────────────────────────────────────────────
export type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "LOST";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: LeadStatus;
  source: string;
  assignedTo?: string;
  lastContact?: string;
  createdAt: string;
  companyName?: string;
  value?: number;
  services?: Service[];
  user?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    avatar?: string;
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────
export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
}

// ─── Customers ──────────────────────────────────────────────────────────────────
export type CustomerStatus = "ACTIVE" | "INACTIVE" | "PROSPECT";

export interface Customer {
  id: string;
  companyId: string;
  name: string;
  email: string | null;
  phone: string | null;
  companyName: string | null;
  status: CustomerStatus;
  source: string | null;
  assignedTo: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    avatar?: string;
  };
}
