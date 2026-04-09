"use client";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Input,
  Skeleton,
  Switch,
  Textarea,
} from "@heroui/react";
import { ArrowLeft, Package, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import {
  ServiceFormData,
  formatCurrency,
  formatDate,
} from "@/app/components/comp_services/service-shared";
import { Service } from "@/app/types/types";
import { useAllServices } from "@/app/hooks/useAllServices";

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params.serviceId as string;
  const currentUser = useUser();

  const [service, setService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    description: "",
    price: "",
    isActive: true,
  });
  const { refetch: refetchServices } = useAllServices(
    currentUser?.companyId || "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin =
    currentUser?.role === "ADMIN" || currentUser?.role === "MANAGER";

  useEffect(() => {
    if (!currentUser?.companyId) return;
    setIsLoading(true);
    fetch(`/api/services/${serviceId}?companyId=${currentUser.companyId}`)
      .then((r) => r.json())
      .then((data: Service) => {
        setService(data);
        setFormData({
          name: data.name,
          description: data.description ?? "",
          price: data.price?.toString() ?? "",
          isActive: data.isActive,
        });
        setIsLoading(false);
      })
      .catch(console.error);
  }, [currentUser?.companyId, serviceId]);

  const handleSave = async () => {
    if (!formData.name || !formData.price) {
      alert("Name and price are required.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(
        `/api/services/${serviceId}?companyId=${currentUser?.companyId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            price: parseFloat(formData.price) || 0,
          }),
        },
      );
      if (res.ok) {
        await refetchServices();
        router.replace(`/company-services/${serviceId}`);
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
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48 rounded-lg" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  if (!service || !isAdmin) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center py-24">
        <p className="text-default-400 text-lg">
          {!isAdmin ? "Access denied." : "Service not found."}
        </p>
        <Button
          className="mt-4"
          variant="light"
          onPress={() => router.push("/company-services")}
        >
          Back to Services
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            isIconOnly
            variant="light"
            radius="full"
            onPress={() => router.replace(`/company-services/${serviceId}`)}
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Edit Service</h1>
              <Chip
                size="sm"
                variant="dot"
                color={service.isActive ? "success" : "danger"}
              >
                {service.isActive ? "Active" : "Inactive"}
              </Chip>
            </div>
            <p className="text-default-400 text-sm">{service.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="flat"
            radius="full"
            startContent={<X size={16} />}
            onPress={() => router.replace(`/company-services/${serviceId}`)}
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
            Save Changes
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <Package size={20} className="text-primary-600" />
            </div>
            <h2 className="text-lg font-semibold">Service Details</h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <Input
              label="Service Name"
              placeholder="e.g. Enterprise Support Plan"
              isRequired
              value={formData.name}
              onValueChange={(v) => setFormData({ ...formData, name: v })}
            />

            <Textarea
              label="Description"
              placeholder="Describe what this service includes..."
              minRows={3}
              value={formData.description}
              onValueChange={(v) =>
                setFormData({ ...formData, description: v })
              }
            />

            <Input
              label="Price"
              placeholder="0.00"
              type="number"
              min="0"
              step="0.01"
              isRequired
              startContent={<span className="text-default-400 text-sm">$</span>}
              value={formData.price}
              onValueChange={(v) => setFormData({ ...formData, price: v })}
              description={
                formData.price
                  ? `Formatted: ${formatCurrency(formData.price)}`
                  : undefined
              }
            />

            <div className="flex items-center justify-between p-4 rounded-xl bg-default-50">
              <div>
                <p className="font-medium text-sm">Active</p>
                <p className="text-xs text-default-400">
                  Inactive services won&apos;t appear in lead and deal forms
                </p>
              </div>
              <Switch
                isSelected={formData.isActive}
                onValueChange={(v) => setFormData({ ...formData, isActive: v })}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Meta info */}
      <Card>
        <CardHeader className="pb-0">
          <h2 className="text-base font-semibold text-default-500">
            Service Info
          </h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-default-400 mb-1">Created</p>
              <p>{formatDate(service.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-default-400 mb-1">Last Updated</p>
              <p>{formatDate(service.updatedAt)}</p>
            </div>
            <div>
              <p className="text-xs text-default-400 mb-1">Linked Leads</p>
              <p className="font-semibold">{service.leads.length ?? 0}</p>
            </div>
            <div>
              <p className="text-xs text-default-400 mb-1">Active Deals</p>
              <p className="font-semibold">{service.deals.length ?? 0}</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
