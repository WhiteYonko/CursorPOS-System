import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, ShoppingCart, Bell, Sun, Moon } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';

function Header() {
  const { toggleSidebar } = useApp();
  const { items, total } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-30 bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 py-4 px-4 md:px-6 shadow-sm">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="mr-4 p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-xl font-semibold text-slate-800 dark:text-white">
          Dashboard
        </h1>
        <div className="flex-1" />
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notifications */}
          <button className="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center">
              2
            </span>
          </button>
          
          {/* Cart Button */}
          <button 
            className="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 relative flex items-center"
            onClick={() => navigate('/sales')}
          >
            <ShoppingCart size={20} />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
            {total > 0 && (
              <span className="ml-2 text-sm font-medium hidden md:inline-block dark:text-slate-300">
                ${total.toFixed(2)}
              </span>
            )}
          </button>
          
          {/* User Profile */}
          <div className="flex items-center space-x-2">
            <div className="h-9 w-9 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-medium">
              AD
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden md:inline-block">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;