import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { sessionApi } from '../api/sessions';
import { orderItemApi } from '../api/order-items';
import type { TableSeat } from '../types';
import OrderModal from './OrderModal';
import ConfirmDialog from './ConfirmDialog';

interface Props {
  table: TableSeat;
  onClose: (interactedTableId?: string) => void;
}

export default function TableDetailModal({ table, onClose }: Props) {
  const queryClient = useQueryClient();
  const [showOrder, setShowOrder] = useState(false);
  const [closing, setClosing] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ['active-session', table.id],
    queryFn: () => sessionApi.getActiveByTable(table.id).then((r) => r.data),
  });

  const hasSession = !!session;

  const { data: items } = useQuery({
    queryKey: ['session-items', session?.id],
    queryFn: () => orderItemApi.getBySession(session!.id).then((r) => r.data),
    enabled: hasSession,
  });

  const handleCloseSession = async () => {
    if (!session) return;
    setClosing(true);
    try {
      await sessionApi.close(session.id);
      toast.success('Hesap kapatıldı');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['table-seats'] }),
        queryClient.invalidateQueries({ queryKey: ['open-sessions'] }),
        queryClient.invalidateQueries({ queryKey: ['active-session', table.id] }),
        queryClient.invalidateQueries({ queryKey: ['paid-sessions'] }),
      ]);
      onClose(table.id);
    } catch {
      toast.error('Hesap kapatılırken hata oluştu');
    } finally {
      setClosing(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await orderItemApi.delete(itemId);
      toast.success('Ürün silindi');
      await queryClient.invalidateQueries({ queryKey: ['session-items', session?.id] });
    } catch {
      toast.error('Ürün silinirken hata oluştu');
    }
  };

  if (showOrder) {
    return (
      <OrderModal
        tableId={table.id}
        tableName={table.name}
        sessionId={session?.id}
        onClose={() => setShowOrder(false)}
        onDone={() => onClose(table.id)}
      />
    );
  }

  const total = items?.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0) ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">{table.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {sessionLoading ? (
            <p className="text-gray-400 text-sm text-center py-8">Yükleniyor...</p>
          ) : hasSession && items ? (
            <>
              <div className="space-y-2 mb-4">
                {items.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">
                    Henüz sipariş yok
                  </p>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {item.product?.name ?? 'Ürün'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} x {Number(item.price).toFixed(2)} ₺
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-800">
                          {(item.quantity * Number(item.price)).toFixed(2)} ₺
                        </span>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg mb-4">
                <span className="font-semibold text-gray-700">Toplam</span>
                <span className="text-xl font-bold text-blue-700">
                  {total.toFixed(2)} ₺
                </span>
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Masa şu anda boş. Sipariş ekleyerek masayı açabilirsiniz.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t">
          <button
            onClick={() => setShowOrder(true)}
            className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            Sipariş Ekle
          </button>
          {hasSession && (
            <button
              onClick={() => setShowCloseConfirm(true)}
              disabled={closing}
              className="flex-1 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {closing ? 'Kapatılıyor...' : 'Hesabı Kapat'}
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showCloseConfirm}
        title="Hesabı Kapat"
        message="Hesabı kapatmak istediğinizden emin misiniz?"
        confirmText="Evet, Kapat"        confirmButtonVariant="success"        onConfirm={() => { setShowCloseConfirm(false); handleCloseSession(); }}
        onCancel={() => setShowCloseConfirm(false)}
      />
    </div>
  );
}
