import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Store as StoreIcon,
  BarChart3,
  MessageCircle,
  Users,
  Settings,
  User as UserIcon,
  Key,
  LogOut,
  Bell,
  ChevronDown,
  Menu,
  X,
  HelpCircle,
  Search,
} from 'lucide-react';

interface StoreLayoutProps {
  children: React.ReactNode;
  storeName?: string;
}

export const StoreLayout: React.FC<StoreLayoutProps> = ({ children, storeName }) => {
  const { logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const displayName = storeName || 'My Store';

  // Helper to check if link is active
  const isActive = (path: string) => {
    if (path === '/store') {
      return location.pathname === '/store' || location.pathname === '/store/';
    }
    return location.pathname.startsWith(path);
  };

  const navItemClass = (active: boolean) =>
    `w-full flex items-center gap-3 px-4 py-2.5 rounded-btn text-xs font-bold transition-all duration-200 text-left ${
      active
        ? 'bg-primary text-white shadow-md shadow-primary/20'
        : 'text-body hover:bg-surface-soft hover:text-primary'
    }`;

  const renderNavLinks = () => {
    return (
      <nav className="space-y-1 text-left">
        <Link to="/store" className={navItemClass(isActive('/store') && !isActive('/store/reviews') && !isActive('/store/manage') && !isActive('/store/analytics') && !isActive('/store/respond') && !isActive('/store/followers') && !isActive('/store/settings'))}>
          <LayoutDashboard className="w-4.5 h-4.5" /> Dashboard
        </Link>

        <Link to="/store/reviews" className={navItemClass(isActive('/store/reviews'))}>
          <MessageSquare className="w-4.5 h-4.5" /> Reviews
        </Link>

        <Link to="/store/manage" className={navItemClass(isActive('/store/manage'))}>
          <StoreIcon className="w-4.5 h-4.5" /> Manage Store
        </Link>

        <Link to="/store/analytics" className={navItemClass(isActive('/store/analytics'))}>
          <BarChart3 className="w-4.5 h-4.5" /> Analytics
        </Link>

        <Link to="/store/respond" className={navItemClass(isActive('/store/respond'))}>
          <MessageCircle className="w-4.5 h-4.5" /> Respond to Reviews
        </Link>

        <Link to="/store/followers" className={navItemClass(isActive('/store/followers'))}>
          <Users className="w-4.5 h-4.5" /> Users & Followers
        </Link>

        <Link to="/store/settings" className={navItemClass(isActive('/store/settings'))}>
          <Settings className="w-4.5 h-4.5" /> Settings
        </Link>

        <div className="border-t border-border/60 my-3" />

        <Link to="/app/profile" className={navItemClass(isActive('/app/profile'))}>
          <UserIcon className="w-4.5 h-4.5" /> Profile
        </Link>

        <Link to="/app/change-password" className={navItemClass(isActive('/app/change-password'))}>
          <Key className="w-4.5 h-4.5" /> Change Password
        </Link>

        <div className="border-t border-border/60 my-3" />

        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-btn text-xs font-semibold text-danger hover:bg-danger/5 transition-all text-left"
        >
          <LogOut className="w-4.5 h-4.5" /> Logout
        </button>
      </nav>
    );
  };

  return (
    <div className="min-h-screen bg-background flex font-sans relative overflow-x-hidden">
      
      {/* SIDEBAR FOR DESKTOP & MOBILE */}
      <aside
        className={`fixed inset-y-0 left-0 w-[260px] bg-surface border-r border-border/60 z-40 transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col justify-between p-5 overflow-y-auto">
          <div className="space-y-6">
            <div className="flex flex-col text-left">
              <div className="flex items-center justify-between">
                <Logo />
                <button
                  type="button"
                  className="md:hidden text-heading focus:outline-none"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <span className="text-[10px] font-extrabold text-primary tracking-wider uppercase ml-12 -mt-1 block">
                Store Owner
              </span>
            </div>

            {renderNavLinks()}

            {/* Sidebar Lavender Promo Card */}
            <div className="bg-lavender p-5 rounded-card text-left space-y-2 relative overflow-hidden">
              <div className="z-10 relative">
                <span className="text-xs font-extrabold text-primary tracking-wide block">Grow Your Store</span>
                <p className="text-[11px] text-body mt-1 leading-relaxed">
                  Respond to reviews and engage with customers to build trust and grow.
                </p>
                <button
                  type="button"
                  className="w-full py-2 text-xs mt-3 bg-transparent border border-primary text-primary hover:bg-primary hover:text-white rounded-btn font-bold block text-center transition-all duration-200 focus:outline-none"
                >
                  View Tips
                </button>
              </div>
              
              <div className="absolute right-[-10px] bottom-[-20px] opacity-10 text-5xl">
                🚀
              </div>
            </div>
          </div>

          {/* User role indicator at bottom */}
          <div className="bg-surface-soft border border-border/60 p-4 rounded-card text-left flex items-center gap-3 mt-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-lg">
              💼
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-heading truncate max-w-[140px]">{displayName}</h4>
              <span className="text-[9px] font-bold text-muted uppercase tracking-wider">Store Owner</span>
            </div>
          </div>
        </div>
      </aside>

      {/* BACKDROP FOR MOBILE */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-heading/40 backdrop-blur-xs z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MAIN CONTAINER */}
      <div className="flex-1 md:pl-[260px] flex flex-col min-h-screen">
        
        {/* TOP BAR */}
        <header className="h-[70px] bg-surface border-b border-border/40 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="md:hidden text-heading focus:outline-none"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Centered Search Input */}
          <div className="relative max-w-md w-full mx-4 hidden md:block">
            <span className="absolute left-4 top-2.5 text-muted">
              <Search className="w-4.5 h-4.5" />
            </span>
            <input
              type="text"
              className="w-full pl-11 pr-4 py-2 rounded-btn border border-border bg-surface-soft focus:outline-none focus:border-primary text-xs text-heading"
              placeholder="Search anything..."
            />
          </div>

          <div className="flex items-center gap-4 ml-auto md:ml-0">
            {/* Help Icon */}
            <button
              type="button"
              className="p-1.5 rounded-full hover:bg-surface-soft text-body transition-colors focus:outline-none"
              title="Help & Support"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* Notification bell */}
            <button
              type="button"
              className="relative p-1.5 rounded-full hover:bg-surface-soft text-body transition-colors focus:outline-none"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-surface">
                5
              </span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 p-1 rounded-full hover:bg-surface-soft transition-colors text-left focus:outline-none"
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-base">
                  🏢
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-sm font-bold text-heading leading-tight max-w-[120px] truncate">{displayName}</span>
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Store Owner</span>
                </div>
                <ChevronDown className="w-4 h-4 text-muted hidden sm:block" />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-surface rounded-btn shadow-lg border border-border py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-155">
                    <Link
                      to="/app/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="block text-left px-4 py-2.5 text-sm text-body hover:bg-surface-soft hover:text-primary font-semibold"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/app/change-password"
                      onClick={() => setDropdownOpen(false)}
                      className="block text-left px-4 py-2.5 text-sm text-body hover:bg-surface-soft hover:text-primary font-semibold"
                    >
                      Change Password
                    </Link>
                    <div className="border-t border-border/60 my-1" />
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-danger hover:bg-danger/5 font-semibold"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 bg-background p-6">
          {children}
        </main>
      </div>

    </div>
  );
};

export default StoreLayout;
