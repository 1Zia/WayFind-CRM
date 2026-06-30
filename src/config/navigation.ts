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
  MessageSquare,
} from "lucide-react";

export const navigationGroups = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Reports",
        href: "/reports",
        icon: BarChart3,
      },
    ],
  },
  {
    label: "CRM",
    items: [
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
    ],
  },
  {
    label: "Operations",
    items: [
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
        title: "Chat",
        href: "/chat",
        icon: MessageSquare,
      },
      {
        title: "Notifications",
        href: "/notifications",
        icon: Bell,
      },
    ],
  },
  {
    label: "Administration",
    items: [
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
    ],
  },
];

export type NavigationItem = {
  title: string;
  href: string;
  icon: typeof LayoutDashboard;
};

export const navigationItems: NavigationItem[] = navigationGroups.flatMap(
  (group) => group.items,
);
