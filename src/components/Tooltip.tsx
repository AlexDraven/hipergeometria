import { useId, useState } from 'react'

interface TooltipProps {
  /** Texto explicativo que se muestra. */
  text: string
  /** Símbolo del botón (por defecto "?"). */
  label?: string
}

export default function Tooltip({ text, label = '?' }: TooltipProps) {
  const [open, setOpen] = useState(false)
  const id = useId()

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label="Explicación"
        aria-describedby={open ? id : undefined}
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-current text-[9px] font-bold leading-none transition hover:opacity-80"
      >
        {label}
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-48 -translate-x-1/2 rounded border border-felt-600 bg-felt-900 p-2 text-xs font-normal normal-case leading-relaxed tracking-normal text-ink-200 shadow-lg"
        >
          {text}
        </span>
      )}
    </span>
  )
}
