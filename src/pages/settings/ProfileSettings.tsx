import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';

export const ProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const { activeWorkspace } = useWorkspace();

  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [timezone, setTimezone] = useState(activeWorkspace?.timezone || 'UTC');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Profile & Preferences</h2>
        <p className="text-xs text-slate-400">Manage your user information and timezone settings</p>
      </div>

      <Card className="max-w-2xl space-y-4">
        <form onSubmit={handleSave} className="space-y-4">
          {saved && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400">
              Profile settings updated successfully.
            </div>
          )}

          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Email Address"
            value={email}
            disabled
            helperText="Email address cannot be changed directly."
          />

          <Select
            label="Default Timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            options={[
              { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
              { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
              { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
              { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
              { value: 'Europe/London', label: 'London / GMT' },
              { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
            ]}
          />

          <div className="pt-2 flex justify-end">
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
