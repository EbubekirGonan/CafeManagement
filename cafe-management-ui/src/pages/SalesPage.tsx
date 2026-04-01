import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sessionApi } from '../api/sessions';

type DateFilter = 'today' | 'week' | 'month' | 'all';

export default function SalesPage() {
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['paid-sessions'],
    queryFn: () => sessionApi.getAll('paid').then((r) => r.data),
  });

  const filtered = useMemo(() => {
    if (!sessions) return [];
    const now = new Date();
    return sessions.filter((s) => {
      if (dateFilter === 'all') return true;
      const closed = s.closed_at ? new Date(s.closed_at) : null;
      if (!closed) return false;
      const diff = now.getTime() - closed.getTime();
      const day = 86400000;
      switch (dateFilter) {
        case 'today':
          return (
            closed.toDateString() === now.toDateString()
          );
        case 'week':
          return diff < 7 * day;
        case 'month':
          return diff < 30 * day;
        default:
          return true;
      }
    });
  }, [sessions, dateFilter]);

  const totalRevenue = filtered.reduce((sum, s) => sum + Number(s.total_price ?? 0), 0);

  const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filterButtons: { key: DateFilter; label: string }[] = [
    { key: 'today', label: 'Bugün' },
    { key: 'week', label: 'Bu Hafta' },
    { key: 'month', label: 'Bu Ay' },
    { key: 'all', label: 'Tümü' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Satışlar</h1>

      {/* Filter buttons */}
      <div className="flex gap-2 mb-6">
        {filterButtons.map((f) => (
          <button
            key={f.key}
            onClick={() => setDateFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              dateFilter === f.key
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
        <span className="font-medium text-green-700">Toplam Gelir</span>
        <span className="text-2xl font-bold text-green-800">
          {totalRevenue.toFixed(2)} ₺
        </span>
      </div>

      {/* Table */}
      {isLoading ? (
        <p className="text-gray-500">Yükleniyor...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">Bu dönemde satış bulunamadı.</p>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Bölüm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Masa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Açılış Saati
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Kapanış Saati
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Toplam Tutar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((session, idx) => (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {idx + 1}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {session.table?.section?.name ?? '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {session.table?.name ?? '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {formatDate(session.opened_at)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {formatDate(session.closed_at)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-semibold text-right">
                    {Number(session.total_price ?? 0).toFixed(2)} ₺
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
