"use client";

import { useEffect, useState } from "react";
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
  Target,
  Handshake,
  User2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { useUser } from "../context/UserContext";

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

export default function Header() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState("/");
  const user = useUser();

  const isAdmin = user?.role === "ADMIN" || user?.role === "MANAGER";

  const handleNavigate = (path: string) => {
    console.log("Navigating to:", path);
    setCurrentPath(path);
    // Perform real navigation
    try {
      void router.push(path);
    } catch (err) {
      console.error("Navigation error:", err);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/login");
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

  const handleNotificationClick = (notification: Notification) => {
    console.log("Notification clicked:", notification);
    // Mark as read and navigate
  };

  const handleSearchResultClick = (result: SearchResult) => {
    console.log("Search result clicked:", result);
    setSearchQuery("");

    handleNavigate(`/${result.type}s/${result.id}`);
  };

  return (
    <>
      <Navbar
        maxWidth="full"
        className="border-b border-divider bg-linear-to-r from-default/30 to-primary/50"
        classNames={{
          wrapper: "px-4 sm:px-6",
        }}
      >
        <NavbarContent justify="start">
          <NavbarBrand className="gap-4">
            <Dropdown radius="sm">
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
                className="flex! flex-row"
              >
                <DropdownSection title="Navigation">
                  <DropdownItem
                    key="dashboard"
                    as={Link} // Forces Next.js routing logic
                    href="/dashboard"
                    className="py-2"
                    startContent={<Home size={18} />}
                  >
                    DashBoard
                  </DropdownItem>
                  <DropdownItem
                    key="allLeads"
                    as={Link} // Forces Next.js routing logic
                    href="/leads"
                    className="py-2"
                    startContent={<Target size={18} />}
                  >
                    All Leads
                  </DropdownItem>
                  <DropdownItem
                    key="allDeals"
                    as={Link}
                    href="/deals"
                    className="py-2"
                    startContent={<Handshake size={18} />}
                  >
                    All Deals
                  </DropdownItem>
                  <DropdownItem
                    key="allUsers"
                    as={Link}
                    href="/users"
                    className="py-2"
                    startContent={<Users size={18} />}
                  >
                    All Users
                  </DropdownItem>
                  <DropdownItem
                    key="allServices"
                    as={Link}
                    href="/company-services"
                    className="py-2"
                    startContent={<Package size={18} />}
                  >
                    All Services
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
              color={getRoleBadgeColor(user?.role) as any}
              startContent={<User size={14} />}
            >
              {user?.role}
            </Chip>
          </div>
        </NavbarContent>

        {/* Center - Global Search */}
        <NavbarContent
          justify="center"
          className="hidden lg:flex flex-1 max-w-2xl"
        >
          <NavbarItem className="w-full relative">
            <Input
              classNames={{
                base: "w-full",
                inputWrapper:
                  "border border-default bg-background/90 hover:bg-background/90! ",
              }}
              radius="sm"
              placeholder="Search leads, deals, customers, invoices..."
              size="md"
              startContent={<Search size={18} className="text-default-400" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Inline dropdown for desktop */}
            {searchQuery.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 z-50 max-h-80 overflow-auto bg-default-50 border border-divider rounded-lg shadow-lg p-2">
                {searchQuery.length < 1 ? (
                  <div className="py-4 text-center text-default-500">
                    <Search size={36} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Start typing to search...</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-3">
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
                  <div className="py-4 text-center text-default-500">
                    <Search size={36} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">
                      No results found for "{searchQuery}"
                    </p>
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
              </div>
            )}
          </NavbarItem>
        </NavbarContent>

        {/* Right Side - Actions */}
        <NavbarContent justify="end" className="gap-2">
          {/* Mobile Search */}

          <ThemeSwitcher />

          {/* Quick Add Dropdown */}
          <NavbarItem>
            <Dropdown radius="sm">
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
              <DropdownMenu aria-label="Quick add actions">
                <DropdownSection title="Business">
                  <DropdownItem
                    key="lead"
                    startContent={<Plus size={18} />}
                    description="Create a new Lead"
                    as={Link}
                    href="/leads/new"
                  >
                    Create Lead
                  </DropdownItem>

                  <DropdownItem
                    key="deal"
                    startContent={<Plus size={18} />}
                    as={Link}
                    href="/deals/new"
                    description="Create a new deal"
                  >
                    Create Deal
                  </DropdownItem>

                  <DropdownItem
                    key="service"
                    startContent={<Package size={18} />}
                    description="Add a new service"
                    as={Link}
                    href="/company-services/new"
                  >
                    Add Service
                  </DropdownItem>
                  <DropdownItem
                    key="user"
                    startContent={<User2 size={18} />}
                    description="Add a new User"
                    as={Link}
                    href="/users/new"
                  >
                    Add User
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
                <Button variant="light" className="gap-2 h-auto p-1 pr-2 ">
                  <Avatar
                    name={user?.name}
                    src={user?.avatarUrl}
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
                      <Avatar
                        name={user?.name}
                        src={user?.avatarUrl}
                        size="md"
                        color="primary"
                      />
                      <div>
                        <p className="font-semibold">{user?.name}</p>
                        <p className="text-xs text-default-500">
                          {user?.email}
                        </p>
                        <Chip
                          size="sm"
                          variant="flat"
                          color={getRoleBadgeColor(user?.role) as any}
                          className="mt-1"
                        >
                          {user?.role}
                        </Chip>
                      </div>
                    </div>
                  </DropdownItem>
                </DropdownSection>

                <DropdownSection showDivider>
                  <DropdownItem
                    key="my-profile"
                    startContent={<User size={18} />}
                    description="View and edit your profile information"
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
                    description="Sign out of your account"
                  >
                    Logout
                  </DropdownItem>
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      {/* Mobile search panel (small screens) */}
      {searchQuery.length > 0 && (
        <div className="lg:hidden fixed top-16 left-0 right-0 z-50 p-4 bg-default-50 border-t border-divider">
          <div className="max-w-3xl mx-auto">
            <Input
              autoFocus
              placeholder="Search leads, deals, customers, invoices..."
              size="md"
              startContent={<Search size={18} className="text-default-400" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              classNames={{ input: "text-base" }}
            />

            <div className="mt-2 bg-default-50">
              {searchQuery.length < 2 ? (
                <div className="py-4 text-center text-default-500">
                  <Search size={36} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Start typing to search...</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-4 text-center text-default-500">
                  <Search size={36} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">
                    No results found for "{searchQuery}"
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-divider rounded">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleSearchResultClick(result)}
                      className="w-full text-left py-3 px-2 hover:bg-default-100 flex items-center gap-3"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-default-100">
                        {getSearchTypeIcon(result.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{result.title}</p>
                        <p className="text-sm text-default-500">
                          {result.subtitle}
                        </p>
                      </div>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={getSearchTypeColor(result.type) as any}
                      >
                        {result.type}
                      </Chip>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
