import { WebhookPayload } from '@/types/workshop';
import { N8N_AUTH } from '@/config/workshops';

/**
 * n8n Webhook Client
 *
 * Sends registration data to n8n webhook with Basic Auth
 * IMPORTANT: Webhook failure should NOT block user registration
 */

/**
 * Send webhook payload to n8n
 *
 * @param webhookUrl - n8n webhook URL
 * @param payload - Registration data
 * @returns Promise<boolean> - Success status
 */
export async function sendWebhook(
  webhookUrl: string,
  payload: WebhookPayload
): Promise<boolean> {
  try {
    // Create Basic Auth header
    const authString = Buffer.from(
      `${N8N_AUTH.username}:${N8N_AUTH.password}`
    ).toString('base64');

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Webhook failed:', {
        status: response.status,
        statusText: response.statusText,
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error('Webhook error:', error);
    return false;
  }
}

/**
 * Build webhook payload from registration data
 */
export function buildWebhookPayload(
  workshopName: string,
  formData: any,
  memberStatus: 'Membru' | 'Non-Membru',
  paymentSum: string
): WebhookPayload {
  return {
    timestamp: new Date().toISOString(),
    workshop: workshopName,
    data: formData,
    memberStatus,
    paymentSum,
    invoice: {
      type: formData.invoiceType,
      company: formData.companyName || '',
      cui: formData.cui || '',
    },
  };
}
