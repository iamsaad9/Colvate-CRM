"use client";

import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Skeleton,
} from "@heroui/react";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  Globe,
  Mail,
  Phone,
  Trash2,
  User as UserIcon,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDeal } from "@/app/hooks/useDeal";
import { useAllUser } from "@/app/hooks/useAllUsers";
import { useServices } from "@/app/hooks/useServices";
import { useCustomers } from "@/app/hooks/useCustomers";
import { useUser } from "@/app/context/UserContext";
import { DealStage, Service, User, Customer } from "@/app/types/types";
import {
  STAGE_META,
  formatCurrency,
  formatDate,
  DealValueBadge,
  StagePipeline,
} from "@/app/components/deals/deal-shared";

export default function ViewDealPage() {
  const router = useRouter();
  const params = useParams();
  const dealId = params.dealId as string;
  const currentUser = useUser();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: deal,
    isLoading: dealLoading,
    refetch: refetchDeal,
  } = useDeal(dealId, currentUser?.companyId || "");
  const { data: allUsers = [], isLoading: usersLoading } = useAllUser(
    currentUser?.companyId || "",
  );
  const { data: allServices = [], isLoading: servicesLoading } = useServices(
    currentUser?.companyId || "",
  );
  const {
    data: allCustomers = [],
    isLoading: customersLoading,
    refetch: fetchCustomer,
  } = useCustomers(currentUser?.companyId || "");

  const userDeal = deal?.assignedTo === currentUser?.id;
  const leadCustomer = allCustomers.find(
    (c: Customer) => c.id === deal?.customerId,
  );

  const linkedServices = useMemo(() => {
    // 1. Safety check for lead
    if (!deal) return [];

    // 2. Extract the IDs from the services objects
    const currentServiceIds = deal.services?.map((s: Service) => s.id) || [];

    // 3. Filter allServices based on those IDs
    return allServices.filter((s: Service) => currentServiceIds.includes(s.id));
  }, [allServices, deal]);

  const assignedUser = useMemo(
    () => allUsers.find((u: User) => u.id === deal?.assignedTo),
    [allUsers, deal],
  );

  const isLoading =
    dealLoading || usersLoading || servicesLoading || customersLoading;

  useEffect(() => {
    console.log("deal data:", deal);
    console.log("Services data:", allServices);
    fetchCustomer();
  }, [deal, allServices, fetchCustomer]);

  const handleStageChange = async (stage: DealStage) => {
    try {
      await fetch(`/api/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      });
      await refetchDeal();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDeal = async () => {
    if (!deal) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(
        `/api/deals/${deal.id}?companyId=${currentUser?.companyId}`,
        {
          method: "DELETE",
        },
      );
      if (res.ok) {
        setIsDeleteModalOpen(false);
        router.push("/deals");
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
            <Skeleton className="h-40 rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
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

  const stageMeta = STAGE_META[(deal.stage ?? "PROSPECT") as DealStage];

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
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{deal.title}</h1>
              <Chip size="sm" color={stageMeta.color} variant="flat">
                {stageMeta.label}
              </Chip>
            </div>
            <p className="text-default-400 text-sm mt-0.5">
              Created {formatDate(deal.createdAt)} · Last updated{" "}
              {formatDate(deal.updatedAt)}
            </p>
          </div>
        </div>
        {userDeal && (
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
              color="primary"
              radius="full"
              startContent={<Edit size={16} />}
              onPress={() => router.push(`/deals/${dealId}/edit`)}
            >
              Edit Deal
            </Button>
          </div>
        )}
      </div>

      {/* Stage Pipeline */}
      <Card radius="sm">
        <CardBody className="py-5 px-6">
          <StagePipeline
            currentStage={deal.stage ?? "PROSPECT"}
            onChange={handleStageChange}
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
              <h2 className="text-lg font-semibold">Deal Information</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-6">
                {/* Value hero */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-success/5 border border-success/20">
                  <div>
                    <p className="text-xs text-default-400 mb-1">Deal Value</p>
                    <DealValueBadge value={deal.value} />
                  </div>
                  {deal.expectedCloseDate && (
                    <div className="text-right">
                      <p className="text-xs text-default-400 mb-1">
                        Expected Close
                      </p>
                      <div className="flex items-center gap-1.5 text-sm font-medium">
                        <Calendar size={14} className="text-default-400" />
                        {formatDate(deal.expectedCloseDate)}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  {/* Customer */}
                  <div>
                    <p className="text-xs text-default-400 mb-1.5">Customer</p>
                    {leadCustomer ? (
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-default-100 flex items-center justify-center flex-shrink-0">
                          <Building2 size={16} className="text-default-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-medium text-sm">
                                {leadCustomer.name}
                              </p>
                              {leadCustomer.companyName && (
                                <p className="text-xs text-default-400">
                                  {leadCustomer.companyName}
                                </p>
                              )}
                            </div>
                            <Chip
                              size="sm"
                              variant="flat"
                              color={
                                leadCustomer.status === "ACTIVE"
                                  ? "success"
                                  : leadCustomer.status === "PROSPECT"
                                    ? "warning"
                                    : "danger"
                              }
                            >
                              {leadCustomer.status}
                            </Chip>
                          </div>

                          <div className="mt-2 text-xs text-default-400 space-y-1">
                            {/* Email Row */}
                            {leadCustomer.email && (
                              <div className="flex items-center gap-2">
                                <Mail size={12} className="flex-shrink-0" />
                                <span className="truncate">
                                  {leadCustomer.email}
                                </span>
                              </div>
                            )}

                            {/* Phone Row */}
                            {leadCustomer.phone && (
                              <div className="flex items-center gap-2">
                                <Phone size={12} className="flex-shrink-0" />
                                <span>{leadCustomer.phone}</span>
                              </div>
                            )}

                            {/* Assigned User Row */}
                            {leadCustomer.user && (
                              <div className="flex items-center gap-2">
                                <UserIcon size={12} className="flex-shrink-0" />
                                <span>
                                  Assigned to:{" "}
                                  <span className="text-default-600 font-medium">
                                    {leadCustomer.user.name}
                                  </span>
                                </span>
                              </div>
                            )}

                            {/* Source & Date Row (Grouped for better vertical space) */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 border-t border-default-50 mt-1">
                              {leadCustomer.source && (
                                <div className="flex items-center gap-1.5">
                                  <Globe size={12} className="flex-shrink-0" />
                                  <span>{leadCustomer.source}</span>
                                </div>
                              )}

                              <div className="flex items-center gap-1.5">
                                <Calendar size={12} className="flex-shrink-0" />
                                <span>
                                  Added:{" "}
                                  {new Date(
                                    leadCustomer.createdAt,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-default-400 text-sm">-</p>
                    )}
                  </div>

                  {/* Service */}
                  {/* <div>
                    <p className="text-xs text-default-400 mb-1.5">Service</p>
                    {leadService ? (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-default-100 flex items-center justify-center">
                          <Layers size={14} className="text-default-400" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {leadService.name}
                          </p>
                          <p className="text-xs text-default-400">
                            List price: {formatCurrency(leadService.price)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-default-400 text-sm">-</p>
                    )}
                  </div> */}
                </div>
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
          {/* Owner */}
          <Card radius="sm">
            <CardHeader className="pb-0">
              <h2 className="text-lg font-semibold">Owner</h2>
            </CardHeader>
            <CardBody>
              {assignedUser ? (
                <div className="flex items-center gap-3">
                  <Avatar
                    color="primary"
                    src={assignedUser.avatarUrl || ""}
                    name={assignedUser.name}
                    size="md"
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

          {/* Details */}
          <Card radius="sm">
            <CardHeader className="pb-0">
              <h2 className="text-lg font-semibold">Details</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <p className="text-xs text-default-400 mb-1">Stage</p>
                <Chip
                  size="sm"
                  color={stageMeta.color}
                  variant="flat"
                  startContent={stageMeta.icon}
                >
                  {stageMeta.label}
                </Chip>
              </div>
              <div>
                <p className="text-xs text-default-400 mb-1">Value</p>
                <p className="font-bold text-success">
                  {formatCurrency(deal.value)}
                </p>
              </div>
              {deal.expectedCloseDate && (
                <div>
                  <p className="text-xs text-default-400 mb-1">
                    Expected Close
                  </p>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Calendar size={13} className="text-default-400" />
                    {formatDate(deal.expectedCloseDate)}
                  </div>
                </div>
              )}
              <Divider />
              <div>
                <p className="text-xs text-default-400 mb-1">Created</p>
                <div className="flex items-center gap-1 text-sm">
                  <Clock size={13} className="text-default-400" />
                  {formatDate(deal.createdAt)}
                </div>
              </div>
              <div>
                <p className="text-xs text-default-400 mb-1">Last Updated</p>
                <div className="flex items-center gap-1 text-sm">
                  <Clock size={13} className="text-default-400" />
                  {formatDate(deal.updatedAt)}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          {deal.customer && (
            <Card>
              <CardHeader className="pb-0">
                <h2 className="text-lg font-semibold">Quick Actions</h2>
              </CardHeader>
              <CardBody className="space-y-2">
                {deal.customer.email && (
                  <Button
                    fullWidth
                    variant="flat"
                    startContent={<Mail size={16} />}
                    onPress={() => {
                      window.location.href = `mailto:${deal.customer!.email}`;
                    }}
                  >
                    Email Customer
                  </Button>
                )}
                {deal.customer.phone && (
                  <Button
                    fullWidth
                    variant="flat"
                    startContent={<Phone size={16} />}
                    onPress={() => {
                      window.location.href = `tel:${deal.customer!.phone}`;
                    }}
                  >
                    Call Customer
                  </Button>
                )}
                <Divider className="my-1" />
                {deal.stage !== "WON" && (
                  <Button
                    fullWidth
                    color="success"
                    variant="flat"
                    startContent={<CheckCircle2 size={16} />}
                    onPress={() => handleStageChange("WON")}
                  >
                    Mark as Won
                  </Button>
                )}
                {deal.stage !== "LOST" && (
                  <Button
                    fullWidth
                    color="danger"
                    variant="flat"
                    startContent={<X size={16} />}
                    onPress={() => handleStageChange("LOST")}
                  >
                    Mark as Lost
                  </Button>
                )}
              </CardBody>
            </Card>
          )}

          {/* Delete Modal */}
          <Modal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            size="sm"
          >
            <ModalContent>
              <ModalHeader>Delete Deal</ModalHeader>
              <ModalBody>
                <p>
                  Are you sure you want to delete <strong>{deal?.title}</strong>
                  ?
                </p>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="light"
                  onPress={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  color="danger"
                  isLoading={isSubmitting}
                  onPress={handleDeleteDeal}
                >
                  Delete
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </div>
      </div>
    </div>
  );
}
