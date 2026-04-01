import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sectionApi } from '../../api/sections';
import toast from 'react-hot-toast';

export default function SectionsPage() {
  const queryClient = useQueryClient();
  const { data: sections, isLoading } = useQuery({
    queryKey: ['sections'],
    queryFn: () => sectionApi.getAll().then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sectionApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      toast.success('Bölüm silindi');
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string }) => sectionApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      toast.success('Bölüm eklendi');
    },
  });

  const [name, setName] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ name });
    setName('');
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">İşletme Bölümleri</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Yeni Bölüm Ekle</h2>
        <div className="flex gap-4">
          <input placeholder="Bölüm Adı" required value={name} onChange={(e) => setName(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-800" />
          <button type="submit" disabled={createMutation.isPending} className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50">Ekle</button>
        </div>
      </form>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Ad</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={2} className="px-4 py-8 text-center text-gray-500">Yükleniyor...</td></tr>
            ) : sections?.length === 0 ? (
              <tr><td colSpan={2} className="px-4 py-8 text-center text-gray-500">Kayıt bulunamadı.</td></tr>
            ) : (
              sections?.map((sec) => (
                <tr key={sec.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-800">{sec.name}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => deleteMutation.mutate(sec.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Sil</button>
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
