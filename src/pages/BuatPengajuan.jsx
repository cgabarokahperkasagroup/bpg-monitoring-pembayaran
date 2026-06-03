import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Select } from '../components/ui/select'
import { companies, departments, vendors, vessels, budgetCodes, paymentForms } from '../data/mockData'
import { formatRupiah } from '../lib/utils'
import { useAuth } from '../context/AuthContext'
import {
  ChevronRight, ChevronLeft, Plus, Trash2, Upload, X, FileText, CheckCircle,
} from 'lucide-react'

const steps = [
  { id: 1, label: 'Header Form' },
  { id: 2, label: 'Item Pengajuan' },
  { id: 3, label: 'Lampiran' },
]

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((step, i) => (
        <div key={step.id} className="flex items-center">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            step.id < current ? 'bg-green-100 text-green-700' :
            step.id === current ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
          }`}>
            {step.id < current
              ? <CheckCircle className="h-4 w-4" />
              : <span className="w-5 h-5 flex items-center justify-center text-xs font-bold">{step.id}</span>
            }
            <span className="hidden sm:inline">{step.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-px w-8 mx-1 ${step.id < current ? 'bg-green-300' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

const defaultItem = () => ({
  id: Date.now(),
  description: '',
  qty: '',
  unit_price: '',
  vessel_id: '',
  fleet: '',
  budget_code_id: '',
  notes: '',
  invoice_number: '',
})

export default function BuatPengajuan() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)

  // Header state
  const [header, setHeader] = useState({
    invoice_date: '',
    submission_date: '2026-06-02',
    vendor_id: '',
    vendor_name_raw: '',
    useExistingVendor: true,
    company_id: currentUser?.company_id || '',
    department_id: currentUser?.department_id || '',
    pic_name: currentUser?.full_name || '',
  })

  // Items state
  const [items, setItems] = useState([defaultItem()])

  // Attachments state
  const [attachments, setAttachments] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const selectedCompany = companies.find(c => c.id === header.company_id)
  const filteredVessels = vessels.filter(v => v.company_id === header.company_id && v.is_active)

  const generatedCode = (() => {
    const company = companies.find(c => c.id === header.company_id)
    const dept = departments.find(d => d.id === header.department_id)
    if (!company || !dept || !header.submission_date) return 'PTCODE-YYYY-MM-DEPT-XXX'
    const d = new Date(header.submission_date)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const prefix = `${company.code}-${yyyy}-${mm}-${dept.code}`
    const count = paymentForms.filter(f => f.form_code.startsWith(prefix)).length
    const seq = String(count + 1).padStart(3, '0')
    return `${prefix}-${seq}`
  })()

  const updateItem = (id, field, value) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item
      const updated = { ...item, [field]: value }
      if (field === 'vessel_id') {
        const v = vessels.find(v => v.id === value)
        updated.fleet = v?.fleet || ''
      }
      return updated
    }))
  }

  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id))

  const getItemTotal = (item) => {
    const q = parseFloat(item.qty) || 0
    const p = parseFloat(item.unit_price) || 0
    return q * p
  }

  const grandTotal = items.reduce((s, i) => s + getItemTotal(i), 0)

  const handleFileAdd = (e) => {
    const files = Array.from(e.target.files)
    if (attachments.length + files.length > 10) {
      alert('Maksimal 10 lampiran per form')
      return
    }
    const valid = files.filter(f => {
      if (f.size > 10 * 1024 * 1024) { alert(`File ${f.name} melebihi 10MB`); return false }
      if (!['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(f.type)) {
        alert(`Format file ${f.name} tidak didukung`); return false
      }
      return true
    })
    setAttachments(prev => [
      ...prev,
      ...valid.map(f => ({ file: f, label: '', id: Date.now() + Math.random() }))
    ])
  }

  const handleSubmit = async (action) => {
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 800))
    const status = action === 'submit' ? 'submitted' : 'draft'
    alert(`Form berhasil ${action === 'submit' ? 'diajukan ke Finance' : 'disimpan sebagai Draft'}!\n\nKode Form: ${generatedCode}\nStatus: ${status.toUpperCase()}\n\n(Data mock, belum tersimpan ke database)`)
    navigate('/pengajuan')
    setSubmitting(false)
  }

  const canNextStep1 = header.submission_date && header.company_id && header.department_id && header.pic_name &&
    (header.useExistingVendor ? header.vendor_id : header.vendor_name_raw)

  const canNextStep2 = items.length > 0 && items.every(i => i.description && i.qty && i.unit_price)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/pengajuan')}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Kembali
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Buat Pengajuan Baru</h1>
          <p className="text-sm text-gray-500">Kode Form: <span className="font-mono text-blue-700 font-semibold">{generatedCode}</span></p>
        </div>
      </div>

      <StepIndicator current={step} />

      {/* Step 1: Header */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Informasi Header Form</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Tanggal Pembuatan Pengajuan <span className="text-red-500">*</span></Label>
                <Input type="date" value={header.submission_date} onChange={e => setHeader(h => ({ ...h, submission_date: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Tanggal Invoice Diterima dari Vendor</Label>
                <Input type="date" value={header.invoice_date} onChange={e => setHeader(h => ({ ...h, invoice_date: e.target.value }))} />
              </div>
            </div>

            {/* Vendor */}
            <div className="space-y-2">
              <Label>Vendor <span className="text-red-500">*</span></Label>
              <div className="flex gap-2 mb-2">
                <Button
                  variant={header.useExistingVendor ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setHeader(h => ({ ...h, useExistingVendor: true }))}
                >Pilih dari Master</Button>
                <Button
                  variant={!header.useExistingVendor ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setHeader(h => ({ ...h, useExistingVendor: false }))}
                >Ketik Manual</Button>
              </div>
              {header.useExistingVendor ? (
                <Select value={header.vendor_id} onChange={e => setHeader(h => ({ ...h, vendor_id: e.target.value }))}>
                  <option value="">-- Pilih Vendor --</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </Select>
              ) : (
                <Input
                  placeholder="Ketik nama vendor baru..."
                  value={header.vendor_name_raw}
                  onChange={e => setHeader(h => ({ ...h, vendor_name_raw: e.target.value }))}
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Perusahaan <span className="text-red-500">*</span></Label>
                <Select value={header.company_id} onChange={e => setHeader(h => ({ ...h, company_id: e.target.value }))}>
                  <option value="">-- Pilih Perusahaan --</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Departemen <span className="text-red-500">*</span></Label>
                <Select value={header.department_id} onChange={e => setHeader(h => ({ ...h, department_id: e.target.value }))}>
                  <option value="">-- Pilih Departemen --</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Nama PIC yang Mengajukan <span className="text-red-500">*</span></Label>
              <Input
                placeholder="Nama lengkap penanggung jawab"
                value={header.pic_name}
                onChange={e => setHeader(h => ({ ...h, pic_name: e.target.value }))}
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!canNextStep1}>
                Lanjut ke Item <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Items */}
      {step === 2 && (
        <div className="space-y-4">
          {items.map((item, idx) => (
            <Card key={item.id}>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base">Item #{idx + 1}</CardTitle>
                {items.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-red-500 h-8 w-8">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Uraian Pekerjaan/Barang <span className="text-red-500">*</span></Label>
                  <Textarea
                    placeholder="Deskripsi pekerjaan atau barang yang dibayarkan..."
                    value={item.description}
                    onChange={e => updateItem(item.id, 'description', e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1.5">
                    <Label>Qty <span className="text-red-500">*</span></Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      value={item.qty}
                      onChange={e => updateItem(item.id, 'qty', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Harga Satuan (Rp) <span className="text-red-500">*</span></Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={item.unit_price}
                      onChange={e => updateItem(item.id, 'unit_price', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label>Total</Label>
                    <div className="h-9 flex items-center px-3 rounded-md border bg-gray-50 text-sm font-semibold text-green-700">
                      {formatRupiah(getItemTotal(item))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label>Kapal</Label>
                    <Select value={item.vessel_id} onChange={e => updateItem(item.id, 'vessel_id', e.target.value)}>
                      <option value="">-- Tidak ada --</option>
                      {filteredVessels.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Fleet (auto)</Label>
                    <Input value={item.fleet} readOnly className="bg-gray-50" placeholder="Terisi otomatis" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Kode Budget</Label>
                    <Select value={item.budget_code_id} onChange={e => updateItem(item.id, 'budget_code_id', e.target.value)}>
                      <option value="">-- Pilih --</option>
                      {budgetCodes.map(b => <option key={b.id} value={b.id}>{b.code}</option>)}
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Nomor Invoice</Label>
                    <Input
                      placeholder="Nomor invoice dari vendor"
                      value={item.invoice_number}
                      onChange={e => updateItem(item.id, 'invoice_number', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Keterangan</Label>
                    <Input
                      placeholder="Catatan tambahan (opsional)"
                      value={item.notes}
                      onChange={e => updateItem(item.id, 'notes', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Grand Total */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 flex items-center justify-between">
              <span className="font-semibold text-gray-700">Total Keseluruhan ({items.length} item)</span>
              <span className="text-xl font-bold text-blue-700">{formatRupiah(grandTotal)}</span>
            </CardContent>
          </Card>

          <Button
            variant="outline"
            onClick={() => setItems(prev => [...prev, defaultItem()])}
            className="w-full border-dashed"
          >
            <Plus className="h-4 w-4 mr-2" /> Tambah Item
          </Button>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Kembali
            </Button>
            <Button onClick={() => setStep(3)} disabled={!canNextStep2}>
              Lanjut ke Lampiran <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Attachments */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Lampiran Invoice</CardTitle>
            <p className="text-sm text-gray-500">Opsional • Maks 10 file • PDF, JPG, PNG • Maks 10MB per file</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Upload Area */}
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-blue-300 rounded-xl p-8 cursor-pointer hover:bg-blue-50 transition-colors">
              <Upload className="h-8 w-8 text-blue-400 mb-2" />
              <span className="text-sm font-medium text-blue-700">Klik untuk pilih file atau seret ke sini</span>
              <span className="text-xs text-gray-400 mt-1">PDF, JPG, PNG — Maks 10MB per file</span>
              <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileAdd} />
            </label>

            {/* File List */}
            {attachments.map((att, idx) => (
              <div key={att.id} className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50">
                <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{att.file.name}</p>
                  <p className="text-xs text-gray-400">{(att.file.size / 1024).toFixed(0)} KB</p>
                </div>
                <Input
                  placeholder="Label (opsional, maks 100 karakter)"
                  value={att.label}
                  maxLength={100}
                  onChange={e => setAttachments(prev => prev.map((a, i) => i === idx ? { ...a, label: e.target.value } : a))}
                  className="max-w-[200px] h-8 text-xs"
                />
                <button
                  onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                  className="text-red-400 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}

            {attachments.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-4">Belum ada lampiran. Form dapat disubmit tanpa lampiran.</p>
            )}

            {/* Summary */}
            <div className="rounded-lg bg-gray-50 border p-4 space-y-2">
              <p className="text-sm font-semibold text-gray-700">Ringkasan Pengajuan</p>
              <div className="grid grid-cols-2 gap-x-4 text-sm text-gray-600">
                <span>Kode Form:</span>
                <span className="font-mono font-semibold text-blue-700">{generatedCode}</span>
                <span>Vendor:</span>
                <span>{header.useExistingVendor ? vendors.find(v => v.id === header.vendor_id)?.name : header.vendor_name_raw}</span>
                <span>Perusahaan:</span>
                <span>{companies.find(c => c.id === header.company_id)?.code}</span>
                <span>Jumlah Item:</span>
                <span>{items.length} item</span>
                <span>Total Nilai:</span>
                <span className="font-semibold text-green-700">{formatRupiah(grandTotal)}</span>
                <span>Lampiran:</span>
                <span>{attachments.length} file</span>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Kembali
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleSubmit('draft')} disabled={submitting}>
                  {submitting ? 'Menyimpan...' : 'Simpan Draft'}
                </Button>
                <Button onClick={() => handleSubmit('submit')} disabled={submitting}>
                  {submitting ? 'Mengajukan...' : 'Ajukan ke Finance'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
