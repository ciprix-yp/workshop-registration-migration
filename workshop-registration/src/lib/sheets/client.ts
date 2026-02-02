import { google } from 'googleapis';
import { Member, RegistrationRow } from '@/types/workshop';

/**
 * Google Sheets API Client
 * Handles all Google Sheets operations for workshop data
 */

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

/**
 * Get authenticated Google Sheets client
 */
export async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: SCOPES,
  });

  const authClient = await auth.getClient();
  return google.sheets({ version: 'v4', auth: authClient as any });
}

/**
 * Get workshop configuration from "Configurare Workshop" sheet
 */
export async function getWorkshopConfig(sheetId: string): Promise<Record<string, string>> {
  const sheets = await getSheetsClient();

  // Try to find config sheet (flexible naming)
  const configSheetNames = ['Configurare Workshop', 'Config', 'Configurare'];

  for (const sheetName of configSheetNames) {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${sheetName}!A:B`,
      });

      const rows = response.data.values || [];
      const config: Record<string, string> = {};

      rows.forEach(([key, value]) => {
        if (key && value) {
          config[key] = value;
        }
      });

      return config;
    } catch (error) {
      // Try next sheet name
      continue;
    }
  }

  throw new Error('Workshop config sheet not found');
}

/**
 * Get members from "Membri" sheet
 */
export async function getMembers(sheetId: string): Promise<Member[]> {
  const sheets = await getSheetsClient();

  // Try to find members sheet (flexible naming)
  const memberSheetNames = ['Membri', 'Membrii', 'Members'];

  for (const sheetName of memberSheetNames) {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${sheetName}!A2:E`, // Skip header row
      });

      const rows = response.data.values || [];

      return rows.map(([prenume, nume, companie, email, telefon]) => ({
        prenume: prenume || '',
        nume: nume || '',
        companie: companie || '',
        email: email || '',
        telefon: telefon || '',
      }));
    } catch (error) {
      // Try next sheet name
      continue;
    }
  }

  throw new Error('Members sheet not found');
}

/**
 * Append registration to "Inscrieri" sheet
 */
export async function appendRegistration(
  sheetId: string,
  registration: RegistrationRow
): Promise<void> {
  const sheets = await getSheetsClient();

  // Try to find registrations sheet
  const registrationSheetNames = ['Inscrieri', 'Registrations', 'Înscrieri'];

  const row = [
    registration.Timestamp,
    registration.Workshop,
    registration.Nume,
    registration.Email,
    registration.Telefon,
    registration.Provocare,
    registration.Rezultat,
    registration.Nivel,
    registration.Factura,
    registration['Nume Firma'],
    `'${registration.CUI}`, // Leading apostrophe for text format
    registration.GDPR,
    registration.Marketing,
    registration['Status Membru'],
    registration.Suma,
  ];

  for (const sheetName of registrationSheetNames) {
    try {
      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: `${sheetName}!A:O`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [row],
        },
      });

      return; // Success
    } catch (error) {
      // Try next sheet name or create sheet
      continue;
    }
  }

  // If all attempts failed, try to create sheet
  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: 'Inscrieri',
              },
            },
          },
        ],
      },
    });

    // Add header row
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: 'Inscrieri!A1:O1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          'Timestamp', 'Workshop', 'Nume', 'Email', 'Telefon', 'Provocare',
          'Rezultat', 'Nivel', 'Factura', 'Nume Firma', 'CUI', 'GDPR',
          'Marketing', 'Status Membru', 'Suma',
        ]],
      },
    });

    // Append data
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Inscrieri!A:O',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });
  } catch (error) {
    throw new Error(`Failed to append registration: ${error}`);
  }
}
