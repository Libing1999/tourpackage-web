import {
  BedDouble,
  CalendarCheck,
  GalleryHorizontal,
  HelpCircle,
  ImageUp,
  Images,
  LayoutDashboard,
  Link2,
  Mail,
  MessageSquareQuote,
  Newspaper,
  Package,
  Search,
  Send,
  Settings,
  Type,
  UserRound,
  Users,
} from "lucide-react";

/**
 * Grouped so the sidebar reads as three jobs rather than one long list:
 * what's happening now, what we sell, and how the site is configured.
 * Everything here is readable by any authenticated admin — the per-role
 * limits are on the actions inside each page, not on reaching it.
 */
export const NAV_GROUPS = [
  {
    label: null,
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Operations",
    items: [
      { href: "/dashboard/bookings", label: "Bookings", icon: CalendarCheck },
      { href: "/dashboard/inquiries", label: "Inquiries", icon: Mail },
      { href: "/dashboard/customers", label: "Customers", icon: Users },
    ],
  },
  {
    label: "Catalogue",
    items: [
      { href: "/dashboard/hotels", label: "Hotels", icon: BedDouble },
      { href: "/dashboard/packages", label: "Packages", icon: Package },
    ],
  },
  {
    label: "CMS",
    items: [
      { href: "/dashboard/cms/slider", label: "Slider & Heroes", icon: GalleryHorizontal },
      { href: "/dashboard/cms/content", label: "Site Content", icon: Type },
      { href: "/dashboard/cms/gallery", label: "Gallery", icon: Images },
      { href: "/dashboard/cms/blog", label: "Blog", icon: Newspaper },
      { href: "/dashboard/cms/navigation", label: "Navigation", icon: Link2 },
      { href: "/dashboard/cms/seo", label: "SEO", icon: Search },
      { href: "/dashboard/media", label: "Media Library", icon: ImageUp },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/dashboard/testimonials", label: "Testimonials", icon: MessageSquareQuote },
      { href: "/dashboard/faqs", label: "FAQs", icon: HelpCircle },
      { href: "/dashboard/newsletter", label: "Newsletter", icon: Send },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
  },
  {
    label: "Account",
    items: [{ href: "/profile", label: "Profile", icon: UserRound }],
  },
] as const;
