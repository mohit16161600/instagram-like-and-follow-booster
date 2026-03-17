'use client'

import { LogOut } from 'lucide-react'
import { signOutAction } from '@/app/actions'

type ConfirmSignOutButtonProps = {
  className?: string
  iconClassName?: string
  label?: string
  confirmMessage?: string
}

export default function ConfirmSignOutButton({
  className,
  iconClassName,
  label = 'Logout',
  confirmMessage = 'Are you sure you want to logout?',
}: ConfirmSignOutButtonProps) {
  return (
    <form
      action={signOutAction}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault()
        }
      }}
    >
      <button type="submit" className={className}>
        <LogOut className={iconClassName} />
        <span>{label}</span>
      </button>
    </form>
  )
}
