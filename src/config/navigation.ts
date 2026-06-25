import {
  LayoutDashboard,
  BarChart3,
  Users,
  Target,
  Briefcase,
  CheckSquare,
  Wallet,
  FileText,
  Bell,
  UserCog,
  ShieldCheck,
  Settings,
} from "lucide-react";

export const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Clients",
    href: "/clients",
    icon: Users,
  },
  {
    title: "Leads",
    href: "/leads",
    icon: Target,
  },
  {
    title: "Projects",
    href: "/projects",
    icon: Briefcase,
  },
  {
    title: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
  },
  {
    title: "Finance",
    href: "/finance",
    icon: Wallet,
  },
  {
    title: "Documents",
    href: "/documents",
    icon: FileText,
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "Audit Logs",
    href: "/audit-logs",
    icon: ShieldCheck,
  },
  {
    title: "Team / Users",
    href: "/team/users",
    icon: UserCog,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export type NavigationItem = (typeof navigationItems)[number];
