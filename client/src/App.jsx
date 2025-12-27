import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import AssetDetail from './pages/AssetDetail';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import AssignmentForm from './pages/AssignmentForm';
import PurchaseOrderForm from './pages/PurchaseOrderForm';
import PurchaseOrderList from './pages/PurchaseOrderList';
import PurchaseOrderDetail from './pages/PurchaseOrderDetail';
import EmployeeList from './pages/EmployeeList';
import EmployeeDetail from './pages/EmployeeDetail';
import EmployeeForm from './pages/EmployeeForm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <div className="flex h-screen bg-gray-100">
                <Sidebar />
                <main className="flex-1 h-full overflow-y-auto">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/assets" element={<Assets />} />
                    <Route path="/assets/:id" element={<AssetDetail />} />
                    <Route path="/purchase-orders" element={<PurchaseOrderList />} />
                    <Route path="/assignments/new" element={<AssignmentForm />} />
                    <Route path="/purchase-orders/new" element={<PurchaseOrderForm />} />
                    <Route path="/purchase-orders/:id" element={<PurchaseOrderDetail />} />
                    <Route path="/holders" element={<EmployeeList />} />
                    <Route path="/holders/new" element={<EmployeeForm />} />
                    <Route path="/employees/:id" element={<EmployeeDetail />} />
                  </Routes>
                </main>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
export default App;