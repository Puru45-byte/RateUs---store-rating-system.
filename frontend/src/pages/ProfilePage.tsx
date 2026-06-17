import React from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { User as UserIcon, Mail, MapPin, Shield, Calendar } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'System Administrator';
      case 'STORE_OWNER':
        return 'Store Owner';
      case 'USER':
      default:
        return 'Normal User';
    }
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'STORE_OWNER':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'USER':
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  // Generate initials for the avatar placeholder
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto text-left space-y-6">
        
        {/* Page title */}
        <div>
          <h2 className="text-2xl font-extrabold text-heading">My Profile</h2>
          <p className="text-sm text-muted">View your registered personal details and account role</p>
        </div>

        {/* Profile Card */}
        <div className="bg-surface rounded-card border border-border/40 shadow-soft overflow-hidden">
          
          {/* Header background banner decoration */}
          <div className="h-32 bg-gradient-to-r from-primary-light via-primary to-primary-dark relative">
            <div className="absolute right-4 bottom-4 text-white/10 text-7xl font-extrabold select-none">
              TrustRate
            </div>
          </div>

          <div className="p-8 pt-0 relative">
            {/* Avatar & Basic Info */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-12 mb-8">
              <div className="w-24 h-24 rounded-full border-4 border-surface bg-primary text-white text-3xl font-bold flex items-center justify-center shadow-md shrink-0">
                {getInitials(user?.name)}
              </div>
              <div className="space-y-1 pb-1">
                <h3 className="text-xl font-extrabold text-heading">{user?.name}</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getRoleBadgeColor(user?.role)}`}>
                    {getRoleLabel(user?.role)}
                  </span>
                  <span className="text-[11px] text-muted flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Member Since June 2026
                  </span>
                </div>
              </div>
            </div>

            {/* Profile fields list */}
            <div className="border-t border-border/60 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Full Name */}
              <div className="p-4 rounded-btn border border-border/40 bg-surface-soft space-y-1.5">
                <div className="flex items-center gap-2 text-muted text-xs font-bold uppercase tracking-wider">
                  <UserIcon className="w-4 h-4 text-primary" />
                  Full Name
                </div>
                <p className="text-sm font-semibold text-heading">{user?.name || '—'}</p>
              </div>

              {/* Email Address */}
              <div className="p-4 rounded-btn border border-border/40 bg-surface-soft space-y-1.5">
                <div className="flex items-center gap-2 text-muted text-xs font-bold uppercase tracking-wider">
                  <Mail className="w-4 h-4 text-primary" />
                  Email Address
                </div>
                <p className="text-sm font-semibold text-heading truncate">{user?.email || '—'}</p>
              </div>

              {/* Account Role */}
              <div className="p-4 rounded-btn border border-border/40 bg-surface-soft space-y-1.5">
                <div className="flex items-center gap-2 text-muted text-xs font-bold uppercase tracking-wider">
                  <Shield className="w-4 h-4 text-primary" />
                  Account Role
                </div>
                <p className="text-sm font-semibold text-heading">{getRoleLabel(user?.role)}</p>
              </div>

              {/* Physical Address */}
              <div className="p-4 rounded-btn border border-border/40 bg-surface-soft space-y-1.5 md:col-span-2">
                <div className="flex items-center gap-2 text-muted text-xs font-bold uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-primary" />
                  Physical Address
                </div>
                <p className="text-sm font-semibold text-heading leading-relaxed break-words whitespace-pre-line">
                  {user?.address || '—'}
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
