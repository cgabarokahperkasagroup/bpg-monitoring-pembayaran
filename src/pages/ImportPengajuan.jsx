import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { useMasterData } from '../context/MasterDataContext'
import { useAuth } from '../context/AuthContext'
import { downloadTemplate, parseExcelFile } from '../lib/excelImport'
import { importPaymentForms } from '../services/paymentService'
import { formatRupiah } from '../lib/utils'
import { ChevronLeft, Download, Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

const norm = s => String(s ?? '').trim().toLowerCase()

function parseNum(v) {
  if (typeof v === 'number') return v
  let s = String(v ?? '').trim().replace(/[^\d,.-]/g, '')
  if (s === '') return NaN
  if (s.includes('.') && s.includes(',')) s = s.replace(/\./g, '').replace(',', '.')
  else if (s.includes(',')) s = s.replace(',', '.')
  else if ((s.match(/\./g) || []).length > 1) s = s.replace(/\./g, '')
  return parseFloat(s)
}

function toISODate(v) {
  const s = String(v ?? '').trim()
  if (!s) return null
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
  return null
}

export default function ImportPengajuan() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { companies, departments, budgetCodes, vessels, vendors } = useMasterData()
  const [fileName, setFileName] = useState('')
  const [groups, setGroups] = useState(null)
  const [parsing, setParsing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState(null)
  const [parseError, setParseError] = useState('')

  const findCompany = v => companies.find(c => norm(c.name) === norm(v) || norm(c.code) === norm(v))
  const findDept = v => departments.find(d => norm(d.name) === norm(v) || norm(d.code) === norm(v))
  const findVessel = v => vessels.find(s => norm(s.name) === norm(v))
  const findVendor = v => vendors.find(s => norm(s.name) === norm(v))
  const findBudget = v => {
    const n = norm(v)
    return budgetCodes.find(b => norm(b.code) === n || norm(b.description) === n || norm(`${b.code} — ${b.description}`) === n)
  }

  const firstNonEmpty = (rows, key) => { for (const r of rows) { if (r[key]) return r[key] } return '' }

  const buildGroups = (rows) => {
    const map = new Map()
    rows.forEach((r, i) => {
      const key = String(r.grup ?? '').trim() || `baris-${r.__row ?? i}`
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(r)
    })

    return [...map.entries()].map(([key, rws]) => {
      const errors = []
      const warnings = []
      const rowNums = rws.map(r => r.__row).filter(Boolean)

      const compRaw = firstNonEmpty(rws, 'perusahaan')
      const deptRaw = firstNonEmpty(rws, 'departemen')
      const dateRaw = firstNonEmpty(rws, 'tanggal')
      const invRaw = firstNonEmpty(rws, 'tanggal_invoice')
      const picRaw = firstNonEmpty(rws, 'pic')
      const vendorRaw = firstNonEmpty(rws, 'vendor')

      const company = findCompany(compRaw)
      const dept = findDept(deptRaw)
      const subDate = toISODate(dateRaw)
      const invDate = invRaw ? toISODate(invRaw) : null

      if (!compRaw) errors.push('Perusahaan kosong')
      else if (!company) errors.push(`Perusahaan "${compRaw}" tidak ditemukan di master`)
      if (!deptRaw) errors.push('Departemen kosong')
      else if (!dept) errors.push(`Departemen "${deptRaw}" tidak ditemukan di master`)
      if (!dateRaw) errors.push('Tanggal Pengajuan kosong')
      else if (!subDate) errors.push(`Tanggal "${dateRaw}" tidak valid (pakai YYYY-MM-DD)`)
      if (invRaw && !invDate) warnings.push(`Tanggal Invoice "${invRaw}" tidak valid — diabaikan`)

      const vendor = vendorRaw ? findVendor(vendorRaw) : null
      const vendor_name_raw = (vendorRaw && !vendor) ? vendorRaw : null

      const items = []
      rws.forEach(r => {
        if (!r.uraian && !r.qty && !r.harga) return // baris kosong dlm grup
        const rowLabel = `baris ${r.__row}`
        if (!r.uraian) { errors.push(`Uraian kosong (${rowLabel})`); return }
        const qty = parseNum(r.qty)
        const price = parseNum(r.harga)
        if (!(qty > 0)) errors.push(`Qty tidak valid (${rowLabel})`)
        if (!(price >= 0) || Number.isNaN(price)) errors.push(`Harga Satuan tidak valid (${rowLabel})`)

        const vessel = r.kapal ? findVessel(r.kapal) : null
        if (r.kapal && !vessel) warnings.push(`Kapal "${r.kapal}" tidak ditemukan (${rowLabel}) — dikosongkan`)
        const budget = r.budget ? findBudget(r.budget) : null
        if (r.budget && !budget) warnings.push(`Kode Budget "${r.budget}" tidak ditemukan (${rowLabel}) — dikosongkan`)

        items.push({
          description: r.uraian,
          qty: qty > 0 ? qty : 0,
          unit_price: price >= 0 ? price : 0,
          total: (qty > 0 ? qty : 0) * (price >= 0 ? price : 0),
          vessel_id: vessel?.id || null,
          fleet: vessel?.fleet || null,
          budget_code_id: budget?.id || null,
          notes: r.keterangan || null,
          invoice_number: r.no_invoice || null,
        })
      })
      if (items.length === 0) errors.push('Tidak ada item valid pada grup ini')

      const grandTotal = items.reduce((s, it) => s + it.total, 0)

      return {
        key, rowNums, errors, warnings, items, grandTotal,
        display: {
          company: company?.code || compRaw, department: dept?.name || deptRaw,
          date: subDate || dateRaw, pic: picRaw, vendor: vendor?.name || vendor_name_raw || '—',
        },
        form: company && dept && subDate ? {
          company_id: company.id, company_code: company.code,
          department_id: dept.id, dept_code: dept.code,
          submission_date: subDate, invoice_date: invDate,
          pic_name: picRaw || null,
          vendor_id: vendor?.id || null, vendor_name_raw,
        } : null,
      }
    })
  }

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setParseError(''); setResult(null); setGroups(null)
    setFileName(file.name)
    setParsing(true)
    try {
      const rows = await parseExcelFile(file)
      if (rows.length === 0) { setParseError('File tidak berisi data (selain header).'); return }
      setGroups(buildGroups(rows))
    } catch (err) {
      setParseError('Gagal membaca file: ' + err.message)
    } finally {
      setParsing(false)
    }
  }

  const summary = useMemo(() => {
    if (!groups) return null
    const valid = groups.filter(g => g.errors.length === 0)
    const errorCount = groups.length - valid.length
    const items = valid.reduce((s, g) => s + g.items.length, 0)
    const total = valid.reduce((s, g) => s + g.grandTotal, 0)
    return { valid, errorCount, items, total, validCount: valid.length }
  }, [groups])

  const handleImport = async () => {
    if (!summary || summary.validCount === 0) return
    setImporting(true)
    try {
      const forms = summary.valid.map(g => ({ ...g.form, items: g.items, label: `Grup ${g.key} (${g.display.company})` }))
      const res = await importPaymentForms(forms, currentUser.id)
      setResult(res)
      if (res.success > 0) setGroups(null)
    } catch (err) {
      setResult({ success: 0, failed: summary.validCount, errors: [{ label: 'Sistem', message: err.message }] })
    } finally {
      setImporting(false)
    }
  }

  const handleDownload = async () => {
    try {
      await downloadTemplate({ companies, departments, budgetCodes, vessels, vendors })
    } catch (err) {
      alert('Gagal membuat template: ' + err.message)
    }
  }

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/pengajuan')}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Kembali
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Import Pengajuan dari Excel</h1>
          <p className="text-sm text-gray-500">Masukkan data pengajuan yang belum dibayar secara massal</p>
        </div>
      </div>

      {/* Langkah 1: Template */}
      <Card><CardContent className="p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs">1</span>
              Unduh Template
            </h2>
            <p className="text-sm text-gray-500 mt-1 ml-8">
              Template berisi sheet <b>Data Pengajuan</b>, <b>Petunjuk</b>, dan <b>Referensi</b> (nama perusahaan, departemen, budget, kapal yang valid).
            </p>
          </div>
          <Button variant="outline" onClick={handleDownload}><Download className="h-4 w-4 mr-2" /> Unduh Template Excel</Button>
        </div>
      </CardContent></Card>

      {/* Langkah 2: Upload */}
      <Card><CardContent className="p-5">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs">2</span>
          Unggah File Excel
        </h2>
        <div className="mt-3 ml-8">
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:bg-gray-50 transition">
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">{parsing ? 'Membaca file...' : 'Klik untuk pilih file .xlsx'}</span>
            {fileName && !parsing && <span className="text-xs text-blue-600 mt-1 flex items-center gap-1"><FileSpreadsheet className="h-3 w-3" /> {fileName}</span>}
            <input type="file" accept=".xlsx" className="hidden" onChange={handleFile} disabled={parsing || importing} />
          </label>
          {parseError && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {parseError}
            </div>
          )}
        </div>
      </CardContent></Card>

      {/* Hasil import */}
      {result && (
        <Card><CardContent className="p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
            <div className="flex-1">
              <h2 className="font-semibold text-gray-900">Import selesai</h2>
              <p className="text-sm text-gray-600 mt-1">
                <b className="text-green-700">{result.success} pengajuan</b> berhasil diimpor
                {result.failed > 0 && <> · <b className="text-red-600">{result.failed} gagal</b></>}.
              </p>
              {result.errors?.length > 0 && (
                <ul className="mt-2 text-xs text-red-600 list-disc ml-4 space-y-0.5">
                  {result.errors.map((e, i) => <li key={i}>{e.label}: {e.message}</li>)}
                </ul>
              )}
              <Button className="mt-3" size="sm" onClick={() => navigate('/pengajuan')}>Lihat Daftar Pengajuan</Button>
            </div>
          </div>
        </CardContent></Card>
      )}

      {/* Langkah 3: Preview */}
      {groups && summary && !result && (
        <Card><CardContent className="p-5">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs">3</span>
              Pratinjau & Konfirmasi
            </h2>
            <div className="text-sm text-gray-600">
              <span className="text-green-700 font-semibold">{summary.validCount} valid</span> ({summary.items} item · {formatRupiah(summary.total)})
              {summary.errorCount > 0 && <span className="text-red-600 font-semibold ml-2">· {summary.errorCount} bermasalah</span>}
            </div>
          </div>

          <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-1">
            {groups.map((g, gi) => {
              const ok = g.errors.length === 0
              return (
                <div key={gi} className={`rounded-lg border p-3 ${ok ? 'border-gray-200' : 'border-red-200 bg-red-50/40'}`}>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">Grup {g.key}</span>
                      <span className="font-medium">{g.display.company}</span>
                      <span className="text-gray-400">·</span>
                      <span className="text-gray-600">{g.display.department}</span>
                      <span className="text-gray-400">·</span>
                      <span className="text-gray-600">{g.display.date}</span>
                      <span className="text-gray-400">·</span>
                      <span className="text-gray-600">{g.display.vendor}</span>
                    </div>
                    {ok
                      ? <Badge variant="paid">Siap · {formatRupiah(g.grandTotal)}</Badge>
                      : <Badge variant="draft" className="bg-red-100 text-red-700">Bermasalah</Badge>}
                  </div>

                  <div className="mt-2 text-xs text-gray-600 space-y-0.5">
                    {g.items.map((it, ii) => (
                      <div key={ii} className="flex justify-between gap-2">
                        <span className="truncate">• {it.description} ({it.qty} × {formatRupiah(it.unit_price)})</span>
                        <span className="shrink-0 font-medium">{formatRupiah(it.total)}</span>
                      </div>
                    ))}
                  </div>

                  {g.errors.length > 0 && (
                    <ul className="mt-2 text-xs text-red-600 list-disc ml-4">
                      {g.errors.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                  )}
                  {g.warnings.length > 0 && (
                    <ul className="mt-1 text-xs text-amber-600 list-disc ml-4">
                      {g.warnings.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t pt-4">
            <p className="text-xs text-gray-400">
              Hanya grup berstatus <b>Siap</b> yang akan diimpor (status: Menunggu Konfirmasi Finance). Grup bermasalah dilewati.
            </p>
            <Button onClick={handleImport} disabled={importing || summary.validCount === 0}>
              {importing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Mengimpor...</> : <>Import {summary.validCount} Pengajuan</>}
            </Button>
          </div>
        </CardContent></Card>
      )}
    </div>
  )
}
