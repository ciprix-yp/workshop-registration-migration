import { NextRequest, NextResponse } from 'next/server';
import { getMembers, appendRegistration, getWorkshopConfig as getWorkshopConfigFromSheet } from '@/lib/sheets/client';
import { validateMember } from '@/lib/validation/memberValidator';
import { sendWebhook, buildWebhookPayload } from '@/lib/webhook/client';
import { getWorkshopConfig } from '@/config/workshops';
import { RegistrationFormData, RegistrationRow } from '@/types/workshop';
import { formatRomanianTimestamp } from '@/lib/utils/dateFormat';

/**
 * POST /api/submit-registration
 *
 * Process complete registration submission
 * 1. Validate member status (3-way matching)
 * 2. Determine payment amount
 * 3. Save to Google Sheets
 * 4. Send webhook (non-blocking)
 * 5. Return payment link
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workshopSlug, formData } = body as {
      workshopSlug: string;
      formData: RegistrationFormData;
    };

    // Validation
    if (!workshopSlug || !formData) {
      return NextResponse.json(
        { error: 'Date incomplete' },
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

    // Get workshop configuration from Google Sheet FIRST
    const sheetConfig = await getWorkshopConfigFromSheet(config.googleSheetId);
    const workshopName = sheetConfig.WORKSHOP_NAME || config.name; // Fallback to hardcoded if not in sheet

    // Get members and validate
    const members = await getMembers(config.googleSheetId);
    const memberValidation = validateMember(
      {
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
      },
      members
    );

    // Determine member status and payment link
    const isMember = memberValidation.isMember;
    const statusMembru = isMember ? 'Membru' : 'Non-Membru';
    // Read payment links from Google Sheet first, fallback to hardcoded config
    const paymentLink = isMember
      ? (sheetConfig.LINK_PLATA_MEMBRU || config.stripeLinks.member)
      : (sheetConfig.LINK_PLATA_STANDARD || config.stripeLinks.standard);
    const suma = isMember ? 'Pret Membru' : 'Pret Standard';

    console.log(`[Submit Registration] Member: ${isMember}, Payment link: ${paymentLink}`);

    // Handle PF invoice defaults
    let companyName = formData.companyName || '';
    let cui = formData.cui || '';

    if (formData.invoiceType === 'PF') {
      companyName = formData.name; // Use full name for PF
      cui = '0000000000000'; // 13 zeros for PF
    }

    // Prepare Google Sheets row
    const registrationRow: RegistrationRow = {
      Timestamp: formatRomanianTimestamp(),
      Workshop: workshopName,
      Nume: formData.name,  // Full name from single field
      Email: formData.email,
      Telefon: formData.phone,
      Provocare: formData.challenge,
      Rezultat: formData.result,
      Nivel: formData.level,
      Factura: formData.invoiceType,
      'Nume Firma': companyName,
      CUI: cui,
      GDPR: formData.gdprConsent ? 'Da' : 'Nu',
      Marketing: formData.marketingConsent ? 'Da' : 'Nu',
      'Status Membru': statusMembru,
      Suma: suma,
    };

    // Save to Google Sheets
    await appendRegistration(config.googleSheetId, registrationRow);

    // Send webhook (non-blocking - don't wait for result)
    const webhookPayload = buildWebhookPayload(
      config.name,
      { ...formData, companyName, cui },
      statusMembru,
      suma
    );

    // Fire and forget - don't block user experience
    sendWebhook(config.webhookUrl, webhookPayload).catch(error => {
      console.error('Webhook failed (non-blocking):', error);
    });

    // Return success with payment link
    return NextResponse.json({
      success: true,
      paymentLink,
      isMember,
      message: 'Înregistrare finalizată cu succes!',
    });
  } catch (error) {
    console.error('Error submitting registration:', error);
    return NextResponse.json(
      { error: 'Eroare la procesarea înregistrării. Te rugăm să încerci din nou.' },
      { status: 500 }
    );
  }
}
