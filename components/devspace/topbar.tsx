'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Bell, LogOut, Menu, Plus, Search } from 'lucide-react'

type CurrentUser = {
  id: string
  email: string
  name: string | null
}

export function Topbar({
  onMenu,
  onCreateProject,
  user,
  onLogout,
}: {
  onMenu: () => void
  onCreateProject: () => void
  user?: CurrentUser | null
  onLogout?: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  const displayName = user?.name || user?.email || 'Гость'
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenu}
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </Button>

      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search projects, tasks, notes…"
          className="h-9 w-full rounded-lg border border-border bg-card pr-16 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 focus:outline-none"
        />
        <kbd className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          /
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button size="sm" onClick={onCreateProject}>
          <Plus className="size-4" />
          <span className="hidden sm:inline">Create Project</span>
        </Button>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="size-5" />
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary ring-2 ring-background" />
        </Button>

        <div className="relative">
          <button
            className="flex items-center gap-2 rounded-lg py-1 pr-2 pl-1 transition-colors hover:bg-muted"
            aria-label="Profile menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-foreground">
              {initials}
            </span>
            <span className="hidden text-sm font-medium text-foreground lg:inline">
              {displayName}
            </span>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-border bg-card p-1 shadow-lg">
                <div className="px-3 py-2 text-xs text-muted-foreground truncate">
                  {user?.email}
                </div>
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    onLogout?.()
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted"
                >
                  <LogOut className="size-4" />
                  Выйти
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}