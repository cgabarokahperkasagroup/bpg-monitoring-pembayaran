import { supabase } from '../lib/supabase'

export async function getPaymentForms() {
  const { data, error } = await supabase
    .from('payment_forms')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getPaymentFormById(id) {
  const { data, error } = await supabase
    .from('payment_forms')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function getPaymentItems(formId) {
  const { data, error } = await supabase
    .from('payment_items')
    .select('*')
    .eq('form_id', formId)
    .order('item_number')
  if (error) throw error
  return data
}

export async function getAttachments(formId) {
  const { data, error } = await supabase
    .from('attachments')
    .select('*')
    .eq('form_id', formId)
    .order('created_at')
  if (error) throw error
  return data
}

export async function getAuditLogs(formId) {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*, user_profiles!actor_id(full_name)')
    .eq('form_id', formId)
    .order('created_at')
  if (error) throw error
  return data
}

export async function createPaymentForm(formData, items) {
  const { data: form, error: formError } = await supabase
    .from('payment_forms')
    .insert(formData)
    .select()
    .single()
  if (formError) throw formError

  if (items && items.length > 0) {
    const { error: itemsError } = await supabase
      .from('payment_items')
      .insert(items.map((item, i) => ({ ...item, form_id: form.id, item_number: i + 1 })))
    if (itemsError) throw itemsError
  }

  return form
}

// Impor massal pengajuan dari Excel. `forms` sudah ter-resolve (id master, items).
// Semua dibuat dengan status 'submitted' (menunggu konfirmasi finance).
// Mengembalikan ringkasan { success, failed, errors:[{label,message}] }.
export async function importPaymentForms(forms, userId) {
  const baseTs = Date.now()
  const nowIso = new Date().toISOString()
  const result = { success: 0, failed: 0, errors: [] }

  for (let i = 0; i < forms.length; i++) {
    const f = forms[i]
    try {
      const d = new Date(f.submission_date)
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const seq = `${String(baseTs).slice(-4)}${String(i).padStart(2, '0')}`
      const form_code = `${f.company_code}-${yyyy}-${mm}-${f.dept_code}-${seq}`

      const formData = {
        id: `pf_${baseTs}_${i}`,
        form_code,
        form_number: 1,
        invoice_date: f.invoice_date || null,
        submission_date: f.submission_date,
        vendor_id: f.vendor_id || null,
        vendor_name_raw: f.vendor_name_raw || null,
        company_id: f.company_id,
        department_id: f.department_id,
        pic_name: f.pic_name || null,
        created_by: userId,
        status: 'submitted',
        submitted_to_finance_at: nowIso,
      }

      const itemsData = (f.items || []).map((it, j) => ({
        id: `pi_${baseTs}_${i}_${j}`,
        item_code: `${form_code}-${String(j + 1).padStart(3, '0')}`,
        description: it.description,
        qty: it.qty,
        unit_price: it.unit_price,
        total: it.total,
        vessel_id: it.vessel_id || null,
        fleet: it.fleet || null,
        budget_code_id: it.budget_code_id || null,
        notes: it.notes || null,
        invoice_number: it.invoice_number || null,
      }))

      await createPaymentForm(formData, itemsData)
      result.success++
    } catch (err) {
      result.failed++
      result.errors.push({ label: f.label || `Pengajuan #${i + 1}`, message: err.message })
    }
  }

  return result
}

export async function updatePaymentForm(id, formData, items) {
  const { data: form, error: formError } = await supabase
    .from('payment_forms')
    .update(formData)
    .eq('id', id)
    .select()
    .single()
  if (formError) throw formError

  if (items !== undefined) {
    // Hapus items lama, insert baru
    await supabase.from('payment_items').delete().eq('form_id', id)
    if (items.length > 0) {
      const { error: itemsError } = await supabase
        .from('payment_items')
        .insert(items.map((item, i) => ({ ...item, form_id: id, item_number: i + 1 })))
      if (itemsError) throw itemsError
    }
  }

  return form
}

export async function updateFormStatus(id, newStatus, actorId, extra = {}) {
  const now = new Date().toISOString()
  const statusFields = {
    submitted: { status: 'submitted', submitted_to_finance_at: now },
    received:  { status: 'received',  received_by_finance_at: now },
    paid:      { status: 'paid',      paid_at: now, paid_by: actorId },
    rejected:  { status: 'rejected',  rejected_at: now, rejection_reason: extra.rejection_reason || null },
  }

  const updates = statusFields[newStatus]
  if (!updates) throw new Error('Status tidak valid')

  // Ambil status lama untuk audit log
  const { data: current } = await supabase.from('payment_forms').select('status').eq('id', id).single()

  const { data: form, error } = await supabase
    .from('payment_forms')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error

  // Catat audit log
  await supabase.from('audit_logs').insert({
    id: `al_${Date.now()}`,
    form_id: id,
    actor_id: actorId,
    action: 'status_changed',
    from_status: current?.status,
    to_status: newStatus,
    notes: extra.rejection_reason || null,
  })

  return form
}

export async function deletePaymentForm(id) {
  const { error } = await supabase.from('payment_forms').delete().eq('id', id)
  if (error) throw error
}

// Hitung total nilai semua form sekaligus (efficient)
export async function getAllPaymentItemTotals() {
  const { data, error } = await supabase
    .from('payment_items')
    .select('form_id, total')
  if (error) throw error

  const totals = {}
  data.forEach(item => {
    totals[item.form_id] = (totals[item.form_id] || 0) + item.total
  })
  return totals
}
