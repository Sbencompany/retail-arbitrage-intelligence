'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { Settings, Bell, MapPin, DollarSign } from 'lucide-react';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: () => usersApi.settings().then((r: any) => r.data),
  });

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (settingsData) reset(settingsData);
  }, [settingsData, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => usersApi.updateSettings(data),
    onSuccess: () => {
      toast.success('Settings saved!');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: () => toast.error('Failed to save settings'),
  });

  const onSubmit = (data: any) => updateMutation.mutate(data);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm">Configure your arbitrage preferences</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Thresholds */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign size={18} className="text-blue-600" />
            <h2 className="font-semibold text-gray-900">Profitability Thresholds</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Minimum ROI (%)</label>
              <input type="number" {...register('minRoi')} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Minimum Profit ($)</label>
              <input type="number" {...register('minProfit')} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Max Budget ($)</label>
              <input type="number" {...register('maxBudget')} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Search Radius (miles)</label>
              <input type="number" {...register('searchRadiusMiles')} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={18} className="text-blue-600" />
            <h2 className="font-semibold text-gray-900">Alert Channels</h2>
          </div>
          <div className="space-y-3">
            {[
              { key: 'alertEmail', label: 'Email notifications' },
              { key: 'alertTelegram', label: 'Telegram notifications' },
              { key: 'alertWhatsapp', label: 'WhatsApp notifications' },
              { key: 'alertPush', label: 'Push notifications' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{label}</span>
                <input type="checkbox" {...register(key)} className="w-4 h-4 accent-blue-600" />
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Telegram Chat ID</label>
              <input type="text" {...register('telegramChatId')} placeholder="e.g. 123456789" className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={18} className="text-blue-600" />
            <h2 className="font-semibold text-gray-900">Location</h2>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Home ZIP Code</label>
            <input type="text" {...register('homeZipCode')} placeholder="e.g. 10001" className="w-full px-3 py-2 border rounded-lg text-sm" maxLength={10} />
          </div>
        </div>

        <button type="submit" disabled={updateMutation.isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors">
          {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
