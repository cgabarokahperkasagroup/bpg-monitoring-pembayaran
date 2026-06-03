import { useState } from 'react'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Dialog, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../../components/ui/dialog'
import { AlertDialog } from '../../components/ui/alert-dialog'
import { businessUnits as initUnits } from '../../data/mockData'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'

export default function MasterBisnisUnit() {
  const [units, setUnits] = useState(initUnits)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ name: '', code: '', is_active: true })
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const filtered = units.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.code.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => { setForm({ name: '', code: '', is_active: true }); setEditId(null); setModal('form') }
  const openEdit = (u) => { setForm({ name: u.name, code: u.code, is_active: u.is_active }); setEditId(u.id); setModal('form') }

  const handleSave = () => {
    if (!form.name.trim()) return alert('Nama bisnis unit wajib diisi')
    if (!form.code.trim()) return alert('Kode bisnis unit wajib diisi')
    if (editId) {
      setUnits(prev => prev.map(u => u.id === editId ? { ...u, ...form } : u))
    } else {
      setUnits(prev => [...prev, { id: `bu${Date.now()}`, ...form }])
    }
    setModal(null)
  }

  const handleDelete = () => {
    setUnits(prev => prev.filter(u => u.id !== deleteId))
    setDeleteId(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Bisnis Unit</h1>
          <p className="text-sm text-gray-500">{units.length} bisnis unit</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" /> Tambah Bisnis Unit</Button>
      </div>

      <Card><CardContent className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input placeholder="Cari nama atau kode bisnis unit..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </CardContent></Card>

      <Card>
        <Table>
          <TableHeader><TableRow>
            <TableHead className="pl-4">No</TableHead>
            <TableHead>Kode</TableHead>
            <TableHead>Nama Bisnis Unit</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Aksi</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {filtered.map((u, i) => (
              <TableRow key={u.id}>
                <TableCell className="pl-4 text-gray-400 text-sm">{i + 1}</TableCell>
                <TableCell>
                  <span className="font-mono text-sm bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{u.code}</span>
                </TableCell>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {u.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(u)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setDeleteId(u.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-400 py-8">Tidak ada data bisnis unit</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={modal === 'form'} onClose={() => setModal(null)}>
        <DialogClose onClose={() => setModal(null)} />
        <DialogHeader><DialogTitle>{editId ? 'Edit Bisnis Unit' : 'Tambah Bisnis Unit'}</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Nama Bisnis Unit *</Label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Contoh: Shipping" />
          </div>
          <div className="space-y-1.5">
            <Label>Kode *</Label>
            <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="Contoh: SHP" maxLength={6} />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="bu_is_active"
              checked={form.is_active}
              onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
              className="w-4 h-4 accent-blue-600"
            />
            <Label htmlFor="bu_is_active" className="cursor-pointer">Bisnis Unit Aktif</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setModal(null)}>Batal</Button>
          <Button onClick={handleSave}>{editId ? 'Simpan' : 'Tambah'}</Button>
        </DialogFooter>
      </Dialog>

      <AlertDialog open={!!deleteId} title="Hapus Bisnis Unit?" description="Bisnis unit ini akan dihapus dari sistem." confirmLabel="Hapus" confirmVariant="destructive" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
