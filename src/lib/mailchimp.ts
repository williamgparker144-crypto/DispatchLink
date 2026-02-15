export interface MailchimpSubscribeData {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  userType?: string;
  dotNumber?: string;
  mcNumber?: string;
  source: string;
}

export async function subscribeToMailchimp(data: MailchimpSubscribeData): Promise<void> {
  try {
    await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch {
    // Fire-and-forget — never block user flow
  }
}
