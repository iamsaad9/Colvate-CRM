"use client";

import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Select,
  SelectItem,
  Switch,
  Skeleton,
} from "@heroui/react";
import {
  ArrowLeft,
  Briefcase,
  Crown,
  Headphones,
  Save,
  ShieldCheck,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import {
  User,
  UserFormData,
  UserRole,
  EMPTY_USER_FORM,
  getRoleIcon,
} from "@/app/components/users/user-shared";
import { report } from "process";

export default function NewUserPage() {
  const router = useRouter();
  const currentUser = useUser();

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<UserFormData>({
    ...EMPTY_USER_FORM,
    // If a manager is creating, default reportsToId to themselves
    reportsToId: currentUser?.role === "MANAGER" ? currentUser.id : null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = currentUser?.role === "ADMIN";
  const isManager = currentUser?.role === "MANAGER";

  useEffect(() => {
    if (!currentUser?.companyId) return;
    fetch(`/api/users?companyId=${currentUser.companyId}`)
      .then((r) => r.json())
      .then((data) => {
        setAllUsers(data);
        setIsLoading(false);
      })
      .catch(console.error);
  }, [currentUser?.companyId]);

  // Managers can only assign their team to themselves
  // Admins can assign to any admin/manager
  const availableManagers = useMemo(() => {
    if (isManager) return allUsers.filter((u) => u.id === currentUser?.id);
    return allUsers.filter((u) => u.role === "ADMIN" || u.role === "MANAGER");
  }, [allUsers, isManager, currentUser?.id]);

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      alert("Name and email are required.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          reportsToId:
            formData.reportsToId ?? (isManager ? currentUser?.id : null),
          companyId: currentUser?.companyId,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        router.replace(`/users/${created.id}`);
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

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
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
          <h1 className="text-2xl font-bold">Add New User</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="flat"
            radius="full"
            startContent={<X size={16} />}
            onPress={() => router.push("/users")}
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
            Create User
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
              placeholder="Jane Smith"
              isRequired
              value={formData.name}
              onValueChange={(v) => setFormData({ ...formData, name: v })}
            />
            <Input
              label="Email"
              type="email"
              placeholder="jane@company.com"
              isRequired
              value={formData.email}
              onValueChange={(v) => setFormData({ ...formData, email: v })}
            />

            {/* Managers can only create SALES/SUPPORT users under them */}
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
              {(isAdmin
                ? ["ADMIN", "MANAGER", "SALES", "SUPPORT"]
                : ["SALES", "SUPPORT"]
              ).map((r) => (
                <SelectItem key={r} startContent={getRoleIcon(r as UserRole)}>
                  {r}
                </SelectItem>
              ))}
            </Select>

            <Input
              label="Avatar URL (Optional)"
              placeholder="https://..."
              value={formData.avatarUrl}
              onValueChange={(v) => setFormData({ ...formData, avatarUrl: v })}
            />

            {/* Reports To */}
            <Select
              label="Reports To"
              placeholder={isManager ? "You (default)" : "Select a manager"}
              className="md:col-span-2"
              isDisabled={isManager} // managers always report to themselves
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

            <div className="md:col-span-2 flex items-center gap-3">
              <Switch
                isSelected={formData.isActive}
                onValueChange={(v) => setFormData({ ...formData, isActive: v })}
              >
                Active User
              </Switch>
              <p className="text-xs text-default-500">
                A temporary password will be sent to the user&apos;s email.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
