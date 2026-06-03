import { createContext, useContext, useState, useEffect } from 'react'
import {
  getBusinessUnits, getCompanies, getVessels,
  getDepartments, getVendors, getBudgetCodes,
} from '../services/masterService'
import { getUserProfiles } from '../services/userService'
import { useAuth } from './AuthContext'

const MasterDataContext = createContext(null)

export function MasterDataProvider({ children }) {
  const { currentUser } = useAuth()
  const [data, setData] = useState({
    businessUnits: [],
    companies: [],
    vessels: [],
    departments: [],
    vendors: [],
    budgetCodes: [],
    users: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) {
      setLoading(false)
      return
    }
    loadAll()
  }, [currentUser])

  async function loadAll() {
    setLoading(true)
    try {
      const [businessUnits, companies, vessels, departments, vendors, budgetCodes, users] =
        await Promise.all([
          getBusinessUnits(),
          getCompanies(),
          getVessels(),
          getDepartments(),
          getVendors(),
          getBudgetCodes(),
          getUserProfiles(),
        ])
      setData({ businessUnits, companies, vessels, departments, vendors, budgetCodes, users })
    } catch (err) {
      console.error('Gagal load master data:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <MasterDataContext.Provider value={{ ...data, loading, reload: loadAll }}>
      {children}
    </MasterDataContext.Provider>
  )
}

export function useMasterData() {
  return useContext(MasterDataContext)
}
