import { useState } from 'react'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select } from '../components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Dialog, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../components/ui/dialog'
import { Badge } from '../components/ui/badge'
import { useMasterData } from '../context/MasterDataContext'
import { useAuth } from '../context/AuthContext'
import { updateUserProfile, toggleUserActive, deleteUser } from '../services/userService'
import { supabase } from '../lib/supabase'
import { Plus, Power, Search, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'

const roleLabels = {
  admin:   'Admin',
  staff:   'Staff',
  finance: 'Finance',
  viewer:  'Viewer',
  head:    'Kepala BU',
  bod:     'BOD / Manajemen',
}
const roleColors = {
  admin:   'bg-purple-100 text-purple-700',
  staff:   'bg-blue-100 text-blue-700',
  finance: 'bg-green-100 text-green-700',
  viewer:  'bg-gray-100 text-gray-700',
  head:    'bg-orange-100 text-orange-700',
  bod:     'bg-rose-100 text-rose-700',
}

const EMPTY_FORM = { full_name: '', email: '', password: '', role: 'staff', department_id: '', company_id: '', business_unit_id: '' }

export default function ManajemenUser() {
  const { users, departments, companies, businessUnits, reload } = useMasterData()
  const { currentUser } = useAuth()
  const isAdmin = currentUser?.role === 'admin'
  const [search, setSearch]       = useState('')
  const [modal, setModal]         = useState(null)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [editId, setEditId]       = useState(null)
  const [saving, setSaving]       = useState(false)
  const [showPass, setShowPass]   = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting]   = useState(false)

  const filtered = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setEditId(null)
    setShowPass(false)
    setModal('form')
  }

  const openEdit = (u) => {
    setForm({ full_name: u.full_name, email: u.email, password: '', role: u.role, department_id: u.department_id || '', company_id: u.company_id || '', business_unit_id: u.business_unit_id || '' })
    setEditId(u.id)
    setShowPass(false)
    setModal('form')
  }

  const handleSave = async () => {
    if (!form.full_name || !form.email) return alert('Nama dan email wajib diisi')

    setSaving(true)
    try {
      if (editId) {
        // Edit: update profil saja (password tidak diubah di sini)
        await updateUserProfile(editId, {
          full_name:        form.full_name,
          role:             form.role,
          department_id:    form.department_id    || null,
          company_id:       form.company_id       || null,
          business_unit_id: form.business_unit_id || null,
        })
        await reload()
        setModal(null)
      } else {
        // Tambah user baru via Edge Function
        if (!form.password) return alert('Password wajib diisi untuk user baru')
        if (form.password.length < 6) return alert('Password minimal 6 karakter')

        const { data: { session } } = await supabase.auth.getSession()
        const res = await fetch(
          'https://mgxdvnnvruoyhnzgrtur.supabase.co/functions/v1/create-user',
          {
            method: 'POST',
            headers: {
              'Content-Type':  'application/json',
              'Authorization': `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({
              email:            form.email,
              password:         form.password,
              full_name:        form.full_name,
              role:             form.role,
              department_id:    form.department_id    || null,
              company_id:       form.company_id       || null,
              business_unit_id: form.business_unit_id || null,
            }),
          }
        )

        const result = await res.json()
        if (!res.ok) throw new Error(result.error || 'Gagal membuat user')

        await reload()
        setModal(null)
        alert(`Akun berhasil dibuat!\nEmail: ${form.email}\nPassword: ${form.password}`)
      }
    } catch (err) {
      alert('Gagal menyimpan: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (u) => {
    try {
      await toggleUserActive(u.id, !u.is_active)
      await reload()
    } catch (err) {
      alert('Gagal: ' + err.message)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteUser(deleteTarget.id)
      await reload()
      setDeleteTarget(null)
    } catch (err) {
      alert('Gagal menghapus: ' + err.message)
    } finally {
      setDeleting(false)
    }
  }

  const getDeptName = (id) => departments.find(d => d.id === id)?.name || '—'
  const getCompany  = (id) => companies.find(c => c.id === id)?.code   || '—'

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen User</h1>
          <p className="text-sm text-gray-500">{users.length} akun pengguna</p>
        </div>
        {isAdmin && <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" /> Tambah User</Button>}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari nama atau email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Departemen</TableHead>
              <TableHead>Perusahaan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-gray-400">
                  Tidak ada user ditemukan
                </TableCell>
              </TableRow>
            ) : filtered.map(u => (
              <TableRow key={u.id} className={!u.is_active ? 'opacity-50' : ''}>
                <TableCell className="pl-4 font-medium">{u.full_name}</TableCell>
                <TableCell className="text-sm text-gray-600">{u.email}</TableCell>
                <TableCell>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleColors[u.role]}`}>
                    {roleLabels[u.role]}
                  </span>
                </TableCell>
                <TableCell className="text-sm">{getDeptName(u.department_id)}</TableCell>
                <TableCell className="text-sm">{getCompany(u.company_id)}</TableCell>
                <TableCell>
                  <Badge variant={u.is_active ? 'paid' : 'draft'}>
                    {u.is_active ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {isAdmin ? (
                    <div className="flex justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700" onClick={() => openEdit(u)} title="Edit user">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 ${u.is_active ? 'text-amber-500 hover:text-amber-600' : 'text-green-500 hover:text-green-700'}`}
                        onClick={() => handleToggleActive(u)}
                        title={u.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700"
                        onClick={() => setDeleteTarget(u)}
                        title="Hapus user permanen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-center text-xs text-gray-400">—</p>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Modal Tambah / Edit User */}
      <Dialog open={modal === 'form'} onClose={() => setModal(null)} className="max-w-lg">
        <DialogClose onClose={() => setModal(null)} />
        <DialogHeader>
          <DialogTitle>{editId ? 'Edit Akun User' : 'Tambah Akun User Baru'}</DialogTitle>
          {!editId && (
            <p className="text-sm text-gray-500 mt-1">
              Akun akan langsung aktif. Sampaikan email dan password kepada user yang bersangkutan.
            </p>
          )}
        </DialogHeader>

        <div className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Nama Lengkap *</Label>
              <Input
                value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                placeholder="Nama lengkap"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="email@barokahperkasagroup.com"
                disabled={!!editId}
              />
            </div>
          </div>

          {/* Password — hanya untuk user baru */}
          {!editId && (
            <div className="space-y-1.5">
              <Label>Password * <span className="text-gray-400 font-normal">(min. 6 karakter)</span></Label>
              <div className="relative">
                <Input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Buat password untuk user ini"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Role *</Label>
              <Select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="admin">Admin Sistem</option>
                <option value="staff">Staff / Pengaju</option>
                <option value="finance">Finance</option>
                <option value="head">Kepala Bisnis Unit</option>
                <option value="bod">BOD / Manajemen</option>
                <option value="viewer">Viewer</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Perusahaan</Label>
              <Select value={form.company_id} onChange={e => setForm(f => ({ ...f, company_id: e.target.value }))}>
                <option value="">— Tidak ada —</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
              </Select>
            </div>
          </div>

          {/* Bisnis Unit — wajib untuk role head dan finance */}
          {['head', 'finance'].includes(form.role) && (
            <div className="space-y-1.5">
              <Label>
                Bisnis Unit *
                <span className="ml-1 text-xs text-gray-400 font-normal">
                  (menentukan data yang bisa dilihat)
                </span>
              </Label>
              <Select value={form.business_unit_id} onChange={e => setForm(f => ({ ...f, business_unit_id: e.target.value }))}>
                <option value="">— Pilih Bisnis Unit —</option>
                {businessUnits.filter(u => u.is_active).map(u => (
                  <option key={u.id} value={u.id}>{u.code} — {u.name}</option>
                ))}
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Departemen</Label>
            <Select value={form.department_id} onChange={e => setForm(f => ({ ...f, department_id: e.target.value }))}>
              <option value="">— Tidak ada —</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setModal(null)}>Batal</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Menyimpan...' : editId ? 'Simpan Perubahan' : 'Buat Akun'}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Modal Konfirmasi Hapus User */}
      <Dialog open={!!deleteTarget} onClose={() => !deleting && setDeleteTarget(null)} className="max-w-md">
        <DialogHeader>
          <DialogTitle>Hapus User Permanen</DialogTitle>
        </DialogHeader>
        <div className="mt-2 space-y-3 text-sm text-gray-600">
          <p>
            Anda akan menghapus permanen akun{' '}
            <span className="font-semibold text-gray-900">{deleteTarget?.full_name}</span>{' '}
            <span className="text-gray-500">({deleteTarget?.email})</span>.
          </p>
          <p className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-amber-800">
            Tindakan ini tidak dapat dibatalkan. Jika user pernah membuat pengajuan, sistem akan menolak
            penghapusan — gunakan <span className="font-medium">Nonaktifkan</span> sebagai gantinya.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>Batal</Button>
          <Button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {deleting ? 'Menghapus...' : 'Hapus Permanen'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
