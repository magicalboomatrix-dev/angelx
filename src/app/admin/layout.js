
import { ConfirmProvider } from '@/app/components/ConfirmProvider';
import { ToastProvider } from '@/app/components/ToastProvider';

import AdminShell from './components/AdminShell';

export default function AdminLayout({ children }) {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <div className="admin-app">
          <AdminShell>{children}</AdminShell>
        </div>
      </ConfirmProvider>
    </ToastProvider>
  );
}