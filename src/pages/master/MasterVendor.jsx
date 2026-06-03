import { useState } from 'react'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Dialog, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../../components/ui/dialog'
import { AlertDialog } from '../../components/ui/alert-dialog'
import { vendors as initVendors } from '../../data/mockData'
import { formatDate } from '../../lib/utils'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'

export default function MasterVendor() {
  const [vends, setVends] = useState(initVendors)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ name: '' })
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const filtered = vends.filter(v => v.name.toLowerCase().includes(search.toLowerCase()))
  const openAdd = () => { setForm({ name: '' }); setEditId(null); setModal('form') }
  const openEdit = (v) => { setForm({ name: v.name }); setEditId(v.id); setModal('form') }
  const handleSave = () => {
    if (!form.name.trim()) return alert('Nama vendor wajib diisi')
    if (editId) setVends(prev => prev.map(v => v.id === editId ? { ...v, ...form } : v))
    else setVends(prev => [...prev, { id: `ve${Date.now()}`, ...form, created_at: new Date().toISOString() }])
    setModal(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Vendor</h1>
          <p className="text-sm text-gray-500">{vends.length} vendor terdaftar</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" /> Tambah Vendor</Button>
      </div>
      <Card><CardContent className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input placeholder="Cari nama vendor..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </CardContent></Card>
      <Card>
        <Table>
          <TableHeader><TableRow>
            <TableHead className="pl-4">No</TableHead>
            <TableHead>Nama Vendor</TableHead>
            <TableHead className="text-center">Aksi</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {filtered.map((v, i) => (
              <TableRow key={v.id}>
                <TableCell className="pl-4 text-gray-400 text-sm">{i + 1}</TableCell>
                <TableCell className="font-medium">{v.name}</TableCell>
                <TableCell>
                  <div className="flex justify-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(v)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setDeleteId(v.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <Dialog open={modal === 'form'} onClose={() => setModal(null)}>
        <DialogClose onClose={() => setModal(null)} />
        <DialogHeader><DialogTitle>{editId ? 'Edit Vendor' : 'Tambah Vendor'}</DialogTitle></DialogHeader>
        <div className="space-y-1.5 mt-2">
          <Label>Nama Vendor *</Label>
          <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Contoh: PT Sumber Teknik Abadi" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setModal(null)}>Batal</Button>
          <Button onClick={handleSave}>{editId ? 'Simpan' : 'Tambah'}</Button>
        </DialogFooter>
      </Dialog>
      <AlertDialog open={!!deleteId} title="Hapus Vendor?" description="Vendor ini akan dihapus." confirmLabel="Hapus" confirmVariant="destructive" onConfirm={() => { setVends(prev => prev.filter(v => v.id !== deleteId)); setDeleteId(null) }} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
