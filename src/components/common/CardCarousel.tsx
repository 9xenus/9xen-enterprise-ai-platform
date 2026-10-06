import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CardCarouselProps {
  id?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  actionButton?: React.ReactNode;
  children: React.ReactNode[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
}

export const CardCarousel: React.FC<CardCarouselProps> = ({
  id,
  title,
  subtitle,
  badge,
  actionButton,
  children,
  autoPlay = false,
  autoPlayInterval = 6000,
  className = '',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const totalItems = React.Children.count(children);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);

    // Calculate approximate active item index
    if (el.children.length > 0) {
      const child = el.children[0] as HTMLElement;
      const childWidth = child.offsetWidth + 20; // 20px gap
      const newIndex = Math.min(
        totalItems - 1,
        Math.max(0, Math.round(scrollLeft / childWidth))
      );
      setCurrentIndex(newIndex);
    }
  }, [totalItems]);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  // Autoplay functionality
  useEffect(() => {
    if (!autoPlay || isHovered || totalItems <= 1) return;

    const timer = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;

      const nextIndex = (currentIndex + 1) % totalItems;
      scrollToIndex(nextIndex);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, isHovered, currentIndex, totalItems]);

  const scrollToIndex = (index: number) => {
    const el = scrollRef.current;
    if (!el || !el.children[index]) return;

    const child = el.children[index] as HTMLElement;
    el.scrollTo({
      left: child.offsetLeft - el.offsetLeft,
      behavior: 'smooth',
    });
  };

  const handlePrev = () => {
    const el = scrollRef.current;
    if (!el) return;
    const childWidth = (el.children[0] as HTMLElement)?.offsetWidth || 320;
    el.scrollBy({ left: -(childWidth + 24), behavior: 'smooth' });
  };

  const handleNext = () => {
    const el = scrollRef.current;
    if (!el) return;
    const childWidth = (el.children[0] as HTMLElement)?.offsetWidth || 320;
    el.scrollBy({ left: childWidth + 24, behavior: 'smooth' });
  };

  return (
    <div
      id={id}
      className={`w-full relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      {/* Header with Title and Prev/Next Carousel Arrows */}
      {(title || badge || actionButton) && (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div className="min-w-0">
            {badge && <div className="mb-2">{badge}</div>}
            {title && (
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white dark:text-white light:text-slate-950 tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 light:text-slate-600 mt-1 sm:mt-2 max-w-2xl leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
            {actionButton}

            {/* Navigation Buttons */}
            {totalItems > 1 && (
              <div className="flex items-center gap-2 bg-slate-900/60 dark:bg-slate-900/60 light:bg-slate-100 p-1 rounded-2xl border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-sm backdrop-blur-sm">
                <button
                  onClick={handlePrev}
                  disabled={!canScrollLeft}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white dark:hover:text-white light:hover:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="text-[11px] font-mono font-bold text-slate-400 dark:text-slate-400 light:text-slate-500 px-1 select-none">
                  <span className="text-cyan-400 dark:text-cyan-400 light:text-cyan-600">
                    {String(currentIndex + 1).padStart(2, '0')}
                  </span>
                  <span className="opacity-40">/</span>
                  <span>{String(totalItems).padStart(2, '0')}</span>
                </div>
                <button
                  onClick={handleNext}
                  disabled={!canScrollRight}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white dark:hover:text-white light:hover:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Carousel Track with smooth momentum scrolling and snap */}
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div
          ref={scrollRef}
          className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar py-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {React.Children.map(children, (child, idx) => (
            <div
              key={idx}
              className="shrink-0 snap-start transition-transform duration-300"
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Dot Indicators */}
      {totalItems > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-6 pt-2">
          {Array.from({ length: totalItems }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollToIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === idx
                  ? 'w-6 bg-cyan-400 dark:bg-cyan-400 light:bg-cyan-600'
                  : 'w-1.5 bg-slate-700 dark:bg-slate-700 light:bg-slate-300 hover:bg-slate-500'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
