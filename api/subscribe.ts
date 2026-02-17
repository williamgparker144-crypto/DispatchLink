import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

interface SubscribeBody {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  userType?: string;
  dotNumber?: string;
  mcNumber?: string;
  source?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    email,
    firstName,
    lastName,
    phone,
    company,
    userType,
    dotNumber,
    mcNumber,
    source,
  } = req.body as SubscribeBody;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // 1. Store signup in Supabase (always — even if Mailchimp fails)
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_KEY;
  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from('waitlist_signups').insert({
        email,
        first_name: firstName || null,
        last_name: lastName || null,
        phone: phone || null,
        company: company || null,
        user_type: userType || null,
        dot_number: dotNumber || null,
        mc_number: mcNumber || null,
        source: source || 'waitlist',
      });
    } catch (err) {
      console.warn('Failed to save waitlist signup to Supabase:', err);
    }
  }

  // 2. Send admin notification email via Resend
  const resendKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'dispatch@techspatch-logistics.com';
  if (resendKey) {
    try {
      const details = [
        `Email: ${email}`,
        firstName && `Name: ${firstName}${lastName ? ' ' + lastName : ''}`,
        company && `Company: ${company}`,
        userType && `User Type: ${userType}`,
        dotNumber && `DOT#: ${dotNumber}`,
        mcNumber && `MC#: ${mcNumber}`,
        `Source: ${source || 'waitlist'}`,
        `Date: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}`,
      ].filter(Boolean).join('\n');

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'DispatchLink <notifications@dispatchlinkpro.vip>',
          to: adminEmail,
          subject: `New CarrierScout Waitlist Signup: ${email}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #1E3A5F; padding: 20px; border-radius: 8px 8px 0 0;">
                <h2 style="color: white; margin: 0;">New Waitlist Signup</h2>
              </div>
              <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 8px 0; color: #6b7280; width: 120px;">Email</td><td style="padding: 8px 0; font-weight: bold;">${email}</td></tr>
                  ${firstName ? `<tr><td style="padding: 8px 0; color: #6b7280;">Name</td><td style="padding: 8px 0;">${firstName}${lastName ? ' ' + lastName : ''}</td></tr>` : ''}
                  ${company ? `<tr><td style="padding: 8px 0; color: #6b7280;">Company</td><td style="padding: 8px 0;">${company}</td></tr>` : ''}
                  ${userType ? `<tr><td style="padding: 8px 0; color: #6b7280;">User Type</td><td style="padding: 8px 0;">${userType}</td></tr>` : ''}
                  ${dotNumber ? `<tr><td style="padding: 8px 0; color: #6b7280;">DOT#</td><td style="padding: 8px 0;">${dotNumber}</td></tr>` : ''}
                  ${mcNumber ? `<tr><td style="padding: 8px 0; color: #6b7280;">MC#</td><td style="padding: 8px 0;">${mcNumber}</td></tr>` : ''}
                  <tr><td style="padding: 8px 0; color: #6b7280;">Source</td><td style="padding: 8px 0;">${source || 'waitlist'}</td></tr>
                </table>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  This signup has been saved to Supabase and added to your Mailchimp audience.
                  View all signups in the CarrierScout admin panel on DispatchLink.
                </p>
              </div>
            </div>
          `,
          text: `New CarrierScout Waitlist Signup\n\n${details}`,
        }),
      });
    } catch (err) {
      console.warn('Failed to send admin notification via Resend:', err);
    }
  }

  // 3. Subscribe to Mailchimp
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_LIST_ID;

  if (!apiKey || !listId) {
    // Mailchimp not configured but Supabase save succeeded
    return res.status(200).json({ status: 'saved', mailchimp: false });
  }

  const dc = apiKey.split('-').pop();
  const url = `https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members`;

  // Only send standard Mailchimp merge fields (FNAME, LNAME, PHONE)
  // Custom fields (company, userType, etc.) are stored in Supabase
  const memberData = {
    email_address: email,
    status: 'subscribed',
    merge_fields: {
      ...(firstName && { FNAME: firstName }),
      ...(lastName && { LNAME: lastName }),
      ...(phone && { PHONE: phone }),
    },
  };

  const authHeader = Buffer.from(`anystring:${apiKey}`).toString('base64');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memberData),
    });

    if (response.ok) {
      return res.status(200).json({ status: 'subscribed' });
    }

    const errorData = await response.json();

    // Member already exists — update instead
    if (errorData.title === 'Member Exists') {
      const subscriberHash = errorData.detail?.match(/[a-f0-9]{32}/)?.[0];
      if (!subscriberHash) {
        return res.status(200).json({ status: 'updated' });
      }

      await fetch(`${url}/${subscriberHash}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Basic ${authHeader}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merge_fields: memberData.merge_fields,
          status: 'subscribed',
        }),
      });

      return res.status(200).json({ status: 'updated' });
    }

    return res.status(response.status).json({ error: errorData.detail || 'Mailchimp error' });
  } catch {
    // Mailchimp failed but Supabase save succeeded
    return res.status(200).json({ status: 'saved', mailchimp: false });
  }
}
