import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { NotificationProvider } from "./context/NotificationContext";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import SalesPage from "./pages/sales/SalesPage";
import ProductsPage from "./pages/products/ProductsPage";
import ProductForm from "./pages/products/ProductForm";
import StockAdjustmentsPage from "./pages/products/StockAdjustmentsPage";
import ReportsPage from "./pages/reports/ReportsPage";
import PaymentPage from "./pages/payment/PaymentPage";
import LoginPage from "./pages/auth/LoginPage";

// Protected Route component
function ProtectedRoute({ children, allowedRoles = ['admin', 'manager', 'cashier'] }: { 
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Viewer Route component
function ViewerRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ThemeProvider>
          <AppProvider>
            <BrowserRouter>
              <CartProvider>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  
                  <Route path="/" element={
                    <ViewerRoute>
                      <Layout />
                    </ViewerRoute>
                  }>
                    <Route index element={<Dashboard />} />
                    
                    <Route path="sales" element={
                      <ProtectedRoute allowedRoles={['admin', 'manager', 'cashier']}>
                        <SalesPage />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="products" element={
                      <ProtectedRoute allowedRoles={['admin', 'manager']}>
                        <ProductsPage />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="products/new" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <ProductForm />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="products/stock" element={
                      <ProtectedRoute allowedRoles={['admin', 'manager']}>
                        <StockAdjustmentsPage />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="products/:id" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <ProductForm />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="reports" element={
                      <ProtectedRoute allowedRoles={['admin', 'manager', 'viewer']}>
                        <ReportsPage />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="payment" element={
                      <ProtectedRoute allowedRoles={['admin', 'manager', 'cashier']}>
                        <PaymentPage />
                      </ProtectedRoute>
                    } />
                  </Route>
                </Routes>
              </CartProvider>
            </BrowserRouter>
          </AppProvider>
        </ThemeProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;