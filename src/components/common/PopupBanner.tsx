import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PopupBanner as PopupBannerType } from '../../types/cms';

interface Props {
  data?: PopupBannerType;
}

export const PopupBanner: React.FC<Props> = ({ data }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (data?.isActive) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [data?.isActive]);

  if (!data?.isActive || !isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-sm aspect-square bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <button
              onClick={() => setIsVisible(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
            >
              <X size={20} />
            </button>
            <div className="relative w-full aspect-[4/3] overflow-hidden">
                <img loading="lazy" src={data.imageUrl} alt={data.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-6 flex flex-col items-center text-center flex-grow">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">{data.subtitle}</span>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{data.title}</h2>
              <p className="text-gray-600 mb-6 text-sm">{data.description}</p>
              <a
                href={data.ctaLink}
                className="w-full py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                {data.ctaText}
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
