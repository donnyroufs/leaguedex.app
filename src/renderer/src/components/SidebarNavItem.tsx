import { JSX } from 'react'
import { NavLink } from 'react-router'
import { LucideIcon } from 'lucide-react'

type Props = {
  to: string
  label: string
  icon: LucideIcon
}

export function SidebarNavItem({ to, label, icon: Icon }: Props): JSX.Element {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `group relative flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
          isActive
            ? 'bg-[rgba(0,212,255,0.1)] text-info'
            : 'text-text-secondary hover:bg-[rgba(255,255,255,0.05)] hover:text-text-primary'
        }`
      }
    >
      {({ isActive }) => (
        <div className="flex items-center gap-3 w-full">
          {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-info" />}
          <Icon size={18} />
          <span className="font-medium">{label}</span>
        </div>
      )}
    </NavLink>
  )
}
