"use client";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Input,
  Skeleton,
  Switch,
  Textarea,
  User as UserComponent,
} from "@heroui/react";
import {
  ArrowLeft,
  BadgeDollarSign,
  BarChart3,
  Edit,
  Layers,
  Save,
  Tag,
  Trash2,
  TrendingUp,
  X,
  FileText,
  CheckCircle2,
  Clock,
  Handshake,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useServices } from "@/app/hooks/useServices";
import { useUser } from "@/app/context/UserContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  name: string;
  description: string;
  price: string;
  isActive: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (value?: number | string) => {
  const num = Number(value);
  if (isNaN(num)) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const DEAL_STAGE_META: Record<
  string,
  {
    color: "default" | "primary" | "warning" | "success" | "danger";
    label: string;
  }
> = {
  PROSPECT: { color: "primary", label: "Prospect" },
  NEGOTIATION: { color: "warning", label: "Negotiation" },
  WON: { color: "success", label: "Won" },
  LOST: { color: "danger", label: "Lost" },
};

const LEAD_STATUS_META: Record<
  string,
  {
    color: "default" | "primary" | "secondary" | "success" | "danger";
    label: string;
  }
> = {
  NEW: { color: "primary", label: "New" },
  CONTACTED: { color: "secondary", label: "Contacted" },
  QUALIFIED: { color: "success", label: "Qualified" },
  LOST: { color: "danger", label: "Lost" },
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  color = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color?: "default" | "success" | "primary" | "warning";
}) {
  const colorMap = {
    default: "bg-default-100 text-default-600",
    success: "bg-success/10 text-success",
    primary: "bg-primary/10 text-primary",
    warning: "bg-warning/10 text-warning",
  };

  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-divider bg-default-50">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs text-default-400">{label}</p>
        <p className="font-bold text-lg leading-tight">{value}</p>
        {sub && <p className="text-xs text-default-400">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ServiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const serviceId = params.serviceId as string;
  const isNew = serviceId === "new";
  const editParam = searchParams.get("edit") === "true";

  const [isEditing, setIsEditing] = useState(isNew || editParam);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUser = useUser();

  const {
    data: service,
    isLoading: serviceLoading,
    refetch: refetchService,
  } = useServices(isNew ? null : serviceId);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    price: "",
    isActive: true,
  });

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name ?? "",
        description: service.description ?? "",
        price: service.price?.toString() ?? "",
        isActive: service.isActive ?? true,
      });
    }
  }, [service]);

  // ── Derived stats ──────────────────────────────────────────────────────────

  const totalLeads = service?._count?.leads ?? service?.leads?.length ?? 0;
  const totalDeals = service?._count?.deals ?? service?.deals?.length ?? 0;
  const wonDeals = service?.deals?.filter((d) => d.stage === "WON") ?? [];
  const totalRevenue = wonDeals.reduce((sum, d) => sum + Number(d.value), 0);
  const activeDeals =
    service?.deals?.filter(
      (d) => d.stage === "PROSPECT" || d.stage === "NEGOTIATION",
    ) ?? [];
  const pipelineValue = activeDeals.reduce(
    (sum, d) => sum + Number(d.value),
    0,
  );

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price) || 0,
        isActive: formData.isActive,
        companyId: currentUser?.companyId,
      };

      if (isNew) {
        const res = await fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const created = await res.json();
          router.replace(`/services/${created.id}`);
        } else {
          const err = await res.json();
          alert(`Error: ${err.error}`);
        }
      } else {
        const res = await fetch(`/api/services/${serviceId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          await refetchService();
          setIsEditing(false);
          router.replace(`/services/${serviceId}`);
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
    if (!confirm(`Delete "${service?.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/services/${serviceId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/services");
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleActive = async () => {
    try {
      await fetch(`/api/services/${serviceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !service?.isActive }),
      });
      await refetchService();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    if (isNew) {
      router.push("/services");
    } else {
      if (service) {
        setFormData({
          name: service.name ?? "",
          description: service.description ?? "",
          price: service.price?.toString() ?? "",
          isActive: service.isActive ?? true,
        });
      }
      setIsEditing(false);
      router.replace(`/services/${serviceId}`);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────

  if (!isNew && serviceLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48 rounded-lg" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!isNew && !service) {
    return (
      <div className="p-6 max-w-5xl mx-auto text-center py-24">
        <p className="text-default-400 text-lg">Service not found.</p>
        <Button
          className="mt-4"
          variant="flat"
          onPress={() => router.push("/services")}
        >
          Back to Services
        </Button>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            isIconOnly
            variant="flat"
            radius="full"
            onPress={() => router.push("/services")}
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">
                {isNew
                  ? "New Service"
                  : isEditing
                    ? "Edit Service"
                    : service?.name}
              </h1>
              {!isNew && (
                <Chip
                  size="sm"
                  color={service?.isActive ? "success" : "default"}
                  variant="flat"
                >
                  {service?.isActive ? "Active" : "Inactive"}
                </Chip>
              )}
            </div>
            {!isNew && (
              <p className="text-default-400 text-sm mt-0.5">
                Created {formatDate(service?.createdAt)} · Updated{" "}
                {formatDate(service?.updatedAt)}
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
                isDisabled={!formData.name || !formData.price}
              >
                {isNew ? "Create Service" : "Save Changes"}
              </Button>
            </>
          ) : (
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
                Edit Service
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ── Stats Row (view mode only) ── */}
      {!isNew && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<BadgeDollarSign size={18} />}
            label="List Price"
            value={formatCurrency(service?.price)}
            color="success"
          />
          <StatCard
            icon={<TrendingUp size={18} />}
            label="Linked Leads"
            value={totalLeads.toString()}
            sub="across all statuses"
            color="primary"
          />
          <StatCard
            icon={<Handshake size={18} />}
            label="Active Pipeline"
            value={formatCurrency(pipelineValue)}
            sub={`${activeDeals.length} open deal${activeDeals.length !== 1 ? "s" : ""}`}
            color="warning"
          />
          <StatCard
            icon={<BarChart3 size={18} />}
            label="Revenue Won"
            value={formatCurrency(totalRevenue)}
            sub={`${wonDeals.length} deal${wonDeals.length !== 1 ? "s" : ""} closed`}
            color="success"
          />
        </div>
      )}

      {/* ── Main Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left column ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Core details */}
          <Card>
            <CardHeader className="pb-0">
              <h2 className="text-lg font-semibold">Service Details</h2>
            </CardHeader>
            <CardBody>
              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    label="Service Name"
                    placeholder="e.g. SEO Audit, Monthly Retainer…"
                    isRequired
                    value={formData.name}
                    onValueChange={(v) => setFormData({ ...formData, name: v })}
                  />
                  <Textarea
                    label="Description"
                    placeholder="What does this service include? Who is it for?"
                    minRows={3}
                    value={formData.description}
                    onValueChange={(v) =>
                      setFormData({ ...formData, description: v })
                    }
                  />
                  <Input
                    label="Price"
                    placeholder="0"
                    type="number"
                    min="0"
                    isRequired
                    startContent={
                      <span className="text-default-400 text-sm">$</span>
                    }
                    value={formData.price}
                    onValueChange={(v) =>
                      setFormData({ ...formData, price: v })
                    }
                    description="This will be used as the default value when creating deals."
                  />
                  <div className="flex items-center justify-between p-3 rounded-xl border border-divider bg-default-50">
                    <div>
                      <p className="text-sm font-medium">Active</p>
                      <p className="text-xs text-default-400">
                        Inactive services cannot be linked to new leads or
                        deals.
                      </p>
                    </div>
                    <Switch
                      isSelected={formData.isActive}
                      onValueChange={(v) =>
                        setFormData({ ...formData, isActive: v })
                      }
                      color="success"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs text-default-400 mb-1">Name</p>
                      <p className="font-semibold text-lg">{service?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-default-400 mb-1">Price</p>
                      <p className="font-bold text-2xl text-success">
                        {formatCurrency(service?.price)}
                      </p>
                    </div>
                  </div>

                  {service?.description && (
                    <>
                      <Divider />
                      <div>
                        <p className="text-xs text-default-400 mb-2 flex items-center gap-1">
                          <FileText size={11} /> Description
                        </p>
                        <p className="text-sm text-default-600 leading-relaxed whitespace-pre-wrap">
                          {service.description}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Deals table (view mode) */}
          {!isNew && !isEditing && (
            <Card>
              <CardHeader className="flex justify-between items-center pb-0">
                <h2 className="text-lg font-semibold">
                  Deals
                  {totalDeals > 0 && (
                    <span className="ml-2 text-sm font-normal text-default-400">
                      ({totalDeals})
                    </span>
                  )}
                </h2>
                <Button
                  size="sm"
                  variant="flat"
                  color="primary"
                  onPress={() =>
                    router.push(`/deals/new?serviceId=${serviceId}`)
                  }
                >
                  + New Deal
                </Button>
              </CardHeader>
              <CardBody>
                {service?.deals && service.deals.length > 0 ? (
                  <div className="space-y-2">
                    {service.deals.map((deal) => (
                      <div
                        key={deal.id}
                        onClick={() => router.push(`/deals/${deal.id}`)}
                        className="flex items-center justify-between p-3 rounded-xl border border-divider hover:bg-default-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0">
                            <Handshake size={14} className="text-default-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">
                              {deal.title}
                            </p>
                            {deal.customer && (
                              <p className="text-xs text-default-400 truncate">
                                {deal.customer.name}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <p className="font-semibold text-sm text-success">
                            {formatCurrency(deal.value)}
                          </p>
                          <Chip
                            size="sm"
                            variant="flat"
                            color={
                              DEAL_STAGE_META[deal.stage]?.color ?? "default"
                            }
                          >
                            {DEAL_STAGE_META[deal.stage]?.label ?? deal.stage}
                          </Chip>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-default-300">
                    <Handshake size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No deals linked yet.</p>
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {/* Leads table (view mode) */}
          {!isNew && !isEditing && (
            <Card>
              <CardHeader className="flex justify-between items-center pb-0">
                <h2 className="text-lg font-semibold">
                  Leads
                  {totalLeads > 0 && (
                    <span className="ml-2 text-sm font-normal text-default-400">
                      ({totalLeads})
                    </span>
                  )}
                </h2>
              </CardHeader>
              <CardBody>
                {service?.leads && service.leads.length > 0 ? (
                  <div className="space-y-2">
                    {service.leads.map((lead) => (
                      <div
                        key={lead.id}
                        onClick={() => router.push(`/leads/${lead.id}`)}
                        className="flex items-center justify-between p-3 rounded-xl border border-divider hover:bg-default-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0">
                            <TrendingUp
                              size={14}
                              className="text-default-400"
                            />
                          </div>
                          <p className="font-medium text-sm truncate">
                            {lead.name}
                          </p>
                        </div>
                        <Chip
                          size="sm"
                          variant="flat"
                          color={
                            LEAD_STATUS_META[lead.status]?.color ?? "default"
                          }
                        >
                          {LEAD_STATUS_META[lead.status]?.label ?? lead.status}
                        </Chip>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-default-300">
                    <TrendingUp size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No leads linked yet.</p>
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </div>

        {/* ── Right sidebar ── */}
        <div className="space-y-6">
          {/* Status card */}
          <Card>
            <CardHeader className="pb-0">
              <h2 className="text-lg font-semibold">Status</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              {isEditing ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Active</p>
                    <p className="text-xs text-default-400">
                      Available for leads & deals
                    </p>
                  </div>
                  <Switch
                    isSelected={formData.isActive}
                    onValueChange={(v) =>
                      setFormData({ ...formData, isActive: v })
                    }
                    color="success"
                  />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {service?.isActive ? "Active" : "Inactive"}
                      </p>
                      <p className="text-xs text-default-400">
                        {service?.isActive
                          ? "Available for new leads & deals"
                          : "Hidden from new leads & deals"}
                      </p>
                    </div>
                    <Switch
                      isSelected={service?.isActive ?? false}
                      onValueChange={handleToggleActive}
                      color="success"
                    />
                  </div>
                  <Divider />
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-default-400 mb-1">Created</p>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Clock size={13} className="text-default-400" />
                        {formatDate(service?.createdAt)}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-default-400 mb-1">
                        Last Updated
                      </p>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Clock size={13} className="text-default-400" />
                        {formatDate(service?.updatedAt)}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardBody>
          </Card>

          {/* Performance summary (view mode) */}
          {!isNew && !isEditing && (
            <Card>
              <CardHeader className="pb-0">
                <h2 className="text-lg font-semibold">Performance</h2>
              </CardHeader>
              <CardBody className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-default-500">Total deals</span>
                  <span className="font-semibold">{totalDeals}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-default-500">Deals won</span>
                  <span className="font-semibold text-success">
                    {wonDeals.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-default-500">Win rate</span>
                  <span className="font-semibold">
                    {totalDeals > 0
                      ? `${Math.round((wonDeals.length / totalDeals) * 100)}%`
                      : "-"}
                  </span>
                </div>
                <Divider />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-default-500">Pipeline</span>
                  <span className="font-semibold text-warning">
                    {formatCurrency(pipelineValue)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-default-500">Revenue</span>
                  <span className="font-semibold text-success">
                    {formatCurrency(totalRevenue)}
                  </span>
                </div>
                <Divider />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-default-500">Linked leads</span>
                  <span className="font-semibold">{totalLeads}</span>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Quick actions (view mode) */}
          {!isNew && !isEditing && (
            <Card>
              <CardHeader className="pb-0">
                <h2 className="text-lg font-semibold">Quick Actions</h2>
              </CardHeader>
              <CardBody className="space-y-2">
                <Button
                  fullWidth
                  variant="flat"
                  color="primary"
                  startContent={<Handshake size={16} />}
                  onPress={() =>
                    router.push(`/deals/new?serviceId=${serviceId}`)
                  }
                >
                  Create Deal
                </Button>
                <Button
                  fullWidth
                  variant="flat"
                  startContent={<Tag size={16} />}
                  onPress={() =>
                    router.push(`/leads/new?serviceId=${serviceId}`)
                  }
                >
                  Create Lead
                </Button>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
