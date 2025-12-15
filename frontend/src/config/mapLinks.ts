// Centralized map-specific navigation links to keep navbar consistent
// Links are now filtered based on user role

export type NavLink = {
  href: string;
  label: string;
  roles?: string[]; // If undefined, visible to all roles
};

const NAV_LINKS: NavLink[] = [

  // Common links for all users
  { href: "/", label: "Bản đồ", roles: ["CUSTOMER", "TECH", "VENDOR", "ADMIN"] },
  
  // Customer links
  { href: "/profile?tab=quick-charge", label: "Sạc nhanh", roles: ["CUSTOMER"] },
  { href: "/profile?tab=customer-services", label: "Phương tiện", roles: ["CUSTOMER"] },
  { href: "/profile?tab=history", label: "Lịch sử hoạt động", roles: ["CUSTOMER"] },
  
  // Vendor links
  { href: "/profile?tab=supplier-operations", label: "Quản lý trạm", roles: ["VENDOR"] },
  { href: "/profile?tab=analytics", label: "Thống kê", roles: ["VENDOR"] },
  
  // Tech links
  { href: "/profile?tab=tech-operations", label: "Quản lý đội cứu hộ", roles: ["TECH"] },
  { href: "/profile?tab=analytics", label: "Thống kê", roles: ["TECH"] },
  
  // Admin links
  { href: "/admin", label: "Admin Panel", roles: ["ADMIN"] },

  // Common links (excluding ADMIN)
  { href: "/profile?tab=account", label: "Hồ sơ", roles: ["CUSTOMER", "TECH", "VENDOR"] },
];

export function getLinksForRole(role?: string): NavLink[] {
  if (!role) {
    return NAV_LINKS.filter(link => !link.roles);
  }
  
  return NAV_LINKS.filter(link => {
    if (!link.roles) return true;
    return link.roles.includes(role);
  });
}
