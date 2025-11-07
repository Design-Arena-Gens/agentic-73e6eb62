import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cricket Scores Board',
  description: 'Live cricket match scoreboards',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
