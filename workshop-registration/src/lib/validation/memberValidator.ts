import { Member, MemberValidationResult } from '@/types/workshop';

/**
 * Member Validation - 3-Way Matching Algorithm
 *
 * CRITICAL: This logic must match exactly the original Google Apps Script
 *
 * Validation priority:
 * 1. Name (normalized) + Phone match
 * 2. Name (normalized) + Email match
 * 3. Email + Phone match
 * 4. Email exact match (fallback)
 */

/**
 * Normalize name for comparison
 * - Convert to lowercase
 * - Remove all spaces
 * - Returns both "FirstLast" and "LastFirst" combinations
 */
function normalizeName(firstName: string, lastName: string): string[] {
  const first = firstName.toLowerCase().replace(/\s+/g, '');
  const last = lastName.toLowerCase().replace(/\s+/g, '');

  return [
    first + last,    // "prenumenume"
    last + first,    // "numeprenume"
  ];
}

/**
 * Normalize phone number
 * - Strip all non-digits
 * - Returns just the number string
 */
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Check if two phone numbers match (substring matching)
 * Handles cases like "+40 724 123 456" vs "724123456"
 */
function phonesMatch(phone1: string, phone2: string): boolean {
  const p1 = normalizePhone(phone1);
  const p2 = normalizePhone(phone2);

  if (!p1 || !p2) return false;

  // Either phone contains the other (handles country codes)
  return p1.includes(p2) || p2.includes(p1);
}

/**
 * Normalize email for comparison
 */
function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Check if user name matches member name
 */
function nameMatches(
  userFirstName: string,
  userLastName: string,
  member: Member
): boolean {
  const userVariants = normalizeName(userFirstName, userLastName);
  const memberVariants = normalizeName(member.prenume, member.nume);

  // Check all combinations
  for (const userVariant of userVariants) {
    for (const memberVariant of memberVariants) {
      if (userVariant === memberVariant) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Validate if user is a member using 3-way matching
 *
 * @param userData - User form data (email, name, phone)
 * @param members - List of members from Google Sheet
 * @returns Validation result with match type
 */
export function validateMember(
  userData: {
    email: string;
    prenume: string;
    nume: string;
    telefon: string;
  },
  members: Member[]
): MemberValidationResult {
  const userEmail = normalizeEmail(userData.email);
  const userPhone = normalizePhone(userData.telefon);

  for (const member of members) {
    const memberEmail = normalizeEmail(member.email);
    const memberPhone = normalizePhone(member.telefon);

    // Priority 1: Name + Phone match
    if (nameMatches(userData.prenume, userData.nume, member) &&
        phonesMatch(userPhone, memberPhone)) {
      return {
        isMember: true,
        matchedBy: 'name+phone',
        memberData: member,
      };
    }

    // Priority 2: Name + Email match
    if (nameMatches(userData.prenume, userData.nume, member) &&
        userEmail === memberEmail) {
      return {
        isMember: true,
        matchedBy: 'name+email',
        memberData: member,
      };
    }

    // Priority 3: Email + Phone match
    if (userEmail === memberEmail && phonesMatch(userPhone, memberPhone)) {
      return {
        isMember: true,
        matchedBy: 'email+phone',
        memberData: member,
      };
    }

    // Priority 4: Email exact match (fallback)
    if (userEmail === memberEmail) {
      return {
        isMember: true,
        matchedBy: 'email',
        memberData: member,
      };
    }
  }

  // Not a member
  return {
    isMember: false,
  };
}

/**
 * Quick member check by email only (for Step 1)
 */
export function checkMemberByEmail(
  email: string,
  members: Member[]
): MemberValidationResult {
  const userEmail = normalizeEmail(email);

  for (const member of members) {
    const memberEmail = normalizeEmail(member.email);

    if (userEmail === memberEmail) {
      return {
        isMember: true,
        matchedBy: 'email',
        memberData: member,
      };
    }
  }

  return {
    isMember: false,
  };
}
