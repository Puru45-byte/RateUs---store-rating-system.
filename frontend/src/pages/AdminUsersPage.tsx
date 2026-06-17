import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import Button from '../components/Button';
import api from '../utils/api';
import {
  Star,
  ArrowUpDown,
  Mail,
  Shield,
  MapPin,
  Eye,
  Plus,
  X,
  Store as StoreIcon,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  role: 'ADMIN' | 'USER' | 'STORE_OWNER';
  storeRating?: number | null;
  store?: {
    id: string;
    name: string;
    email: string;
    address: string;
  } | null;
}

interface StoreSelect {
  id: string;
  name: string;
  owner: any;
}

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [unownedStores, setUnownedStores] = useState<StoreSelect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters State
  const [filterName, setFilterName] = useState('');
  const [filterEmail, setFilterEmail] = useState('');
  const [filterAddress, setFilterAddress] = useState('');
  const [filterRole, setFilterRole] = useState('');

  // Sorting State
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Modals state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [addModalOpen, setAddModalOpen] = useState(false);

  // Add User Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'USER' | 'STORE_OWNER'>('USER');

  // Store owner assignment options
  const [storeLinkType, setStoreLinkType] = useState<'none' | 'existing' | 'new'>('none');
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreEmail, setNewStoreEmail] = useState('');
  const [newStoreAddress, setNewStoreAddress] = useState('');

  // Inline validation errors state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const params: any = {};
      if (filterName) params.name = filterName;
      if (filterEmail) params.email = filterEmail;
      if (filterAddress) params.address = filterAddress;
      if (filterRole) params.role = filterRole;

      const res = await api.get('/admin/users', { params });
      setUsers(res.data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch users list.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnownedStores = async () => {
    try {
      const res = await api.get('/admin/stores');
      const filtered = res.data.filter((s: any) => !s.owner);
      setUnownedStores(filtered);
    } catch (e) {
      console.error('Failed to load stores lists', e);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filterName, filterEmail, filterAddress, filterRole]);

  useEffect(() => {
    if (addModalOpen) {
      fetchUnownedStores();
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

  const sortedUsers = [...users].sort((a: any, b: any) => {
    let comparison = 0;
    if (sortField === 'name') comparison = a.name.localeCompare(b.name);
    else if (sortField === 'email') comparison = a.email.localeCompare(b.email);
    else if (sortField === 'address') comparison = a.address.localeCompare(b.address);
    else if (sortField === 'role') comparison = a.role.localeCompare(b.role);
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (name.length < 5 || name.length > 60) {
      errors.name = 'Name must be between 5 and 60 characters long.';
    }

    if (address.length > 400) {
      errors.address = 'Address must be at most 400 characters long.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email = 'Invalid email address format.';
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;
    if (!passwordRegex.test(password)) {
      errors.password = 'Password must be 8-16 characters long, contain at least one uppercase letter and one special character.';
    }

    if (role === 'STORE_OWNER' && storeLinkType === 'new') {
      if (newStoreName.length < 5 || newStoreName.length > 60) {
        errors.newStoreName = 'Store name must be between 5 and 60 characters long.';
      }
      if (newStoreAddress.length > 400) {
        errors.newStoreAddress = 'Store address must be at most 400 characters long.';
      }
      if (!emailRegex.test(newStoreEmail)) {
        errors.newStoreEmail = 'Invalid store email address format.';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!validateForm()) return;

    setSubmitting(true);
    const payload: any = { name, email, password, address, role };

    if (role === 'STORE_OWNER') {
      if (storeLinkType === 'existing' && selectedStoreId) {
        payload.storeId = selectedStoreId;
      } else if (storeLinkType === 'new') {
        payload.newStore = {
          name: newStoreName,
          email: newStoreEmail,
          address: newStoreAddress,
        };
      }
    }

    try {
      await api.post('/admin/users', payload);
      setAddModalOpen(false);
      // Reset form fields
      setName('');
      setEmail('');
      setAddress('');
      setPassword('');
      setRole('USER');
      setStoreLinkType('none');
      setSelectedStoreId('');
      setNewStoreName('');
      setNewStoreEmail('');
      setNewStoreAddress('');
      setFormErrors({});
      fetchUsers();
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed to create user account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenView = (user: User) => {
    setSelectedUser(user);
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
            <h2 className="text-2xl font-extrabold text-heading">Users Directory</h2>
            <p className="text-sm text-muted">Manage system users, filters, and store configurations.</p>
          </div>
          <Button
            variant="primary"
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-1.5 py-2 px-4 font-bold text-xs"
          >
            <Plus className="w-4 h-4" /> Add New User
          </Button>
        </div>

        {/* Query Filter panel */}
        <div className="bg-surface p-5 rounded-card border border-border/40 shadow-soft grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] font-extrabold text-muted uppercase tracking-wider mb-1">Search Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-border bg-surface-soft rounded-btn text-xs focus:outline-none focus:border-primary text-heading"
              placeholder="Filter by name..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] font-extrabold text-muted uppercase tracking-wider mb-1">Search Email</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-border bg-surface-soft rounded-btn text-xs focus:outline-none focus:border-primary text-heading"
              placeholder="Filter by email..."
              value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] font-extrabold text-muted uppercase tracking-wider mb-1">Search Address</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-border bg-surface-soft rounded-btn text-xs focus:outline-none focus:border-primary text-heading"
              placeholder="Filter by address..."
              value={filterAddress}
              onChange={(e) => setFilterAddress(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] font-extrabold text-muted uppercase tracking-wider mb-1">Search Role</label>
            <select
              className="w-full px-3 py-2 border border-border bg-surface-soft rounded-btn text-xs focus:outline-none focus:border-primary text-heading font-semibold"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="USER">USER</option>
              <option value="STORE_OWNER">STORE_OWNER</option>
            </select>
          </div>
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
                    <th className="px-6 py-4 font-bold text-heading uppercase tracking-wider">Role</th>
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
        ) : sortedUsers.length === 0 ? (
          <div className="bg-surface rounded-card border border-border/40 p-12 text-center text-xs text-muted">
            No users matched your filter criteria.
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
                    <th className="px-6 py-4 text-xs font-bold text-heading uppercase tracking-wider cursor-pointer hover:bg-surface-soft/80 select-none" onClick={() => handleSort('role')}>
                      <div className="flex items-center gap-1.5">Role <SortIcon field="role" /></div>
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-heading uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-xs">
                  {sortedUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-surface-soft/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-heading">{u.name}</td>
                      <td className="px-6 py-4 text-muted font-medium">{u.email}</td>
                      <td className="px-6 py-4 max-w-[200px] truncate text-body">{u.address}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : u.role === 'STORE_OWNER' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleOpenView(u)}
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
        {viewModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-heading/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface w-full max-w-md p-6 rounded-card shadow-2xl border border-border flex flex-col relative">
              <button type="button" className="absolute top-4 right-4 p-1 text-muted hover:text-heading" onClick={() => setViewModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-heading mb-4 border-b border-border/60 pb-2">User Details</h3>
              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-2.5">
                  <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-muted uppercase text-[9px] block">Role</span>
                    <span className="font-bold text-heading">{selectedUser.role}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-4 h-4 text-primary shrink-0 mt-0.5 text-base">👤</span>
                  <div>
                    <span className="font-bold text-muted uppercase text-[9px] block">Full Name</span>
                    <span className="font-bold text-heading">{selectedUser.name}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-muted uppercase text-[9px] block">Email Address</span>
                    <span className="font-bold text-heading">{selectedUser.email}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-muted uppercase text-[9px] block">Physical Address</span>
                    <span className="font-semibold text-heading whitespace-pre-line">{selectedUser.address}</span>
                  </div>
                </div>

                {selectedUser.role === 'STORE_OWNER' && (
                  <div className="border-t border-border/60 pt-4 space-y-3">
                    <h4 className="font-bold text-heading flex items-center gap-1.5"><StoreIcon className="w-4.5 h-4.5 text-primary" /> Linked Store Information</h4>
                    {selectedUser.store ? (
                      <div className="bg-surface-soft p-3 rounded-btn border border-border/40 space-y-2">
                        <div>
                          <span className="font-bold text-muted uppercase text-[9px] block">Store Name</span>
                          <span className="font-bold text-heading">{selectedUser.store.name}</span>
                        </div>
                        <div>
                          <span className="font-bold text-muted uppercase text-[9px] block">Average Rating</span>
                          <span className="font-bold text-success flex items-center gap-1 text-sm mt-0.5">
                            <Star className="w-4.5 h-4.5 fill-gold stroke-gold shrink-0" />
                            {selectedUser.storeRating !== null && selectedUser.storeRating !== undefined ? `${selectedUser.storeRating} / 5` : 'No ratings yet'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted italic block">No store assigned to this owner yet.</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ADD USER MODAL FORM */}
        {addModalOpen && (
          <div className="fixed inset-0 bg-heading/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-surface w-full max-w-lg p-6 rounded-card shadow-2xl border border-border flex flex-col relative max-h-[90vh]">
              <button type="button" className="absolute top-4 right-4 p-1 text-muted hover:text-heading focus:outline-none" onClick={() => setAddModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-heading mb-4 border-b border-border/60 pb-2">Add New User</h3>

              {submitError && (
                <div className="mb-4 p-3 bg-danger/10 text-danger border border-danger/20 rounded-btn text-xs font-semibold">
                  {submitError}
                </div>
              )}

              <form onSubmit={handleAddSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
                
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1">Full Name (min 20 characters)</label>
                  <input
                    type="text"
                    required
                    className={`w-full px-3 py-2 border rounded-btn text-xs bg-surface-soft text-heading focus:outline-none ${formErrors.name ? 'border-danger focus:border-danger' : 'border-border focus:border-primary'}`}
                    placeholder="e.g. Christopher William Miller"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  {formErrors.name && <p className="text-[10px] text-danger mt-1 font-semibold">{formErrors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    className={`w-full px-3 py-2 border rounded-btn text-xs bg-surface-soft text-heading focus:outline-none ${formErrors.email ? 'border-danger focus:border-danger' : 'border-border focus:border-primary'}`}
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {formErrors.email && <p className="text-[10px] text-danger mt-1 font-semibold">{formErrors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1">Password (8-16 chars, uppercase & special symbol)</label>
                  <input
                    type="password"
                    required
                    className={`w-full px-3 py-2 border rounded-btn text-xs bg-surface-soft text-heading focus:outline-none ${formErrors.password ? 'border-danger focus:border-danger' : 'border-border focus:border-primary'}`}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {formErrors.password && <p className="text-[10px] text-danger mt-1 font-semibold">{formErrors.password}</p>}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1">Physical Address (max 400 characters)</label>
                  <textarea
                    required
                    rows={2}
                    className={`w-full px-3 py-2 border rounded-btn text-xs bg-surface-soft text-heading focus:outline-none resize-none ${formErrors.address ? 'border-danger focus:border-danger' : 'border-border focus:border-primary'}`}
                    placeholder="Physical address..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                  {formErrors.address && <p className="text-[10px] text-danger mt-1 font-semibold">{formErrors.address}</p>}
                </div>

                {/* Role */}
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1">Role</label>
                  <select
                    className="w-full px-3 py-2 border border-border bg-surface-soft rounded-btn text-xs focus:outline-none focus:border-primary text-heading font-semibold"
                    value={role}
                    onChange={(e: any) => setRole(e.target.value)}
                  >
                    <option value="USER">Normal User</option>
                    <option value="STORE_OWNER">Store Owner</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                {/* STORE_OWNER Conditional Fields */}
                {role === 'STORE_OWNER' && (
                  <div className="border-t border-border/60 pt-3 mt-3 space-y-3 bg-surface-soft p-3 rounded-btn">
                    <label className="block text-xs font-bold text-heading uppercase tracking-wider">Store Assignment</label>
                    <div className="flex gap-4 text-xs font-semibold">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" checked={storeLinkType === 'none'} onChange={() => setStoreLinkType('none')} /> None
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" checked={storeLinkType === 'existing'} onChange={() => setStoreLinkType('existing')} /> Link Existing Store
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" checked={storeLinkType === 'new'} onChange={() => setStoreLinkType('new')} /> Create New Store Inline
                      </label>
                    </div>

                    {/* Existing Store Select list */}
                    {storeLinkType === 'existing' && (
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-muted uppercase">Select Store (Without Owner)</label>
                        {unownedStores.length === 0 ? (
                          <span className="text-[10px] text-danger font-semibold block italic">No unowned stores available. Please create one inline.</span>
                        ) : (
                          <select
                            className="w-full px-3 py-2 border border-border bg-surface rounded-btn text-xs focus:outline-none focus:border-primary text-heading font-semibold"
                            value={selectedStoreId}
                            onChange={(e) => setSelectedStoreId(e.target.value)}
                          >
                            <option value="">-- Choose Store --</option>
                            {unownedStores.map((s) => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    )}

                    {/* New Store Inline Form */}
                    {storeLinkType === 'new' && (
                      <div className="space-y-3 border-l-2 border-primary/20 pl-3">
                        {/* New Store Name */}
                        <div>
                          <label className="block text-[10px] font-bold text-muted uppercase mb-1">New Store Name (min 20 characters)</label>
                          <input
                            type="text"
                            required
                            className={`w-full px-3 py-1.5 border rounded-btn text-xs bg-surface text-heading focus:outline-none ${formErrors.newStoreName ? 'border-danger focus:border-danger' : 'border-border focus:border-primary'}`}
                            placeholder="Store Name..."
                            value={newStoreName}
                            onChange={(e) => setNewStoreName(e.target.value)}
                          />
                          {formErrors.newStoreName && <p className="text-[9px] text-danger mt-0.5 font-semibold">{formErrors.newStoreName}</p>}
                        </div>

                        {/* New Store Email */}
                        <div>
                          <label className="block text-[10px] font-bold text-muted uppercase mb-1">New Store Email</label>
                          <input
                            type="email"
                            required
                            className={`w-full px-3 py-1.5 border rounded-btn text-xs bg-surface text-heading focus:outline-none ${formErrors.newStoreEmail ? 'border-danger focus:border-danger' : 'border-border focus:border-primary'}`}
                            placeholder="store@example.com"
                            value={newStoreEmail}
                            onChange={(e) => setNewStoreEmail(e.target.value)}
                          />
                          {formErrors.newStoreEmail && <p className="text-[9px] text-danger mt-0.5 font-semibold">{formErrors.newStoreEmail}</p>}
                        </div>

                        {/* New Store Address */}
                        <div>
                          <label className="block text-[10px] font-bold text-muted uppercase mb-1">New Store Address (max 400 characters)</label>
                          <textarea
                            required
                            rows={2}
                            className={`w-full px-3 py-1.5 border rounded-btn text-xs bg-surface text-heading focus:outline-none resize-none ${formErrors.newStoreAddress ? 'border-danger focus:border-danger' : 'border-border focus:border-primary'}`}
                            placeholder="Store Physical Address..."
                            value={newStoreAddress}
                            onChange={(e) => setNewStoreAddress(e.target.value)}
                          />
                          {formErrors.newStoreAddress && <p className="text-[9px] text-danger mt-0.5 font-semibold">{formErrors.newStoreAddress}</p>}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-border/60">
                  <Button variant="outline" className="flex-1 py-2.5" onClick={() => setAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" className="flex-1 py-2.5" type="submit" disabled={submitting}>
                    {submitting ? 'Creating User...' : 'Add User'}
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

export default AdminUsersPage;
