import { Star } from 'lucide-react';

export default function RatingStars({ rating = 0, maxRating = 5, size = 16, interactive = false, onChange }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxRating }, (_, i) => (
        <button key={i} type="button" disabled={!interactive}
          onClick={() => interactive && onChange?.(i + 1)}
          className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}>
          <Star size={size} className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'} />
        </button>
      ))}
    </div>
  );
}
