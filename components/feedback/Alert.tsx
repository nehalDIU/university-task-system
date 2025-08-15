import * as React from 'react'
import { cn } from '@/lib/utils'

export interface AlertProps {
  children: React.ReactNode
  variant?: 'default' | 'destructive' | 'warning' | 'success'
  className?: string
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ children, variant = 'default', className }, ref) => {
    const variantStyles = {
      default: 'border-gray-200 bg-gray-50 text-gray-900',
      destructive: 'border-red-200 bg-red-50 text-red-900',
      warning: 'border-yellow-200 bg-yellow-50 text-yellow-900',
      success: 'border-green-200 bg-green-50 text-green-900',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full rounded-lg border p-4',
          variantStyles[variant],
          className
        )}
        role="alert"
      >
        {children}
      </div>
    )
  }
)
Alert.displayName = 'Alert'

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
))
AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertDescription }



