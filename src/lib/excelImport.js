import ExcelJS from 'exceljs'

// Kolom template import (urutan = urutan kolom di Excel)
export const IMPORT_COLUMNS = [
  { key: 'grup',            header: 'Grup',             width: 8,  note: 'Penanda grup: baris dgn Grup sama digabung jadi 1 pengajuan' },
  { key: 'tanggal',         header: 'Tanggal Pengajuan', width: 16, note: 'Format YYYY-MM-DD, mis. 2026-06-01 (wajib)' },
  { key: 'tanggal_invoice', header: 'Tanggal Invoice',  width: 16, note: 'Format YYYY-MM-DD (opsional)' },
  { key: 'perusahaan',      header: 'Perusahaan',       width: 28, note: 'Nama perusahaan persis seperti di sheet Referensi (wajib)' },
  { key: 'departemen',      header: 'Departemen',       width: 18, note: 'Nama departemen seperti di Referensi (wajib)' },
  { key: 'pic',             header: 'PIC',              width: 18, note: 'Nama PIC yang mengajukan (opsional)' },
  { key: 'vendor',          header: 'Vendor',           width: 26, note: 'Nama vendor; jika tak ada di master, disimpan sebagai teks' },
  { key: 'uraian',          header: 'Uraian',           width: 32, note: 'Uraian pekerjaan/barang (wajib, per item)' },
  { key: 'qty',             header: 'Qty',              width: 8,  note: 'Jumlah (angka, wajib)' },
  { key: 'harga',           header: 'Harga Satuan',     width: 16, note: 'Harga per unit dalam Rupiah (angka, wajib)' },
  { key: 'kapal',           header: 'Kapal',            width: 24, note: 'Nama kapal seperti di Referensi (opsional)' },
  { key: 'budget',          header: 'Kode Budget',      width: 28, note: 'Kode atau deskripsi budget seperti di Referensi (opsional)' },
  { key: 'no_invoice',      header: 'No Invoice',       width: 16, note: 'Nomor invoice vendor (opsional)' },
  { key: 'keterangan',      header: 'Keterangan',       width: 24, note: 'Catatan tambahan (opsional)' },
]

const HEADER_BY_KEY = Object.fromEntries(IMPORT_COLUMNS.map(c => [c.key, c.header]))

// Buat & unduh template Excel berisi sheet Data + Referensi
export async function downloadTemplate({ companies, departments, budgetCodes, vessels, vendors }) {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Monitoring Pembayaran'

  // --- Sheet 1: Data Pengajuan ---
  const ws = wb.addWorksheet('Data Pengajuan')
  ws.columns = IMPORT_COLUMNS.map(c => ({ header: c.header, key: c.key, width: c.width }))
  const headerRow = ws.getRow(1)
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } }
  headerRow.alignment = { vertical: 'middle' }
  headerRow.height = 20

  // Contoh data (2 grup: grup 1 = 2 item, grup 2 = 1 item)
  const c0 = companies[0]?.name || 'Nama Perusahaan'
  const c1 = companies[1]?.name || c0
  const d0 = departments[0]?.name || 'Nama Departemen'
  const b0 = budgetCodes[0] ? `${budgetCodes[0].code} — ${budgetCodes[0].description}` : ''
  const v0 = vessels[0]?.name || ''
  const vd0 = vendors[0]?.name || 'Nama Vendor'
  ws.addRow({ grup: 1, tanggal: '2026-06-01', perusahaan: c0, departemen: d0, pic: 'Budi Santoso', vendor: vd0, uraian: 'Perbaikan mesin kapal', qty: 1, harga: 5000000, kapal: v0, budget: b0, no_invoice: 'INV-001' })
  ws.addRow({ grup: 1, uraian: 'Pembelian suku cadang', qty: 2, harga: 750000, budget: b0 })
  ws.addRow({ grup: 2, tanggal: '2026-06-02', perusahaan: c1, departemen: d0, pic: 'Andi Kurniawan', vendor: vd0, uraian: 'Jasa logistik pengiriman', qty: 1, harga: 3000000 })

  // --- Sheet 2: Petunjuk kolom ---
  const wsHelp = wb.addWorksheet('Petunjuk')
  wsHelp.columns = [{ header: 'Kolom', key: 'col', width: 20 }, { header: 'Keterangan', key: 'desc', width: 70 }]
  wsHelp.getRow(1).font = { bold: true }
  IMPORT_COLUMNS.forEach(c => wsHelp.addRow({ col: c.header, desc: c.note }))
  wsHelp.addRow({ col: '', desc: '' })
  wsHelp.addRow({ col: 'Catatan', desc: 'Untuk pengajuan multi-item: isi kolom header (Tanggal, Perusahaan, Departemen, PIC, Vendor) cukup di baris pertama tiap Grup. Status semua data hasil impor = Menunggu Konfirmasi Finance.' })

  // --- Sheet 3: Referensi (nilai valid) ---
  const wsRef = wb.addWorksheet('Referensi')
  wsRef.columns = [
    { header: 'Perusahaan', key: 'comp', width: 30 },
    { header: 'Departemen', key: 'dept', width: 22 },
    { header: 'Kode Budget', key: 'bud', width: 38 },
    { header: 'Kapal', key: 'ves', width: 28 },
  ]
  wsRef.getRow(1).font = { bold: true }
  const maxLen = Math.max(companies.length, departments.length, budgetCodes.length, vessels.length)
  for (let i = 0; i < maxLen; i++) {
    wsRef.addRow({
      comp: companies[i]?.name || '',
      dept: departments[i]?.name || '',
      bud:  budgetCodes[i] ? `${budgetCodes[i].code} — ${budgetCodes[i].description}` : '',
      ves:  vessels[i]?.name || '',
    })
  }

  const buf = await wb.xlsx.writeBuffer()
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'template-import-pengajuan.xlsx'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Ubah nilai sel jadi string rapi (tangani Date, angka, rich text)
function cellText(v) {
  if (v == null) return ''
  if (v instanceof Date) {
    const y = v.getFullYear()
    const m = String(v.getMonth() + 1).padStart(2, '0')
    const d = String(v.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  if (typeof v === 'object') {
    if (v.text) return String(v.text)
    if (v.result != null) return String(v.result)
    if (Array.isArray(v.richText)) return v.richText.map(t => t.text).join('')
    return ''
  }
  return String(v)
}

// Baca file Excel → array objek baris (key sesuai IMPORT_COLUMNS), plus nomor baris asli
export async function parseExcelFile(file) {
  const wb = new ExcelJS.Workbook()
  const buffer = await file.arrayBuffer()
  await wb.xlsx.load(buffer)
  const ws = wb.getWorksheet('Data Pengajuan') || wb.worksheets[0]
  if (!ws) throw new Error('Sheet data tidak ditemukan')

  // Petakan posisi kolom dari baris header (fleksibel terhadap urutan)
  const headerRow = ws.getRow(1)
  const colIndexByKey = {}
  headerRow.eachCell((cell, colNumber) => {
    const text = cellText(cell.value).trim().toLowerCase()
    const match = IMPORT_COLUMNS.find(c => c.header.toLowerCase() === text)
    if (match) colIndexByKey[match.key] = colNumber
  })

  const rows = []
  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return // header
    const obj = { __row: rowNumber }
    let hasAny = false
    for (const c of IMPORT_COLUMNS) {
      const idx = colIndexByKey[c.key]
      const val = idx ? cellText(row.getCell(idx).value).trim() : ''
      obj[c.key] = val
      if (val) hasAny = true
    }
    if (hasAny) rows.push(obj)
  })
  return rows
}

export { HEADER_BY_KEY }
