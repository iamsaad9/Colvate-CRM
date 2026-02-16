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
  User as UserComponent,
  Progress,
  Tabs,
  Tab,
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
  Grid,
  List,
  SlidersHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Building2,
  ArrowRight,
  Target,
} from "lucide-react";

// Types
type DealStage = "PROSPECT" | "NEGOTIATION" | "WON" | "LOST";

interface Deal {
  id: string;
  title: string;
  customer: {
    id: string;
    name: string;
    company?: string;
  };
  value: number;
  stage: DealStage;
  expectedCloseDate?: string;
  probability: number;
  assignedTo?: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  notes?: string;
  tags?: string[];
}

interface DealsPageProps {
  companyId: string;
  userId: string;
  userRole: "ADMIN" | "MANAGER" | "SALES" | "SUPPORT";
}

export default function DealsPage({
  companyId,
  userId,
  userRole,
}: DealsPageProps) {
  const [viewMode, setViewMode] = useState<"table" | "pipeline">("pipeline");
  const [searchValue, setSearchValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set([]));
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  // Filters
  const [stageFilter, setStageFilter] = useState<Set<string>>(new Set(["all"]));
  const [assignedFilter, setAssignedFilter] = useState<Set<string>>(
    new Set(["all"]),
  );
  const [valueFilter, setValueFilter] = useState<string>("all");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    customerId: "",
    value: "",
    stage: "PROSPECT" as DealStage,
    expectedCloseDate: "",
    probability: "25",
    assignedTo: "",
    notes: "",
  });

  // Mock data
  const mockDeals: Deal[] = [
    {
      id: "1",
      title: "Enterprise License Deal",
      customer: { id: "1", name: "Acme Corporation", company: "Acme Corp" },
      value: 150000,
      stage: "NEGOTIATION",
      expectedCloseDate: "2024-07-15",
      probability: 75,
      assignedTo: { id: "1", name: "John Doe" },
      createdAt: "2024-05-10T10:30:00",
      updatedAt: "2024-06-12T14:20:00",
      tags: ["Enterprise", "High Priority"],
    },
    {
      id: "2",
      title: "Annual Subscription",
      customer: { id: "2", name: "TechStart Inc", company: "TechStart" },
      value: 45000,
      stage: "PROSPECT",
      expectedCloseDate: "2024-08-01",
      probability: 25,
      assignedTo: { id: "2", name: "Jane Smith" },
      createdAt: "2024-06-01T09:15:00",
      updatedAt: "2024-06-10T11:30:00",
      tags: ["Startup"],
    },
    {
      id: "3",
      title: "Professional Services Contract",
      customer: { id: "3", name: "Global Solutions Ltd" },
      value: 200000,
      stage: "WON",
      expectedCloseDate: "2024-06-10",
      probability: 100,
      assignedTo: { id: "1", name: "John Doe" },
      createdAt: "2024-04-15T08:00:00",
      updatedAt: "2024-06-10T16:45:00",
      tags: ["Enterprise", "Closed"],
    },
    {
      id: "4",
      title: "Cloud Migration Project",
      customer: { id: "4", name: "Small Business Co" },
      value: 30000,
      stage: "LOST",
      expectedCloseDate: "2024-06-05",
      probability: 0,
      assignedTo: { id: "2", name: "Jane Smith" },
      createdAt: "2024-05-01T10:00:00",
      updatedAt: "2024-06-05T12:00:00",
      tags: ["SMB"],
    },
    {
      id: "5",
      title: "Software Integration",
      customer: { id: "5", name: "Enterprise Corp" },
      value: 85000,
      stage: "NEGOTIATION",
      expectedCloseDate: "2024-07-20",
      probability: 60,
      assignedTo: { id: "1", name: "John Doe" },
      createdAt: "2024-05-20T14:30:00",
      updatedAt: "2024-06-11T09:15:00",
    },
    // Add more mock data
    ...Array.from({ length: 15 }, (_, i) => ({
      id: `${i + 6}`,
      title: `Deal ${i + 6}`,
      customer: { id: `${i + 6}`, name: `Customer ${i + 6}` },
      value: Math.floor(Math.random() * 200000) + 10000,
      stage: ["PROSPECT", "NEGOTIATION", "WON", "LOST"][i % 4] as DealStage,
      expectedCloseDate: new Date(Date.now() + (i + 1) * 86400000 * 30)
        .toISOString()
        .split("T")[0],
      probability: [25, 50, 75, 100][i % 4],
      assignedTo: {
        id: `${(i % 2) + 1}`,
        name: i % 2 === 0 ? "John Doe" : "Jane Smith",
      },
      createdAt: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ["Tag1"],
    })),
  ];

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

  // Filtered data
  const filteredDeals = useMemo(() => {
    let filtered = [...mockDeals];

    if (searchValue) {
      filtered = filtered.filter(
        (deal) =>
          deal.title.toLowerCase().includes(searchValue.toLowerCase()) ||
          deal.customer.name.toLowerCase().includes(searchValue.toLowerCase()),
      );
    }

    if (!stageFilter.has("all")) {
      filtered = filtered.filter((deal) => stageFilter.has(deal.stage));
    }

    if (!assignedFilter.has("all")) {
      filtered = filtered.filter(
        (deal) => deal.assignedTo && assignedFilter.has(deal.assignedTo.id),
      );
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
  }, [mockDeals, searchValue, stageFilter, assignedFilter, valueFilter]);

  const pages = Math.ceil(filteredDeals.length / rowsPerPage);
  const paginatedDeals = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredDeals.slice(start, end);
  }, [filteredDeals, page, rowsPerPage]);

  // Pipeline view data
  const pipelineData = useMemo(() => {
    const stages: DealStage[] = ["PROSPECT", "NEGOTIATION", "WON", "LOST"];
    return stages.map((stage) => ({
      stage,
      deals: filteredDeals.filter((deal) => deal.stage === stage),
      totalValue: filteredDeals
        .filter((deal) => deal.stage === stage)
        .reduce((sum, deal) => sum + deal.value, 0),
    }));
  }, [filteredDeals]);

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

  const handleAddDeal = () => {
    console.log("Adding deal:", formData);
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditDeal = () => {
    console.log("Editing deal:", selectedDeal?.id, formData);
    setIsEditModalOpen(false);
    resetForm();
  };

  const handleDeleteDeal = () => {
    console.log("Deleting deal:", selectedDeal?.id);
    setIsDeleteModalOpen(false);
    setSelectedDeal(null);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      customerId: "",
      value: "",
      stage: "PROSPECT",
      expectedCloseDate: "",
      probability: "25",
      assignedTo: "",
      notes: "",
    });
  };

  const openEditModal = (deal: Deal) => {
    setSelectedDeal(deal);
    setFormData({
      title: deal.title,
      customerId: deal.customer.id,
      value: deal.value.toString(),
      stage: deal.stage,
      expectedCloseDate: deal.expectedCloseDate || "",
      probability: deal.probability.toString(),
      assignedTo: deal.assignedTo?.id || "",
      notes: deal.notes || "",
    });
    setIsEditModalOpen(true);
  };

  const clearAllFilters = () => {
    setStageFilter(new Set(["all"]));
    setAssignedFilter(new Set(["all"]));
    setValueFilter("all");
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (!stageFilter.has("all")) count++;
    if (!assignedFilter.has("all")) count++;
    if (valueFilter !== "all") count++;
    return count;
  }, [stageFilter, assignedFilter, valueFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalValue = filteredDeals.reduce((sum, deal) => sum + deal.value, 0);
    const wonValue = filteredDeals
      .filter((d) => d.stage === "WON")
      .reduce((sum, deal) => sum + deal.value, 0);
    const avgDealSize =
      filteredDeals.length > 0 ? totalValue / filteredDeals.length : 0;
    const winRate =
      filteredDeals.filter((d) => d.stage === "WON" || d.stage === "LOST")
        .length > 0
        ? (filteredDeals.filter((d) => d.stage === "WON").length /
            filteredDeals.filter((d) => d.stage === "WON" || d.stage === "LOST")
              .length) *
          100
        : 0;

    return { totalValue, wonValue, avgDealSize, winRate };
  }, [filteredDeals]);

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Deals</h1>
            <p className="text-default-500 mt-1">
              Manage your sales pipeline ({filteredDeals.length} total)
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
              Add Deal
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-default-500">Pipeline Value</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(stats.totalValue)}
                  </p>
                </div>
                <div className="bg-primary-100 p-3 rounded-lg">
                  <DollarSign className="text-primary-600" size={24} />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-default-500">Won Value</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(stats.wonValue)}
                  </p>
                </div>
                <div className="bg-success-100 p-3 rounded-lg">
                  <CheckCircle className="text-success-600" size={24} />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-default-500">Avg Deal Size</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(stats.avgDealSize)}
                  </p>
                </div>
                <div className="bg-warning-100 p-3 rounded-lg">
                  <TrendingUp className="text-warning-600" size={24} />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-default-500">Win Rate</p>
                  <p className="text-2xl font-bold">
                    {stats.winRate.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-secondary-100 p-3 rounded-lg">
                  <Target className="text-secondary-600" size={24} />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
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
              />

              <div className="flex gap-2">
                <Select
                  label="Stage"
                  placeholder="All stages"
                  className="w-40"
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
                  variant={activeFiltersCount > 0 ? "flat" : "bordered"}
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
                    variant={viewMode === "pipeline" ? "flat" : "light"}
                    onPress={() => setViewMode("pipeline")}
                    className="rounded-r-none"
                  >
                    <Grid size={18} />
                  </Button>
                  <Button
                    isIconOnly
                    variant={viewMode === "table" ? "flat" : "light"}
                    onPress={() => setViewMode("table")}
                    className="rounded-l-none"
                  >
                    <List size={18} />
                  </Button>
                </div>
              </div>
            </div>

            {isFilterOpen && (
              <div className="mt-4 pt-4 border-t border-divider">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    label="Value Range"
                    placeholder="All values"
                    selectedKeys={new Set([valueFilter])}
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
                  <Button size="sm" variant="flat" onPress={clearAllFilters}>
                    Clear All Filters
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Pipeline View */}
      {viewMode === "pipeline" ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {pipelineData.map(({ stage, deals, totalValue }) => (
            <Card key={stage} className="border-1 border-default">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between w-full">
                  <div>
                    <Chip
                      size="sm"
                      color={getStageColor(stage) as any}
                      variant="flat"
                    >
                      {stage}
                    </Chip>
                    <p className="text-sm text-default-500 mt-1">
                      {deals.length} deals • {formatCurrency(totalValue)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardBody className=" max-h-[600px]">
                <div className="h-full w-full space-y-3">
                  {deals.map((deal) => (
                    <Card
                      key={deal.id}
                      isPressable
                      shadow="sm"
                      className=" w-full"
                    >
                      <CardBody className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-sm">
                            {deal.title}
                          </h4>
                          <Dropdown>
                            <DropdownTrigger>
                              <Button isIconOnly size="sm" variant="light">
                                <MoreVertical size={14} />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu>
                              <DropdownItem
                                key="edit"
                                onPress={() => openEditModal(deal)}
                              >
                                Edit
                              </DropdownItem>
                              <DropdownItem
                                key="delete"
                                color="danger"
                                onPress={() => {
                                  setSelectedDeal(deal);
                                  setIsDeleteModalOpen(true);
                                }}
                              >
                                Delete
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </div>
                        <p className="text-xs text-default-500 mb-2">
                          {deal.customer.name}
                        </p>
                        <p className="text-lg font-bold text-primary mb-2">
                          {formatCurrency(deal.value)}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            <span>{formatDate(deal.expectedCloseDate)}</span>
                          </div>
                          <Chip size="sm" variant="flat">
                            {deal.probability}%
                          </Chip>
                        </div>
                        {deal.assignedTo && (
                          <div className="flex items-center gap-2 mt-2">
                            <Avatar
                              size="sm"
                              name={deal.assignedTo.name}
                              className="w-5 h-5"
                            />
                            <span className="text-xs">
                              {deal.assignedTo.name}
                            </span>
                          </div>
                        )}
                      </CardBody>
                    </Card>
                  ))}
                </div>
                {deals.length === 0 && (
                  <div className="text-center text-default-400 py-8">
                    <p className="text-sm">No deals in this stage</p>
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        // Table View
        <Card>
          <CardBody className="p-0">
            <Table
              aria-label="Deals table"
              selectionMode="multiple"
              selectedKeys={selectedKeys}
              onSelectionChange={(keys) => setSelectedKeys(keys as Set<string>)}
              bottomContent={
                <div className="flex w-full justify-center px-2 py-2">
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
                <TableColumn>DEAL</TableColumn>
                <TableColumn>CUSTOMER</TableColumn>
                <TableColumn>VALUE</TableColumn>
                <TableColumn>STAGE</TableColumn>
                <TableColumn>PROBABILITY</TableColumn>
                <TableColumn>EXPECTED CLOSE</TableColumn>
                <TableColumn>ASSIGNED TO</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedDeals.map((deal) => (
                  <TableRow key={deal.id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{deal.title}</p>
                        {deal.tags && (
                          <div className="flex gap-1 mt-1">
                            {deal.tags.map((tag) => (
                              <Chip key={tag} size="sm" variant="flat">
                                {tag}
                              </Chip>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{deal.customer.name}</p>
                        {deal.customer.company && (
                          <p className="text-xs text-default-500">
                            {deal.customer.company}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-primary">
                        {formatCurrency(deal.value)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={getStageColor(deal.stage) as any}
                      >
                        {deal.stage}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={deal.probability}
                          color={
                            deal.probability >= 75
                              ? "success"
                              : deal.probability >= 50
                                ? "warning"
                                : "default"
                          }
                          className="w-20"
                        />
                        <span className="text-sm font-semibold">
                          {deal.probability}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar size={14} className="text-default-400" />
                        <span>{formatDate(deal.expectedCloseDate)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {deal.assignedTo ? (
                        <UserComponent
                          name={deal.assignedTo.name}
                          avatarProps={{ size: "sm" }}
                        />
                      ) : (
                        <span className="text-default-400 text-sm">
                          Unassigned
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}

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
                value={formData.title}
                onValueChange={(value) =>
                  setFormData({ ...formData, title: value })
                }
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
              <Input
                label="Probability (%)"
                type="number"
                min="0"
                max="100"
                value={formData.probability}
                onValueChange={(value) =>
                  setFormData({ ...formData, probability: value })
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
              <Input
                label="Probability (%)"
                type="number"
                min="0"
                max="100"
                value={formData.probability}
                onValueChange={(value) =>
                  setFormData({ ...formData, probability: value })
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
            <Textarea
              label="Notes"
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
            <Button color="danger" onPress={handleDeleteDeal}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
