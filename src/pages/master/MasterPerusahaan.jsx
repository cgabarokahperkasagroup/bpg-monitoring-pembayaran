import { useState } from 'react'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Dialog, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../../components/ui/dialog'
import { AlertDialog } from '../../components/ui/alert-dialog'
import { companies as initCompanies, businessUnits } from '../../data/mockData'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'

export default function MasterPerusahaan() {
  const [companies, setCompanies] = useState(initCompanies)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ name: '', code: '', business_unit_id: '', is_active: true })
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  )

  const getUnit = (id) => businessUnits.find(u => u.id === id)

  const openAdd = () => { setForm({ name: '', code: '', business_unit_id: '', is_active: true }); setEditId(null); setModal('form') }
  const openEdit = (c) => { setForm({ name: c.name, code: c.code, business_unit_id: c.business_unit_id || '', is_active: c.is_active }); setEditId(c.id); setModal('form') }

  const handleSave = () => {
    if (!form.name.trim()) return alert('Nama perusahaan wajib diisi')
    if (!form.code.trim()) return alert('Kode perusahaan wajib diisi')
    if (!form.business_unit_id) return alert('Bisnis unit wajib dipilih')
    if (editId) {
      setCompanies(prev => prev.map(c => c.id === editId ? { ...c, ...form } : c))
    } else {
      setCompanies(prev => [...prev, { id: `c${Date.now()}`, ...form }])
    }
    setModal(null)
  }

  const handleDelete = () => {
    setCompanies(prev => prev.filter(c => c.id !== deleteId))
    setDeleteId(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Perusahaan</h1>
          <p className="text-sm text-gray-500">{companies.length} perusahaan</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" /> Tambah Perusahaan</Button>
      </div>

      <Card><CardContent className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input placeholder="Cari nama atau kode perusahaan..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </CardContent></Card>

      <Card>
        <Table>
          <TableHeader><TableRow>
            <TableHead className="pl-4">No</TableHead>
            <TableHead>Kode</TableHead>
            <TableHead>Nama Perusahaan</TableHead>
            <TableHead>Bisnis Unit</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Aksi</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {filtered.map((c, i) => {
              const unit = getUnit(c.business_unit_id)
              return (
                <TableRow key={c.id}>
                  <TableCell className="pl-4 text-gray-400 text-sm">{i + 1}</TableCell>
                  <TableCell>
                    <span className="font-mono text-sm bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{c.code}</span>
                  </TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>
                    {unit ? (
                      <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-medium">
                        {unit.code} — {unit.name}
                      </span>
                    ) : <span className="text-gray-400 text-xs">—</span>}
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setDeleteId(c.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-400 py-8">Tidak ada data perusahaan</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={modal === 'form'} onClose={() => setModal(null)}>
        <DialogClose onClose={() => setModal(null)} />
        <DialogHeader><DialogTitle>{editId ? 'Edit Perusahaan' : 'Tambah Perusahaan'}</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Bisnis Unit *</Label>
            <Select value={form.business_unit_id} onChange={e => setForm(f => ({ ...f, business_unit_id: e.target.value }))}>
              <option value="">-- Pilih Bisnis Unit --</option>
              {businessUnits.filter(u => u.is_active).map(u => (
                <option key={u.id} value={u.id}>{u.code} — {u.name}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Nama Perusahaan *</Label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Contoh: Barokah Gemilang Perkasa" />
          </div>
          <div className="space-y-1.5">
            <Label>Kode Perusahaan *</Label>
            <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="Contoh: BGP" maxLength={10} />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active}
              onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
              className="w-4 h-4 accent-blue-600"
            />
            <Label htmlFor="is_active" className="cursor-pointer">Perusahaan Aktif</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setModal(null)}>Batal</Button>
          <Button onClick={handleSave}>{editId ? 'Simpan' : 'Tambah'}</Button>
        </DialogFooter>
      </Dialog>

      <AlertDialog open={!!deleteId} title="Hapus Perusahaan?" description="Perusahaan ini akan dihapus dari sistem." confirmLabel="Hapus" confirmVariant="destructive" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
