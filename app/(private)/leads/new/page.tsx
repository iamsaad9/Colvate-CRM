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
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAllUser } from "@/app/hooks/useAllUsers";
import { useServices } from "@/app/hooks/useServices";
import { useUser } from "@/app/context/UserContext";
import { useQueryClient } from "@tanstack/react-query";
import {
  LeadFormData,
  EMPTY_FORM,
  SOURCES,
  STATUS_STEPS,
  formatCurrency,
  StatusTimeline,
} from "@/app/components/leads/lead-shared";
import { Service, User, LeadStatus } from "@/app/types/types";

export default function NewLeadPage() {
  const router = useRouter();
  const currentUser = useUser();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<LeadFormData>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  const { data: allUsers = [], isLoading: usersLoading } = useAllUser(
    currentUser?.companyId || "",
  );
  const { data: allServices = [], isLoading: servicesLoading } = useServices(
    currentUser?.companyId || "",
  );

  const isLoading = usersLoading || servicesLoading;

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          name: nameRef.current?.value || "",
          email: emailRef.current?.value || "",
          phone: phoneRef.current?.value || "",
          serviceIds: formData.services.map((s) => s.id),
          companyId: currentUser?.companyId,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        await queryClient.invalidateQueries({ queryKey: ["leads"] });
        router.replace(`/leads/${created.id}`);
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
          <h1 className="text-2xl font-bold">New Lead</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="flat"
            radius="full"
            startContent={<X size={16} />}
            onPress={() => router.push("/leads")}
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
            Create Lead
          </Button>
        </div>
      </div>

      {/* Stage Timeline */}
      <Card>
        <CardHeader className="">
          <h2 className="text-lg font-semibold">Lead Status</h2>
        </CardHeader>
        <CardBody className="py-2 px-6">
          <StatusTimeline
            currentStatus={formData.status}
            onChange={(s) => setFormData({ ...formData, status: s })}
            isEditing
          />
          <p className="text-xs text-default-400 text-center mt-2">
            Click a stage to set the lead status
          </p>
        </CardBody>
      </Card>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
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
                  ref={nameRef}
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="email@example.com"
                  isRequired
                  radius="sm"
                  ref={emailRef}
                />
                <Input
                  label="Phone"
                  type="tel"
                  placeholder="+1 234 567 8900"
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
                <Select
                  label="Status"
                  radius="sm"
                  selectedKeys={new Set([formData.status])}
                  onSelectionChange={(keys) =>
                    setFormData({
                      ...formData,
                      status: Array.from(keys)[0] as LeadStatus,
                    })
                  }
                >
                  {STATUS_STEPS.map((s) => (
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
                onSelectionChange={(keys) =>
                  setFormData({
                    ...formData,
                    services: Array.from(keys)
                      .map((id) =>
                        allServices.find((s: Service) => s.id === id),
                      )
                      .filter((s): s is Service => s !== undefined),
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
