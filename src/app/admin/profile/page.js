"use client";
import { useEffect, useState } from 'react';
import styles from '../admin.module.css';
import { useToast } from '@/app/components/ToastProvider';
import { useRouter } from 'next/navigation';

export default function AdminProfilePage() {
  const { showToast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/profile');
      if (res.status === 401) return router.replace('/admin/login');
      // If the route doesn't exist yet, we might get 404, handle gracefully
      if (res.status === 404) {
         // Mock data if API not ready
         setEmail('admin@angelx.com');
         setLoading(false);
         return;
      }
      const data = await res.json();
      if (data.admin) setEmail(data.admin.email);
    } catch (err) {
      console.error(err);
      // showToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentPassword) return showToast('Current password is required', 'error');
    setSaving(true);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword: newPassword || undefined, newEmail: email || undefined }),
      });
      
      if (res.status === 404) {
        showToast('Profile API not implemented yet', 'info');
        setSaving(false);
        return;
      }

      const data = await res.json();
      if (res.ok) {
        showToast('Profile updated ✅', 'success');
        setCurrentPassword('');
        setNewPassword('');
        if (data.emailChanged) {
          showToast('Email changed — please login again', 'info');
          setTimeout(() => router.replace('/admin/login'), 1500);
        }
      } else {
        showToast(data.error || 'Failed to update profile', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Server error', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.loadingState}><i className="fas fa-spinner fa-spin"></i> Loading profile...</div>;

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>My Profile</h1>
          <p className={styles.pageSubtitle}>Manage your admin account details</p>
        </div>
      </div>

      <div className={styles.sectionCard} style={{ maxWidth: '600px' }}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Account Information</h3>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Email Address</label>
          <div className={styles.inputGroup}>
            <span className={styles.inputIcon}><i className="fas fa-envelope"></i></span>
            <input 
              type="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className={styles.formInput}
              placeholder="admin@angelxsuper.com"
            />
          </div>
          <p className={styles.formHint}>Your admin email for login and notifications</p>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Current Password</label>
          <div className={styles.inputGroup}>
            <span className={styles.inputIcon}><i className="fas fa-lock"></i></span>
            <input 
              type="password" 
              value={currentPassword} 
              onChange={(e) => setCurrentPassword(e.target.value)} 
              className={styles.formInput}
              placeholder="Enter your current password"
            />
          </div>
          <p className={styles.formHint}>Required to make any changes</p>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>New Password (Optional)</label>
          <div className={styles.inputGroup}>
            <span className={styles.inputIcon}><i className="fas fa-key"></i></span>
            <input 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              className={styles.formInput}
              placeholder="Leave blank to keep current password"
            />
          </div>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            className={styles.btnPrimary} 
            onClick={handleSave} 
            disabled={saving}
          >
            {saving ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : <><i className="fas fa-save"></i> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}