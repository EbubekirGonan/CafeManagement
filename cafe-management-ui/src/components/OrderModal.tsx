import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { categoryApi } from '../api/categories';
import { productApi } from '../api/products';
import { sessionApi } from '../api/sessions';
import { orderItemApi } from '../api/order-items';
import type { Product } from '../types';

interface BasketItem {
  product: Product;
  quantity: number;
}

interface Props {
  tableId: string;
  tableName: string;
  sessionId?: string;
  onClose: () => void;
  onDone: () => void;
}

export default function OrderModal({ tableId, tableName, sessionId, onClose, onDone }: Props) {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll().then((r) => r.data),
  });

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => productApi.getAll().then((r) => r.data),
  });

  const filteredProducts = selectedCategory
    ? products?.filter((p) => p.category_id === selectedCategory)
    : products;

  const addToBasket = (product: Product) => {
    setBasket((prev) => {
      const existing = prev.find((b) => b.product.id === product.id);
      if (existing) {
        return prev.map((b) =>
          b.product.id === product.id ? { ...b, quantity: b.quantity + 1 } : b,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromBasket = (productId: string) => {
    setBasket((prev) => {
      const existing = prev.find((b) => b.product.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map((b) =>
          b.product.id === productId ? { ...b, quantity: b.quantity - 1 } : b,
        );
      }
      return prev.filter((b) => b.product.id !== productId);
    });
  };

  const deleteFromBasket = (productId: string) => {
    setBasket((prev) => prev.filter((b) => b.product.id !== productId));
  };

  const total = basket.reduce((sum, b) => sum + Number(b.product.price) * b.quantity, 0);

  const handleSubmit = async () => {
    if (basket.length === 0) return;
    setSubmitting(true);
    try {
      let sid = sessionId;
      if (!sid) {
        const res = await sessionApi.create({ table_id: tableId });
        sid = res.data.id;
      }
      await Promise.all(
        basket.map((item) =>
          orderItemApi.create({
            session_id: sid!,
            product_id: item.product.id,
            quantity: item.quantity,
            price: Number(item.product.price),
          }),
        ),
      );
      toast.success('Sipariş eklendi');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['table-seats'] }),
        queryClient.invalidateQueries({ queryKey: ['open-sessions'] }),
        queryClient.invalidateQueries({ queryKey: ['active-session', tableId] }),
        queryClient.invalidateQueries({ queryKey: ['session-items'] }),
      ]);
      onDone();
    } catch {
      toast.error('Sipariş eklenirken hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            {tableName} — Sipariş Ekle
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left — Products */}
          <div className="flex-1 flex flex-col overflow-hidden border-r">
            {/* Category filter */}
            <div className="flex gap-2 px-4 py-3 overflow-x-auto border-b bg-gray-50">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  !selectedCategory
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border'
                }`}
              >
                Tümü
              </button>
              {categories?.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Product grid */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredProducts?.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToBasket(product)}
                    className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors text-center"
                  >
                    <span className="font-medium text-gray-800 text-sm">
                      {product.name}
                    </span>
                    <span className="text-blue-600 font-semibold mt-1">
                      {Number(product.price).toFixed(2)} ₺
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Basket */}
          <div className="w-72 flex flex-col bg-gray-50">
            <div className="px-4 py-3 border-b bg-gray-100">
              <h3 className="font-semibold text-gray-700 text-sm">Sepet</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {basket.length === 0 ? (
                <p className="text-gray-400 text-sm text-center mt-8">
                  Sepet boş
                </p>
              ) : (
                basket.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-2 bg-white rounded-lg p-2 border"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {Number(item.product.price).toFixed(2)} ₺
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => removeFromBasket(item.product.id)}
                        className="w-6 h-6 rounded bg-gray-200 text-gray-600 hover:bg-gray-300 flex items-center justify-center text-sm font-bold"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => addToBasket(item.product)}
                        className="w-6 h-6 rounded bg-gray-200 text-gray-600 hover:bg-gray-300 flex items-center justify-center text-sm font-bold"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => deleteFromBasket(item.product.id)}
                      className="text-red-400 hover:text-red-600 ml-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="border-t p-4">
              <div className="flex justify-between mb-3">
                <span className="font-semibold text-gray-700">Toplam</span>
                <span className="font-bold text-gray-900">
                  {total.toFixed(2)} ₺
                </span>
              </div>
              <button
                onClick={handleSubmit}
                disabled={basket.length === 0 || submitting}
                className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Gönderiliyor...' : 'Siparişi Tamamla'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
