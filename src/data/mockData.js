export const businessUnits = [
  { id: 'bu1', name: 'Shipping',              code: 'SHP', is_active: true },
  { id: 'bu2', name: 'Shipyard',              code: 'SYD', is_active: true },
  { id: 'bu3', name: 'Shorebase',             code: 'SBS', is_active: true },
  { id: 'bu4', name: 'Tank Storage Terminal', code: 'TST', is_active: true },
  { id: 'bu5', name: 'Supply Chain',          code: 'SCH', is_active: true },
  { id: 'bu6', name: 'Fuel Retail',           code: 'FRT', is_active: true },
  { id: 'bu7', name: 'Agro',                  code: 'AGR', is_active: true },
  { id: 'bu8', name: 'Gas',                   code: 'GAS', is_active: true },
]

export const companies = [
  { id: 'c1', name: 'Barokah Gemilang Perkasa',       code: 'BGP', business_unit_id: 'bu1', is_active: true },
  { id: 'c2', name: 'Armada Samudra Global',           code: 'ASG', business_unit_id: 'bu1', is_active: true },
  { id: 'c3', name: 'Bahtera Nusantara Internasional', code: 'BNI', business_unit_id: 'bu1', is_active: true },
]

export const vessels = [
  { id: 'v1', name: 'TB. BB 99', code: 'BB99', company_id: 'c1', fleet: 'I', is_active: true },
  { id: 'v2', name: 'TB. ELNU 01', code: 'ELNU', company_id: 'c1', fleet: 'II', is_active: true },
  { id: 'v3', name: 'TB. BAROKAH 03', code: 'BRK3', company_id: 'c2', fleet: 'III', is_active: true },
  { id: 'v4', name: 'KM. NUSANTARA 07', code: 'NUS7', company_id: 'c3', fleet: 'IV', is_active: true },
  { id: 'v5', name: 'TB. SAMUDRA 12', code: 'SMD2', company_id: 'c2', fleet: 'I', is_active: true },
  { id: 'v6', name: 'TB. GEMILANG 05', code: 'GML5', company_id: 'c1', fleet: 'V', is_active: true },
  { id: 'v7', name: 'KM. BAHTERA 09', code: 'BTR9', company_id: 'c3', fleet: 'II', is_active: true },
  { id: 'v8', name: 'TB. ARMADA 15', code: 'ARM5', company_id: 'c2', fleet: 'VI', is_active: false },
  { id: 'v9', name: 'TB. PERKASA 21', code: 'PRK1', company_id: 'c1', fleet: 'VII', is_active: true },
  { id: 'v10', name: 'KM. INTERNASIONAL 04', code: 'INT4', company_id: 'c3', fleet: 'III', is_active: true },
]

export const departments = [
  { id: 'd1',  name: 'Operasional',  code: 'OPR' },
  { id: 'd2',  name: 'Teknik',       code: 'TKN' },
  { id: 'd3',  name: 'Keuangan',     code: 'KEU' },
  { id: 'd4',  name: 'Administrasi', code: 'ADM' },
  { id: 'd5',  name: 'Crewing',      code: 'CRW' },
  { id: 'd6',  name: 'Logistik',     code: 'LOG' },
  { id: 'd7',  name: 'HRD',          code: 'HRD' },
  { id: 'd8',  name: 'HSE',          code: 'HSE' },
  { id: 'd9',  name: 'Procurement',  code: 'PCR' },
  { id: 'd10', name: 'IT',           code: 'IT'  },
]

export const vendors = [
  { id: 've1', name: 'PT Sumber Teknik Abadi' },
  { id: 've2', name: 'CV Maju Bersama' },
  { id: 've3', name: 'PT Maritim Jaya Sentosa' },
  { id: 've4', name: 'UD Karya Mandiri' },
  { id: 've5', name: 'PT Pelayaran Nusantara' },
  { id: 've6', name: 'CV Bintang Laut' },
  { id: 've7', name: 'PT Global Shipping Supply' },
  { id: 've8', name: 'Toko Bahan Bangunan Sejahtera' },
  { id: 've9', name: 'PT Anugrah Teknik Marine' },
  { id: 've10', name: 'CV Delta Logistik' },
]

