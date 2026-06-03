import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import StatusBadge from '../components/StatusBadge'
import { paymentForms, vendors, companies, departments, paymentItems } from '../data/mockData'
import { formatRupiah, formatDate } from '../lib/utils'
import { useAuth } from '../context/AuthContext'
import {
  Search, Plus, Download, Eye, Pencil, ChevronLeft, ChevronRight,
  Filter, FileDown,
} from 'lucide-react'

function getFormTotal(formId) {
  const items = Object.values(paymentItems).flat().filter(i => i.form_id === formId)
  return items.reduce((s, i) => s + i.total, 0)
}

export default function DaftarPengajuan() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [filterCompany, setFilterCompany] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [pageSize, setPageSize] = useState(25)
  const [page, setPage] = useState(1)

  const getVendorName = (form) => {
    if (form.vendor_name_raw) return form.vendor_name_raw
    return vendors.find(v => v.id === form.vendor_id)?.name || '-'
  }

  const filtered = useMemo(() => {
    return paymentForms.filter(f => {
      const vendorName = getVendorName(f).toLowerCase()
      const code = f.form_code.toLowerCase()
      const q = search.toLowerCase()
      if (q && !vendorName.includes(q) && !code.includes(q)) return false
      if (filterCompany && f.company_id !== filterCompany) return false
      if (filterStatus && f.status !== filterStatus) return false
      if (filterDateFrom && f.submission_date < filterDateFrom) return false
      if (filterDateTo && f.submission_date > filterDateTo) return false
      return true
    })
  }, [search, filterCompany, filterStatus, filterDateFrom, filterDateTo])

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const canCreate = ['admin', 'staff'].includes(currentUser?.role)

  const statuses = [
    { value: 'draft', label: 'Draft' },
    { value: 'submitted', label: 'Diajukan' },
    { value: 'received', label: 'Diterima Finance' },
    { value: 'paid', label: 'Dibayar' },
    { value: 'rejected', label: 'Dikembalikan' },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Pengajuan</h1>
          <p className="text-sm text-gray-500">{filtered.length} form pengajuan ditemukan</p>
        </div>
        {canCreate && (
          <Button onClick={() => navigate('/pengajuan/baru')}>
            <Plus className="h-4 w-4 mr-2" />
            Buat Pengajuan
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari kode form, vendor..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                className="pl-9"
              />
            </div>
            <div className="min-w-[160px]">
              <Select value={filterCompany} onChange={e => { setFilterCompany(e.target.value); setPage(1) }}>
                <option value="">Semua Perusahaan</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
              </Select>
            </div>
            <div className="min-w-[160px]">
              <Select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}>
                <option value="">Semua Status</option>
                {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </Select>
            </div>
            <Input
              type="date"
              value={filterDateFrom}
              onChange={e => { setFilterDateFrom(e.target.value); setPage(1) }}
              className="w-36"
              title="Dari Tanggal"
            />
            <Input
              type="date"
              value={filterDateTo}
              onChange={e => { setFilterDateTo(e.target.value); setPage(1) }}
              className="w-36"
              title="Sampai Tanggal"
            />
            <Button
              variant="outline"
              onClick={() => { setSearch(''); setFilterCompany(''); setFilterStatus(''); setFilterDateFrom(''); setFilterDateTo(''); setPage(1) }}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Tampilkan:</span>
            <Select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}
              className="w-20"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => alert('Export Excel (akan diimplementasikan saat integrasi database)')}>
              <FileDown className="h-4 w-4 mr-1" /> Excel
            </Button>
            <Button variant="outline" size="sm" onClick={() => alert('Export CSV (akan diimplementasikan saat integrasi database)')}>
              <Download className="h-4 w-4 mr-1" /> CSV
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Kode Form</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Perusahaan</TableHead>
              <TableHead>Departemen</TableHead>
              <TableHead>PIC</TableHead>
              <TableHead className="text-right">Total Nilai</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-gray-400">
                  Tidak ada data pengajuan yang sesuai filter
                </TableCell>
              </TableRow>
            ) : paginated.map(form => {
              const company = companies.find(c => c.id === form.company_id)
              const dept = departments.find(d => d.id === form.department_id)
              const total = getFormTotal(form.id)
              const canEdit = (currentUser?.role === 'staff' && ['draft', 'rejected'].includes(form.status) && form.created_by === currentUser?.id)
                || currentUser?.role === 'admin'

              return (
                <TableRow key={form.id}>
                  <TableCell className="pl-4">
                    <Link to={`/pengajuan/${form.id}`} className="text-blue-600 hover:underline font-mono text-xs font-medium">
                      {form.form_code}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">{formatDate(form.submission_date)}</TableCell>
                  <TableCell className="text-sm max-w-[180px]">
                    <span className="block truncate">{getVendorName(form)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                      {company?.code}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{dept?.name || '-'}</TableCell>
                  <TableCell className="text-sm">{form.pic_name}</TableCell>
                  <TableCell className="text-right text-sm font-medium whitespace-nowrap">
                    {total > 0 ? formatRupiah(total) : '-'}
                  </TableCell>
                  <TableCell><StatusBadge status={form.status} /></TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Link to={`/pengajuan/${form.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      {canEdit && (
                        <Link to={`/pengajuan/${form.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-gray-500">
              Halaman {page} dari {totalPages} ({filtered.length} total)
            </p>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
                return (
                  <Button
                    key={p}
                    variant={page === p ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPage(p)}
                    className="w-8"
                  >
                    {p}
                  </Button>
                )
              })}
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
