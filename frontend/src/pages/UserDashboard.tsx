import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import Button from '../components/Button';
import StatCard from '../components/StatCard';
import api from '../utils/api';
import userBannerImg from '../assets/userbanner.png';
import {
  Store as StoreIcon,
  Star,
  Search,
  Users,
  ShoppingBag,
  User as UserIcon,
  UtensilsCrossed,
  BookOpen,
  MoreHorizontal,
  Heart,
  ArrowRight,
} from 'lucide-react';

interface Store {
  id: string;
  name: string;
  email: string;
  address: string;
  ownerId: string | null;
  averageRating: number;
  totalRatings: number;
}

interface Rating {
  id: string;
  value: number;
  createdAt: string;
  updatedAt: string;
  store: {
    id: string;
    name: string;
    address: string;
  };
}

interface Stats {
  storesExplored: number;
  myRatings: number;
  averageGiven: number;
  reviewsHelped: number;
}

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [featuredStores, setFeaturedStores] = useState<Store[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [searchResults, setSearchResults] = useState<Store[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const firstName = user?.name.split(' ')[0] || 'User';

  const fetchDashboardData = async () => {
    try {
      const [statsRes, featuredRes, ratingsRes] = await Promise.all([
        api.get('/users/me/dashboard-stats'),
        api.get('/stores?featured=true'),
        api.get('/users/me/ratings'),
      ]);
      setStats(statsRes.data);
      setFeaturedStores(featuredRes.data);
      setRatings(ratingsRes.data);
    } catch (e) {
      console.error('Error fetching dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (categoryFilter = '') => {
    setSearching(true);
    try {
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (categoryFilter) params.category = categoryFilter;

      const res = await api.get('/stores', { params });
      setSearchResults(res.data);
    } catch (e) {
      console.error('Error searching stores', e);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Format relative time helper
  const getRelativeTime = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 24) {
      return diffHours === 0 ? 'Just now' : `${diffHours} hours ago`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 text-left">
          
          {/* Greeting Area */}
          <div className="relative bg-surface rounded-card border border-border/30 overflow-hidden shadow-soft flex flex-col justify-center min-h-[160px]">

            {/* Full-bleed background — fills the ENTIRE card, cropped right */}
            <img
              src={userBannerImg}
              alt=""
              aria-hidden
              draggable={false}
              className="absolute inset-0 w-full h-full select-none pointer-events-none"
              style={{
                objectFit: 'cover',
                objectPosition: 'right center',
                zIndex: 0,
              }}
            />

            {/* Left-side gradient so text stays readable over the illustration */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(to right, rgba(255,255,255,1) 38%, rgba(255,255,255,0.85) 58%, rgba(255,255,255,0) 80%)',
                zIndex: 1,
              }}
            />

            {/* Text content */}
            <div className="space-y-1.5 relative px-8 py-8" style={{ zIndex: 2 }}>
              <h2 className="text-3xl font-extrabold text-heading tracking-tight">
                Welcome back, <span className="text-primary">{firstName}!</span> 👋
              </h2>
              <p className="text-sm text-body leading-relaxed">
                Discover stores, rate experiences, and help others make better decisions.
              </p>
            </div>
          </div>

          {/* Stats Cards Row */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-surface h-28 rounded-card border border-border animate-pulse" />
              ))
            ) : (
              <>
                <StatCard
                  icon={<StoreIcon className="w-5 h-5" />}
                  value={stats?.storesExplored || 0}
                  label="Stores Explored"
                  delta="+12 this month"
                  iconBgColor="bg-primary/10"
                  iconColor="text-primary"
                />
                <StatCard
                  icon={<Star className="w-5 h-5 fill-primary/10" />}
                  value={stats?.myRatings || 0}
                  label="My Ratings"
                  delta="+3 this month"
                  iconBgColor="bg-lavender"
                  iconColor="text-primary-dark"
                />
                <StatCard
                  icon={<Star className="w-5 h-5 fill-gold stroke-gold" />}
                  value={stats?.averageGiven ? `${stats.averageGiven} ★` : '0 ★'}
                  label="Average Given"
                  delta="+0.3 this month"
                  iconBgColor="bg-yellow-50"
                  iconColor="text-gold"
                />
                <StatCard
                  icon={<Users className="w-5 h-5" />}
                  value={stats?.reviewsHelped ? `${(stats.reviewsHelped / 1000).toFixed(1)}K` : '0'}
                  label="Reviews Helped"
                  delta="+280 this month"
                  iconBgColor="bg-green-50"
                  iconColor="text-success"
                />
              </>
            )}
          </section>

          {/* Main Content Grid Split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Left columns (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Find & Explore Stores */}
              <div id="search-stores" className="bg-surface p-6 rounded-card border border-border/40 shadow-soft space-y-5">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-heading">Find & Explore Stores</h3>
                  <p className="text-xs text-muted">Search for stores and see what others are saying</p>
                </div>

                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-3.5 text-muted">
                      <Search className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      className="w-full pl-11 pr-4 py-3 rounded-btn border border-border bg-surface-soft focus:outline-none focus:border-primary text-sm text-heading"
                      placeholder="Search by store name, category or location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <Button variant="primary" onClick={() => handleSearch()} disabled={searching} className="px-6">
                    Search
                  </Button>
                </div>

                {/* Popular Categories */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-muted uppercase tracking-wider block">Popular Categories</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: 'Electronics', icon: <ShoppingBag className="w-4.5 h-4.5" /> },
                      { name: 'Fashion', icon: <UserIcon className="w-4.5 h-4.5" /> },
                      { name: 'Food', icon: <UtensilsCrossed className="w-4.5 h-4.5" /> },
                      { name: 'Books', icon: <BookOpen className="w-4.5 h-4.5" /> },
                      { name: 'More', icon: <MoreHorizontal className="w-4.5 h-4.5" /> },
                    ].map((cat) => (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => {
                          const active = selectedCategory === cat.name ? '' : cat.name;
                          setSelectedCategory(active);
                          handleSearch(active);
                        }}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-btn text-xs font-bold border transition-all ${
                          selectedCategory === cat.name
                            ? 'bg-primary text-white border-primary shadow-sm shadow-primary/10'
                            : 'bg-surface border-border text-heading hover:bg-surface-soft'
                        }`}
                      >
                        {cat.icon}
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Search Results */}
                {searchResults.length > 0 && (
                  <div className="border-t border-border/60 pt-5 space-y-4">
                    <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Search Results</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {searchResults.map((store) => (
                        <div key={store.id} className="p-4 border border-border/80 rounded-card flex flex-col justify-between">
                          <div>
                            <h5 className="font-bold text-heading text-sm">{store.name}</h5>
                            <p className="text-[11px] text-muted mt-0.5">{store.address}</p>
                          </div>
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
                            <span className="text-xs font-bold text-heading flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-gold stroke-gold" />
                              {store.averageRating > 0 ? store.averageRating : 'New'}
                            </span>
                            <Button
                              variant="primary"
                              onClick={() => navigate('/app/stores')}
                              className="py-1 px-3 text-[10px] rounded-btn"
                            >
                              Rate Now
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Featured Stores */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-heading">Featured Stores</h3>
                    <p className="text-xs text-muted">Discover top rated stores by our community</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/app/stores')}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    View all stores
                  </button>
                </div>

                {/* Horizontal Store Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {loading ? (
                    [1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-surface h-48 rounded-card border border-border animate-pulse" />
                    ))
                  ) : (
                    featuredStores.map((store) => (
                      <div
                        key={store.id}
                        className="bg-surface border border-border/40 rounded-card shadow-soft overflow-hidden hover:scale-[1.02] transition-transform duration-200 flex flex-col justify-between min-h-[220px]"
                      >
                        {/* Mock Image Area */}
                        <div className="h-24 bg-primary/5 border-b border-border/30 relative flex items-center justify-center overflow-hidden">
                          <span className="text-primary/20 text-4xl">🏢</span>
                          <button type="button" className="absolute top-2.5 right-2.5 p-1 rounded-full bg-surface/80 text-muted hover:text-red-500 shadow-sm transition-colors">
                            <Heart className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="p-3 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-heading text-xs truncate">{store.name}</h4>
                            <p className="text-[10px] text-muted truncate mt-0.5">{store.address.split(',').slice(-2).join(',')}</p>
                          </div>

                          <div className="flex items-center gap-1.5 mt-2">
                            <div className="flex items-center">
                              <Star className="w-3.5 h-3.5 fill-gold stroke-gold" />
                            </div>
                            <span className="text-[11px] font-bold text-heading">{store.averageRating > 0 ? store.averageRating : 'New'}</span>
                            <span className="text-[10px] text-muted">({store.totalRatings} reviews)</span>
                          </div>
                        </div>

                        <div className="p-3 border-t border-border/40 bg-surface-soft">
                          <Button
                            variant="primary"
                            onClick={() => navigate('/app/stores')}
                            className="w-full py-1.5 text-xs"
                          >
                            Rate Now
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Right column (1/3 width) */}
            <div className="space-y-6">
              
              {/* Recent Activity */}
              <div className="bg-surface p-5 rounded-card border border-border/40 shadow-soft space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-heading">Recent Activity</h3>
                  <button type="button" className="text-xs font-bold text-primary hover:underline">
                    View all
                  </button>
                </div>

                {/* Rating Event list */}
                <div className="space-y-3">
                  {loading ? (
                    [1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-surface-soft rounded-btn border border-border animate-pulse" />
                    ))
                  ) : ratings.length === 0 ? (
                    <div className="text-center text-xs text-muted py-8">
                      No ratings submitted yet.
                    </div>
                  ) : (
                    ratings.slice(0, 3).map((rating) => (
                      <div key={rating.id} className="p-3 border border-border/60 rounded-btn bg-surface-soft flex gap-3 text-left">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 text-lg">
                          🏢
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <p className="text-[11px] font-semibold text-body leading-normal">
                            You rated <span className="font-bold text-heading">{rating.store.name}</span>
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-xs font-bold text-success bg-success/15 px-1.5 py-0.5 rounded-full">
                              {rating.value}/5
                            </span>
                            <span className="text-[9px] text-muted">
                              {getRelativeTime(rating.updatedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2">
                  <Button variant="outline" className="w-full py-2 text-xs flex items-center justify-center gap-2">
                    View All Activity <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

            </div>

          </div>

      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
