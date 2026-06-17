import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import Button from '../components/Button';
import api from '../utils/api';
import {
  Star,
  Search,
  Heart,
  X,
  ArrowUpDown,
} from 'lucide-react';

interface Store {
  id: string;
  name: string;
  email: string;
  address: string;
  ownerId: string | null;
  averageRating: number;
  totalRatings: number;
  userRating?: {
    id: string;
    value: number;
  } | null;
}

export const StoresPage: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<string>('name-asc');
  

  const [loading, setLoading] = useState(true);

  // Rating Modal state
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [pickerValue, setPickerValue] = useState(0);
  const [hoverValue, setHoverValue] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchQuery) params.search = searchQuery;

      const res = await api.get('/stores', { params });
      setStores(res.data);
    } catch (e) {
      console.error('Error fetching stores', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [searchQuery]);

  const handleOpenRating = (store: Store) => {
    setSelectedStore(store);
    setPickerValue(store.userRating ? store.userRating.value : 0);
    setComment('');
    setRatingModalOpen(true);
  };

  const handleRatingSubmit = async () => {
    if (!selectedStore || pickerValue === 0) return;
    setSubmittingRating(true);
    
    const isNew = !selectedStore.userRating;
    const ratingValue = pickerValue;
    const storeId = selectedStore.id;
    const ratingId = selectedStore.userRating?.id;

    // OPTIMISTIC UPDATE
    setStores((prevStores) =>
      prevStores.map((store) => {
        if (store.id === storeId) {
          const newTotal = isNew ? store.totalRatings + 1 : store.totalRatings;
          const oldSum = store.averageRating * store.totalRatings;
          const oldUserVal = selectedStore.userRating ? selectedStore.userRating.value : 0;
          const newSum = oldSum - oldUserVal + ratingValue;
          const newAvg = parseFloat((newSum / newTotal).toFixed(1));

          return {
            ...store,
            totalRatings: newTotal,
            averageRating: newAvg,
            userRating: {
              id: ratingId || 'temp-id',
              value: ratingValue,
            },
          };
        }
        return store;
      })
    );

    const commentToSubmit = comment.trim() || undefined;
    setRatingModalOpen(false);
    setComment('');

    try {
      if (isNew) {
        const res = await api.post('/ratings', { storeId, value: ratingValue, comment: commentToSubmit });
        // Update temporary ID with actual returned ID
        setStores((prevStores) =>
          prevStores.map((store) => {
            if (store.id === storeId) {
              return {
                ...store,
                userRating: {
                  id: res.data.id,
                  value: ratingValue,
                },
              };
            }
            return store;
          })
        );
      } else {
        await api.patch(`/ratings/${ratingId}`, { value: ratingValue, comment: commentToSubmit });
      }
    } catch (e) {
      console.error('Error submitting rating, reverting', e);
      // Revert stores listing
      fetchStores();
    } finally {
      setSubmittingRating(false);
    }
  };

  // Sorting logic applied locally
  const sortedStores = [...stores].sort((a, b) => {
    if (sortOption === 'name-asc') return a.name.localeCompare(b.name);
    if (sortOption === 'name-desc') return b.name.localeCompare(a.name);
    if (sortOption === 'rating-desc') return b.averageRating - a.averageRating;
    if (sortOption === 'rating-asc') return a.averageRating - b.averageRating;
    return 0;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 text-left">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-heading">Find & Explore Stores</h2>
              <p className="text-sm text-muted">Browse, search, and rate stores registered on our platform.</p>
            </div>
          </div>

          {/* Filtering & Sorting Controls */}
          <div className="bg-surface p-5 rounded-card border border-border/40 shadow-soft flex flex-col sm:flex-row gap-4 items-center justify-between">
            
            {/* Search Input */}
            <div className="relative w-full sm:max-w-md">
              <span className="absolute left-4 top-3 text-muted">
                <Search className="w-4.5 h-4.5" />
              </span>
              <input
                type="text"
                className="w-full pl-11 pr-4 py-2.5 rounded-btn border border-border bg-surface-soft focus:outline-none focus:border-primary text-sm text-heading"
                placeholder="Search by store name or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Sort Selection */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs font-bold text-muted uppercase tracking-wider whitespace-nowrap">
                <ArrowUpDown className="w-4 h-4 inline mr-1" /> Sort By
              </span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="px-4 py-2.5 rounded-btn border border-border bg-surface-soft text-sm font-semibold text-heading focus:outline-none focus:border-primary w-full sm:w-auto"
              >
                <option value="name-asc">Name (A - Z)</option>
                <option value="name-desc">Name (Z - A)</option>
                <option value="rating-desc">Rating (High to Low)</option>
                <option value="rating-asc">Rating (Low to High)</option>
              </select>
            </div>
          </div>

          {/* Grid list of stores */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-surface h-[240px] rounded-card border border-border animate-pulse" />
              ))}
            </div>
          ) : sortedStores.length === 0 ? (
            <div className="bg-surface text-center py-20 rounded-card border border-border/30">
              <span className="text-4xl">🔎</span>
              <h3 className="text-base font-bold text-heading mt-3">No stores found</h3>
              <p className="text-xs text-muted mt-1">Try refining your search keyword parameters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {sortedStores.map((store) => (
                <div
                  key={store.id}
                  className="bg-surface border border-border/40 rounded-card shadow-soft overflow-hidden hover:scale-[1.01] transition-all duration-200 flex flex-col justify-between min-h-[240px]"
                >
                  <div className="h-24 bg-primary/5 border-b border-border/30 relative flex items-center justify-center overflow-hidden">
                    <span className="text-primary/20 text-4xl">🏢</span>
                    <button type="button" className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-surface/80 text-muted hover:text-red-500 shadow-sm transition-colors">
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="p-4 flex-1 flex flex-col justify-between text-left">
                    <div>
                      <h4 className="font-bold text-heading text-sm truncate">{store.name}</h4>
                      <p className="text-[11px] text-muted truncate mt-0.5">{store.address}</p>
                    </div>

                    <div className="flex items-center gap-1.5 mt-3">
                      <Star className="w-3.5 h-3.5 fill-gold stroke-gold" />
                      <span className="text-xs font-bold text-heading">
                        {store.averageRating > 0 ? store.averageRating : 'New'}
                      </span>
                      <span className="text-[10px] text-muted">({store.totalRatings} reviews)</span>
                    </div>
                  </div>

                  <div className="p-3 border-t border-border/40 bg-surface-soft flex items-center justify-between gap-2">
                    {store.userRating ? (
                      <div className="flex flex-col text-left">
                        <span className="text-[9px] font-bold text-muted uppercase tracking-wider">Your Rating</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-xs font-bold text-primary">{store.userRating.value}/5</span>
                          <button
                            type="button"
                            onClick={() => handleOpenRating(store)}
                            className="text-[10px] font-bold text-primary hover:underline"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-muted">Not rated yet</span>
                    )}

                    <Button
                      variant={store.userRating ? 'outline' : 'primary'}
                      onClick={() => handleOpenRating(store)}
                      className="py-1.5 px-4 text-xs font-bold shrink-0"
                    >
                      {store.userRating ? 'Edit Rating' : 'Rate Now'}
                    </Button>
                  </div>

                </div>
              ))}
            </div>
          )}

      </div>

      {/* RATING PICKER MODAL */}
      {ratingModalOpen && selectedStore && (
        <div className="fixed inset-0 bg-heading/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-md p-6 rounded-card shadow-2xl border border-border flex flex-col items-center relative text-center">
            
            <button
              type="button"
              className="absolute top-4 right-4 p-1 text-muted hover:text-heading"
              onClick={() => { setRatingModalOpen(false); setComment(''); }}
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-4xl mb-3">⭐</span>
            <h3 className="text-lg font-bold text-heading">
              {selectedStore.userRating ? 'Update your rating for' : 'Submit rating for'}
            </h3>
            <p className="text-sm font-bold text-primary mt-1 mb-6">{selectedStore.name}</p>

            {/* Stars Row with Hover states */}
            <div className="flex items-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setPickerValue(star)}
                  onMouseEnter={() => setHoverValue(star)}
                  onMouseLeave={() => setHoverValue(0)}
                  className="p-1 hover:scale-110 transition-transform focus:outline-none"
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      star <= (hoverValue || pickerValue)
                        ? 'fill-gold stroke-gold'
                        : 'stroke-border text-border hover:stroke-gold/50'
                    }`}
                  />
                </button>
              ))}
            </div>

            <p className={`text-xs font-semibold ${pickerValue > 0 ? 'text-success' : 'text-danger'}`}>
              {pickerValue > 0 ? `You selected ${pickerValue} out of 5 stars` : 'Rating value is required and must be between 1 and 5.'}
            </p>

            {/* Optional Comment */}
            <div className="w-full mt-4 mb-2">
              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1 text-left">
                Comment <span className="text-muted normal-case font-normal">(optional)</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                maxLength={500}
                className="w-full px-3 py-2 rounded-btn border border-border bg-surface-soft focus:outline-none focus:border-primary text-sm text-heading resize-none"
                placeholder="Share your experience with this store..."
              />
              <p className="text-[10px] text-muted text-right mt-0.5">{comment.length}/500</p>
            </div>

            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                className="flex-1 py-3"
                onClick={() => setRatingModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1 py-3"
                onClick={handleRatingSubmit}
                disabled={pickerValue === 0 || submittingRating}
              >
                {submittingRating ? 'Submitting...' : 'Submit Rating'}
              </Button>
            </div>

          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default StoresPage;
