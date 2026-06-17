import { supabase } from '../lib/supabase'

export async function getBusinessUnits() {
  const { data, error } = await supabase.from('business_units').select('*').order('name')
  if (error) throw error
  return data
}

export async function getCompanies() {
  const { data, error } = await supabase.from('companies').select('*').order('name')
  if (error) throw error
  return data
}

export async function getVessels() {
  const { data, error } = await supabase.from('vessels').select('*').order('name')
  if (error) throw error
  return data
}

export async function getDepartments() {
  const { data, error } = await supabase.from('departments').select('*').order('name')
  if (error) throw error
  return data
}

export async function getVendors() {
  const { data, error } = await supabase.from('vendors').select('*').order('name')
  if (error) throw error
  return data
}

export async function getBudgetCodes() {
  const { data, error } = await supabase.from('budget_codes').select('*').order('code')
  if (error) throw error
  return data
}

// CRUD untuk master data (admin only)
export async function upsertBusinessUnit(record) {
  const { data, error } = await supabase.from('business_units').upsert(record).select().single()
  if (error) throw error
  return data
}

export async function deleteBusinessUnit(id) {
  const { error } = await supabase.from('business_units').delete().eq('id', id)
  if (error) throw error
}

export async function upsertCompany(record) {
  const { data, error } = await supabase.from('companies').upsert(record).select().single()
  if (error) throw error
  return data
}

export async function deleteCompany(id) {
  const { error } = await supabase.from('companies').delete().eq('id', id)
  if (error) throw error
}

export async function upsertVessel(record) {
  const { data, error } = await supabase.from('vessels').upsert(record).select().single()
  if (error) throw error
  return data
}

export async function deleteVessel(id) {
  const { error } = await supabase.from('vessels').delete().eq('id', id)
  if (error) throw error
}

// Sinkron data kapal dari API SMS (via Edge Function khusus admin).
// Token API tersimpan di server; fungsi ini upsert ke tabel vessels lokal.
export async function syncVesselsFromApi() {
  const { data, error } = await supabase.functions.invoke('sync-vessels', { body: {} })
  if (error) {
    let message = error.message
    try {
      const ctx = error.context
      if (ctx && typeof ctx.json === 'function') {
        const body = await ctx.json()
        if (body?.error) message = body.error
      }
    } catch { /* abaikan, pakai message default */ }
    throw new Error(message)
  }
  if (data?.error) throw new Error(data.error)
  return data
}

export async function upsertDepartment(record) {
  const { data, error } = await supabase.from('departments').upsert(record).select().single()
  if (error) throw error
  return data
}

export async function deleteDepartment(id) {
  const { error } = await supabase.from('departments').delete().eq('id', id)
  if (error) throw error
}

export async function upsertVendor(record) {
  const { data, error } = await supabase.from('vendors').upsert(record).select().single()
  if (error) throw error
  return data
}

export async function deleteVendor(id) {
  const { error } = await supabase.from('vendors').delete().eq('id', id)
  if (error) throw error
}

export async function upsertBudgetCode(record) {
  const { data, error } = await supabase.from('budget_codes').upsert(record).select().single()
  if (error) throw error
  return data
}

export async function deleteBudgetCode(id) {
  const { error } = await supabase.from('budget_codes').delete().eq('id', id)
  if (error) throw error
}
