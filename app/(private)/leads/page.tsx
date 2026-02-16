"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Avatar,
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
  DatePicker,
  Tabs,
  Tab,
  Tooltip,
  Checkbox,
  CheckboxGroup,
  User as UserComponent,
  Badge,
  Divider,
} from "@heroui/react";
import {
  Search,
  Plus,
  Filter,
  Download,
  Upload,
  MoreVertical,
  Edit,
  Trash2,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  ChevronDown,
  X,
  FileText,
  Clock,
  TrendingUp,
  Grid,
  List,
  SlidersHorizontal,
  Eye,
  Send,
  CheckCircle,
  XCircle,
  Archive,
  Copy,
  ExternalLink,
  DollarSign,
} from "lucide-react";

// Types
type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "LOST";
type Priority = "LOW" | "MEDIUM" | "HIGH";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyName?: string;
  status: LeadStatus;
  source: string;
  priority: Priority;
  assignedTo?: {
    id: string;
    name: string;
    avatar?: string;
  };
  value?: number;
  tags?: string[];
  lastContact?: string;
  createdAt: string;
  notes?: string;
}

interface LeadsPageProps {
  companyId: string;
  userId: string;
  userRole: "ADMIN" | "MANAGER" | "SALES" | "SUPPORT";
}

export default function LeadsPage({
  companyId,
  userId,
  userRole,
}: LeadsPageProps) {
  // State
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [searchValue, setSearchValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set([]));
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<Set<string>>(
    new Set(["all"]),
  );
  const [sourceFilter, setSourceFilter] = useState<Set<string>>(
    new Set(["all"]),
  );
  const [assignedFilter, setAssignedFilter] = useState<Set<string>>(
    new Set(["all"]),
  );
  const [priorityFilter, setPriorityFilter] = useState<Set<string>>(
    new Set(["all"]),
  );
  const [dateRange, setDateRange] = useState<string>("all");

  // Form state for new/edit lead
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    status: "NEW" as LeadStatus,
    source: "",
    priority: "MEDIUM" as Priority,
    assignedTo: "",
    value: "",
    notes: "",
  });

  // Mock data - replace with API calls
  const mockLeads: Lead[] = [
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah.j@acmecorp.com",
      phone: "+1 234 567 8900",
      companyName: "Acme Corporation",
      status: "NEW",
      source: "Website",
      priority: "HIGH",
      assignedTo: { id: "1", name: "John Doe", avatar: "/avatars/john.jpg" },
      value: 50000,
      tags: ["Enterprise", "Hot Lead"],
      lastContact: "2 hours ago",
      createdAt: "2024-06-15T10:30:00",
      notes: "Interested in enterprise plan",
    },
    {
      id: "2",
      name: "Michael Chen",
      email: "m.chen@techstart.io",
      phone: "+1 234 567 8901",
      companyName: "TechStart Inc",
      status: "CONTACTED",
      source: "Referral",
      priority: "MEDIUM",
      assignedTo: { id: "2", name: "Jane Smith" },
      value: 25000,
      tags: ["Startup"],
      lastContact: "1 day ago",
      createdAt: "2024-06-14T14:20:00",
    },
    {
      id: "3",
      name: "Emily Rodriguez",
      email: "emily.r@business.com",
      phone: "+1 234 567 8902",
      companyName: "Business Solutions Ltd",
      status: "QUALIFIED",
      source: "LinkedIn",
      priority: "HIGH",
      assignedTo: { id: "1", name: "John Doe" },
      value: 75000,
      tags: ["Enterprise", "Decision Maker"],
      lastContact: "3 hours ago",
      createdAt: "2024-06-13T09:15:00",
    },
    {
      id: "4",
      name: "David Kim",
      email: "david.k@startup.io",
      phone: "+1 234 567 8903",
      companyName: "Startup.io",
      status: "NEW",
      source: "Cold Email",
      priority: "LOW",
      assignedTo: { id: "2", name: "Jane Smith" },
      value: 15000,
      tags: ["SMB"],
      lastContact: "Never",
      createdAt: "2024-06-12T16:45:00",
    },
    {
      id: "5",
      name: "Lisa Thompson",
      email: "lisa.t@enterprise.com",
      phone: "+1 234 567 8904",
      companyName: "Enterprise Systems",
      status: "CONTACTED",
      source: "Trade Show",
      priority: "HIGH",
      assignedTo: { id: "1", name: "John Doe" },
      value: 100000,
      tags: ["Enterprise", "Warm"],
      lastContact: "5 hours ago",
      createdAt: "2024-06-11T11:30:00",
    },
    // Add more mock data for pagination demo
    ...Array.from({ length: 25 }, (_, i) => ({
      id: `${i + 6}`,
      name: `Lead ${i + 6}`,
      email: `lead${i + 6}@company.com`,
      phone: `+1 234 567 ${8900 + i}`,
      companyName: `Company ${i + 6}`,
      status: ["NEW", "CONTACTED", "QUALIFIED", "LOST"][i % 4] as LeadStatus,
      source: ["Website", "Referral", "LinkedIn", "Cold Email"][i % 4],
      priority: ["LOW", "MEDIUM", "HIGH"][i % 3] as Priority,
      assignedTo: {
        id: `${(i % 2) + 1}`,
        name: i % 2 === 0 ? "John Doe" : "Jane Smith",
      },
      value: Math.floor(Math.random() * 100000),
      tags: ["Tag1", "Tag2"],
      lastContact: `${i + 1} days ago`,
      createdAt: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
    })),
  ];

  const teamMembers = [
    { id: "1", name: "John Doe", avatar: "/avatars/john.jpg" },
    { id: "2", name: "Jane Smith", avatar: "/avatars/jane.jpg" },
    { id: "3", name: "Mike Wilson", avatar: "/avatars/mike.jpg" },
  ];

  const sources = [
    "Website",
    "Referral",
    "LinkedIn",
    "Cold Email",
    "Trade Show",
    "Partner",
    "Advertisement",
  ];

  // Filtered and paginated data
  const filteredLeads = useMemo(() => {
    let filtered = [...mockLeads];

    // Search filter
    if (searchValue) {
      filtered = filtered.filter(
        (lead) =>
          lead.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          lead.email.toLowerCase().includes(searchValue.toLowerCase()) ||
          lead.companyName?.toLowerCase().includes(searchValue.toLowerCase()) ||
          lead.phone.includes(searchValue),
      );
    }

    // Status filter
    if (!statusFilter.has("all")) {
      filtered = filtered.filter((lead) => statusFilter.has(lead.status));
    }

    // Source filter
    if (!sourceFilter.has("all")) {
      filtered = filtered.filter((lead) => sourceFilter.has(lead.source));
    }

    // Assigned filter
    if (!assignedFilter.has("all")) {
      filtered = filtered.filter(
        (lead) => lead.assignedTo && assignedFilter.has(lead.assignedTo.id),
      );
    }

    // Priority filter
    if (!priorityFilter.has("all")) {
      filtered = filtered.filter((lead) => priorityFilter.has(lead.priority));
    }

    return filtered;
  }, [
    mockLeads,
    searchValue,
    statusFilter,
    sourceFilter,
    assignedFilter,
    priorityFilter,
  ]);

  const pages = Math.ceil(filteredLeads.length / rowsPerPage);
  const paginatedLeads = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredLeads.slice(start, end);
  }, [filteredLeads, page, rowsPerPage]);

  // Helper functions
  const getStatusColor = (status: LeadStatus) => {
    const colors = {
      NEW: "primary",
      CONTACTED: "secondary",
      QUALIFIED: "success",
      LOST: "danger",
    };
    return colors[status];
  };

  const getPriorityColor = (priority: Priority) => {
    const colors = {
      LOW: "success",
      MEDIUM: "warning",
      HIGH: "danger",
    };
    return colors[priority];
  };

  const formatCurrency = (value?: number) => {
    if (!value) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleAddLead = () => {
    console.log("Adding lead:", formData);
    // API call to create lead
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditLead = () => {
    console.log("Editing lead:", selectedLead?.id, formData);
    // API call to update lead
    setIsEditModalOpen(false);
    resetForm();
  };

  const handleDeleteLead = () => {
    console.log("Deleting lead:", selectedLead?.id);
    // API call to delete lead
    setIsDeleteModalOpen(false);
    setSelectedLead(null);
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on leads:`, Array.from(selectedKeys));
    // Handle bulk actions
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      companyName: "",
      status: "NEW",
      source: "",
      priority: "MEDIUM",
      assignedTo: "",
      value: "",
      notes: "",
    });
  };

  const openEditModal = (lead: Lead) => {
    setSelectedLead(lead);
    setFormData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      companyName: lead.companyName || "",
      status: lead.status,
      source: lead.source,
      priority: lead.priority,
      assignedTo: lead.assignedTo?.id || "",
      value: lead.value?.toString() || "",
      notes: lead.notes || "",
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDeleteModalOpen(true);
  };

  const clearAllFilters = () => {
    setStatusFilter(new Set(["all"]));
    setSourceFilter(new Set(["all"]));
    setAssignedFilter(new Set(["all"]));
    setPriorityFilter(new Set(["all"]));
    setDateRange("all");
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (!statusFilter.has("all")) count++;
    if (!sourceFilter.has("all")) count++;
    if (!assignedFilter.has("all")) count++;
    if (!priorityFilter.has("all")) count++;
    if (dateRange !== "all") count++;
    return count;
  }, [statusFilter, sourceFilter, assignedFilter, priorityFilter, dateRange]);

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Leads</h1>
            <p className="text-default-500 mt-1">
              Manage and track all your leads ({filteredLeads.length} total)
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="flat" startContent={<Upload size={18} />}>
              Import
            </Button>
            <Button variant="flat" startContent={<Download size={18} />}>
              Export
            </Button>
            <Button
              color="primary"
              startContent={<Plus size={18} />}
              onPress={() => setIsAddModalOpen(true)}
            >
              Add Lead
            </Button>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <Card>
          <CardBody>
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <Input
                className="flex-1"
                placeholder="Search leads by name, email, company, or phone..."
                startContent={<Search size={18} className="text-default-400" />}
                value={searchValue}
                onValueChange={setSearchValue}
                isClearable
                onClear={() => setSearchValue("")}
              />

              {/* Quick Filters */}
              <div className="flex gap-2">
                <Select
                  label="Status"
                  placeholder="All statuses"
                  className="w-40"
                  selectedKeys={statusFilter}
                  onSelectionChange={(keys) =>
                    setStatusFilter(keys as Set<string>)
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
                  selectedKeys={assignedFilter}
                  onSelectionChange={(keys) =>
                    setAssignedFilter(keys as Set<string>)
                  }
                  selectionMode="multiple"
                >
                  <SelectItem key="all">All Users</SelectItem>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id}>{member.name}</SelectItem>
                  ))}
                </Select>

                <Button
                  variant={activeFiltersCount > 0 ? "flat" : "light"}
                  color={activeFiltersCount > 0 ? "primary" : "default"}
                  startContent={<SlidersHorizontal size={18} />}
                  onPress={() => setIsFilterOpen(!isFilterOpen)}
                >
                  Filters
                  {activeFiltersCount > 0 && (
                    <Chip size="sm" color="primary" variant="flat">
                      {activeFiltersCount}
                    </Chip>
                  )}
                </Button>

                <div className="flex border-2 border-default-200 rounded-lg">
                  <Button
                    isIconOnly
                    variant={viewMode === "table" ? "flat" : "light"}
                    onPress={() => setViewMode("table")}
                    className="rounded-r-none"
                  >
                    <List size={18} />
                  </Button>
                  <Button
                    isIconOnly
                    variant={viewMode === "grid" ? "flat" : "light"}
                    onPress={() => setViewMode("grid")}
                    className="rounded-l-none"
                  >
                    <Grid size={18} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            {isFilterOpen && (
              <div className="mt-4 pt-4 border-t border-divider">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    label="Source"
                    placeholder="All sources"
                    selectedKeys={sourceFilter}
                    onSelectionChange={(keys) =>
                      setSourceFilter(keys as Set<string>)
                    }
                    selectionMode="multiple"
                  >
                    <SelectItem key="all">All Sources</SelectItem>
                    {sources.map((source) => (
                      <SelectItem key={source}>{source}</SelectItem>
                    ))}
                  </Select>

                  <Select
                    label="Priority"
                    placeholder="All priorities"
                    selectedKeys={priorityFilter}
                    onSelectionChange={(keys) =>
                      setPriorityFilter(keys as Set<string>)
                    }
                    selectionMode="multiple"
                  >
                    <SelectItem key="all">All Priorities</SelectItem>
                    <SelectItem key="LOW">Low</SelectItem>
                    <SelectItem key="MEDIUM">Medium</SelectItem>
                    <SelectItem key="HIGH">High</SelectItem>
                  </Select>

                  <Select
                    label="Date Range"
                    placeholder="All time"
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
                  <Button size="sm" variant="flat" onPress={clearAllFilters}>
                    Clear All Filters
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Bulk Actions */}
        {selectedKeys.size > 0 && (
          <Card className="bg-primary-50 border-primary-200">
            <CardBody>
              <div className="flex items-center justify-between">
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

      {/* Table View */}
      {viewMode === "table" ? (
        <Card>
          <CardBody className="p-0">
            <Table
              aria-label="Leads table"
              selectionMode="multiple"
              selectedKeys={selectedKeys}
              onSelectionChange={(keys) => setSelectedKeys(keys as Set<string>)}
              bottomContent={
                <div className="flex w-full justify-between items-center px-2 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-default-500">
                      Showing {(page - 1) * rowsPerPage + 1} to{" "}
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
                </div>
              }
            >
              <TableHeader>
                <TableColumn>LEAD</TableColumn>
                <TableColumn>CONTACT</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>PRIORITY</TableColumn>
                <TableColumn>SOURCE</TableColumn>
                <TableColumn>VALUE</TableColumn>
                <TableColumn>ASSIGNED TO</TableColumn>
                <TableColumn>LAST CONTACT</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{lead.name}</p>
                        {lead.companyName && (
                          <p className="text-xs text-default-500">
                            {lead.companyName}
                          </p>
                        )}
                        {lead.tags && lead.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {lead.tags.map((tag) => (
                              <Chip key={tag} size="sm" variant="flat">
                                {tag}
                              </Chip>
                            ))}
                          </div>
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
                        color={getStatusColor(lead.status) as any}
                      >
                        {lead.status}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        variant="dot"
                        color={getPriorityColor(lead.priority) as any}
                      >
                        {lead.priority}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" variant="bordered">
                        {lead.source}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">
                        {formatCurrency(lead.value)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {lead.assignedTo ? (
                        <UserComponent
                          name={lead.assignedTo.name}
                          avatarProps={{
                            src: lead.assignedTo.avatar,
                            size: "sm",
                          }}
                        />
                      ) : (
                        <span className="text-default-400 text-sm">
                          Unassigned
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs text-default-500">
                        <Clock size={12} />
                        <span>{lead.lastContact}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button isIconOnly size="sm" variant="light">
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Lead actions">
                          <DropdownItem
                            key="view"
                            startContent={<Eye size={16} />}
                          >
                            View Details
                          </DropdownItem>
                          <DropdownItem
                            key="edit"
                            startContent={<Edit size={16} />}
                            onPress={() => openEditModal(lead)}
                          >
                            Edit Lead
                          </DropdownItem>
                          <DropdownItem
                            key="email"
                            startContent={<Mail size={16} />}
                          >
                            Send Email
                          </DropdownItem>
                          <DropdownItem
                            key="call"
                            startContent={<Phone size={16} />}
                          >
                            Schedule Call
                          </DropdownItem>
                          <DropdownItem
                            key="convert"
                            startContent={<TrendingUp size={16} />}
                          >
                            Convert to Deal
                          </DropdownItem>
                          <DropdownItem
                            key="duplicate"
                            startContent={<Copy size={16} />}
                          >
                            Duplicate
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      ) : (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedLeads.map((lead) => (
            <Card key={lead.id} isPressable>
              <CardBody className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{lead.name}</h3>
                    {lead.companyName && (
                      <p className="text-sm text-default-500">
                        {lead.companyName}
                      </p>
                    )}
                  </div>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button isIconOnly size="sm" variant="light">
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu>
                      <DropdownItem
                        key="edit"
                        onPress={() => openEditModal(lead)}
                      >
                        Edit
                      </DropdownItem>
                      <DropdownItem
                        key="delete"
                        color="danger"
                        onPress={() => openDeleteModal(lead)}
                      >
                        Delete
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={14} className="text-default-400" />
                    <span className="truncate">{lead.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={14} className="text-default-400" />
                    <span>{lead.phone}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <Chip
                    size="sm"
                    color={getStatusColor(lead.status) as any}
                    variant="flat"
                  >
                    {lead.status}
                  </Chip>
                  <Chip
                    size="sm"
                    color={getPriorityColor(lead.priority) as any}
                    variant="dot"
                  >
                    {lead.priority}
                  </Chip>
                  <Chip size="sm" variant="bordered">
                    {lead.source}
                  </Chip>
                </div>

                {lead.tags && lead.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {lead.tags.map((tag) => (
                      <Chip key={tag} size="sm" variant="flat">
                        {tag}
                      </Chip>
                    ))}
                  </div>
                )}

                <Divider className="my-3" />

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-default-500">Value</p>
                    <p className="font-semibold">
                      {formatCurrency(lead.value)}
                    </p>
                  </div>
                  {lead.assignedTo && (
                    <Avatar
                      name={lead.assignedTo.name}
                      src={lead.assignedTo.avatar}
                      size="sm"
                    />
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Add Lead Modal */}
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
          <ModalHeader>Add New Lead</ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="Enter lead name"
                isRequired
                value={formData.name}
                onValueChange={(value) =>
                  setFormData({ ...formData, name: value })
                }
              />
              <Input
                label="Email"
                type="email"
                placeholder="email@example.com"
                isRequired
                value={formData.email}
                onValueChange={(value) =>
                  setFormData({ ...formData, email: value })
                }
              />
              <Input
                label="Phone"
                type="tel"
                placeholder="+1 234 567 8900"
                value={formData.phone}
                onValueChange={(value) =>
                  setFormData({ ...formData, phone: value })
                }
              />
              <Input
                label="Company Name"
                placeholder="Company name"
                value={formData.companyName}
                onValueChange={(value) =>
                  setFormData({ ...formData, companyName: value })
                }
              />
              <Select
                label="Status"
                selectedKeys={new Set([formData.status])}
                onSelectionChange={(keys) =>
                  setFormData({
                    ...formData,
                    status: Array.from(keys)[0] as LeadStatus,
                  })
                }
              >
                <SelectItem key="NEW">New</SelectItem>
                <SelectItem key="CONTACTED">Contacted</SelectItem>
                <SelectItem key="QUALIFIED">Qualified</SelectItem>
                <SelectItem key="LOST">Lost</SelectItem>
              </Select>
              <Select
                label="Source"
                placeholder="Select source"
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
                {sources.map((source) => (
                  <SelectItem key={source}>{source}</SelectItem>
                ))}
              </Select>
              <Select
                label="Priority"
                selectedKeys={new Set([formData.priority])}
                onSelectionChange={(keys) =>
                  setFormData({
                    ...formData,
                    priority: Array.from(keys)[0] as Priority,
                  })
                }
              >
                <SelectItem key="LOW">Low</SelectItem>
                <SelectItem key="MEDIUM">Medium</SelectItem>
                <SelectItem key="HIGH">High</SelectItem>
              </Select>
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
                    assignedTo: Array.from(keys)[0] as string,
                  })
                }
              >
                {teamMembers.map((member) => (
                  <SelectItem key={member.id}>{member.name}</SelectItem>
                ))}
              </Select>
              <Input
                label="Estimated Value"
                type="number"
                placeholder="50000"
                startContent={<DollarSign size={16} />}
                value={formData.value}
                onValueChange={(value) => setFormData({ ...formData, value })}
              />
            </div>
            <Textarea
              label="Notes"
              placeholder="Add any additional notes..."
              className="mt-4"
              value={formData.notes}
              onValueChange={(value) =>
                setFormData({ ...formData, notes: value })
              }
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
            <Button color="primary" onPress={handleAddLead}>
              Add Lead
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Lead Modal */}
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
          <ModalHeader>Edit Lead</ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="Enter lead name"
                isRequired
                value={formData.name}
                onValueChange={(value) =>
                  setFormData({ ...formData, name: value })
                }
              />
              <Input
                label="Email"
                type="email"
                placeholder="email@example.com"
                isRequired
                value={formData.email}
                onValueChange={(value) =>
                  setFormData({ ...formData, email: value })
                }
              />
              <Input
                label="Phone"
                type="tel"
                placeholder="+1 234 567 8900"
                value={formData.phone}
                onValueChange={(value) =>
                  setFormData({ ...formData, phone: value })
                }
              />
              <Input
                label="Company Name"
                placeholder="Company name"
                value={formData.companyName}
                onValueChange={(value) =>
                  setFormData({ ...formData, companyName: value })
                }
              />
              <Select
                label="Status"
                selectedKeys={new Set([formData.status])}
                onSelectionChange={(keys) =>
                  setFormData({
                    ...formData,
                    status: Array.from(keys)[0] as LeadStatus,
                  })
                }
              >
                <SelectItem key="NEW">New</SelectItem>
                <SelectItem key="CONTACTED">Contacted</SelectItem>
                <SelectItem key="QUALIFIED">Qualified</SelectItem>
                <SelectItem key="LOST">Lost</SelectItem>
              </Select>
              <Select
                label="Source"
                placeholder="Select source"
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
                {sources.map((source) => (
                  <SelectItem key={source}>{source}</SelectItem>
                ))}
              </Select>
              <Select
                label="Priority"
                selectedKeys={new Set([formData.priority])}
                onSelectionChange={(keys) =>
                  setFormData({
                    ...formData,
                    priority: Array.from(keys)[0] as Priority,
                  })
                }
              >
                <SelectItem key="LOW">Low</SelectItem>
                <SelectItem key="MEDIUM">Medium</SelectItem>
                <SelectItem key="HIGH">High</SelectItem>
              </Select>
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
                    assignedTo: Array.from(keys)[0] as string,
                  })
                }
              >
                {teamMembers.map((member) => (
                  <SelectItem key={member.id}>{member.name}</SelectItem>
                ))}
              </Select>
              <Input
                label="Estimated Value"
                type="number"
                placeholder="50000"
                startContent={<DollarSign size={16} />}
                value={formData.value}
                onValueChange={(value) => setFormData({ ...formData, value })}
              />
            </div>
            <Textarea
              label="Notes"
              placeholder="Add any additional notes..."
              className="mt-4"
              value={formData.notes}
              onValueChange={(value) =>
                setFormData({ ...formData, notes: value })
              }
            />
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
            <Button color="primary" onPress={handleEditLead}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        size="sm"
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
            <Button variant="light" onPress={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button color="danger" onPress={handleDeleteLead}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
