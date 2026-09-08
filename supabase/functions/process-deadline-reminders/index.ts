// Supabase Edge Function: process-deadline-reminders
//
// Server-side reminder trigger. Intended to be invoked on a schedule via
// pg_cron + pg_net (see the scheduling block at the bottom of
// supabase/schema.sql). Computes due deadline reminders from database data,
// writes server-side notifications, logs each delivery by a stable sourceKey
// in notification_email_log (dedup), and returns a summary.
//
// Email delivery (Resend) is a follow-up slice: the `deliveries` array below
// marks where the Resend call will plug in once RESEND_API_KEY is provisioned.

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { computeDueReminders } from '../_shared/reminders.js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }
  // Scheduled runs authenticate with the service role key; manual invocations
  // may use any valid Authorization header (user JWT or service key).
  if (!req.headers.get('Authorization')) {
    return json({ error: 'Missing Authorization header' }, 401);
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } },
  );

  const today = new Date().toISOString().slice(0, 10);

  try {
    // Deadline sources: active scholarships and non-terminal applications.
    const [{ data: scholarships, error: scholarshipsError }, { data: applications, error: applicationsError }] =
      await Promise.all([
        supabaseAdmin
          .from('scholarships')
          .select('id, title, deadline')
          .eq('is_active', true)
          .not('deadline', 'is', null),
        supabaseAdmin
          .from('applications')
          .select('id, scholarship_id, status, student_id')
          .not('status', 'in', '("Approved","Rejected")'),
      ]);
    if (scholarshipsError) throw scholarshipsError;
    if (applicationsError) throw applicationsError;

    const items = (scholarships ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      deadline: row.deadline,
      kind: 'scholarship',
    }));

    // Application reminders resolve their deadline through the scholarship.
    if (applications?.length) {
      const scholarshipIds = [...new Set(applications.map((row) => row.scholarship_id))];
      const { data: linked, error: linkedError } = await supabaseAdmin
        .from('scholarships')
        .select('id, title, deadline')
        .in('id', scholarshipIds)
        .not('deadline', 'is', null);
      if (linkedError) throw linkedError;

      const byId = new Map((linked ?? []).map((row) => [row.id, row]));
      for (const application of applications) {
        const scholarship = byId.get(application.scholarship_id);
        if (!scholarship) continue;
        items.push({
          id: application.id,
          title: scholarship.title,
          deadline: scholarship.deadline,
          kind: 'application',
        });
      }
    }

    // Dedup: anything already logged server-side is never re-delivered.
    const { data: existingLog, error: logError } = await supabaseAdmin
      .from('notification_email_log')
      .select('source_key');
    if (logError) throw logError;
    const existingKeys = new Set((existingLog ?? []).map((row) => row.source_key));

    const dueReminders = computeDueReminders({ today, items, existingKeys });
    const recipients = new Map();
    const deliveries = [];

    for (const reminder of dueReminders) {
      const isApplicationReminder = reminder.kind === 'application';
      const recipientIds = isApplicationReminder
        ? [applications.find((row) => row.id === reminder.itemId)?.student_id].filter(Boolean)
        : applications
            .filter((row) => row.scholarship_id === reminder.itemId)
            .map((row) => row.student_id);

      for (const userId of recipientIds) {
        const userKey = `${reminder.sourceKey}:${userId}`;

        if (!recipients.has(userId)) {
          const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('user_id, full_name, email')
            .eq('user_id', userId)
            .maybeSingle();
          if (profileError) throw profileError;
          if (profile) recipients.set(userId, profile);
        }

        const profile = recipients.get(userId);
        if (!profile) continue;

        // Server-side in-app notification (mirrors the client-generated shape).
        await supabaseAdmin.from('notifications').insert({
          profile_id: profile.user_id,
          title: reminder.title,
          channel: isApplicationReminder ? 'Application deadline' : 'Deadline reminder',
          body: `${reminder.itemTitle} is due on ${reminder.deadline ?? 'its deadline'}.`,
          status: 'Unread',
        });

        // Dedup ledger: one row per sourceKey:user, ever.
        await supabaseAdmin
          .from('notification_email_log')
          .upsert({ source_key: userKey, user_id: profile.user_id, reminder_title: reminder.title });

        deliveries.push({
          userKey,
          userId: profile.user_id,
          email: profile.email,
          title: reminder.title,
          // FUTURE SLICE: Resend send goes here once RESEND_API_KEY is set.
        });
      }
    }

    return json({
      ok: true,
      today,
      dueReminders: dueReminders.length,
      deliveries: deliveries.length,
      preview: deliveries.slice(0, 10),
    });
  } catch (error) {
    return json({ ok: false, error: String(error?.message ?? error) }, 500);
  }
});
