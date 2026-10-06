import React from 'react';
import { useCms } from '../../context/CmsContext';
import { AutoTranslate } from '../common/AutoTranslate';
import { CardCarousel } from '../common/CardCarousel';
import {
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  Lock,
  Cpu,
  Database,
  CheckCircle,
  Star,
  Layers,
  ChevronRight,
  TrendingUp,
  Award,
  Bot,
  Briefcase,
  ShoppingCart,
  ShieldCheck,
  Server,
} from 'lucide-react';

interface Props {
  onNavigate: (tab: string, itemId?: string) => void;
  onOpenDemo: () => void;
}

export const HomeView: React.FC<Props> = ({ onNavigate, onOpenDemo }) => {
  const { cmsData } = useCms();
  const { hero, services, products, testimonials, caseStudies } = cmsData;

  const allServices = services || [];
  const allProducts = products || [];
  const highlightedCaseStudy = (caseStudies || [])[0];

  const getServiceIcon = (category?: string, iconName?: string) => {
    switch (category?.toLowerCase() || iconName?.toLowerCase()) {
      case 'healthcare':
      case 'health':
        return <Cpu className="w-5 h-5 text-cyan-400" />;
      case 'finance':
      case 'briefcase':
        return <Briefcase className="w-5 h-5 text-indigo-400" />;
      case 'ecommerce':
      case 'shoppingcart':
        return <ShoppingCart className="w-5 h-5 text-amber-400" />;
      case 'regtech':
      case 'shieldcheck':
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      default:
        return <Cpu className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-16 sm:space-y-24 lg:space-y-28 pb-16 sm:pb-24">
      {/* Hero Section */}
      <section className="relative pt-8 sm:pt-16 lg:pt-24 w-full">
        {/* Custom Imagen / AI Background Imagery */}
        {hero?.backgroundImageUrl && (
          <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none select-none">
            <img
              src={hero.backgroundImageUrl}
              alt="Hero Background Wallpaper"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center scale-105 transition-all duration-700"
              style={{
                filter: `blur(${hero.backgroundBlur || 0}px)`,
              }}
            />
            {/* Tone-balanced scrim to protect typography readability */}
            <div
              className="absolute inset-0 bg-slate-950 dark:bg-slate-950 light:bg-slate-950"
              style={{
                opacity: (hero.backgroundOverlayOpacity ?? 75) / 100,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-transparent to-slate-950" />
            <div className="absolute inset-0 bg-radial-at-c from-transparent via-slate-950/40 to-slate-950" />
          </div>
        )}

        {/* Background glow meshes */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[600px] lg:w-[850px] h-[350px] sm:h-[450px] bg-gradient-to-tr from-cyan-500/15 via-violet-600/15 to-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          {(hero?.badge || hero?.badgeText) && (
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-slate-900/80 dark:bg-slate-900/80 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-200 text-xs text-cyan-400 font-semibold mb-5 shadow-sm animate-fade-in-down">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <AutoTranslate text={hero.badge || hero.badgeText || ''} />
            </div>
          )}

          {/* Main Title */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white dark:text-white light:text-slate-950 max-w-4xl mx-auto leading-tight sm:leading-tight animate-fade-in-up">
            <AutoTranslate text={hero?.headline || 'Autonomous Intelligence for Next-Gen Enterprises'} />
          </h1>

          {/* Subheadline */}
          <p className="mt-4 sm:mt-5 text-xs sm:text-base lg:text-lg text-slate-400 dark:text-slate-400 light:text-slate-600 max-w-2xl mx-auto leading-relaxed px-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <AutoTranslate
              text={
                hero?.subheadline ||
                'Build, fine-tune, and orchestrate private neural networks and autonomous multi-agent workflows with strict SOC-2 compliance, VPC peering, and zero data leakage.'
              }
            />
          </p>

          {/* CTAs */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <button
              onClick={onOpenDemo}
              id="hero-demo-btn"
              className="w-full sm:w-auto px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-violet-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-xl shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer animate-pulse-glow"
            >
              <span>{hero?.ctaText || hero?.ctaPrimaryText || 'Schedule Executive Demo'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('platforms')}
              id="hero-explore-btn"
              className="w-full sm:w-auto px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl bg-slate-900/80 dark:bg-slate-900/80 light:bg-white hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-200 text-slate-200 dark:text-slate-200 light:text-slate-800 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span>{hero?.ctaSecondaryText || 'Explore Platform Architecture'}</span>
            </button>
          </div>

          {/* Statistics Strip - Screenfit Responsive */}
          {(hero?.stats || hero?.metrics) && (
            <div className="mt-12 sm:mt-20 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              {(hero.stats || hero.metrics || []).map((stat, i) => (
                <div
                  key={i}
                  className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-900/50 dark:bg-slate-900/50 light:bg-white/80 border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200/80 shadow-md backdrop-blur-sm flex flex-col justify-center items-center text-center card-lift"
                >
                  <div className="text-xl sm:text-2xl lg:text-3xl font-black text-cyan-400 dark:text-cyan-400 light:text-cyan-600 font-mono tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-[11px] sm:text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-slate-500 mt-1 line-clamp-1">
                    <AutoTranslate text={stat.label} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CAROUSEL SECTION 1: Services & Capabilities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <CardCarousel
          id="services-carousel"
          badge={
            <div className="text-[11px] font-bold font-mono uppercase tracking-widest text-cyan-400">
              Capabilities & Execution
            </div>
          }
          title="Autonomous Systems & AI Engineering"
          subtitle="Production-grade AI micro-agents, regulatory audits, and self-optimizing pipelines designed for high-throughput enterprise infrastructure."
          actionButton={
            <button
              onClick={() => onNavigate('services')}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer py-1"
            >
              <span>View all services</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          }
        >
          {allServices.map((srv) => (
            <div
              key={srv.id}
              onClick={() => onNavigate('services', srv.id)}
              className="w-[84vw] sm:w-[320px] md:w-[340px] lg:w-[360px] h-full p-5 sm:p-6 rounded-3xl bg-slate-900/60 dark:bg-slate-900/60 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 hover:border-cyan-500/50 transition-all flex flex-col justify-between group cursor-pointer shadow-sm hover:shadow-cyan-500/10 card-lift"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {getServiceIcon(srv.category, srv.iconName)}
                  </div>
                  {srv.pricingLabel && (
                    <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/30">
                      {srv.pricingLabel}
                    </span>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white dark:text-white light:text-slate-950 group-hover:text-cyan-400 transition-colors">
                  <AutoTranslate text={srv.title} />
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  <AutoTranslate text={srv.shortDescription} />
                </p>

                {srv.techStack && srv.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {srv.techStack.slice(0, 3).map((tech, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800/80 dark:bg-slate-800/80 light:bg-slate-100 text-slate-300 dark:text-slate-300 light:text-slate-700"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 sm:pt-5 mt-5 border-t border-slate-800/60 dark:border-slate-800/60 light:border-slate-100 flex items-center justify-between text-xs font-semibold text-cyan-400">
                <span>Learn Details</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </CardCarousel>
      </section>

      {/* CAROUSEL SECTION 2: Featured Products Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="p-5 sm:p-8 lg:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 sm:w-96 h-80 sm:h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

          <CardCarousel
            id="products-carousel"
            badge={
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 text-xs font-bold font-mono">
                <Layers className="w-3.5 h-3.5" />
                <span>Enterprise Product Suites</span>
              </div>
            }
            title="Engineered for Scalable Deployment"
            subtitle="Plug-and-play autonomous engines, model distillation frameworks, and regulatory guardrails ready for cloud, hybrid, or on-premise execution."
            actionButton={
              <button
                onClick={() => onNavigate('products')}
                className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors cursor-pointer py-1"
              >
                <span>All products</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            }
          >
            {allProducts.map((prod) => (
              <div
                key={prod.id}
                onClick={() => onNavigate('products', prod.id)}
                className="w-[84vw] sm:w-[330px] md:w-[360px] lg:w-[380px] h-full p-5 sm:p-6 rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-violet-500/40 transition-all flex flex-col justify-between cursor-pointer group shadow-md card-lift"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] uppercase font-mono font-bold px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                      {prod.category}
                    </span>
                    {prod.badge && (
                      <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        {prod.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-violet-400 transition-colors">
                    <AutoTranslate text={prod.title} />
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    <AutoTranslate text={prod.tagline || prod.shortDescription} />
                  </p>

                  {prod.specs && prod.specs.length > 0 && (
                    <div className="mt-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1.5">
                      {prod.specs.slice(0, 2).map((spec, sIdx) => (
                        <div key={sIdx} className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">{spec.label}</span>
                          <span className="font-mono text-violet-300 font-semibold">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-900 flex items-center justify-between text-xs text-slate-400 group-hover:text-white">
                  <span>Explore Architecture</span>
                  <ArrowRight className="w-3.5 h-3.5 text-violet-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </CardCarousel>
        </div>
      </section>

      {/* Highlighted Case Study Banner - Screenfit */}
      {highlightedCaseStudy && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="p-6 sm:p-10 lg:p-12 rounded-3xl bg-slate-900/60 dark:bg-slate-900/60 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 flex flex-col lg:flex-row items-center gap-6 sm:gap-8 shadow-sm card-lift">
            <div className="flex-1 space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  Featured Case Study
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400">{highlightedCaseStudy.industry}</span>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white dark:text-white light:text-slate-950">
                <AutoTranslate text={highlightedCaseStudy.title} />
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed">
                <AutoTranslate text={highlightedCaseStudy.summary} />
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                  <div className="text-base sm:text-lg font-black text-cyan-400 font-mono">
                    {highlightedCaseStudy.impactMetric}
                  </div>
                  <div className="text-[10px] text-slate-400">Demonstrated Impact</div>
                </div>
                <button
                  onClick={() => onNavigate('case-studies', highlightedCaseStudy.id)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Read Enterprise Study
                </button>
              </div>
            </div>

            {highlightedCaseStudy.coverImage && (
              <div className="w-full lg:w-96 aspect-video rounded-2xl overflow-hidden border border-slate-800 shrink-0">
                <img
                  src={highlightedCaseStudy.coverImage}
                  alt={highlightedCaseStudy.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* CAROUSEL SECTION 4: Testimonials Carousel (Auto-playing) */}
      {testimonials && testimonials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <CardCarousel
            id="testimonials-carousel"
            autoPlay={true}
            autoPlayInterval={5000}
            badge={
              <div className="text-[11px] font-bold font-mono uppercase tracking-widest text-cyan-400">
                Industry Trust
              </div>
            }
            title="Trusted by Autonomous Leaders"
            subtitle="Verified executive perspectives on high-availability agent orchestration and regulatory model security."
          >
            {testimonials.map((item) => (
              <div
                key={item.id}
                className="w-[85vw] sm:w-[340px] md:w-[380px] lg:w-[420px] h-full p-6 rounded-3xl bg-slate-900/50 dark:bg-slate-900/50 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 flex flex-col justify-between shadow-sm card-lift"
              >
                <div>
                  <div className="flex gap-1 text-amber-400 mb-4">
                    {[...Array(item.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 dark:text-slate-300 light:text-slate-700 italic leading-relaxed">
                    "{item.quote}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/50 dark:border-slate-800/50 light:border-slate-100 flex items-center gap-3">
                  {item.avatarUrl && (
                    <img
                      src={item.avatarUrl}
                      alt={item.author}
                      className="w-9 h-9 rounded-full object-cover border border-slate-700"
                    />
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white dark:text-white light:text-slate-950 truncate">
                      {item.author}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-400 light:text-slate-500 truncate">
                      {item.role}, {item.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardCarousel>
        </section>
      )}

      {/* Pre-Footer Action Banner - Screenfit */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="p-6 sm:p-10 lg:p-14 rounded-3xl bg-gradient-to-r from-cyan-900/40 via-violet-900/40 to-indigo-900/40 border border-cyan-500/20 text-center space-y-5 sm:space-y-6 relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-2 sm:space-y-3">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">
              Ready to Secure Your Autonomous AI Workflows?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed px-2">
              Connect with our enterprise engineering team to design, fine-tune, and deploy private neural systems built specifically for your organizational requirements.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 px-2">
            <button
              onClick={onOpenDemo}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Schedule Architecture Review</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Contact Global HQ
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
