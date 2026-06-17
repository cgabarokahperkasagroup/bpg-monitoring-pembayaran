import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Badge } from '../../components/ui/badge'
import { useMasterData } from '../../context/MasterDataContext'
import { syncVesselsFromApi } from '../../services/masterService'
import { RefreshCw, Search, AlertCircle } from 'lucide-react'

export default function MasterKapal() {
  const { vessels, companies, reload } = useMasterData()
  const [search, setSearch] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState(null)
  const [lastResult, setLastResult] = useState(null)
  const didAutoSync = useRef(false)

  const runSync = async () => {
    setSyncing(true)
    setError(null)
    try {
      const result = await syncVesselsFromApi()
      setLastResult(result)
      await reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setSyncing(false)
    }
  }

  // Auto-sinkron sekali setiap halaman dibuka (API = sumber kebenaran)
  useEffect(() => {
    if (didAutoSync.current) return
    didAutoSync.current = true
    runSync()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = vessels.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    (v.code || '').toLowerCase().includes(search.toLowerCase()) ||
    (v.pic || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Kapal</h1>
          <p className="text-sm text-gray-500">
            {vessels.length} kapal &middot; data dari API SMS Barokah Marine
          </p>
        </div>
        <Button onClick={runSync} disabled={syncing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Menyinkronkan...' : 'Sinkron dari API'}
        </Button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>Gagal sinkron dari API: {error}</span>
        </div>
      )}

      {lastResult && !error && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
          Sinkron berhasil: {lastResult.total} kapal diperbarui
          {lastResult.deleted ? `, ${lastResult.deleted} dihapus` : ''}
          {lastResult.deactivated ? `, ${lastResult.deactivated} dinonaktifkan` : ''}
          {lastResult.unmapped_company ? ` · ${lastResult.unmapped_company} kapal tanpa perusahaan terpetakan` : ''}
        </div>
      )}

      <Card><CardContent className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input placeholder="Cari nama, tipe, atau PIC kapal..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </CardContent></Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Nama Kapal</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Perusahaan</TableHead>
              <TableHead>Fleet</TableHead>
              <TableHead>PIC</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-gray-400">
                  {syncing ? 'Memuat data kapal dari API...' : 'Tidak ada kapal ditemukan'}
                </TableCell>
              </TableRow>
            ) : filtered.map(v => {
              const comp = companies.find(c => c.id === v.company_id)
              return (
                <TableRow key={v.id} className={!v.is_active ? 'opacity-50' : ''}>
                  <TableCell className="pl-4 font-medium">{v.name}</TableCell>
                  <TableCell>
                    {v.code ? <span className="font-mono text-sm text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{v.code}</span> : <span className="text-gray-400">—</span>}
                    {v.ship_type && <span className="ml-2 text-xs text-gray-500">{v.ship_type}</span>}
                  </TableCell>
                  <TableCell>
                    {comp ? <span className="text-xs font-semibold bg-gray-100 px-2 py-0.5 rounded">{comp.code}</span> : <span className="text-gray-400">—</span>}
                  </TableCell>
                  <TableCell>{v.fleet ? `Fleet ${v.fleet}` : '—'}</TableCell>
                  <TableCell className="text-sm text-gray-600">{v.pic || '—'}</TableCell>
                  <TableCell>
                    <Badge variant={v.is_active ? 'paid' : 'draft'}>{v.is_active ? 'Aktif' : 'Nonaktif'}</Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
