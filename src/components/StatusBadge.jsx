import { Badge } from './ui/badge'

const statusConfig = {
  draft: { label: 'Draft', variant: 'draft' },
  submitted: { label: 'Diajukan', variant: 'submitted' },
  received: { label: 'Diterima Finance', variant: 'received' },
  paid: { label: 'Dibayar', variant: 'paid' },
  rejected: { label: 'Dikembalikan', variant: 'rejected' },
}

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || { label: status, variant: 'default' }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
