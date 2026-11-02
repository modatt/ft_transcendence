import type { ComponentProps } from 'react'

const variants = {
  // One primary button per screen (SRS section 8).
  primary: 'bg-primary text-on-primary hover:bg-primary-hover',
  ghost: 'text-primary hover:bg-primary-subtle',
}

type ButtonProps = ComponentProps<'button'> & { variant?: keyof typeof variants }

export function Button({ variant = 'primary', className = '', type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    />
  )
}
