import type { AppSettings, Staff } from "../types/entities";
import { EmailFormat } from "../types/enums";

/**
 * Generate an email address from a first name, last name, and app settings.
 *
 * Supports two formats:
 *  - "firstname.L" → jane.d@acme.ae
 *  - "F.lastname"  → j.doe@acme.ae
 */
export function generateEmail(
  firstName: string,
  lastName: string,
  settings: Pick<AppSettings, "emailDomain" | "emailFormat">,
): string {
  const fn = firstName.toLowerCase();
  const ln = lastName.toLowerCase();

  return settings.emailFormat === EmailFormat.FirstnameL
    ? `${fn}.${ln[0]}@${settings.emailDomain}`
    : `${fn[0]}.${ln}@${settings.emailDomain}`;
}

/** Convenience wrapper: generate email from a Staff record. */
export function getStaffEmail(
  staff: Pick<Staff, "firstName" | "lastName">,
  settings: Pick<AppSettings, "emailDomain" | "emailFormat">,
): string {
  return generateEmail(staff.firstName, staff.lastName, settings);
}
