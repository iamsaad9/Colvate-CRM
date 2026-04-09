"use client";

import {
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
  Briefcase,
  Clock,
  DollarSign,
  Edit,
  Package,
  Target,
  ToggleLeft,
  ToggleRight,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { Service } from "@/app/types/types";
import {
  formatCurrency,
  formatDate,
} from "@/app/components/comp_services/service-shared";
import { useService } from "@/app/hooks/useService";
import { useAllServices } from "@/app/hooks/useAllServices";

export default function ViewServicePage() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params.serviceId as string;
  const currentUser = useUser();

  const {
    data: service,
    isLoading: serviceLoading,
    refetch: refetchService,
  } = useService(serviceId, currentUser?.companyId || "");

  const { refetch: refetchServices } = useAllServices(
    currentUser?.companyId || "",
  );

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const isAdmin =
    currentUser?.role === "ADMIN" || currentUser?.role === "MANAGER";

  useEffect(() => {
    refetchService();
  }, [refetchService]);

  const handleToggleStatus = async () => {
    if (!service) return;
    try {
      const res = await fetch(
        `/api/services/${serviceId}?companyId=${currentUser?.companyId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !service.isActive }),
        },
      );
      if (res.ok) {
        refetchService();
        refetchServices();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      await fetch(
        `/api/services/${serviceId}?companyId=${currentUser?.companyId}`,
        { method: "DELETE" },
      );
      await refetchServices();
      router.push("/company-services");
    } catch (err) {
      console.error(err);
    }
  };

  if (serviceLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48 rounded-lg" />
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <div className="col-span-2 space-y-4">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center py-24">
        <p className="text-default-400 text-lg">Service not found.</p>
        <Button
          className="mt-4"
          variant="flat"
          onPress={() => router.push("/company-services")}
        >
          Back to Services
        </Button>
      </div>
    );
  }

  const estimatedRevenue = Number(service.price) * (service.dealsCount ?? 0);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            isIconOnly
            variant="light"
            radius="full"
            onPress={() => router.push("/company-services")}
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{service.name}</h1>
              <Chip
                size="sm"
                variant="dot"
                color={service.isActive ? "success" : "danger"}
              >
                {service.isActive ? "Active" : "Inactive"}
              </Chip>
            </div>
            <p className="text-default-400 text-sm mt-0.5">
              Created {formatDate(service.createdAt)} · Updated{" "}
              {formatDate(service.updatedAt)}
            </p>
          </div>
        </div>

        {isAdmin && (
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="flat"
              radius="full"
              color="danger"
              startContent={<Trash2 size={16} />}
              onPress={() => setIsDeleteModalOpen(true)}
            >
              Delete
            </Button>
            <Button
              variant="flat"
              radius="full"
              startContent={
                service.isActive ? (
                  <ToggleLeft size={16} />
                ) : (
                  <ToggleRight size={16} />
                )
              }
              onPress={handleToggleStatus}
            >
              {service.isActive ? "Deactivate" : "Activate"}
            </Button>
            <Button
              color="primary"
              radius="full"
              startContent={<Edit size={16} />}
              onPress={() => router.push(`/company-services/${serviceId}/edit`)}
            >
              Edit Service
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="space-y-6">
          {/* Identity card */}
          <Card radius="sm">
            <CardBody className="flex flex-col items-center text-center p-8">
              <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center mb-4">
                <Package size={36} className="text-primary-600" />
              </div>
              <h2 className="text-xl font-bold">{service.name}</h2>
              {service.description && (
                <p className="text-default-500 text-sm mt-2">
                  {service.description}
                </p>
              )}
              <Divider className="my-4 w-full" />
              <p className="text-3xl font-bold text-success">
                {formatCurrency(service.price)}
              </p>
              <p className="text-xs text-default-400 mt-1">per unit</p>
            </CardBody>
          </Card>

          {/* Details card */}
          <Card radius="sm">
            <CardHeader className="pb-0">
              <h2 className="text-base font-semibold">Details</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <p className="text-xs text-default-400 mb-1">Status</p>
                <Chip
                  size="sm"
                  variant="dot"
                  color={service.isActive ? "success" : "danger"}
                >
                  {service.isActive ? "Active" : "Inactive"}
                </Chip>
              </div>
              <div>
                <p className="text-xs text-default-400 mb-1">Price</p>
                <p className="font-bold text-success">
                  {formatCurrency(service.price)}
                </p>
              </div>
              <Divider />
              <div>
                <p className="text-xs text-default-400 mb-1">Created</p>
                <div className="flex items-center gap-1 text-sm">
                  <Clock size={13} className="text-default-400" />
                  {formatDate(service.createdAt)}
                </div>
              </div>
              <div>
                <p className="text-xs text-default-400 mb-1">Last Updated</p>
                <div className="flex items-center gap-1 text-sm">
                  <Clock size={13} className="text-default-400" />
                  {formatDate(service.updatedAt)}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <Card radius="sm">
            <CardHeader className="pb-0">
              <h2 className="text-lg font-semibold">Performance</h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    icon: <Target size={24} />,
                    label: "Linked Leads",
                    value: service.leadsCount ?? 0,
                    color: "bg-primary-50 text-primary-600",
                    sub: "prospects",
                  },
                  {
                    icon: <Briefcase size={24} />,
                    label: "Active Deals",
                    value: service.dealsCount ?? 0,
                    color: "bg-warning-50 text-warning-600",
                    sub: "opportunities",
                  },
                  {
                    icon: <DollarSign size={24} />,
                    label: "Est. Revenue",
                    value: formatCurrency(estimatedRevenue),
                    color: "bg-success-50 text-success-600",
                    sub: "from closed deals",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="text-center p-5 rounded-xl bg-default-50"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${s.color}`}
                    >
                      {s.icon}
                    </div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-sm font-medium">{s.label}</p>
                    <p className="text-xs text-default-400">{s.sub}</p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Description */}
          {service.description && (
            <Card radius="sm">
              <CardHeader className="pb-0">
                <h2 className="text-lg font-semibold">Description</h2>
              </CardHeader>
              <CardBody>
                <p className="text-default-600 leading-relaxed">
                  {service.description}
                </p>
              </CardBody>
            </Card>
          )}

          {/* Revenue breakdown */}
          <Card radius="sm">
            <CardHeader className="pb-0">
              <h2 className="text-lg font-semibold">Revenue Breakdown</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-xl bg-default-50">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-default-400" />
                    <span className="text-sm">Unit Price</span>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(service.price)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-default-50">
                  <div className="flex items-center gap-2">
                    <Briefcase size={16} className="text-default-400" />
                    <span className="text-sm">Deals Closed</span>
                  </div>
                  <span className="font-semibold">
                    × {service.dealsCount ?? 0}
                  </span>
                </div>
                <Divider />
                <div className="flex justify-between items-center p-3 rounded-xl bg-success-50">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-success-600" />
                    <span className="text-sm font-semibold text-success-700">
                      Total Revenue
                    </span>
                  </div>
                  <span className="font-bold text-success text-lg">
                    {formatCurrency(estimatedRevenue)}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        size="sm"
      >
        <ModalContent>
          <ModalHeader>Delete Service</ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to delete <strong>{service.name}</strong>?
            </p>
            <p className="text-sm text-danger mt-2">
              This will remove the service from all linked leads and deals.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button color="danger" onPress={handleDelete}>
              Delete Service
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
