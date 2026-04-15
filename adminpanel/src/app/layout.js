import './globals.css';
import { ToastProvider } from '@/components/ToastProvider';

export const metadata = {
  title: 'AngelX Admin Panel',
  description: 'AngelX USDT Exchange Admin Dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="text-gray-900 antialiased">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
