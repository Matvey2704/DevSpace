'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Project, ProjectStatus } from '@/lib/data'
import {
  fetchProjects,
  markProjectOpened,
  statusToUi,
  formatRelativeTime,
  type ApiProject,
} from '@/lib/api-client'
import { ProgressBar } from '../primitives'
import { ProjectCard } from '../project-card'
import { ArrowUpDown, Play, Plus, Search } from 'lucide-react'

const filters: { key: ProjectStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'planning', label: 'Planning' },
  { key: 'paused', label: 'Paused' },
  { key: 'completed', label: 'Completed' },
]

const sortOptions = [
  { key: 'updated', label: 'Last updated' },
  { key: 'name', label: 'Name' },
  { key: 'progress', label: 'Progress' },
] as const
type SortKey = (typeof sortOptions)[number]['key']

function toUiProject(p: ApiProject): Project {
  return {
    id: p.id,
    name: p.name,
    short: p.short,
    description: p.description,
    cover: p.cover ?? '',
    status: statusToUi(p.status),
    progress: p.progress,
    tasksDone: p.tasksDone,
    tasksTotal: p.tasksTotal,
    tech: p.tech,
    lastActivity: formatRelativeTime(p.updatedAt),
    accent: p.accent ?? 'var(--primary)',
    currentTask: p.currentTask ?? '',
  }
}

export function ProjectsLibrary({
  onOpenProject,
  onCreateProject,
  lastOpenedProjectId,
}: {
  onOpenProject: (id: string) => void
  onCreateProject: () => void
  lastOpenedProjectId?: string | null
}) {
  const [filter, setFilter] = useState<ProjectStatus | 'all'>('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('updated')
  const [sortMenuOpen, setSortMenuOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchProjects()
      setProjects(data.map(toUiProject))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function handleOpen(id: string) {
    markProjectOpened(id)
    onOpenProject(id)
  }

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-center px-4 py-32">
        <p className="text-sm text-muted-foreground">Loading projects…</p>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center justify-center px-4 py-32 text-center">
        <p className="text-sm font-medium text-foreground">No projects yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Create your first project to get started.
        </p>
        <Button size="sm" className="mt-4" onClick={onCreateProject}>
          <Plus className="size-4" />
          Create Project
        </Button>
      </div>
    )
  }

  const featured =
    projects.find((p) => p.id === lastOpenedProjectId) ?? projects[0]

  let list = projects.filter((p) => {
    const matchStatus = filter === 'all' || p.status === filter
    const matchQuery = p.name.toLowerCase().includes(query.toLowerCase())
    return matchStatus && matchQuery
  })

  list = [...list].sort((a, b) => {
    if (sort === 'name') return a.name.localeCompare(b.name)
    if (sort === 'progress') return b.progress - a.progress
    return 0 // 'updated' — уже пришли отсортированными с сервера по updatedAt desc
  })

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-8 md:py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-balance md:text-3xl">
          My Projects
        </h1>
        <p className="text-sm text-muted-foreground">
          Your visual library of everything you&apos;re building.
        </p>
      </div>

      {/* Continue working */}
      <section className="mt-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-primary" />
          <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Continue working
          </h2>
        </div>
        <div className="group relative block w-full overflow-hidden rounded-3xl border border-border text-left">
          <button
            onClick={() => handleOpen(featured.id)}
            aria-label={`Open ${featured.name}`}
            className="absolute inset-0 z-0"
          >
            <img
              src={featured.cover || '/placeholder.svg'}
              alt=""
              className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
            <span className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </button>
          <div className="pointer-events-none relative z-10 flex flex-col gap-5 p-6 md:p-10 lg:max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-xl border border-white/15 bg-black/40 text-base font-semibold text-white backdrop-blur-md">
                {featured.name
                  .split(' ')
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join('')}
              </span>
              <div>
                <h3 className="text-2xl font-semibold text-foreground">
                  {featured.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {featured.short}
                </p>
              </div>
            </div>
            <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
              {featured.description}
            </p>
            <div className="max-w-md space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Overall progress</span>
                <span className="font-mono font-medium text-foreground">
                  {featured.progress}%
                </span>
              </div>
              <ProgressBar value={featured.progress} className="h-2" />
            </div>
            <div className="pointer-events-auto flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                className="shadow-sm"
                onClick={() => handleOpen(featured.id)}
              >
                <Play className="size-4" />
                Continue
              </Button>
              {featured.currentTask && (
                <div className="rounded-lg border border-border bg-card/70 px-3 py-2 text-xs backdrop-blur-md">
                  <span className="text-muted-foreground">Current task · </span>
                  <span className="font-medium text-foreground">
                    {featured.currentTask}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Controls */}
      <section className="mt-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects…"
              className="h-9 w-full rounded-lg border border-border bg-card pr-3 pl-9 text-sm placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-card p-1">
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                    filter === f.key
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortMenuOpen((v) => !v)}
              >
                <ArrowUpDown className="size-3.5" />
                Sort
              </Button>
              {sortMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setSortMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-2 w-40 rounded-lg border border-border bg-card p-1 shadow-lg">
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => {
                          setSort(opt.key)
                          setSortMenuOpen(false)
                        }}
                        className={cn(
                          'flex w-full items-center rounded-md px-3 py-2 text-sm hover:bg-muted',
                          sort === opt.key
                            ? 'text-foreground font-medium'
                            : 'text-muted-foreground',
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Grid */}
        {list.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((p) => (
              <ProjectCard key={p.id} project={p} onOpen={handleOpen} />
            ))}
          </div>
        ) : (
          <div className="mt-5 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <Search className="size-5 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">
              No projects found
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different filter or create a new project.
            </p>
            <Button size="sm" className="mt-4" onClick={onCreateProject}>
              <Plus className="size-4" />
              Create Project
            </Button>
          </div>
        )}
      </section>
    </div>
  )
}