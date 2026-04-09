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
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDeal } from "@/app/hooks/useDeal";
import { useAllUser } from "@/app/hooks/useAllUsers";
import { useAllServices } from "@/app/hooks/useAllServices";
import { useCustomers } from "@/app/hooks/useCustomers";
import { useUser } from "@/app/context/UserContext";
import { Service, User } from "@/app/types/types";
import { parseDate } from "@internationalized/date";
import {
  DealFormData,
  NewCustomerData,
  EMPTY_NEW_CUSTOMER,
  STAGE_META,
  formatCurrency,
  toInputDate,
  StagePipeline,
  NewCustomerSection,
} from "@/app/components/deals/deal-shared";
import { Customer } from "@/app/types/types";

export default function EditDealPage() {
  const router = useRouter();
  const params = useParams();
  const dealId = params.dealId as string;
  const currentUser = useUser();

  const {
    data: deal,
    isLoading: dealLoading,
    refetch: refetchDeal,
  } = useDeal(dealId, currentUser?.companyId || "");
  const { data: allUsers = [], isLoading: usersLoading } = useAllUser(
    currentUser?.companyId || "",
  );
  const { data: allServices = [], isLoading: servicesLoading } = useAllServices(
    currentUser?.companyId || "",
  );
  const { data: allCustomers = [], isLoading: customersLoading } = useCustomers(
    currentUser?.companyId || "",
  );

  const [formData, setFormData] = useState<DealFormData>({
    title: "",
    customerId: null,
    services: [],
    value: 0,
    stage: "PROSPECT",
    expectedCloseDate: "",
    assignedTo: null,
  });
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustomerData, setNewCustomerData] =
    useState<NewCustomerData>(EMPTY_NEW_CUSTOMER);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (deal) {
      setFormData({
        title: deal.title ?? "",
        customerId: deal.customerId ?? null,
        services: deal.services ?? [],
        value: deal.value?.toString() ?? "",
        stage: deal.stage ?? "PROSPECT",
        expectedCloseDate: toInputDate(deal.expectedCloseDate),
        assignedTo: deal.assignedTo ?? null,
      });
    }
  }, [deal]);

  const selectedService = useMemo(
    () =>
      allServices.find(
        (s: Service) => s.id === formData.services.map((s) => s.id)[0],
      ),
    [allServices, formData.services],
  );

  const isLoading =
    dealLoading || usersLoading || servicesLoading || customersLoading;

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

      console.log("Updating deal with data:", {
        ...formData,
        customerId,
        value: parseFloat(formData.value) || 0,
        expectedCloseDate: formData.expectedCloseDate || null,
        assignedTo: formData.assignedTo || null,
      });

      const res = await fetch(
        `/api/deals/${dealId}?companyId=${currentUser?.companyId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            customerId,
            value: parseFloat(formData.value) || 0,
            expectedCloseDate: formData.expectedCloseDate || null,
            assignedTo: formData.assignedTo || null,
            serviceIds: formData.services.map((s) => s.id),
          }),
        },
      );

      if (res.ok) {
        await refetchDeal();
        router.replace(`/deals/${dealId}`);
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
    router.replace(`/deals/${dealId}`);
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

  if (!deal) {
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

  const stageMeta = STAGE_META[formData.stage];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            isIconOnly
            variant="flat"
            radius="full"
            onPress={handleCancel}
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Edit Deal</h1>
              <Chip size="sm" color={stageMeta.color} variant="flat">
                {stageMeta.label}
              </Chip>
            </div>
            <p className="text-default-400 text-sm mt-0.5">{deal.title}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
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
            isDisabled={
              !formData.title ||
              (!isNewCustomer && !formData.customerId) ||
              (isNewCustomer && !newCustomerData.name)
            }
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* Stage Pipeline */}
      <Card>
        <CardBody className="py-5 px-6">
          <StagePipeline
            currentStage={formData.stage}
            onChange={(stage) => setFormData({ ...formData, stage })}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
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
                  onToggle={(checked) => {
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

                <Input
                  label="Deal Value"
                  placeholder="0"
                  type="number"
                  min="0"
                  startContent={
                    <span className="text-default-400 text-sm">$</span>
                  }
                  value={formData.value.toString()}
                  onValueChange={(v) =>
                    setFormData({ ...formData, value: parseFloat(v) })
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
