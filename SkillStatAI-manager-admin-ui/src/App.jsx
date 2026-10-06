import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminDashboard from './components/AdminDashboard';
import AdminMaterialsQuiz from './components/AdminMaterialsQuiz';
import DepartmentDetails from './components/DepartmentDetails';
import DepartmentComparison from './components/DepartmentComparison';
import ManagerDetails from './components/ManagerDetails';
import ManagerEmployees from './components/ManagerEmployees';
import EmployeeDetails from './components/EmployeeDetails';
import ManagerDashboard from './components/ManagerDashboard';
import MyEmployees from './components/MyEmployees';
import Login from './components/Login';

function Page({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'trainer') return <Navigate to="/admin/materials" replace />;
  if (user.role === 'manager') return <Navigate to="/manager" replace />;
  return <Navigate to="/admin" replace />;
}

function NavigationBar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-[#EDEBE6] px-8 py-5 flex items-center justify-between">
      <Link to="/" className="text-xl font-extrabold text-[#14140F]">
        CAPACITY CONNECT
      </Link>
      <div className="flex items-center gap-6">
        {user?.role === 'admin' && (
          <Link to="/admin" className="text-sm font-medium text-[#5B5850] hover:text-[#14140F] transition-colors">
            Admin Dashboard
          </Link>
        )}
        {(user?.role === 'admin' || user?.role === 'trainer') && (
          <Link to="/admin/materials" className="text-sm font-medium text-[#5B5850] hover:text-[#14140F] transition-colors">
            Trainer Studio
          </Link>
        )}
        {user?.role === 'manager' && (
          <Link to="/manager" className="text-sm font-medium text-[#5B5850] hover:text-[#14140F] transition-colors">
            Manager Dashboard
          </Link>
        )}
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#5B5850]">
              {user.name} ({user.role})
            </span>
            <button
              onClick={logout}
              className="text-xs font-semibold bg-[#EDEBE6] text-[#14140F] px-3 py-1.5 rounded-full hover:bg-[#E0DED8] transition-colors"
            >
              Log out
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="text-sm font-semibold bg-[#14140F] text-white px-4 py-2 rounded-full hover:bg-[#2B2A24] transition-colors"
          >
            Log in
          </Link>
        )}
      </div>
    </nav>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/admin" element={<Page><AdminDashboard /></Page>} />
        <Route path="/admin/materials" element={<Page><AdminMaterialsQuiz /></Page>} />
        <Route path="/admin/compare" element={<Page><DepartmentComparison /></Page>} />
        <Route path="/admin/department/:departmentId" element={<Page><DepartmentDetails /></Page>} />
        <Route path="/admin/manager/:managerId" element={<Page><ManagerDetails /></Page>} />
        <Route path="/admin/manager/:managerId/employees" element={<Page><ManagerEmployees /></Page>} />
        <Route path="/admin/employee/:employeeId" element={<Page><EmployeeDetails backTo="/admin" /></Page>} />
        <Route path="/login" element={<Page><Login /></Page>} />
        <Route path="/manager" element={<Page><ManagerDashboard /></Page>} />
        <Route path="/manager/employees" element={<Page><MyEmployees /></Page>} />
        <Route path="/manager/employee/:employeeId" element={<Page><EmployeeDetails backTo="/manager/employees" /></Page>} />
        <Route path="/" element={<RootRedirect />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#FAFAF9]">
          <NavigationBar />
          <AnimatedRoutes />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
