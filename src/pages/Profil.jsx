import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { useAuth } from '../context/AuthContext'
import { departments, companies } from '../data/mockData'
import { User, KeyRound, LogOut, CheckCircle } from 'lucide-react'

const roleLabels = { admin: 'Admin Sistem', staff: 'Staff / Pengaju', finance: 'Finance', viewer: 'Viewer' }
const roleColors = { admin: 'bg-purple-100 text-purple-700', staff: 'bg-blue-100 text-blue-700', finance: 'bg-green-100 text-green-700', viewer: 'bg-gray-100 text-gray-700' }

export default function Profil() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [oldPass, setOldPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [success, setSuccess] = useState(false)

  const dept = departments.find(d => d.id === currentUser?.department_id)
  const company = companies.find(c => c.id === currentUser?.company_id)

  const handleChangePass = (e) => {
    e.preventDefault()
    if (newPass !== confirmPass) return alert('Password baru tidak cocok')
    if (newPass.length < 6) return alert('Password minimal 6 karakter')
    setSuccess(true)
    setOldPass(''); setNewPass(''); setConfirmPass('')
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>

      {/* Profile Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" /> Informasi Akun
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0 w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
              {currentUser?.full_name?.charAt(0) || '?'}
            </div>
            <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Nama Lengkap</p>
                <p className="font-semibold text-gray-900">{currentUser?.full_name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Email</p>
                <p className="text-gray-700">{currentUser?.email}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Role</p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleColors[currentUser?.role]}`}>
                  {roleLabels[currentUser?.role]}
                </span>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Status Akun</p>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                  ● Aktif
                </span>
              </div>
              {dept && (
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">Departemen</p>
                  <p className="text-gray-700">{dept.name}</p>
                </div>
              )}
              {company && (
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">Perusahaan</p>
                  <p className="text-gray-700">{company.code} — {company.name}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-blue-600" /> Ganti Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          {success && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700 mb-4">
              <CheckCircle className="h-4 w-4" /> Password berhasil diubah!
            </div>
          )}
          <form onSubmit={handleChangePass} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Password Lama</Label>
              <Input type="password" value={oldPass} onChange={e => setOldPass(e.target.value)} placeholder="Masukkan password lama" required />
            </div>
            <div className="space-y-1.5">
              <Label>Password Baru</Label>
              <Input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Minimal 6 karakter" required />
            </div>
            <div className="space-y-1.5">
              <Label>Konfirmasi Password Baru</Label>
              <Input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="Ulangi password baru" required />
            </div>
            <Button type="submit">Simpan Password Baru</Button>
          </form>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card className="border-red-100">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Keluar dari Sistem</p>
            <p className="text-sm text-gray-500">Sesi Anda akan diakhiri</p>
          </div>
          <Button
            variant="outline"
            className="text-red-600 border-red-300 hover:bg-red-50"
            onClick={() => { logout(); navigate('/login') }}
          >
            <LogOut className="h-4 w-4 mr-2" /> Keluar
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
