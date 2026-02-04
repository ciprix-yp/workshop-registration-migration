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
        range: `'${sheetName}'!A:B`,
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
 *
 * IMPORTANT: Returns empty array if sheet not found (all users are non-members)
 * This matches original code.gs behavior
 */
export async function getMembers(sheetId: string): Promise<Member[]> {
  const sheets = await getSheetsClient();

  // Try to find members sheet (flexible naming)
  // Added "Raport Membrii" and "Raport Membri" for Romanian member reports
  const memberSheetNames = ['Raport membri', 'Raport Membrii', 'Raport Membri', 'Membri', 'Membrii', 'Members'];

  console.log(`[getMembers] Searching for members sheet in: ${memberSheetNames.join(', ')}`);

  for (const sheetName of memberSheetNames) {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `'${sheetName}'!A2:G`, // Read all columns including Funcție and Grupă
      });

      const rows = response.data.values || [];

      console.log(`[getMembers] Found sheet "${sheetName}" with ${rows.length} members`);

      if (rows.length > 0) {
        console.log(`[getMembers] Sample member (first 5 columns):`, rows[0].slice(0, 5));
      }

      // Map only the first 5 columns we need: Prenume, Nume, Companie, Email, Telefon
      // Ignore Funcție (column F) and Grupă (column G)
      return rows.map((row) => ({
        prenume: (row[0] || '').trim(),
        nume: (row[1] || '').trim(),
        companie: (row[2] || '').trim(),
        email: (row[3] || '').trim(),
        telefon: (row[4] || '').trim(),
      }));
    } catch (error) {
      console.log(`[getMembers] Sheet "${sheetName}" not found or error: ${error}`);
      // Try next sheet name
      continue;
    }
  }

  // If Members sheet not found, return empty array
  // This means all users will be treated as non-members
  console.log('[getMembers] No members sheet found with names: ' + memberSheetNames.join(', '));
  console.log('[getMembers] Treating all users as non-members');
  return [];
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
        range: `'${sheetName}'!A:O`,
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
