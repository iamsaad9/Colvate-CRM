// lead-shared.tsx
// Shared types, constants, helpers, and sub-components for lead pages

import { CheckCircle } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "LOST";

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  isActive: boolean;
}

export interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  status: LeadStatus;
  source: string;
  assignedTo: string | null;
  services: Service[];
}

export const EMPTY_FORM: LeadFormData = {
  name: "",
  email: "",
  phone: "",
  status: "NEW",
  source: "",
  assignedTo: null,
  services: [],
};

// ─── Constants ────────────────────────────────────────────────────────────────

export const SOURCES = [
  "Website",
  "Referral",
  "LinkedIn",
  "Cold Email",
  "Trade Show",
  "Partner",
  "Advertisement",
];

export const STATUS_STEPS: LeadStatus[] = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "LOST",
];

export const STATUS_META: Record<
  LeadStatus,
  { label: string; color: "primary" | "secondary" | "success" | "danger" }
> = {
  NEW: { label: "New", color: "primary" },
  CONTACTED: { label: "Contacted", color: "secondary" },
  QUALIFIED: { label: "Qualified", color: "success" },
  LOST: { label: "Lost", color: "danger" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const formatCurrency = (value?: number) => {
  if (!value) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatDate = (dateStr?: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

// ─── StatusTimeline ───────────────────────────────────────────────────────────

export function StatusTimeline({
  currentStatus,
  onChange,
  isEditing,
}: {
  currentStatus: LeadStatus;
  onChange?: (s: LeadStatus) => void;
  isEditing: boolean;
}) {
  const activeIndex = STATUS_STEPS.indexOf(currentStatus);

  return (
    <div className="flex items-center gap-0 w-full">
      {STATUS_STEPS.map((step, i) => {
        const meta = STATUS_META[step];
        const isActive = i === activeIndex;
        const isPast = i < activeIndex && currentStatus !== "LOST";
        const isLast = i === STATUS_STEPS.length - 1;

        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <button
                disabled={!isEditing}
                onClick={() => isEditing && onChange?.(step)}
                className={[
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all",
                  isActive
                    ? `bg-${meta.color} border-${meta.color} text-white scale-110`
                    : isPast
                      ? "bg-success border-success text-white"
                      : "bg-default-100 border-default-300 text-default-400",
                  isEditing
                    ? "cursor-pointer hover:scale-110"
                    : "cursor-default",
                ].join(" ")}
              >
                {isPast ? <CheckCircle size={14} /> : i + 1}
              </button>
              <span
                className={[
                  "text-xs mt-1 font-medium",
                  isActive ? `text-${meta.color}` : "text-default-400",
                ].join(" ")}
              >
                {meta.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={[
                  "h-0.5 flex-1 mb-5 transition-all",
                  isPast ? "bg-success" : "bg-default-200",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
