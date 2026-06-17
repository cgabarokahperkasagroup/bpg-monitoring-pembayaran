import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { MasterDataProvider } from './context/MasterDataContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

// Lazy-load semua halaman agar dipisah per route (code-splitting)
const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const DaftarPengajuan = lazy(() => import('./pages/DaftarPengajuan'))
const BuatPengajuan = lazy(() => import('./pages/BuatPengajuan'))
const ImportPengajuan = lazy(() => import('./pages/ImportPengajuan'))
const DetailPengajuan = lazy(() => import('./pages/DetailPengajuan'))
const EditPengajuan = lazy(() => import('./pages/EditPengajuan'))
const Laporan = lazy(() => import('./pages/Laporan'))
const MasterKapal = lazy(() => import('./pages/master/MasterKapal'))
const MasterDepartemen = lazy(() => import('./pages/master/MasterDepartemen'))
const MasterVendor = lazy(() => import('./pages/master/MasterVendor'))
const MasterBudget = lazy(() => import('./pages/master/MasterBudget'))
const MasterPerusahaan = lazy(() => import('./pages/master/MasterPerusahaan'))
const MasterBisnisUnit = lazy(() => import('./pages/master/MasterBisnisUnit'))
const ManajemenUser = lazy(() => import('./pages/ManajemenUser'))
const Profil = lazy(() => import('./pages/Profil'))

function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
    </div>
  )
}

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
        <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/pengajuan" element={<AppLayout><DaftarPengajuan /></AppLayout>} />
          <Route path="/pengajuan/baru" element={<AppLayout><ProtectedRoute allowedRoles={['admin', 'staff']}><BuatPengajuan /></ProtectedRoute></AppLayout>} />
          <Route path="/pengajuan/import" element={<AppLayout><ProtectedRoute allowedRoles={['admin']}><ImportPengajuan /></ProtectedRoute></AppLayout>} />
          <Route path="/pengajuan/:id" element={<AppLayout><DetailPengajuan /></AppLayout>} />
          <Route path="/pengajuan/:id/edit" element={<AppLayout><ProtectedRoute allowedRoles={['admin', 'staff']}><EditPengajuan /></ProtectedRoute></AppLayout>} />
          <Route path="/laporan" element={<AppLayout><ProtectedRoute allowedRoles={['admin', 'finance', 'viewer', 'head', 'bod']}><Laporan /></ProtectedRoute></AppLayout>} />
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
        </Suspense>
      </BrowserRouter>
      </MasterDataProvider>
    </AuthProvider>
  )
}
