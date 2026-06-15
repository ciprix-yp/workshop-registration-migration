// Analytics sink for ClickHouse.
// Returns silently when CLICKHOUSE_URL is not set — app stays on Sheets-only mode.

const CH_URL = process.env.CLICKHOUSE_URL;
const CH_USER = process.env.CLICKHOUSE_USER;
const CH_PASSWORD = process.env.CLICKHOUSE_PASSWORD;
const CH_DB = process.env.CLICKHOUSE_DB ?? 'railway';

export interface RegistrationEvent {
  workshop: string;
  email: string;
  nume: string;
  telefon: string;
  provocare: string;
  rezultat: string;
  nivel: string;
  factura: string;
  status_membru: string;
  suma: string;
  gdpr: boolean;
  marketing: boolean;
}

function authHeaders(): HeadersInit {
  return {
    ...(CH_USER ? { 'X-ClickHouse-User': CH_USER } : {}),
    ...(CH_PASSWORD ? { 'X-ClickHouse-Key': CH_PASSWORD } : {}),
  };
}

export async function sinkRegistration(event: RegistrationEvent): Promise<void> {
  if (!CH_URL) return;

  const endpoint =
    `${CH_URL}/?query=INSERT+INTO+${CH_DB}.registrations+FORMAT+JSONEachRow`;

  const row = JSON.stringify({
    workshop:      event.workshop,
    email:         event.email,
    nume:          event.nume,
    telefon:       event.telefon,
    provocare:     event.provocare,
    rezultat:      event.rezultat,
    nivel:         event.nivel,
    factura:       event.factura,
    status_membru: event.status_membru,
    suma:          event.suma,
    gdpr:          event.gdpr ? 1 : 0,
    marketing:     event.marketing ? 1 : 0,
  });

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: authHeaders(),
      body: row,
    });
    if (!res.ok) {
      console.error('[ch-sink] insert failed:', res.status, await res.text());
    }
  } catch (err) {
    console.error('[ch-sink] unreachable (non-fatal):', err);
  }
}
