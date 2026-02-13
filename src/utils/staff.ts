import type { Staff } from "../types/entities";

/** Return a staff member's full display name ("firstName lastName"). */
export function getStaffFullName(s: Staff): string {
  return `${s.firstName} ${s.lastName}`;
}

/**
 * Derive a display mobile number from a staff member's UID.
 *
 * This generates a deterministic placeholder phone number
 * based on the numeric portion of the UID.
 */
export function getStaffMobile(staff: Staff): string {
  const num = parseInt(staff.uid, 10);
  return `+971 50 111 ${String(num).padStart(4, "0")}`;
}