export const budgetCodes = [
  { id: 'bc1', code: '01.5-3830.001', description: 'Biaya Perbaikan Kapal' },
  { id: 'bc2', code: '01.5-3830.002', description: 'Biaya Bahan Bakar' },
  { id: 'bc3', code: '01.5-4010.001', description: 'Biaya Operasional Pelabuhan' },
  { id: 'bc4', code: '02.1-5020.001', description: 'Biaya Logistik & Pengiriman' },
  { id: 'bc5', code: '03.2-6100.001', description: 'Biaya Administrasi Umum' },
]

export const users = [
  { id: 'u1', full_name: 'Admin Sistem', email: 'admin@bgp.co.id', role: 'admin', department_id: null, company_id: null, is_active: true },
  { id: 'u2', full_name: 'Budi Santoso', email: 'staff@bgp.co.id', role: 'staff', department_id: 'd1', company_id: 'c1', is_active: true },
  { id: 'u3', full_name: 'Siti Rahayu', email: 'finance@bgp.co.id', role: 'finance', department_id: 'd3', company_id: 'c1', is_active: true },
  { id: 'u4', full_name: 'Viewer Monitor', email: 'viewer@bgp.co.id', role: 'viewer', department_id: 'd4', company_id: 'c2', is_active: true },
  { id: 'u5', full_name: 'Andi Kurniawan', email: 'staff2@bgp.co.id', role: 'staff', department_id: 'd2', company_id: 'c2', is_active: true },
  { id: 'u6', full_name: 'Dewi Lestari', email: 'staff3@bgp.co.id', role: 'staff', department_id: 'd6', company_id: 'c3', is_active: false },
]

export const mockPasswords = {
  'admin@bgp.co.id': 'admin123',
  'staff@bgp.co.id': 'staff123',
  'finance@bgp.co.id': 'finance123',
  'viewer@bgp.co.id': 'viewer123',
  'staff2@bgp.co.id': 'staff123',
  'staff3@bgp.co.id': 'staff123',
}

