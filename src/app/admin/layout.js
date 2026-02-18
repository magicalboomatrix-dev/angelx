'use client';
// Admin layout: no footer, independent from main layout
import styles from './admin.module.css';
import { ToastProvider } from '@/app/components/ToastProvider';
import { ConfirmProvider } from '@/app/components/ConfirmProvider';

export default function AdminLayout({ children }) {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <div className={`${styles.adminLayout} min-h-screen`}>{children}</div>
      </ConfirmProvider>
    </ToastProvider>
  );
}
