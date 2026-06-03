import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select } from '../components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '../components/ui/table'
import { useMasterData } from '../context/MasterDataContext'
import { getPaymentForms, getAllPaymentItemTotals } from '../services/paymentService'
import { formatRupiah } from '../lib/utils'
import { BarChart2, Download, FileDown, Filter, X, Layers } from 'lucide-react'

const EMPTY_FILTER = {
  business_unit_id: '', company_id: '', department_id: '',
  vendor_id: '', status: '', date_from: '', date_to: '',
}

const STATUS_LABELS = {
  draft: 'Draft', submitted: 'Diajukan', received: 'Diterima Finance',
  paid: 'Dibayar', rejected: 'Dikembalikan',
}

export default function Laporan() {
  const { businessUnits, companies, departments, vendors } = useMasterData()
  const [paymentForms, setPaymentForms] = useState([])
  const [itemTotals, setItemTotals] = useState({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState(EMPTY_FILTER)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [forms, totals] = await Promise.all([getPaymentForms(), getAllPaymentItemTotals()])
        setPaymentForms(forms)
        setItemTotals(totals)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const setF = (key, val) => setFilter(f => ({ ...f, [key]: val, ...(key === 'business_unit_id' ? { company_id: '' } : {}) }))
  const hasFilter = Object.values(filter).some(Boolean)

  const getFormTotal = (formId) => itemTotals[formId] || 0

  const filteredCompanies = useMemo(() =>
    filter.business_unit_id
      ? companies.filter(c => c.business_unit_id === filter.business_unit_id)
      : companies,
    [filter.business_unit_id, companies]
  )

  const filtered = useMemo(() => {
    return paymentForms.filter(f => {
      if (filter.business_unit_id) {
        const c = companies.find(c => c.id === f.company_id)
        if (!c || c.business_unit_id !== filter.business_unit_id) return false
      }
      if (filter.company_id && f.company_id !== filter.company_id) return false
      if (filter.department_id && f.department_id !== filter.department_id) return false
      if (filter.vendor_id && f.vendor_id !== filter.vendor_id) return false
      if (filter.status && f.status !== filter.status) return false
      if (filter.date_from && f.submission_date < filter.date_from) return false
      if (filter.date_to && f.submission_date > filter.date_to) return false
      return true
    })
  }, [filter, paymentForms, companies])

  const grandTotal = filtered.reduce((s, f) => s + getFormTotal(f.id), 0)
  const totalPaid  = filtered.filter(f => f.status === 'paid').reduce((s, f) => s + getFormTotal(f.id), 0)

  const byBU = useMemo(() => {
    const map = {}
    filtered.forEach(f => {
      const c = companies.find(c => c.id === f.company_id)
      const bu = businessUnits.find(u => u.id === c?.business_unit_id)
      const key = bu?.id || 'other'
      if (!map[key]) map[key] = { code: bu?.code || '-', name: bu?.name || 'Lainnya', total: 0, count: 0, paid: 0 }
      const v = getFormTotal(f.id)
      map[key].total += v
      map[key].count++
      if (f.status === 'paid') map[key].paid += v
    })
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [filtered, companies, businessUnits, itemTotals])

  const byDept = useMemo(() => {
    const map = {}
    filtered.forEach(f => {
      const dept = departments.find(d => d.id === f.department_id)
      const key = dept?.id || 'other'
      if (!map[key]) map[key] = { code: dept?.code || '-', name: dept?.name || '-', total: 0, count: 0, paid: 0 }
      const v = getFormTotal(f.id)
      map[key].total += v
      map[key].count++
      if (f.status === 'paid') map[key].paid += v
    })
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [filtered, departments, itemTotals])

  const byCompany = useMemo(() => {
    const map = {}
    filtered.forEach(f => {
      const c = companies.find(c => c.id === f.company_id)
      const bu = businessUnits.find(u => u.id === c?.business_unit_id)
      const key = c?.id || 'other'
      if (!map[key]) map[key] = { code: c?.code || '-', name: c?.name || '-', buCode: bu?.code || '-', total: 0, count: 0, paid: 0 }
      const v = getFormTotal(f.id)
      map[key].total += v
      map[key].count++
      if (f.status === 'paid') map[key].paid += v
    })
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [filtered, companies, businessUnits, itemTotals])

  const byStatus = useMemo(() => {
    const map = {}
    filtered.forEach(f => {
      const s = f.status
      if (!map[s]) map[s] = { name: STATUS_LABELS[s] || s, total: 0, count: 0 }
      map[s].total += getFormTotal(f.id)
      map[s].count++
    })
    return Object.values(map)
  }, [filtered, itemTotals])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Memuat data laporan...</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan & Export</h1>
          <p className="text-sm text-gray-500">Rekap pembayaran berdasarkan filter yang dipilih</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><FileDown className="h-4 w-4 mr-1" /> Excel</Button>
          <Button variant="outline"><Download className="h-4 w-4 mr-1" /> CSV</Button>
        </div>
      </div>

      {/* Filter Panel */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-base">Filter Laporan</CardTitle>
              {hasFilter && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                  {filtered.length} dari {paymentForms.length} data
                </span>
              )}
            </div>
            {hasFilter && (
              <Button variant="ghost" size="sm" className="text-gray-500 h-8 gap-1" onClick={() => setFilter(EMPTY_FILTER)}>
                <X className="h-3.5 w-3.5" /> Reset
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500 font-medium">Bisnis Unit</Label>
              <Select value={filter.business_unit_id} onChange={e => setF('business_unit_id', e.target.value)}>
                <option value="">Semua Bisnis Unit</option>
                {businessUnits.filter(u => u.is_active).map(u => (
                  <option key={u.id} value={u.id}>{u.code} — {u.name}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500 font-medium">Perusahaan</Label>
              <Select value={filter.company_id} onChange={e => setF('company_id', e.target.value)}>
                <option value="">Semua Perusahaan</option>
                {filteredCompanies.map(c => (
                  <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500 font-medium">Departemen</Label>
              <Select value={filter.department_id} onChange={e => setF('department_id', e.target.value)}>
                <option value="">Semua Departemen</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.code} — {d.name}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500 font-medium">Vendor</Label>
              <Select value={filter.vendor_id} onChange={e => setF('vendor_id', e.target.value)}>
                <option value="">Semua Vendor</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500 font-medium">Status</Label>
              <Select value={filter.status} onChange={e => setF('status', e.target.value)}>
                <option value="">Semua Status</option>
                {Object.entries(STATUS_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500 font-medium">Rentang Tanggal</Label>
              <div className="flex gap-2 items-center">
                <Input type="date" value={filter.date_from} onChange={e => setF('date_from', e.target.value)} className="text-xs h-9" />
                <span className="text-gray-400 text-xs shrink-0">s/d</span>
                <Input type="date" value={filter.date_to} onChange={e => setF('date_to', e.target.value)} className="text-xs h-9" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Form',    value: filtered.length,                                      unit: 'form', color: 'text-blue-700',  bg: 'bg-blue-50'  },
          { label: 'Total Nilai',   value: formatRupiah(grandTotal),                             unit: null,   color: 'text-gray-900',  bg: 'bg-gray-50'  },
          { label: 'Sudah Dibayar', value: filtered.filter(f => f.status === 'paid').length,     unit: 'form', color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Total Dibayar', value: formatRupiah(totalPaid),                              unit: null,   color: 'text-green-700', bg: 'bg-green-50' },
        ].map(item => (
          <Card key={item.label} className={item.bg}>
            <CardContent className="p-4">
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className={`text-xl font-bold mt-1 ${item.color}`}>{item.value}</p>
              {item.unit && <p className="text-xs text-gray-400">{item.unit}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rekap per Bisnis Unit */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-500" /> Rekap per Bisnis Unit
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {byBU.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-6">Tidak ada data</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Kode</TableHead>
                  <TableHead>Bisnis Unit</TableHead>
                  <TableHead className="text-right">Form</TableHead>
                  <TableHead className="text-right">Total Nilai</TableHead>
                  <TableHead className="text-right">Dibayar</TableHead>
                  <TableHead className="text-right">% Bayar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byBU.map(u => (
                  <TableRow key={u.code}>
                    <TableCell className="pl-4">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{u.code}</span>
                    </TableCell>
                    <TableCell className="font-medium text-sm">{u.name}</TableCell>
                    <TableCell className="text-right text-sm">{u.count}</TableCell>
                    <TableCell className="text-right text-sm">{formatRupiah(u.total)}</TableCell>
                    <TableCell className="text-right text-sm text-green-700">{formatRupiah(u.paid)}</TableCell>
                    <TableCell className="text-right text-sm text-gray-500">
                      {u.total > 0 ? `${((u.paid / u.total) * 100).toFixed(0)}%` : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={2} className="pl-4 font-semibold">Total</TableCell>
                  <TableCell className="text-right font-semibold">{filtered.length}</TableCell>
                  <TableCell className="text-right font-semibold">{formatRupiah(grandTotal)}</TableCell>
                  <TableCell className="text-right font-semibold text-green-700">{formatRupiah(totalPaid)}</TableCell>
                  <TableCell className="text-right font-semibold text-gray-500">
                    {grandTotal > 0 ? `${((totalPaid / grandTotal) * 100).toFixed(0)}%` : '-'}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Rekap per Departemen */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-blue-500" /> Rekap per Departemen
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {byDept.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-6">Tidak ada data</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Kode</TableHead>
                    <TableHead>Departemen</TableHead>
                    <TableHead className="text-right">Form</TableHead>
                    <TableHead className="text-right">Total Nilai</TableHead>
                    <TableHead className="text-right">Dibayar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byDept.map(d => (
                    <TableRow key={d.code}>
                      <TableCell className="pl-4">
                        <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">{d.code}</span>
                      </TableCell>
                      <TableCell className="text-sm">{d.name}</TableCell>
                      <TableCell className="text-right text-sm">{d.count}</TableCell>
                      <TableCell className="text-right text-sm">{formatRupiah(d.total)}</TableCell>
                      <TableCell className="text-right text-sm text-green-700">{formatRupiah(d.paid)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={2} className="pl-4 font-semibold">Total</TableCell>
                    <TableCell className="text-right font-semibold">{filtered.length}</TableCell>
                    <TableCell className="text-right font-semibold">{formatRupiah(grandTotal)}</TableCell>
                    <TableCell className="text-right font-semibold text-green-700">{formatRupiah(totalPaid)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Rekap per Perusahaan */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Rekap per Perusahaan</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {byCompany.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-6">Tidak ada data</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">PT</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>BU</TableHead>
                    <TableHead className="text-right">Form</TableHead>
                    <TableHead className="text-right">Total Nilai</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byCompany.map(c => (
                    <TableRow key={c.code}>
                      <TableCell className="pl-4">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{c.code}</span>
                      </TableCell>
                      <TableCell className="text-sm truncate max-w-[140px]">{c.name}</TableCell>
                      <TableCell>
                        <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{c.buCode}</span>
                      </TableCell>
                      <TableCell className="text-right text-sm">{c.count}</TableCell>
                      <TableCell className="text-right text-sm">{formatRupiah(c.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3} className="pl-4 font-semibold">Total</TableCell>
                    <TableCell className="text-right font-semibold">{filtered.length}</TableCell>
                    <TableCell className="text-right font-semibold">{formatRupiah(grandTotal)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Rekap per Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Rekap per Status</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {byStatus.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-6">Tidak ada data</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Status</TableHead>
                  <TableHead className="text-right">Jumlah Form</TableHead>
                  <TableHead className="text-right">Total Nilai</TableHead>
                  <TableHead className="text-right">% dari Total Form</TableHead>
                  <TableHead className="text-right">% dari Total Nilai</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byStatus.map(s => (
                  <TableRow key={s.name}>
                    <TableCell className="pl-4 text-sm font-medium">{s.name}</TableCell>
                    <TableCell className="text-right text-sm">{s.count}</TableCell>
                    <TableCell className="text-right text-sm">{formatRupiah(s.total)}</TableCell>
                    <TableCell className="text-right text-sm text-gray-500">
                      {filtered.length > 0 ? `${((s.count / filtered.length) * 100).toFixed(1)}%` : '-'}
                    </TableCell>
                    <TableCell className="text-right text-sm text-gray-500">
                      {grandTotal > 0 ? `${((s.total / grandTotal) * 100).toFixed(1)}%` : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="pl-4 font-semibold">Total</TableCell>
                  <TableCell className="text-right font-semibold">{filtered.length}</TableCell>
                  <TableCell className="text-right font-semibold">{formatRupiah(grandTotal)}</TableCell>
                  <TableCell className="text-right font-semibold">100%</TableCell>
                  <TableCell className="text-right font-semibold">100%</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
