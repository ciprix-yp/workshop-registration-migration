import { NextRequest, NextResponse } from 'next/server';
import { getMembers, getWorkshopConfig as getWorkshopConfigFromSheet } from '@/lib/sheets/client';
import { validateMember } from '@/lib/validation/memberValidator';
import { getWorkshopConfig } from '@/config/workshops';

/**
 * POST /api/check-member
 *
 * Check if user is a member using 3-way validation (name+phone, name+email, email+phone)
 * Used in Step 1 of registration form
 *
 * EXACT replica of original code.gs checkMemberStatus function
 */
export async function POST(request: NextRequest) {
  // Debug log to confirm new deployment
  console.log(`[POST /api/check-member] Request received at ${new Date().toISOString()}`);
  try {
    const body = await request.json();
    const { name, email, phone, workshopSlug } = body;

    // Validation
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Numele este necesar' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email este necesar' },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { error: 'Telefonul este necesar' },
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

    console.log(`[Member Check] Found ${members.length} members in sheet`);
    console.log(`[Member Check] User input - Name: "${name}", Email: "${email}", Phone: "${phone}"`);

    // 3-way validation: name+phone, name+email, email+phone, email fallback
    const result = validateMember(
      { name, email, phone },
      members
    );

    console.log(`[Member Check] Validation result - isMember: ${result.isMember}, matchedBy: ${result.matchedBy || 'none'}`);

    // Get workshop configuration from Google Sheet (for payment links)
    const sheetConfig = await getWorkshopConfigFromSheet(config.googleSheetId);

    // Determine payment link based on member status
    // Read from Google Sheet first, fallback to hardcoded config if not found
    const paymentLink = result.isMember
      ? (sheetConfig.LINK_PLATA_MEMBRU || config.stripeLinks.member)
      : (sheetConfig.LINK_PLATA_STANDARD || config.stripeLinks.standard);

    console.log(`[Member Check] Payment link selected: ${paymentLink} (Member: ${result.isMember})`);

    return NextResponse.json({
      isMember: result.isMember,
      paymentLink,
      matchedBy: result.matchedBy,
      message: result.isMember
        ? 'Bun venit înapoi! Ești membru BIZZ.CLUB.'
        : 'Bun venit! Continuă cu înregistrarea.',
    });
  } catch (error) {
    console.error('Error checking member:', error);
    return NextResponse.json(
      {
        error: 'Eroare la verificarea statusului de membru. Încearcă din nou.',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
