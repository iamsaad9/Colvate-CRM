"use client";

import { useState, useMemo, useEffect } from "react";
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
  Badge,
  Divider,
} from "@heroui/react";
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Key,
  Send,
  Download,
  Grid,
  List,
  Crown,
  Briefcase,
  Headphones,
  TrendingUp,
  Target,
  CheckSquare,
  UserCheck,
  UserX,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import {
  User,
  UserRole,
  formatDate,
  getRoleIcon,
  getRoleColor,
  getDefaultVisibleUsers,
} from "@/app/components/users/user-shared";
import { useAllDeals } from "@/app/hooks/useAllsDeals";
import { Deal, Lead } from "@/app/types/types";
import { useAllLeads } from "@/app/hooks/useAllLeads";
import { useCustomers } from "@/app/hooks/useCustomers";
import { Customer } from "@prisma/client";

export default function UsersListPage() {
  const router = useRouter();
  const currentUser = useUser();

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 12;
  const [showAllUsers, setShowAllUsers] = useState(
    currentUser?.role === "ADMIN",
  );
  const [roleFilter, setRoleFilter] = useState<Set<string>>(new Set(["all"]));
  const [statusFilter, setStatusFilter] = useState<Set<string>>(
    new Set(["all"]),
  );
  const { data: allDeals = [], isLoading: dealsLoading } = useAllDeals(
    currentUser?.companyId || "",
  );

  const { data: allLeads = [], isLoading: leadsLoading } = useAllLeads(
    currentUser?.companyId || "",
  );

  const { data: allCustomers = [], isLoading: customerLoading } = useCustomers(
    currentUser?.companyId || "",
  );

  // Invite modal state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmails, setInviteEmails] = useState("");

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const isAdmin = currentUser?.role === "ADMIN";
  const isManager = currentUser?.role === "MANAGER";
  const canManage = isAdmin || isManager;

  useEffect(() => {
    if (!currentUser?.companyId) return;
    fetch(`/api/users?companyId=${currentUser.companyId}`)
      .then((r) => r.json())
      .then(setAllUsers)
      .catch(console.error);
  }, [currentUser?.companyId]);

  // Default scoped view vs "all" toggle
  const baseUsers = useMemo(() => {
    if (!currentUser || allUsers.length === 0) return [];
    if (showAllUsers) return allUsers;
    return getDefaultVisibleUsers(allUsers, currentUser as User);
  }, [allUsers, currentUser, showAllUsers]);

  const sortedUsers = useMemo(() => {
    const roleOrder: Record<UserRole, number> = {
      ADMIN: 0,
      MANAGER: 1,
      SALES: 2,
      SUPPORT: 3,
    };
    return [...baseUsers].sort((a, b) => {
      if (a.id === currentUser?.id) return -1;
      if (b.id === currentUser?.id) return 1;
      if (roleOrder[a.role] !== roleOrder[b.role])
        return roleOrder[a.role] - roleOrder[b.role];
      return a.name.localeCompare(b.name);
    });
  }, [baseUsers, currentUser?.id]);

  const filteredUsers = useMemo(() => {
    let filtered = [...sortedUsers];
    if (searchValue) {
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          u.email.toLowerCase().includes(searchValue.toLowerCase()),
      );
    }
    if (!roleFilter.has("all")) {
      filtered = filtered.filter((u) => roleFilter.has(u.role));
    }
    if (!statusFilter.has("all")) {
      if (statusFilter.has("active"))
        filtered = filtered.filter((u) => u.isActive);
      if (statusFilter.has("inactive"))
        filtered = filtered.filter((u) => !u.isActive);
    }
    return filtered;
  }, [sortedUsers, searchValue, roleFilter, statusFilter]);

  const pages = Math.ceil(filteredUsers.length / rowsPerPage);
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredUsers.slice(start, start + rowsPerPage);
  }, [filteredUsers, page]);

  const stats = useMemo(
    () => ({
      total: filteredUsers.length,
      active: filteredUsers.filter((u) => u.isActive).length,
      admins: filteredUsers.filter((u) => u.role === "ADMIN").length,
      sales: filteredUsers.filter((u) => u.role === "SALES").length,
    }),
    [filteredUsers],
  );

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (!roleFilter.has("all")) count++;
    if (!statusFilter.has("all")) count++;
    return count;
  }, [roleFilter, statusFilter]);

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await fetch(
        `/api/users/${selectedUser.id}?companyId=${currentUser?.companyId}`,
        {
          method: "DELETE",
        },
      );
      setAllUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const res = await fetch(
        `/api/users/${user.id}?companyId=${currentUser?.companyId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !user.isActive }),
        },
      );
      if (res.ok) {
        setAllUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, isActive: !u.isActive } : u,
          ),
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendInvites = () => {
    const emails = inviteEmails
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
    console.log("Sending invites to:", emails);
    setIsInviteModalOpen(false);
    setInviteEmails("");
  };

  // Can this viewer edit a given user?
  const canEdit = (user: User) => {
    if (isAdmin && user.role !== "ADMIN") return true;
    if (user.id === currentUser?.id) return true;
    if (isManager && user.reportsToId === currentUser?.id) return true;
    return false;
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Team Members</h1>
            <p className="text-default-500 mt-1">
              {showAllUsers ? "All users" : "Your team"} · {stats.total} members
            </p>
          </div>
          <div className="flex gap-2">
            {canManage && (
              <Button
                variant="flat"
                startContent={<Send size={18} />}
                onPress={() => setIsInviteModalOpen(true)}
              >
                Send Invites
              </Button>
            )}
            {canManage && (
              <Button
                color="primary"
                startContent={<Plus size={18} />}
                onPress={() => router.push("/users/new")}
              >
                Add User
              </Button>
            )}
            <Button variant="flat" startContent={<Download size={18} />}>
              Export
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Total Users",
              value: stats.total,
              icon: <UserCheck size={24} />,
              color: "bg-primary-100 text-primary-600",
            },
            {
              label: "Active",
              value: stats.active,
              icon: <CheckSquare size={24} />,
              color: "bg-success-100 text-success-600",
            },
            {
              label: "Admins",
              value: stats.admins,
              icon: <Crown size={24} />,
              color: "bg-danger-100 text-danger-600",
            },
            {
              label: "Sales Team",
              value: stats.sales,
              icon: <Briefcase size={24} />,
              color: "bg-warning-100 text-warning-600",
            },
          ].map((s) => (
            <Card key={s.label}>
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
        <Card>
          <CardBody>
            <div className="flex flex-col lg:flex-row gap-4">
              <Input
                className="flex-1"
                label="Search"
                placeholder="Search by name or email..."
                startContent={<Search size={18} className="text-default-400" />}
                value={searchValue}
                onValueChange={setSearchValue}
                isClearable
              />
              <div className="flex gap-2 flex-wrap">
                {/* Show All toggle — only for non-admins (admins always see all by default) */}
                {!isAdmin && (
                  <Button
                    variant={showAllUsers ? "solid" : "flat"}
                    color={showAllUsers ? "primary" : "default"}
                    onPress={() => setShowAllUsers((v) => !v)}
                  >
                    {showAllUsers ? "My Team" : "All Users"}
                  </Button>
                )}

                <Select
                  label="Role"
                  className="w-40"
                  selectedKeys={roleFilter}
                  onSelectionChange={(k) => setRoleFilter(k as Set<string>)}
                  selectionMode="multiple"
                >
                  <SelectItem key="all">All Roles</SelectItem>
                  <SelectItem key="ADMIN">Admin</SelectItem>
                  <SelectItem key="MANAGER">Manager</SelectItem>
                  <SelectItem key="SALES">Sales</SelectItem>
                  <SelectItem key="SUPPORT">Support</SelectItem>
                </Select>

                <Select
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

                {activeFiltersCount > 0 && (
                  <Button
                    variant="flat"
                    onPress={() => {
                      setRoleFilter(new Set(["all"]));
                      setStatusFilter(new Set(["all"]));
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {paginatedUsers.map((user) => {
          const isCurrentUser = user.id === currentUser?.id;
          const editable = canEdit(user);
          const managerUser = allUsers.find((u) => u.id === user.reportsToId);

          return (
            <Card
              key={user.id}
              className={`relative ${isCurrentUser ? "border-2 border-primary shadow-lg" : ""}`}
              isPressable
              onPress={() => router.push(`/users/${user.id}`)}
            >
              <CardBody className="p-6">
                {isCurrentUser && (
                  <Chip
                    size="sm"
                    color="primary"
                    variant="flat"
                    className="absolute top-3 right-3"
                  >
                    You
                  </Chip>
                )}

                <div className="flex flex-col items-center text-center mb-4">
                  <Badge
                    content={!user.isActive ? <UserX size={14} /> : ""}
                    color="danger"
                    placement="bottom-right"
                    isInvisible={user.isActive}
                  >
                    <Avatar
                      src={user.avatarUrl}
                      name={user.name}
                      className="w-16 h-16 text-large"
                    />
                  </Badge>
                  <h3 className="font-semibold text-lg mt-3">{user.name}</h3>
                  <p className="text-xs text-default-500 truncate w-full">
                    {user.email}
                  </p>
                  <Chip
                    size="sm"
                    variant="flat"
                    color={getRoleColor(user.role)}
                    startContent={getRoleIcon(user.role)}
                    className="mt-2"
                  >
                    {user.role}
                  </Chip>
                  {!user.isActive && (
                    <Chip
                      size="sm"
                      color="danger"
                      variant="flat"
                      className="mt-1"
                    >
                      Inactive
                    </Chip>
                  )}
                  {managerUser && (
                    <p className="text-xs text-default-400 mt-1">
                      Reports to:{" "}
                      <span className="font-medium">{managerUser.name}</span>
                    </p>
                  )}
                </div>

                <Divider className="my-3" />

                <div className="grid grid-cols-2 gap-2 mb-3 text-center">
                  {[
                    {
                      icon: <Target size={12} />,
                      label: "Leads",
                      value: allLeads.filter(
                        (d: Lead) => d.assignedTo === user.id,
                      ).length,
                    },
                    {
                      icon: <Briefcase size={12} />,
                      label: "Deals",
                      value: allDeals.filter(
                        (d: Deal) => d.assignedTo === user.id,
                      ).length,
                    },
                    {
                      icon: <CheckSquare size={12} />,
                      label: "Tasks",
                      value: user.tasksCount ?? 0,
                    },
                    {
                      icon: <UserCheck size={12} />,
                      label: "Customers",
                      value: allCustomers.filter(
                        (d: Customer) => d.assignedTo === user.id,
                      ).length,
                    },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="flex items-center justify-center gap-1 text-default-400 mb-0.5">
                        {s.icon}
                        <p className="text-[10px]">{s.label}</p>
                      </div>
                      <p className="font-bold text-sm">{s.value}</p>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-default-400 text-center mb-3">
                  Joined {formatDate(user.createdAt)}
                </p>

                {editable && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="flat"
                      className="flex-1"
                      onPress={(e) => {
                        router.push(`/users/${user.id}/edit`);
                      }}
                    >
                      {isCurrentUser ? "Edit Profile" : "Edit"}
                    </Button>
                    {isAdmin && !isCurrentUser && (
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
                              user.isActive ? (
                                <UserX size={16} />
                              ) : (
                                <UserCheck size={16} />
                              )
                            }
                            onPress={() => handleToggleStatus(user)}
                          >
                            {user.isActive ? "Deactivate" : "Activate"}
                          </DropdownItem>
                          <DropdownItem
                            key="email"
                            startContent={<Mail size={16} />}
                            onPress={() => {
                              window.location.href = `mailto:${user.email}`;
                            }}
                          >
                            Send Email
                          </DropdownItem>
                          <DropdownItem
                            key="delete"
                            color="danger"
                            startContent={<Trash2 size={16} />}
                            onPress={() => {
                              setSelectedUser(user);
                              setIsDeleteModalOpen(true);
                            }}
                          >
                            Delete User
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          );
        })}
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

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        size="lg"
      >
        <ModalContent>
          <ModalHeader>Send Invitations</ModalHeader>
          <ModalBody>
            <p className="text-sm text-default-500 mb-4">
              Enter email addresses separated by commas.
            </p>
            <Input
              label="Email Addresses"
              placeholder="email1@example.com, email2@example.com"
              value={inviteEmails}
              onValueChange={setInviteEmails}
            />
            <p className="text-xs text-default-500 mt-2">
              New users will default to the SALES role.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setIsInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleSendInvites}
              startContent={<Send size={16} />}
            >
              Send Invitations
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
          <ModalHeader>Delete User</ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to delete{" "}
              <strong>{selectedUser?.name}</strong>?
            </p>
            <p className="text-sm text-danger mt-2">
              This action cannot be undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button color="danger" onPress={handleDelete}>
              Delete User
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
