import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Textarea } from '../components/ui/textarea'
import { Label } from '../components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Dialog, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../components/ui/dialog'
import { AlertDialog } from '../components/ui/alert-dialog'
import StatusBadge from '../components/StatusBadge'
import { useMasterData } from '../context/MasterDataContext'
import {
  getPaymentFormById, getPaymentItems, getAttachments,
  getAuditLogs, updateFormStatus,
} from '../services/paymentService'
import { formatRupiah, formatDate, formatDateTime } from '../lib/utils'
import { useAuth } from '../context/AuthContext'
import {
  ChevronLeft, Pencil, CheckCircle, Banknote, RotateCcw, Send, FileText, Download,
  AlertTriangle,
} from 'lucide-react'

export default function DetailPengajuan() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { vendors, companies, departments } = useMasterData()

  const [form, setForm] = useState(null)
  const [items, setItems] = useState([])
  const [atts, setAtts] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const [actionModal, setActionModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [formData, itemsData, attsData, logsData] = await Promise.all([
          getPaymentFormById(id),
          getPaymentItems(id),
          getAttachments(id),
          getAuditLogs(id),
        ])
        setForm(formData)
        setItems(itemsData)
        setAtts(attsData)
        setLogs(logsData)
      } catch (err) {
        console.error(err)
        setForm(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Memuat detail pengajuan...</p>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Form pengajuan tidak ditemukan.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/pengajuan')}>Kembali</Button>
      </div>
    )
  }

  const vendor = vendors.find(v => v.id === form.vendor_id)
  const company = companies.find(c => c.id === form.company_id)
  const dept = departments.find(d => d.id === form.department_id)
  const grandTotal = items.reduce((s, i) => s + i.total, 0)

  const role = currentUser?.role
  const isOwner = form.created_by === currentUser?.id || role === 'admin'

  const canEdit = role === 'admin' || (role === 'staff' && ['draft', 'rejected'].includes(form.status) && isOwner)
  const canSubmit = (role === 'admin' || (role === 'staff' && isOwner)) && form.status === 'draft'
  const canReceive = (role === 'finance' || role === 'admin') && form.status === 'submitted'
  const canPay = (role === 'finance' || role === 'admin') && form.status === 'received'
  const canReject = (role === 'finance' || role === 'admin') && ['submitted', 'received'].includes(form.status)

  const handleAction = async (action) => {
    if (action === 'reject' && !rejectReason.trim()) {
      alert('Harap isi alasan pengembalian')
      return
    }
    setProcessing(true)
    try {
      const statusMap = { submit: 'submitted', receive: 'received', pay: 'paid', reject: 'rejected' }
      const newStatus = statusMap[action]
      const updated = await updateFormStatus(id, newStatus, currentUser.id, {
        rejection_reason: action === 'reject' ? rejectReason : undefined,
      })
      setForm(updated)
      // Reload logs
      const logsData = await getAuditLogs(id)
      setLogs(logsData)
      setActionModal(null)
      setRejectReason('')
      const messages = {
        submit: 'Form berhasil diajukan ke Finance!',
        receive: 'Dokumen berhasil dikonfirmasi diterima!',
        pay: 'Form berhasil ditandai sudah dibayar!',
        reject: 'Form berhasil dikembalikan ke pengaju.',
      }
      alert(messages[action])
    } catch (err) {
      alert('Gagal: ' + err.message)
    } finally {
      setProcessing(false)
    }
  }

  const getActorName = (log) => log.user_profiles?.full_name || '-'

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/pengajuan')}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Kembali
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold font-mono text-blue-700">{form.form_code}</h1>
              <StatusBadge status={form.status} />
            </div>
            <p className="text-sm text-gray-500 mt-0.5">Detail Form Pengajuan Pembayaran</p>
          </div>
        </div>
        {canEdit && (
          <Link to={`/pengajuan/${id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-1" /> Edit Form
            </Button>
          </Link>
        )}
      </div>

      {/* Rejection Notice */}
      {form.status === 'rejected' && form.rejection_reason && (
        <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-4">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-700">Form Dikembalikan oleh Finance</p>
            <p className="text-sm text-red-600 mt-1">{form.rejection_reason}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Form Info */}
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Informasi Pengajuan</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Perusahaan</p>
                <p className="font-semibold">{company?.code} — {company?.name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Departemen</p>
                <p className="font-semibold">{dept?.name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Vendor</p>
                <p className="font-semibold">{form.vendor_name_raw || vendor?.name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">PIC</p>
                <p className="font-semibold">{form.pic_name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Tgl Pembuatan</p>
                <p>{formatDate(form.submission_date)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Tgl Invoice</p>
                <p>{formatDate(form.invoice_date) || '—'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Items Table */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Item Pengajuan ({items.length} item)</CardTitle>
              <span className="text-sm font-bold text-blue-700">Total: {formatRupiah(grandTotal)}</span>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-4 w-8">#</TableHead>
                      <TableHead>Uraian</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Harga Satuan</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Kapal</TableHead>
                      <TableHead>No. Invoice</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="pl-4 text-gray-400 text-xs">{item.item_number}</TableCell>
                        <TableCell className="max-w-[200px]">
                          <p className="text-sm">{item.description}</p>
                          {item.notes && <p className="text-xs text-gray-400 mt-0.5">{item.notes}</p>}
                        </TableCell>
                        <TableCell className="text-right text-sm">{item.qty}</TableCell>
                        <TableCell className="text-right text-sm">{formatRupiah(item.unit_price)}</TableCell>
                        <TableCell className="text-right text-sm font-semibold">{formatRupiah(item.total)}</TableCell>
                        <TableCell className="text-sm">{item.fleet ? `Fleet ${item.fleet}` : '-'}</TableCell>
                        <TableCell className="text-xs text-gray-500">{item.invoice_number || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Lampiran Invoice</CardTitle>
                {atts.length === 0 && (
                  <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 border border-orange-200 px-2 py-1 rounded">
                    <AlertTriangle className="h-3 w-3" /> Belum ada lampiran
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {atts.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Tidak ada lampiran untuk form ini</p>
              ) : (
                <div className="space-y-2">
                  {atts.map(att => (
                    <div key={att.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50">
                      <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{att.original_name}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                          {att.label && <span className="text-blue-600 font-medium">📎 {att.label}</span>}
                          <span>{(att.file_size_bytes / 1024).toFixed(0)} KB</span>
                          <span>{formatDate(att.created_at)}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4 mr-1" /> Unduh
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Timeline + Actions */}
        <div className="space-y-5">
          {(canSubmit || canReceive || canPay || canReject) && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-blue-800">Aksi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {canSubmit && (
                  <Button className="w-full" onClick={() => setActionModal('submit')}>
                    <Send className="h-4 w-4 mr-2" /> Ajukan ke Finance
                  </Button>
                )}
                {canReceive && (
                  <Button className="w-full bg-yellow-600 hover:bg-yellow-700" onClick={() => setActionModal('receive')}>
                    <CheckCircle className="h-4 w-4 mr-2" /> Konfirmasi Dokumen Diterima
                  </Button>
                )}
                {canPay && (
                  <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => setActionModal('pay')}>
                    <Banknote className="h-4 w-4 mr-2" /> Tandai Sudah Dibayar
                  </Button>
                )}
                {canReject && (
                  <Button variant="outline" className="w-full text-red-600 border-red-300 hover:bg-red-50" onClick={() => setActionModal('reject')}>
                    <RotateCcw className="h-4 w-4 mr-2" /> Kembalikan ke Pengaju
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Riwayat Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-3.5 top-0 bottom-0 w-px bg-gray-200" />
                <div className="space-y-4">
                  {logs.map((log) => (
                    <div key={log.id} className="relative flex gap-3 pl-8">
                      <div className="absolute left-0 top-0.5 w-7 h-7 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {log.from_status ? `${log.from_status} → ${log.to_status}` : log.to_status}
                        </p>
                        {log.notes && <p className="text-xs text-red-600 mt-0.5">{log.notes}</p>}
                        <p className="text-xs text-gray-400 mt-0.5">{getActorName(log)} • {formatDateTime(log.created_at)}</p>
                      </div>
                    </div>
                  ))}
                  <div className="relative flex gap-3 pl-8">
                    <div className="absolute left-0 top-0.5 w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-700">Status saat ini: <span className="uppercase">{form.status}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Dialogs */}
      <AlertDialog
        open={actionModal === 'submit'}
        title="Ajukan ke Finance?"
        description="Form ini akan dikirim ke Finance untuk diproses. Anda tidak dapat mengedit form setelah diajukan."
        confirmLabel="Ya, Ajukan"
        onConfirm={() => handleAction('submit')}
        onCancel={() => setActionModal(null)}
      />
      <AlertDialog
        open={actionModal === 'receive'}
        title="Konfirmasi Dokumen Diterima?"
        description="Konfirmasi bahwa dokumen fisik sudah diterima dan sesuai."
        confirmLabel="Konfirmasi Diterima"
        onConfirm={() => handleAction('receive')}
        onCancel={() => setActionModal(null)}
      />
      <AlertDialog
        open={actionModal === 'pay'}
        title="Tandai Sudah Dibayar?"
        description="Konfirmasi bahwa pembayaran untuk form ini sudah dilakukan."
        confirmLabel="Tandai Dibayar"
        onConfirm={() => handleAction('pay')}
        onCancel={() => setActionModal(null)}
      />

      <Dialog open={actionModal === 'reject'} onClose={() => setActionModal(null)} className="max-w-md">
        <DialogClose onClose={() => setActionModal(null)} />
        <DialogHeader>
          <DialogTitle>Kembalikan ke Pengaju</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">Harap isi alasan pengembalian agar pengaju dapat memperbaiki form.</p>
        </DialogHeader>
        <div className="space-y-2 mt-2">
          <Label>Alasan Pengembalian <span className="text-red-500">*</span></Label>
          <Textarea
            placeholder="Contoh: Invoice tidak lengkap, mohon lampirkan dokumen pendukung..."
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setActionModal(null)}>Batal</Button>
          <Button variant="destructive" onClick={() => handleAction('reject')} disabled={!rejectReason.trim() || processing}>
            {processing ? 'Memproses...' : 'Kembalikan'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
