import { useId, useState } from 'react'

interface TooltipProps {
  /** Texto explicativo que se muestra. */
  text: string
  /** Símbolo del botón (por defecto "?"). */
  label?: string
  /** Lado donde abre el globo (por defecto "top"). */
  direction?: 'top' | 'bottom'
  /** Alineación del globo respecto del botón (por defecto "center"). */
  align?: 'left' | 'center' | 'right'
}

export default function Tooltip({
  text,
  label = '?',
  direction = 'top',
  align = 'center',
}: TooltipProps) {
  const [open, setOpen] = useState(false)
  const id = useId()

  const directionClass = direction === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'
  const alignClass =
    align === 'left' ? 'left-0' : align === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2'

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
          className={`pointer-events-none absolute z-10 w-48 rounded border border-felt-600 bg-felt-900 p-2 text-xs font-normal normal-case leading-relaxed tracking-normal text-ink-200 shadow-lg ${directionClass} ${alignClass}`}
        >
          {text}
        </span>
      )}
    </span>
  )
}
