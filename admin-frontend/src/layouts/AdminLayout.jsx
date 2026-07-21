import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ExternalLink,
  Globe,
  ChevronDown,
  User,
  Menu,
} from 'lucide-react';

const PUBLIC_SITE_URL = import.meta.env.VITE_PUBLIC_SITE_URL || 'https://kings-tv.vercel.app';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
];

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const currentPage = navItems.find((item) => item.path === location.pathname);
  const pageTitle = currentPage ? currentPage.label : 'Admin';

  const handleLogout = () => {
    localStorage.removeItem('admin_jwt_token');
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-dark text-white transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'w-[68px]' : 'w-[250px]'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-sm shrink-0">
            K
          </div>
          {!sidebarCollapsed && (
            <span className="text-lg font-semibold whitespace-nowrap overflow-hidden">
              Kings TV Admin
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-400 hover:bg-dark-lighter hover:text-white'
                }`}
                title={item.label}
              >
                <Icon size={20} className="shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="flex items-center justify-center h-12 border-t border-white/10 text-gray-400 hover:text-white transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-semibold text-gray-800">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* View Site */}
            <a
              href={PUBLIC_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ExternalLink size={14} />
              <span className="hidden sm:inline">View Site</span>
            </a>

            {/* Language Switcher Stub */}
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
              <Globe size={14} />
              <span className="hidden sm:inline">EN</span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User size={16} className="text-primary" />
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">Admin</span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
