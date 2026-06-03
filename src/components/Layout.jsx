import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuth } from '../context/AuthContext'
import { Menu, Bell, LogOut, ChevronDown, UserCircle } from 'lucide-react'
import { Button } from './ui/button'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [roleMenuOpen, setRoleMenuOpen] = useState(false)
  const { currentUser, logout, switchRole } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const roles = [
    { value: 'admin', label: 'Admin Sistem' },
    { value: 'staff', label: 'Staff / Pengaju' },
    { value: 'finance', label: 'Finance' },
    { value: 'viewer', label: 'Viewer' },
  ]

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-14 items-center gap-3 border-b bg-white px-4 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700">
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1" />

          {/* Demo: switch role */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(v => !v)}
              className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded capitalize">{currentUser?.role}</span>
              <span className="hidden sm:inline">{currentUser?.full_name}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            {roleMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setRoleMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 z-20 rounded-xl border bg-white shadow-lg py-1">
                  <p className="px-3 py-1.5 text-xs text-gray-400 font-medium uppercase tracking-wider">Demo: Ganti Role</p>
                  {roles.map(r => (
                    <button
                      key={r.value}
                      onClick={() => { switchRole(r.value); setRoleMenuOpen(false) }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 ${currentUser?.role === r.value ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
                    >
                      {r.label}
                    </button>
                  ))}
                  <hr className="my-1" />
                  <button
                    onClick={() => { setRoleMenuOpen(false); navigate('/profil') }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <UserCircle className="h-4 w-4" /> Profil Saya
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" /> Keluar
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
