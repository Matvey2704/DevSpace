'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useWorkspace } from '@/lib/use-workspace'
import { localizeError, useI18n } from '@/lib/i18n'
import type { Project } from '@/lib/data'
import type { ApiProject } from '@/lib/api-client'
import { Sidebar, type NavKey } from '@/components/devspace/sidebar'
import { Topbar } from '@/components/devspace/topbar'
import { CreateProjectModal } from '@/components/devspace/create-project-modal'
import { TaskModal, type TaskModalState } from '@/components/devspace/task-modal'
import type { TaskActions } from '@/components/devspace/task-actions'
import { ProjectsLibrary } from '@/components/devspace/screens/projects-library'
import { ProjectWorkspace } from '@/components/devspace/screens/project-workspace'
import { MyDay } from '@/components/devspace/screens/my-day'
import { AllTasks } from '@/components/devspace/screens/all-tasks'
import { Analytics } from '@/components/devspace/screens/analytics'
import { Calendar as CalendarScreen } from '@/components/devspace/screens/calendar'
import { Settings as SettingsScreen } from '@/components/devspace/screens/settings'
import { X } from 'lucide-react'

type CurrentUser = {
  id: string
  email: string
  name: string | null
  lastOpenedProjectId: string | null
}

export default function Page() {
  const router = useRouter()
  const { t } = useI18n()
  const [nav, setNav] = useState<NavKey>('home')
  const [openProjectId, setOpenProjectId] = useState<string | null>(null)
  const [mobileNav, setMobileNav] = useState(false)
  const [projectModal, setProjectModal] = useState<{ project?: Project } | null>(null)
  const [taskModal, setTaskModal] = useState<TaskModalState | null>(null)
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  const ws = useWorkspace(!checkingAuth)

  useEffect(() => {
    let cancelled = false

    async function checkSession() {
      const res = await fetch('/api/auth/me')
      if (cancelled) return

      if (!res.ok) {
        router.replace('/login')
        return
      }

      const data = await res.json()
      setUser(data.user)
      setCheckingAuth(false)
    }

    checkSession()
    return () => {
      cancelled = true
    }
  }, [router])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.replace('/login')
  }

  function navigate(key: NavKey) {
    setNav(key)
    setOpenProjectId(null)
  }

  function openProject(id: string) {
    setOpenProjectId(id)
    // «Continue working» на Home сразу подхватывает последний открытый проект
    setUser((u) => (u ? { ...u, lastOpenedProjectId: id } : u))
  }

  function handleProjectSaved(saved: ApiProject) {
    if (ws.projects.some((p) => p.id === saved.id)) ws.replaceProject(saved)
    else ws.addProject(saved)
  }

  const closeTaskModal = useCallback(() => setTaskModal(null), [])
  const closeProjectModal = useCallback(() => setProjectModal(null), [])

  const actions: TaskActions = {
    onToggle: ws.toggleTask,
    onMove: ws.moveTask,
    onCreate: (preset) => setTaskModal({ preset }),
    onEdit: (task) => setTaskModal({ task }),
  }

  const userName = user?.name?.split(' ')[0] || user?.email.split('@')[0] || 'there'

  function renderMain() {
    if (ws.loadError) {
      return (
        <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center justify-center px-4 py-32 text-center">
          <p className="text-sm font-medium text-foreground">{t('workspace.loadFailed')}</p>
          <p className="mt-1 text-sm text-muted-foreground">{localizeError(t, ws.loadError)}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={ws.reload}>
            {t('common.retry')}
          </Button>
        </div>
      )
    }

    if (openProjectId) {
      const project = ws.projects.find((p) => p.id === openProjectId)
      if (ws.loading) return <LoadingBlock label={t('workspace.loadingProject')} />
      if (!project) {
        return (
          <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center justify-center px-4 py-32 text-center">
            <p className="text-sm font-medium text-foreground">{t('workspace.projectNotFound')}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setOpenProjectId(null)}>
              {t('workspace.backToLibrary')}
            </Button>
          </div>
        )
      }
      return (
        <ProjectWorkspace
          project={project}
          tasks={ws.tasks.filter((t) => t.projectId === project.id)}
          actions={actions}
          onBack={() => setOpenProjectId(null)}
          onEditProject={(p) => setProjectModal({ project: p })}
        />
      )
    }

    switch (nav) {
      case 'home':
      case 'projects':
        return (
          <ProjectsLibrary
            projects={ws.projects}
            loading={ws.loading}
            onOpenProject={openProject}
            onCreateProject={() => setProjectModal({})}
            lastOpenedProjectId={user?.lastOpenedProjectId}
          />
        )
      case 'my-day':
        if (ws.loading) return <LoadingBlock label={t('workspace.loadingTasks')} />
        return <MyDay tasks={ws.tasks} userName={userName} actions={actions} />
      case 'all-tasks':
        if (ws.loading) return <LoadingBlock label={t('workspace.loadingTasks')} />
        return <AllTasks tasks={ws.tasks} projects={ws.projects} actions={actions} />
      case 'analytics':
        if (ws.loading) return <LoadingBlock label={t('workspace.loadingAnalytics')} />
        return <Analytics tasks={ws.tasks} projects={ws.projects} />
      case 'calendar':
        if (ws.loading) return <LoadingBlock label={t('workspace.loadingCalendar')} />
        return (
          <CalendarScreen
            tasks={ws.tasks}
            projects={ws.projects}
            onEdit={(task) => setTaskModal({ task })}
          />
        )
      case 'settings':
        return <SettingsScreen user={user} />
      default:
        return <ComingSoon label={t(`nav.${nav}`)} body={t('comingSoon.body')} />
    }
  }

  if (checkingAuth) {
    return (
      <div className="flex h-svh items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
      </div>
    )
  }

  return (
    <div className="flex h-svh overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar active={nav} onNavigate={navigate} tasks={ws.tasks} />
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
              tasks={ws.tasks}
            />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          onMenu={() => setMobileNav(true)}
          onCreateProject={() => setProjectModal({})}
          user={user}
          onLogout={handleLogout}
        />
        <main className="scrollbar-thin flex-1 overflow-y-auto">{renderMain()}</main>
      </div>

      <CreateProjectModal
        open={projectModal !== null}
        project={projectModal?.project}
        onClose={closeProjectModal}
        onSaved={handleProjectSaved}
      />

      <TaskModal
        state={taskModal}
        projects={ws.projects}
        onClose={closeTaskModal}
        onCreate={ws.addTask}
        onUpdate={(id, patch) => ws.patchTask(id, patch, { throwOnError: true })}
        onDelete={(id) => ws.removeTask(id, { throwOnError: true })}
      />

      {ws.toast && (
        <div
          role="alert"
          className="fixed right-4 bottom-4 z-[70] flex max-w-sm items-start gap-3 rounded-xl border border-destructive/40 bg-card px-4 py-3 text-sm text-foreground shadow-xl"
        >
          <span className="flex-1">{localizeError(t, ws.toast)}</span>
          <button
            onClick={ws.dismissToast}
            aria-label={t('common.dismiss')}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </div>
  )
}

function LoadingBlock({ label }: { label: string }) {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] items-center justify-center px-4 py-32">
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

function ComingSoon({ label, body }: { label: string; body: string }) {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center justify-center px-4 py-32 text-center">
      <div className={cn('flex size-14 items-center justify-center rounded-2xl bg-muted')}>
        <span className="font-mono text-xl text-muted-foreground">
          {label[0].toUpperCase()}
        </span>
      </div>
      <h1 className="mt-5 text-xl font-semibold text-foreground">{label}</h1>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>
    </div>
  )
}
