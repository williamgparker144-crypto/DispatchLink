import type { VercelRequest, VercelResponse } from '@vercel/node';

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

  const apiKey = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_LIST_ID;

  if (!apiKey || !listId) {
    return res.status(500).json({ error: 'Mailchimp not configured' });
  }

  const dc = apiKey.split('-').pop();
  const url = `https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members`;

  const memberData = {
    email_address: email,
    status: 'subscribed',
    merge_fields: {
      ...(firstName && { FNAME: firstName }),
      ...(lastName && { LNAME: lastName }),
      ...(phone && { PHONE: phone }),
      ...(company && { COMPANY: company }),
      ...(userType && { USER_TYPE: userType }),
      ...(dotNumber && { DOT_NUM: dotNumber }),
      ...(mcNumber && { MC_NUM: mcNumber }),
      ...(source && { SOURCE: source }),
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
    return res.status(500).json({ error: 'Failed to subscribe' });
  }
}
