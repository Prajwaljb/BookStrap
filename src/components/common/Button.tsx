import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

type ButtonVariant = 'primary' | 'outline' | 'ghost'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

const baseClasses = 'cursor-pointer rounded-[var(--radius-sm)] border font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50'

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'border-[var(--color-black)] bg-[var(--color-black)] px-3 py-2 text-sm text-[var(--color-white)] hover:bg-[var(--color-white)] hover:text-[var(--color-black)]',
  outline: 'border-[var(--color-black)] bg-[var(--color-white)] px-3 py-2 text-sm text-[var(--color-black)] hover:bg-[var(--color-black)] hover:text-[var(--color-white)]',
  ghost: 'border-transparent bg-transparent px-0 py-0 font-mono text-[10px] text-[var(--color-black)] hover:underline',
}

export function Button({ className, variant = 'outline', ...props }: ButtonProps) {
  return <button className={cn(baseClasses, variantClasses[variant], className)} {...props} />
}
