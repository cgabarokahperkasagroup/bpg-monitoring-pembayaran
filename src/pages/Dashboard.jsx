import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select } from '../components/ui/select'
import StatusBadge from '../components/StatusBadge'
import { useMasterData } from '../context/MasterDataContext'
import { getPaymentForms, getAllPaymentItemTotals } from '../services/paymentService'
import { useBusinessUnitFilter } from '../hooks/useBusinessUnitFilter'
import { formatRupiah } from '../lib/utils'
import {
  FileText, Clock, CheckCircle, Banknote, TrendingUp, AlertTriangle,
  ExternalLink, Layers, Filter, X,
} from 'lucide-react'

const PIE_COLORS = ['#1d4ed8', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe']
const EMPTY_FILTER = { business_unit_id: '', department_id: '', date_from: '', date_to: '', vendor_id: '' }

function KpiCard({ title, value, subtitle, icon: Icon, color }) {
  const bgMap = {
    'text-blue-700': 'bg-blue-100',
    'text-yellow-700': 'bg-yellow-100',
    'text-orange-700': 'bg-orange-100',
    'text-green-700': 'bg-green-100',
    'text-red-700': 'bg-red-100',
  }
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          </div>
          <div className={`rounded-xl p-3 ${bgMap[color] ?? 'bg-gray-100'}`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function getDayLabel(date) {
  return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}
function getMonthLabel(date) {
  return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

export default function Dashboard() {
  const { businessUnits, companies, departments, vendors } = useMasterData()
  const { applyFilters } = useBusinessUnitFilter()
  const [allForms, setAllForms] = useState([])
  const [itemTotals, setItemTotals] = useState({})
  const [loadingData, setLoadingData] = useState(true)

  // Filter sesuai role: staff=milik sendiri, finance/head=BU sendiri, lainnya=semua
  const paymentForms = applyFilters(allForms)

  useEffect(() => {
    async function load() {
      setLoadingData(true)
      try {
        const [forms, totals] = await Promise.all([getPaymentForms(), getAllPaymentItemTotals()])
        setAllForms(forms)
        setItemTotals(totals)
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingData(false)
      }
    }
    load()
  }, [])

  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)
  const thisMonth = todayStr.slice(0, 7)

  const [filter, setFilter] = useState(EMPTY_FILTER)
  const setF = (key, val) => setFilter(f => ({ ...f, [key]: val }))
  const hasFilter = Object.values(filter).some(Boolean)

  const getFormValue = (formId) => itemTotals[formId] || 0
  const getCompanyCode = (id) => companies.find(c => c.id === id)?.code || '-'
  const getDeptCode = (id) => departments.find(d => d.id === id)?.code || '-'

  const filteredForms = useMemo(() => {
    return paymentForms.filter(f => {
      if (filter.business_unit_id) {
        const c = companies.find(c => c.id === f.company_id)
        if (!c || c.business_unit_id !== filter.business_unit_id) return false
      }
      if (filter.department_id && f.department_id !== filter.department_id) return false
      if (filter.date_from && f.submission_date < filter.date_from) return false
      if (filter.date_to && f.submission_date > filter.date_to) return false
      if (filter.vendor_id && f.vendor_id !== filter.vendor_id) return false
      return true
    })
  }, [filter, paymentForms, companies])

  const hasDateFilter = !!(filter.date_from || filter.date_to)

  const paidPeriodLabel = useMemo(() => {
    if (filter.date_from && filter.date_to) {
      const from = new Date(filter.date_from).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      const to   = new Date(filter.date_to).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      return `${from} – ${to}`
    }
    if (filter.date_from) return `sejak ${new Date(filter.date_from).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
    if (filter.date_to)   return `s/d ${new Date(filter.date_to).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
    return getMonthLabel(now)
  }, [filter.date_from, filter.date_to])

  const stats = useMemo(() => {
    const todayForms = filteredForms.filter(f => f.submission_date === todayStr)
    const pending    = filteredForms.filter(f => f.status === 'submitted')
    const received   = filteredForms.filter(f => f.status === 'received')
    const rejected   = filteredForms.filter(f => f.status === 'rejected')
    const paid = hasDateFilter
      ? filteredForms.filter(f => f.status === 'paid')
      : filteredForms.filter(f => f.status === 'paid' && f.paid_at?.startsWith(thisMonth))
    const totalPending = [...pending, ...received].reduce((s, f) => s + getFormValue(f.id), 0)
    const totalPaid    = paid.reduce((s, f) => s + getFormValue(f.id), 0)
    return { todayCount: todayForms.length, pendingCount: pending.length, receivedCount: received.length, rejectedCount: rejected.length, paidCount: paid.length, totalPending, totalPaid }
  }, [filteredForms, todayStr, thisMonth, hasDateFilter, itemTotals])

  const deptChartData = useMemo(() => {
    const map = {}
    filteredForms.forEach(f => {
      const dept = departments.find(d => d.id === f.department_id)
      if (!dept) return
      if (!map[dept.id]) map[dept.id] = { name: dept.code, fullName: dept.name, count: 0 }
      map[dept.id].count++
    })
    return Object.values(map).sort((a, b) => b.count - a.count)
  }, [filteredForms, departments])

  const companyChartData = useMemo(() => {
    const total = filteredForms.length || 1
    const map = {}
    filteredForms.forEach(f => {
      const c = companies.find(c => c.id === f.company_id)
      if (!c) return
      if (!map[c.id]) map[c.id] = { name: c.code, count: 0 }
      map[c.id].count++
    })
    return Object.values(map).map((item, i) => ({
      ...item,
      value: Math.round((item.count / total) * 100),
      fill: PIE_COLORS[i % PIE_COLORS.length],
    }))
  }, [filteredForms, companies])

  const topVendorsData = useMemo(() => {
    const map = {}
    filteredForms.forEach(f => {
      const name = f.vendor_name_raw || vendors.find(v => v.id === f.vendor_id)?.name
      if (!name) return
      if (!map[name]) map[name] = { name, total: 0, count: 0 }
      map[name].total += getFormValue(f.id)
      map[name].count++
    })
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 5)
  }, [filteredForms, vendors, itemTotals])

  // Monthly trend dari data real (6 bulan terakhir)
  const monthlyTrend = useMemo(() => {
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = d.toISOString().slice(0, 7)
      const label = d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
      const value = paymentForms
        .filter(f => f.status === 'paid' && f.paid_at?.startsWith(key))
        .reduce((s, f) => s + getFormValue(f.id), 0)
      months.push({ month: label, value })
    }
    return months
  }, [paymentForms, itemTotals])

  const recentForms = [...filteredForms].slice(0, 6)
  const getVendorName = (form) => form.vendor_name_raw || vendors.find(v => v.id === form.vendor_id)?.name || '-'

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Memuat data dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">{getDayLabel(now)} • Barokah Perkasa Group</p>
      </div>

      {/* Filter Panel */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-base">Filter Data</CardTitle>
              {hasFilter && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                  {filteredForms.length} dari {paymentForms.length} data
                </span>
              )}
            </div>
            {hasFilter && (
              <Button variant="ghost" size="sm" className="text-gray-500 h-8 gap-1" onClick={() => setFilter(EMPTY_FILTER)}>
                <X className="h-3.5 w-3.5" /> Reset Filter
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <KpiCard title="Pengajuan Hari Ini"       value={stats.todayCount}                 subtitle={todayStr}                               icon={FileText}      color="text-blue-700" />
        <KpiCard title="Menunggu Konfirmasi"      value={stats.pendingCount}               subtitle="status Diajukan"                        icon={Clock}         color="text-yellow-700" />
        <KpiCard title="Diterima Finance"         value={stats.receivedCount}              subtitle="belum dibayar"                          icon={CheckCircle}   color="text-orange-700" />
        <KpiCard title={hasDateFilter ? `Dibayar — ${paidPeriodLabel}` : 'Dibayar'} value={stats.paidCount} subtitle={`${stats.rejectedCount} ditolak`} icon={Banknote} color="text-green-700" />
        <KpiCard title="Total Nilai Pending"      value={formatRupiah(stats.totalPending)} subtitle="menunggu pembayaran"                    icon={AlertTriangle} color="text-yellow-700" />
        <KpiCard title={hasDateFilter ? `Total Dibayar — ${paidPeriodLabel}` : 'Total Dibayar'} value={formatRupiah(stats.totalPaid)} subtitle="dari data terfilter" icon={TrendingUp} color="text-green-700" />
      </div>

      {/* Bisnis Unit Overview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-600" />
            <CardTitle className="text-base">Bisnis Unit Aktif</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {businessUnits.filter(u => u.is_active).map(u => {
              const ptCount = companies.filter(c => c.business_unit_id === u.id).length
              const fCount = filteredForms.filter(f =>
                companies.find(c => c.id === f.company_id && c.business_unit_id === u.id)
              ).length
              const isActive = filter.business_unit_id === u.id
              return (
                <button
                  key={u.id}
                  onClick={() => setF('business_unit_id', isActive ? '' : u.id)}
                  className={`rounded-lg border p-3 text-left transition-colors w-full ${
                    isActive
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-gray-50 hover:bg-blue-50 hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${isActive ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700'}`}>
                      {u.code}
                    </span>
                    {ptCount > 0 && <span className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-400'}`}>{ptCount} PT</span>}
                  </div>
                  <p className={`text-sm font-medium leading-tight ${isActive ? 'text-white' : 'text-gray-800'}`}>{u.name}</p>
                  <p className={`text-xs mt-1 ${isActive ? 'text-blue-100' : 'text-gray-400'}`}>
                    {fCount > 0 ? `${fCount} pengajuan` : 'Belum ada data'}
                  </p>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pengajuan per Departemen</CardTitle>
          </CardHeader>
          <CardContent>
            {deptChartData.length === 0 ? (
              <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">Tidak ada data</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={deptChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    formatter={(v) => [v, 'Jumlah']}
                    labelFormatter={(label) => {
                      const d = deptChartData.find(x => x.name === label)
                      return d ? `${d.fullName} (${d.name})` : label
                    }}
                  />
                  <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Distribusi per Perusahaan</CardTitle>
          </CardHeader>
          <CardContent>
            {companyChartData.length === 0 ? (
              <div className="flex items-center justify-center h-[200px] text-gray-400 text-sm">Tidak ada data</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={companyChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}
                      label={({ name, value }) => `${name} ${value}%`} labelLine={false}>
                      {companyChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v}%`, 'Porsi']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 text-xs mt-1">
                  {companyChartData.map(item => (
                    <div key={item.name} className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Line Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Tren Nilai Pembayaran (6 Bulan Terakhir)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`} />
              <Tooltip formatter={(v) => [formatRupiah(v), 'Total Nilai']} />
              <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Forms */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              Pengajuan Terbaru
              {hasFilter && <span className="ml-2 text-xs text-gray-400 font-normal">({filteredForms.length} data)</span>}
            </CardTitle>
            <Link to="/pengajuan">
              <Button variant="ghost" size="sm" className="text-blue-600 h-8">
                <ExternalLink className="h-3.5 w-3.5 mr-1" /> Lihat Semua
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentForms.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">Tidak ada data sesuai filter</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Kode Form</TableHead>
                    <TableHead>PT / Dept</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentForms.map(form => (
                    <TableRow key={form.id}>
                      <TableCell className="pl-4">
                        <Link to={`/pengajuan/${form.id}`} className="text-blue-600 hover:underline font-mono text-xs">
                          {form.form_code}
                        </Link>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">
                        <span className="font-semibold text-gray-700">{getCompanyCode(form.company_id)}</span>
                        {' / '}{getDeptCode(form.department_id)}
                      </TableCell>
                      <TableCell><StatusBadge status={form.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Top Vendors */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Top 5 Vendor (Total Nilai)</CardTitle>
          </CardHeader>
          <CardContent>
            {topVendorsData.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">Tidak ada data sesuai filter</p>
            ) : (
              <div className="space-y-3">
                {topVendorsData.map((v, i) => (
                  <div key={v.name} className="flex items-center gap-3">
                    <span className="text-sm font-bold text-blue-700 w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{v.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="h-1.5 rounded-full bg-blue-100 flex-1">
                          <div
                            className="h-1.5 rounded-full bg-blue-600"
                            style={{ width: `${(v.total / topVendorsData[0].total) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{formatRupiah(v.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
