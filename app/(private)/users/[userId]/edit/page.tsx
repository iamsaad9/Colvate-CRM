"use client";

import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Input,
  Select,
  SelectItem,
  Skeleton,
  Switch,
} from "@heroui/react";
import { ArrowLeft, Save, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import {
  User,
  UserFormData,
  UserRole,
  getRoleIcon,
  getRoleColor,
  formatDate,
} from "@/app/components/users/user-shared";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  const currentUser = useUser();

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    role: "SALES",
    avatarUrl: "",
    isActive: true,
    reportsToId: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = currentUser?.role === "ADMIN";
  const isManager = currentUser?.role === "MANAGER";
  const isCurrentUser = userId === currentUser?.id;

  // Access guard
  const canEditRole = isAdmin;
  const canEditStatus = isAdmin && !isCurrentUser;
  const canEditReportsTo = isAdmin;

  useEffect(() => {
    if (!currentUser?.companyId) return;
    fetch(`/api/users?companyId=${currentUser.companyId}`)
      .then((r) => r.json())
      .then((users: User[]) => {
        setAllUsers(users);
        const found = users.find((u) => u.id === userId);
        if (found) {
          setTargetUser(found);
          setFormData({
            name: found.name,
            email: found.email,
            role: found.role,
            avatarUrl: found.avatarUrl ?? "",
            isActive: found.isActive,
            reportsToId: found.reportsToId ?? null,
          });
        }
        setIsLoading(false);
      })
      .catch(console.error);
  }, [currentUser?.companyId, userId]);

  const availableManagers = useMemo(() => {
    if (isManager) return allUsers.filter((u) => u.id === currentUser?.id);
    return allUsers.filter(
      (u) => (u.role === "ADMIN" || u.role === "MANAGER") && u.id !== userId,
    );
  }, [allUsers, isManager, currentUser?.id, userId]);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(
        `/api/users/${userId}?companyId=${currentUser?.companyId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );
      if (res.ok) {
        router.replace(`/users/${userId}`);
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
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48 rounded-lg" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  if (!targetUser) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center py-24">
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

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            isIconOnly
            variant="flat"
            radius="full"
            onPress={() => router.replace(`/users/${userId}`)}
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">
                {isCurrentUser ? "Edit My Profile" : "Edit User"}
              </h1>
              <Chip
                size="sm"
                color={getRoleColor(targetUser.role)}
                variant="flat"
              >
                {targetUser.role}
              </Chip>
            </div>
            <p className="text-default-400 text-sm">{targetUser.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="flat"
            radius="full"
            startContent={<X size={16} />}
            onPress={() => router.replace(`/users/${userId}`)}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            radius="full"
            startContent={<Save size={16} />}
            onPress={handleSave}
            isLoading={isSubmitting}
            isDisabled={!formData.name || !formData.email}
          >
            Save Changes
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <h2 className="text-lg font-semibold">User Details</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              isRequired
              value={formData.name}
              onValueChange={(v) => setFormData({ ...formData, name: v })}
            />
            <Input
              label="Email"
              type="email"
              isRequired
              value={formData.email}
              onValueChange={(v) => setFormData({ ...formData, email: v })}
            />

            <Select
              label="Role"
              isDisabled={!canEditRole}
              selectedKeys={new Set([formData.role])}
              onSelectionChange={(keys) =>
                setFormData({
                  ...formData,
                  role: Array.from(keys)[0] as UserRole,
                })
              }
            >
              {(["ADMIN", "MANAGER", "SALES", "SUPPORT"] as UserRole[]).map(
                (r) => (
                  <SelectItem key={r} startContent={getRoleIcon(r)}>
                    {r}
                  </SelectItem>
                ),
              )}
            </Select>

            <Input
              label="Avatar URL (Optional)"
              placeholder="https://..."
              value={formData.avatarUrl}
              onValueChange={(v) => setFormData({ ...formData, avatarUrl: v })}
            />

            {/* Reports To — only admin can change this */}
            <Select
              label="Reports To"
              placeholder="Select a manager"
              className="md:col-span-2"
              isDisabled={!canEditReportsTo}
              selectedKeys={
                formData.reportsToId
                  ? new Set([formData.reportsToId])
                  : new Set()
              }
              onSelectionChange={(keys) =>
                setFormData({
                  ...formData,
                  reportsToId: (Array.from(keys)[0] as string) ?? null,
                })
              }
            >
              {availableManagers.map((m) => (
                <SelectItem
                  key={m.id}
                  textValue={m.name}
                  startContent={
                    <Avatar src={m.avatarUrl} name={m.name} size="sm" />
                  }
                >
                  <div className="flex flex-col">
                    <span className="text-small">{m.name}</span>
                    <span className="text-tiny text-default-400">{m.role}</span>
                  </div>
                </SelectItem>
              ))}
            </Select>

            {canEditStatus && (
              <div className="md:col-span-2">
                <Switch
                  isSelected={formData.isActive}
                  onValueChange={(v) =>
                    setFormData({ ...formData, isActive: v })
                  }
                >
                  Active User
                </Switch>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
