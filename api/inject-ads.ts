import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * Vercel Serverless Function — Ad Campaign Lifecycle Manager
 *
 * Activates campaigns whose start_date has arrived.
 * Completes campaigns whose end_date has passed.
 *
 * Called via Vercel Cron every 6 hours.
 * Can also be triggered manually: GET /api/inject-ads
 */

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Missing Supabase configuration' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const today = new Date().toISOString().split('T')[0];

  let activated = 0;
  let completed = 0;

  try {
    // Activate campaigns that are pending_review and have a start_date <= today
    const { data: toActivate, error: activateErr } = await supabase
      .from('ad_campaigns')
      .update({ status: 'active' })
      .eq('status', 'pending_review')
      .lte('start_date', today)
      .select('id');

    if (activateErr) {
      console.error('Error activating campaigns:', activateErr);
    } else {
      activated = toActivate?.length || 0;
    }

    // Complete campaigns that are active and have an end_date < today
    const { data: toComplete, error: completeErr } = await supabase
      .from('ad_campaigns')
      .update({ status: 'completed' })
      .eq('status', 'active')
      .lt('end_date', today)
      .not('end_date', 'is', null)
      .select('id');

    if (completeErr) {
      console.error('Error completing campaigns:', completeErr);
    } else {
      completed = toComplete?.length || 0;
    }

    return res.status(200).json({
      ok: true,
      activated,
      completed,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('inject-ads error:', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
