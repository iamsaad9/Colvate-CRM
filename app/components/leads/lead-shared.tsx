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

import { UserPlus, MessageSquare, UserCheck, UserMinus } from "lucide-react";

export const STATUS_META: Record<
  LeadStatus,
  {
    label: string;
    color:
      | "default"
      | "primary"
      | "secondary"
      | "success"
      | "warning"
      | "danger";
    icon: React.ReactNode;
    description: string;
  }
> = {
  NEW: {
    label: "New",
    color: "primary",
    icon: <UserPlus size={14} />,
    description: "New lead recently added or captured",
  },
  CONTACTED: {
    label: "Contacted",
    color: "secondary",
    icon: <MessageSquare size={14} />,
    description: "First contact has been established",
  },
  QUALIFIED: {
    label: "Qualified",
    color: "success",
    icon: <UserCheck size={14} />,
    description: "Lead meets criteria for deal conversion",
  },
  LOST: {
    label: "Lost",
    color: "danger",
    icon: <UserMinus size={14} />,
    description: "Lead is no longer interested or reachable",
  },
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
  const isLost = currentStatus === "LOST";

  return (
    <div className="flex items-start gap-0 w-full">
      {STATUS_STEPS.map((stage, i) => {
        const meta = STATUS_META[stage];
        const isActive = stage === currentStatus;
        const isPast = !isLost && i < activeIndex && stage !== "LOST";
        const isLast = i === STATUS_STEPS.length - 1;
        const isLostStage = stage === "LOST";

        return (
          <div key={stage} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center flex-1 min-w-0">
              <button
                disabled={!isEditing}
                onClick={() => isEditing && onChange?.(stage)}
                className={[
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200",
                  isActive && !isLostStage
                    ? `bg-${meta.color} border-${meta.color} text-white scale-110 shadow-lg shadow-${meta.color}/30`
                    : isActive && isLostStage
                      ? "bg-danger border-danger text-white scale-110 shadow-lg shadow-danger/30"
                      : isPast
                        ? "bg-success/20 border-success text-success"
                        : "bg-default-100 border-default-200 text-default-300",
                  isEditing
                    ? "cursor-pointer hover:scale-105 hover:border-primary"
                    : "cursor-default",
                ].join(" ")}
              >
                {isPast ? (
                  <CheckCircle size={16} />
                ) : (
                  <span className="text-current">{meta.icon}</span>
                )}
              </button>
              <div className="text-center mt-1.5 px-1">
                <p
                  className={[
                    "text-xs font-semibold truncate",
                    isActive ? `text-${meta.color}` : "text-default-400",
                  ].join(" ")}
                >
                  {meta.label}
                </p>
              </div>
            </div>
            {!isLast && (
              <div
                className={[
                  "h-0.5 flex-1 mb-7 mx-1 transition-all duration-300",
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
