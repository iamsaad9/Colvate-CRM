"use client";

import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Input,
  Select,
  SelectItem,
  Skeleton,
} from "@heroui/react";
import { ArrowLeft, Save, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLead } from "@/app/hooks/useLead";
import { useAllUser } from "@/app/hooks/useAllUsers";
import { useAllServices } from "@/app/hooks/useAllServices";
import { useUser } from "@/app/context/UserContext";
import { useQueryClient } from "@tanstack/react-query";
import {
  LeadFormData,
  EMPTY_FORM,
  SOURCES,
  STATUS_META,
  formatCurrency,
  StatusTimeline,
} from "@/app/components/leads/lead-shared";
import { Service, User } from "@/app/types/types";

export default function EditLeadPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = params.leadId as string;
  const currentUser = useUser();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<LeadFormData>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  const { data: lead, isLoading: leadLoading } = useLead(
    leadId,
    currentUser?.companyId || "",
  );
  const { data: allUsers = [], isLoading: usersLoading } = useAllUser(
    currentUser?.companyId || "",
  );
  const { data: allServices = [], isLoading: servicesLoading } = useAllServices(
    currentUser?.companyId || "",
  );

  const isLoading = leadLoading || usersLoading || servicesLoading;

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name ?? "",
        email: lead.email ?? "",
        phone: lead.phone ?? "",
        status: lead.status ?? "NEW",
        source: lead.source ?? "",
        assignedTo: lead.assignedTo ?? null,
        services: lead.services ?? [],
      });
    }
  }, [lead]);

  // const assignedUser = useMemo(
  //   () => allUsers.find((u: User) => u.id === formData.assignedTo),
  //   [allUsers, formData.assignedTo],
  // );

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(
        `/api/leads/${leadId}?companyId=${currentUser?.companyId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            name: nameRef.current?.value || formData.name,
            email: emailRef.current?.value || formData.email,
            phone: phoneRef.current?.value || formData.phone,
            serviceIds: formData.services.map((s) => s.id),
          }),
        },
      );

      if (res.ok) {
        await queryClient.invalidateQueries({ queryKey: ["leads"] });
        router.replace(`/leads/${leadId}`);
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

  const stageMeta = STATUS_META[formData.status];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            isIconOnly
            variant="light"
            radius="full"
            onPress={() => router.replace(`/leads/`)}
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Edit Lead</h1>
              <Chip size="sm" color={stageMeta.color} variant="flat">
                {stageMeta.label}
              </Chip>
            </div>
            <p className="text-default-400 text-sm">{lead.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="flat"
            radius="full"
            startContent={<X size={16} />}
            onPress={() => router.replace(`/leads/${leadId}`)}
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
            Save Changes
          </Button>
        </div>
      </div>

      {/* Status Timeline */}
      <Card>
        <CardBody className="py-4">
          <StatusTimeline
            currentStatus={formData.status}
            onChange={(s) => setFormData({ ...formData, status: s })}
            isEditing
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  placeholder="Enter lead name"
                  isRequired
                  radius="sm"
                  defaultValue={lead.name ?? ""}
                  ref={nameRef}
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="email@example.com"
                  isRequired
                  radius="sm"
                  defaultValue={lead.email ?? ""}
                  ref={emailRef}
                />
                <Input
                  label="Phone"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  radius="sm"
                  defaultValue={lead.phone ?? ""}
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
              </div>
            </CardBody>
          </Card>

          {/* Services */}
          <Card radius="sm">
            <CardHeader className="pb-0">
              <h2 className="text-lg font-semibold">Services</h2>
            </CardHeader>
            <CardBody>
              <Select
                label="Link Services"
                radius="sm"
                placeholder="Select services"
                selectionMode="multiple"
                selectedKeys={new Set(formData.services.map((s) => s.id))}
                onSelectionChange={(keys) => {
                  const selectedIds = Array.from(keys) as string[];
                  const selectedServices = allServices.filter((s: Service) =>
                    selectedIds.includes(s.id),
                  );
                  setFormData({
                    ...formData,
                    services: selectedServices,
                  });
                }}
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
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
