'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tag } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { addToGoogleCalendar, addToOutlookCalendar, generateICSFile } from '@/lib/calendar';

export default function EventDetails({ event }) {
  // tags can be comma-separated string from backend or array from mock
  const tags = Array.isArray(event.tags)
    ? event.tags
    : (event.tags ? event.tags.split(',').map(t => t.trim()).filter(Boolean) : []);

  // Build event object compatible with calendar utils
  const calEvent = {
    title:       event.title,
    description: event.description,
    date:        event.eventDate || event.date,
    endDate:     event.endDate,
    venue:       event.venue,
    id:          event.id,
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="font-bold font-display text-lg mb-4" style={{ color: 'var(--text-primary)' }}>About this Event</h2>
        <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
          {event.description || 'No description provided.'}
        </p>
      </div>

      {tags.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Tag size={16} className="text-brand-500" />
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Tags</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map(t => <Badge key={t} variant="brand">#{t}</Badge>)}
          </div>
        </div>
      )}

      {event.venueAddress && (
        <div className="card">
          <h3 className="font-semibold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>Venue Details</h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{event.venueAddress}</p>
          {event.city && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{event.city}</p>}
        </div>
      )}

      <div className="card">
        <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Add to Calendar</h3>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => addToGoogleCalendar(calEvent)}>📅 Google</Button>
          <Button size="sm" variant="secondary" onClick={() => addToOutlookCalendar(calEvent)}>📆 Outlook</Button>
          <Button size="sm" variant="secondary" onClick={() => generateICSFile(calEvent)}>🍎 Apple</Button>
        </div>
      </div>
    </div>
  );
}
