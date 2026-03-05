// deal-shared.tsx
// Shared types, constants, helpers, and sub-components for deal pages

import {
  BadgeDollarSign,
  CheckCircle2,
  Handshake,
  TrendingUp,
  UserPlus,
  X,
} from "lucide-react";
import { Checkbox, Input, Select, SelectItem } from "@heroui/react";
import { DealStage, Service } from "@/app/types/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NewCustomerData {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  source: string;
  assignedTo?: string;
}

export interface DealFormData {
  title: string;
  customerId: string | null;
  services: Service[];
  value: number;
  stage: DealStage;
  expectedCloseDate: string;
  assignedTo: string | null;
}

export const EMPTY_FORM: DealFormData = {
  title: "",
  customerId: null,
  services: [],
  value: 0,
  stage: "PROSPECT",
  expectedCloseDate: "",
  assignedTo: null,
};

export const EMPTY_NEW_CUSTOMER: NewCustomerData = {
  name: "",
  email: "",
  phone: "",
  companyName: "",
  assignedTo: "",
  source: "",
};

// ─── Constants ────────────────────────────────────────────────────────────────

export const STAGE_STEPS: DealStage[] = [
  "PROSPECT",
  "NEGOTIATION",
  "WON",
  "LOST",
];

export const SOURCES = [
  "Website",
  "Referral",
  "LinkedIn",
  "Cold Email",
  "Trade Show",
  "Partner",
  "Advertisement",
];

export const STAGE_META: Record<
  DealStage,
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
  PROSPECT: {
    label: "Prospect",
    color: "primary",
    icon: <TrendingUp size={14} />,
    description: "Initial opportunity identified",
  },
  NEGOTIATION: {
    label: "Negotiation",
    color: "warning",
    icon: <Handshake size={14} />,
    description: "Actively discussing terms",
  },
  WON: {
    label: "Won",
    color: "success",
    icon: <CheckCircle2 size={14} />,
    description: "Deal successfully closed",
  },
  LOST: {
    label: "Lost",
    color: "danger",
    icon: <X size={14} />,
    description: "Opportunity did not close",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const formatCurrency = (value?: number | string) => {
  const num = Number(value);
  if (!num) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatDate = (dateStr?: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export const toInputDate = (dateStr?: string | null) => {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().split("T")[0];
};

// ─── StagePipeline ────────────────────────────────────────────────────────────

export function StagePipeline({
  currentStage,
  onChange,
  isEditing,
}: {
  currentStage: DealStage;
  onChange?: (s: DealStage) => void;
  isEditing: boolean;
}) {
  const activeIndex = STAGE_STEPS.indexOf(currentStage);
  const isLost = currentStage === "LOST";

  return (
    <div className="flex items-start gap-0 w-full">
      {STAGE_STEPS.map((stage, i) => {
        const meta = STAGE_META[stage];
        const isActive = stage === currentStage;
        const isPast = !isLost && i < activeIndex && stage !== "LOST";
        const isLast = i === STAGE_STEPS.length - 1;
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
                    ? "bg-warning border-warning text-white scale-110 shadow-lg shadow-warning/30"
                    : isActive && isLostStage
                      ? "bg-danger border-danger text-white scale-110 shadow-lg shadow-danger/30"
                      : isPast
                        ? "bg-success/20 border-success text-success"
                        : "bg-default-100 border-default-200 text-default-300",
                  isEditing
                    ? "cursor-pointer hover:scale-105 hover:border-primary"
                    : "cursor-default",
                  isActive && stage === "WON"
                    ? "!bg-success !border-success !text-white"
                    : "",
                  isActive && stage === "PROSPECT"
                    ? "!bg-primary !border-primary !text-white"
                    : "",
                ].join(" ")}
              >
                {isPast ? (
                  <CheckCircle2 size={16} />
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
                <p className="text-[10px] text-default-300 hidden md:block truncate">
                  {meta.description}
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

// ─── DealValueBadge ───────────────────────────────────────────────────────────

export function DealValueBadge({ value }: { value?: number | string }) {
  const num = Number(value);
  const size =
    num >= 100000 ? "text-3xl" : num >= 10000 ? "text-2xl" : "text-xl";

  return (
    <div className="flex items-center gap-2">
      <BadgeDollarSign size={20} className="text-success" />
      <span className={`font-bold text-success ${size}`}>
        {formatCurrency(num)}
      </span>
    </div>
  );
}

// ─── NewCustomerSection ───────────────────────────────────────────────────────

export function NewCustomerSection({
  isNewCustomer,
  onToggle,
  newCustomerData,
  onCustomerDataChange,
  children,
}: {
  isNewCustomer: boolean;
  onToggle: (checked: boolean) => void;
  newCustomerData: NewCustomerData;
  onCustomerDataChange: (data: NewCustomerData) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="md:col-span-2 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-default-700">Customer</label>
        <Checkbox
          isSelected={isNewCustomer}
          onValueChange={onToggle}
          size="sm"
          classNames={{ label: "text-sm text-default-600" }}
        >
          <span className="flex items-center gap-1.5 text-sm">
            <UserPlus size={14} />
            New customer
          </span>
        </Checkbox>
      </div>

      {!isNewCustomer ? (
        children
      ) : (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <UserPlus size={15} className="text-primary" />
            <p className="text-sm font-medium text-primary">
              New Customer Details
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Full Name"
              placeholder="Jane Smith"
              isRequired
              value={newCustomerData.name}
              onValueChange={(v) =>
                onCustomerDataChange({ ...newCustomerData, name: v })
              }
            />
            <Input
              label="Email"
              placeholder="jane@company.com"
              type="email"
              value={newCustomerData.email}
              onValueChange={(v) =>
                onCustomerDataChange({ ...newCustomerData, email: v })
              }
            />
            <Input
              label="Phone"
              placeholder="+1 (555) 000-0000"
              type="tel"
              value={newCustomerData.phone}
              onValueChange={(v) =>
                onCustomerDataChange({ ...newCustomerData, phone: v })
              }
            />
            <Input
              label="Company Name"
              placeholder="Acme Corp"
              value={newCustomerData.companyName}
              onValueChange={(v) =>
                onCustomerDataChange({ ...newCustomerData, companyName: v })
              }
            />
            {/* <Input
              label="Source"
              placeholder="e.g. Referral, LinkedIn..."
              className="md:col-span-2"
              value={newCustomerData.source}
              onValueChange={(v) =>
                onCustomerDataChange({ ...newCustomerData, source: v })
              }
            /> */}
            <Select
              label="Source"
              placeholder="Select source"
              radius="sm"
              selectedKeys={
                newCustomerData.source
                  ? new Set([newCustomerData.source])
                  : new Set()
              }
              onSelectionChange={(keys) =>
                onCustomerDataChange({
                  ...newCustomerData,
                  source: Array.from(keys)[0] as string,
                })
              }
            >
              {SOURCES.map((s) => (
                <SelectItem key={s}>{s}</SelectItem>
              ))}
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
