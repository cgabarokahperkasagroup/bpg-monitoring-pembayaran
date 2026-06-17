import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useMasterData } from '../context/MasterDataContext'

// Role yang tidak dibatasi per BU (bisa lihat semua data)
const UNRESTRICTED_ROLES = ['admin', 'viewer', 'bod']
// Role yang WAJIB dibatasi ke BU-nya saja (tidak boleh lihat BU lain)
const BU_RESTRICTED_ROLES = ['finance', 'head']

export function useBusinessUnitFilter() {
  const { currentUser } = useAuth()
  const { companies } = useMasterData()

  const isBuRestricted = !!currentUser && BU_RESTRICTED_ROLES.includes(currentUser.role)

  // BU ID user — null berarti tidak ada batasan BU
  const businessUnitId = useMemo(() => {
    if (!currentUser) return null
    if (UNRESTRICTED_ROLES.includes(currentUser.role)) return null
    if (currentUser.role === 'staff') return null // staff dibatasi by owner, bukan BU
    if (currentUser.business_unit_id) return currentUser.business_unit_id
    const company = companies.find(c => c.id === currentUser.company_id)
    return company?.business_unit_id ?? null
  }, [currentUser, companies])

  // ID perusahaan dalam BU user.
  // null  = tidak ada batasan BU (admin/viewer/bod/staff)
  // array = daftar perusahaan BU-nya (finance/head); [] jika BU tidak terpasang → tidak lihat apa pun
  const buCompanyIds = useMemo(() => {
    if (!isBuRestricted) return null
    if (!businessUnitId) return []
    return companies
      .filter(c => c.business_unit_id === businessUnitId)
      .map(c => c.id)
  }, [isBuRestricted, businessUnitId, companies])

  // Filter berdasarkan BU (untuk finance & head)
  const filterByBU = (forms) => {
    if (buCompanyIds === null) return forms
    return forms.filter(f => buCompanyIds.includes(f.company_id))
  }

  // Filter berdasarkan pembuat (untuk staff — hanya milik sendiri)
  const filterByOwner = (forms) => {
    if (currentUser?.role !== 'staff') return forms
    return forms.filter(f => f.created_by === currentUser.id)
  }

  // Filter gabungan: terapkan semua aturan sesuai role
  const applyFilters = (forms) => filterByOwner(filterByBU(forms))

  // Cek apakah form masuk ke BU user (untuk action buttons di DetailPengajuan)
  const isFormInUserBU = (form) => {
    if (!buCompanyIds) return true
    return buCompanyIds.includes(form?.company_id)
  }

  return { businessUnitId, buCompanyIds, filterByBU, filterByOwner, applyFilters, isFormInUserBU }
}
