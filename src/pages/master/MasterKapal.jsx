import { useState } from 'react'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Dialog, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../../components/ui/dialog'
import { Badge } from '../../components/ui/badge'
import { useMasterData } from '../../context/MasterDataContext'
import { upsertVessel, deleteVessel } from '../../services/masterService'
import { Plus, Pencil, Power, Search } from 'lucide-react'

const fleets = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']

export default function MasterKapal() {
  const { vessels, companies, reload } = useMasterData()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ name: '', code: '', company_id: '', fleet: '', is_active: true })
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)

  const filtered = vessels.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.code.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => { setForm({ name: '', code: '', company_id: '', fleet: '', is_active: true }); setEditId(null); setModal('form') }
  const openEdit = (v) => { setForm({ name: v.name, code: v.code, company_id: v.company_id, fleet: v.fleet, is_active: v.is_active }); setEditId(v.id); setModal('form') }

  const handleSave = async () => {
    if (!form.name || !form.code || !form.company_id) return alert('Nama, Kode, dan Perusahaan wajib diisi')
    setSaving(true)
    try {
      await upsertVessel(editId ? { id: editId, ...form } : { id: `v${Date.now()}`, ...form })
      await reload()
      setModal(null)
    } catch (err) {
      alert('Gagal menyimpan: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (v) => {
    try {
      await upsertVessel({ id: v.id, name: v.name, code: v.code, company_id: v.company_id, fleet: v.fleet, is_active: !v.is_active })
      await reload()
    } catch (err) {
      alert('Gagal: ' + err.message)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Kapal</h1>
          <p className="text-sm text-gray-500">{vessels.length} kapal terdaftar</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" /> Tambah Kapal</Button>
      </div>

      <Card><CardContent className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input placeholder="Cari nama atau kode kapal..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </CardContent></Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Nama Kapal</TableHead>
              <TableHead>Kode</TableHead>
              <TableHead>Perusahaan</TableHead>
              <TableHead>Fleet</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(v => {
              const comp = companies.find(c => c.id === v.company_id)
              return (
                <TableRow key={v.id}>
                  <TableCell className="pl-4 font-medium">{v.name}</TableCell>
                  <TableCell><span className="font-mono text-sm text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{v.code}</span></TableCell>
                  <TableCell><span className="text-xs font-semibold bg-gray-100 px-2 py-0.5 rounded">{comp?.code}</span></TableCell>
                  <TableCell>Fleet {v.fleet}</TableCell>
                  <TableCell>
                    <Badge variant={v.is_active ? 'paid' : 'draft'}>{v.is_active ? 'Aktif' : 'Nonaktif'}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(v)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className={`h-8 w-8 ${v.is_active ? 'text-red-500' : 'text-green-500'}`} onClick={() => toggleActive(v)}>
                        <Power className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={modal === 'form'} onClose={() => setModal(null)}>
        <DialogClose onClose={() => setModal(null)} />
        <DialogHeader><DialogTitle>{editId ? 'Edit Kapal' : 'Tambah Kapal Baru'}</DialogTitle></DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="space-y-1.5">
            <Label>Nama Kapal *</Label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Contoh: TB. BB 99" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Kode *</Label>
              <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} maxLength={10} placeholder="BB99" />
            </div>
            <div className="space-y-1.5">
              <Label>Fleet</Label>
              <Select value={form.fleet} onChange={e => setForm(f => ({ ...f, fleet: e.target.value }))}>
                <option value="">-- Pilih Fleet --</option>
                {fleets.map(fl => <option key={fl} value={fl}>Fleet {fl}</option>)}
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Perusahaan *</Label>
            <Select value={form.company_id} onChange={e => setForm(f => ({ ...f, company_id: e.target.value }))}>
              <option value="">-- Pilih Perusahaan --</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setModal(null)}>Batal</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan...' : editId ? 'Simpan Perubahan' : 'Tambah'}</Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
