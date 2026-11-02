import type { ComponentProps, ReactNode } from 'react'

type TextFieldProps = ComponentProps<'input'> & {
  id: string
  label: string
  /** Already-translated error text. */
  error?: string
  /** A control drawn inside the input on the end side, e.g. a show-password button. */
  endSlot?: ReactNode
}

export function TextField({ id, label, error, endSlot, className = '', ...inputProps }: TextFieldProps) {
  const errorId = `${id}-error`
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-text">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`w-full rounded-md border border-border-strong bg-card px-3 py-2.5 text-base text-text placeholder:text-muted aria-invalid:border-danger ${endSlot ? 'pe-12' : ''} ${className}`}
          {...inputProps}
        />
        {endSlot && <div className="absolute inset-y-0 inset-e-1 flex items-center">{endSlot}</div>}
      </div>
      {error && (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
