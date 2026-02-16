"use client";

import { useState } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Input,
  Badge,
  Avatar,
  Kbd,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Listbox,
  ListboxItem,
  Chip,
  Divider,
} from "@heroui/react";
import {
  Search,
  Plus,
  Bell,
  User,
  Settings,
  Users,
  CreditCard,
  LogOut,
  Building2,
  ChevronDown,
  UserPlus,
  FileText,
  Package,
  Briefcase,
  Mail,
  Phone,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Menu,
  Home,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { getCurrentUser } from "../lib/get-current-user";

// Types
type UserRole = "ADMIN" | "MANAGER" | "SALES" | "SUPPORT";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

interface Company {
  id: string;
  name: string;
  logoUrl?: string;
}

interface Notification {
  id: string;
  type: "lead" | "invoice" | "deal" | "task" | "assignment";
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: React.ReactNode;
}

interface SearchResult {
  id: string;
  type: "lead" | "deal" | "customer" | "invoice";
  title: string;
  subtitle: string;
  metadata?: string;
}

interface HeaderProps {
  user: User;
  company: Company;
}

export default function Header({}: HeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState("/");
  const user = getCurrentUser();

  const isAdmin = user.role === "ADMIN" || user.role === "MANAGER";

  const handleNavigate = (path: string) => {
    console.log("Navigating to:", path);
    setCurrentPath(path);
    // In a real app, use: router.push(path)
  };

  const handleLogout = () => {
    console.log("Logging out...");
    // Handle logout logic (clear session, redirect to login, etc.)
  };

  // Mock company data
  const company = {
    id: "company-123",
    name: "TechCorp Solutions",
    logoUrl: undefined, // or provide a logo URL
  };

  // Mock notifications - replace with actual data
  const notifications: Notification[] = [
    {
      id: "1",
      type: "lead",
      title: "New Lead Received",
      message: "Sarah Johnson from Acme Corp submitted a contact form",
      time: "5 mins ago",
      read: false,
      icon: <UserPlus className="text-blue-500" size={20} />,
    },
    {
      id: "2",
      type: "invoice",
      title: "Invoice Paid",
      message: "Invoice #INV-2024-001 has been paid by TechStart Inc",
      time: "1 hour ago",
      read: false,
      icon: <CheckCircle className="text-green-500" size={20} />,
    },
    {
      id: "3",
      type: "assignment",
      title: "Lead Assigned",
      message: "Michael Chen has been assigned to you",
      time: "2 hours ago",
      read: false,
      icon: <User className="text-purple-500" size={20} />,
    },
    {
      id: "4",
      type: "deal",
      title: "Deal Stage Updated",
      message: "Enterprise Solution deal moved to Negotiation",
      time: "3 hours ago",
      read: true,
      icon: <TrendingUp className="text-orange-500" size={20} />,
    },
    {
      id: "5",
      type: "task",
      title: "Task Due Soon",
      message: "Follow up with David Kim is due in 30 minutes",
      time: "4 hours ago",
      read: true,
      icon: <Clock className="text-red-500" size={20} />,
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Mock search results - replace with actual API call
  const getSearchResults = (query: string): SearchResult[] => {
    if (!query || query.length < 2) return [];

    return [
      {
        id: "1",
        type: "lead",
        title: "Sarah Johnson",
        subtitle: "sarah.j@company.com",
        metadata: "New • Website",
      },
      {
        id: "2",
        type: "customer",
        title: "Acme Corporation",
        subtitle: "acme@corp.com",
        metadata: "Active • 5 deals",
      },
      {
        id: "3",
        type: "deal",
        title: "Enterprise Solution",
        subtitle: "$45,000",
        metadata: "Negotiation",
      },
      {
        id: "4",
        type: "invoice",
        title: "INV-2024-001",
        subtitle: "TechStart Inc",
        metadata: "Paid • $12,500",
      },
      {
        id: "5",
        type: "lead",
        title: "Michael Chen",
        subtitle: "m.chen@tech.io",
        metadata: "Contacted • Referral",
      },
    ].filter(
      (item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(query.toLowerCase()),
    );
  };

  const searchResults = getSearchResults(searchQuery);

  const getSearchTypeIcon = (type: string) => {
    switch (type) {
      case "lead":
        return <UserPlus size={16} />;
      case "customer":
        return <Building2 size={16} />;
      case "deal":
        return <Briefcase size={16} />;
      case "invoice":
        return <FileText size={16} />;
      default:
        return <Search size={16} />;
    }
  };

  const getSearchTypeColor = (type: string) => {
    switch (type) {
      case "lead":
        return "primary";
      case "customer":
        return "secondary";
      case "deal":
        return "success";
      case "invoice":
        return "warning";
      default:
        return "default";
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return "danger";
      case "MANAGER":
        return "warning";
      case "SALES":
        return "primary";
      case "SUPPORT":
        return "secondary";
      default:
        return "default";
    }
  };

  const handleQuickAdd = (type: string) => {
    console.log(`Quick add: ${type}`);
    // Navigate to respective add page or open modal
    handleNavigate(`/${type}/new`);
  };

  const handleNotificationClick = (notification: Notification) => {
    console.log("Notification clicked:", notification);
    // Mark as read and navigate
  };

  const handleSearchResultClick = (result: SearchResult) => {
    console.log("Search result clicked:", result);
    setIsSearchOpen(false);
    setSearchQuery("");

    handleNavigate(`/${result.type}s/${result.id}`);
  };

  return (
    <>
      <Navbar
        maxWidth="full"
        className="border-b border-divider"
        classNames={{
          wrapper: "px-4 sm:px-6",
        }}
      >
        <NavbarContent justify="start">
          <NavbarBrand className="gap-4">
            <Dropdown>
              <DropdownTrigger>
                <div className="flex items-center gap-3 cursor-pointer">
                  {company.logoUrl ? (
                    <img
                      src={company.logoUrl}
                      alt={company.name}
                      className="h-8 w-8 rounded-lg"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Building2 className="text-white" size={20} />
                    </div>
                  )}
                  <div className="hidden sm:block">
                    <p className="font-bold text-lg">{company.name}</p>
                    <p className="text-xs text-default-500">CRM Dashboard</p>
                  </div>
                  <ChevronDown size={16} className="hidden sm:block" />
                </div>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Quick add actions"
                className="flex! flex-row gap-2"
                onAction={(key) => handleQuickAdd(key as string)}
              >
                <DropdownSection title="Navigation">
                  <DropdownItem
                    key="dashboard"
                    href="/dashboard"
                    startContent={<Home size={18} />}
                  >
                    DashBoard
                  </DropdownItem>
                  <DropdownItem
                    key="leads"
                    href="/leads"
                    startContent={<Package size={18} />}
                  >
                    Leads
                  </DropdownItem>
                  <DropdownItem
                    key="deals"
                    href="/deals"
                    startContent={<Package size={18} />}
                  >
                    Deals
                  </DropdownItem>
                </DropdownSection>

                <DropdownSection title="Business">
                  <DropdownItem
                    key="service"
                    href="/"
                    description="Swith to Service Page"
                    startContent={<Package size={18} />}
                  >
                    Service Page
                  </DropdownItem>
                  {isAdmin && (
                    <>
                      <DropdownItem
                        key="company-settings"
                        description="Manage company settings and preferences"
                        startContent={<Building2 size={18} />}
                      >
                        Company Settings
                      </DropdownItem>
                      <DropdownItem
                        key="team-members"
                        description="View and manage team members"
                        startContent={<Users size={18} />}
                      >
                        Team Members
                      </DropdownItem>
                      <DropdownItem
                        key="billing"
                        description="View billing details and manage subscription"
                        startContent={<CreditCard size={18} />}
                      >
                        Billing & Plans
                      </DropdownItem>
                    </>
                  )}
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>
          </NavbarBrand>

          {/* Role Badge */}
          <div className="hidden md:flex">
            <Chip
              size="sm"
              variant="flat"
              color={getRoleBadgeColor(user.role) as any}
              startContent={<User size={14} />}
            >
              {user.role}
            </Chip>
          </div>
        </NavbarContent>

        {/* Center - Global Search */}
        <NavbarContent
          justify="center"
          className="hidden lg:flex flex-1 max-w-2xl"
        >
          <NavbarItem className="w-full">
            <Input
              classNames={{
                base: "w-full",
                inputWrapper: "bg-default-100",
              }}
              placeholder="Search leads, deals, customers, invoices..."
              size="sm"
              startContent={<Search size={18} className="text-default-400" />}
              endContent={
                <div className="flex items-center gap-1">
                  <Kbd keys={["command"]}>K</Kbd>
                </div>
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={() => setIsSearchOpen(true)}
            />
          </NavbarItem>
        </NavbarContent>

        {/* Right Side - Actions */}
        <NavbarContent justify="end" className="gap-2">
          {/* Mobile Search */}
          <NavbarItem className="lg:hidden">
            <Button
              isIconOnly
              variant="light"
              onPress={() => setIsSearchOpen(true)}
            >
              <Search size={20} />
            </Button>
          </NavbarItem>

          <ThemeSwitcher />

          {/* Quick Add Dropdown */}
          <NavbarItem>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  color="primary"
                  variant="solid"
                  radius="full"
                  startContent={<Plus size={18} />}
                  endContent={<ChevronDown size={16} />}
                  className="hidden sm:flex"
                >
                  Quick Add
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Quick add actions"
                onAction={(key) => handleQuickAdd(key as string)}
              >
                <DropdownSection title="Business">
                  <DropdownItem
                    key="service"
                    startContent={<Package size={18} />}
                    description="Add a new service"
                  >
                    Add Service
                  </DropdownItem>
                  <DropdownItem
                    key="invoice"
                    startContent={<FileText size={18} />}
                    description="Generate invoice"
                  >
                    Create Invoice
                  </DropdownItem>
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>

            {/* Mobile Quick Add */}
            {/* <Dropdown className="sm:hidden">
              <DropdownTrigger>
                <Button isIconOnly color="primary" variant="flat">
                  <Plus size={20} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Quick add actions"
                onAction={(key) => handleQuickAdd(key as string)}
              >
                <DropdownItem key="lead" startContent={<UserPlus size={18} />}>
                  Add Lead
                </DropdownItem>
                <DropdownItem key="deal" startContent={<Briefcase size={18} />}>
                  Create Deal
                </DropdownItem>
                <DropdownItem
                  key="service"
                  startContent={<Package size={18} />}
                >
                  Add Service
                </DropdownItem>
                <DropdownItem
                  key="invoice"
                  startContent={<FileText size={18} />}
                >
                  Create Invoice
                </DropdownItem>
              </DropdownMenu>
            </Dropdown> */}
          </NavbarItem>

          {/* Notifications */}
          <NavbarItem>
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button isIconOnly variant="light">
                  <Badge
                    content={unreadCount}
                    color="danger"
                    isInvisible={unreadCount === 0}
                    shape="circle"
                  >
                    <Bell size={20} />
                  </Badge>
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Notifications"
                className="w-80"
                classNames={{
                  base: "p-0",
                }}
              >
                <DropdownSection
                  title={`Notifications (${unreadCount} unread)`}
                  showDivider
                  classNames={{
                    heading: "px-4 py-3",
                  }}
                >
                  {notifications.map((notification) => (
                    <DropdownItem
                      key={notification.id}
                      className={`py-3 ${!notification.read ? "bg-primary-50" : ""}`}
                      textValue={notification.title}
                      onPress={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {notification.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold truncate">
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 ml-2" />
                            )}
                          </div>
                          <p className="text-xs text-default-500 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-default-400 mt-1">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </DropdownItem>
                  ))}
                </DropdownSection>
                <DropdownSection classNames={{ group: "p-2" }}>
                  <DropdownItem
                    key="view-all"
                    className="text-center text-primary"
                    textValue="View all notifications"
                  >
                    View All Notifications
                  </DropdownItem>
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>

          {/* User Menu */}
          <NavbarItem>
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button
                  variant="light"
                  className="gap-2 h-auto p-1 pr-2 data-[hover=true]:bg-default-100"
                >
                  <Avatar
                    name={user.name}
                    src={user.avatarUrl}
                    size="sm"
                    className="w-8 h-8"
                  />

                  <ChevronDown size={16} className="hidden sm:block" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="User menu" className="w-64">
                <DropdownSection showDivider>
                  <DropdownItem
                    key="profile"
                    className="h-auto py-3"
                    textValue="Profile"
                    isReadOnly
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} src={user.avatarUrl} size="md" />
                      <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-xs text-default-500">{user.email}</p>
                        <Chip
                          size="sm"
                          variant="flat"
                          color={getRoleBadgeColor(user.role) as any}
                          className="mt-1"
                        >
                          {user.role}
                        </Chip>
                      </div>
                    </div>
                  </DropdownItem>
                </DropdownSection>

                <DropdownSection showDivider>
                  <DropdownItem
                    key="my-profile"
                    startContent={<User size={18} />}
                  >
                    My Profile
                  </DropdownItem>
                </DropdownSection>

                <DropdownSection>
                  <DropdownItem
                    key="logout"
                    color="danger"
                    startContent={<LogOut size={18} />}
                    onPress={handleLogout}
                  >
                    Logout
                  </DropdownItem>
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      {/* Global Search Modal */}
      <Modal
        isOpen={isSearchOpen}
        onClose={() => {
          setIsSearchOpen(false);
          setSearchQuery("");
        }}
        size="2xl"
        isDismissable={false}
        placement="top"
        classNames={{
          base: "mt-20 p-5",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 pb-2">
            <Input
              autoFocus
              placeholder="Search leads, deals, customers, invoices..."
              size="lg"
              variant="bordered"
              startContent={<Search size={20} className="text-default-400" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              classNames={{
                input: "text-lg",
              }}
            />
          </ModalHeader>
          <ModalBody className="pb-6">
            {searchQuery.length < 2 ? (
              <div className="py-8 text-center text-default-500">
                <Search size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Start typing to search...</p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <Chip size="sm" variant="flat">
                    Leads
                  </Chip>
                  <Chip size="sm" variant="flat">
                    Deals
                  </Chip>
                  <Chip size="sm" variant="flat">
                    Customers
                  </Chip>
                  <Chip size="sm" variant="flat">
                    Invoices
                  </Chip>
                </div>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="py-8 text-center text-default-500">
                <Search size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No results found for "{searchQuery}"</p>
              </div>
            ) : (
              <Listbox
                aria-label="Search results"
                onAction={(key) => {
                  const result = searchResults.find((r) => r.id === key);
                  if (result) handleSearchResultClick(result);
                }}
              >
                {searchResults.map((result) => (
                  <ListboxItem
                    key={result.id}
                    textValue={result.title}
                    startContent={
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-default-100">
                        {getSearchTypeIcon(result.type)}
                      </div>
                    }
                    endContent={
                      <Chip
                        size="sm"
                        variant="flat"
                        color={getSearchTypeColor(result.type) as any}
                      >
                        {result.type}
                      </Chip>
                    }
                  >
                    <div>
                      <p className="font-semibold">{result.title}</p>
                      <p className="text-sm text-default-500">
                        {result.subtitle}
                      </p>
                      {result.metadata && (
                        <p className="text-xs text-default-400 mt-1">
                          {result.metadata}
                        </p>
                      )}
                    </div>
                  </ListboxItem>
                ))}
              </Listbox>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
