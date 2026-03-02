"use client";

import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Input,
  Select,
  SelectItem,
  Skeleton,
  Textarea,
} from "@heroui/react";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Edit,
  Mail,
  Phone,
  Save,
  TrendingUp,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useLead } from "@/app/hooks/useLead";
import { useAllUser } from "@/app/hooks/useAllUsers";
import { useServices } from "@/app/hooks/useServices";
import { useUser } from "@/app/context/UserContext";
import { useQueryClient } from "@tanstack/react-query";

// ─── Types ────────────────────────────────────────────────────────────────────

type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "LOST";

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  isActive: boolean;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  status: LeadStatus;
  source: string;
  assignedTo: string | null;
  serviceIds: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SOURCES = [
  "Website",
  "Referral",
  "LinkedIn",
  "Cold Email",
  "Trade Show",
  "Partner",
  "Advertisement",
];

const STATUS_STEPS: LeadStatus[] = ["NEW", "CONTACTED", "QUALIFIED", "LOST"];

const STATUS_META: Record<
  LeadStatus,
  { label: string; color: "primary" | "secondary" | "success" | "danger" }
> = {
  NEW: { label: "New", color: "primary" },
  CONTACTED: { label: "Contacted", color: "secondary" },
  QUALIFIED: { label: "Qualified", color: "success" },
  LOST: { label: "Lost", color: "danger" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (value?: number) => {
  if (!value) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

// ─── Status Progress Bar ──────────────────────────────────────────────────────

function StatusTimeline({
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const leadId = params.leadId as string;
  const isNew = leadId === "new";
  const editParam = searchParams.get("edit") === "true";

  const [isEditing, setIsEditing] = useState(isNew || editParam);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUser = useUser();

  const { data: lead, isLoading: leadLoading } = useLead(
    isNew ? null : leadId,
    currentUser?.companyId || "",
  );

  const userLead = lead?.assignedTo === currentUser?.id || isNew;
  const { data: allUsers = [], isLoading: usersLoading } = useAllUser(
    currentUser?.companyId || "",
  );
  const { data: allServices = [], isLoading: servicesLoading } = useServices(
    currentUser?.companyId || "",
  );
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    status: "NEW",
    source: "",
    assignedTo: null,
    serviceIds: [],
  });

  // Populate form when lead data arrives
  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name ?? "",
        email: lead.email ?? "",
        phone: lead.phone ?? "",
        status: lead.status ?? "NEW",
        source: lead.source ?? "",
        assignedTo: lead.assignedTo ?? "",
        serviceIds: lead.serviceIds ?? [],
      });
    }
    console.log("Lead data loaded:", lead);

    if (isEditing && !userLead) {
      router.replace(`/leads`);
    }
  }, [lead, isEditing, userLead, router]);

  const linkedServices = useMemo(
    () =>
      allServices.filter((s: Service) => formData.serviceIds.includes(s.id)),
    [allServices, formData.serviceIds],
  );

  const assignedUser = useMemo(
    () =>
      allUsers.find(
        (u: any) => u.id === (lead?.assignedTo ?? formData.assignedTo),
      ),
    [allUsers, lead, formData.assignedTo],
  );

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setIsSubmitting(true);
    const leadPayload = {
      ...formData,
      name: nameRef.current?.value || "",
      email: emailRef.current?.value || "",
      phone: phoneRef.current?.value || "",
    };
    try {
      if (isNew) {
        const res = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...leadPayload,
            companyId: currentUser?.companyId,
          }),
        });
        if (res.ok) {
          const created = await res.json();
          await queryClient.invalidateQueries({
            queryKey: ["leads"],
          });
          router.replace(`/leads/${created.id}`);
        } else {
          const err = await res.json();
          alert(`Error: ${err.error}`);
        }
      } else {
        console.log("Updating lead with data:", leadPayload);
        const res = await fetch(
          `/api/leads/${leadId}?companyId=${currentUser?.companyId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(leadPayload),
          },
        );
        if (res.ok) {
          await queryClient.invalidateQueries({
            queryKey: ["leads"],
          });
          setIsEditing(false);
          router.push("/leads");
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
    if (!confirm(`Delete ${lead?.name}? This cannot be undone.`)) return;
    try {
      await fetch(`/api/leads/${leadId}?companyId=${currentUser?.companyId}`, {
        method: "DELETE",
      });
      router.push("/leads");
    } catch (err) {
      console.error(err);
    }
  };

  const handleConvertToDeal = async () => {
    try {
      const res = await fetch(
        `/api/leads/${leadId}?companyId=${currentUser?.companyId}`,
        {
          method: "POST",
        },
      );
      if (res.ok) {
        router.push(`/deals`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Quick status updater (mark as CONTACTED / QUALIFIED etc.)
  const handleMarkStatus = async (status: LeadStatus) => {
    if (!leadId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(
        `/api/leads/${leadId}?companyId=${currentUser?.companyId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );
      if (res.ok) {
        // Refresh lead data and update local form state
        await queryClient.invalidateQueries({
          queryKey: ["leads", leadId, currentUser?.companyId],
        });
        setFormData((f) => ({ ...f, status }));
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isNew) {
      router.push("/leads");
    } else {
      // Reset form back to lead data
      if (lead) {
        setFormData({
          name: lead.name ?? "",
          email: lead.email ?? "",
          phone: lead.phone ?? "",
          status: lead.status ?? "NEW",
          source: lead.source ?? "",
          assignedTo: lead.assignedTo ?? null,
          serviceIds: lead.serviceIds ?? [],
        });
      }
      setIsEditing(false);
      router.replace(`/leads/${leadId}`);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────

  const isLoading = (!isNew && leadLoading) || usersLoading || servicesLoading;

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-40 rounded-lg" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!isNew && !lead) {
    return (
      <div className="p-6 max-w-5xl mx-auto text-center py-24">
        <p className="text-default-400 text-lg">Lead not found.</p>
        <Button
          className="mt-4"
          variant="flat"
          onPress={() => router.push("/leads")}
        >
          Back to Leads
        </Button>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div key={leadId} className="p-6 max-w-5xl mx-auto space-y-6">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            isIconOnly
            variant="light"
            radius="full"
            onPress={() => router.push("/leads")}
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isNew ? "New Lead" : isEditing ? "Edit Lead" : lead?.name}
            </h1>
            {!isNew && (
              <p className="text-default-400 text-sm">
                Created {formatDate(lead?.createdAt)}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
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
              >
                {isNew ? "Create Lead" : "Save Changes"}
              </Button>
            </>
          ) : userLead ? (
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
                variant="flat"
                radius="full"
                startContent={<TrendingUp size={16} />}
                onPress={handleConvertToDeal}
              >
                Convert to Deal
              </Button>
              {/* Quick status actions */}
              {lead?.status !== "CONTACTED" && (
                <Button
                  variant="flat"
                  radius="full"
                  startContent={<CheckCircle size={16} />}
                  onPress={() => handleMarkStatus("CONTACTED")}
                  isLoading={isSubmitting}
                >
                  Mark Contacted
                </Button>
              )}
              {lead?.status !== "QUALIFIED" && (
                <Button
                  variant="flat"
                  radius="full"
                  startContent={<CheckCircle size={16} />}
                  onPress={() => handleMarkStatus("QUALIFIED")}
                  isLoading={isSubmitting}
                >
                  Mark Qualified
                </Button>
              )}
              <Button
                color="primary"
                radius="full"
                startContent={<Edit size={16} />}
                onPress={() => setIsEditing(true)}
              >
                Edit Lead
              </Button>
            </>
          ) : null}
        </div>
      </div>

      {/* ── Status Timeline (view mode only) ── */}
      {!isNew && (
        <Card>
          <CardBody className="py-4">
            <StatusTimeline
              currentStatus={
                isEditing ? formData.status : (lead?.status ?? "NEW")
              }
              onChange={(s) => setFormData({ ...formData, status: s })}
              isEditing={isEditing}
            />
          </CardBody>
        </Card>
      )}

      {/* ── Main Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: main form / info ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card radius="sm">
            <CardHeader className="pb-0">
              <h2 className="text-lg font-semibold">Basic Information</h2>
            </CardHeader>
            <CardBody>
              {isEditing && userLead ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    placeholder="Enter lead name"
                    isRequired
                    radius="sm"
                    value={isEditing ? lead?.name : ""}
                    ref={nameRef}
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="email@example.com"
                    isRequired
                    radius="sm"
                    value={isEditing ? lead?.email : ""}
                    ref={emailRef}
                  />
                  <Input
                    label="Phone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={isEditing ? lead?.phone : ""}
                    radius="sm"
                    ref={phoneRef}
                  />
                  <Select
                    label="Source"
                    placeholder="Select source"
                    radius="sm"
                    selectedKeys={
                      formData.source ? new Set([formData.source]) : new Set()
                    }
                    onSelectionChange={(keys) =>
                      setFormData({
                        ...formData,
                        source: Array.from(keys)[0] as string,
                      })
                    }
                  >
                    {SOURCES.map((s) => (
                      <SelectItem key={s}>{s}</SelectItem>
                    ))}
                  </Select>

                  {/* Status select only for new leads (timeline handles it otherwise) */}
                  {isNew && (
                    <Select
                      label="Status"
                      selectedKeys={new Set([formData.status])}
                      radius="sm"
                      onSelectionChange={(keys) =>
                        setFormData({
                          ...formData,
                          status: Array.from(keys)[0] as LeadStatus,
                        })
                      }
                    >
                      <SelectItem key="NEW">New</SelectItem>
                      <SelectItem key="CONTACTED">Contacted</SelectItem>
                      <SelectItem key="QUALIFIED">Qualified</SelectItem>
                      <SelectItem key="LOST">Lost</SelectItem>
                    </Select>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-default-400 mb-1">Full Name</p>
                    <p className="font-semibold text-lg">{lead?.name}</p>
                  </div>
                  {lead?.companyName && (
                    <div>
                      <p className="text-xs text-default-400 mb-1">Company</p>
                      <p className="font-semibold">{lead.companyName}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-default-400 mb-1">Email</p>
                    <a
                      href={`mailto:${lead?.email}`}
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Mail size={14} />
                      {lead?.email || "-"}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs text-default-400 mb-1">Phone</p>
                    <a
                      href={`tel:${lead?.phone}`}
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Phone size={14} />
                      {lead?.phone || "-"}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs text-default-400 mb-1">Source</p>
                    <Chip size="sm" variant="bordered">
                      {lead?.source || "-"}
                    </Chip>
                  </div>
                  {lead?.lastContact && (
                    <div>
                      <p className="text-xs text-default-400 mb-1">
                        Last Contact
                      </p>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock size={13} className="text-default-400" />
                        {formatDate(lead.lastContact)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Services */}
          <Card radius="sm">
            <CardHeader className="pb-0">
              <h2 className="text-lg font-semibold">Services</h2>
            </CardHeader>
            <CardBody>
              {isEditing ? (
                <Select
                  label="Link Services"
                  radius="sm"
                  placeholder="Select services"
                  selectionMode="multiple"
                  selectedKeys={new Set(formData.serviceIds)}
                  onSelectionChange={(keys) =>
                    setFormData({
                      ...formData,
                      serviceIds: Array.from(keys) as string[],
                    })
                  }
                  renderValue={(items) => (
                    <div className="flex flex-wrap gap-1">
                      {items.map((item) => (
                        <Chip
                          key={item.key}
                          size="sm"
                          variant="flat"
                          color="primary"
                        >
                          {item.textValue}
                        </Chip>
                      ))}
                    </div>
                  )}
                >
                  {allServices
                    .filter((s: Service) => s.isActive)
                    .map((service: Service) => (
                      <SelectItem
                        key={service.id}
                        textValue={service.name}
                        description={`$${service.price}`}
                      >
                        <div className="flex justify-between items-center w-full">
                          <span>{service.name}</span>
                          <Chip size="sm" variant="flat" color="success">
                            {formatCurrency(service.price)}
                          </Chip>
                        </div>
                      </SelectItem>
                    ))}
                </Select>
              ) : linkedServices.length > 0 ? (
                <div className="space-y-2">
                  {linkedServices.map((service: Service) => (
                    <div
                      key={service.id}
                      className="flex justify-between items-center p-3 rounded-xl bg-default-50 border border-divider"
                    >
                      <div>
                        <p className="font-medium text-sm">{service.name}</p>
                        {service.description && (
                          <p className="text-xs text-default-400">
                            {service.description}
                          </p>
                        )}
                      </div>
                      <Chip size="sm" color="success" variant="flat">
                        {formatCurrency(service.price)}
                      </Chip>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 text-sm font-semibold">
                    <span>Total Value</span>
                    <span>
                      {formatCurrency(
                        linkedServices.reduce(
                          (sum: number, s: Service) => sum + Number(s.price),
                          0,
                        ),
                      )}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-default-400 text-sm">No services linked.</p>
              )}
            </CardBody>
          </Card>
        </div>

        {/* ── Right: sidebar ── */}
        <div className="space-y-6">
          {/* Assignment */}
          <Card radius="sm">
            <CardHeader className="pb-0">
              <h2 className="text-lg font-semibold">Assignment</h2>
            </CardHeader>
            <CardBody>
              {isEditing ? (
                <Select
                  label="Assign To"
                  radius="sm"
                  placeholder="Select team member"
                  selectedKeys={
                    formData.assignedTo
                      ? new Set([formData.assignedTo])
                      : new Set()
                  }
                  onSelectionChange={(keys) =>
                    setFormData({
                      ...formData,
                      assignedTo: (Array.from(keys)[0] as string) ?? null,
                    })
                  }
                >
                  {allUsers
                    .filter((u: any) => u.role === "SALES")
                    .map((user: any) => (
                      <SelectItem key={user.id} textValue={user.name}>
                        <div className="flex items-center gap-2">
                          <Avatar
                            src={user.avatarUrl}
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
                    src={assignedUser.avatarUrl}
                    name={assignedUser.name}
                    size="md"
                    color="primary"
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
                  <User size={16} />
                  <span className="text-sm">Unassigned</span>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Meta */}
          {!isNew && (
            <Card>
              <CardHeader className="pb-0">
                <h2 className="text-lg font-semibold">Details</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <p className="text-xs text-default-400 mb-1">Status</p>
                  <Chip
                    size="sm"
                    color={STATUS_META[lead?.status ?? "NEW"].color}
                    variant="flat"
                  >
                    {STATUS_META[lead?.status ?? "NEW"].label}
                  </Chip>
                </div>

                {lead?.value !== undefined && (
                  <div>
                    <p className="text-xs text-default-400 mb-1">
                      Estimated Value
                    </p>
                    <p className="font-semibold">
                      {formatCurrency(lead.value)}
                    </p>
                  </div>
                )}
                <Divider />
                <div>
                  <p className="text-xs text-default-400 mb-1">Created</p>
                  <div className="flex items-center gap-1 text-sm">
                    <Clock size={13} className="text-default-400" />
                    {formatDate(lead?.createdAt)}
                  </div>
                </div>
                {lead?.updatedAt && (
                  <div>
                    <p className="text-xs text-default-400 mb-1">
                      Last Updated
                    </p>
                    <div className="flex items-center gap-1 text-sm">
                      <Clock size={13} className="text-default-400" />
                      {formatDate(lead.updatedAt)}
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {/* Quick Actions (view mode only) */}
          {!isEditing && !isNew && userLead && (
            <Card>
              <CardHeader className="pb-0">
                <h2 className="text-lg font-semibold">Quick Actions</h2>
              </CardHeader>
              <CardBody className="space-y-2">
                <Button
                  fullWidth
                  variant="flat"
                  startContent={<Mail size={16} />}
                  onPress={() => {
                    window.location.href = `mailto:${lead?.email}`;
                  }}
                >
                  Send Email
                </Button>
                <Button
                  fullWidth
                  variant="flat"
                  startContent={<Phone size={16} />}
                  onPress={() => {
                    window.location.href = `tel:${lead?.phone}`;
                  }}
                >
                  Call Lead
                </Button>
                <Button
                  fullWidth
                  variant="flat"
                  color="secondary"
                  startContent={<TrendingUp size={16} />}
                  onPress={handleConvertToDeal}
                >
                  Convert to Deal
                </Button>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
