'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { projectById, tasks as initialTasks } from '@/lib/data'
import { Sidebar, type NavKey } from '@/components/devspace/sidebar'
import { Topbar } from '@/components/devspace/topbar'
import { CreateProjectModal } from '@/components/devspace/create-project-modal'
import { ProjectsLibrary } from '@/components/devspace/screens/projects-library'
import { ProjectWorkspace } from '@/components/devspace/screens/project-workspace'
import { MyDay } from '@/components/devspace/screens/my-day'
import { AllTasks } from '@/components/devspace/screens/all-tasks'
import { Analytics } from '@/components/devspace/screens/analytics'
import { Calendar as CalendarScreen } from '@/components/devspace/screens/calendar'

export default function Page() {
  const [nav, setNav] = useState<NavKey>('home')
  const [openProjectId, setOpenProjectId] = useState<string | null>(null)
  const [mobileNav, setMobileNav] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [taskState, setTaskState] = useState(initialTasks)

  function toggleTask(id: string) {
    setTaskState((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, done: !t.done, status: !t.done ? 'completed' : t.status }
          : t,
      ),
    )
  }

  function navigate(key: NavKey) {
    setNav(key)
    setOpenProjectId(null)
  }

  const openProject = openProjectId ? projectById(openProjectId) : null

  function renderMain() {
    if (openProject) {
      return (
        <ProjectWorkspace
          project={openProject}
          onBack={() => setOpenProjectId(null)}
          onToggleTask={toggleTask}
        />
      )
    }
    switch (nav) {
      case 'home':
      case 'projects':
        return (
          <ProjectsLibrary
            onOpenProject={setOpenProjectId}
            onCreateProject={() => setCreateOpen(true)}
          />
        )
      case 'my-day':
        return <MyDay onToggleTask={toggleTask} />
      case 'all-tasks':
        return <AllTasks tasks={taskState} onToggleTask={toggleTask} />
      case 'analytics':
        return <Analytics />
      case 'calendar':
        return <CalendarScreen />
      default:
        return <ComingSoon label={nav} />
    }
  }

  return (
    <div className="flex h-svh overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar active={nav} onNavigate={navigate} />
      </div>

      {/* Mobile drawer */}
      {mobileNav && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileNav(false)}
          />
          <div className="absolute inset-y-0 left-0 animate-in slide-in-from-left">
            <Sidebar
              active={nav}
              onNavigate={navigate}
              onItemClick={() => setMobileNav(false)}
            />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          onMenu={() => setMobileNav(true)}
          onCreateProject={() => setCreateOpen(true)}
        />
        <main className="scrollbar-thin flex-1 overflow-y-auto">
          {renderMain()}
        </main>
      </div>

      <CreateProjectModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center justify-center px-4 py-32 text-center">
      <div className={cn('flex size-14 items-center justify-center rounded-2xl bg-muted')}>
        <span className="font-mono text-xl text-muted-foreground">
          {label[0].toUpperCase()}
        </span>
      </div>
      <h1 className="mt-5 text-xl font-semibold capitalize text-foreground">
        {label}
      </h1>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        This section is part of the DevSpace design concept and would live here in
        the full product.
      </p>
    </div>
  )
}
