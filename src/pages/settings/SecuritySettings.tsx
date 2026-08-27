import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const SecuritySettings: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match.');
      return;
    }
    setMessage('Password changed successfully.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Security & Passwords</h2>
        <p className="text-xs text-slate-400">Update account password and security credentials</p>
      </div>

      <Card className="max-w-2xl space-y-4">
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {message && (
            <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-400">
              {message}
            </div>
          )}

          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />

          <Input
            label="New Password"
            type="password"
            placeholder="At least 8 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Repeat new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <div className="pt-2 flex justify-end">
            <Button type="submit">Update Password</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
