import Image from 'next/image';
import { getInitials } from '@/lib/helpers';
import { cn } from '@/lib/helpers';

const sizes = { xs: 'w-7 h-7 text-xs', sm: 'w-9 h-9 text-sm', md: 'w-11 h-11 text-base', lg: 'w-14 h-14 text-lg', xl: 'w-20 h-20 text-2xl' };

export default function Avatar({ src, name, size = 'md', className }) {
  return src
    ? <div className={cn('rounded-full overflow-hidden ring-2 ring-brand-500/30 flex-shrink-0', sizes[size], className)}>
        <img src={src} alt={name || 'Avatar'} className="w-full h-full object-cover" />
      </div>
    : <div className={cn('rounded-full flex items-center justify-center font-bold flex-shrink-0', sizes[size], className)} style={{ background: 'linear-gradient(135deg,#6366f1,#f43f5e)', color: '#fff' }}>
        {getInitials(name)}
      </div>;
}
