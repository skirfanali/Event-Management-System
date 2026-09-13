'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function EventGallery({ images = [] }) {
  const [selected, setSelected] = useState(null);
  if (!images.length) return null;
  const prev = () => setSelected(i => (i > 0 ? i - 1 : images.length - 1));
  const next = () => setSelected(i => (i < images.length - 1 ? i + 1 : 0));
  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {images.map((img, i) => (
          <motion.div key={i} whileHover={{ scale: 1.03 }} onClick={() => setSelected(i)}
            className="aspect-video rounded-xl overflow-hidden cursor-pointer">
            <img src={img} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
          </motion.div>
        ))}
      </div>
      <AnimatePresence>
        {selected !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={() => setSelected(null)}>
            <motion.img initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
              src={images[selected]} alt="Preview" className="max-w-4xl max-h-[85vh] rounded-2xl object-contain" onClick={e => e.stopPropagation()} />
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 p-2 rounded-full bg-white/10"><X className="text-white" size={20} /></button>
            <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 p-2 rounded-full bg-white/10"><ChevronLeft className="text-white" size={20} /></button>
            <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 p-2 rounded-full bg-white/10"><ChevronRight className="text-white" size={20} /></button>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
