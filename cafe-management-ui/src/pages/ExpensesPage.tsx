import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseApi } from '../api/expenses';
import { expenseCategoryApi } from '../api/expense-categories';
import toast from 'react-hot-toast';
import type { Expense } from '../types';

export default function ExpensesPage() {
  const queryClient = useQueryClient();
  const { data: expenses, isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => expenseApi.getAll().then((r) => r.data),
  });

  const { data: expenseCategories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: () => expenseCategoryApi.getAll().then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => expenseApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Gider silindi');
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<Expense, 'id'>) => expenseApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Gider eklendi');
    },
  });

  const [form, setForm] = useState({
    name: '',
    expenseCategoryId: '',
    unit: '',
    quantity: '',
    amount: '',
    date: '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...form,
      quantity: Number(form.quantity),
      amount: Number(form.amount),
    });
    setForm({ name: '', expenseCategoryId: '', unit: '', quantity: '', amount: '', date: '' });
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Giderler</h1>

      {/* Add form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Yeni Gider Ekle</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
          <input placeholder="Ad" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-800" />
          <select
            required
            disabled={categoriesLoading}
            value={form.expenseCategoryId}
            onChange={(e) => setForm({ ...form, expenseCategoryId: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 disabled:opacity-50"
          >
            <option value="">Gider Kategorisi Seçin</option>
            {expenseCategories?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input placeholder="Birim" required value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-800" />
          <input placeholder="Miktar" type="number" step="any" required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-800" />
          <input placeholder="Tutar" type="number" step="any" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-800" />
          <input placeholder="Tarih" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-800" />
        </div>
        <button type="submit" disabled={createMutation.isPending} className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50">
          Ekle
        </button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Ad</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Kategori</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Miktar</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Tutar</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Tarih</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Yükleniyor...</td></tr>
            ) : expenses?.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Kayıt bulunamadı.</td></tr>
            ) : (
              expenses?.map((exp) => (
                <tr key={exp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-800">{exp.name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {expenseCategories?.find((c) => c.id === exp.expenseCategoryId)?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{exp.quantity} {exp.unit}</td>
                  <td className="px-4 py-3 text-gray-600">₺{exp.amount}</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(exp.date).toLocaleDateString('tr-TR')}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => deleteMutation.mutate(exp.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Sil</button>
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
