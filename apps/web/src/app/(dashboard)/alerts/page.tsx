'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsApi } from '@/lib/api';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const channelIcons: Record<string, string> = {
  EMAIL: '📧', TELEGRAM: '💬', WHATSAPP: '📱', PUSH: '🔔', IN_APP: '🔔'
};
const typeColors: Record<string, string> = {
  NEW_OPPORTUNITY: 'bg-blue-50 text-blue-700 border-blue-100',
  PRICE_DROP: 'bg-green-50 text-green-700 border-green-100',
  HIGH_ROI: 'bg-purple-50 text-purple-700 border-purple-100',
  STOCK_LOW: 'bg-orange-50 text-orange-700 border-orange-100',
  SYSTEM: 'bg-gray-50 text-gray-700 border-gray-100',
};

export default function AlertsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['alerts', page],
    queryFn: () => alertsApi.list({ page, limit: 20 }).then((r: any) => r.data),
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => alertsApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => alertsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('All alerts marked as read');
    },
  });

  const alerts = data?.data ?? [];
  const unread = alerts.filter((a: any) => !a.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
          <p className="text-gray-500 text-sm">{unread} unread alerts</p>
        </div>
        {unread > 0 && (
          <button onClick={() => markAllReadMutation.mutate()}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
            <CheckCheck size={16} />
            Mark all read
          </button>
        )}
      </div>

      <div className="space-y-2">
        {isLoading ? (
          [...Array(5)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)
        ) : alerts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Bell size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No alerts yet</p>
          </div>
        ) : alerts.map((alert: any) => (
          <div key={alert.id}
            className={`bg-white rounded-xl border p-4 flex items-start gap-4 transition-all ${!alert.isRead ? 'border-blue-200 shadow-sm' : 'border-gray-200 opacity-75'}`}>
            <div className={`px-2 py-1 rounded-lg border text-xs font-medium ${typeColors[alert.type] ?? 'bg-gray-50 text-gray-600 border-gray-100'}`}>
              {channelIcons[alert.channel]} {alert.type?.replace('_', ' ')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm">{alert.title}</p>
              <p className="text-gray-600 text-sm mt-0.5">{alert.message}</p>
              <p className="text-xs text-gray-400 mt-1">
                {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
              </p>
            </div>
            {!alert.isRead && (
              <button onClick={() => markReadMutation.mutate(alert.id)}
                className="shrink-0 p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <Check size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
