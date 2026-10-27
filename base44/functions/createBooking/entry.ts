import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const SERVICES = {
  standard: 'Standard clean',
  deep: 'Deep clean',
  move: 'Move-out clean',
  office: 'Office & studio',
};

const SLOTS = {
  '08:00': '8:00 – 10:00 AM',
  '10:00': '10:00 AM – 12:00 PM',
  '12:00': '12:00 – 2:00 PM',
  '14:00': '2:00 – 4:00 PM',
  '16:00': '4:00 – 6:00 PM',
};

const clean = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

const escapeHtml = (value) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const formatDate = (value) =>
  new Date(`${value}T12:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

const row = (label, value) => `
  <p style="margin:0 0 18px;font-size:15px;line-height:1.55;color:#12312a;">
    <span style="display:block;margin-bottom:4px;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:#7b8880;">${label}</span>
    ${value}
  </p>`;

function buildDetails({ serviceLabel, dateLabel, slotLabel, place, notes }) {
  return { serviceLabel, dateLabel, slotLabel, place, notes: notes || '' };
}

function buildHtml(details, firstName) {
  const { serviceLabel, dateLabel, slotLabel, place, notes } = details;
  return `<div style="background:#faf8f3;padding:32px 16px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#fffdf8;border:1px solid #e2e5de;border-radius:20px;padding:32px;">
    <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#7b8880;">Let It Shine Cleaning Service Co.</p>
    <h1 style="margin:14px 0 0;font-size:26px;font-weight:400;line-height:1.25;color:#12312a;">You're booked, ${escapeHtml(firstName)}.</h1>
    <p style="margin:12px 0 0;font-size:14px;line-height:1.6;color:#5a6a63;">Here is everything we have on the calendar.</p>
    <div style="margin:26px 0 24px;border-top:1px solid #e2e5de;"></div>
    ${row('Service', escapeHtml(serviceLabel))}
    ${row('Day', escapeHtml(dateLabel))}
    ${row('Arrival window', escapeHtml(slotLabel))}
    ${row('Where', escapeHtml(place))}
    ${notes ? row('Your notes', escapeHtml(notes)) : ''}
    <div style="margin:26px 0 20px;border-top:1px solid #e2e5de;"></div>
    <p style="margin:0;font-size:13px;line-height:1.65;color:#5a6a63;">We will confirm your arrival by text the day before. Need to change or cancel? Open <strong style="color:#12312a;">My cleanups</strong> in the app, or just reply to this email.</p>
    <p style="margin:22px 0 0;font-size:12px;line-height:1.6;color:#7b8880;">Let It Shine Cleaning Service Co. · letitshine@gmail.com · (936) 955-0394</p>
  </div>
</div>`;
}

function buildText(details, firstName) {
  const { serviceLabel, dateLabel, slotLabel, place, notes } = details;
  return `You're booked, ${firstName}.

Service: ${serviceLabel}
Day: ${dateLabel}
Arrival window: ${slotLabel}
Where: ${place}${notes ? `\nNotes: ${notes}` : ''}

We will confirm your arrival by text the day before. Need to change or cancel? Open My cleanups in the app, or just reply to this email.

Let It Shine Cleaning Service Co. · letitshine@gmail.com · (936) 955-0394`;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const input = await req.json();

    const payload = {
      service_type: input?.service_type,
      appointment_date: clean(input?.appointment_date, 10),
      time_slot: input?.time_slot,
      full_name: clean(input?.full_name, 120),
      email: clean(input?.email, 160),
      phone: clean(input?.phone, 40),
      address_line1: clean(input?.address_line1, 200),
      city: clean(input?.city, 100),
      postal_code: clean(input?.postal_code, 20),
      notes: clean(input?.notes, 1000),
    };

    const invalid = [];
    if (!SERVICES[payload.service_type]) invalid.push('service_type');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.appointment_date)) invalid.push('appointment_date');
    if (!SLOTS[payload.time_slot]) invalid.push('time_slot');
    if (!payload.full_name) invalid.push('full_name');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) invalid.push('email');
    if (!payload.address_line1) invalid.push('address_line1');
    if (!payload.city) invalid.push('city');
    if (invalid.length > 0) {
      return Response.json({ error: `Missing or invalid: ${invalid.join(', ')}`, fields: invalid }, { status: 400 });
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (payload.appointment_date < yesterday) {
      return Response.json({ error: 'Pick a date that is not in the past.', fields: ['appointment_date'] }, { status: 400 });
    }

    const booking = await base44.entities.Booking.create({ ...payload, status: 'scheduled' });

    const details = buildDetails({
      serviceLabel: SERVICES[booking.service_type],
      dateLabel: formatDate(booking.appointment_date),
      slotLabel: SLOTS[booking.time_slot],
      place: `${booking.address_line1}, ${booking.city}${booking.postal_code ? ` ${booking.postal_code}` : ''}`,
      notes: booking.notes,
    });

    const firstName = (booking.full_name || user.full_name || 'there').split(' ')[0];
    let emailSent = false;

    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: user.email,
        from_name: 'Let It Shine Cleaning Service Co.',
        subject: `Your clean is booked — ${details.dateLabel}`,
        body: buildHtml(details, firstName),
        text: buildText(details, firstName),
      });
      emailSent = true;
    } catch (emailError) {
      console.error('Confirmation email failed:', emailError.message);
    }

    return Response.json({ booking, emailSent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}