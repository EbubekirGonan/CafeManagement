import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi, type CreateUserPayload } from '../../api/users';
import { businessApi } from '../../api/businesses';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../components/ConfirmDialog';
import type { User } from '../../types';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'waiter', label: 'Garson' },
];

interface EditingState {
  name: string;
  email: string;
  password: string;
  role: string;
  businessId: string;
}

export default function UsersPage() {
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => userApi.getAll().then((r) => r.data),
  });

  const { data: businesses } = useQuery({
    queryKey: ['admin-businesses'],
    queryFn: () => businessApi.getAll().then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateUserPayload) => userApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Kullanıcı eklendi');
      setForm({ name: '', email: '', password: '', role: 'admin', businessId: '' });
    },
    onError: () => toast.error('Kullanıcı eklenemedi'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EditingState }) =>
      userApi.update(id, {
        name: data.name,
        email: data.email,
        role: data.role,
        businessId: data.businessId,
        ...(data.password ? { password: data.password } : {}),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Kullanıcı güncellendi');
      setEditingId(null);
    },
    onError: () => toast.error('Kullanıcı güncellenemedi'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Kullanıcı silindi');
      setConfirmId(null);
    },
    onError: () => toast.error('Kullanıcı silinemedi'),
  });

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'admin', businessId: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditingState>({ name: '', email: '', password: '', role: 'admin', businessId: '' });
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.businessId) return toast.error('İşletme seçiniz');
    createMutation.mutate(form as CreateUserPayload);
  };

  const startEdit = (user: User) => {
    setEditingId(user.id);
    setEditing({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      businessId: user.business_id,
    });
  };

  const cancelEdit = () => setEditingId(null);

  const inputClass = 'px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-800';
  const inlineInputClass = 'px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 w-full';

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Kullanıcılar</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Yeni Kullanıcı Ekle</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            placeholder="Ad Soyad"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
          />
          <input
            type="email"
            placeholder="E-posta"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputClass}
          />
          <input
            type="password"
            placeholder="Şifre"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className={inputClass}
          />
          <select
            required
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className={inputClass}
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <select
            required
            value={form.businessId}
            onChange={(e) => setForm({ ...form, businessId: e.target.value })}
            className={`${inputClass} col-span-2`}
          >
            <option value="">İşletme Seç</option>
            {businesses?.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          Ekle
        </button>
      </form>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Ad</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">E-posta</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Yeni Şifre</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Rol</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">İşletme</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">Yükleniyor...</td>
              </tr>
            ) : users?.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">Kayıt bulunamadı.</td>
              </tr>
            ) : (
              users?.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-800">
                    {editingId === user.id ? (
                      <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={inlineInputClass} />
                    ) : (
                      user.name
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-800">
                    {editingId === user.id ? (
                      <input type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} className={inlineInputClass} />
                    ) : (
                      user.email
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-800">
                    {editingId === user.id ? (
                      <input type="password" placeholder="Değiştirmek için doldurun" value={editing.password} onChange={(e) => setEditing({ ...editing, password: e.target.value })} className={inlineInputClass} />
                    ) : (
                      <span className="text-gray-400 text-xs">••••••</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-800">
                    {editingId === user.id ? (
                      <select value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })} className={inlineInputClass}>
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="capitalize">{user.role}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-800">
                    {editingId === user.id ? (
                      <select value={editing.businessId} onChange={(e) => setEditing({ ...editing, businessId: e.target.value })} className={inlineInputClass}>
                        <option value="">İşletme Seç</option>
                        {businesses?.map((b) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    ) : (
                      (user as any).business?.name ?? '-'
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {editingId === user.id ? (
                        <>
                          <button
                            onClick={() => updateMutation.mutate({ id: user.id, data: editing })}
                            disabled={updateMutation.isPending}
                            className="text-green-600 hover:text-green-800 text-sm font-medium disabled:opacity-50"
                          >
                            Kaydet
                          </button>
                          <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700 text-sm font-medium">İptal</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(user)} className="text-blue-500 hover:text-blue-700 text-sm font-medium">Düzenle</button>
                          <button onClick={() => setConfirmId(user.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Sil</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={!!confirmId}
        title="Kullanıcıyı Sil"
        message="Bu kullanıcıyı silmek istediğinize emin misiniz?"
        confirmText="Sil"
        confirmButtonVariant="danger"
        onConfirm={() => confirmId && deleteMutation.mutate(confirmId)}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
