"use client";

import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Chip,
  DatePicker,
  Divider,
  Input,
  Select,
  SelectItem,
  Skeleton,
} from "@heroui/react";
import {
  ArrowLeft,
  BadgeDollarSign,
  Calendar,
  CheckCircle2,
  Edit,
  Mail,
  Phone,
  Save,
  Handshake,
  Trash2,
  User as UserIcon,
  X,
  TrendingUp,
  Clock,
  Building2,
  Layers,
  UserPlus,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useDeal } from "@/app/hooks/useDeal";
import { useAllUser } from "@/app/hooks/useAllUsers";
import { useServices } from "@/app/hooks/useServices";
import { useCustomers } from "@/app/hooks/useCustomers";
import { useUser } from "@/app/context/UserContext";
import { Deal, DealStage, Service, User } from "@/app/types/types";
import { parseDate, getLocalTimeZone } from "@internationalized/date";

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface NewCustomerData {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  source: string;
}

interface FormData {
  title: string;
  customerId: string | null;
  serviceId: string;
  value: string;
  stage: DealStage;
  expectedCloseDate: string;
  assignedTo: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STAGE_STEPS: DealStage[] = ["PROSPECT", "NEGOTIATION", "WON", "LOST"];

const STAGE_META: Record<
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

const formatCurrency = (value?: number | string) => {
  const num = Number(value);
  if (!num) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const toInputDate = (dateStr?: string | null) => {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().split("T")[0];
};

// ─── Stage Pipeline ───────────────────────────────────────────────────────────

function StagePipeline({
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
                      : isActive && stage === "WON"
                        ? "bg-success border-success text-white scale-110 shadow-lg shadow-success/30"
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

// ─── Value Display ────────────────────────────────────────────────────────────

function DealValueBadge({ value }: { value?: number | string }) {
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DealDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const dealId = params.dealId as string;
  const isNew = dealId === "new";
  const editParam = searchParams.get("edit") === "true";

  const [isEditing, setIsEditing] = useState(isNew || editParam);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── New customer toggle state ──────────────────────────────────────────────
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState<NewCustomerData>({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    source: "",
  });

  const currentUser = useUser();

  // ── Data Fetching ────────────────────────────────────────────────────────────
  const {
    data: deal,
    isLoading: dealLoading,
    refetch: refetchDeal,
  } = useDeal(isNew ? null : dealId, currentUser?.companyId || "");

  const { data: allUsers = [], isLoading: usersLoading } = useAllUser(
    currentUser?.companyId || "",
  );
  const { data: allServices = [], isLoading: servicesLoading } = useServices(
    currentUser?.companyId || "",
  );
  const { data: allCustomers = [], isLoading: customersLoading } = useCustomers(
    currentUser?.companyId || "",
  );

  const userLead = deal?.assignedTo === currentUser?.id || isNew;
  const leadCustomer = allCustomers.find(
    (c: Customer) => c.id === deal?.customerId,
  );
  const leadService = allServices.find(
    (s: Service) => s.id === deal?.serviceId,
  );

  const [formData, setFormData] = useState<FormData>({
    title: "",
    customerId: null,
    serviceId: "",
    value: "",
    stage: "PROSPECT",
    expectedCloseDate: "",
    assignedTo: null,
  });

  // Populate form when deal loads
  useEffect(() => {
    if (deal) {
      setFormData({
        title: deal.title ?? "",
        customerId: deal.customerId ?? null,
        serviceId: deal.serviceId ?? "",
        value: deal.value?.toString() ?? "",
        stage: deal.stage ?? "PROSPECT",
        expectedCloseDate: toInputDate(deal.expectedCloseDate),
        assignedTo: deal.assignedTo ?? null,
      });
    }
  }, [deal]);

  // Auto-fill value from selected service
  const selectedService = useMemo(
    () => allServices.find((s: Service) => s.id === formData.serviceId),
    [allServices, formData.serviceId],
  );

  const assignedUser = useMemo(
    () =>
      allUsers.find(
        (u: User) =>
          u.id ===
          (isNew
            ? formData.assignedTo
            : (deal?.assignedTo ?? formData.assignedTo)),
      ),
    [allUsers, deal, formData.assignedTo, isNew],
  );

  const selectedCustomer = useMemo(
    () =>
      allCustomers.find(
        (c: Customer) =>
          c.id ===
          (isNew
            ? formData.customerId
            : (deal?.customerId ?? formData.customerId)),
      ),
    [allCustomers, deal, formData.customerId, isNew],
  );

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setIsSubmitting(true);

    try {
      let customerId = formData.customerId;

      // If new customer, create them first
      if (isNewCustomer) {
        if (!newCustomerData.name) {
          alert("Customer name is required.");
          setIsSubmitting(false);
          return;
        }

        const customerRes = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...newCustomerData,
            companyId: currentUser?.companyId,
            assignedTo: formData.assignedTo || null,
          }),
        });

        if (!customerRes.ok) {
          const err = await customerRes.json();
          alert(`Error creating customer: ${err.error}`);
          setIsSubmitting(false);
          return;
        }

        const createdCustomer = await customerRes.json();
        customerId = createdCustomer.id;
      }

      const dealPayload = {
        ...formData,
        customerId,
        value: parseFloat(formData.value) || 0,
        expectedCloseDate: formData.expectedCloseDate || null,
        assignedTo: formData.assignedTo || null,
      };
      console.log("Saving deal with payload:", dealPayload);
      if (isNew) {
        const res = await fetch("/api/deals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...dealPayload,
            companyId: currentUser?.companyId,
          }),
        });

        if (res.ok) {
          const created = await res.json();
          router.replace(`/deals/${created.id}`);
        } else {
          const err = await res.json();
          alert(`Error: ${err.error}`);
        }
      } else {
        const res = await fetch(
          `/api/deals/${dealId}?companyId=${currentUser?.companyId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dealPayload),
          },
        );
        if (res.ok) {
          await refetchDeal();
          setIsEditing(false);
          router.replace(`/deals/${dealId}`);
        } else {
          const err = await res.json();
          alert(`Error: ${err.error}`);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${deal?.title}"? This cannot be undone.`)) return;
    try {
      await fetch(`/api/deals/${dealId}`, { method: "DELETE" });
      router.push("/deals");
    } catch (err) {
      console.error(err);
    }
  };

  const handleStageChange = async (stage: DealStage) => {
    if (isEditing) {
      setFormData({ ...formData, stage });
      return;
    }
    try {
      await fetch(`/api/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      });
      await refetchDeal();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    if (isNew) {
      router.push("/deals");
    } else {
      if (deal) {
        setFormData({
          title: deal.title ?? "",
          customerId: deal.customerId ?? null,
          serviceId: deal.serviceId ?? "",
          value: deal.value?.toString() ?? "",
          stage: deal.stage ?? "PROSPECT",
          expectedCloseDate: toInputDate(deal.expectedCloseDate),
          assignedTo: deal.assignedTo ?? "",
        });
      }
      setIsNewCustomer(false);
      setNewCustomerData({
        name: "",
        email: "",
        phone: "",
        companyName: "",
        source: "",
      });
      setIsEditing(false);
      router.replace(`/deals/${dealId}`);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────

  const isLoading =
    (!isNew && dealLoading) ||
    usersLoading ||
    servicesLoading ||
    customersLoading;

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48 rounded-lg" />
        <Skeleton className="h-24 rounded-xl" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <Skeleton className="h-56 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!isNew && !deal) {
    return (
      <div className="p-6 max-w-5xl mx-auto text-center py-24">
        <p className="text-default-400 text-lg">Deal not found.</p>
        <Button
          className="mt-4"
          variant="flat"
          onPress={() => router.push("/deals")}
        >
          Back to Deals
        </Button>
      </div>
    );
  }

  const currentStage = isEditing ? formData.stage : (deal?.stage ?? "PROSPECT");
  const stageMeta = STAGE_META[currentStage];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            isIconOnly
            variant="flat"
            radius="full"
            onPress={() => router.push("/deals")}
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">
                {isNew ? "New Deal" : isEditing ? "Edit Deal" : deal?.title}
              </h1>
              {!isNew && (
                <Chip size="sm" color={stageMeta.color} variant="flat">
                  {stageMeta.label}
                </Chip>
              )}
            </div>
            {!isNew && (
              <p className="text-default-400 text-sm mt-0.5">
                Created {formatDate(deal?.createdAt)} · Last updated{" "}
                {formatDate(deal?.updatedAt)}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          {isEditing ? (
            <>
              <Button
                variant="flat"
                radius="full"
                startContent={<X size={16} />}
                onPress={handleCancel}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                radius="full"
                startContent={<Save size={16} />}
                onPress={handleSave}
                isLoading={isSubmitting}
                isDisabled={!formData.title}
              >
                {isNew ? "Create Deal" : "Save Changes"}
              </Button>
            </>
          ) : (
            userLead && (
              <>
                <Button
                  variant="flat"
                  radius="full"
                  color="danger"
                  startContent={<Trash2 size={16} />}
                  onPress={handleDelete}
                >
                  Delete
                </Button>
                <Button
                  color="primary"
                  radius="full"
                  startContent={<Edit size={16} />}
                  onPress={() => setIsEditing(true)}
                >
                  Edit Deal
                </Button>
              </>
            )
          )}
        </div>
      </div>

      {/* ── Stage Pipeline ── */}
      <Card>
        <CardBody className="py-5 px-6">
          <StagePipeline
            currentStage={currentStage}
            onChange={handleStageChange}
            isEditing={isEditing}
          />
          {!isEditing && (
            <p className="text-xs text-default-400 text-center mt-1">
              Click a stage to quickly advance this deal
            </p>
          )}
          {isEditing && (
            <p className="text-xs text-default-400 text-center mt-1">
              Click a stage to set the deal status
            </p>
          )}
        </CardBody>
      </Card>

      {/* ── Main Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left column ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Deal Info */}
          <Card>
            <CardHeader className="pb-0">
              <h2 className="text-lg font-semibold">Deal Information</h2>
            </CardHeader>
            <CardBody>
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Deal Title"
                    placeholder="e.g. Acme Corp — Enterprise Plan"
                    isRequired
                    className="md:col-span-2"
                    value={formData.title}
                    onValueChange={(v) =>
                      setFormData({ ...formData, title: v })
                    }
                  />

                  {/* ── Customer Section ── */}
                  <div className="md:col-span-2 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-default-700">
                        Customer
                      </label>
                      <Checkbox
                        isSelected={isNewCustomer}
                        onValueChange={(checked) => {
                          setIsNewCustomer(checked);
                          if (checked) {
                            setFormData({ ...formData, customerId: null });
                          } else {
                            setNewCustomerData({
                              name: "",
                              email: "",
                              phone: "",
                              companyName: "",
                              source: "",
                            });
                          }
                        }}
                        size="sm"
                        classNames={{
                          label: "text-sm text-default-600",
                        }}
                      >
                        <span className="flex items-center gap-1.5 text-sm">
                          <UserPlus size={14} />
                          New customer
                        </span>
                      </Checkbox>
                    </div>

                    {!isNewCustomer ? (
                      <Select
                        label="Select existing customer"
                        placeholder="Search customers..."
                        isRequired
                        selectedKeys={
                          formData.customerId
                            ? new Set([formData.customerId])
                            : new Set()
                        }
                        onSelectionChange={(keys) =>
                          setFormData({
                            ...formData,
                            customerId: Array.from(keys)[0] as string,
                          })
                        }
                      >
                        {allCustomers.map((c: Customer) => (
                          <SelectItem
                            key={c.id}
                            textValue={c.name}
                            description={c.email}
                          >
                            {c.name}
                          </SelectItem>
                        ))}
                      </Select>
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
                              setNewCustomerData({
                                ...newCustomerData,
                                name: v,
                              })
                            }
                          />
                          <Input
                            label="Email"
                            placeholder="jane@company.com"
                            type="email"
                            value={newCustomerData.email}
                            onValueChange={(v) =>
                              setNewCustomerData({
                                ...newCustomerData,
                                email: v,
                              })
                            }
                          />
                          <Input
                            label="Phone"
                            placeholder="+1 (555) 000-0000"
                            type="tel"
                            value={newCustomerData.phone}
                            onValueChange={(v) =>
                              setNewCustomerData({
                                ...newCustomerData,
                                phone: v,
                              })
                            }
                          />
                          <Input
                            label="Company Name"
                            placeholder="Acme Corp"
                            value={newCustomerData.companyName}
                            onValueChange={(v) =>
                              setNewCustomerData({
                                ...newCustomerData,
                                companyName: v,
                              })
                            }
                          />
                          <Input
                            label="Source"
                            placeholder="e.g. Referral, LinkedIn..."
                            className="md:col-span-2"
                            value={newCustomerData.source}
                            onValueChange={(v) =>
                              setNewCustomerData({
                                ...newCustomerData,
                                source: v,
                              })
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Select
                    label="Service"
                    placeholder="Select service"
                    isRequired
                    selectedKeys={
                      formData.serviceId
                        ? new Set([formData.serviceId])
                        : new Set()
                    }
                    onSelectionChange={(keys) => {
                      const serviceId = Array.from(keys)[0] as string;
                      const svc = allServices.find(
                        (s: Service) => s.id === serviceId,
                      );
                      setFormData({
                        ...formData,
                        serviceId,
                        value:
                          !formData.value && svc
                            ? svc.price.toString()
                            : formData.value,
                      });
                    }}
                  >
                    {allServices
                      .filter((s: Service) => s.isActive)
                      .map((s: Service) => (
                        <SelectItem
                          key={s.id}
                          textValue={s.name}
                          description={formatCurrency(s.price)}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span>{s.name}</span>
                            <Chip size="sm" variant="flat" color="success">
                              {formatCurrency(s.price)}
                            </Chip>
                          </div>
                        </SelectItem>
                      ))}
                  </Select>

                  <Input
                    label="Deal Value"
                    placeholder="0"
                    type="number"
                    min="0"
                    startContent={
                      <span className="text-default-400 text-sm">$</span>
                    }
                    value={formData.value}
                    onValueChange={(v) =>
                      setFormData({ ...formData, value: v })
                    }
                    description={
                      selectedService
                        ? `Service list price: ${formatCurrency(selectedService.price)}`
                        : undefined
                    }
                  />
                  <DatePicker
                    label="Expected Close Date"
                    value={
                      formData.expectedCloseDate
                        ? parseDate(formData.expectedCloseDate)
                        : null
                    }
                    onChange={(date) =>
                      setFormData({
                        ...formData,
                        expectedCloseDate: date ? date.toString() : "",
                      })
                    }
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Value hero */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-success/5 border border-success/20">
                    <div>
                      <p className="text-xs text-default-400 mb-1">
                        Deal Value
                      </p>
                      <DealValueBadge value={deal?.value} />
                    </div>
                    {deal?.expectedCloseDate && (
                      <div className="text-right">
                        <p className="text-xs text-default-400 mb-1">
                          Expected Close
                        </p>
                        <div className="flex items-center gap-1.5 text-sm font-medium">
                          <Calendar size={14} className="text-default-400" />
                          {formatDate(deal.expectedCloseDate)}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <p className="text-xs text-default-400 mb-1.5">
                        Customer
                      </p>
                      {leadCustomer ? (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-default-100 flex items-center justify-center">
                            <Building2 size={14} className="text-default-400" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {leadCustomer.name}
                            </p>
                            {leadCustomer.email && (
                              <p className="text-xs text-default-400">
                                {leadCustomer.email}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-default-400 text-sm">-</p>
                      )}
                    </div>

                    <div>
                      <p className="text-xs text-default-400 mb-1.5">Service</p>
                      {leadService ? (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-default-100 flex items-center justify-center">
                            <Layers size={14} className="text-default-400" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {leadService.name}
                            </p>
                            <p className="text-xs text-default-400">
                              List price: {formatCurrency(leadService.price)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-default-400 text-sm">-</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* ── Right sidebar ── */}
        <div className="space-y-6">
          {/* Assignment */}
          <Card>
            <CardHeader className="pb-0">
              <h2 className="text-lg font-semibold">Owner</h2>
            </CardHeader>
            <CardBody>
              {isEditing ? (
                <Select
                  label="Assign To"
                  placeholder="Select team member"
                  selectedKeys={
                    formData.assignedTo
                      ? new Set([formData.assignedTo])
                      : new Set()
                  }
                  onSelectionChange={(keys) =>
                    setFormData({
                      ...formData,
                      assignedTo: (Array.from(keys)[0] as string) ?? "",
                    })
                  }
                >
                  {allUsers
                    .filter((u: User) => u.role === "SALES")
                    .map((user: User) => (
                      <SelectItem key={user.id} textValue={user.name}>
                        <div className="flex items-center gap-2">
                          <Avatar
                            src={user.avatarUrl || ""}
                            name={user.name}
                            size="sm"
                            color="primary"
                          />
                          <div>
                            <p className="text-sm">{user.name}</p>
                            <p className="text-xs text-default-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                </Select>
              ) : assignedUser ? (
                <div className="flex items-center gap-3">
                  <Avatar
                    src={assignedUser.avatarUrl || ""}
                    name={assignedUser.name}
                    size="md"
                  />
                  <div>
                    <p className="font-semibold text-sm">{assignedUser.name}</p>
                    <p className="text-xs text-default-400">
                      {assignedUser.email}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-default-400">
                  <UserIcon size={16} />
                  <span className="text-sm">Unassigned</span>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Deal metadata */}
          {!isNew && (
            <Card>
              <CardHeader className="pb-0">
                <h2 className="text-lg font-semibold">Details</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <p className="text-xs text-default-400 mb-1">Stage</p>
                  <Chip
                    size="sm"
                    color={stageMeta.color}
                    variant="flat"
                    startContent={stageMeta.icon}
                  >
                    {stageMeta.label}
                  </Chip>
                </div>

                <div>
                  <p className="text-xs text-default-400 mb-1">Value</p>
                  <p className="font-bold text-success">
                    {formatCurrency(deal?.value)}
                  </p>
                </div>

                {deal?.expectedCloseDate && (
                  <div>
                    <p className="text-xs text-default-400 mb-1">
                      Expected Close
                    </p>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Calendar size={13} className="text-default-400" />
                      {formatDate(deal.expectedCloseDate)}
                    </div>
                  </div>
                )}

                <Divider />

                <div>
                  <p className="text-xs text-default-400 mb-1">Created</p>
                  <div className="flex items-center gap-1 text-sm">
                    <Clock size={13} className="text-default-400" />
                    {formatDate(deal?.createdAt)}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-default-400 mb-1">Last Updated</p>
                  <div className="flex items-center gap-1 text-sm">
                    <Clock size={13} className="text-default-400" />
                    {formatDate(deal?.updatedAt)}
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Quick Actions — view mode only */}
          {!isEditing && !isNew && deal?.customer && (
            <Card>
              <CardHeader className="pb-0">
                <h2 className="text-lg font-semibold">Quick Actions</h2>
              </CardHeader>
              <CardBody className="space-y-2">
                {deal.customer.email && (
                  <Button
                    fullWidth
                    variant="flat"
                    startContent={<Mail size={16} />}
                    onPress={() => {
                      window.location.href = `mailto:${deal.customer!.email}`;
                    }}
                  >
                    Email Customer
                  </Button>
                )}
                {deal.customer.phone && (
                  <Button
                    fullWidth
                    variant="flat"
                    startContent={<Phone size={16} />}
                    onPress={() => {
                      window.location.href = `tel:${deal.customer!.phone}`;
                    }}
                  >
                    Call Customer
                  </Button>
                )}

                <Divider className="my-1" />

                {deal.stage !== "WON" && (
                  <Button
                    fullWidth
                    color="success"
                    variant="flat"
                    startContent={<CheckCircle2 size={16} />}
                    onPress={() => handleStageChange("WON")}
                  >
                    Mark as Won
                  </Button>
                )}
                {deal.stage !== "LOST" && (
                  <Button
                    fullWidth
                    color="danger"
                    variant="flat"
                    startContent={<X size={16} />}
                    onPress={() => handleStageChange("LOST")}
                  >
                    Mark as Lost
                  </Button>
                )}
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
