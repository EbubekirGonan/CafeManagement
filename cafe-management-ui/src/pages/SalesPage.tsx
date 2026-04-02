import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sessionApi } from '../api/sessions';
import { orderItemApi } from '../api/order-items';
import type { Session } from '../types';

function SessionDetailModal({ session, onClose }: { session: Session; onClose: () => void }) {
  const { data: items, isLoading } = useQuery({
    queryKey: ['session-items', session.id],
    queryFn: () => orderItemApi.getBySession(session.id).then((r) => r.data),
  });

  const total = items?.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0) ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {session.table?.name ?? 'Masa'} — Sipariş Detayı
            </h2>
            {session.table?.section?.name && (
              <p className="text-sm text-gray-400">{session.table.section.name}</p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <svg className="animate-spin w-6 h-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : !items || items.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">Sipariş bulunamadı</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ürün</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Birim</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Adet</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Toplam</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-3 text-sm text-gray-800">{item.product?.name ?? '—'}</td>
                    <td className="px-6 py-3 text-sm text-gray-600 text-right">{Number(item.price).toFixed(2)} ₺</td>
                    <td className="px-6 py-3 text-sm text-gray-600 text-right">{item.quantity}</td>
                    <td className="px-6 py-3 text-sm font-semibold text-gray-800 text-right">{(item.quantity * Number(item.price)).toFixed(2)} ₺</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!isLoading && items && items.length > 0 && (
          <div className="border-t px-6 py-4 flex justify-between items-center bg-gray-50 rounded-b-2xl">
            <span className="font-semibold text-gray-700">Genel Toplam</span>
            <span className="text-xl font-bold text-blue-700">{total.toFixed(2)} ₺</span>
          </div>
        )}
      </div>
    </div>
  );
}

type DateFilter = 'today' | 'week' | 'month' | 'all';

export default function SalesPage() {
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [detailSession, setDetailSession] = useState<Session | null>(null);

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
                <th className="px-6 py-3"></th>
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
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => setDetailSession(session)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title="Detay"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detailSession && (
        <SessionDetailModal
          session={detailSession}
          onClose={() => setDetailSession(null)}
        />
      )}
    </div>
  );
}
