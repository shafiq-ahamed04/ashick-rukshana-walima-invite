/**
 * Parse date and time with IST offset (+05:30)
 * Returns a valid JS Date object representing the exact instant in time.
 */
export function getWalimaStartInstant(dateStr, timeStr) {
  if (!dateStr) return null;
  
  let hours = 12;
  let minutes = 0;

  if (timeStr) {
    const match = timeStr.trim().match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (match) {
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
      const ampm = match[3] ? match[3].toUpperCase() : null;
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
    }
  }

  const hStr = String(hours).padStart(2, '0');
  const mStr = String(minutes).padStart(2, '0');
  // Combine with +05:30 offset
  const isoWithOffset = `${dateStr}T${hStr}:${mStr}:00+05:30`;
  const date = new Date(isoWithOffset);
  return isNaN(date.getTime()) ? null : date;
}

export function formatEventDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(`${dateStr}T12:00:00+05:30`);
  if (isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata'
  }).format(date);
}

export function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(`${dateStr}T12:00:00+05:30`);
  if (isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata'
  }).format(date);
}

export function formatWeekdayOnly(dateStr) {
  if (!dateStr) return '';
  const date = new Date(`${dateStr}T12:00:00+05:30`);
  if (isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    timeZone: 'Asia/Kolkata'
  }).format(date);
}

export function toUtcIcsString(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  );
}

export function generateIcsBlob({ bride, groom, walima }) {
  const startDate = getWalimaStartInstant(walima.date, walima.time);
  if (!startDate) return null;

  const durationHours = walima.durationHours || 3;
  const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);
  const now = new Date();

  const startUtc = toUtcIcsString(startDate);
  const endUtc = toUtcIcsString(endDate);
  const nowUtc = toUtcIcsString(now);
  const uid = `walima-${Date.now()}@ar-walima`;
  const summary = `Walima of ${groom} & ${bride}`;
  const location = [walima.venue, walima.city].filter(Boolean).join(', ');
  const description = `Join us to celebrate the Walima of ${groom} & ${bride} at ${walima.venue}, ${walima.city}.`;

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Walima Invitation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${nowUtc}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:${summary}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${description}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ];

  const icsContent = icsLines.join('\r\n') + '\r\n';
  return new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
}

export function getGoogleCalendarUrl({ bride, groom, walima }) {
  const startDate = getWalimaStartInstant(walima.date, walima.time);
  if (!startDate) return '#';

  const durationHours = walima.durationHours || 3;
  const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);

  const startUtc = toUtcIcsString(startDate);
  const endUtc = toUtcIcsString(endDate);
  const summary = `Walima of ${groom} & ${bride}`;
  const location = [walima.venue, walima.city].filter(Boolean).join(', ');
  const details = `Join us as we celebrate with food, family and prayers for our new beginning. Walima of ${groom} and ${bride}.`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: summary,
    dates: `${startUtc}/${endUtc}`,
    location,
    details
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
