"use client";
import {
  Button,
  Card,
  CardBody,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Select,
  SelectItem,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  User as UserComponent,
} from "@heroui/react";
import {
  CheckCircle,
  Clock,
  Download,
  Edit,
  Eye,
  List,
  Mail,
  MoreVertical,
  Phone,
  Plus,
  RefreshCcw,
  Search,
  Send,
  SlidersHorizontal,
  Target,
  Trash2,
  TrendingUp,
  Upload,
  UserPlus,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAllLeads } from "@/app/hooks/useAllLeads";
import { useAllUser } from "@/app/hooks/useAllUsers";
import { useAllServices } from "@/app/hooks/useAllServices";
import { useUser } from "@/app/context/UserContext";
import { Lead, LeadStatus, Service, User } from "@/app/types/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getStatusColor = (status: LeadStatus) =>
  ({
    NEW: "primary",
    CONTACTED: "secondary",
    QUALIFIED: "success",
    LOST: "danger",
  })[status] as "primary" | "secondary" | "success" | "danger";

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// (removed deal currency helper — leads use counts)

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LeadsPage() {
  const router = useRouter();
  const currentUser = useUser();
  const isAdmin =
    currentUser?.role === "ADMIN" || currentUser?.role === "MANAGER";

  const [searchValue, setSearchValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState(false);
  const [isBulkStatusModalOpen, setIsBulkStatusModalOpen] = useState(false);
  const [bulkAssignUserId, setBulkAssignUserId] = useState<string | null>(null);
  const [bulkNewStatus, setBulkNewStatus] = useState<LeadStatus | null>(null);
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  const {
    data: allLeads = [],
    isLoading: leadsLoading,
    refetch: refetchLeads,
  } = useAllLeads(currentUser?.companyId || "");

  const { data: allUsers = [], isLoading: allUserLoading } = useAllUser<User[]>(
    currentUser?.companyId || "",
  );

  const { data: allServices = [], isLoading: servicesLoading } = useAllServices(
    currentUser?.companyId || "",
  );

  // Filters ──────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState<Set<string>>(
    new Set(["all"]),
  );
  const [sourceFilter, setSourceFilter] = useState<Set<string>>(
    new Set(["all"]),
  );
  const [assignedFilter, setAssignedFilter] = useState<Set<string>>(
    new Set(["all"]),
  );
  const [servicesFilter, setServicesFilter] = useState<Set<string>>(
    new Set(["all"]),
  );
  const [dateRange, setDateRange] = useState<string>("all");

  // ── Filtered & paginated data ──────────────────────────────────────────────

  // When selecting filters, ensure "all" behaves exclusively: selecting any
  // other option should unselect "all", and selecting "all" should clear
  // other selections.
  const handleMultiSelectToggle = (
    keys: Set<string>,
    setter: (s: Set<string>) => void,
  ) => {
    const k = new Set(Array.from(keys) as string[]);
    if (k.has("all")) {
      if (k.size === 1) setter(new Set(["all"]));
      else {
        k.delete("all");
        setter(k);
      }
    } else {
      setter(k);
    }
  };

  const filteredLeads = useMemo(() => {
    let filtered: Lead[] = allLeads;

    // if (!isAdmin) {
    //   filtered = filtered.filter((l) => l.assignedTo === currentUser?.id);
    // }

    filtered = filtered.filter((l) => {
      if (assignedFilter.has("all")) return true;

      const isUnassigned = !l.assignedTo && assignedFilter.has("unassigned");
      const isMe = l.assignedTo === currentUser?.id && assignedFilter.has("me");

      const isSpecificUser = l.assignedTo && assignedFilter.has(l.assignedTo);

      return isUnassigned || isMe || isSpecificUser;
    });

    if (searchValue) {
      const q = searchValue.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q) ||
          l.phone?.includes(searchValue),
      );
    }

    if (!statusFilter.has("all")) {
      filtered = filtered.filter((l) => statusFilter.has(l.status));
    }

    if (!sourceFilter.has("all")) {
      filtered = filtered.filter((l) => l.source && sourceFilter.has(l.source));
    }

    if (!servicesFilter.has("all")) {
      filtered = filtered.filter((l) =>
        (l.services ?? []).some((id) => servicesFilter.has(id)),
      );
    }

    if (dateRange !== "all") {
      const now = new Date();
      const cutoff = new Date();
      if (dateRange === "today") cutoff.setHours(0, 0, 0, 0);
      else if (dateRange === "week") cutoff.setDate(now.getDate() - 7);
      else if (dateRange === "month") cutoff.setMonth(now.getMonth() - 1);
      else if (dateRange === "quarter") cutoff.setMonth(now.getMonth() - 3);
      filtered = filtered.filter((l) => new Date(l.createdAt) >= cutoff);
    }

    return filtered;
  }, [
    allLeads,
    searchValue,
    statusFilter,
    sourceFilter,
    assignedFilter,
    servicesFilter,
    dateRange,
    currentUser?.id,
  ]);

  const pages = Math.max(1, Math.ceil(filteredLeads.length / rowsPerPage));

  const paginatedLeads = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredLeads.slice(start, start + rowsPerPage);
  }, [filteredLeads, page, rowsPerPage]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (!statusFilter.has("all")) count++;
    if (!sourceFilter.has("all")) count++;
    if (!assignedFilter.has("all")) count++;
    if (!servicesFilter.has("all")) count++;
    if (dateRange !== "all") count++;
    return count;
  }, [statusFilter, sourceFilter, assignedFilter, servicesFilter, dateRange]);

  const stats = useMemo(() => {
    // Lead-focused stats (based on filtered leads)
    const totalLeads = filteredLeads.length;
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    const newThisWeek = filteredLeads.filter(
      (l) => new Date(l.createdAt) >= weekAgo,
    ).length;
    const assignedCount = filteredLeads.filter((l) => !!l.assignedTo).length;
    const unassignedCount = filteredLeads.filter((l) => !l.assignedTo).length;
    return { totalLeads, newThisWeek, assignedCount, unassignedCount };
  }, [filteredLeads]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const clearAllFilters = () => {
    setStatusFilter(new Set(["all"]));
    setSourceFilter(new Set(["all"]));
    setAssignedFilter(new Set(["all"]));
    setServicesFilter(new Set(["all"]));
    setDateRange("all");
  };

  const openDeleteModal = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDeleteModalOpen(true);
  };

  // ── API handlers ───────────────────────────────────────────────────────────

  const handleDeleteLead = async () => {
    if (!selectedLead) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(
        `/api/leads/${selectedLead.id}?companyId=${currentUser?.companyId}`,
        {
          method: "DELETE",
        },
      );
      if (res.ok) {
        await refetchLeads();
        setIsDeleteModalOpen(false);
        setSelectedLead(null);
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

  const handleConvertToDeal = async (lead: Lead) => {
    try {
      const res = await fetch(`/api/leads/${lead.id}/convert`, {
        method: "POST",
      });
      if (res.ok) {
        const { dealId } = await res.json();
        router.push(`/deals/${dealId}`);
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (lead: Lead, status: LeadStatus) => {
    try {
      await fetch(`/api/leads/${lead.id}?companyId=${currentUser?.companyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await refetchLeads();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkAction = async (action: string) => {
    const ids = Array.from(selectedKeys);
    if (!ids.length) return;

    switch (action) {
      case "delete":
        setIsBulkDeleteModalOpen(true);
        break;

      case "email": {
        const emails = allLeads
          .filter((l: Lead) => ids.includes(l.id))
          .map((l: Lead) => l.email)
          .filter(Boolean)
          .join(",");
        window.location.href = `mailto:${emails}`;
        break;
      }

      case "status":
        setIsBulkStatusModalOpen(true);
        break;

      case "assign":
        setIsBulkAssignModalOpen(true);
        break;
    }
  };

  const performBulkDelete = async () => {
    const ids = Array.from(selectedKeys);
    if (!ids.length) return;
    setIsBulkSubmitting(true);
    try {
      const idsParam = ids.join(",");
      const response = await fetch(
        `/api/leads/${idsParam}?companyId=${currentUser?.companyId}`,
        { method: "DELETE" },
      );
      if (!response.ok) throw new Error("Failed to delete");
      await refetchLeads();
      setSelectedKeys(new Set());
      setIsBulkDeleteModalOpen(false);
    } catch (error) {
      console.error("Bulk Delete Error:", error);
      alert("Something went wrong during deletion.");
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  const performBulkAssign = async () => {
    const ids = Array.from(selectedKeys);
    if (!ids.length || !bulkAssignUserId) return;
    setIsBulkSubmitting(true);
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/leads/${id}?companyId=${currentUser?.companyId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ assignedTo: bulkAssignUserId }),
          }),
        ),
      );
      await refetchLeads();
      setSelectedKeys(new Set());
      setIsBulkAssignModalOpen(false);
      setBulkAssignUserId(null);
    } catch (error) {
      console.error("Bulk Assign Error:", error);
      alert("Something went wrong during assign.");
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  const performBulkStatusChange = async () => {
    const ids = Array.from(selectedKeys);
    if (!ids.length || !bulkNewStatus) return;
    setIsBulkSubmitting(true);
    try {
      const idsParam = ids.join(",");
      const response = await fetch(
        `/api/leads/${idsParam}?companyId=${currentUser?.companyId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: bulkNewStatus }),
        },
      );
      if (!response.ok) throw new Error("Failed to delete");
      await refetchLeads();
      setSelectedKeys(new Set());
      setIsBulkStatusModalOpen(false);
      setBulkNewStatus(null);
    } catch (error) {
      console.error("Bulk Status Error:", error);
      alert("Something went wrong during status update.");
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  const handleExport = () => {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Status",
      "Source",
      "Created At",
    ];
    const rows = filteredLeads.map((l: Lead) => [
      l.name,
      l.email,
      l.phone,
      l.status,
      l.source,
      formatDate(l.createdAt),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Loading ────────────────────────────────────────────────────────────────

  if (leadsLoading || allUserLoading || servicesLoading) {
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

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 ">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 relative">
        <div className="flex justify-between items-center ">
          <div className="flex gap-5 justify-center items-center">
            <Target size={30} />

            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                Leads
              </h1>
              <p className="text-default-500 mt-1">
                Manage and track all your leads ({filteredLeads.length} total)
              </p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant="flat"
              radius="full"
              color="primary"
              startContent={<RefreshCcw size={18} />}
              onPress={() => refetchLeads()}
            >
              Refresh
            </Button>
            <Button
              variant="flat"
              radius="full"
              startContent={<Upload size={18} />}
            >
              Import
            </Button>
            <Button
              variant="flat"
              radius="full"
              startContent={<Download size={18} />}
              onPress={handleExport}
            >
              Export
            </Button>
            <Button
              color="primary"
              radius="full"
              startContent={<Plus size={18} />}
              onPress={() => router.push("/leads/new")}
            >
              Add Lead
            </Button>
          </div>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card radius="sm">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-default-500">Total Leads</p>
                  <p className="text-2xl font-bold">
                    {stats.totalLeads.toLocaleString()}
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
                  <p className="text-sm text-default-500">New This Week</p>
                  <p className="text-2xl font-bold">{stats.newThisWeek}</p>
                </div>
                <div className="bg-secondary-100 p-3 rounded-full">
                  <Clock className="text-secondary-600" size={24} />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card radius="sm">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-default-500">Assigned</p>
                  <p className="text-2xl font-bold">{stats.assignedCount}</p>
                </div>
                <div className="bg-success-100 p-3 rounded-full">
                  <UserPlus className="text-success-600" size={24} />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card radius="sm">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-default-500">Unassigned</p>
                  <p className="text-2xl font-bold">{stats.unassignedCount}</p>
                </div>
                <div className="bg-warning-100 p-3 rounded-full">
                  <Target className="text-warning-600" size={24} />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* ── Search & Quick Filters ── */}
        <Card radius="sm">
          <CardBody>
            <div className="flex flex-col lg:flex-row gap-4 ">
              <Input
                className="flex-1"
                placeholder="Search leads by name, email, or phone…"
                label="Search any lead"
                startContent={<Search size={18} className="text-default-400" />}
                value={searchValue}
                onValueChange={setSearchValue}
                isClearable
                radius="sm"
                onClear={() => setSearchValue("")}
              />

              <div className="flex gap-2 flex-wrap">
                <Select
                  label="Status"
                  placeholder="All statuses"
                  className="w-40"
                  radius="sm"
                  selectedKeys={statusFilter}
                  onSelectionChange={(keys) =>
                    handleMultiSelectToggle(
                      keys as Set<string>,
                      setStatusFilter,
                    )
                  }
                  selectionMode="multiple"
                >
                  <SelectItem key="all">All Statuses</SelectItem>
                  <SelectItem key="NEW">New</SelectItem>
                  <SelectItem key="CONTACTED">Contacted</SelectItem>
                  <SelectItem key="QUALIFIED">Qualified</SelectItem>
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
                      setAssignedFilter,
                    )
                  }
                  selectionMode="multiple"
                >
                  <SelectItem
                    key="all"
                    className="hover:bg-success/40! focus:bg-success/40!"
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
                        (u: User) =>
                          u.role === "SALES" && u.id !== currentUser?.id,
                      )
                      .map((user: User) => (
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

            {/* Advanced Filters */}
            {isFilterOpen && (
              <div className="mt-4 pt-4 border-t border-divider">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
                  <Select
                    label="Source"
                    placeholder="All sources"
                    selectedKeys={sourceFilter}
                    radius="sm"
                    onSelectionChange={(keys) =>
                      handleMultiSelectToggle(
                        keys as Set<string>,
                        setSourceFilter,
                      )
                    }
                    selectionMode="multiple"
                  >
                    <SelectItem key="all">All Sources</SelectItem>
                    <SelectItem key="Website">Website</SelectItem>
                    <SelectItem key="Referral">Referral</SelectItem>
                    <SelectItem key="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem key="Cold Email">Cold Email</SelectItem>
                    <SelectItem key="Trade Show">Trade Show</SelectItem>
                    <SelectItem key="Partner">Partner</SelectItem>
                    <SelectItem key="Advertisement">Advertisement</SelectItem>
                  </Select>

                  <Select
                    label="Services"
                    placeholder="All services"
                    selectedKeys={servicesFilter}
                    radius="sm"
                    onSelectionChange={(keys) =>
                      handleMultiSelectToggle(
                        keys as Set<string>,
                        setServicesFilter,
                      )
                    }
                    selectionMode="multiple"
                  >
                    <SelectItem key="all">All Services</SelectItem>
                    {allServices.map((s: Service) => (
                      <SelectItem key={s.id}>{s.name}</SelectItem>
                    ))}
                  </Select>

                  <Select
                    label="Date Range"
                    placeholder="All time"
                    radius="sm"
                    selectedKeys={new Set([dateRange])}
                    onSelectionChange={(keys) =>
                      setDateRange(Array.from(keys)[0] as string)
                    }
                  >
                    <SelectItem key="all">All Time</SelectItem>
                    <SelectItem key="today">Today</SelectItem>
                    <SelectItem key="week">This Week</SelectItem>
                    <SelectItem key="month">This Month</SelectItem>
                    <SelectItem key="quarter">This Quarter</SelectItem>
                  </Select>
                </div>
                <div className="flex justify-end mt-4">
                  <Button
                    size="sm"
                    variant="flat"
                    radius="full"
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

        {/* ── Bulk Actions ── */}
        {selectedKeys.size > 0 && (
          <Card
            className="bg-primary-50 border-1 border-primary fixed bottom-10 z-1 w-[90%] mx-auto left-0 right-10"
            radius="sm"
            shadow="md"
          >
            <CardBody>
              <div className="flex items-center justify-between ">
                <p className="font-semibold text-primary">
                  {selectedKeys.size} lead(s) selected
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="flat"
                    startContent={<UserPlus size={16} />}
                    onPress={() => handleBulkAction("assign")}
                  >
                    Assign
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    startContent={<Send size={16} />}
                    onPress={() => handleBulkAction("email")}
                  >
                    Send Email
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    startContent={<CheckCircle size={16} />}
                    onPress={() => handleBulkAction("status")}
                  >
                    Change Status
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    color="danger"
                    startContent={<Trash2 size={16} />}
                    onPress={() => handleBulkAction("delete")}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      {/* ── Table View ── */}
      <Table
        aria-label="Leads table"
        selectionMode="multiple"
        selectedKeys={selectedKeys}
        radius="sm"
        shadow="none"
        classNames={{
          wrapper: "bg-transparent",
          th: "border-b-2 border-default bg-transparent",
        }}
        onSelectionChange={(keys) => {
          const allowedIds = new Set(
            filteredLeads
              .filter(
                (l) =>
                  l.assignedTo === currentUser?.id ||
                  currentUser?.role === "ADMIN",
              )
              .map((l) => l.id),
          );
          const validSelection = new Set(
            Array.from(keys).filter((key) => allowedIds.has(key as string)),
          );
          setSelectedKeys(validSelection as Set<string>);
        }}
        bottomContent={
          <Card
            radius="sm"
            shadow="none"
            className="flex flex-row w-full justify-between items-center px-2 py-2 "
          >
            <div className="flex items-center gap-2">
              <span className="text-sm text-default-500">
                Showing{" "}
                {Math.min((page - 1) * rowsPerPage + 1, filteredLeads.length)}–
                {Math.min(page * rowsPerPage, filteredLeads.length)} of{" "}
                {filteredLeads.length} leads
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
          <TableColumn>LEAD</TableColumn>
          <TableColumn>CONTACT</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>SOURCE</TableColumn>
          <TableColumn>SERVICES</TableColumn>
          <TableColumn>ASSIGNED TO</TableColumn>
          <TableColumn>CREATED AT</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody emptyContent="No leads found.">
          {paginatedLeads.map((lead: Lead) => (
            <TableRow key={lead.id} className="cursor-pointer">
              <TableCell>
                <div>
                  <p className="font-semibold">{lead.name}</p>
                  {lead.companyName && (
                    <p className="text-xs text-default-500">
                      {lead.companyName}
                    </p>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <Mail size={12} className="text-default-400" />
                    <span>{lead.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Phone size={12} className="text-default-400" />
                    <span>{lead.phone}</span>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <Chip
                  size="sm"
                  variant="flat"
                  color={getStatusColor(lead.status)}
                >
                  {lead.status}
                </Chip>
              </TableCell>

              <TableCell>
                <Chip size="sm" variant="bordered">
                  {lead.source}
                </Chip>
              </TableCell>

              <TableCell>
                <div className="flex flex-col flex-wrap gap-1">
                  {(lead.services ?? []).length > 0 && lead.services ? (
                    <>
                      {lead.services.slice(0, 2).map((s: Service) => (
                        <Chip
                          key={s.id}
                          size="sm"
                          variant="flat"
                          color="secondary"
                        >
                          {s.name}
                        </Chip>
                      ))}
                      {lead.services.length > 2 && (
                        <Chip size="sm" variant="flat">
                          +{lead.services.length - 2}
                        </Chip>
                      )}
                    </>
                  ) : (
                    <span className="text-default-400 text-xs">—</span>
                  )}
                </div>
              </TableCell>

              <TableCell>
                {lead.user ? (
                  <UserComponent
                    name={lead.user.name}
                    avatarProps={{
                      src: lead.user.avatarUrl || lead.user.avatar,
                      size: "sm",
                    }}
                  />
                ) : (
                  <span className="text-default-400 text-sm">Unassigned</span>
                )}
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-1 text-xs text-default-500">
                  <Clock size={12} />
                  <span>{formatDate(lead.createdAt)}</span>
                </div>
              </TableCell>

              <TableCell>
                <Button
                  isIconOnly
                  aria-label="view-lead"
                  size="sm"
                  variant="light"
                  onPress={() => router.push(`/leads/${lead.id}`)}
                >
                  <Eye size={16} />
                </Button>

                {(currentUser?.role === "ADMIN" ||
                  (currentUser?.role === "SALES" &&
                    lead.assignedTo === currentUser?.id)) && (
                  <>
                    <Button
                      isIconOnly
                      size="sm"
                      aria-label="edit-lead"
                      variant="light"
                      onPress={() => router.push(`/leads/${lead.id}/edit`)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="light">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Lead actions">
                        <DropdownItem
                          key="email"
                          startContent={<Mail size={16} />}
                          onPress={() => {
                            window.location.href = `mailto:${lead.email}`;
                          }}
                        >
                          Send Email
                        </DropdownItem>
                        <DropdownItem
                          key="call"
                          startContent={<Phone size={16} />}
                          onPress={() => {
                            window.location.href = `tel:${lead.phone}`;
                          }}
                        >
                          Schedule Call
                        </DropdownItem>

                        {lead.status === "NEW" ? (
                          <DropdownItem
                            key="mark-contacted"
                            startContent={<CheckCircle size={16} />}
                            onPress={() =>
                              handleStatusChange(lead, "CONTACTED")
                            }
                          >
                            Mark as Contacted
                          </DropdownItem>
                        ) : null}
                        {lead.status === "CONTACTED" ? (
                          <DropdownItem
                            key="mark-qualified"
                            startContent={<CheckCircle size={16} />}
                            onPress={() =>
                              handleStatusChange(lead, "QUALIFIED")
                            }
                          >
                            Mark as Qualified
                          </DropdownItem>
                        ) : null}

                        {lead.status === "QUALIFIED" ? (
                          <DropdownItem
                            key="mark-contacted"
                            startContent={<CheckCircle size={16} />}
                            onPress={() =>
                              handleStatusChange(lead, "CONTACTED")
                            }
                          >
                            Mark as Contacted
                          </DropdownItem>
                        ) : null}

                        <DropdownItem
                          key="convert"
                          startContent={<TrendingUp size={16} />}
                          onPress={() => handleConvertToDeal(lead)}
                        >
                          Convert to Deal
                        </DropdownItem>

                        <DropdownItem
                          key="delete"
                          color="danger"
                          startContent={<Trash2 size={16} />}
                          onPress={() => openDeleteModal(lead)}
                        >
                          Delete Lead
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
      {/* ── Delete Confirmation Modal ── */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        size="sm"
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader>Delete Lead</ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to delete{" "}
              <strong>{selectedLead?.name}</strong>? This action cannot be
              undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              radius="full"
              onPress={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              radius="full"
              onPress={handleDeleteLead}
              isLoading={isSubmitting}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Bulk Delete Modal */}
      <Modal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        size="sm"
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader>Delete Selected Leads</ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to delete{" "}
              <strong>{selectedKeys.size}</strong> lead(s)? This action cannot
              be undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              radius="full"
              onPress={() => setIsBulkDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              radius="full"
              onPress={performBulkDelete}
              isLoading={isBulkSubmitting}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Bulk Assign Modal */}
      <Modal
        isOpen={isBulkAssignModalOpen}
        onClose={() => setIsBulkAssignModalOpen(false)}
        size="sm"
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader>Assign Leads</ModalHeader>
          <ModalBody>
            <Select
              label="Assign To"
              placeholder="Select user"
              selectedKeys={
                bulkAssignUserId ? new Set([bulkAssignUserId]) : new Set()
              }
              onSelectionChange={(keys) =>
                setBulkAssignUserId(Array.from(keys)[0] as string)
              }
            >
              <SelectItem key="">Select user</SelectItem>
              <>
                {allUsers
                  .filter((u: User) => u.role === "SALES")
                  .map((user: User) => (
                    <SelectItem key={user.id}>{user.name}</SelectItem>
                  ))}
              </>
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              radius="full"
              onPress={() => setIsBulkAssignModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              radius="full"
              onPress={performBulkAssign}
              isLoading={isBulkSubmitting}
              disabled={!bulkAssignUserId}
            >
              Assign
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Bulk Status Modal */}
      <Modal
        isOpen={isBulkStatusModalOpen}
        onClose={() => setIsBulkStatusModalOpen(false)}
        size="sm"
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader>Change Status</ModalHeader>
          <ModalBody>
            <Select
              label="New Status"
              placeholder="Select status"
              selectedKeys={
                bulkNewStatus ? new Set([bulkNewStatus]) : new Set()
              }
              onSelectionChange={(keys) =>
                setBulkNewStatus(Array.from(keys)[0] as LeadStatus)
              }
            >
              <SelectItem key="NEW">New</SelectItem>
              <SelectItem key="CONTACTED">Contacted</SelectItem>
              <SelectItem key="QUALIFIED">Qualified</SelectItem>
              <SelectItem key="LOST">Lost</SelectItem>
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              radius="full"
              onPress={() => setIsBulkStatusModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              radius="full"
              onPress={performBulkStatusChange}
              isLoading={isBulkSubmitting}
              disabled={!bulkNewStatus}
            >
              Change Status
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
