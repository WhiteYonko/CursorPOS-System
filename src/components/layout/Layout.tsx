import React, { Suspense } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useApp } from '../../context/AppContext';
import { ErrorBoundary } from '../ErrorBoundary';
import { useAuth } from '../../context/AuthContext';

function Layout() {
  const { sidebarOpen } = useApp();
  const { user, logout } = useAuth();

  return (
    <div className="relative flex h-screen">
      {/* Sidebar (fixed position) */}
      <Sidebar />
      
      {/* Main Content (flexible width) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header (fixed position) */}
        <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <div className="font-bold flex items-center gap-4">
            POS System
            {user && user.role === 'admin' && (
              <Link to="/admin" className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700">Admin Dashboard</Link>
            )}
          </div>
          {user && (
            <div className="flex items-center gap-4">
              <span>{user.username} ({user.role})</span>
              <button onClick={logout} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">Logout</button>
            </div>
          )}
        </header>
        
        {/* Page Content (scrollable) */}
        <main className={`
          flex-1 overflow-auto p-4 md:p-6 transition-all duration-300
          ${sidebarOpen ? 'md:ml-64' : 'md:ml-16'} /* Adjust margin based on state */
        `}>
          <ErrorBoundary>
            <Suspense fallback={
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            }>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

export default Layout;