"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Chip,
  Divider,
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
} from "@heroui/react";
import {
  Briefcase,
  DollarSign,
  List,
  MoreVertical,
  Package,
  Plus,
  Search,
  Target,
  Trash2,
  TrendingUp,
  ToggleLeft,
  ToggleRight,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import {
  formatCurrency,
  formatDate,
} from "@/app/components/comp_services/service-shared";
import { Service } from "@/app/types/types";
import { useAllServices } from "@/app/hooks/useAllServices";

export default function ServicesListPage() {
  const router = useRouter();
  const currentUser = useUser();

  const {
    data: services = [],
    refetch: refetchServices,
    isLoading: allServicesLoading,
  } = useAllServices(currentUser?.companyId || "");

  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<Set<string>>(
    new Set(["all"]),
  );
  const [page, setPage] = useState(1);
  const rowsPerPage = 12;

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const isAdmin =
    currentUser?.role === "ADMIN" || currentUser?.role === "MANAGER";

  useEffect(() => {
    console.log("Services data:", services);
  }, [services]);

  const filteredServices = useMemo(() => {
    let filtered = [...services];

    if (searchValue) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          s.description?.toLowerCase().includes(searchValue.toLowerCase()),
      );
    }

    if (!statusFilter.has("all")) {
      if (statusFilter.has("active"))
        filtered = filtered.filter((s) => s.isActive);
      if (statusFilter.has("inactive"))
        filtered = filtered.filter((s) => !s.isActive);
    }

    return filtered;
  }, [services, searchValue, statusFilter]);

  const pages = Math.ceil(filteredServices.length / rowsPerPage);
  const paginatedServices = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredServices.slice(start, start + rowsPerPage);
  }, [filteredServices, page]);

  const stats = useMemo(
    () => ({
      total: services.length,
      active: services.filter((s) => s.isActive).length,
      avgPrice:
        services.length > 0
          ? services.reduce((sum, s) => sum + Number(s.price), 0) /
            services.length
          : 0,
      totalLeads: services.reduce((sum, s) => sum + (s.leadsCount ?? 0), 0),
    }),
    [services],
  );

  const handleToggleStatus = async (service: Service) => {
    try {
      const res = await fetch(
        `/api/services/${service.id}?companyId=${currentUser?.companyId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !service.isActive }),
        },
      );
      if (res.ok) {
        refetchServices();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!selectedService) return;
    setDeleting(true);

    try {
      await fetch(
        `/api/services/${selectedService.id}?companyId=${currentUser?.companyId}`,
        { method: "DELETE" },
      );
      refetchServices();
      setIsDeleteModalOpen(false);
      setSelectedService(null);
    } catch (err) {
      console.error(err);
    }
    setDeleting(false);
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Services</h1>
          <p className="text-default-500 mt-1">
            {stats.total} services · {stats.active} active
          </p>
        </div>
        {isAdmin && (
          <Button
            color="primary"
            radius="full"
            startContent={<Plus size={18} />}
            onPress={() => router.push("/company-services/new")}
          >
            Add Service
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Services",
            value: stats.total,
            icon: <Package size={24} />,
            color: "bg-primary-100 text-primary-600",
          },
          {
            label: "Active",
            value: stats.active,
            icon: <ToggleRight size={24} />,
            color: "bg-success-100 text-success-600",
          },
          {
            label: "Avg. Price",
            value: formatCurrency(stats.avgPrice),
            icon: <DollarSign size={24} />,
            color: "bg-warning-100 text-warning-600",
          },
          {
            label: "Total Leads",
            value: stats.totalLeads,
            icon: <Target size={24} />,
            color: "bg-secondary-100 text-secondary-600",
          },
        ].map((s) => (
          <Card radius="sm" key={s.label}>
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-default-500">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${s.color}`}>{s.icon}</div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Search + Filters */}
      <Card radius="sm">
        <CardBody>
          <div className="flex flex-col lg:flex-row gap-4">
            <Input
              radius="sm"
              className="flex-1"
              label="Search"
              placeholder="Search by name or description..."
              startContent={<Search size={18} className="text-default-400" />}
              value={searchValue}
              onValueChange={setSearchValue}
              isClearable
            />
            <div className="flex gap-2">
              <Select
                radius="sm"
                label="Status"
                className="w-40"
                selectedKeys={statusFilter}
                onSelectionChange={(k) => setStatusFilter(k as Set<string>)}
                selectionMode="multiple"
              >
                <SelectItem key="all">All Statuses</SelectItem>
                <SelectItem key="active">Active</SelectItem>
                <SelectItem key="inactive">Inactive</SelectItem>
              </Select>

              {!statusFilter.has("all") && (
                <Button
                  variant="flat"
                  onPress={() => setStatusFilter(new Set(["all"]))}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {paginatedServices.map((service) => (
          <Card
            radius="sm"
            key={service.id}
            className={`relative hover:scale-102 active:scale-98 `}
          >
            <CardBody className="p-6">
              <div
                className="cursor-pointer"
                onClick={() => router.push(`/company-services/${service.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <Package size={22} className="text-primary-600" />
                  </div>
                  <Chip
                    size="sm"
                    variant="dot"
                    color={service.isActive ? "success" : "danger"}
                  >
                    {service.isActive ? "Active" : "Inactive"}
                  </Chip>
                </div>

                <h3 className="font-semibold text-lg leading-tight mb-1">
                  {service.name}
                </h3>
                {service.description && (
                  <p className="text-xs text-default-400 line-clamp-2 mb-3">
                    {service.description}
                  </p>
                )}

                <p className="text-2xl font-bold text-success mb-4">
                  {formatCurrency(service.price)}
                </p>

                <Divider className="mb-4" />

                <div className="flex justify-between text-center mb-4">
                  <div>
                    <div className="flex items-center gap-1 text-default-400 mb-0.5 justify-center">
                      <Target size={12} />
                      <span className="text-[10px]">Leads</span>
                    </div>
                    <p className="font-bold text-sm">
                      {service.leads?.length ?? 0}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-default-400 mb-0.5 justify-center">
                      <Briefcase size={12} />
                      <span className="text-[10px]">Deals</span>
                    </div>
                    <p className="font-bold text-sm">
                      {service.deals?.length ?? 0}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-default-400 mb-0.5 justify-center">
                      <TrendingUp size={12} />
                      <span className="text-[10px]">Revenue</span>
                    </div>
                    <p className="font-bold text-sm text-success text-xs">
                      {formatCurrency(
                        Number(service.price) * (service.deals?.length ?? 0),
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="flat"
                    className="flex-1"
                    onPress={() =>
                      router.push(`/company-services/${service.id}/edit`)
                    }
                  >
                    Edit
                  </Button>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button isIconOnly size="sm" variant="flat">
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu>
                      <DropdownItem
                        key="toggle"
                        startContent={
                          service.isActive ? (
                            <ToggleLeft size={16} />
                          ) : (
                            <ToggleRight size={16} />
                          )
                        }
                        onPress={() => handleToggleStatus(service)}
                      >
                        {service.isActive ? "Deactivate" : "Activate"}
                      </DropdownItem>
                      <DropdownItem
                        key="delete"
                        color="danger"
                        startContent={<Trash2 size={16} />}
                        onPress={() => {
                          setSelectedService(service);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        Delete
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>
      {pages > 1 && (
        <div className="flex justify-center">
          <Pagination
            isCompact
            showControls
            color="primary"
            page={page}
            total={pages}
            onChange={setPage}
          />
        </div>
      )}

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
              Are you sure you want to delete{" "}
              <strong>{selectedService?.name}</strong>?
            </p>
            <p className="text-sm text-danger mt-2">
              This will remove the service from all linked leads and deals.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button isLoading={deleting} color="danger" onPress={handleDelete}>
              Delete Service
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
