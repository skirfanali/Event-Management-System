import { Outfit, Syne } from 'next/font/google';
import '@/styles/globals.css';
import { ThemeProvider }        from '@/context/ThemeContext';
import { AuthProvider }         from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { EventProvider }        from '@/context/EventContext';
import { PaymentProvider }      from '@/context/PaymentContext';
import { Toaster }              from 'react-hot-toast';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const syne   = Syne({ subsets: ['latin'], variable: '--font-syne' });

// ✅ FIX 1: Move themeColor out of metadata into viewport export (Next.js 15 requirement)
export const viewport = {
  themeColor: '#6366f1',
};

export const metadata = {
  title:       { default: 'CampusEvents', template: '%s | CampusEvents' },
  description: 'The modern campus event management platform',
  keywords:    ['events', 'campus', 'college', 'tickets', 'hackathon'],
  // themeColor removed from here — it belongs in viewport export
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} ${syne.variable}`}>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <EventProvider>
                <PaymentProvider>
                  {children}
                  <Toaster position="top-right" toastOptions={{
                    style:   { background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '14px' },
                    success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
                    error:   { iconTheme: { primary: '#f43f5e', secondary: '#fff' } },
                  }} />
                </PaymentProvider>
              </EventProvider>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}