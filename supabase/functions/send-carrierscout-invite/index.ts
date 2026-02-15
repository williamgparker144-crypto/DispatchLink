// Supabase Edge Function: send-carrierscout-invite
// Sends CarrierScout invitation emails via Resend and SMS via Twilio

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InviteRequest {
  dispatcherId: string;
  carrierName: string;
  mcNumber: string;
  email: string;
  phone?: string;
  sendSms?: boolean;
  personalMessage?: string;
}

async function sendEmailViaResend(
  to: string,
  carrierName: string,
  mcNumber: string,
  personalMessage?: string,
): Promise<{ success: boolean; error?: string }> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    console.warn('RESEND_API_KEY not configured, skipping email send');
    return { success: false, error: 'Email service not configured' };
  }

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1a365d, #2d4a6f); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">You're Invited to CarrierScout</h1>
        <p style="color: #93c5fd; margin: 10px 0 0 0; font-size: 14px;">by DispatchLink</p>
      </div>

      <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
        <p style="color: #334155; font-size: 16px; line-height: 1.6;">
          Hi <strong>${carrierName}</strong> (${mcNumber}),
        </p>

        <p style="color: #334155; font-size: 16px; line-height: 1.6;">
          A dispatcher on DispatchLink wants to work with you and has invited you to join
          <strong>CarrierScout</strong> — our premium load board and carrier management platform.
        </p>

        ${personalMessage ? `
          <div style="background: white; border-left: 4px solid #ff6b35; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Personal Message</p>
            <p style="color: #334155; font-size: 14px; margin: 0; font-style: italic;">"${personalMessage}"</p>
          </div>
        ` : ''}

        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
          <h3 style="color: #1a365d; margin: 0 0 12px 0; font-size: 16px;">With CarrierScout, you get:</h3>
          <ul style="color: #475569; padding-left: 20px; margin: 0;">
            <li style="margin-bottom: 8px;">Access to premium load boards with real-time freight matching</li>
            <li style="margin-bottom: 8px;">Direct connections with verified dispatchers</li>
            <li style="margin-bottom: 8px;">Rate negotiation tools and market insights</li>
            <li style="margin-bottom: 8px;">Streamlined MC# permission management</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://dispatchlink.com/carrierscout?ref=invite&mc=${encodeURIComponent(mcNumber)}"
             style="background: #ff6b35; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
            Join CarrierScout
          </a>
        </div>

        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 30px;">
          This invitation was sent via DispatchLink. If you didn't expect this email, you can safely ignore it.
        </p>
      </div>

      <div style="background: #1a365d; padding: 20px; border-radius: 0 0 12px 12px; text-align: center;">
        <p style="color: #93c5fd; font-size: 12px; margin: 0;">
          DispatchLink — Connecting Dispatchers, Carriers & Brokers
        </p>
      </div>
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'DispatchLink <invites@dispatchlink.com>',
        to: [to],
        subject: `You're invited to join CarrierScout — ${carrierName}`,
        html: htmlBody,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Resend API error:', errorData);
      return { success: false, error: `Email send failed: ${response.status}` };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Email send error:', err);
    return { success: false, error: err.message };
  }
}

async function sendSmsViaTwilio(
  phone: string,
  carrierName: string,
): Promise<{ success: boolean; error?: string }> {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

  if (!accountSid || !authToken || !fromNumber) {
    console.warn('Twilio credentials not configured, skipping SMS');
    return { success: false, error: 'SMS service not configured' };
  }

  const message = `Hi ${carrierName}! A dispatcher on DispatchLink has invited you to join CarrierScout — our premium load board platform. Sign up at https://dispatchlink.com/carrierscout`;

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: phone,
          From: fromNumber,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Twilio API error:', errorData);
      return { success: false, error: `SMS send failed: ${response.status}` };
    }

    return { success: true };
  } catch (err: any) {
    console.error('SMS send error:', err);
    return { success: false, error: err.message };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: InviteRequest = await req.json();
    const { dispatcherId, carrierName, mcNumber, email, phone, sendSms, personalMessage } = body;

    // Validate inputs
    if (!dispatcherId || !carrierName || !mcNumber || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: dispatcherId, carrierName, mcNumber, email' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address format' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Determine invite method
    const inviteMethod = (sendSms && phone) ? 'both' : 'email';

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    let inviteRecord: any = null;

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Insert invite record
      const { data, error: dbError } = await supabase
        .from('carrierscout_invites')
        .insert({
          dispatcher_id: dispatcherId,
          carrier_name: carrierName,
          carrier_mc_number: mcNumber,
          invite_email: email,
          invite_phone: phone || null,
          invite_method: inviteMethod,
          personal_message: personalMessage || null,
          status: 'pending',
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database insert error:', dbError);
        // Continue even if DB fails - still try to send the invite
      } else {
        inviteRecord = data;
      }
    }

    // Send email
    const emailResult = await sendEmailViaResend(email, carrierName, mcNumber, personalMessage);

    // Send SMS if requested
    let smsResult = { success: false, error: 'SMS not requested' };
    if (sendSms && phone) {
      smsResult = await sendSmsViaTwilio(phone, carrierName);
    }

    // Update invite status if we have a record
    if (inviteRecord && (emailResult.success || smsResult.success)) {
      if (supabaseUrl && Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) {
        const supabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
        await supabase
          .from('carrierscout_invites')
          .update({ status: 'sent' })
          .eq('id', inviteRecord.id);
        inviteRecord.status = 'sent';
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        invite: inviteRecord || {
          id: crypto.randomUUID(),
          dispatcher_id: dispatcherId,
          carrier_name: carrierName,
          carrier_mc_number: mcNumber,
          invite_email: email,
          invite_phone: phone || null,
          invite_method: inviteMethod,
          personal_message: personalMessage || null,
          status: emailResult.success ? 'sent' : 'pending',
          invited_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        emailSent: emailResult.success,
        smsSent: smsResult.success,
        message: emailResult.success
          ? `Invitation sent to ${email}${smsResult.success ? ' and via SMS' : ''}`
          : 'Invitation recorded. Email will be sent when the email service is configured.',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('send-carrierscout-invite error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process invitation. Please try again.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
