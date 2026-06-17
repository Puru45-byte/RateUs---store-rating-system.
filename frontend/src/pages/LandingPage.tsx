import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import Button from '../components/Button';
import homepageImg from '../assets/homepage.png';
import { Shield, Users, BarChart3, Store, Star, ArrowRight, Play, CheckCircle2, Menu, X, Check } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans overflow-x-hidden relative">
      
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary-light/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[400px] left-[-200px] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none z-0" />

      {/* Sticky Header */}
      <header className="sticky top-0 bg-surface/90 backdrop-blur-md border-b border-border/40 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />

          {/* Center nav links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-bold text-primary transition-colors">Home</Link>
            <a href="#features" className="text-sm font-semibold text-body hover:text-primary transition-colors">Features</a>
            <a href="#businesses" className="text-sm font-semibold text-body hover:text-primary transition-colors">For Businesses</a>
            <a href="#pricing" className="text-sm font-semibold text-body hover:text-primary transition-colors">Pricing</a>
            <a href="#about" className="text-sm font-semibold text-body hover:text-primary transition-colors">About Us</a>
            <a href="#blog" className="text-sm font-semibold text-body hover:text-primary transition-colors">Blog</a>
          </nav>

          {/* Right auth links */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login">
              <Button variant="outline" className="px-5">Log in</Button>
            </Link>
            <Link to="/login">
              <Button variant="primary" className="px-6">Get Started</Button>
            </Link>
          </div>

          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            className="md:hidden text-heading p-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-surface border-b border-border p-6 space-y-4 absolute top-full left-0 w-full shadow-lg z-50">
            <nav className="flex flex-col gap-4">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-primary">Home</Link>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-body hover:text-primary">Features</a>
              <a href="#businesses" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-body hover:text-primary">For Businesses</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-body hover:text-primary">Pricing</a>
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-body hover:text-primary">About Us</a>
              <a href="#blog" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-body hover:text-primary">Blog</a>
            </nav>
            <div className="flex flex-col gap-3 pt-4 border-t border-border">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">Log in</Button>
              </Link>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full">Get Started</Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-12 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10">
        
        {/* Left column */}
        <div className="lg:col-span-5 flex flex-col items-start text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Trusted by Thousands of Users & Stores
          </div>

          <h1 className="text-5xl lg:text-6xl font-extrabold text-heading tracking-tight leading-tight">
            Real Reviews.<br />
            <span className="text-primary font-bold">Stronger Decisions.</span>
          </h1>

          <p className="text-base lg:text-lg text-body leading-relaxed max-w-xl">
            Rate & Review helps users share honest feedback and helps businesses build trust, improve experiences, and grow with confidence.
          </p>

          <div className="flex flex-wrap gap-4 w-full sm:w-auto">
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="primary" className="w-full sm:w-auto px-7 py-3 text-base flex items-center justify-center gap-2">
                Get Started Free <ArrowRight className="w-4.5 h-4.5" />
              </Button>
            </Link>
            <button
              type="button"
              className="w-full sm:w-auto px-7 py-3 text-sm font-bold bg-surface border border-border text-heading hover:bg-surface-soft hover:border-muted/30 rounded-btn flex items-center justify-center gap-2 select-none"
            >
              <Play className="w-4 h-4 text-primary fill-primary/10" /> Watch Demo
            </button>
          </div>

          {/* Trust checklist row */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 text-sm font-semibold text-muted">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4.5 h-4.5 text-primary" /> Free to use
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4.5 h-4.5 text-primary" /> Easy to setup
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4.5 h-4.5 text-primary" /> No credit card required
            </span>
          </div>
        </div>

        {/* Right illustration column */}
        <div className="lg:col-span-7 flex justify-center items-center relative w-full mt-8 lg:mt-0">
          
          {/* Decorative leaf shapes */}
          <svg className="absolute -left-6 -bottom-10 w-28 h-28 text-primary/10 pointer-events-none" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 0C50 0 35 30 35 50C35 70 50 100 50 100C50 100 65 70 65 50C65 30 50 0 50 0Z" />
            <path d="M20 20C20 20 15 45 25 60C35 75 50 85 50 85C50 85 35 75 25 60C15 45 20 20 20 20Z" opacity="0.7" />
            <path d="M80 20C80 20 85 45 75 60C65 75 50 85 50 85C50 85 65 75 75 60C85 45 80 20 80 20Z" opacity="0.7" />
          </svg>
          <svg className="absolute -right-10 top-0 w-32 h-32 text-primary/10 pointer-events-none" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 0C50 0 35 30 35 50C35 70 50 100 50 100C50 100 65 70 65 50C65 30 50 0 50 0Z" transform="rotate(30, 50, 50)" />
            <path d="M20 20C20 20 15 45 25 60C35 75 50 85 50 85C50 85 35 75 25 60C15 45 20 20 20 20Z" transform="rotate(30, 50, 50)" opacity="0.7" />
            <path d="M80 20C80 20 85 45 75 60C65 75 50 85 50 85C50 85 65 75 75 60C85 45 80 20 80 20Z" transform="rotate(30, 50, 50)" opacity="0.7" />
          </svg>

          {/* Image template with float overlays */}
          <div className="relative bg-surface rounded-card shadow-soft p-2.5 border border-border/10 overflow-visible w-full max-w-[580px] transition-transform duration-300 hover:scale-[1.01] z-20">
            <img
              src={homepageImg}
              alt="Rate & Review Dashboard Mockup"
              className="w-full h-auto rounded-[12px]"
            />

            {/* Overlapping Floating Chip 1 (Top Right) */}
            <div className="absolute -top-[12%] -right-[4%] md:-right-[8%] bg-surface px-4.5 py-3.5 rounded-card shadow-xl border border-border/15 flex items-center gap-3 w-[260px] z-30">
              
              {/* Checkmark corner badge */}
              <div className="absolute -top-2.5 -right-2.5 bg-success text-white p-1 rounded-full shadow-md border-2 border-surface flex items-center justify-center">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>

              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 text-lg">
                👩
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-0.5 mb-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-gold stroke-gold" />
                  ))}
                </div>
                <span className="text-xs font-bold text-heading leading-tight">
                  Great experience! Highly recommended.
                </span>
              </div>
            </div>

            {/* Overlapping Floating Chip 2 (Bottom Right) */}
            <div className="absolute -bottom-[8%] right-[6%] bg-surface px-4 py-3.5 rounded-card shadow-xl border border-border/15 flex items-center gap-3 w-[240px] z-30">
              <div className="p-2.5 rounded-btn bg-primary/10 text-primary shrink-0">
                <Shield className="w-5 h-5 fill-primary/10" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-heading">Trusted Platform</span>
                <span className="text-[10px] font-bold text-muted mt-0.5">
                  Secure • Reliable • Transparent
                </span>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* Why Choose Us Section */}
      <section id="features" className="bg-surface py-20 border-t border-border/40 z-10 relative">
        <div className="max-w-7xl mx-auto px-6 text-center">
          
          <h2 className="text-3xl lg:text-4xl font-extrabold text-heading tracking-tight mb-16">
            Why Choose Rate & Review?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-surface p-7 rounded-card border border-border/50 hover:border-primary/20 hover:shadow-soft transition-all duration-300 flex flex-col items-center text-center space-y-4">
              <div className="p-4 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-heading">Build Trust</h3>
              <p className="text-sm text-body leading-relaxed">
                Authentic reviews build trust and credibility.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-surface p-7 rounded-card border border-border/50 hover:border-primary/20 hover:shadow-soft transition-all duration-300 flex flex-col items-center text-center space-y-4">
              <div className="p-4 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-heading">Real Feedback</h3>
              <p className="text-sm text-body leading-relaxed">
                Get genuine feedback from real users.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-surface p-7 rounded-card border border-border/50 hover:border-primary/20 hover:shadow-soft transition-all duration-300 flex flex-col items-center text-center space-y-4">
              <div className="p-4 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-heading">Improve & Grow</h3>
              <p className="text-sm text-body leading-relaxed">
                Use insights to improve services and grow.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-surface p-7 rounded-card border border-border/50 hover:border-primary/20 hover:shadow-soft transition-all duration-300 flex flex-col items-center text-center space-y-4">
              <div className="p-4 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-heading">Business Success</h3>
              <p className="text-sm text-body leading-relaxed">
                Happy customers lead to business success.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background py-10 border-t border-border/20 z-10 text-center text-xs text-muted">
        <p>&copy; {new Date().getFullYear()} Rate & Review. All rights reserved.</p>
      </footer>

    </div>
  );
};

export default LandingPage;
