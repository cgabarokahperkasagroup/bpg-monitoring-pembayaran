import { cn } from '../../lib/utils'
import { X } from 'lucide-react'

function Dialog({ open, onClose, children, className }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className={cn('relative z-50 w-full max-w-lg rounded-xl border bg-background p-6 shadow-lg', className)}>
        {children}
      </div>
    </div>
  )
}

function DialogHeader({ className, ...props }) {
  return <div className={cn('flex flex-col space-y-1.5 mb-4', className)} {...props} />
}
function DialogTitle({ className, ...props }) {
  return <h2 className={cn('text-lg font-semibold leading-none', className)} {...props} />
}
function DialogDescription({ className, ...props }) {
  return <p className={cn('text-sm text-muted-foreground mt-1', className)} {...props} />
}
function DialogFooter({ className, ...props }) {
  return <div className={cn('flex justify-end gap-2 mt-4', className)} {...props} />
}
function DialogClose({ onClose }) {
  return (
    <button
      onClick={onClose}
      className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
    >
      <X className="h-4 w-4" />
    </button>
  )
}

export { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose }
