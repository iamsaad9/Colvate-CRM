"use client";

import { useState, useMemo, useEffect } from "react";
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
  User as UserComponent,
  Badge,
  Divider,
  Switch,
} from "@heroui/react";
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
  Key,
  Send,
  Download,
  Filter,
  Grid,
  List,
  Crown,
  Briefcase,
  Headphones,
  TrendingUp,
  Target,
  CheckSquare,
  SlidersHorizontal,
  Copy,
  RefreshCw,
} from "lucide-react";
import { useUser } from "@/app/context/UserContext";

// Types
type UserRole = "ADMIN" | "MANAGER" | "SALES" | "SUPPORT";

interface User {
  id: string;
  companyId: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Stats
  leadsCount?: number;
  dealsCount?: number;
  tasksCount?: number;
  customersCount?: number;
}

interface UsersPageProps {
  currentUserId: string;
  currentUserRole: UserRole;
  companyId: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User>([]);
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
  const [searchValue, setSearchValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set([]));
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] =
    useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const currentUser = useUser();
  // Filters
  const [roleFilter, setRoleFilter] = useState<Set<string>>(new Set(["all"]));
  const [statusFilter, setStatusFilter] = useState<Set<string>>(
    new Set(["all"]),
  );

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "SALES" as UserRole,
    avatarUrl: "",
    isActive: true,
  });

  const [inviteEmails, setInviteEmails] = useState("");

  // Check if current user is admin/manager
  const isAdmin =
    currentUser?.role === "ADMIN" || currentUser?.role === "MANAGER";

  useEffect(() => {
    console.log("User Company id", currentUser?.companyId);
    // 1. Define the async function inside useEffect
    const fetchUsers = async () => {
      if (!currentUser?.companyId) return; // Wait until companyId is available
      try {
        // setLoading(true);
        // 2. Pass data in the URL, not the body!
        const response = await fetch(
          `/api/users?companyId=${currentUser.companyId}`,
        );

        if (!response.ok) throw new Error("Failed to fetch");

        const data = await response.json();
        console.log("Data:", data);
        setUsers(data);
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        // setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser?.companyId]);

  const sortedUsers = useMemo(() => {
    const roleOrder = { ADMIN: 0, MANAGER: 1, SALES: 2, SUPPORT: 3 };
    return [...users].sort((a, b) => {
      // Current user always first
      if (a.id === currentUser?.id) return -1;
      if (b.id === currentUser?.id) return 1;

      // Then by role
      if (roleOrder[a.role] !== roleOrder[b.role]) {
        return roleOrder[a.role] - roleOrder[b.role];
      }

      // Then by name
      return a.name.localeCompare(b.name);
    });
  }, [users, currentUser?.id]);

  // Filtered data
  const filteredUsers = useMemo(() => {
    let filtered = [...sortedUsers];

    if (searchValue) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          user.email.toLowerCase().includes(searchValue.toLowerCase()),
      );
    }

    if (!roleFilter.has("all")) {
      filtered = filtered.filter((user) => roleFilter.has(user.role));
    }

    if (!statusFilter.has("all")) {
      if (statusFilter.has("active")) {
        filtered = filtered.filter((user) => user.isActive);
      }
      if (statusFilter.has("inactive")) {
        filtered = filtered.filter((user) => !user.isActive);
      }
    }

    return filtered;
  }, [sortedUsers, searchValue, roleFilter, statusFilter]);

  const pages = Math.ceil(filteredUsers.length / rowsPerPage);
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredUsers.slice(start, end);
  }, [filteredUsers, page, rowsPerPage]);

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return <Crown size={16} />;
      case "MANAGER":
        return <ShieldCheck size={16} />;
      case "SALES":
        return <Briefcase size={16} />;
      case "SUPPORT":
        return <Headphones size={16} />;
    }
  };

  const getRoleColor = (role: UserRole) => {
    const colors = {
      ADMIN: "danger",
      MANAGER: "warning",
      SALES: "primary",
      SUPPORT: "secondary",
    };
    return colors[role];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleAddUser = async () => {
    console.log("Adding user:", formData);
    const companyId = currentUser?.companyId;
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, companyId }),
      });

      if (response.ok) {
        const savedDeal = await response.json();

        setIsAddModalOpen(false);
        resetForm();

        console.log("User8 saved successfully:", savedDeal);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (err) {
      console.error("Network error:", err);
    }
  };

  const handleEditUser = () => {
    console.log("Editing user:", selectedUser?.id, formData);
    setIsEditModalOpen(false);
    resetForm();
  };

  const handleDeleteUser = () => {
    console.log("Deleting user:", selectedUser?.id);
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  const handleToggleStatus = (user: User) => {
    console.log("Toggle status:", user.id, !user.isActive);
    // API call to update user status
  };

  const handleResetPassword = () => {
    console.log("Reset password for:", selectedUser?.id);
    setIsResetPasswordModalOpen(false);
    setSelectedUser(null);
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

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "SALES",
      avatarUrl: "",
      isActive: true,
    });
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl || "",
      isActive: user.isActive,
    });
    setIsEditModalOpen(true);
  };

  const clearAllFilters = () => {
    setRoleFilter(new Set(["all"]));
    setStatusFilter(new Set(["all"]));
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (!roleFilter.has("all")) count++;
    if (!statusFilter.has("all")) count++;
    return count;
  }, [roleFilter, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = filteredUsers.length;
    const active = filteredUsers.filter((u) => u.isActive).length;
    const admins = filteredUsers.filter((u) => u.role === "ADMIN").length;
    const sales = filteredUsers.filter((u) => u.role === "SALES").length;

    return { total, active, admins, sales };
  }, [filteredUsers]);

  const potentialManagers = useMemo(() => {
    if (!Array.isArray(users)) return [];

    return users.filter(
      (u) =>
        (u.role === "ADMIN" || u.role === "MANAGER") && u.id !== formData.id, // A user cannot report to themselves
    );
  }, [users, formData.id]);

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Team Members</h1>
            <p className="text-default-500 mt-1">
              Manage your organization's users and permissions ({stats.total}{" "}
              total)
            </p>
          </div>

          <div className="flex gap-2">
            {isAdmin && (
              <>
                <Button
                  variant="flat"
                  startContent={<Send size={18} />}
                  onPress={() => setIsInviteModalOpen(true)}
                >
                  Send Invites
                </Button>
                <Button
                  color="primary"
                  startContent={<Plus size={18} />}
                  onPress={() => setIsAddModalOpen(true)}
                >
                  Add User
                </Button>
              </>
            )}
            <Button variant="flat" startContent={<Download size={18} />}>
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-default-500">Total Users</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="bg-primary-100 p-3 rounded-lg">
                  <UserCheck className="text-primary-600" size={24} />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-default-500">Active Users</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                </div>
                <div className="bg-success-100 p-3 rounded-lg">
                  <CheckSquare className="text-success-600" size={24} />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-default-500">Admins</p>
                  <p className="text-2xl font-bold">{stats.admins}</p>
                </div>
                <div className="bg-danger-100 p-3 rounded-lg">
                  <Crown className="text-danger-600" size={24} />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-default-500">Sales Team</p>
                  <p className="text-2xl font-bold">{stats.sales}</p>
                </div>
                <div className="bg-warning-100 p-3 rounded-lg">
                  <Briefcase className="text-warning-600" size={24} />
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
                label="Search User"
                placeholder="Search users by name or email..."
                startContent={<Search size={18} className="text-default-400" />}
                value={searchValue}
                onValueChange={setSearchValue}
                isClearable
              />

              <div className="flex gap-2">
                <Select
                  label="Role"
                  placeholder="All roles"
                  className="w-40"
                  selectedKeys={roleFilter}
                  onSelectionChange={(keys) =>
                    setRoleFilter(keys as Set<string>)
                  }
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
                  placeholder="All statuses"
                  className="w-40"
                  selectedKeys={statusFilter}
                  onSelectionChange={(keys) =>
                    setStatusFilter(keys as Set<string>)
                  }
                  selectionMode="multiple"
                >
                  <SelectItem key="all">All Statuses</SelectItem>
                  <SelectItem key="active">Active</SelectItem>
                  <SelectItem key="inactive">Inactive</SelectItem>
                </Select>

                {activeFiltersCount > 0 && (
                  <Button size="lg" variant="flat" onPress={clearAllFilters}>
                    Clear Filters
                  </Button>
                )}

                <div className="flex border-2 border-default-200 rounded-lg">
                  <Button
                    isIconOnly
                    variant={viewMode === "grid" ? "flat" : "light"}
                    onPress={() => setViewMode("grid")}
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
          </CardBody>
        </Card>
      </div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedUsers.map((user) => {
            const isCurrentUser = user.id === currentUser?.id; // This logic is comparing user.id to itself

            return (
              <Card
                key={user.id}
                className={`${isCurrentUser ? "border-2 border-primary shadow-lg" : ""}`}
              >
                <CardBody className="p-6">
                  {user.id === currentUser?.id && (
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
                      content={!user.isActive && <UserX size={14} />}
                      color="danger"
                      placement="bottom-right"
                      isInvisible={user.isActive}
                    >
                      <Avatar
                        src={user.avatarUrl}
                        name={user.name}
                        className="w-20 h-20 text-large"
                      />
                    </Badge>
                    <h3 className="font-semibold text-xl mt-3">{user.name}</h3>
                    <p className="text-sm text-default-500">{user.email}</p>

                    <Chip
                      size="sm"
                      variant="flat"
                      color={getRoleColor(user.role) as any}
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
                        className="mt-2"
                      >
                        Inactive
                      </Chip>
                    )}
                  </div>

                  <Divider className="my-4" />

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-default-500 mb-1">
                        <Target size={14} />
                        <p className="text-xs">Leads</p>
                      </div>
                      <p className="text-lg font-bold">{user.leadsCount}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-default-500 mb-1">
                        <Briefcase size={14} />
                        <p className="text-xs">Deals</p>
                      </div>
                      <p className="text-lg font-bold">{user.dealsCount}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-default-500 mb-1">
                        <CheckSquare size={14} />
                        <p className="text-xs">Tasks</p>
                      </div>
                      <p className="text-lg font-bold">{user.tasksCount}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-default-500 mb-1">
                        <UserCheck size={14} />
                        <p className="text-xs">Customers</p>
                      </div>
                      <p className="text-lg font-bold">{user.customersCount}</p>
                    </div>
                  </div>

                  <div className="text-xs text-default-400 text-center mb-4">
                    Joined {formatDate(user.createdAt)}
                  </div>

                  {/* Actions */}
                  {isAdmin && !isCurrentUser && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="flat"
                        className="flex-1"
                        onPress={() => openEditModal(user)}
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
                            key="reset"
                            startContent={<Key size={16} />}
                            onPress={() => {
                              setSelectedUser(user);
                              setIsResetPasswordModalOpen(true);
                            }}
                          >
                            Reset Password
                          </DropdownItem>
                          <DropdownItem
                            key="email"
                            startContent={<Mail size={16} />}
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
                    </div>
                  )}

                  {user.id === currentUser?.id && (
                    <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      fullWidth
                      onPress={() => openEditModal(user)}
                    >
                      Edit My Profile
                    </Button>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      ) : (
        // Table View
        <Card>
          <CardBody className="p-0">
            <Table
              aria-label="Users table"
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
                <TableColumn>USER</TableColumn>
                <TableColumn>ROLE</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>LEADS</TableColumn>
                <TableColumn>DEALS</TableColumn>
                <TableColumn>TASKS</TableColumn>
                <TableColumn>CUSTOMERS</TableColumn>
                <TableColumn>JOINED</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => {
                  const isCurrentUser = user.id === currentUser?.id; // This logic is comparing user.id to itself

                  return (
                    <TableRow
                      key={user.id}
                      className={isCurrentUser ? "bg-primary-50" : ""}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Badge
                            content={!user.isActive && <UserX size={12} />}
                            color="danger"
                            placement="bottom-right"
                            isInvisible={user.isActive}
                          >
                            <Avatar
                              src={user.avatarUrl}
                              name={user.name}
                              size="sm"
                            />
                          </Badge>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{user.name}</p>
                              {user.id === user?.id && (
                                <Chip size="sm" color="primary" variant="flat">
                                  You
                                </Chip>
                              )}
                            </div>
                            <p className="text-xs text-default-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="sm"
                          variant="flat"
                          color={getRoleColor(user.role) as any}
                          startContent={getRoleIcon(user.role)}
                        >
                          {user.role}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="sm"
                          variant="dot"
                          color={user.isActive ? "success" : "danger"}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">{user.leadsCount}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">{user.dealsCount}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">{user.tasksCount}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">
                          {user.customersCount}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-default-500">
                          {formatDate(user.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {isAdmin || user.id === user?.id ? (
                          <Dropdown>
                            <DropdownTrigger>
                              <Button isIconOnly size="sm" variant="light">
                                <MoreVertical size={16} />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu>
                              <DropdownItem
                                key="edit"
                                startContent={<Edit size={16} />}
                                onPress={() => openEditModal(user)}
                              >
                                Edit {user.id === user?.id ? "Profile" : "User"}
                              </DropdownItem>
                              {isAdmin && user.id !== user?.id && (
                                <>
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
                                    key="reset"
                                    startContent={<Key size={16} />}
                                    onPress={() => {
                                      setSelectedUser(user);
                                      setIsResetPasswordModalOpen(true);
                                    }}
                                  >
                                    Reset Password
                                  </DropdownItem>
                                  <DropdownItem
                                    key="email"
                                    startContent={<Mail size={16} />}
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
                                </>
                              )}
                            </DropdownMenu>
                          </Dropdown>
                        ) : (
                          <span className="text-default-400 text-sm">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        size="2xl"
      >
        <ModalContent>
          <ModalHeader>Add New User</ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="Enter user name"
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
              <Select
                label="Role"
                selectedKeys={new Set([formData.role])}
                onSelectionChange={(keys) =>
                  setFormData({
                    ...formData,
                    role: Array.from(keys)[0] as UserRole,
                  })
                }
              >
                <SelectItem key="ADMIN" startContent={<Crown size={16} />}>
                  Admin
                </SelectItem>
                <SelectItem
                  key="MANAGER"
                  startContent={<ShieldCheck size={16} />}
                >
                  Manager
                </SelectItem>
                <SelectItem key="SALES" startContent={<Briefcase size={16} />}>
                  Sales
                </SelectItem>
                <SelectItem
                  key="SUPPORT"
                  startContent={<Headphones size={16} />}
                >
                  Support
                </SelectItem>
              </Select>
              <Input
                label="Avatar URL (Optional)"
                placeholder="https://example.com/avatar.jpg"
                value={formData.avatarUrl}
                onValueChange={(value) =>
                  setFormData({ ...formData, avatarUrl: value })
                }
              />
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Select
                label="Reports To"
                placeholder="Select a manager"
                selectedKeys={
                  formData.reportsToId
                    ? new Set([formData.reportsToId])
                    : new Set([])
                }
                onSelectionChange={(keys) =>
                  setFormData({
                    ...formData,
                    reportsToId: Array.from(keys)[0] as string,
                  })
                }
              >
                {potentialManagers.map((m) => (
                  <SelectItem
                    key={m.id}
                    textValue={m.name}
                    startContent={
                      <Avatar src={m.avatarUrl} name={m.name} size="sm" />
                    }
                  >
                    <div className="flex flex-col">
                      <span className="text-small">{m.name}</span>
                      <span className="text-tiny text-default-400">
                        {m.role}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </Select>

              <Switch
                isSelected={formData.isActive}
                onValueChange={(value) =>
                  setFormData({ ...formData, isActive: value })
                }
              >
                Active User
              </Switch>
            </div>
            <p className="text-xs text-default-500 mt-2">
              A temporary password will be sent to the user's email address.
            </p>
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
            <Button color="primary" onPress={handleAddUser}>
              Add User
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          resetForm();
        }}
        size="2xl"
      >
        <ModalContent>
          <ModalHeader>
            {selectedUser?.id === currentUser?.id
              ? "Edit My Profile"
              : "Edit User"}
          </ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                isRequired
                value={formData.name}
                onValueChange={(value) =>
                  setFormData({ ...formData, name: value })
                }
              />
              <Input
                label="Email"
                type="email"
                isRequired
                value={formData.email}
                onValueChange={(value) =>
                  setFormData({ ...formData, email: value })
                }
              />
              <Select
                label="Role"
                isDisabled={
                  selectedUser?.id === currentUser?.id &&
                  currentUser?.role !== "ADMIN"
                }
                selectedKeys={new Set([formData.role])}
                onSelectionChange={(keys) =>
                  setFormData({
                    ...formData,
                    role: Array.from(keys)[0] as UserRole,
                  })
                }
              >
                <SelectItem key="ADMIN" startContent={<Crown size={16} />}>
                  Admin
                </SelectItem>
                <SelectItem
                  key="MANAGER"
                  startContent={<ShieldCheck size={16} />}
                >
                  Manager
                </SelectItem>
                <SelectItem key="SALES" startContent={<Briefcase size={16} />}>
                  Sales
                </SelectItem>
                <SelectItem
                  key="SUPPORT"
                  startContent={<Headphones size={16} />}
                >
                  Support
                </SelectItem>
              </Select>
              <Input
                label="Avatar URL (Optional)"
                placeholder="https://example.com/avatar.jpg"
                value={formData.avatarUrl}
                onValueChange={(value) =>
                  setFormData({ ...formData, avatarUrl: value })
                }
              />
            </div>
            {isAdmin && selectedUser?.id !== currentUser?.id && (
              <div className="flex items-center gap-2 mt-4">
                <Switch
                  isSelected={formData.isActive}
                  onValueChange={(value) =>
                    setFormData({ ...formData, isActive: value })
                  }
                >
                  Active User
                </Switch>
              </div>
            )}
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
            <Button color="primary" onPress={handleEditUser}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Invite Users Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        size="lg"
      >
        <ModalContent>
          <ModalHeader>Send Invitations</ModalHeader>
          <ModalBody>
            <p className="text-sm text-default-500 mb-4">
              Enter email addresses separated by commas. Each user will receive
              an invitation to join your organization.
            </p>
            <Input
              label="Email Addresses"
              placeholder="email1@example.com, email2@example.com"
              value={inviteEmails}
              onValueChange={setInviteEmails}
            />
            <p className="text-xs text-default-500 mt-2">
              New users will be created with the SALES role by default. You can
              change their role after they accept the invitation.
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

      {/* Reset Password Modal */}
      <Modal
        isOpen={isResetPasswordModalOpen}
        onClose={() => setIsResetPasswordModalOpen(false)}
        size="sm"
      >
        <ModalContent>
          <ModalHeader>Reset Password</ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to reset the password for{" "}
              <strong>{selectedUser?.name}</strong>?
            </p>
            <p className="text-sm text-default-500 mt-2">
              A new temporary password will be sent to their email address.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => setIsResetPasswordModalOpen(false)}
            >
              Cancel
            </Button>
            <Button color="warning" onPress={handleResetPassword}>
              Reset Password
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete User Modal */}
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
              This action cannot be undone. All data associated with this user
              will be permanently deleted.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button color="danger" onPress={handleDeleteUser}>
              Delete User
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
