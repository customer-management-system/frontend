import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { formatCurrency } from '@/lib/currency';

interface AuditLog {
  id: number;
  entityType: string;
  entityId: number;
  action: string;
  user?: { id: number; username: string } | null;
  createdAt: string;
}

export default function AuditTrailPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/audit-logs', { params: { limit: 50, page: 1 } });
        const data = res.data?.data ?? res.data;
        if (!cancelled) {
          setLogs(data.logs ?? data.items ?? []);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'فشل تحميل سجل التدقيق');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <div className="p-6 text-muted-foreground">جاري التحميل...</div>;
  }

  if (error) {
    return <div className="p-6 text-destructive">{error}</div>;
  }

  return (
    <div className="p-6 space-y-4" dir="rtl">
      <h1 className="text-2xl font-bold">سجل التدقيق</h1>
      <p className="text-sm text-muted-foreground">
        آخر {logs.length} عملية مالية وحساسة في النظام.
      </p>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-right">التاريخ</th>
              <th className="p-3 text-right">الإجراء</th>
              <th className="p-3 text-right">الكيان</th>
              <th className="p-3 text-right">المستخدم</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t">
                <td className="p-3">{new Date(log.createdAt).toLocaleString('ar-EG')}</td>
                <td className="p-3">{log.action}</td>
                <td className="p-3">
                  {log.entityType} #{log.entityId}
                </td>
                <td className="p-3">{log.user?.username ?? '—'}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-muted-foreground">
                  لا توجد سجلات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        عرض مالي تجريبي: {formatCurrency(0)}
      </p>
    </div>
  );
}
