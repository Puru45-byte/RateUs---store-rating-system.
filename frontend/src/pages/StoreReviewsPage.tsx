import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import StoreLayout from '../components/StoreLayout';
import api from '../utils/api';
import {
  Star,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Mail,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

interface Review {
  id: string;
  value: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    address: string;
  };
}

type SortField = 'name' | 'rating' | 'date';
type SortDirection = 'asc' | 'desc';

export const StoreReviewsPage: React.FC = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sorting State
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/stores/me/ratings');
      setReviews(res.data);
    } catch (err: any) {
      console.error('Error fetching store reviews', err);
      setError(
        err.response?.data?.message || 'Failed to load reviews for your store.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  // Sort logic applied client-side
  const sortedReviews = [...reviews].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'name') {
      comparison = a.user.name.localeCompare(b.user.name);
    } else if (sortField === 'rating') {
      comparison = a.value - b.value;
    } else if (sortField === 'date') {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Pagination logic
  const totalItems = sortedReviews.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = sortedReviews.slice(startIndex, endIndex);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
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
    <StoreLayout storeName={user?.name}>
      <div className="space-y-6 text-left">
        <div>
          <h2 className="text-2xl font-extrabold text-heading">Reviews List</h2>
          <p className="text-sm text-muted">
            Manage, sort, and navigate through every rating submitted by users for your store.
          </p>
        </div>

        {loading ? (
          <div className="bg-surface rounded-card border border-border/40 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse animate-pulse text-xs">
                <thead>
                  <tr className="bg-surface-soft border-b border-border/60">
                    <th className="px-6 py-4 font-bold text-heading uppercase tracking-wider">Reviewer Name</th>
                    <th className="px-6 py-4 font-bold text-heading uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-4 font-bold text-heading uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><div className="h-4 bg-muted/20 rounded w-28"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-muted/20 rounded w-36"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-muted/20 rounded w-20"></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : error ? (
          <div className="bg-surface rounded-card border border-border/40 p-8 text-center max-w-xl mx-auto space-y-4">
            <div className="text-danger text-2xl">⚠️</div>
            <h3 className="text-base font-bold text-heading">Unable to load reviews</h3>
            <p className="text-xs text-body">{error}</p>
            <button
              type="button"
              onClick={fetchReviews}
              className="px-4 py-2 bg-primary text-white rounded-btn text-xs font-bold transition-all focus:outline-none"
            >
              Retry
            </button>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-surface rounded-card border border-border/40 p-16 text-center select-none">
            <span className="text-4xl block mb-3">💬</span>
            <h3 className="text-base font-bold text-heading">No ratings yet</h3>
            <p className="text-xs text-muted max-w-xs mx-auto">
              Your store has not received any reviews from customers yet. Try promoting your business page.
            </p>
          </div>
        ) : (
          <div className="bg-surface rounded-card border border-border/40 shadow-soft overflow-hidden flex flex-col">
            
            {/* Table Area */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-soft border-b border-border/60">
                    <th
                      className="px-6 py-4 text-xs font-bold text-heading uppercase tracking-wider cursor-pointer hover:bg-surface-soft/80 select-none"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-1.5">
                        Reviewer Name <SortIcon field="name" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-xs font-bold text-heading uppercase tracking-wider cursor-pointer hover:bg-surface-soft/80 select-none"
                      onClick={() => handleSort('rating')}
                    >
                      <div className="flex items-center gap-1.5">
                        Rating <SortIcon field="rating" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-xs font-bold text-heading uppercase tracking-wider cursor-pointer hover:bg-surface-soft/80 select-none"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center gap-1.5">
                        Date <SortIcon field="date" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-xs">
                  {currentItems.map((review) => (
                    <tr key={review.id} className="hover:bg-surface-soft/20 transition-colors">
                      {/* Reviewer Details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-primary/20">
                            {getInitials(review.user.name)}
                          </div>
                          <div>
                            <h4 className="font-bold text-heading">{review.user.name}</h4>
                            <span className="text-[10px] text-muted flex items-center gap-1 mt-0.5 font-medium">
                              <Mail className="w-3 h-3 text-muted/50" /> {review.user.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      
                      {/* Rating score badge */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-extrabold text-success bg-success/15 px-2 py-0.5 rounded-full border border-success/20">
                            {review.value}.0
                          </span>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= review.value
                                    ? 'fill-gold stroke-gold'
                                    : 'stroke-border text-border/40'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </td>

                      {/* Created date */}
                      <td className="px-6 py-4 whitespace-nowrap text-body font-semibold">
                        {formatDate(review.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Footer */}
            <div className="border-t border-border/60 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-muted font-medium">
                Showing <span className="font-bold text-heading">{startIndex + 1}</span> to{' '}
                <span className="font-bold text-heading">{endIndex}</span> of{' '}
                <span className="font-bold text-heading">{totalItems}</span> reviews
              </span>

              <div className="flex items-center gap-1.5">
                {/* First page */}
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded border border-border/80 bg-surface text-body hover:bg-surface-soft disabled:opacity-40 disabled:hover:bg-surface transition-colors focus:outline-none"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                {/* Prev page */}
                <button
                  type="button"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded border border-border/80 bg-surface text-body hover:bg-surface-soft disabled:opacity-40 disabled:hover:bg-surface transition-colors focus:outline-none"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page number indicators */}
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pg = idx + 1;
                    const active = currentPage === pg;
                    return (
                      <button
                        key={pg}
                        type="button"
                        onClick={() => setCurrentPage(pg)}
                        className={`w-7.5 h-7.5 rounded text-xs font-bold flex items-center justify-center border transition-all ${
                          active
                            ? 'bg-primary border-primary text-white shadow-sm shadow-primary/20'
                            : 'border-border/80 bg-surface text-body hover:bg-surface-soft'
                        }`}
                      >
                        {pg}
                      </button>
                    );
                  })}
                </div>

                {/* Next page */}
                <button
                  type="button"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded border border-border/80 bg-surface text-body hover:bg-surface-soft disabled:opacity-40 disabled:hover:bg-surface transition-colors focus:outline-none"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                {/* Last page */}
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded border border-border/80 bg-surface text-body hover:bg-surface-soft disabled:opacity-40 disabled:hover:bg-surface transition-colors focus:outline-none"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </StoreLayout>
  );
};

export default StoreReviewsPage;
