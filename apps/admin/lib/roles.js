// Role hierarchy shared by the admin UI, middleware and API:
//   super-admin > admin > manager > user (no dashboard access)
export const ROLE_RANK = { "super-admin": 3, admin: 2, manager: 1, user: 0 };

export const rankOf = (role) => ROLE_RANK[role] ?? 0;

export const ROLE_LABELS = {
  "super-admin": "Super Admin",
  admin: "Admin",
  manager: "Manager",
  user: "User",
};

// Minimum role rank required for each dashboard area. Anything not listed is
// available to every staff member.
export const ROUTE_MIN_RANK = [{ prefix: "/dashboard/user", min: 2 }];

export function canAccess(role, pathname) {
  const rule = ROUTE_MIN_RANK.find((r) => pathname.startsWith(r.prefix));
  return rankOf(role) >= (rule?.min ?? 1);
}
