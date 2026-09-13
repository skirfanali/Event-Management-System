import { format } from 'date-fns';

export const addToGoogleCalendar = (event) => {
  const start = format(new Date(event.date), "yyyyMMdd'T'HHmmss");
  const end   = event.endDate ? format(new Date(event.endDate), "yyyyMMdd'T'HHmmss") : start;
  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.set('action', 'TEMPLATE');
  url.searchParams.set('text', event.title);
  url.searchParams.set('dates', `${start}/${end}`);
  url.searchParams.set('details', event.description || '');
  url.searchParams.set('location', event.venue || '');
  window.open(url.toString(), '_blank');
};

export const addToOutlookCalendar = (event) => {
  const url = new URL('https://outlook.live.com/calendar/0/deeplink/compose');
  url.searchParams.set('subject', event.title);
  url.searchParams.set('startdt', new Date(event.date).toISOString());
  url.searchParams.set('body', event.description || '');
  url.searchParams.set('location', event.venue || '');
  window.open(url.toString(), '_blank');
};

export const generateICSFile = (event) => {
  const start = format(new Date(event.date), "yyyyMMdd'T'HHmmss");
  const end   = event.endDate ? format(new Date(event.endDate), "yyyyMMdd'T'HHmmss") : start;
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//CampusEvents//EN',
    'BEGIN:VEVENT',
    `UID:${event.id}@campusevents`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description || ''}`,
    `LOCATION:${event.venue || ''}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = `${event.title}.ics`;
  a.click();
};
