"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Card,
  CardBody,
  Button,
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Pagination,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  User as UserComponent,
  Skeleton,
} from "@heroui/react";
import {
  Search,
  Plus,
  Download,
  Upload,
  MoreVertical,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  TrendingUp,
  List,
  SlidersHorizontal,
  Eye,
  CheckCircle,
  ArrowRight,
  Target,
  RefreshCcw,
  Handshake,
} from "lucide-react";
import { useUser } from "@/app/context/UserContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useAllUser } from "@/app/hooks/useAllUsers";
import { useAllDeals } from "@/app/hooks/useAllsDeals";
import { Deal, DealStage, Service } from "@/app/types/types";
import { useCustomers } from "@/app/hooks/useCustomers";
import { useServices } from "@/app/hooks/useServices";

export default function DealsPage() {
  const currentUser = useUser();
  const isAdmin =
    currentUser?.role === "ADMIN" || currentUser?.role === "MANAGER";
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set([]));
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    data: allDeals = [],
    isLoading: dealsLoading,
    refetch: refetchDeals,
  } = useAllDeals(currentUser?.companyId || "");
  const { data: allUsers = [], isLoading: allUserLoading } = useAllUser(
    currentUser?.companyId || "",
  );
  const {
    data: allCustomer = [],
    refetch: refetchCustomers,
    isLoading: allCustomerLoading,
  } = useCustomers(currentUser?.companyId || "");

  const [stageFilter, setStageFilter] = useState<Set<string>>(new Set(["all"]));
  const [assignedFilter, setAssignedFilter] = useState<Set<string>>(
    new Set(["all"]),
  );
  const [valueFilter, setValueFilter] = useState<string>("all");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    customerId: "",
    serviceId: "",
    value: "",
    stage: "PROSPECT" as DealStage,
    expectedCloseDate: "",
    assignedTo: "",
  });

  const teamMembers = [
    { id: "1", name: "John Doe" },
    { id: "2", name: "Jane Smith" },
    { id: "3", name: "Mike Wilson" },
  ];

  const customers = [
    { id: "1", name: "Acme Corporation" },
    { id: "2", name: "TechStart Inc" },
    { id: "3", name: "Global Solutions Ltd" },
    { id: "4", name: "Small Business Co" },
    { id: "5", name: "Enterprise Corp" },
  ];

  const handleMultiSelectToggle = (
    nextKeys: Set<string>, // The set AFTER the click
    currentKeys: Set<string>, // The set BEFORE the click
    setter: (s: Set<string>) => void,
  ) => {
    // Find what was just clicked
    const lastClicked = Array.from(nextKeys).find(
      (key) => !currentKeys.has(key),
    );

    // 1. If nothing was added (something was removed), just update
    if (!lastClicked) {
      // If we removed the last item, default back to "all"
      if (nextKeys.size === 0) {
        setter(new Set(["all"]));
      } else {
        setter(nextKeys);
      }
      return;
    }

    // 2. If "all" was just clicked, clear everything else
    if (lastClicked === "all") {
      setter(new Set(["all"]));
      return;
    }

    // 3. If any other filter was clicked, remove "all"
    const updated = new Set(nextKeys);
    updated.delete("all");
    setter(updated);
  };

  useEffect(() => {
    console.log("Fetched Deals: ", allDeals);
    console.log("User", currentUser);
    refetchDeals();
    refetchCustomers();
  }, [allDeals.length, refetchDeals, allDeals]);

  // Filtered data
  const filteredDeals = useMemo(() => {
    let filtered: Deal[] = allDeals;

    filtered = filtered.filter((l) => {
      if (assignedFilter.has("all")) return true;

      const isUnassigned = !l.assignedTo && assignedFilter.has("unassigned");
      const isMe = l.assignedTo === currentUser?.id && assignedFilter.has("me");

      const isSpecificUser = l.assignedTo && assignedFilter.has(l.assignedTo);

      return isUnassigned || isMe || isSpecificUser;
    });

    if (searchValue) {
      filtered = filtered.filter(
        (deal) =>
          deal.title.toLowerCase().includes(searchValue.toLowerCase()) ||
          deal.customerId.toLowerCase().includes(searchValue.toLowerCase()),
      );
    }

    if (!stageFilter.has("all")) {
      filtered = filtered.filter((deal) => stageFilter.has(deal.stage));
    }

    if (valueFilter !== "all") {
      filtered = filtered.filter((deal) => {
        if (valueFilter === "high") return deal.value >= 100000;
        if (valueFilter === "medium")
          return deal.value >= 50000 && deal.value < 100000;
        if (valueFilter === "low") return deal.value < 50000;
        return true;
      });
    }

    return filtered;
  }, [
    allDeals,
    searchValue,
    stageFilter,
    assignedFilter,
    valueFilter,
    currentUser?.id,
  ]);

  const pages = Math.ceil(filteredDeals.length / rowsPerPage);
  const paginatedDeals = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredDeals.slice(start, end);
  }, [filteredDeals, page, rowsPerPage]);

  const getStageColor = (stage: DealStage) => {
    const colors = {
      PROSPECT: "primary",
      NEGOTIATION: "warning",
      WON: "success",
      LOST: "danger",
    };
    return colors[stage];
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleAddDeal = async () => {
    const dealPayload = {
      ...formData,
      title: titleRef.current?.value || "",
      notes: notesRef.current?.value || "",
      value: valueRef.current?.value || "",
      companyId: currentUser?.companyId,
    };

    if (!dealPayload.title) return; // Simple validation

    try {
      const response = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dealPayload),
      });

      if (response.ok) {
        const savedDeal = await response.json();

        setIsAddModalOpen(false);
        resetForm();

        console.log("Deal saved successfully:", savedDeal);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (err) {
      console.error("Network error:", err);
    }
  };

  const handleEditDeal = () => {
    console.log("Editing deal:", selectedDeal?.id, formData);
    setIsEditModalOpen(false);
    resetForm();
  };

  const handleDeleteDeal = async () => {
    if (!selectedDeal) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(
        `/api/deals/${selectedDeal.id}?companyId=${currentUser?.companyId}`,
        {
          method: "DELETE",
        },
      );
      if (res.ok) {
        await refetchDeals();
        setIsDeleteModalOpen(false);
        setSelectedDeal(null);
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

  const resetForm = () => {
    setFormData({
      title: "",
      customerId: "",
      serviceId: "",
      value: "",
      stage: "PROSPECT",
      expectedCloseDate: "",
      assignedTo: "",
    });
  };

  const openEditModal = (deal: Deal) => {
    setSelectedDeal(deal);
    setFormData({
      title: deal.title,
      customerId: deal.customerId,
      serviceId: deal.serviceId,
      value: deal.value.toString(),
      stage: deal.stage,
      expectedCloseDate: deal.expectedCloseDate || "",
      assignedTo: deal.assignedTo || "",
    });
    setIsEditModalOpen(true);
  };

  const clearAllFilters = () => {
    setStageFilter(new Set(["all"]));
    setAssignedFilter(new Set(["all"]));
    setValueFilter("all");
    setIsFilterOpen(false);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (!stageFilter.has("all")) count++;
    if (!assignedFilter.has("all")) count++;
    if (valueFilter !== "all") count++;
    return count;
  }, [stageFilter, assignedFilter, valueFilter]);

  const stats = useMemo(() => {
    const totalDeals = filteredDeals.length;

    const totals = filteredDeals.reduce(
      (acc, deal) => {
        // Ensure value is a number (prevents string concatenation bugs)
        const val = Number(deal.value) || 0;

        acc.totalValue += val;

        if (deal.stage === "WON") {
          acc.wonValue += val;
          acc.wonCount += 1;
        }

        if (deal.stage === "WON" || deal.stage === "LOST") {
          acc.closedCount += 1;
        }

        return acc;
      },
      { totalValue: 0, wonValue: 0, wonCount: 0, closedCount: 0 },
    );

    return {
      totalDeals,
      totalValue: totals.totalValue,
      wonValue: totals.wonValue,
      avgDealSize: totalDeals > 0 ? totals.totalValue / totalDeals : 0,
      winRate:
        totals.closedCount > 0
          ? (totals.wonCount / totals.closedCount) * 100
          : 0,
    };
  }, [filteredDeals]);

  if (dealsLoading || allUserLoading || allCustomerLoading) {
    return (
      <div className="flex flex-col items-center max-w-[1600px] gap-5 p-5 mx-auto justify-center py-20 overflow-y-hidden  flex-1">
        <div className="w-full flex gap-10">
          <Skeleton className="w-full h-24 rounded-md" />
          <Skeleton className="w-full h-24 rounded-md" />
          <Skeleton className="w-full h-24 rounded-md" />
          <Skeleton className="w-full h-24 rounded-md" />
        </div>
        <Skeleton className="w-full h-24 rounded-md" />
        <Skeleton className="w-full h-72  rounded-md" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center ">
          <div className="flex gap-5 justify-center items-center">
            <Handshake size={30} />

            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                Deals
              </h1>
              <p className="text-default-500 mt-1">
                Manage sales pipeline ({filteredDeals.length} total)
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="flat"
              radius="full"
              color="primary"
              startContent={<RefreshCcw size={18} />}
              onPress={() => refetchDeals()}
            >
              Refresh
            </Button>
            <Button
              radius="full"
              variant="flat"
              startContent={<Upload size={18} />}
            >
              Import
            </Button>
            <Button
              radius="full"
              variant="flat"
              startContent={<Download size={18} />}
            >
              Export
            </Button>
            <Button
              color="primary"
              radius="full"
              startContent={<Plus size={18} />}
              onPress={() => router.push("/deals/new")}
            >
              Add Deal
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card radius="sm">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-default-500">Total Deals</p>
                  <p className="text-2xl font-bold">
                    {stats.totalDeals.toLocaleString()}
                  </p>
                </div>
                <div className="bg-primary-100 p-3 rounded-full">
                  <List className="text-primary-600" size={24} />
                </div>
              </div>
            </CardBody>
          </Card>
          <Card radius="sm">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-default-500">Pipeline Value</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(stats.totalValue)}
                  </p>
                </div>
                <div className="bg-primary-100 p-3 rounded-full">
                  <DollarSign className="text-primary-600" size={24} />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card radius="sm">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-default-500">Won Value</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(stats.wonValue)}
                  </p>
                </div>
                <div className="bg-success-100 p-3 rounded-full">
                  <CheckCircle className="text-success-600" size={24} />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card radius="sm">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-default-500">Avg Deal Value</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(stats.avgDealSize)}
                  </p>
                </div>
                <div className="bg-warning-100 p-3 rounded-full">
                  <TrendingUp className="text-warning-600" size={24} />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card radius="sm">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-default-500">Win Rate</p>
                  <p className="text-2xl font-bold">
                    {stats.winRate.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-secondary-100 p-3 rounded-full">
                  <Target className="text-secondary-600" size={24} />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card radius="sm">
          <CardBody>
            <div className="flex flex-col lg:flex-row gap-4">
              <Input
                className="flex-1"
                label="Search Deals"
                placeholder="Search deals by title or customer..."
                startContent={<Search size={18} className="text-default-400" />}
                value={searchValue}
                onValueChange={setSearchValue}
                isClearable
                radius="sm"
                onClear={() => setSearchValue("")}
              />

              <div className="flex gap-2">
                <Select
                  label="Stage"
                  placeholder="All stages"
                  className="w-40"
                  radius="sm"
                  selectedKeys={stageFilter}
                  onSelectionChange={(keys) =>
                    setStageFilter(keys as Set<string>)
                  }
                  selectionMode="multiple"
                >
                  <SelectItem key="all">All Stages</SelectItem>
                  <SelectItem key="PROSPECT">Prospect</SelectItem>
                  <SelectItem key="NEGOTIATION">Negotiation</SelectItem>
                  <SelectItem key="WON">Won</SelectItem>
                  <SelectItem key="LOST">Lost</SelectItem>
                </Select>

                <Select
                  label="Assigned To"
                  placeholder="All users"
                  className="w-40"
                  radius="sm"
                  selectedKeys={assignedFilter}
                  onSelectionChange={(keys) =>
                    handleMultiSelectToggle(
                      keys as Set<string>,
                      assignedFilter,
                      setAssignedFilter,
                    )
                  }
                  selectionMode="multiple"
                >
                  <SelectItem
                    key="all"
                    className=" hover:bg-success/40! focus:bg-success/40!"
                  >
                    All Users
                  </SelectItem>
                  <SelectItem
                    key="me"
                    className=" hover:bg-primary/40! focus:bg-primary/40!"
                  >
                    Me
                  </SelectItem>
                  <>
                    {allUsers
                      .filter(
                        (u) => u.role === "SALES" && u.id !== currentUser?.id,
                      )
                      .map((user) => (
                        <SelectItem key={user.id}>{user.name}</SelectItem>
                      ))}
                  </>
                  <SelectItem key="unassigned">Unassigned</SelectItem>
                </Select>

                <Button
                  variant={activeFiltersCount > 0 ? "flat" : "light"}
                  color={activeFiltersCount > 0 ? "primary" : "default"}
                  startContent={<SlidersHorizontal size={18} />}
                  onPress={() => setIsFilterOpen(!isFilterOpen)}
                  radius="sm"
                >
                  Filters
                  {activeFiltersCount > 0 && (
                    <Chip size="sm" color="primary" variant="flat">
                      {activeFiltersCount}
                    </Chip>
                  )}
                </Button>
              </div>
            </div>

            {isFilterOpen && (
              <div className="mt-4 pt-4 border-t border-divider">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    label="Value Range"
                    placeholder="All values"
                    selectedKeys={new Set([valueFilter])}
                    radius="sm"
                    onSelectionChange={(keys) =>
                      setValueFilter(Array.from(keys)[0] as string)
                    }
                  >
                    <SelectItem key="all">All Values</SelectItem>
                    <SelectItem key="high">High ($100k+)</SelectItem>
                    <SelectItem key="medium">Medium ($50k-$100k)</SelectItem>
                    <SelectItem key="low">Low (&lt;$50k)</SelectItem>
                  </Select>
                </div>

                <div className="flex justify-end mt-4">
                  <Button
                    radius="full"
                    size="sm"
                    variant="flat"
                    color="danger"
                    onPress={clearAllFilters}
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/*  Table View */}
      <Table
        aria-label="Deals table"
        selectionMode="multiple"
        selectedKeys={selectedKeys}
        onSelectionChange={(keys) => setSelectedKeys(keys as Set<string>)}
        radius="sm"
        shadow="none"
        classNames={{
          wrapper: "bg-transparent",
          th: "border-b-2 border-default bg-transparent",
        }}
        bottomContent={
          <Card
            radius="sm"
            shadow="none"
            className="flex flex-row w-full justify-between items-center px-2 py-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm text-default-500">
                Showing{" "}
                {Math.min((page - 1) * rowsPerPage + 1, filteredDeals.length)}–
                {Math.min(page * rowsPerPage, filteredDeals.length)} of{" "}
                {filteredDeals.length} leads
              </span>
              <Select
                size="sm"
                className="w-20"
                selectedKeys={new Set([rowsPerPage.toString()])}
                onSelectionChange={(keys) => {
                  setRowsPerPage(Number(Array.from(keys)[0]));
                  setPage(1);
                }}
              >
                <SelectItem key="10">10</SelectItem>
                <SelectItem key="25">25</SelectItem>
                <SelectItem key="50">50</SelectItem>
                <SelectItem key="100">100</SelectItem>
              </Select>
            </div>
            <Pagination
              isCompact
              showControls
              showShadow
              color="primary"
              page={page}
              total={pages}
              onChange={setPage}
            />
          </Card>
        }
      >
        <TableHeader>
          <TableColumn>DEAL</TableColumn>
          <TableColumn>CUSTOMER NAME</TableColumn>
          <TableColumn>VALUE</TableColumn>
          <TableColumn>SERVICES</TableColumn>
          <TableColumn>STAGE</TableColumn>
          <TableColumn>EXPECTED CLOSE</TableColumn>
          <TableColumn>ASSIGNED TO</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody emptyContent="No deals found.">
          {paginatedDeals.map((deal) => (
            <TableRow key={deal.id}>
              <TableCell>
                <div>
                  <p className="font-semibold">{deal.title}</p>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="">
                    {allCustomer.find((c) => c.id == deal.customerId)?.name ||
                      "Anonymous Customer"}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <span className="font-semibold text-primary">
                  {formatCurrency(deal.value)}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex flex-col flex-wrap gap-1">
                  {(deal.services ?? []).length > 0 && deal.services ? (
                    <>
                      {deal.services.slice(0, 2).map((s: Service) => (
                        <Chip
                          key={s.id}
                          size="sm"
                          variant="flat"
                          color="secondary"
                        >
                          {s.name}
                        </Chip>
                      ))}
                      {deal.services.length > 2 && (
                        <Chip size="sm" variant="flat">
                          +{deal.services.length - 2}
                        </Chip>
                      )}
                    </>
                  ) : (
                    <span className="text-default-400 text-xs">—</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Chip
                  size="sm"
                  variant="flat"
                  color={
                    getStageColor(deal.stage) as
                      | "primary"
                      | "warning"
                      | "success"
                      | "danger"
                      | "default"
                      | "secondary"
                  }
                >
                  {deal.stage}
                </Chip>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <Calendar size={14} className="text-default-400" />
                  <span>{formatDate(deal.expectedCloseDate || "")}</span>
                </div>
              </TableCell>
              <TableCell>
                {deal.assignedTo ? (
                  <UserComponent
                    name={
                      allUsers.find((u) => u.id === deal.assignedTo)?.name ||
                      "Unknown User"
                    }
                    avatarProps={{ size: "sm" }}
                  />
                ) : (
                  <span className="text-default-400 text-sm">Unassigned</span>
                )}
              </TableCell>
              <TableCell>
                <Button
                  isIconOnly
                  aria-label="view-lead"
                  size="sm"
                  variant="light"
                  onPress={() => router.push(`/deals/${deal.id}`)}
                >
                  <Eye size={16} />
                </Button>
                {(currentUser?.role === "ADMIN" ||
                  (currentUser?.role === "SALES" &&
                    deal.assignedTo === currentUser?.id)) && (
                  <>
                    <Button
                      isIconOnly
                      size="sm"
                      aria-label="edit-lead"
                      variant="light"
                      onPress={() => router.push(`/deals/${deal.id}/edit`)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="light">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu>
                        <DropdownItem
                          key="view"
                          startContent={<Eye size={16} />}
                        >
                          View Details
                        </DropdownItem>
                        <DropdownItem
                          key="edit"
                          startContent={<Edit size={16} />}
                          onPress={() => openEditModal(deal)}
                        >
                          Edit Deal
                        </DropdownItem>
                        <DropdownItem
                          key="move"
                          startContent={<ArrowRight size={16} />}
                        >
                          Move Stage
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          color="danger"
                          startContent={<Trash2 size={16} />}
                          onPress={() => {
                            setSelectedDeal(deal);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          Delete Deal
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>Add New Deal</ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Deal Title"
                placeholder="Enter deal title"
                isRequired
                ref={titleRef}
              />
              <Select
                label="Customer"
                placeholder="Select customer"
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
                {customers.map((customer) => (
                  <SelectItem key={customer.id}>{customer.name}</SelectItem>
                ))}
              </Select>
              <Input
                label="Deal Value"
                type="number"
                placeholder="50000"
                isRequired
                startContent={<DollarSign size={16} />}
                ref={valueRef}
              />
              <Select
                label="Stage"
                selectedKeys={new Set([formData.stage])}
                onSelectionChange={(keys) =>
                  setFormData({
                    ...formData,
                    stage: Array.from(keys)[0] as DealStage,
                  })
                }
              >
                <SelectItem key="PROSPECT">Prospect</SelectItem>
                <SelectItem key="NEGOTIATION">Negotiation</SelectItem>
                <SelectItem key="WON">Won</SelectItem>
                <SelectItem key="LOST">Lost</SelectItem>
              </Select>
              <Input
                label="Expected Close Date"
                type="date"
                value={formData.expectedCloseDate}
                onValueChange={(value) =>
                  setFormData({ ...formData, expectedCloseDate: value })
                }
              />

              <Select
                label="Assign To"
                placeholder="Select team member"
                className="md:col-span-2"
                selectedKeys={
                  formData.assignedTo
                    ? new Set([formData.assignedTo])
                    : new Set()
                }
                onSelectionChange={(keys) =>
                  setFormData({
                    ...formData,
                    assignedTo: Array.from(keys)[0] as string,
                  })
                }
              >
                {teamMembers.map((member) => (
                  <SelectItem key={member.id}>{member.name}</SelectItem>
                ))}
              </Select>
            </div>
            <Textarea
              label="Notes"
              placeholder="Add any additional notes..."
              className="mt-4"
              ref={notesRef}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => {
                setIsAddModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button color="primary" onPress={handleAddDeal}>
              Add Deal
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          resetForm();
        }}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>Edit Deal</ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Deal Title"
                isRequired
                value={formData.title}
                onValueChange={(value) =>
                  setFormData({ ...formData, title: value })
                }
              />
              <Select
                label="Customer"
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
                {customers.map((customer) => (
                  <SelectItem key={customer.id}>{customer.name}</SelectItem>
                ))}
              </Select>
              <Input
                label="Deal Value"
                type="number"
                isRequired
                startContent={<DollarSign size={16} />}
                value={formData.value}
                onValueChange={(value) => setFormData({ ...formData, value })}
              />
              <Select
                label="Stage"
                selectedKeys={new Set([formData.stage])}
                onSelectionChange={(keys) =>
                  setFormData({
                    ...formData,
                    stage: Array.from(keys)[0] as DealStage,
                  })
                }
              >
                <SelectItem key="PROSPECT">Prospect</SelectItem>
                <SelectItem key="NEGOTIATION">Negotiation</SelectItem>
                <SelectItem key="WON">Won</SelectItem>
                <SelectItem key="LOST">Lost</SelectItem>
              </Select>
              <Input
                label="Expected Close Date"
                type="date"
                value={formData.expectedCloseDate}
                onValueChange={(value) =>
                  setFormData({ ...formData, expectedCloseDate: value })
                }
              />

              <Select
                label="Assign To"
                className="md:col-span-2"
                selectedKeys={
                  formData.assignedTo
                    ? new Set([formData.assignedTo])
                    : new Set()
                }
                onSelectionChange={(keys) =>
                  setFormData({
                    ...formData,
                    assignedTo: Array.from(keys)[0] as string,
                  })
                }
              >
                {teamMembers.map((member) => (
                  <SelectItem key={member.id}>{member.name}</SelectItem>
                ))}
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => {
                setIsEditModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button color="primary" onPress={handleEditDeal}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

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
              Are you sure you want to delete{" "}
              <strong>{selectedDeal?.title}</strong>?
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setIsDeleteModalOpen(false)}>
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
  );
}