export const paymentForms = [
  {
    id: 'pf1', form_code: 'BGP-2026-01-TKN-001', form_number: 1,
    invoice_date: '2026-01-01', submission_date: '2026-01-02',
    vendor_id: 've1', vendor_name_raw: null,
    company_id: 'c1', department_id: 'd2', pic_name: 'Budi Santoso',
    created_by: 'u2', status: 'paid',
    submitted_to_finance_at: '2026-01-02T09:00:00Z',
    received_by_finance_at: '2026-01-03T10:00:00Z',
    paid_at: '2026-01-05T14:00:00Z', paid_by: 'u3',
    rejected_at: null, rejection_reason: null,
    created_at: '2026-01-02T08:00:00Z', updated_at: '2026-01-05T14:00:00Z',
  },
  {
    id: 'pf2', form_code: 'ASG-2026-02-OPR-001', form_number: 1,
    invoice_date: '2026-02-04', submission_date: '2026-02-05',
    vendor_id: 've3', vendor_name_raw: null,
    company_id: 'c2', department_id: 'd1', pic_name: 'Andi Kurniawan',
    created_by: 'u5', status: 'received',
    submitted_to_finance_at: '2026-02-05T08:30:00Z',
    received_by_finance_at: '2026-02-06T11:00:00Z',
    paid_at: null, paid_by: null,
    rejected_at: null, rejection_reason: null,
    created_at: '2026-02-05T08:00:00Z', updated_at: '2026-02-06T11:00:00Z',
  },
  {
    id: 'pf3', form_code: 'BGP-2026-03-LOG-001', form_number: 1,
    invoice_date: '2026-03-09', submission_date: '2026-03-10',
    vendor_id: 've5', vendor_name_raw: null,
    company_id: 'c1', department_id: 'd6', pic_name: 'Budi Santoso',
    created_by: 'u2', status: 'submitted',
    submitted_to_finance_at: '2026-03-10T09:15:00Z',
    received_by_finance_at: null, paid_at: null, paid_by: null,
    rejected_at: null, rejection_reason: null,
    created_at: '2026-03-10T09:00:00Z', updated_at: '2026-03-10T09:15:00Z',
  },
  {
    id: 'pf4', form_code: 'BNI-2026-04-HSE-001', form_number: 1,
    invoice_date: null, submission_date: '2026-04-15',
    vendor_id: 've2', vendor_name_raw: null,
    company_id: 'c3', department_id: 'd8', pic_name: 'Dewi Lestari',
    created_by: 'u6', status: 'rejected',
    submitted_to_finance_at: '2026-04-15T10:00:00Z',
    received_by_finance_at: null,
    paid_at: null, paid_by: null,
    rejected_at: '2026-04-16T14:00:00Z', rejection_reason: 'Invoice tidak lengkap, harap lampirkan dokumen pendukung',
    created_at: '2026-04-15T09:30:00Z', updated_at: '2026-04-16T14:00:00Z',
  },
  {
    id: 'pf5', form_code: 'ASG-2026-05-PCR-001', form_number: 1,
    invoice_date: '2026-05-19', submission_date: '2026-05-20',
    vendor_id: 've7', vendor_name_raw: null,
    company_id: 'c2', department_id: 'd9', pic_name: 'Andi Kurniawan',
    created_by: 'u5', status: 'draft',
    submitted_to_finance_at: null, received_by_finance_at: null,
    paid_at: null, paid_by: null, rejected_at: null, rejection_reason: null,
    created_at: '2026-05-20T08:00:00Z', updated_at: '2026-05-20T08:00:00Z',
  },
  {
    id: 'pf6', form_code: 'BGP-2026-06-TKN-001', form_number: 1,
    invoice_date: '2026-05-31', submission_date: '2026-06-01',
    vendor_id: 've4', vendor_name_raw: null,
    company_id: 'c1', department_id: 'd2', pic_name: 'Budi Santoso',
    created_by: 'u2', status: 'submitted',
    submitted_to_finance_at: '2026-06-01T10:00:00Z',
    received_by_finance_at: null, paid_at: null, paid_by: null,
    rejected_at: null, rejection_reason: null,
    created_at: '2026-06-01T09:45:00Z', updated_at: '2026-06-01T10:00:00Z',
  },
  {
    id: 'pf7', form_code: 'BGP-2026-06-OPR-001', form_number: 1,
    invoice_date: '2026-06-01', submission_date: '2026-06-02',
    vendor_id: 've9', vendor_name_raw: null,
    company_id: 'c1', department_id: 'd1', pic_name: 'Budi Santoso',
    created_by: 'u2', status: 'draft',
    submitted_to_finance_at: null, received_by_finance_at: null,
    paid_at: null, paid_by: null, rejected_at: null, rejection_reason: null,
    created_at: '2026-06-02T07:30:00Z', updated_at: '2026-06-02T07:30:00Z',
  },
  {
    id: 'pf8', form_code: 'ASG-2026-06-KEU-001', form_number: 1,
    invoice_date: '2026-06-01', submission_date: '2026-06-02',
    vendor_id: 've6', vendor_name_raw: null,
    company_id: 'c2', department_id: 'd3', pic_name: 'Andi Kurniawan',
    created_by: 'u5', status: 'submitted',
    submitted_to_finance_at: '2026-06-02T09:00:00Z',
    received_by_finance_at: null, paid_at: null, paid_by: null,
    rejected_at: null, rejection_reason: null,
    created_at: '2026-06-02T08:30:00Z', updated_at: '2026-06-02T09:00:00Z',
  },
]

