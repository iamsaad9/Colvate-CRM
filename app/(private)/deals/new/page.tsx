"use client";

import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  DatePicker,
  Input,
  Select,
  SelectItem,
  Skeleton,
} from "@heroui/react";
import { ArrowLeft, Save, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAllUser } from "@/app/hooks/useAllUsers";
import { useServices } from "@/app/hooks/useServices";
import { useCustomers } from "@/app/hooks/useCustomers";
import { useUser } from "@/app/context/UserContext";
import { Service, User } from "@/app/types/types";
import { parseDate } from "@internationalized/date";
import {
  Customer,
  DealFormData,
  NewCustomerData,
  EMPTY_FORM,
  EMPTY_NEW_CUSTOMER,
  STAGE_META,
  formatCurrency,
  StagePipeline,
  NewCustomerSection,
} from "@/app/components/deals/deal-shared";
import { DealStage } from "@prisma/client";

export default function NewDealPage() {
  const router = useRouter();
  const currentUser = useUser();

  const [formData, setFormData] = useState<DealFormData>(EMPTY_FORM);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustomerData, setNewCustomerData] =
    useState<NewCustomerData>(EMPTY_NEW_CUSTOMER);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: allUsers = [], isLoading: usersLoading } = useAllUser(
    currentUser?.companyId || "",
  );
  const { data: allServices = [], isLoading: servicesLoading } = useServices(
    currentUser?.companyId || "",
  );
  const { data: allCustomers = [], isLoading: customersLoading } = useCustomers(
    currentUser?.companyId || "",
  );

  const selectedService = useMemo(
    () => allServices.find((s: Service) => s.id === formData.serviceId),
    [allServices, formData.serviceId],
  );

  const isLoading = usersLoading || servicesLoading || customersLoading;

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      let customerId = formData.customerId;

      if (isNewCustomer) {
        if (!newCustomerData.name) {
          alert("Customer name is required.");
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
          return;
        }
        const created = await customerRes.json();
        customerId = created.id;
      }

      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          customerId,
          value: parseFloat(formData.value) || 0,
          expectedCloseDate: formData.expectedCloseDate || null,
          assignedTo: formData.assignedTo || null,
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
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48 rounded-lg" />
        <Skeleton className="h-24 rounded-xl" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <Skeleton className="h-56 rounded-xl" />
          </div>
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
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
          <h1 className="text-2xl font-bold">New Deal</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="flat"
            radius="full"
            startContent={<X size={16} />}
            onPress={() => router.push("/deals")}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            radius="full"
            startContent={<Save size={16} />}
            onPress={handleSave}
            isLoading={isSubmitting}
            isDisabled={
              !formData.title ||
              (!isNewCustomer && !formData.customerId) ||
              (isNewCustomer && !newCustomerData.name)
            }
          >
            Create Deal
          </Button>
        </div>
      </div>

      {/* Stage Pipeline */}
      <Card>
        <CardBody className="py-5 px-6">
          <StagePipeline
            currentStage={formData.stage}
            onChange={(stage: DealStage) => setFormData({ ...formData, stage })}
            isEditing
          />
          <p className="text-xs text-default-400 text-center mt-1">
            Click a stage to set the deal status
          </p>
        </CardBody>
      </Card>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-0">
              <h2 className="text-lg font-semibold">Deal Information</h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Deal Title"
                  placeholder="e.g. Acme Corp — Enterprise Plan"
                  isRequired
                  className="md:col-span-2"
                  value={formData.title}
                  onValueChange={(v) => setFormData({ ...formData, title: v })}
                />

                <NewCustomerSection
                  isNewCustomer={isNewCustomer}
                  onToggle={(checked: boolean) => {
                    setIsNewCustomer(checked);
                    if (checked) setFormData({ ...formData, customerId: null });
                    else setNewCustomerData(EMPTY_NEW_CUSTOMER);
                  }}
                  newCustomerData={newCustomerData}
                  onCustomerDataChange={setNewCustomerData}
                >
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
                    {(allCustomers as Customer[]).map((c: Customer) => (
                      <SelectItem
                        key={c.id}
                        textValue={c.name}
                        description={c.email || ""}
                      >
                        {c.name}
                      </SelectItem>
                    ))}
                  </Select>
                </NewCustomerSection>

                <Select
                  label="Service"
                  placeholder="Select service"
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
                  onValueChange={(v) => setFormData({ ...formData, value: v })}
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
            </CardBody>
          </Card>
        </div>

        {/* Right */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-0">
              <h2 className="text-lg font-semibold">Owner</h2>
            </CardHeader>
            <CardBody>
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
