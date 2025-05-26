import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { ThemeProvider } from "./context/ThemeContext";
import { DatabaseProvider } from "./context/DatabaseContext";
import { CartProvider } from "./context/CartContext";
import { NotificationProvider } from "./context/NotificationContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import SalesPage from "./pages/sales/SalesPage";
import ProductsPage from "./pages/products/ProductsPage";
import ProductForm from "./pages/products/ProductForm";
import StockAdjustmentsPage from "./pages/products/StockAdjustmentsPage";
import ReportsPage from "./pages/reports/ReportsPage";
import PaymentPage from "./pages/payment/PaymentPage";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";

console.log("App component rendering"); // Debug log

function ProtectedRoute({ roles }: { roles?: string[] }) {
	const { user } = useAuth();
	if (!user) return <Navigate to="/login" replace />;
	if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
	return <Outlet />;
}

function App() {
	return (
		<NotificationProvider>
			<DatabaseProvider>
				<ThemeProvider>
					<AppProvider>
						<AuthProvider>
							<BrowserRouter>
								<CartProvider>
									<Routes>
										<Route path="/login" element={<Login />} />
										<Route element={<ProtectedRoute />}>
											<Route path="/" element={<Layout />}>
												<Route index element={<Dashboard />} />
												<Route
													path="sales"
													element={<SalesPage />}
												/>
												<Route
													path="products"
													element={<ProductsPage />}
												/>
												<Route
													path="products/new"
													element={<ProductForm />}
												/>
												<Route
													path="products/stock"
													element={<StockAdjustmentsPage />}
												/>
												<Route
													path="products/:id"
													element={<ProductForm />}
												/>
												<Route
													path="reports"
													element={<ReportsPage />}
												/>
												<Route
													path="payment"
													element={<PaymentPage />}
												/>
											</Route>
											<Route element={<ProtectedRoute roles={['admin']} />}>
												<Route path="/admin" element={<AdminDashboard />} />
											</Route>
										</Route>
									</Routes>
								</CartProvider>
							</BrowserRouter>
						</AuthProvider>
					</AppProvider>
				</ThemeProvider>
			</DatabaseProvider>
		</NotificationProvider>
	);
}

export default App;
