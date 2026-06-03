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

export async function createUserWithProfile(email, password, profileData) {
  // Buat user di auth
  const { data: authData, error: authError } = await supabase.auth.admin?.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (authError) throw authError

  // Buat profile
  const { data, error } = await supabase.from('user_profiles').insert({
    id: authData.user.id,
    email,
    ...profileData,
  }).select().single()
  if (error) throw error
  return data
}