export const paymentItems = {
  pf1: [
    { id: 'pi1a', form_id: 'pf1', item_number: 1, item_code: 'BGP-2026-01-TKN-001-001', description: 'Perbaikan mesin utama kapal BB99', qty: 1, unit_price: 5500000, total: 5500000, vessel_id: 'v1', fleet: 'I', budget_code_id: 'bc1', notes: 'Termasuk biaya spare part', invoice_number: 'INV-2026-001' },
    { id: 'pi1b', form_id: 'pf1', item_number: 2, item_code: 'BGP-2026-01-TKN-001-002', description: 'Penggantian oli mesin', qty: 20, unit_price: 85000, total: 1700000, vessel_id: 'v1', fleet: 'I', budget_code_id: 'bc1', notes: null, invoice_number: 'INV-2026-001' },
    { id: 'pi1c', form_id: 'pf1', item_number: 3, item_code: 'BGP-2026-01-TKN-001-003', description: 'Jasa teknisi kapal', qty: 2, unit_price: 750000, total: 1500000, vessel_id: 'v1', fleet: 'I', budget_code_id: 'bc1', notes: null, invoice_number: 'INV-2026-002' },
  ],
  pf2: [
    { id: 'pi2a', form_id: 'pf2', item_number: 1, item_code: 'ASG-2026-02-OPR-001-001', description: 'Bahan bakar solar untuk operasional', qty: 500, unit_price: 9500, total: 4750000, vessel_id: 'v3', fleet: 'III', budget_code_id: 'bc2', notes: null, invoice_number: 'INV-2026-045' },
    { id: 'pi2b', form_id: 'pf2', item_number: 2, item_code: 'ASG-2026-02-OPR-001-002', description: 'Pelumas mesin kapal', qty: 10, unit_price: 120000, total: 1200000, vessel_id: 'v3', fleet: 'III', budget_code_id: 'bc2', notes: 'Kualitas premium', invoice_number: 'INV-2026-045' },
  ],
  pf3: [
    { id: 'pi3a', form_id: 'pf3', item_number: 1, item_code: 'BGP-2026-03-LOG-001-001', description: 'Biaya sandar pelabuhan Tanjung Priok', qty: 3, unit_price: 2500000, total: 7500000, vessel_id: 'v2', fleet: 'II', budget_code_id: 'bc3', notes: null, invoice_number: null },
  ],
  pf4: [
    { id: 'pi4a', form_id: 'pf4', item_number: 1, item_code: 'BNI-2026-04-HSE-001-001', description: 'Pengadaan alat keselamatan laut', qty: 5, unit_price: 1800000, total: 9000000, vessel_id: 'v7', fleet: 'II', budget_code_id: 'bc1', notes: 'SOLAS compliant', invoice_number: 'INV-2026-089' },
    { id: 'pi4b', form_id: 'pf4', item_number: 2, item_code: 'BNI-2026-04-HSE-001-002', description: 'Tali tambat kapal', qty: 100, unit_price: 35000, total: 3500000, vessel_id: 'v7', fleet: 'II', budget_code_id: 'bc1', notes: null, invoice_number: 'INV-2026-090' },
  ],
  pf5: [
    { id: 'pi5a', form_id: 'pf5', item_number: 1, item_code: 'ASG-2026-05-PCR-001-001', description: 'Pengadaan suku cadang mesin auxiliary', qty: 1, unit_price: 12000000, total: 12000000, vessel_id: 'v5', fleet: 'I', budget_code_id: 'bc1', notes: null, invoice_number: 'INV-2026-112' },
  ],
  pf6: [
    { id: 'pi6a', form_id: 'pf6', item_number: 1, item_code: 'BGP-2026-06-TKN-001-001', description: 'Service AC kapal ELNU 01', qty: 1, unit_price: 3500000, total: 3500000, vessel_id: 'v2', fleet: 'II', budget_code_id: 'bc1', notes: null, invoice_number: 'INV-2026-131' },
    { id: 'pi6b', form_id: 'pf6', item_number: 2, item_code: 'BGP-2026-06-TKN-001-002', description: 'Freon AC', qty: 3, unit_price: 450000, total: 1350000, vessel_id: 'v2', fleet: 'II', budget_code_id: 'bc1', notes: null, invoice_number: 'INV-2026-131' },
  ],
  pf7: [
    { id: 'pi7a', form_id: 'pf7', item_number: 1, item_code: 'BGP-2026-06-OPR-001-001', description: 'Cat anti-karat lambung kapal', qty: 20, unit_price: 275000, total: 5500000, vessel_id: 'v1', fleet: 'I', budget_code_id: 'bc1', notes: 'Cat epoxy', invoice_number: 'INV-2026-140' },
  ],
  pf8: [
    { id: 'pi8a', form_id: 'pf8', item_number: 1, item_code: 'ASG-2026-06-KEU-001-001', description: 'Jasa akuntan laporan keuangan Q2', qty: 1, unit_price: 8500000, total: 8500000, vessel_id: null, fleet: null, budget_code_id: 'bc5', notes: null, invoice_number: 'INV-2026-141' },
  ],
}

export const attachments = {
  pf1: [
    { id: 'at1a', form_id: 'pf1', label: 'Invoice 001', original_name: 'invoice-5989.pdf', mime_type: 'application/pdf', file_size_bytes: 245000, uploaded_by: 'u2', created_at: '2026-01-02T08:15:00Z' },
    { id: 'at1b', form_id: 'pf1', label: 'Invoice 002', original_name: 'invoice-5990.pdf', mime_type: 'application/pdf', file_size_bytes: 189000, uploaded_by: 'u2', created_at: '2026-01-02T08:17:00Z' },
  ],
  pf2: [
    { id: 'at2a', form_id: 'pf2', label: 'Invoice 045', original_name: 'invoice-bahan-bakar.pdf', mime_type: 'application/pdf', file_size_bytes: 320000, uploaded_by: 'u5', created_at: '2026-02-05T08:10:00Z' },
  ],
  pf3: [],
  pf4: [
    { id: 'at4a', form_id: 'pf4', label: 'Invoice 089', original_name: 'inv089.jpg', mime_type: 'image/jpeg', file_size_bytes: 1250000, uploaded_by: 'u6', created_at: '2026-04-15T09:45:00Z' },
  ],
}

