import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { MasterDataProvider } from './context/MasterDataContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import DaftarPengajuan from './pages/DaftarPengajuan'
import BuatPengajuan from './pages/BuatPengajuan'
import DetailPengajuan from './pages/DetailPengajuan'
import EditPengajuan from './pages/EditPengajuan'
import Laporan from './pages/Laporan'
import MasterKapal from './pages/master/MasterKapal'
import MasterDepartemen from './pages/master/MasterDepartemen'
import MasterVendor from './pages/master/MasterVendor'
import MasterBudget from './pages/master/MasterBudget'
import MasterPerusahaan from './pages/master/MasterPerusahaan'
import MasterBisnisUnit from './pages/master/MasterBisnisUnit'
import ManajemenUser from './pages/ManajemenUser'
import Profil from './pages/Profil'

function AppLayout({ children }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <MasterDataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/pengajuan" element={<AppLayout><DaftarPengajuan /></AppLayout>} />
          <Route path="/pengajuan/baru" element={<AppLayout><ProtectedRoute allowedRoles={['admin', 'staff']}><BuatPengajuan /></ProtectedRoute></AppLayout>} />
          <Route path="/pengajuan/:id" element={<AppLayout><DetailPengajuan /></AppLayout>} />
          <Route path="/pengajuan/:id/edit" element={<AppLayout><ProtectedRoute allowedRoles={['admin', 'staff']}><EditPengajuan /></ProtectedRoute></AppLayout>} />
          <Route path="/laporan" element={<AppLayout><ProtectedRoute allowedRoles={['admin', 'finance', 'viewer']}><Laporan /></ProtectedRoute></AppLayout>} />
          <Route path="/master/kapal" element={<AppLayout><ProtectedRoute allowedRoles={['admin']}><MasterKapal /></ProtectedRoute></AppLayout>} />
          <Route path="/master/departemen" element={<AppLayout><ProtectedRoute allowedRoles={['admin']}><MasterDepartemen /></ProtectedRoute></AppLayout>} />
          <Route path="/master/vendor" element={<AppLayout><ProtectedRoute allowedRoles={['admin']}><MasterVendor /></ProtectedRoute></AppLayout>} />
          <Route path="/master/budget" element={<AppLayout><ProtectedRoute allowedRoles={['admin']}><MasterBudget /></ProtectedRoute></AppLayout>} />
          <Route path="/master/perusahaan" element={<AppLayout><ProtectedRoute allowedRoles={['admin']}><MasterPerusahaan /></ProtectedRoute></AppLayout>} />
          <Route path="/master/bisnis-unit" element={<AppLayout><ProtectedRoute allowedRoles={['admin']}><MasterBisnisUnit /></ProtectedRoute></AppLayout>} />
          <Route path="/admin/users" element={<AppLayout><ProtectedRoute allowedRoles={['admin']}><ManajemenUser /></ProtectedRoute></AppLayout>} />
          <Route path="/profil" element={<AppLayout><Profil /></AppLayout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </MasterDataProvider>
    </AuthProvider>
  )
}
