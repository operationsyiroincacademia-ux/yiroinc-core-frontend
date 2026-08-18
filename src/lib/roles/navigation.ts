import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  GraduationCap,
  Briefcase,
  Package,
  BookOpen,
  Bell,
  Users,
  ClipboardList,
  Store,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import type { Experience } from "./index";
import { roleHref } from "./experience-context";

export type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

type NavBlueprint = {
  overview: NavItem[];
  services: { label: string; items: NavItem[] };
};

const sharedOverview: NavItem[] = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Orders", to: "/orders", icon: ShoppingBag },
  { label: "Payments", to: "/payments", icon: CreditCard },
];

const blueprints: Record<Experience, NavBlueprint> = {
  academic: {
    overview: sharedOverview,
    services: {
      label: "Services",
      items: [
        { label: "Yiroinc Store", to: "/services", icon: Store },
        { label: "Resources", to: "/resources", icon: BookOpen },
        { label: "Notifications", to: "/notifications", icon: Bell },
      ],
    },
  },
  exam: {
    overview: sharedOverview,
    services: {
      label: "Services",
      items: [
        { label: "Yiroinc Store", to: "/services", icon: Store },
        { label: "Tutoring Requests", to: "/tutoring", icon: GraduationCap },
        { label: "Resources", to: "/resources", icon: BookOpen },
        { label: "Notifications", to: "/notifications", icon: Bell },
      ],
    },
  },
  corporate: {
    overview: sharedOverview,
    services: {
      label: "Services",
      items: [
        { label: "Yiroinc Store", to: "/services", icon: Store },
        { label: "Consulting Requests", to: "/consulting", icon: Briefcase },
        { label: "Procurement Requests", to: "/procurements", icon: Package },
        { label: "Resources", to: "/resources", icon: BookOpen },
        { label: "Notifications", to: "/notifications", icon: Bell },
      ],
    },
  },
  admin: {
    overview: [{ label: "Dashboard", to: "/", icon: LayoutDashboard }],
    services: {
      label: "Administration",
      items: [],
    },
  },
};

const accountItems: NavItem[] = [{ label: "Profile", to: "/profile", icon: UserRound }];

/** Unused placeholder kept for future corporate services. */
export const CORPORATE_FUTURE_ICONS = { Briefcase, Package };

export function navigationFor(experience: Experience): NavSection[] {
  const blueprint = blueprints[experience];
  const resolve = (items: NavItem[]) =>
    items.map((item) => ({ ...item, to: roleHref(experience, item.to) }));

  const sections = [
    { label: "Overview", items: resolve(blueprint.overview) },
    { label: blueprint.services.label, items: resolve(blueprint.services.items) },
    ...(experience === "admin" ? [] : [{ label: "Account", items: resolve(accountItems) }]),
  ];
  return sections.filter((section) => section.items.length > 0);
}
