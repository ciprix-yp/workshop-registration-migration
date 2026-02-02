import { WorkshopConfig } from '@/types/workshop';

/**
 * Multi-Workshop Configuration
 *
 * To add a new workshop:
 * 1. Add entry to WORKSHOPS array
 * 2. Create Google Sheet with tabs: "Configurare Workshop", "Membri", "Inscrieri"
 * 3. Update environment variables if using env-based config
 */

export const WORKSHOPS: Record<string, WorkshopConfig> = {
  'bizz-club-sm': {
    id: 'bizz-club-sm-2026',
    slug: 'bizz-club-sm',
    name: 'Workshop BIZZ.CLUB Satu Mare',
    googleSheetId: process.env.NEXT_PUBLIC_SHEET_ID_BIZZ_CLUB_SM || '1doznv9U9oT1pA_MJwVrNPYA-9sK6Ap7VMWphOJgD14A',
    stripeLinks: {
      member: process.env.NEXT_PUBLIC_STRIPE_MEMBER_BIZZ_CLUB_SM || 'https://buy.stripe.com/fZu00ifCQ8TkgLLbR05ZC0a',
      standard: process.env.NEXT_PUBLIC_STRIPE_STANDARD_BIZZ_CLUB_SM || 'https://buy.stripe.com/eVqcN4cqE2uWeDD9IS5ZC0b',
    },
    webhookUrl: process.env.N8N_WEBHOOK_URL_BIZZ_CLUB_SM || 'https://youprotect.app.n8n.cloud/webhook/83507047-9b65-4640-8453-a6657a5bd037',
    active: true,
  },

  // Template for future workshops
  // 'workshop-slug': {
  //   id: 'unique-workshop-id',
  //   slug: 'workshop-slug',
  //   name: 'Workshop Display Name',
  //   googleSheetId: process.env.NEXT_PUBLIC_SHEET_ID_WORKSHOP || '',
  //   stripeLinks: {
  //     member: process.env.NEXT_PUBLIC_STRIPE_MEMBER_WORKSHOP || '',
  //     standard: process.env.NEXT_PUBLIC_STRIPE_STANDARD_WORKSHOP || '',
  //   },
  //   webhookUrl: process.env.N8N_WEBHOOK_URL_WORKSHOP || '',
  //   active: false,
  // },
};

/**
 * Get workshop config by slug
 */
export function getWorkshopConfig(slug: string): WorkshopConfig | null {
  return WORKSHOPS[slug] || null;
}

/**
 * Get all active workshops
 */
export function getActiveWorkshops(): WorkshopConfig[] {
  return Object.values(WORKSHOPS).filter(w => w.active);
}

/**
 * Default workshop (for backward compatibility)
 */
export const DEFAULT_WORKSHOP_SLUG = 'bizz-club-sm';

/**
 * n8n Webhook credentials (shared across workshops)
 */
export const N8N_AUTH = {
  username: process.env.N8N_WEBHOOK_USER || 'BIZZ.CLUB-SM',
  password: process.env.N8N_WEBHOOK_PASS || 'BizzClub!2026Safe',
} as const;