export const auditLogs = [
  { id: 'al1', form_id: 'pf1', actor_id: 'u2', action: 'status_changed', from_status: 'draft', to_status: 'submitted', notes: null, created_at: '2026-01-02T09:00:00Z' },
  { id: 'al2', form_id: 'pf1', actor_id: 'u3', action: 'status_changed', from_status: 'submitted', to_status: 'received', notes: null, created_at: '2026-01-03T10:00:00Z' },
  { id: 'al3', form_id: 'pf1', actor_id: 'u3', action: 'status_changed', from_status: 'received', to_status: 'paid', notes: null, created_at: '2026-01-05T14:00:00Z' },
  { id: 'al4', form_id: 'pf2', actor_id: 'u5', action: 'status_changed', from_status: 'draft', to_status: 'submitted', notes: null, created_at: '2026-02-05T08:30:00Z' },
  { id: 'al5', form_id: 'pf2', actor_id: 'u3', action: 'status_changed', from_status: 'submitted', to_status: 'received', notes: null, created_at: '2026-02-06T11:00:00Z' },
  { id: 'al6', form_id: 'pf3', actor_id: 'u2', action: 'status_changed', from_status: 'draft', to_status: 'submitted', notes: null, created_at: '2026-03-10T09:15:00Z' },
  { id: 'al7', form_id: 'pf4', actor_id: 'u6', action: 'status_changed', from_status: 'draft', to_status: 'submitted', notes: null, created_at: '2026-04-15T10:00:00Z' },
  { id: 'al8', form_id: 'pf4', actor_id: 'u3', action: 'status_changed', from_status: 'submitted', to_status: 'rejected', notes: 'Invoice tidak lengkap, harap lampirkan dokumen pendukung', created_at: '2026-04-16T14:00:00Z' },
  { id: 'al9', form_id: 'pf6', actor_id: 'u2', action: 'status_changed', from_status: 'draft', to_status: 'submitted', notes: null, created_at: '2026-06-01T10:00:00Z' },
  { id: 'al10', form_id: 'pf8', actor_id: 'u5', action: 'status_changed', from_status: 'draft', to_status: 'submitted', notes: null, created_at: '2026-06-02T09:00:00Z' },
]

export const chartData = {
  byDepartment: [
    { name: 'Operasional', count: 5, value: 22500000 },
    { name: 'Teknik', count: 8, value: 45000000 },
    { name: 'Keuangan', count: 3, value: 18000000 },
    { name: 'Administrasi', count: 2, value: 9000000 },
    { name: 'Logistik', count: 4, value: 15000000 },
    { name: 'Procurement', count: 6, value: 32000000 },
  ],
  monthlyTrend: [
    { month: 'Jan 2026', value: 87000000 },
    { month: 'Feb 2026', value: 95000000 },
    { month: 'Mar 2026', value: 112000000 },
    { month: 'Apr 2026', value: 78000000 },
    { month: 'Mei 2026', value: 134000000 },
    { month: 'Jun 2026', value: 45000000 },
  ],
  byCompany: [
    { name: 'BGP', value: 45, fill: '#1d4ed8' },
    { name: 'ASG', value: 32, fill: '#3b82f6' },
    { name: 'BNI', value: 23, fill: '#93c5fd' },
  ],
  topVendors: [
    { name: 'PT Sumber Teknik Abadi', total: 87500000, count: 12 },
    { name: 'PT Maritim Jaya Sentosa', total: 65000000, count: 8 },
    { name: 'PT Global Shipping Supply', total: 54200000, count: 6 },
    { name: 'CV Maju Bersama', total: 42800000, count: 9 },
    { name: 'PT Pelayaran Nusantara', total: 38500000, count: 5 },
    { name: 'CV Bintang Laut', total: 32100000, count: 7 },
    { name: 'PT Anugrah Teknik Marine', total: 28700000, count: 4 },
    { name: 'CV Delta Logistik', total: 22300000, count: 6 },
    { name: 'UD Karya Mandiri', total: 18900000, count: 5 },
    { name: 'Toko Bahan Bangunan Sejahtera', total: 12400000, count: 3 },
  ],
}
