import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  PenSquare,
  FileText,
  Navigation,
  BookOpen,
  Rss,
  Tag,
  LayoutGrid,
  BarChart2,
  Image,
  MessageSquare,
  Mail,
  Send,
  Gift,
  MonitorPlay,
  Users,
  ShieldCheck,
  Search,
  Share2,
  Globe,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ExternalLink,
  ChevronDown,
  User,
  Menu,
} from 'lucide-react';

const PUBLIC_SITE_URL = import.meta.env.VITE_PUBLIC_SITE_URL || 'https://kings-tv.vercel.app';

const NAV_ITEMS = [
  { key: 'admin_panel',      label: 'Dashboard',         icon: LayoutDashboard, path: '/' },
  { key: 'add_post',         label: 'Add Post',           icon: PenSquare,       path: '/add-post' },
  { key: 'manage_all_posts', label: 'All Posts',          icon: FileText,        path: '/posts' },
  { key: 'navigation',       label: 'Navigation',         icon: Navigation,      path: '/navigation' },
  { key: 'pages',            label: 'Pages',              icon: BookOpen,        path: '/pages' },
  { key: 'rss_feeds',        label: 'RSS Feeds',          icon: Rss,             path: '/rss' },
  { key: 'categories',       label: 'Categories',         icon: Tag,             path: '/categories' },
  { key: 'widgets',          label: 'Widgets',            icon: LayoutGrid,      path: '/widgets' },
  { key: 'polls',            label: 'Polls',              icon: BarChart2,       path: '/polls' },
  { key: 'gallery',          label: 'Gallery',            icon: Image,           path: '/gallery' },
  { key: 'comments',         label: 'Comments',           icon: MessageSquare,   path: '/comments' },
  { key: 'contact_messages', label: 'Contact',            icon: Mail,            path: '/contact' },
  { key: 'newsletter',       label: 'Newsletter',         icon: Send,            path: '/newsletter' },
  { key: 'reward_system',    label: 'Rewards',            icon: Gift,            path: '/rewards' },
  { key: 'ad_spaces',        label: 'Ad Spaces',          icon: MonitorPlay,     path: '/ads' },
  { key: 'users',            label: 'Users',              icon: Users,           path: '/users/administrators',
    children: [
      { label: 'Administrators', path: '/users/administrators' },
      { label: 'Registered Users', path: '/users' },
    ]
  },
  { key: 'roles_permissions',label: 'Roles & Permissions',icon: ShieldCheck,    path: '/roles-permissions' },
  { key: 'seo_tools',        label: 'SEO Tools',          icon: Search,          path: '/seo' },
  { key: 'social_login',     label: 'Social Login',       icon: Share2,          path: '/social-login' },
  { key: 'languages',        label: 'Languages',          icon: Globe,           path: '/languages' },
  { key: 'settings',         label: 'Settings',           icon: Settings,        path: '/settings' },
];

function NavItem({ item, collapsed }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isActive = item.children
    ? item.children.some(c => location.pathname.startsWith(c.path))
    : location.pathname === item.path;

  const Icon = item.icon;

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-3 w-full mx-auto px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive ? 'bg-[#B3732A] text-white' : 'text-gray-400 hover:bg-[#2b2b40] hover:text-white'
          }`}
          title={item.label}
        >
          <Icon size={18} className="shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
            </>
          )}
        </button>
        {!collapsed && open && (
          <div className="ml-7 mt-1 space-y-1">
            {item.children.map(child => (
              <NavLink
                key={child.path}
                to={child.path}
                className={({ isActive }) =>
                  `block px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive ? 'text-[#B3732A]' : 'text-gray-500 hover:text-white'
                  }`
                }
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive ? 'bg-[#B3732A] text-white' : 'text-gray-400 hover:bg-[#2b2b40] hover:text-white'
        }`
      }
      title={item.label}
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  );
}

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, permissions, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Compute page title from current nav item
  const currentNav = NAV_ITEMS.find(item =>
    item.children
      ? item.children.some(c => location.pathname.startsWith(c.path))
      : location.pathname === item.path
  );
  const pageTitle = currentNav?.label || 'Admin';

  // Filter nav items to only show permitted sections
  const visibleNavItems = NAV_ITEMS.filter(item => hasPermission(item.key));

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f6fa]">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-[#1e1e2d] text-white transition-all duration-300 ease-in-out shrink-0 ${
          sidebarCollapsed ? 'w-[68px]' : 'w-[240px]'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#B3732A] flex items-center justify-center font-bold text-sm shrink-0 shadow-lg">
            K
          </div>
          {!sidebarCollapsed && (
            <span className="text-sm font-semibold whitespace-nowrap truncate">Kings TV Admin</span>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto space-y-0.5">
          {visibleNavItems.map(item => (
            <NavItem key={item.key} item={item} collapsed={sidebarCollapsed} />
          ))}
        </nav>

        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="flex items-center justify-center h-11 border-t border-white/10 text-gray-400 hover:text-white transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
            >
              <Menu size={18} />
            </button>
            <h1 className="text-base font-semibold text-gray-800">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={PUBLIC_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ExternalLink size={13} />
              <span className="hidden sm:inline">View Site</span>
            </a>

            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
              <Globe size={13} />
              <span className="hidden sm:inline">EN</span>
            </button>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-[#B3732A]/10 flex items-center justify-center">
                  <User size={14} className="text-[#B3732A]" />
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-medium text-gray-700 leading-tight">{user?.fullName || 'Admin'}</div>
                  <div className="text-[10px] text-gray-400 leading-tight">{user?.role?.replace(/_/g, ' ')}</div>
                </div>
                <ChevronDown size={12} className="text-gray-400" />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-20 py-1">
                    <div className="px-4 py-2.5 border-b border-gray-50">
                      <p className="text-xs font-medium text-gray-800">{user?.fullName}</p>
                      <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={14} />
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
