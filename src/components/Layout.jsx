import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuth } from '../context/AuthContext'
import { Menu, LogOut, ChevronDown, UserCircle } from 'lucide-react'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

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

          {/* Profile menu */}
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(v => !v)}
              className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded capitalize">{currentUser?.role}</span>
              <span className="hidden sm:inline">{currentUser?.full_name}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            {profileMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setProfileMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 z-20 rounded-xl border bg-white shadow-lg py-1">
                  <button
                    onClick={() => { setProfileMenuOpen(false); navigate('/profil') }}
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
