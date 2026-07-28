'use client'

import { cn } from '@/lib/utils'
import type { Project } from '@/lib/data'
import { ProgressBar, StatusBadge, Tag } from './primitives'
import { Clock } from 'lucide-react'

export function ProjectCard({
  project,
  onOpen,
}: {
  project: Project
  onOpen: (id: string) => void
}) {
  return (
    <button
      onClick={() => onOpen(project.id)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-black/30"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={project.cover || '/placeholder.svg'}
          alt={`${project.name} cover`}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
        <div className="absolute top-3 left-3">
          <StatusBadge status={project.status} className="backdrop-blur-md" />
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg border border-white/15 bg-black/40 text-sm font-semibold text-white backdrop-blur-md">
            {project.name
              .split(' ')
              .map((w) => w[0])
              .slice(0, 2)
              .join('')}
          </span>
          <span className="text-base font-semibold text-white drop-shadow">
            {project.name}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {project.short}
        </p>

        <div className="mt-auto space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-mono font-medium text-foreground">
              {project.progress}%
            </span>
          </div>
          <ProgressBar value={project.progress} />
          <div className="flex items-center justify-between pt-0.5 text-xs text-muted-foreground">
            <span>
              <span className="font-medium text-foreground">
                {project.tasksDone}
              </span>{' '}
              / {project.tasksTotal} tasks
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {project.tech.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>

        <div className="flex items-center gap-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          {project.lastActivity}
        </div>
      </div>
    </button>
  )
}
