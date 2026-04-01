import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../../api/products';
import { categoryApi } from '../../api/categories';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productApi.getAll().then((r) => r.data),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll().then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Ürün silindi');
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; price: number; category_id: string }) => productApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Ürün eklendi');
    },
  });

  const [form, setForm] = useState({
    name: '',
    price: '',
    category_id: '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ ...form, price: Number(form.price) });
    setForm({ name: '', price: '', category_id: '' });
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Ürünler</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Yeni Ürün Ekle</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input placeholder="Ürün Adı" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-800" />
          <input placeholder="Fiyat" type="number" step="any" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-800" />
          <select required value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-800">
            <option value="">Kategori Seçin</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={createMutation.isPending} className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50">Ekle</button>
      </form>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Ad</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Fiyat</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Kategori</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Yükleniyor...</td></tr>
            ) : products?.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Kayıt bulunamadı.</td></tr>
            ) : (
              products?.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-800">{p.name}</td>
                  <td className="px-4 py-3 text-gray-600">₺{p.price}</td>
                  <td className="px-4 py-3 text-gray-600">{categories?.find((c) => c.id === p.category_id)?.name ?? p.category_id}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => deleteMutation.mutate(p.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Sil</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
