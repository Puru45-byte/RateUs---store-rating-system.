import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import StatCard from '../components/StatCard';
import api from '../utils/api';
import { Users, Store, Star } from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
  deltas: {
    users: number;
    stores: number;
    ratings: number;
  };
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (err: any) {
      console.error('Error fetching admin stats', err);
      setError(
        err.response?.data?.message || 'Failed to load administrator metrics overview.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6 text-left">
        <div>
          <h2 className="text-2xl font-extrabold text-heading">Admin Dashboard</h2>
          <p className="text-sm text-muted">
            Welcome to the System Administrator console. Track platform usage and system stats.
          </p>
        </div>

        {loading ? (
          <div className="min-h-[50vh] flex flex-col justify-center items-center gap-3">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-muted">Loading metrics overview...</p>
          </div>
        ) : error ? (
          <div className="bg-surface rounded-card border border-border/40 p-8 flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-4">
            <div className="text-danger text-2xl">⚠️</div>
            <h3 className="text-base font-bold text-heading">Unable to load metrics</h3>
            <p className="text-xs text-body">{error}</p>
            <button
              type="button"
              onClick={fetchStats}
              className="px-4 py-2 bg-primary text-white rounded-btn text-xs font-bold transition-all focus:outline-none"
            >
              Retry
            </button>
          </div>
        ) : stats ? (
          <div className="space-y-8">
            {/* 3 Stat Cards Row */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                icon={<Users className="w-5 h-5" />}
                value={stats.totalUsers}
                label="Total Users"
                delta={`+${stats.deltas.users} vs last month`}
                iconBgColor="bg-blue-50"
                iconColor="text-blue-600"
              />
              <StatCard
                icon={<Store className="w-5 h-5" />}
                value={stats.totalStores}
                label="Total Stores"
                delta={`+${stats.deltas.stores} vs last month`}
                iconBgColor="bg-primary/10"
                iconColor="text-primary"
              />
              <StatCard
                icon={<Star className="w-5 h-5 fill-gold stroke-gold" />}
                value={stats.totalRatings}
                label="Total Ratings Submitted"
                delta={`+${stats.deltas.ratings} vs last month`}
                iconBgColor="bg-yellow-50"
                iconColor="text-gold"
              />
            </section>

            {/* Quick Actions Panel */}
            <div className="bg-surface p-6 rounded-card border border-border/40 shadow-soft space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-heading font-sans">Quick Administrator Links</h3>
                <p className="text-xs text-muted">Direct links to manage platforms objects</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  type="button"
                  className="p-4 border border-border/60 rounded-btn text-left hover:border-primary/50 hover:bg-surface-soft transition-all focus:outline-none"
                >
                  <h4 className="text-xs font-bold text-heading">Manage Users</h4>
                  <p className="text-[11px] text-muted mt-1">Add, suspend, or modify client/owner credentials.</p>
                </button>
                <button
                  type="button"
                  className="p-4 border border-border/60 rounded-btn text-left hover:border-primary/50 hover:bg-surface-soft transition-all focus:outline-none"
                >
                  <h4 className="text-xs font-bold text-heading">Register New Stores</h4>
                  <p className="text-[11px] text-muted mt-1">Review validation and create store objects.</p>
                </button>
                <button
                  type="button"
                  className="p-4 border border-border/60 rounded-btn text-left hover:border-primary/50 hover:bg-surface-soft transition-all focus:outline-none"
                >
                  <h4 className="text-xs font-bold text-heading">Platform Settings</h4>
                  <p className="text-[11px] text-muted mt-1">Configure global constraints and properties.</p>
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
