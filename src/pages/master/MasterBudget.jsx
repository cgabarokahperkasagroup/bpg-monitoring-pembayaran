import { useState } from 'react'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Dialog, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../../components/ui/dialog'
import { AlertDialog } from '../../components/ui/alert-dialog'
import { useMasterData } from '../../context/MasterDataContext'
import { upsertBudgetCode, deleteBudgetCode } from '../../services/masterService'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'

export default function MasterBudget() {
  const { budgetCodes, reload } = useMasterData()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ code: '', description: '' })
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [saving, setSaving] = useState(false)

  const filtered = budgetCodes.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => { setForm({ code: '', description: '' }); setEditId(null); setModal('form') }
  const openEdit = (c) => { setForm({ code: c.code, description: c.description || '' }); setEditId(c.id); setModal('form') }

  const handleSave = async () => {
    if (!form.code.trim()) return alert('Kode budget wajib diisi')
    setSaving(true)
    try {
      await upsertBudgetCode(editId ? { id: editId, ...form } : { id: `bc${Date.now()}`, ...form })
      await reload()
      setModal(null)
    } catch (err) {
      alert('Gagal menyimpan: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteBudgetCode(deleteId)
      await reload()
      setDeleteId(null)
    } catch (err) {
      alert('Gagal hapus: ' + err.message)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Kode Budget</h1>
          <p className="text-sm text-gray-500">{budgetCodes.length} kode budget</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" /> Tambah Kode Budget</Button>
      </div>
      <Card><CardContent className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input placeholder="Cari kode atau deskripsi..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </CardContent></Card>
      <Card>
        <Table>
          <TableHeader><TableRow>
            <TableHead className="pl-4">Kode Budget</TableHead>
            <TableHead>Deskripsi</TableHead>
            <TableHead className="text-center">Aksi</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {filtered.map(c => (
              <TableRow key={c.id}>
                <TableCell className="pl-4"><span className="font-mono text-blue-700 font-semibold">{c.code}</span></TableCell>
                <TableCell className="text-sm text-gray-600">{c.description || '—'}</TableCell>
                <TableCell>
                  <div className="flex justify-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setDeleteId(c.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <Dialog open={modal === 'form'} onClose={() => setModal(null)}>
        <DialogClose onClose={() => setModal(null)} />
        <DialogHeader><DialogTitle>{editId ? 'Edit Kode Budget' : 'Tambah Kode Budget'}</DialogTitle></DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="space-y-1.5">
            <Label>Kode Budget *</Label>
            <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="Contoh: 01.5-3830.001" />
          </div>
          <div className="space-y-1.5">
            <Label>Deskripsi</Label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Deskripsi kode budget..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setModal(null)}>Batal</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan...' : editId ? 'Simpan' : 'Tambah'}</Button>
        </DialogFooter>
      </Dialog>
      <AlertDialog open={!!deleteId} title="Hapus Kode Budget?" description="Kode budget ini akan dihapus." confirmLabel="Hapus" confirmVariant="destructive" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
