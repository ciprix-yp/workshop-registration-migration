import { NextRequest, NextResponse } from 'next/server';
import { getMembers } from '@/lib/sheets/client';
import { checkMemberByEmail } from '@/lib/validation/memberValidator';
import { getWorkshopConfig } from '@/config/workshops';

/**
 * POST /api/check-member
 *
 * Check if email belongs to a member
 * Used in Step 1 of registration form
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, workshopSlug } = body;

    // Validation
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email este necesar' },
        { status: 400 }
      );
    }

    if (!workshopSlug) {
      return NextResponse.json(
        { error: 'Workshop slug este necesar' },
        { status: 400 }
      );
    }

    // Get workshop config
    const config = getWorkshopConfig(workshopSlug);
    if (!config) {
      return NextResponse.json(
        { error: 'Workshop nu a fost găsit' },
        { status: 404 }
      );
    }

    // Get members from Google Sheet
    const members = await getMembers(config.googleSheetId);

    // Check if email matches a member
    const result = checkMemberByEmail(email, members);

    return NextResponse.json({
      isMember: result.isMember,
      message: result.isMember
        ? 'Bun venit înapoi! Ești membru BIZZ.CLUB.'
        : 'Bun venit! Continuă cu înregistrarea.',
    });
  } catch (error) {
    console.error('Error checking member:', error);
    return NextResponse.json(
      { error: 'Eroare la verificarea statusului de membru. Încearcă din nou.' },
      { status: 500 }
    );
  }
}
