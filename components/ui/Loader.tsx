import * as React from 'react'
import { cn } from '@/lib/utils'

export interface LoaderProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const Loader = React.forwardRef<HTMLDivElement, LoaderProps>(
  ({ className, size = 'md' }, ref) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-8 h-8',
      lg: 'w-12 h-12'
    }

    return (
      <div ref={ref} className={cn('flex items-center justify-center', className)}>
        <div 
          className={cn(
            'border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin',
            sizeClasses[size]
          )}
        />
      </div>
    )
  }
)
Loader.displayName = 'Loader'

export { Loader }



