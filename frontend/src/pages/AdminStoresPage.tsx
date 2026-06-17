import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import Button from '../components/Button';
import api from '../utils/api';
import {
  Star,
  ArrowUpDown,
  Mail,
  MapPin,
  Eye,
  Plus,
  X,
  User as UserIcon,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

interface Store {
  id: string;
  name: string;
  email: string;
  address: string;
  averageRating: number;
  totalRatings: number;
  owner?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface OwnerSelect {
  id: string;
  name: string;
  email: string;
  role: string;
  storeRating?: number | null;
}

export const AdminStoresPage: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [unassignedOwners, setUnassignedOwners] = useState<OwnerSelect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sorting State
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Modals state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const [addModalOpen, setAddModalOpen] = useState(false);

  // Add Store Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [ownerId, setOwnerId] = useState('');

  // Inline validation errors state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchStores = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/admin/stores');
      setStores(res.data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch stores directory list.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnassignedOwners = async () => {
    try {
      // Fetch users with STORE_OWNER role
      const res = await api.get('/admin/users', { params: { role: 'STORE_OWNER' } });
      // Filter out those who already own a store (in our payload, storeRating/store would be null if no store)
      const filtered = res.data.filter((u: any) => !u.storeId && !u.store);
      setUnassignedOwners(filtered);
    } catch (e) {
      console.error('Failed to load unassigned owners lists', e);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    if (addModalOpen) {
      fetchUnassignedOwners();
    }
  }, [addModalOpen]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedStores = [...stores].sort((a: any, b: any) => {
    let comparison = 0;
    if (sortField === 'name') comparison = a.name.localeCompare(b.name);
    else if (sortField === 'email') comparison = a.email.localeCompare(b.email);
    else if (sortField === 'address') comparison = a.address.localeCompare(b.address);
    else if (sortField === 'rating') comparison = a.averageRating - b.averageRating;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (name.length < 5 || name.length > 60) {
      errors.name = 'Store name must be between 5 and 60 characters long.';
    }

    if (address.length > 400) {
      errors.address = 'Store address must be at most 400 characters long.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email = 'Invalid store email address format.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!validateForm()) return;

    setSubmitting(true);
    const payload: any = { name, email, address };
    if (ownerId) payload.ownerId = ownerId;

    try {
      await api.post('/admin/stores', payload);
      setAddModalOpen(false);
      // Reset form fields
      setName('');
      setEmail('');
      setAddress('');
      setOwnerId('');
      setFormErrors({});
      fetchStores();
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed to create store page.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenView = (store: Store) => {
    setSelectedStore(store);
    setViewModalOpen(true);
  };

  const SortIcon = ({ field }: { field: string }) => {
    const active = sortField === field;
    if (!active) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-muted/40 shrink-0" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 text-primary shrink-0 font-bold" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-primary shrink-0 font-bold" />
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6 text-left relative">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-heading">Stores Directory</h2>
            <p className="text-sm text-muted">Manage system stores, sorting, and owner associations.</p>
          </div>
          <Button
            variant="primary"
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-1.5 py-2 px-4 font-bold text-xs"
          >
            <Plus className="w-4 h-4" /> Add New Store
          </Button>
        </div>

        {/* Data Table */}
        {loading ? (
          <div className="bg-surface rounded-card border border-border/40 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse animate-pulse text-xs">
                <thead>
                  <tr className="bg-surface-soft border-b border-border/60">
                    <th className="px-6 py-4 font-bold text-heading uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 font-bold text-heading uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 font-bold text-heading uppercase tracking-wider">Address</th>
                    <th className="px-6 py-4 font-bold text-heading uppercase tracking-wider">Rating (Avg)</th>
                    <th className="px-6 py-4 font-bold text-heading uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><div className="h-4 bg-muted/20 rounded w-28"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-muted/20 rounded w-36"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-muted/20 rounded w-48"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-muted/20 rounded w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-muted/20 rounded w-12"></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : error ? (
          <div className="bg-surface rounded-card border border-border/40 p-8 text-center text-danger">{error}</div>
        ) : sortedStores.length === 0 ? (
          <div className="bg-surface rounded-card border border-border/40 p-12 text-center text-xs text-muted">
            No stores registered on the platform.
          </div>
        ) : (
          <div className="bg-surface rounded-card border border-border/40 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-soft border-b border-border/60">
                    <th className="px-6 py-4 text-xs font-bold text-heading uppercase tracking-wider cursor-pointer hover:bg-surface-soft/80 select-none" onClick={() => handleSort('name')}>
                      <div className="flex items-center gap-1.5">Name <SortIcon field="name" /></div>
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-heading uppercase tracking-wider cursor-pointer hover:bg-surface-soft/80 select-none" onClick={() => handleSort('email')}>
                      <div className="flex items-center gap-1.5">Email <SortIcon field="email" /></div>
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-heading uppercase tracking-wider cursor-pointer hover:bg-surface-soft/80 select-none" onClick={() => handleSort('address')}>
                      <div className="flex items-center gap-1.5">Address <SortIcon field="address" /></div>
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-heading uppercase tracking-wider cursor-pointer hover:bg-surface-soft/80 select-none" onClick={() => handleSort('rating')}>
                      <div className="flex items-center gap-1.5">Rating (Avg) <SortIcon field="rating" /></div>
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-heading uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-xs">
                  {sortedStores.map((s) => (
                    <tr key={s.id} className="hover:bg-surface-soft/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-heading">{s.name}</td>
                      <td className="px-6 py-4 text-muted font-medium">{s.email}</td>
                      <td className="px-6 py-4 max-w-[200px] truncate text-body">{s.address}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-[10px] font-extrabold text-success bg-success/15 px-2 py-0.5 rounded-full border border-success/20 inline-flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-gold stroke-gold" />
                          {s.averageRating > 0 ? `${s.averageRating} (${s.totalRatings})` : 'New'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleOpenView(s)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-btn bg-primary/10 hover:bg-primary text-primary hover:text-white font-bold transition-all text-[10px] focus:outline-none"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DETAIL VIEW MODAL */}
        {viewModalOpen && selectedStore && (
          <div className="fixed inset-0 bg-heading/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface w-full max-w-md p-6 rounded-card shadow-2xl border border-border flex flex-col relative">
              <button type="button" className="absolute top-4 right-4 p-1 text-muted hover:text-heading" onClick={() => setViewModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-heading mb-4 border-b border-border/60 pb-2">Store Details</h3>
              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-2.5">
                  <span className="w-4 h-4 text-primary shrink-0 mt-0.5 text-base">🏢</span>
                  <div>
                    <span className="font-bold text-muted uppercase text-[9px] block">Store Name</span>
                    <span className="font-bold text-heading">{selectedStore.name}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-muted uppercase text-[9px] block">Store Email</span>
                    <span className="font-bold text-heading">{selectedStore.email}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-muted uppercase text-[9px] block">Physical Address</span>
                    <span className="font-semibold text-heading whitespace-pre-line">{selectedStore.address}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Star className="w-4 h-4 fill-gold stroke-gold shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-muted uppercase text-[9px] block">Average Rating</span>
                    <span className="font-bold text-success text-sm mt-0.5 block">
                      {selectedStore.averageRating > 0 ? `${selectedStore.averageRating} / 5 (${selectedStore.totalRatings} ratings)` : 'No ratings received yet.'}
                    </span>
                  </div>
                </div>

                <div className="border-t border-border/60 pt-4 space-y-3">
                  <h4 className="font-bold text-heading flex items-center gap-1.5"><UserIcon className="w-4.5 h-4.5 text-primary" /> Store Owner Info</h4>
                  {selectedStore.owner ? (
                    <div className="bg-surface-soft p-3 rounded-btn border border-border/40 space-y-2">
                      <div>
                        <span className="font-bold text-muted uppercase text-[9px] block">Owner Name</span>
                        <span className="font-bold text-heading">{selectedStore.owner.name}</span>
                      </div>
                      <div>
                        <span className="font-bold text-muted uppercase text-[9px] block">Owner Email</span>
                        <span className="font-medium text-heading">{selectedStore.owner.email}</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted italic block text-xs">No owner associated with this store yet.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ADD STORE MODAL FORM */}
        {addModalOpen && (
          <div className="fixed inset-0 bg-heading/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface w-full max-w-md p-6 rounded-card shadow-2xl border border-border flex flex-col relative max-h-[90vh]">
              <button type="button" className="absolute top-4 right-4 p-1 text-muted hover:text-heading focus:outline-none" onClick={() => setAddModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-heading mb-4 border-b border-border/60 pb-2">Add New Store</h3>

              {submitError && (
                <div className="mb-4 p-3 bg-danger/10 text-danger border border-danger/20 rounded-btn text-xs font-semibold">
                  {submitError}
                </div>
              )}

              <form onSubmit={handleAddSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
                
                {/* Store Name */}
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1">Store Name (min 20 characters)</label>
                  <input
                    type="text"
                    required
                    className={`w-full px-3 py-2 border rounded-btn text-xs bg-surface-soft text-heading focus:outline-none ${formErrors.name ? 'border-danger focus:border-danger' : 'border-border focus:border-primary'}`}
                    placeholder="e.g. Chicago Plaza Fashion Outlet Store"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  {formErrors.name && <p className="text-[10px] text-danger mt-1 font-semibold">{formErrors.name}</p>}
                </div>

                {/* Store Email */}
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1">Store Email</label>
                  <input
                    type="email"
                    required
                    className={`w-full px-3 py-2 border rounded-btn text-xs bg-surface-soft text-heading focus:outline-none ${formErrors.email ? 'border-danger focus:border-danger' : 'border-border focus:border-primary'}`}
                    placeholder="store@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {formErrors.email && <p className="text-[10px] text-danger mt-1 font-semibold">{formErrors.email}</p>}
                </div>

                {/* Store Address */}
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1">Physical Address (max 400 characters)</label>
                  <textarea
                    required
                    rows={2.5}
                    className={`w-full px-3 py-2 border rounded-btn text-xs bg-surface-soft text-heading focus:outline-none resize-none ${formErrors.address ? 'border-danger focus:border-danger' : 'border-border focus:border-primary'}`}
                    placeholder="Physical address..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                  {formErrors.address && <p className="text-[10px] text-danger mt-1 font-semibold">{formErrors.address}</p>}
                </div>

                {/* Owner Link */}
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1">Associate Owner (Optional)</label>
                  {unassignedOwners.length === 0 ? (
                    <span className="text-[10px] text-muted italic block py-1">No unassigned Store Owners available. Add a Store Owner user first.</span>
                  ) : (
                    <select
                      className="w-full px-3 py-2 border border-border bg-surface-soft rounded-btn text-xs focus:outline-none focus:border-primary text-heading font-semibold"
                      value={ownerId}
                      onChange={(e) => setOwnerId(e.target.value)}
                    >
                      <option value="">-- No Owner --</option>
                      {unassignedOwners.map((o) => (
                        <option key={o.id} value={o.id}>{o.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-border/60">
                  <Button variant="outline" className="flex-1 py-2.5" onClick={() => setAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" className="flex-1 py-2.5" type="submit" disabled={submitting}>
                    {submitting ? 'Creating Store...' : 'Add Store'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminStoresPage;
