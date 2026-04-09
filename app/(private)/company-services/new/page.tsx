"use client";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Switch,
  Textarea,
} from "@heroui/react";
import { ArrowLeft, Package, Save, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import { useAllServices } from "@/app/hooks/useAllServices";

interface FormData {
  name: string;
  description: string;
  price: string;
  isActive: boolean;
}

const formatCurrency = (value?: number | string) => {
  const num = Number(value);
  if (isNaN(num) || !num) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

export default function NewServicePage() {
  const router = useRouter();
  const currentUser = useUser();
  const companyId = currentUser?.companyId || "";
  const { refetch: refetchServices } = useAllServices(companyId);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    price: "",
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!formData.name || !formData.price) {
      alert("Name and price are required.");
      return;
    }

    setIsSubmitting(true);
    console.log(
      "Submitting new service with data:",
      formData,
      "for companyId:",
      currentUser?.companyId,
    );
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          price: parseFloat(formData.price) || 0,
          isActive: formData.isActive,
          companyId: currentUser?.companyId,
        }),
      });

      if (res.ok) {
        console.log("companyId", currentUser?.companyId);
        const created = await res.json();
        await refetchServices();
        router.push(`/company-services/${created.id}`);
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

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
            <h1 className="text-2xl font-bold">New Service</h1>
            <p className="text-default-400 text-sm">
              Create a new service offering
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="flat"
            radius="full"
            startContent={<X size={16} />}
            onPress={() => router.push("/company-services")}
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
            Create Service
          </Button>
        </div>
      </div>

      {/* Form */}
      <Card radius="sm">
        <CardHeader className="pb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <Package size={20} className="text-primary-600" />
            </div>
            <h2 className="text-lg font-semibold">Service Details</h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            radius="sm"
            label="Service Name"
            placeholder="e.g. SEO Audit, Monthly Retainer…"
            isRequired
            value={formData.name}
            onValueChange={(v) => setFormData({ ...formData, name: v })}
          />

          <Textarea
            radius="sm"
            label="Description"
            placeholder="What does this service include? Who is it for?"
            minRows={3}
            value={formData.description}
            onValueChange={(v) => setFormData({ ...formData, description: v })}
          />

          <Input
            radius="sm"
            label="Price"
            placeholder="0"
            type="number"
            min="0"
            isRequired
            startContent={<span className="text-default-400 text-sm">$</span>}
            value={formData.price}
            onValueChange={(v) => setFormData({ ...formData, price: v })}
            description={
              formData.price
                ? `Formatted: ${formatCurrency(formData.price)}`
                : "This will be used as the default value when creating deals."
            }
          />

          <div className="flex items-center justify-between p-4 rounded-xl border border-divider bg-default-50">
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-xs text-default-400">
                Inactive services won&apos;t appear in lead and deal forms.
              </p>
            </div>
            <Switch
              isSelected={formData.isActive}
              onValueChange={(v) => setFormData({ ...formData, isActive: v })}
              color="success"
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
