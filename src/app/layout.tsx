import './globals.css';
import { Raleway } from 'next/font/google';
import type { Metadata } from 'next';
const raleway = Raleway({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-raleway' });
export const metadata: Metadata = { title: 'TrustPay', description: 'Milestone-based payment protection for African freelancers and clients.' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={raleway.variable}><body>{children}</body></html>;
}
