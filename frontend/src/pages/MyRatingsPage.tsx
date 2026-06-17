import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../utils/api';
import { Star, Store, Calendar, MessageSquare, ChevronUp, ChevronDown, Minus } from 'lucide-react';

interface Rating {
  id: string;
  value: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  store: {
    id: string;
    name: string;
    address: string;
  };
}

const StarRow = ({ value }: { value: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        className={`w-3.5 h-3.5 ${s <= value ? 'fill-gold stroke-gold' : 'stroke-muted fill-none'}`}
      />
    ))}
  </div>
);

const getRelativeTime = (dateStr: string) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
};

export const MyRatingsPage: React.FC = () => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<'store' | 'value' | 'date'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    api.get('/users/me/ratings')
      .then(res => setRatings(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const sorted = [...ratings].sort((a, b) => {
    let cmp = 0;
    if (sortField === 'store') cmp = a.store.name.localeCompare(b.store.name);
    else if (sortField === 'value') cmp = a.value - b.value;
    else cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return <Minus className="w-3 h-3 text-muted opacity-40" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-primary" />
      : <ChevronDown className="w-3 h-3 text-primary" />;
  };

  const avg = ratings.length
    ? (ratings.reduce((s, r) => s + r.value, 0) / ratings.length).toFixed(1)
    : '—';

  return (
    <DashboardLayout>
      <div className="space-y-6 text-left">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-heading tracking-tight">My Ratings</h1>
          <p className="text-sm text-muted mt-0.5">All the stores you've rated — your review history at a glance.</p>
        </div>

        {/* Summary bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Ratings', value: loading ? '…' : ratings.length, icon: <Star className="w-5 h-5" /> },
            { label: 'Average Given', value: loading ? '…' : `${avg} ★`, icon: <Star className="w-5 h-5 fill-gold stroke-gold" /> },
            { label: 'Stores Rated', value: loading ? '…' : new Set(ratings.map(r => r.store.id)).size, icon: <Store className="w-5 h-5" /> },
          ].map(card => (
            <div key={card.label} className="bg-surface border border-border/40 rounded-card p-5 shadow-soft flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                {card.icon}
              </div>
              <div>
                <p className="text-2xl font-extrabold text-heading">{card.value}</p>
                <p className="text-[11px] text-muted font-semibold">{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className="bg-surface border border-border/40 rounded-card shadow-soft overflow-hidden">
          <div className="p-5 border-b border-border/40 flex items-center justify-between">
            <h2 className="text-sm font-bold text-heading">Rating History</h2>
            <span className="text-xs text-muted">{ratings.length} entries</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-soft border-b border-border/40">
                <tr>
                  <th className="px-5 py-3 text-[10px] font-bold text-muted uppercase tracking-wider">#</th>
                  <th
                    className="px-5 py-3 text-[10px] font-bold text-muted uppercase tracking-wider cursor-pointer select-none hover:text-primary transition-colors"
                    onClick={() => toggleSort('store')}
                  >
                    <span className="flex items-center gap-1">Store <SortIcon field="store" /></span>
                  </th>
                  <th
                    className="px-5 py-3 text-[10px] font-bold text-muted uppercase tracking-wider cursor-pointer select-none hover:text-primary transition-colors"
                    onClick={() => toggleSort('value')}
                  >
                    <span className="flex items-center gap-1">Rating <SortIcon field="value" /></span>
                  </th>
                  <th className="px-5 py-3 text-[10px] font-bold text-muted uppercase tracking-wider">Comment</th>
                  <th
                    className="px-5 py-3 text-[10px] font-bold text-muted uppercase tracking-wider cursor-pointer select-none hover:text-primary transition-colors"
                    onClick={() => toggleSort('date')}
                  >
                    <span className="flex items-center gap-1">Date <SortIcon field="date" /></span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  [1, 2, 3, 4, 5].map(i => (
                    <tr key={i}>
                      {[1, 2, 3, 4, 5].map(j => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-surface-soft rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : sorted.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-muted">
                        <Star className="w-10 h-10 opacity-20" />
                        <p className="text-sm font-semibold">No ratings yet</p>
                        <p className="text-xs">Visit the Stores page to rate your first experience!</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sorted.map((rating, idx) => (
                    <tr key={rating.id} className="hover:bg-surface-soft/50 transition-colors">
                      <td className="px-5 py-4 text-xs text-muted font-semibold">{idx + 1}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-sm">🏢</div>
                          <div>
                            <p className="text-sm font-bold text-heading">{rating.store.name}</p>
                            <p className="text-[10px] text-muted truncate max-w-[200px]">{rating.store.address}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <StarRow value={rating.value} />
                          <span className="text-xs font-bold text-heading">{rating.value}/5</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 max-w-[200px]">
                        {rating.comment ? (
                          <span className="text-xs text-body flex items-start gap-1">
                            <MessageSquare className="w-3 h-3 text-muted shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{rating.comment}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted italic">No comment</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 text-[10px] text-muted">
                          <Calendar className="w-3 h-3" />
                          {getRelativeTime(rating.updatedAt)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default MyRatingsPage;
