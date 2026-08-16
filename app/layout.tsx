import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'App Administrasi Sekolah',
  description: 'Sistem Administrasi Sekolah & Manajemen Surat Resmi',
  icons: {
    icon: [
      { url: '/icon.svg?v=2', type: 'image/svg+xml' },
      { url: '/favicon.ico?v=2' },
    ],
    shortcut: '/icon.svg?v=2',
    apple: '/icon.svg?v=2',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/icon.svg?v=2" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico?v=2" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" />
        <link rel="apple-touch-icon" href="/icon.svg?v=2" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
