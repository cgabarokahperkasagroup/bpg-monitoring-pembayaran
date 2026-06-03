import { NavLink } from 'react-router-dom'
import { cn } from '../lib/utils'
import {
  LayoutDashboard, FileText, PlusCircle, BarChart2, Ship, Building2, Users2, Package, DollarSign, UserCircle, X, ChevronDown, Briefcase, Layers,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const allNavItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard',        roles: ['admin', 'staff', 'finance', 'viewer', 'head', 'bod'] },
  { to: '/pengajuan', icon: FileText, label: 'Daftar Pengajuan', roles: ['admin', 'staff', 'finance', 'viewer', 'head', 'bod'] },
  { to: '/pengajuan/baru', icon: PlusCircle, label: 'Buat Pengajuan', roles: ['admin', 'staff'] },
  { to: '/laporan', icon: BarChart2, label: 'Laporan',         roles: ['admin', 'finance', 'viewer', 'head', 'bod'] },
  { label: 'Master Data', type: 'section', roles: ['admin'] },
  { to: '/master/kapal', icon: Ship, label: 'Kapal',           roles: ['admin'] },
  { to: '/master/departemen', icon: Building2, label: 'Departemen', roles: ['admin'] },
  { to: '/master/vendor', icon: Package, label: 'Vendor',      roles: ['admin'] },
  { to: '/master/budget', icon: DollarSign, label: 'Kode Budget', roles: ['admin'] },
  { to: '/master/bisnis-unit', icon: Layers, label: 'Bisnis Unit', roles: ['admin'] },
  { to: '/master/perusahaan', icon: Briefcase, label: 'Perusahaan', roles: ['admin'] },
  { label: 'Administrasi', type: 'section', roles: ['admin'] },
  { to: '/admin/users', icon: Users2, label: 'Manajemen User', roles: ['admin'] },
  { to: '/profil', icon: UserCircle, label: 'Profil Saya',     roles: ['admin', 'staff', 'finance', 'viewer', 'head', 'bod'] },
]

export default function Sidebar({ open, onClose }) {
  const { currentUser } = useAuth()
  const role = currentUser?.role

  const navItems = allNavItems.filter(item => !item.roles || item.roles.includes(role))

  return (
    <>
      {open && <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={onClose} />}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-blue-900 text-white transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-blue-800">
          <div>
            <span className="text-xl font-bold text-white tracking-tight">Monitoring Payment</span>
            <p className="text-xs text-blue-300 mt-0.5">Sistem Pengajuan Pembayaran</p>
          </div>
          <button onClick={onClose} className="lg:hidden text-blue-300 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map((item, i) => {
            if (item.type === 'section') {
              return (
                <p key={i} className="text-xs font-semibold uppercase tracking-wider text-blue-400 px-3 pt-4 pb-1">
                  {item.label}
                </p>
              )
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onClose}
                className={({ isActive }) => cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="border-t border-blue-800 px-4 py-3">
          <p className="text-xs text-blue-300">Login sebagai:</p>
          <p className="text-sm font-medium text-white truncate">{currentUser?.full_name}</p>
          <span className="text-xs bg-blue-700 text-blue-100 px-2 py-0.5 rounded">
            {{ admin: 'Admin', staff: 'Staff', finance: 'Finance', viewer: 'Viewer', head: 'Kepala BU', bod: 'BOD / Manajemen' }[role] ?? role}
          </span>
        </div>
      </aside>
    </>
  )
}
