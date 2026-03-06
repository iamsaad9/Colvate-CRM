"use client";

import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Skeleton,
} from "@heroui/react";
import {
  ArrowLeft,
  Briefcase,
  CheckSquare,
  Edit,
  Key,
  Mail,
  Phone,
  Target,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import {
  User,
  formatDate,
  getRoleIcon,
  getRoleColor,
} from "@/app/components/users/user-shared";

export default function ViewUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  const currentUser = useUser();

  const [user, setUser] = useState<User | null>(null);
  const [managerUser, setManagerUser] = useState<User | null>(null);
  const [directReports, setDirectReports] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = currentUser?.role === "ADMIN";
  const isManager = currentUser?.role === "MANAGER";
  const isCurrentUser = userId === currentUser?.id;

  const canEdit =
    isAdmin ||
    isCurrentUser ||
    (isManager && user?.reportsToId === currentUser?.id);

  const canDelete = isAdmin && !isCurrentUser;

  useEffect(() => {
    if (!currentUser?.companyId) return;
    setIsLoading(true);
    fetch(`/api/users?companyId=${currentUser.companyId}`)
      .then((r) => r.json())
      .then((users: User[]) => {
        setAllUsers(users);
        const found = users.find((u) => u.id === userId) ?? null;
        setUser(found);
        if (found?.reportsToId) {
          setManagerUser(users.find((u) => u.id === found.reportsToId) ?? null);
        }
        setDirectReports(users.filter((u) => u.reportsToId === userId));
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [currentUser?.companyId, userId]);

  const handleDelete = async () => {
    if (!confirm(`Delete ${user?.name}? This cannot be undone.`)) return;
    try {
      await fetch(`/api/users/${userId}?companyId=${currentUser?.companyId}`, {
        method: "DELETE",
      });
      router.push("/users");
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async () => {
    if (!user) return;
    try {
      const res = await fetch(
        `/api/users/${userId}?companyId=${currentUser?.companyId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !user.isActive }),
        },
      );
      if (res.ok) setUser({ ...user, isActive: !user.isActive });
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48 rounded-lg" />
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <div className="col-span-2 space-y-4">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center py-24">
        <p className="text-default-400 text-lg">User not found.</p>
        <Button
          className="mt-4"
          variant="flat"
          onPress={() => router.push("/users")}
        >
          Back to Team
        </Button>
      </div>
    );
  }

  const roleMeta = getRoleColor(user.role);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            isIconOnly
            variant="flat"
            radius="full"
            onPress={() => router.push("/users")}
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              {isCurrentUser && (
                <Chip size="sm" color="primary" variant="flat">
                  You
                </Chip>
              )}
              <Chip
                size="sm"
                color={roleMeta}
                variant="flat"
                startContent={getRoleIcon(user.role)}
              >
                {user.role}
              </Chip>
              {!user.isActive && (
                <Chip size="sm" color="danger" variant="flat">
                  Inactive
                </Chip>
              )}
            </div>
            <p className="text-default-400 text-sm">
              Member since {formatDate(user.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {canDelete && (
            <Button
              variant="flat"
              color="danger"
              startContent={<Trash2 size={16} />}
              onPress={handleDelete}
            >
              Delete
            </Button>
          )}
          {isAdmin && !isCurrentUser && (
            <Button
              variant="flat"
              startContent={
                user.isActive ? <UserX size={16} /> : <UserCheck size={16} />
              }
              onPress={handleToggleStatus}
            >
              {user.isActive ? "Deactivate" : "Activate"}
            </Button>
          )}
          {canEdit && (
            <Button
              color="primary"
              startContent={<Edit size={16} />}
              onPress={() => router.push(`/users/${userId}/edit`)}
            >
              {isCurrentUser ? "Edit Profile" : "Edit User"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile card */}
        <div className="space-y-6">
          <Card>
            <CardBody className="flex flex-col items-center text-center p-8">
              <Badge
                content={!user.isActive ? <UserX size={14} /> : ""}
                color="danger"
                placement="bottom-right"
                isInvisible={user.isActive}
              >
                <Avatar
                  src={user.avatarUrl}
                  name={user.name}
                  className="w-24 h-24 text-large"
                />
              </Badge>
              <h2 className="text-xl font-bold mt-4">{user.name}</h2>
              <p className="text-default-500 text-sm">{user.email}</p>
              <Chip
                size="sm"
                variant="flat"
                color={roleMeta}
                startContent={getRoleIcon(user.role)}
                className="mt-2"
              >
                {user.role}
              </Chip>

              <Divider className="my-4 w-full" />

              <div className="w-full space-y-2 text-left">
                <div className="flex items-center gap-2 text-sm">
                  <Mail size={14} className="text-default-400" />
                  <a
                    href={`mailto:${user.email}`}
                    className="text-primary hover:underline truncate"
                  >
                    {user.email}
                  </a>
                </div>
              </div>

              {managerUser && (
                <>
                  <Divider className="my-4 w-full" />
                  <div className="w-full">
                    <p className="text-xs text-default-400 mb-2 text-left">
                      Reports To
                    </p>
                    <div
                      className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                      onClick={() => router.push(`/users/${managerUser.id}`)}
                    >
                      <Avatar
                        src={managerUser.avatarUrl}
                        name={managerUser.name}
                        size="sm"
                      />
                      <div className="text-left">
                        <p className="text-sm font-medium">
                          {managerUser.name}
                        </p>
                        <p className="text-xs text-default-400">
                          {managerUser.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardBody>
          </Card>

          {/* Quick actions */}
          <Card>
            <CardHeader className="pb-0">
              <h2 className="text-base font-semibold">Quick Actions</h2>
            </CardHeader>
            <CardBody className="space-y-2">
              <Button
                fullWidth
                variant="flat"
                startContent={<Mail size={16} />}
                onPress={() => {
                  window.location.href = `mailto:${user.email}`;
                }}
              >
                Send Email
              </Button>
              {isAdmin && (
                <Button
                  fullWidth
                  variant="flat"
                  startContent={<Key size={16} />}
                >
                  Reset Password
                </Button>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right: Stats + reports */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader className="pb-0">
              <h2 className="text-lg font-semibold">Activity</h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    icon: <Target size={20} />,
                    label: "Leads",
                    value: user.leadsCount ?? 0,
                    color: "text-primary bg-primary-50",
                  },
                  {
                    icon: <Briefcase size={20} />,
                    label: "Deals",
                    value: user.dealsCount ?? 0,
                    color: "text-success bg-success-50",
                  },
                  {
                    icon: <CheckSquare size={20} />,
                    label: "Tasks",
                    value: user.tasksCount ?? 0,
                    color: "text-warning bg-warning-50",
                  },
                  {
                    icon: <UserCheck size={20} />,
                    label: "Customers",
                    value: user.customersCount ?? 0,
                    color: "text-secondary bg-secondary-50",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="text-center p-4 rounded-xl bg-default-50"
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 ${s.color}`}
                    >
                      {s.icon}
                    </div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-default-400">{s.label}</p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader className="pb-0">
              <h2 className="text-lg font-semibold">Details</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-default-400 mb-1">Status</p>
                  <Chip
                    size="sm"
                    variant="dot"
                    color={user.isActive ? "success" : "danger"}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </Chip>
                </div>
                <div>
                  <p className="text-xs text-default-400 mb-1">Role</p>
                  <Chip
                    size="sm"
                    variant="flat"
                    color={roleMeta}
                    startContent={getRoleIcon(user.role)}
                  >
                    {user.role}
                  </Chip>
                </div>
                <div>
                  <p className="text-xs text-default-400 mb-1">Member Since</p>
                  <p className="text-sm">{formatDate(user.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-default-400 mb-1">Last Updated</p>
                  <p className="text-sm">{formatDate(user.updatedAt)}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Direct Reports */}
          {directReports.length > 0 && (
            <Card>
              <CardHeader className="pb-0">
                <h2 className="text-lg font-semibold">
                  Direct Reports{" "}
                  <Chip size="sm" variant="flat" className="ml-2">
                    {directReports.length}
                  </Chip>
                </h2>
              </CardHeader>
              <CardBody className="space-y-2">
                {directReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-default-50 cursor-pointer hover:bg-default-100"
                    onClick={() => router.push(`/users/${report.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={report.avatarUrl}
                        name={report.name}
                        size="sm"
                      />
                      <div>
                        <p className="font-medium text-sm">{report.name}</p>
                        <p className="text-xs text-default-400">
                          {report.email}
                        </p>
                      </div>
                    </div>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={getRoleColor(report.role)}
                    >
                      {report.role}
                    </Chip>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
