import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Store as StoreIcon,
  Star,
  User as UserIcon,
  Key,
  LogOut,
  Bell,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const role = user?.role || 'USER';
  const dashboardPath = role === 'ADMIN' ? '/admin' : role === 'STORE_OWNER' ? '/store' : '/app';

  // Helper to check if link is active
  const isActive = (path: string) => {
    if (path === '/app' || path === '/store' || path === '/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const navItemClass = (active: boolean) =>
    `w-full flex items-center gap-3 px-4 py-3 rounded-btn text-sm font-semibold transition-all duration-200 text-left ${
      active
        ? 'bg-primary text-white shadow-md shadow-primary/20'
        : 'text-body hover:bg-surface-soft hover:text-primary'
    }`;

  const renderNavLinks = () => {
    return (
      <nav className="space-y-1 text-left">
        <Link to={dashboardPath} className={navItemClass(isActive(dashboardPath))}>
          <LayoutDashboard className="w-5 h-5" /> Dashboard
        </Link>

        {role === 'USER' && (
          <Link to="/app/stores" className={navItemClass(isActive('/app/stores'))}>
            <StoreIcon className="w-5 h-5" /> Stores
          </Link>
        )}

        {role === 'USER' && (
          <Link to="/app/ratings" className={navItemClass(isActive('/app/ratings'))}>
            <Star className="w-5 h-5" /> My Ratings
          </Link>
        )}

        <Link to="/app/profile" className={navItemClass(isActive('/app/profile'))}>
          <UserIcon className="w-5 h-5" /> Profile
        </Link>

        <Link to="/app/change-password" className={navItemClass(isActive('/app/change-password'))}>
          <Key className="w-5 h-5" /> Change Password
        </Link>

        <div className="border-t border-border/60 my-4" />

        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-btn text-sm font-semibold text-danger hover:bg-danger/5 transition-all text-left"
        >
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </nav>
    );
  };

  return (
    <div className="min-h-screen bg-background flex font-sans relative overflow-x-hidden">
      
      {/* SIDEBAR FOR DESKTOP */}
      <aside
        className={`fixed inset-y-0 left-0 w-[260px] bg-surface border-r border-border/60 z-40 transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col justify-between p-6 overflow-y-auto">
          <div className="space-y-6">
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

            {renderNavLinks()}

            {/* Sidebar Lavender Promo Card */}
            {role === 'USER' && (
              <div className="bg-lavender p-5 rounded-card text-left space-y-3 relative overflow-hidden">
                <div className="z-10 relative">
                  <span className="text-xs font-bold text-primary tracking-wide">Your reviews</span>
                  <h4 className="text-sm font-extrabold text-heading mt-0.5">Make an impact!</h4>
                  <p className="text-[11px] text-body mt-1 leading-relaxed">
                    Share your experience and help others.
                  </p>
                  <Link
                    to="/app/stores"
                    className="w-full py-2 text-xs mt-3 bg-primary hover:bg-primary-dark text-white rounded-btn font-bold block text-center transition-all duration-200"
                  >
                    Rate Now
                  </Link>
                </div>
                
                {/* Small floating graphic */}
                <div className="absolute right-[-10px] bottom-[-20px] opacity-20 text-5xl">
                  📝
                </div>
              </div>
            )}
          </div>

          {/* User role indicator at bottom */}
          <div className="bg-surface-soft border border-border/60 p-4 rounded-card text-left flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-lg">
              {role === 'ADMIN' ? '🛡️' : role === 'STORE_OWNER' ? '💼' : '👤'}
            </div>
            <div>
              <h4 className="text-xs font-bold text-heading truncate max-w-[140px]">{user?.name}</h4>
              <span className="text-[9px] font-bold text-muted uppercase tracking-wider">{role.replace('_', ' ')}</span>
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
        
        {/* HEADER */}
        <header className="h-[70px] bg-surface border-b border-border/40 px-6 flex items-center justify-between sticky top-0 z-30">
          <button
            type="button"
            className="md:hidden text-heading focus:outline-none"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-6 ml-auto">
            {/* Notification bell placeholder */}
            <button
              type="button"
              className="relative p-1.5 rounded-full hover:bg-surface-soft text-body transition-colors focus:outline-none"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-surface">
                3
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
                  👨
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-sm font-bold text-heading leading-tight">{user?.name}</span>
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider">{role}</span>
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

export default DashboardLayout;
