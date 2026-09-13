// Static content only — all event/user/ticket data comes from the backend API

export const TESTIMONIALS = [
  {
    id: 1,
    name: 'Priya Sharma',
    role: 'Event Organizer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
    text: 'CampusEvents transformed how we manage events. The QR ticketing system is seamless and the analytics dashboard gives incredible insights!',
    rating: 5,
  },
  {
    id: 2,
    name: 'Rahul Verma',
    role: 'Student',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rahul',
    text: 'I never miss a campus event now. The app notifications keep me updated and registering for events takes just 30 seconds!',
    rating: 5,
  },
  {
    id: 3,
    name: 'Dr. Anita Roy',
    role: 'Faculty Coordinator',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anita',
    text: 'The attendance tracking via QR scan has eliminated manual registers. Real-time data helps us make better decisions.',
    rating: 5,
  },
];

export const FAQS = [
  { q: 'How do I register for an event?',       a: 'Browse events, click on any event, and hit the Register button. You\'ll receive a QR ticket via email instantly.' },
  { q: 'Can I get a refund for paid events?',   a: 'Refunds are available up to 48 hours before the event. Contact the organizer through the event page.' },
  { q: 'How does QR attendance work?',          a: 'Show your QR ticket at the venue. Organizers scan it using our app to mark your attendance automatically.' },
  { q: 'Can I create events as a student?',     a: 'Yes! Register as an Organizer and you can create and manage your own events after admin approval.' },
  { q: 'Is there a limit on event registrations?', a: 'Each event has a capacity set by the organizer. Once full, you can join the waitlist.' },
];
