import { useState, useRef, useEffect, useMemo } from 'react'
import { cn } from '../../lib/utils'
import { ChevronDown, Search, Check } from 'lucide-react'

// Dropdown dengan kotak pencarian — untuk daftar opsi panjang (mis. nama kapal).
// options: array of { value, label }
export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = '-- Pilih --',
  searchPlaceholder = 'Cari...',
  emptyText = 'Tidak ditemukan',
  clearable = false,
  clearLabel = '-- Tidak ada --',
  disabled = false,
  className,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef(null)
  const inputRef = useRef(null)

  const selected = options.find(o => o.value === value)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter(o => o.label.toLowerCase().includes(q))
  }, [options, query])

  // Tutup saat klik di luar
  useEffect(() => {
    if (!open) return
    const onDocClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  // Fokus kotak pencarian saat dibuka (DOM call, bukan state)
  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => inputRef.current?.focus(), 0)
    return () => clearTimeout(t)
  }, [open])

  const pick = (val) => {
    onChange(val)
    setOpen(false)
  }

  const toggle = () => {
    setQuery('')
    setOpen(o => !o)
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={toggle}
        className={cn(
          'flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          !selected && 'text-muted-foreground',
          className
        )}
      >
        <span className="truncate text-left">{selected ? selected.label : placeholder}</span>
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-1 w-max min-w-full max-w-[min(26rem,calc(100vw-1.5rem))] rounded-md border bg-white shadow-lg">
          <div className="relative border-b p-2">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-8 w-full rounded border border-input bg-transparent pl-8 pr-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="max-h-60 overflow-y-auto py-1">
            {clearable && (
              <button
                type="button"
                onClick={() => pick('')}
                className="flex w-full items-center px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50"
              >
                {clearLabel}
              </button>
            )}
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-gray-400">{emptyText}</p>
            ) : filtered.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => pick(o.value)}
                className={cn(
                  'flex w-full items-start justify-between gap-2 px-3 py-1.5 text-left text-sm hover:bg-blue-50',
                  o.value === value ? 'bg-blue-50/50 font-medium text-blue-700' : 'text-gray-700'
                )}
              >
                <span className="whitespace-normal break-words">{o.label}</span>
                {o.value === value && <Check className="mt-0.5 h-4 w-4 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
