import type { AdminRole } from "./types";

/**
 * Mirrors the `@PreAuthorize` expressions on the admin controllers. This is a
 * UI convenience — it hides actions a role can't perform so nobody is offered
 * a button that will 403. The server remains the only thing actually enforcing
 * any of it; nothing here is a security boundary.
 */
const CONTENT_ROLES: AdminRole[] = ["SUPER_ADMIN", "ADMIN", "EDITOR"];
const OPERATIONS_ROLES: AdminRole[] = ["SUPER_ADMIN", "ADMIN", "EDITOR", "SUPPORT"];
const SETTINGS_ROLES: AdminRole[] = ["SUPER_ADMIN", "ADMIN"];

/** Create/edit/delete on the catalogue: hotels, packages, testimonials, FAQs. */
export function canManageContent(role: AdminRole | undefined): boolean {
  return role !== undefined && CONTENT_ROLES.includes(role);
}

/** Working the queues: booking and enquiry status. SUPPORT's whole job. */
export function canManageOperations(role: AdminRole | undefined): boolean {
  return role !== undefined && OPERATIONS_ROLES.includes(role);
}

/** Settings reach further than content — contact details, mail, payment keys. */
export function canManageSettings(role: AdminRole | undefined): boolean {
  return role !== undefined && SETTINGS_ROLES.includes(role);
}
