import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import StoreLayout from '../components/StoreLayout';
import StatCard from '../components/StatCard';
import api from '../utils/api';
import {
  Star,
  MessageSquare,
  Users,
  Eye,
  Smile,
  Meh,
  Frown,
  Shield,
  ArrowRight,
} from 'lucide-react';

interface RatingBreakdownItem {
  star: number;
  count: number;
  percentage: number;
}

interface SentimentStats {
  count: number;
  percentage: number;
}

interface RatingSummary {
  positive: SentimentStats;
  neutral: SentimentStats;
  negative: SentimentStats;
}

interface RecentReview {
  id: string;
  value: number;
  createdAt: string;
  comment: string;
  user: {
    name: string;
    email: string;
  };
}

interface DashboardData {
  storeId: string;
  storeName: string;
  overallRating: number;
  totalReviews: number;
  followers: number;
  profileViews: number;
  deltas: {
    rating: number;
    reviews: number;
    followers: number;
    views: number;
  };
  ratingBreakdown: RatingBreakdownItem[];
  ratingSummary: RatingSummary;
  analyticsTrend: {
    labels: string[];
    data: number[];
  };
  reviewTopics: { name: string; value: number }[];
  recentReviews: RecentReview[];
  percentile: number;
}

export const StoreOwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/stores/owner/dashboard');
      setData(res.data);
    } catch (err: any) {
      console.error('Error fetching store dashboard data', err);
      setError(
        err.response?.data?.message ||
          'Failed to load store metrics. Please verify you own a registered store.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getRelativeTime = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 60) {
      return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
    }
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return `${diffHours} hours ago`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  if (loading) {
    return (
      <StoreLayout storeName={user?.name}>
        <div className="min-h-[70vh] flex flex-col justify-center items-center gap-3">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-muted">Loading store metrics...</p>
        </div>
      </StoreLayout>
    );
  }

  if (error || !data) {
    return (
      <StoreLayout storeName={user?.name}>
        <div className="min-h-[60vh] bg-surface rounded-card border border-border/40 p-8 flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-full bg-danger/10 text-danger flex items-center justify-center text-2xl border border-danger/20">
            ⚠️
          </div>
          <h3 className="text-lg font-bold text-heading">Failed to Load Dashboard</h3>
          <p className="text-sm text-body max-w-md">
            {error || 'We could not load stats for your store. Make sure your account is linked to a store.'}
          </p>
          <button
            type="button"
            onClick={fetchDashboardData}
            className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-btn text-xs font-bold transition-all focus:outline-none"
          >
            Retry Loading
          </button>
        </div>
      </StoreLayout>
    );
  }

  // Generate SVG Line Chart coordinates
  const svgWidth = 500;
  const svgHeight = 160;
  const paddingX = 40;
  const paddingY = 25;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  const trendPoints = data.analyticsTrend.data;
  const trendLabels = data.analyticsTrend.labels;
  const maxVal = 5.0;
  const minVal = 1.0;

  const points = trendPoints.map((val, idx) => {
    const x = paddingX + (idx / (trendPoints.length - 1)) * chartWidth;
    const y = paddingY + chartHeight - ((val - minVal) / (maxVal - minVal)) * chartHeight;
    return { x, y, val };
  });

  const pathD = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;

  return (
    <StoreLayout storeName={data.storeName}>
      <div className="space-y-6 text-left">
        
        {/* Banner Welcome & Date Range */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-heading">Welcome back, {data.storeName}! 👋</h2>
            <p className="text-sm text-muted">Here's what's happening with your store today.</p>
          </div>
          
          {/* Display-Only Date Selector */}
          <div className="bg-surface border border-border/60 rounded-btn px-4 py-2.5 flex items-center gap-2 select-none shadow-sm shrink-0 w-fit">
            <span className="text-xs font-bold text-heading">May 15 – May 21, 2026</span>
            <span className="text-[10px] text-muted font-bold uppercase border-l border-border pl-2">Last 7 Days</span>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<Star className="w-5 h-5 fill-gold stroke-gold" />}
            value={`${data.overallRating} / 5`}
            label="Overall Rating"
            delta={`+${data.deltas.rating} vs last month`}
            iconBgColor="bg-yellow-50"
            iconColor="text-gold"
          />
          <StatCard
            icon={<MessageSquare className="w-5 h-5" />}
            value={data.totalReviews}
            label="Total Reviews"
            delta={`+${data.deltas.reviews} new`}
            iconBgColor="bg-primary/10"
            iconColor="text-primary"
          />
          <StatCard
            icon={<Users className="w-5 h-5" />}
            value={data.followers}
            label="Followers"
            delta={`+${data.deltas.followers} this month`}
            iconBgColor="bg-blue-50"
            iconColor="text-blue-600"
          />
          <StatCard
            icon={<Eye className="w-5 h-5" />}
            value={data.profileViews}
            label="Profile Views"
            delta={`+${data.deltas.views} views`}
            iconBgColor="bg-emerald-50"
            iconColor="text-success"
          />
        </section>

        {/* Dashboard Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT SPLIT (2/3 width) - Charts & Breakdown */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Rating Overview SVG Chart Card */}
            <div className="bg-surface p-6 rounded-card border border-border/40 shadow-soft">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-extrabold text-heading">Rating Overview</h3>
                  <p className="text-xs text-muted">Average rating trend over time</p>
                </div>
                <div className="flex items-center gap-3">
                  <select className="px-3 py-1.5 rounded-btn border border-border bg-surface-soft text-xs font-bold text-heading focus:outline-none focus:border-primary">
                    <option>Last 6 Months</option>
                    <option>Last 12 Months</option>
                  </select>
                  <a href="#analytics" className="text-xs font-bold text-primary hover:underline">
                    View full analytics
                  </a>
                </div>
              </div>

              {/* Line chart visualization */}
              <div className="flex items-center gap-6 flex-col sm:flex-row">
                
                {/* Big number block */}
                <div className="text-left shrink-0 space-y-1">
                  <span className="text-5xl font-extrabold text-heading block tracking-tight">
                    {data.overallRating}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= Math.round(data.overallRating)
                              ? 'fill-gold stroke-gold'
                              : 'stroke-border text-border'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-heading">({data.totalReviews})</span>
                  </div>
                  <p className="text-[11px] text-muted font-medium pt-1 max-w-[140px]">
                    Average score calculated from all client reviews.
                  </p>
                </div>

                {/* SVG Graph */}
                <div className="flex-1 w-full relative">
                  <svg className="w-full h-[180px]" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
                    <defs>
                      <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Grid Lines */}
                    {[1, 2, 3, 4, 5].map((grid) => {
                      const y = paddingY + chartHeight - ((grid - 1) / 4) * chartHeight;
                      return (
                        <g key={grid}>
                          <line
                            x1={paddingX}
                            y1={y}
                            x2={svgWidth - paddingX}
                            y2={y}
                            stroke="var(--color-border)"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                            opacity="0.6"
                          />
                          <text
                            x={paddingX - 10}
                            y={y + 4}
                            fontSize="9"
                            fontWeight="bold"
                            fill="var(--color-muted)"
                            textAnchor="end"
                          >
                            {grid}.0
                          </text>
                        </g>
                      );
                    })}

                    {/* Area Fill */}
                    <path d={areaD} fill="url(#chartGlow)" />

                    {/* Plot Line */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="var(--color-primary)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Circles on dots */}
                    {points.map((p, idx) => (
                      <g key={idx} className="group cursor-pointer">
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r="5.5"
                          fill="var(--color-surface)"
                          stroke="var(--color-primary)"
                          strokeWidth="3.5"
                        />
                        <text
                          x={p.x}
                          y={p.y - 12}
                          fontSize="9"
                          fontWeight="bold"
                          fill="var(--color-heading)"
                          textAnchor="middle"
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-surface px-1 py-0.5 shadow-sm rounded"
                        >
                          {p.val}
                        </text>
                      </g>
                    ))}

                    {/* X Axis Labels */}
                    {points.map((p, idx) => (
                      <text
                        key={idx}
                        x={p.x}
                        y={svgHeight - paddingY + 16}
                        fontSize="9.5"
                        fontWeight="bold"
                        fill="var(--color-muted)"
                        textAnchor="middle"
                      >
                        {trendLabels[idx]}
                      </text>
                    ))}
                  </svg>
                </div>

              </div>

            </div>

            {/* Rating Breakdown Card */}
            <div className="bg-surface p-6 rounded-card border border-border/40 shadow-soft">
              <div className="mb-5">
                <h3 className="text-base font-extrabold text-heading">Rating Breakdown</h3>
                <p className="text-xs text-muted">Distribution of star ratings left by clients</p>
              </div>

              <div className="space-y-3.5">
                {data.ratingBreakdown.map((item) => (
                  <div key={item.star} className="flex items-center gap-4 text-xs">
                    <span className="w-8 font-bold text-heading flex items-center gap-1">
                      {item.star} <Star className="w-3.5 h-3.5 fill-gold stroke-gold shrink-0" />
                    </span>
                    <div className="flex-1 bg-surface-soft h-3 rounded-full overflow-hidden border border-border/40">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="w-12 text-right font-semibold text-muted">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border/60 mt-5 pt-4 flex justify-between items-center text-xs">
                <span className="font-bold text-heading">Total Ratings Recorded</span>
                <span className="font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  {data.totalReviews} Reviews
                </span>
              </div>
            </div>

            {/* Topics & Sentiment Split Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Latest Review Summary Donut chart */}
              <div className="bg-surface p-6 rounded-card border border-border/40 shadow-soft flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-heading">Latest Review Summary</h3>
                  <p className="text-xs text-muted">Overall feedback tone distribution</p>
                </div>

                <div className="flex items-center justify-center gap-8 py-6">
                  {/* SVG Donut Circle */}
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      {/* Grey background circle */}
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="transparent"
                        stroke="var(--color-border)"
                        strokeWidth="3"
                      />
                      
                      {/* Positive segments (Green) */}
                      {data.ratingSummary.positive.percentage > 0 && (
                        <circle
                          cx="18"
                          cy="18"
                          r="15.915"
                          fill="transparent"
                          stroke="var(--color-success)"
                          strokeWidth="3.2"
                          strokeDasharray={`${data.ratingSummary.positive.percentage} ${100 - data.ratingSummary.positive.percentage}`}
                          strokeDashoffset="0"
                        />
                      )}

                      {/* Neutral segments (Yellow) */}
                      {data.ratingSummary.neutral.percentage > 0 && (
                        <circle
                          cx="18"
                          cy="18"
                          r="15.915"
                          fill="transparent"
                          stroke="var(--color-gold)"
                          strokeWidth="3.2"
                          strokeDasharray={`${data.ratingSummary.neutral.percentage} ${100 - data.ratingSummary.neutral.percentage}`}
                          strokeDashoffset={`-${data.ratingSummary.positive.percentage}`}
                        />
                      )}

                      {/* Negative segments (Red) */}
                      {data.ratingSummary.negative.percentage > 0 && (
                        <circle
                          cx="18"
                          cy="18"
                          r="15.915"
                          fill="transparent"
                          stroke="var(--color-danger)"
                          strokeWidth="3.2"
                          strokeDasharray={`${data.ratingSummary.negative.percentage} ${100 - data.ratingSummary.negative.percentage}`}
                          strokeDashoffset={`-${data.ratingSummary.positive.percentage + data.ratingSummary.neutral.percentage}`}
                        />
                      )}
                    </svg>
                    {/* Inner label */}
                    <div className="absolute flex flex-col items-center select-none">
                      <span className="text-xl font-extrabold text-heading leading-none">
                        {data.totalReviews}
                      </span>
                      <span className="text-[9px] font-bold text-muted uppercase mt-0.5">Reviews</span>
                    </div>
                  </div>

                  {/* Labeled Stats List */}
                  <div className="space-y-3.5 text-xs text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0">
                        <Smile className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <span className="font-bold text-heading">Positive ({data.ratingSummary.positive.percentage}%)</span>
                        <span className="block text-[10px] text-muted font-semibold">{data.ratingSummary.positive.count} reviews</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gold/10 text-gold flex items-center justify-center shrink-0">
                        <Meh className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <span className="font-bold text-heading">Neutral ({data.ratingSummary.neutral.percentage}%)</span>
                        <span className="block text-[10px] text-muted font-semibold">{data.ratingSummary.neutral.count} reviews</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-danger/10 text-danger flex items-center justify-center shrink-0">
                        <Frown className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <span className="font-bold text-heading">Negative ({data.ratingSummary.negative.percentage}%)</span>
                        <span className="block text-[10px] text-muted font-semibold">{data.ratingSummary.negative.count} reviews</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Top Review Topics card */}
              <div className="bg-surface p-6 rounded-card border border-border/40 shadow-soft flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-base font-extrabold text-heading">Top Review Topics</h3>
                    <a href="#topics" className="text-xs font-bold text-primary hover:underline">
                      View all
                    </a>
                  </div>
                  <p className="text-xs text-muted">Recurring themes referenced in reviews</p>
                </div>

                <div className="space-y-4 py-4 text-xs">
                  {data.reviewTopics.map((topic, index) => (
                    <div key={topic.name} className="space-y-1 text-left">
                      <div className="flex items-center justify-between font-bold text-heading">
                        <span className="flex items-center gap-1.5">
                          <span className="text-muted">{index + 1}.</span> {topic.name}
                        </span>
                        <span className="text-primary">{topic.value}% Positive</span>
                      </div>
                      <div className="bg-surface-soft h-2 rounded-full border border-border/40 overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-500"
                          style={{ width: `${topic.value}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT SPLIT (1/3 width) - Recent reviews & percentile */}
          <div className="space-y-6">
            
            {/* Recent Reviews Card */}
            <div className="bg-surface p-5 rounded-card border border-border/40 shadow-soft flex flex-col justify-between min-h-[460px]">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-heading">Recent Reviews</h3>
                  <a href="#reviews" className="text-xs font-bold text-primary hover:underline">
                    View All Reviews →
                  </a>
                </div>
                <p className="text-xs text-muted">Latest feedback submitted by clients</p>
              </div>

              {/* Feed items list */}
              <div className="space-y-4 py-4 divide-y divide-border/60">
                {data.recentReviews.length === 0 ? (
                  <div className="text-center text-xs text-muted py-12">
                    No reviews received yet.
                  </div>
                ) : (
                  data.recentReviews.map((review) => (
                    <div key={review.id} className={`pt-4 text-left space-y-2 first:pt-0`}>
                      <div className="flex justify-between items-start gap-2">
                        {/* Reviewer Details */}
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-primary/20">
                            {review.user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-heading leading-tight truncate max-w-[120px]">
                              {review.user.name}
                            </h4>
                            <span className="text-[9px] text-muted font-bold block mt-0.5">
                              {getRelativeTime(review.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Numeric rating chip */}
                        <span className="text-[10px] font-extrabold text-success bg-success/15 px-2 py-0.5 rounded-full flex items-center gap-0.5 shrink-0 border border-success/20">
                          {review.value}.0 ★
                        </span>
                      </div>

                      {/* Comment text */}
                      <p className="text-xs text-body italic leading-normal font-medium pl-1 border-l-2 border-primary/20">
                        "{review.comment}"
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  className="w-full py-2.5 rounded-btn bg-surface border border-border hover:bg-surface-soft text-xs font-bold text-heading flex items-center justify-center gap-1.5 transition-all focus:outline-none"
                >
                  Manage Feedback <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Lavender Percentile Card */}
            <div className="bg-lavender p-6 rounded-card border border-border/30 text-left space-y-4 relative overflow-hidden shadow-soft flex flex-col justify-between min-h-[200px]">
              <div className="space-y-2.5 z-10 relative">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <h4 className="text-base font-extrabold text-heading">Keep It Up!</h4>
                <p className="text-xs text-body leading-relaxed font-semibold">
                  Your store rating is higher than <span className="text-primary font-extrabold">{data.percentile}%</span> of similar businesses.
                </p>
              </div>

              <div className="z-10 relative">
                <button
                  type="button"
                  className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-btn text-xs font-bold shadow-md shadow-primary/10 transition-all focus:outline-none"
                >
                  View Insights
                </button>
              </div>

              <div className="absolute right-[-15px] bottom-[-20px] opacity-10 text-6xl select-none">
                🏅
              </div>
            </div>

          </div>

        </div>

      </div>
    </StoreLayout>
  );
};

export default StoreOwnerDashboard;
