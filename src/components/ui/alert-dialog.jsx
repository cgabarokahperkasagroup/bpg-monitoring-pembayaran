import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './dialog'
import { Button } from './button'

function AlertDialog({ open, onConfirm, onCancel, title, description, confirmLabel = 'Konfirmasi', confirmVariant = 'default' }) {
  return (
    <Dialog open={open} onClose={onCancel} className="max-w-md">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Batal</Button>
        <Button variant={confirmVariant} onClick={onConfirm}>{confirmLabel}</Button>
      </DialogFooter>
    </Dialog>
  )
}

export { AlertDialog }
