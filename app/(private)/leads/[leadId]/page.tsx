"use client";

import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Skeleton,
} from "@heroui/react";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Edit,
  Mail,
  Phone,
  TrendingUp,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLead } from "@/app/hooks/useLead";
import { useAllUser } from "@/app/hooks/useAllUsers";
import { useServices } from "@/app/hooks/useServices";
import { useUser } from "@/app/context/UserContext";
import { useQueryClient } from "@tanstack/react-query";
import {
  STATUS_META,
  formatCurrency,
  formatDate,
  StatusTimeline,
} from "@/app/components/leads/lead-shared";
import { Service, User, LeadStatus } from "@/app/types/types";

export default function ViewLeadPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = params.leadId as string;
  const currentUser = useUser();
  const queryClient = useQueryClient();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: lead, isLoading: leadLoading } = useLead(
    leadId,
    currentUser?.companyId || "",
  );
  const { data: allUsers = [], isLoading: usersLoading } = useAllUser(
    currentUser?.companyId || "",
  );
  const { data: allServices = [], isLoading: servicesLoading } = useServices(
    currentUser?.companyId || "",
  );

  const userLead = lead?.assignedTo === currentUser?.id;

  const linkedServices = useMemo(() => {
    // 1. Safety check for lead
    if (!lead) return [];

    // 2. Extract the IDs from the services objects
    const currentServiceIds = lead.services?.map((s: Service) => s.id) || [];

    // 3. Filter allServices based on those IDs
    return allServices.filter((s: Service) => currentServiceIds.includes(s.id));
  }, [allServices, lead]);

  const assignedUser = useMemo(
    () => allUsers.find((u: User) => u.id === lead?.assignedTo),
    [allUsers, lead],
  );

  const isLoading = leadLoading || usersLoading || servicesLoading;

  useEffect(() => {
    console.log("Lead data:", lead);
    console.log("Services data:", allServices);
  }, [lead, allServices]);

  const handleMarkStatus = async (status: LeadStatus) => {
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
        await queryClient.invalidateQueries({
          queryKey: ["leads", leadId, currentUser?.companyId],
        });
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
        { method: "POST" },
      );
      if (res.ok) router.push("/deals");
    } catch (err) {
      console.error(err);
    }
  };

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

  if (!lead) {
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

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
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
            <h1 className="text-2xl font-bold">{lead.name}</h1>
            <p className="text-default-400 text-sm">
              Created {formatDate(lead.createdAt)}
            </p>
          </div>
        </div>

        {userLead && (
          <div className="flex gap-2 flex-wrap justify-end">
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
            {lead.status !== "CONTACTED" && (
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
            {lead.status !== "QUALIFIED" && (
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
              onPress={() => router.push(`/leads/${leadId}/edit`)}
            >
              Edit Lead
            </Button>
          </div>
        )}
      </div>

      {/* Status Timeline */}
      <Card>
        <CardBody className="py-4">
          <StatusTimeline
            currentStatus={lead.status ?? "NEW"}
            isEditing={false}
          />
        </CardBody>
      </Card>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          <Card radius="sm">
            <CardHeader className="pb-0">
              <h2 className="text-lg font-semibold">Basic Information</h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-default-400 mb-1">Full Name</p>
                  <p className="font-semibold text-lg">{lead.name}</p>
                </div>
                {lead.companyName && (
                  <div>
                    <p className="text-xs text-default-400 mb-1">Company</p>
                    <p className="font-semibold">{lead.companyName}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-default-400 mb-1">Email</p>
                  <a
                    href={`mailto:${lead.email}`}
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Mail size={14} />
                    {lead.email || "-"}
                  </a>
                </div>
                <div>
                  <p className="text-xs text-default-400 mb-1">Phone</p>
                  <a
                    href={`tel:${lead.phone}`}
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Phone size={14} />
                    {lead.phone || "-"}
                  </a>
                </div>
                <div>
                  <p className="text-xs text-default-400 mb-1">Source</p>
                  <Chip size="sm" variant="bordered">
                    {lead.source || "-"}
                  </Chip>
                </div>
                {lead.lastContact && (
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
            </CardBody>
          </Card>

          {/* Services */}
          <Card radius="sm">
            <CardHeader className="pb-0">
              <h2 className="text-lg font-semibold">Services</h2>
            </CardHeader>
            <CardBody>
              {linkedServices.length > 0 ? (
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
                    <span>Expected Value</span>
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

        {/* Right */}
        <div className="space-y-6">
          <Card radius="sm">
            <CardHeader className="pb-0">
              <h2 className="text-lg font-semibold">Assignment</h2>
            </CardHeader>
            <CardBody>
              {assignedUser ? (
                <div className="flex items-center gap-3">
                  <Avatar
                    src={assignedUser.avatarUrl || ""}
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
                  <UserIcon size={16} />
                  <span className="text-sm">Unassigned</span>
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="pb-0">
              <h2 className="text-lg font-semibold">Details</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <p className="text-xs text-default-400 mb-1">Status</p>
                <Chip
                  size="sm"
                  color={
                    STATUS_META[(lead.status ?? "NEW") as LeadStatus].color
                  }
                  variant="flat"
                >
                  {STATUS_META[(lead.status ?? "NEW") as LeadStatus].label}
                </Chip>
              </div>
              {lead.value !== undefined && (
                <div>
                  <p className="text-xs text-default-400 mb-1">
                    Estimated Value
                  </p>
                  <p className="font-semibold">{formatCurrency(lead.value)}</p>
                </div>
              )}
              <Divider />
              <div>
                <p className="text-xs text-default-400 mb-1">Created</p>
                <div className="flex items-center gap-1 text-sm">
                  <Clock size={13} className="text-default-400" />
                  {formatDate(lead.createdAt)}
                </div>
              </div>
              {lead.updatedAt && (
                <div>
                  <p className="text-xs text-default-400 mb-1">Last Updated</p>
                  <div className="flex items-center gap-1 text-sm">
                    <Clock size={13} className="text-default-400" />
                    {formatDate(lead.updatedAt)}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {userLead && (
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
                    window.location.href = `mailto:${lead.email}`;
                  }}
                >
                  Send Email
                </Button>
                <Button
                  fullWidth
                  variant="flat"
                  startContent={<Phone size={16} />}
                  onPress={() => {
                    window.location.href = `tel:${lead.phone}`;
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
