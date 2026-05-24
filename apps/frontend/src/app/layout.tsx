import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'vedaai assessment',
  description: 'Frontend for the vedaai assessment monorepo'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}