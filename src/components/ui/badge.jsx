import { cn } from '../../lib/utils'

const variantClasses = {
  default: 'border-transparent bg-primary text-primary-foreground shadow',
  secondary: 'border-transparent bg-secondary text-secondary-foreground',
  destructive: 'border-transparent bg-destructive text-destructive-foreground shadow',
  outline: 'text-foreground',
  draft: 'border-transparent bg-gray-100 text-gray-700',
  submitted: 'border-transparent bg-blue-100 text-blue-700',
  received: 'border-transparent bg-yellow-100 text-yellow-700',
  paid: 'border-transparent bg-green-100 text-green-700',
  rejected: 'border-transparent bg-red-100 text-red-700',
}

function Badge({ className, variant = 'default', ...props }) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variantClasses[variant] || variantClasses.default,
        className
      )}
      {...props}
    />
  )
}

export { Badge }
