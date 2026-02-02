import { NextRequest, NextResponse } from 'next/server';
import { getMembers, appendRegistration } from '@/lib/sheets/client';
import { validateMember } from '@/lib/validation/memberValidator';
import { sendWebhook, buildWebhookPayload } from '@/lib/webhook/client';
import { getWorkshopConfig } from '@/config/workshops';
import { RegistrationFormData, RegistrationRow } from '@/types/workshop';

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

    // Get members and validate
    const members = await getMembers(config.googleSheetId);
    const memberValidation = validateMember(
      {
        email: formData.email,
        prenume: formData.prenume,
        nume: formData.nume,
        telefon: formData.telefon,
      },
      members
    );

    // Determine member status and payment link
    const isMember = memberValidation.isMember;
    const statusMembru = isMember ? 'Membru' : 'Non-Membru';
    const paymentLink = isMember ? config.stripeLinks.member : config.stripeLinks.standard;
    const suma = isMember ? 'Pret Membru' : 'Pret Standard';

    // Handle PF invoice defaults
    let companieFirma = formData.companieFirma || '';
    let cui = formData.cui || '';

    if (formData.invoiceType === 'PF') {
      companieFirma = `${formData.prenume} ${formData.nume}`;
      cui = '0000000000000'; // 13 zeros for PF
    }

    // Prepare Google Sheets row
    const registrationRow: RegistrationRow = {
      Timestamp: new Date().toISOString(),
      Workshop: config.name,
      Nume: `${formData.prenume} ${formData.nume}`,
      Email: formData.email,
      Telefon: formData.telefon,
      Provocare: formData.provocare,
      Rezultat: formData.rezultat,
      Nivel: formData.nivel,
      Factura: formData.invoiceType,
      'Nume Firma': companieFirma,
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
      { ...formData, companieFirma, cui },
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
