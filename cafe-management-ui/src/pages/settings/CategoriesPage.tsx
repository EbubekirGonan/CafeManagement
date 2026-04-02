import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryApi } from '../../api/categories';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll().then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Kategori silindi');
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string }) => categoryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Kategori eklendi');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => categoryApi.update(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Kategori güncellendi');
      setEditingId(null);
    },
  });

  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ name });
    setName('');
  };

  const startEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const cancelEdit = () => setEditingId(null);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Ürün Kategorileri</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Yeni Kategori Ekle</h2>
        <div className="flex gap-4">
          <input placeholder="Kategori Adı" required value={name} onChange={(e) => setName(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-800" />
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
            ) : categories?.length === 0 ? (
              <tr><td colSpan={2} className="px-4 py-8 text-center text-gray-500">Kayıt bulunamadı.</td></tr>
            ) : (
              categories?.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-800">
                    {editingId === cat.id ? (
                      <input
                        autoFocus
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 w-full max-w-xs"
                      />
                    ) : (
                      cat.name
                    )}
                  </td>
                  <td className="px-4 py-3 text-right flex items-center justify-end gap-3">
                    {editingId === cat.id ? (
                      <>
                        <button
                          onClick={() => updateMutation.mutate({ id: cat.id, name: editingName })}
                          disabled={updateMutation.isPending}
                          className="text-green-600 hover:text-green-800 text-sm font-medium disabled:opacity-50"
                        >
                          Kaydet
                        </button>
                        <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700 text-sm font-medium">İptal</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(cat.id, cat.name)} className="text-blue-500 hover:text-blue-700 text-sm font-medium">Düzenle</button>
                        <button
                          onClick={() => setConfirmId(cat.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          Sil
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={confirmId !== null}
        title="Kaydı Sil"
        message="Bu kaydı silmek istediğinizden emin misiniz?"
        onConfirm={() => { if (confirmId) deleteMutation.mutate(confirmId); setConfirmId(null); }}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
