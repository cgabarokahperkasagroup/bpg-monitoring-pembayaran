import { useState } from 'react'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Dialog, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../../components/ui/dialog'
import { AlertDialog } from '../../components/ui/alert-dialog'
import { departments as initDepts } from '../../data/mockData'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'

export default function MasterDepartemen() {
  const [depts, setDepts] = useState(initDepts)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ name: '', code: '' })
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const filtered = depts.filter(d => d.name.toLowerCase().includes(search.toLowerCase()))

  const openAdd = () => { setForm({ name: '', code: '' }); setEditId(null); setModal('form') }
  const openEdit = (d) => { setForm({ name: d.name, code: d.code }); setEditId(d.id); setModal('form') }

  const handleSave = () => {
    if (!form.name.trim()) return alert('Nama departemen wajib diisi')
    if (!form.code.trim()) return alert('Kode departemen wajib diisi')
    if (editId) setDepts(prev => prev.map(d => d.id === editId ? { ...d, ...form } : d))
    else setDepts(prev => [...prev, { id: `d${Date.now()}`, ...form }])
    setModal(null)
  }

  const handleDelete = () => {
    setDepts(prev => prev.filter(d => d.id !== deleteId))
    setDeleteId(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Departemen</h1>
          <p className="text-sm text-gray-500">{depts.length} departemen</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" /> Tambah Departemen</Button>
      </div>
      <Card><CardContent className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input placeholder="Cari departemen..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </CardContent></Card>
      <Card>
        <Table>
          <TableHeader><TableRow>
            <TableHead className="pl-4">No</TableHead>
            <TableHead>Kode</TableHead>
            <TableHead>Nama Departemen</TableHead>
            <TableHead className="text-center">Aksi</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {filtered.map((d, i) => (
              <TableRow key={d.id}>
                <TableCell className="pl-4 text-gray-400 text-sm">{i + 1}</TableCell>
                <TableCell>
                  <span className="font-mono text-sm bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{d.code}</span>
                </TableCell>
                <TableCell className="font-medium">{d.name}</TableCell>
                <TableCell>
                  <div className="flex justify-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(d)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setDeleteId(d.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <Dialog open={modal === 'form'} onClose={() => setModal(null)}>
        <DialogClose onClose={() => setModal(null)} />
        <DialogHeader><DialogTitle>{editId ? 'Edit Departemen' : 'Tambah Departemen'}</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Nama Departemen *</Label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Contoh: Operasional" />
          </div>
          <div className="space-y-1.5">
            <Label>Kode Singkatan *</Label>
            <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="Contoh: OPR" maxLength={6} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setModal(null)}>Batal</Button>
          <Button onClick={handleSave}>{editId ? 'Simpan' : 'Tambah'}</Button>
        </DialogFooter>
      </Dialog>
      <AlertDialog open={!!deleteId} title="Hapus Departemen?" description="Departemen ini akan dihapus dari sistem." confirmLabel="Hapus" confirmVariant="destructive" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
