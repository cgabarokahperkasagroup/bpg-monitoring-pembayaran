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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false)
      return
    }
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

// eslint-disable-next-line react-refresh/only-export-components
export function useMasterData() {
  return useContext(MasterDataContext)
}
