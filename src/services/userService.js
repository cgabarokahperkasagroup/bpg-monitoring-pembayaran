import { supabase } from '../lib/supabase'

export async function getUserProfiles() {
  const { data, error } = await supabase.from('user_profiles').select('*').order('full_name')
  if (error) throw error
  return data
}

export async function getUserProfile(id) {
  const { data, error } = await supabase.from('user_profiles').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function updateUserProfile(id, updates) {
  const { data, error } = await supabase.from('user_profiles').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function toggleUserActive(id, isActive) {
  const { data, error } = await supabase.from('user_profiles').update({ is_active: isActive }).eq('id', id).select().single()
  if (error) throw error
  return data
}

// Hapus user permanen (akun auth + profil) via Edge Function khusus admin.
// Ditolak oleh server jika user pernah membuat pengajuan.
export async function deleteUser(userId) {
  const { data, error } = await supabase.functions.invoke('delete-user', {
    body: { user_id: userId },
  })
  // Edge Function mengembalikan pesan error pada status non-2xx (mis. 409/403).
  if (error) {
    let message = error.message
    try {
      const ctx = error.context
      if (ctx && typeof ctx.json === 'function') {
        const body = await ctx.json()
        if (body?.error) message = body.error
      }
    } catch { /* abaikan parse error, pakai message default */ }
    throw new Error(message)
  }
  if (data?.error) throw new Error(data.error)
  return data
}
