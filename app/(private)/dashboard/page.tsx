"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Avatar,
  Progress,
  Tabs,
  Tab,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  FileText,
  Target,
  Calendar,
  Clock,
  AlertCircle,
  Plus,
  UserPlus,
  Filter,
  Download,
  MoreVertical,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  Briefcase,
  Package,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Types based on Prisma schema
type UserRole = "ADMIN" | "MANAGER" | "SALES" | "SUPPORT";
type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "LOST";
type DealStage = "PROSPECT" | "NEGOTIATION" | "WON" | "LOST";
type TaskStatus = "PENDING" | "IN_PROGRESS" | "DONE";
type Priority = "LOW" | "MEDIUM" | "HIGH";

interface DashboardProps {
  userRole: UserRole;
  userId: string;
  companyId: string;
}

export default function Dashboard({ userRole }: DashboardProps) {
  const [timeRange, setTimeRange] = useState("month");
  const [selectedTab, setSelectedTab] = useState("overview");

  // Mock data - replace with actual API calls
  const kpiData = {
    totalLeads: { value: 248, change: 12.5, trend: "up" },
    newLeadsToday: { value: 8, change: -2.3, trend: "down" },
    dealsWon: { value: 34, change: 8.7, trend: "up" },
    revenue: { value: 487500, change: 15.2, trend: "up" },
    outstandingInvoices: { value: 125000, change: -5.4, trend: "down" },
    conversionRate: { value: 13.7, change: 2.1, trend: "up" },
  };

  const recentLeads = [
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah.j@company.com",
      phone: "+1 234 567 8900",
      status: "NEW" as LeadStatus,
      source: "Website",
      assignedTo: "John Doe",
      createdAt: "2 hours ago",
    },
    {
      id: "2",
      name: "Michael Chen",
      email: "m.chen@tech.io",
      phone: "+1 234 567 8901",
      status: "CONTACTED" as LeadStatus,
      source: "Referral",
      assignedTo: "Jane Smith",
      createdAt: "5 hours ago",
    },
    {
      id: "3",
      name: "Emily Rodriguez",
      email: "emily.r@business.com",
      phone: "+1 234 567 8902",
      status: "QUALIFIED" as LeadStatus,
      source: "LinkedIn",
      assignedTo: "John Doe",
      createdAt: "1 day ago",
    },
    {
      id: "4",
      name: "David Kim",
      email: "david.k@startup.io",
      phone: "+1 234 567 8903",
      status: "NEW" as LeadStatus,
      source: "Cold Email",
      assignedTo: "Jane Smith",
      createdAt: "1 day ago",
    },
    {
      id: "5",
      name: "Lisa Thompson",
      email: "lisa.t@enterprise.com",
      phone: "+1 234 567 8904",
      status: "CONTACTED" as LeadStatus,
      source: "Trade Show",
      assignedTo: "John Doe",
      createdAt: "2 days ago",
    },
  ];

  const tasks = [
    {
      id: "1",
      title: "Follow up with Sarah Johnson",
      type: "LEAD",
      priority: "HIGH" as Priority,
      dueDate: "Today, 2:00 PM",
      status: "PENDING" as TaskStatus,
      overdue: false,
    },
    {
      id: "2",
      title: "Send proposal to Michael Chen",
      type: "DEAL",
      priority: "HIGH" as Priority,
      dueDate: "Today, 4:30 PM",
      status: "IN_PROGRESS" as TaskStatus,
      overdue: false,
    },
    {
      id: "3",
      title: "Contract review meeting",
      type: "CUSTOMER",
      priority: "MEDIUM" as Priority,
      dueDate: "Yesterday",
      status: "PENDING" as TaskStatus,
      overdue: true,
    },
    {
      id: "4",
      title: "Demo call preparation",
      type: "LEAD",
      priority: "MEDIUM" as Priority,
      dueDate: "Tomorrow, 10:00 AM",
      status: "PENDING" as TaskStatus,
      overdue: false,
    },
    {
      id: "5",
      title: "Invoice follow-up",
      type: "CUSTOMER",
      priority: "HIGH" as Priority,
      dueDate: "Yesterday",
      status: "PENDING" as TaskStatus,
      overdue: true,
    },
  ];

  const revenueData = [
    { month: "Jan", deals: 28, won: 8, revenue: 285000 },
    { month: "Feb", deals: 32, won: 11, revenue: 342000 },
    { month: "Mar", deals: 29, won: 9, revenue: 298000 },
    { month: "Apr", deals: 35, won: 12, revenue: 398000 },
    { month: "May", deals: 38, won: 15, revenue: 445000 },
    { month: "Jun", deals: 42, won: 18, revenue: 487500 },
  ];

  const dealsPipelineData = [
    { name: "Prospect", value: 45, color: "#0EA5E9" },
    { name: "Negotiation", value: 28, color: "#8B5CF6" },
    { name: "Won", value: 34, color: "#10B981" },
    { name: "Lost", value: 12, color: "#EF4444" },
  ];

  const leadSourceData = [
    { source: "Website", count: 85, percentage: 34 },
    { source: "Referral", count: 62, percentage: 25 },
    { source: "LinkedIn", count: 48, percentage: 19 },
    { source: "Cold Email", count: 33, percentage: 13 },
    { source: "Trade Show", count: 20, percentage: 8 },
  ];

  const teamPerformance = [
    {
      name: "John Doe",
      role: "SALES",
      avatar: "/avatars/john.jpg",
      leads: 45,
      deals: 12,
      revenue: 185000,
      conversionRate: 26.7,
    },
    {
      name: "Jane Smith",
      role: "SALES",
      avatar: "/avatars/jane.jpg",
      leads: 52,
      deals: 15,
      revenue: 215000,
      conversionRate: 28.8,
    },
    {
      name: "Mike Wilson",
      role: "MANAGER",
      avatar: "/avatars/mike.jpg",
      leads: 38,
      deals: 9,
      revenue: 142000,
      conversionRate: 23.7,
    },
  ];

  const getStatusColor = (status: LeadStatus | DealStage | TaskStatus) => {
    const colors = {
      NEW: "primary",
      CONTACTED: "secondary",
      QUALIFIED: "success",
      LOST: "danger",
      PROSPECT: "primary",
      NEGOTIATION: "warning",
      WON: "success",
      PENDING: "warning",
      IN_PROGRESS: "secondary",
      DONE: "success",
    };
    return colors[status] || "default";
  };

  const getPriorityColor = (priority: Priority) => {
    const colors = {
      LOW: "success",
      MEDIUM: "warning",
      HIGH: "danger",
    };
    return colors[priority];
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // const isAdmin = userRole === "ADMIN" || userRole === "MANAGER";
  const isAdmin = true;

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-default-500 mt-1">
            Welcome back! Here&apos;s your overview
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            color="primary"
            variant="flat"
            radius="full"
            startContent={<Plus size={18} />}
            onPress={() => {}}
          >
            Add Lead
          </Button>
          <Button
            color="primary"
            variant="flat"
            radius="full"
            startContent={<Package size={18} />}
            onPress={() => {}}
          >
            Add Service
          </Button>
          <Button
            color="primary"
            variant="flat"
            radius="full"
            startContent={<FileText size={18} />}
            onPress={() => {}}
          >
            Create Invoice
          </Button>
          {isAdmin && (
            <Button
              color="primary"
              variant="flat"
              startContent={<UserPlus size={18} />}
              onPress={() => {}}
            >
              Invite Team
            </Button>
          )}
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly variant="light">
                <MoreVertical size={18} />
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem startContent={<Download size={16} />}>
                Export Data
              </DropdownItem>
              <DropdownItem startContent={<Filter size={16} />}>
                Advanced Filters
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      {/* Time Range Selector */}
      <Tabs
        selectedKey={timeRange}
        onSelectionChange={(key) => setTimeRange(key as string)}
        variant="solid"
        radius="full"
        color="primary"
      >
        <Tab key="today" title="Today" />
        <Tab key="week" title="This Week" />
        <Tab key="month" title="This Month" />
        <Tab key="quarter" title="This Quarter" />
        <Tab key="year" title="This Year" />
      </Tabs>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="border-none bg-gradient-to-br from-blue-500 to-blue-600">
          <CardBody className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-white/20 p-2 rounded-lg">
                <Users className="text-white" size={20} />
              </div>
              {kpiData.totalLeads.trend === "up" ? (
                <TrendingUp className="text-white" size={16} />
              ) : (
                <TrendingDown className="text-white" size={16} />
              )}
            </div>
            <div className="text-white">
              <p className="text-sm opacity-90">Total Leads</p>
              <p className="text-3xl font-bold">{kpiData.totalLeads.value}</p>
              <p className="text-xs mt-1 opacity-75">
                +{kpiData.totalLeads.change}% from last month
              </p>
            </div>
          </CardBody>
        </Card>

        <Card className="border-none bg-gradient-to-br from-purple-500 to-purple-600">
          <CardBody className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-white/20 p-2 rounded-lg">
                <Target className="text-white" size={20} />
              </div>
              {kpiData.newLeadsToday.trend === "up" ? (
                <TrendingUp className="text-white" size={16} />
              ) : (
                <TrendingDown className="text-white" size={16} />
              )}
            </div>
            <div className="text-white">
              <p className="text-sm opacity-90">New Today</p>
              <p className="text-3xl font-bold">
                {kpiData.newLeadsToday.value}
              </p>
              <p className="text-xs mt-1 opacity-75">
                {kpiData.newLeadsToday.change}% from yesterday
              </p>
            </div>
          </CardBody>
        </Card>

        <Card className="border-none bg-gradient-to-br from-green-500 to-green-600">
          <CardBody className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-white/20 p-2 rounded-lg">
                <CheckCircle2 className="text-white" size={20} />
              </div>
              {kpiData.dealsWon.trend === "up" ? (
                <TrendingUp className="text-white" size={16} />
              ) : (
                <TrendingDown className="text-white" size={16} />
              )}
            </div>
            <div className="text-white">
              <p className="text-sm opacity-90">Deals Won</p>
              <p className="text-3xl font-bold">{kpiData.dealsWon.value}</p>
              <p className="text-xs mt-1 opacity-75">
                +{kpiData.dealsWon.change}% from last month
              </p>
            </div>
          </CardBody>
        </Card>

        <Card className="border-none bg-gradient-to-br from-emerald-500 to-emerald-600">
          <CardBody className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-white/20 p-2 rounded-lg">
                <DollarSign className="text-white" size={20} />
              </div>
              {kpiData.revenue.trend === "up" ? (
                <TrendingUp className="text-white" size={16} />
              ) : (
                <TrendingDown className="text-white" size={16} />
              )}
            </div>
            <div className="text-white">
              <p className="text-sm opacity-90">Revenue</p>
              <p className="text-3xl font-bold">
                {formatCurrency(kpiData.revenue.value)}
              </p>
              <p className="text-xs mt-1 opacity-75">
                +{kpiData.revenue.change}% from last month
              </p>
            </div>
          </CardBody>
        </Card>

        <Card className="border-none bg-gradient-to-br from-orange-500 to-orange-600">
          <CardBody className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-white/20 p-2 rounded-lg">
                <FileText className="text-white" size={20} />
              </div>
              {kpiData.outstandingInvoices.trend === "down" ? (
                <TrendingUp className="text-white" size={16} />
              ) : (
                <TrendingDown className="text-white" size={16} />
              )}
            </div>
            <div className="text-white">
              <p className="text-sm opacity-90">Outstanding</p>
              <p className="text-3xl font-bold">
                {formatCurrency(kpiData.outstandingInvoices.value)}
              </p>
              <p className="text-xs mt-1 opacity-75">
                {kpiData.outstandingInvoices.change}% from last month
              </p>
            </div>
          </CardBody>
        </Card>

        <Card className="border-none bg-gradient-to-br from-pink-500 to-pink-600">
          <CardBody className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-white/20 p-2 rounded-lg">
                <Briefcase className="text-white" size={20} />
              </div>
              {kpiData.conversionRate.trend === "up" ? (
                <TrendingUp className="text-white" size={16} />
              ) : (
                <TrendingDown className="text-white" size={16} />
              )}
            </div>
            <div className="text-white">
              <p className="text-sm opacity-90">Conversion Rate</p>
              <p className="text-3xl font-bold">
                {kpiData.conversionRate.value}%
              </p>
              <p className="text-xs mt-1 opacity-75">
                +{kpiData.conversionRate.change}% from last month
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue & Deals Chart */}
          <Card>
            <CardHeader className="flex justify-between">
              <div>
                <h3 className="text-xl font-semibold">
                  Revenue & Deals Overview
                </h3>
                <p className="text-sm text-default-500">Monthly performance</p>
              </div>
              <Tabs size="sm" variant="solid" color="primary" radius="full">
                <Tab key="revenue" title="Revenue" />
                <Tab key="deals" title="Deals" />
                <Tab key="both" title="Both" />
              </Tabs>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                    formatter={(value: any) => formatCurrency(value)}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10B981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <p className="text-sm text-default-500">Total Deals</p>
                  <p className="text-2xl font-bold">238</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-default-500">Won Deals</p>
                  <p className="text-2xl font-bold text-green-600">73</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-default-500">Conversion</p>
                  <p className="text-2xl font-bold text-blue-600">30.7%</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Deals Pipeline */}
          <Card>
            <CardHeader>
              <div>
                <h3 className="text-xl font-semibold">Deals Pipeline</h3>
                <p className="text-sm text-default-500">
                  Current deal distribution
                </p>
              </div>
            </CardHeader>
            <CardBody>
              <div className="flex items-center justify-between">
                <ResponsiveContainer width="40%" height={200}>
                  <PieChart>
                    <Pie
                      data={dealsPipelineData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {dealsPipelineData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <div className="flex-1 space-y-4">
                  {dealsPipelineData.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold">
                          {item.value}
                        </span>
                        <Progress
                          value={(item.value / 119) * 100}
                          color={
                            item.name === "Won"
                              ? "success"
                              : item.name === "Lost"
                                ? "danger"
                                : "primary"
                          }
                          className="w-32"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Recent Leads Table */}
          <Card>
            <CardHeader className="flex justify-between">
              <div>
                <h3 className="text-xl font-semibold">Recent Leads</h3>
                <p className="text-sm text-default-500">
                  Latest incoming leads
                </p>
              </div>
              <Button
                size="sm"
                href="/deals"
                variant="flat"
                color="primary"
                radius="full"
              >
                View All
              </Button>
            </CardHeader>
            <CardBody>
              <Table removeWrapper aria-label="Recent leads table">
                <TableHeader>
                  <TableColumn>LEAD</TableColumn>
                  <TableColumn>CONTACT</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>SOURCE</TableColumn>
                  <TableColumn>ASSIGNED TO</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {recentLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div>
                          <p className="font-semibold">{lead.name}</p>
                          <p className="text-xs text-default-500">
                            {lead.createdAt}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <Mail size={12} />
                            <span>{lead.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <Phone size={12} />
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
                        <Chip size="sm" variant="bordered">
                          {lead.source}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar
                            name={lead.assignedTo}
                            size="sm"
                            className="w-6 h-6"
                          />
                          <span className="text-sm">{lead.assignedTo}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" isIconOnly variant="light">
                          <MoreVertical size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>

          {/* Team Performance - Admin Only */}
          <Card>
            <CardHeader>
              <div>
                <h3 className="text-xl font-semibold">Team Performance</h3>
                <p className="text-sm text-default-500">
                  This month&apos;s metrics
                </p>
              </div>
            </CardHeader>
            <CardBody>
              <Table removeWrapper aria-label="Team performance table">
                <TableHeader>
                  <TableColumn>TEAM MEMBER</TableColumn>
                  <TableColumn>LEADS</TableColumn>
                  <TableColumn>DEALS</TableColumn>
                  <TableColumn>REVENUE</TableColumn>
                  <TableColumn>CONVERSION</TableColumn>
                </TableHeader>
                <TableBody>
                  {teamPerformance.map((member, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar name={member.name} />
                          <div>
                            <p className="font-semibold">{member.name}</p>
                            <p className="text-xs text-default-500">
                              {member.role}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">{member.leads}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">{member.deals}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">
                          {formatCurrency(member.revenue)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={member.conversionRate}
                            color="success"
                            className="w-20"
                          />
                          <span className="text-sm font-semibold">
                            {member.conversionRate}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </div>

        {/* Right Column - Tasks & Sources */}
        <div className="space-y-6">
          {/* Tasks & Follow-ups */}
          <Card>
            <CardHeader>
              <div>
                <h3 className="text-xl font-semibold">Tasks & Follow-ups</h3>
                <p className="text-sm text-default-500">
                  Your upcoming activities
                </p>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              {/* Overdue Tasks Alert */}
              {tasks.filter((t) => t.overdue).length > 0 && (
                <div className="flex items-start gap-3 p-3 bg-danger-50 rounded-lg border border-danger-200">
                  <AlertCircle className="text-danger-600 mt-0.5" size={20} />
                  <div>
                    <p className="font-semibold text-danger-600">
                      {tasks.filter((t) => t.overdue).length} Overdue Tasks
                    </p>
                    <p className="text-xs text-danger-600">
                      Please review and update these tasks
                    </p>
                  </div>
                </div>
              )}

              {/* Task List */}
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-lg border ${
                    task.overdue
                      ? "border-danger-200 bg-danger-50"
                      : "border-default-200 hover:bg-default-50"
                  } transition-colors cursor-pointer`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Chip
                          size="sm"
                          variant="flat"
                          color={getPriorityColor(task.priority) as any}
                        >
                          {task.priority}
                        </Chip>
                        <Chip size="sm" variant="bordered">
                          {task.type}
                        </Chip>
                      </div>
                      <p className="font-semibold text-sm">{task.title}</p>
                    </div>
                    <Button size="sm" isIconOnly variant="light">
                      <MoreVertical size={16} />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-default-500">
                    <Clock size={12} />
                    <span>{task.dueDate}</span>
                  </div>
                  {task.overdue && (
                    <div className="mt-2">
                      <Button size="sm" color="danger" variant="flat" fullWidth>
                        Mark Complete
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              <Button color="primary" variant="flat" fullWidth className="mt-4">
                View All Tasks
              </Button>
            </CardBody>
          </Card>

          {/* Lead Sources */}
          <Card>
            <CardHeader>
              <div>
                <h3 className="text-xl font-semibold">Lead Sources</h3>
                <p className="text-sm text-default-500">
                  Where leads come from
                </p>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              {leadSourceData.map((source) => (
                <div key={source.source}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{source.source}</span>
                    <span className="text-sm font-semibold">
                      {source.count}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress
                      value={source.percentage}
                      color="primary"
                      className="flex-1"
                    />
                    <span className="text-xs text-default-500 w-12 text-right">
                      {source.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Quick Stats</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500 p-2 rounded-lg">
                    <Calendar className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-default-500">Today's Calls</p>
                    <p className="text-xl font-bold">12</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500 p-2 rounded-lg">
                    <CheckCircle2 className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-default-500">Tasks Completed</p>
                    <p className="text-xl font-bold">28</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-500 p-2 rounded-lg">
                    <Mail className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-default-500">Emails Sent</p>
                    <p className="text-xl font-bold">156</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
