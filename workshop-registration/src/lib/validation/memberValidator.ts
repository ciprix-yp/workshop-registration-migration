import { Member, MemberValidationResult, UserData } from '@/types/workshop';

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
 * Parse full name from single field into possible first/last name combinations
 * Handles names like "Ion Popescu" or "Popescu Ion"
 */
function parseFullName(fullName: string): Array<{ first: string; last: string }> {
  const parts = fullName.trim().split(/\s+/);

  if (parts.length === 0) return [];
  if (parts.length === 1) {
    // Single name - try as both first and last
    return [
      { first: parts[0], last: '' },
      { first: '', last: parts[0] },
    ];
  }

  // For multiple parts, try common combinations
  const combinations: Array<{ first: string; last: string }> = [];

  // First word as first name, rest as last name (Ion Popescu)
  combinations.push({
    first: parts[0],
    last: parts.slice(1).join(' '),
  });

  // Last word as last name, rest as first name (Ion Mihai Popescu)
  combinations.push({
    first: parts.slice(0, -1).join(' '),
    last: parts[parts.length - 1],
  });

  // If two parts, also try reversed (Popescu Ion)
  if (parts.length === 2) {
    combinations.push({
      first: parts[1],
      last: parts[0],
    });
  }

  return combinations;
}

/**
 * Remove diacritics from string
 * Example: "Ionuț" -> "Ionut"
 */
function removeDiacritics(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Normalize name for comparison
 * - Convert to lowercase
 * - Remove diacritics
 * - Remove all spaces
 * - Returns both "FirstLast" and "LastFirst" combinations
 */
function normalizeName(firstName: string, lastName: string): string[] {
  const first = removeDiacritics(firstName.toLowerCase()).replace(/\s+/g, '');
  const last = removeDiacritics(lastName.toLowerCase()).replace(/\s+/g, '');

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
  return removeDiacritics(email.toLowerCase().trim());
}

/**
 * Check if user name matches member name
 * Handles full name from single field
 */
function nameMatches(
  userFullName: string,
  member: Member
): boolean {
  // Parse user's full name into possible combinations
  const userNameCombinations = parseFullName(userFullName);
  const memberVariants = normalizeName(member.prenume, member.nume);

  // Try each user name combination
  for (const nameCombination of userNameCombinations) {
    const userVariants = normalizeName(nameCombination.first, nameCombination.last);

    // Check all combinations
    for (const userVariant of userVariants) {
      for (const memberVariant of memberVariants) {
        if (userVariant === memberVariant) {
          return true;
        }
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
  userData: UserData,
  members: Member[]
): MemberValidationResult {
  const userEmail = normalizeEmail(userData.email);
  const userPhone = normalizePhone(userData.phone);

  for (const member of members) {
    const memberEmail = normalizeEmail(member.email);
    const memberPhone = normalizePhone(member.telefon);

    // Priority 1: Name + Phone match
    if (nameMatches(userData.name, member) &&
      phonesMatch(userPhone, memberPhone)) {
      return {
        isMember: true,
        matchedBy: 'name+phone',
        memberData: member,
      };
    }

    // Priority 2: Name + Email match
    if (nameMatches(userData.name, member) &&
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
