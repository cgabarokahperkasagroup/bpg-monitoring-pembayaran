import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Select } from '../components/ui/select'
import { SearchableSelect } from '../components/ui/searchable-select'
import { useMasterData } from '../context/MasterDataContext'
import { getPaymentFormById, getPaymentItems, updatePaymentForm } from '../services/paymentService'
import { formatRupiah } from '../lib/utils'
import { ChevronLeft, Plus, Trash2, Save, Send } from 'lucide-react'

export default function EditPengajuan() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { vendors, companies, departments, vessels, budgetCodes } = useMasterData()

  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [header, setHeader] = useState({
    invoice_date: '',
    submission_date: '',
    vendor_id: '',
    vendor_name_raw: '',
    useExistingVendor: true,
    company_id: '',
    department_id: '',
    pic_name: '',
  })

  const [items, setItems] = useState([])

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [formData, itemsData] = await Promise.all([
          getPaymentFormById(id),
          getPaymentItems(id),
        ])
        setForm(formData)
        setHeader({
          invoice_date: formData.invoice_date || '',
          submission_date: formData.submission_date || '',
          vendor_id: formData.vendor_id || '',
          vendor_name_raw: formData.vendor_name_raw || '',
          useExistingVendor: !formData.vendor_name_raw,
          company_id: formData.company_id || '',
          department_id: formData.department_id || '',
          pic_name: formData.pic_name || '',
        })
        setItems(itemsData.map(i => ({
          ...i,
          qty: String(i.qty),
          unit_price: String(i.unit_price),
          fleet: i.fleet || '',
        })))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Memuat form...</p>
      </div>
    )
  }

  if (!form || !['draft', 'rejected'].includes(form.status)) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Form tidak dapat diedit (hanya Draft/Dikembalikan yang dapat diedit).</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/pengajuan')}>Kembali</Button>
      </div>
    )
  }

  const filteredVessels = vessels.filter(v => v.company_id === header.company_id && v.is_active)

  const updateItem = (itemId, field, value) => {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item
      const updated = { ...item, [field]: value }
      if (field === 'vessel_id') {
        const v = vessels.find(v => v.id === value)
        updated.fleet = v?.fleet || ''
      }
      return updated
    }))
  }

  const getItemTotal = (item) => (parseFloat(item.qty) || 0) * (parseFloat(item.unit_price) || 0)
  const grandTotal = items.reduce((s, i) => s + getItemTotal(i), 0)

  const handleSave = async (action) => {
    setSaving(true)
    try {
      const now = new Date().toISOString()
      const newStatus = action === 'submit' ? 'submitted' : 'draft'

      const formData = {
        invoice_date: header.invoice_date || null,
        submission_date: header.submission_date,
        vendor_id: header.useExistingVendor ? header.vendor_id : null,
        vendor_name_raw: header.useExistingVendor ? null : header.vendor_name_raw,
        company_id: header.company_id,
        department_id: header.department_id,
        pic_name: header.pic_name,
        status: newStatus,
        submitted_to_finance_at: newStatus === 'submitted' ? now : form.submitted_to_finance_at,
        rejection_reason: newStatus === 'submitted' ? null : form.rejection_reason,
      }

      const itemsData = items.map((item, i) => ({
        id: item.id,
        item_code: item.item_code || `${form.form_code}-${String(i + 1).padStart(3, '0')}`,
        description: item.description,
        qty: parseFloat(item.qty),
        unit_price: parseFloat(item.unit_price),
        total: getItemTotal(item),
        vessel_id: item.vessel_id || null,
        fleet: item.fleet || null,
        budget_code_id: item.budget_code_id || null,
        notes: item.notes || null,
        invoice_number: item.invoice_number || null,
        item_number: i + 1,
      }))

      await updatePaymentForm(id, formData, itemsData)
      alert(`Form berhasil ${action === 'submit' ? 'diajukan ke Finance' : 'disimpan'}!`)
      navigate(`/pengajuan/${id}`)
    } catch (err) {
      alert('Gagal menyimpan: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(`/pengajuan/${id}`)}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Kembali
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Pengajuan</h1>
          <p className="text-sm font-mono text-blue-700">{form.form_code}</p>
        </div>
      </div>

      {/* Header */}
      <Card>
        <CardHeader><CardTitle className="text-base">Informasi Header</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Tanggal Pengajuan</Label>
              <Input type="date" value={header.submission_date} onChange={e => setHeader(h => ({ ...h, submission_date: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Tanggal Invoice</Label>
              <Input type="date" value={header.invoice_date} onChange={e => setHeader(h => ({ ...h, invoice_date: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Vendor</Label>
            {header.useExistingVendor ? (
              <SearchableSelect
                value={header.vendor_id}
                onChange={(val) => setHeader(h => ({ ...h, vendor_id: val }))}
                options={vendors.map(v => ({ value: v.id, label: v.name }))}
                placeholder="-- Pilih Vendor --"
                searchPlaceholder="Cari nama vendor..."
                clearable
                clearLabel="-- Pilih Vendor --"
              />
            ) : (
              <Input value={header.vendor_name_raw} onChange={e => setHeader(h => ({ ...h, vendor_name_raw: e.target.value }))} />
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Perusahaan</Label>
              <Select value={header.company_id} onChange={e => setHeader(h => ({ ...h, company_id: e.target.value }))}>
                {companies.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Departemen</Label>
              <SearchableSelect
                value={header.department_id}
                onChange={(val) => setHeader(h => ({ ...h, department_id: val }))}
                options={departments.map(d => ({ value: d.id, label: d.name }))}
                placeholder="-- Pilih Departemen --"
                searchPlaceholder="Cari departemen..."
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>PIC</Label>
            <Input value={header.pic_name} onChange={e => setHeader(h => ({ ...h, pic_name: e.target.value }))} />
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      {items.map((item, idx) => (
        <Card key={item.id}>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Item #{idx + 1}</CardTitle>
            {items.length > 1 && (
              <Button variant="ghost" size="icon" onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))} className="text-red-500 h-8 w-8">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label>Uraian</Label>
              <Textarea value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label>Qty</Label>
                <Input type="number" value={item.qty} onChange={e => updateItem(item.id, 'qty', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Harga Satuan</Label>
                <Input type="number" value={item.unit_price} onChange={e => updateItem(item.id, 'unit_price', e.target.value)} />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <Label>Total</Label>
                <div className="h-9 flex items-center px-3 rounded-md border bg-gray-50 text-sm font-semibold text-green-700">
                  {formatRupiah(getItemTotal(item))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Kapal</Label>
                <SearchableSelect
                  value={item.vessel_id || ''}
                  onChange={(val) => updateItem(item.id, 'vessel_id', val)}
                  options={filteredVessels.map(v => ({ value: v.id, label: v.name }))}
                  placeholder="-- Pilih kapal --"
                  searchPlaceholder="Cari nama kapal..."
                  emptyText={header.company_id ? 'Kapal tidak ditemukan' : 'Pilih perusahaan dulu'}
                  clearable
                  clearLabel="-- Tidak ada --"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Fleet</Label>
                <Input value={item.fleet} readOnly className="bg-gray-50" />
              </div>
              <div className="space-y-1.5">
                <Label>Kode Budget</Label>
                <SearchableSelect
                  value={item.budget_code_id || ''}
                  onChange={(val) => updateItem(item.id, 'budget_code_id', val)}
                  options={budgetCodes.map(b => ({ value: b.id, label: `${b.code} — ${b.description}` }))}
                  placeholder="-- Pilih kode budget --"
                  searchPlaceholder="Cari kode atau deskripsi..."
                  clearable
                  clearLabel="-- Pilih --"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>No. Invoice</Label>
                <Input value={item.invoice_number || ''} onChange={e => updateItem(item.id, 'invoice_number', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Keterangan</Label>
                <Input value={item.notes || ''} onChange={e => updateItem(item.id, 'notes', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4 flex items-center justify-between">
          <span className="font-semibold">Total: {items.length} item</span>
          <span className="text-xl font-bold text-blue-700">{formatRupiah(grandTotal)}</span>
        </CardContent>
      </Card>

      <Button
        variant="outline"
        onClick={() => setItems(prev => [...prev, {
          id: `new_${Date.now()}`, description: '', qty: '', unit_price: '',
          vessel_id: '', fleet: '', budget_code_id: '', notes: '', invoice_number: ''
        }])}
        className="w-full border-dashed"
      >
        <Plus className="h-4 w-4 mr-2" /> Tambah Item
      </Button>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => navigate(`/pengajuan/${id}`)}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Batal
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave('draft')} disabled={saving}>
            <Save className="h-4 w-4 mr-2" /> {saving ? 'Menyimpan...' : 'Simpan Draft'}
          </Button>
          <Button onClick={() => handleSave('submit')} disabled={saving}>
            <Send className="h-4 w-4 mr-2" /> {saving ? 'Mengajukan...' : 'Ajukan ke Finance'}
          </Button>
        </div>
      </div>
    </div>
  )
}
