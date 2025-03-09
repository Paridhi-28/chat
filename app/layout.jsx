import './globals.css';
import { Inter } from 'next/font/google';
// using clerk for user auth
import { ClerkProvider } from '@clerk/nextjs';
const inter = Inter({ subsets: ['latin'] });
export const metadata = {
    title: 'vAI',
    description: 'AI ChatBot',
};
export default function RootLayout({ children, }) {
    return (<ClerkProvider>
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
    </ClerkProvider>);
}
