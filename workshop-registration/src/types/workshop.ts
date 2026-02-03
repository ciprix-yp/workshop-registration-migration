/**
 * Workshop Registration Types
 * Multi-workshop scalable architecture
 */

// Workshop Configuration
export interface WorkshopConfig {
  id: string;
  slug: string;
  name: string;
  googleSheetId: string;
  stripeLinks: {
    member: string;
    standard: string;
  };
  webhookUrl: string;
  active: boolean;
}

// Member from "Membri" sheet
export interface Member {
  prenume: string;
  nume: string;
  companie: string;
  email: string;
  telefon: string;
}

// Parsed user data for validation
export interface UserData {
  email: string;
  name: string;  // Full name from single field
  phone: string;
}

// Member validation result
export interface MemberValidationResult {
  isMember: boolean;
  matchedBy?: 'email' | 'name+email' | 'name+phone' | 'email+phone';
  memberData?: Member;
}

// Invoice types
export type InvoiceType = 'PJ' | 'PF';

// Registration form data (EXACT field names from original)
export interface RegistrationFormData {
  // Step 1
  email: string;

  // Step 2
  name: string;        // Single field "Nume Prenume"
  phone: string;
  challenge: string;
  result: string;
  level: string;

  // Step 3
  invoiceType: InvoiceType;
  companyName?: string;  // Required for PJ, auto-filled for PF
  cui?: string;          // Required for PJ, auto "0000000000000" for PF
  gdprConsent: boolean;
  marketingConsent: boolean;
}

// Final submission payload
export interface RegistrationSubmission extends RegistrationFormData {
  timestamp: string;
  workshopName: string;
  statusMembru: 'Membru' | 'Non-Membru';
  suma: string;
}

// Google Sheets row structure for "Inscrieri" tab (Romanian column names)
export interface RegistrationRow {
  Timestamp: string;
  Workshop: string;
  Nume: string;              // Full name from form
  Email: string;
  Telefon: string;
  Provocare: string;
  Rezultat: string;
  Nivel: string;
  Factura: InvoiceType;
  'Nume Firma': string;
  CUI: string;
  GDPR: 'Da' | 'Nu';
  Marketing: 'Da' | 'Nu';
  'Status Membru': 'Membru' | 'Non-Membru';
  Suma: string;
}

// n8n Webhook payload
export interface WebhookPayload {
  timestamp: string;
  workshop: string;
  data: RegistrationFormData;
  memberStatus: 'Membru' | 'Non-Membru';
  paymentSum: string;
  invoice: {
    type: InvoiceType;
    company: string;
    cui: string;
  };
}
