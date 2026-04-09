export interface ServiceFormData {
  name: string;
  description: string;
  price: string;
  isActive: boolean;
}

export const EMPTY_SERVICE_FORM: ServiceFormData = {
  name: "",
  description: "",
  price: "",
  isActive: true,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const formatCurrency = (value?: number | string) => {
  const num = Number(value);
  if (!num && num !== 0) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
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
