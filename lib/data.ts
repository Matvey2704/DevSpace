export type ProjectStatus = 'in-progress' | 'planning' | 'paused' | 'completed'
export type TaskStatus = 'ideas' | 'planned' | 'in-progress' | 'review' | 'completed'
export type Priority = 'high' | 'medium' | 'low'

export type Project = {
  id: string
  name: string
  short: string
  description: string
  cover: string
  status: ProjectStatus
  progress: number
  tasksDone: number
  tasksTotal: number
  tech: string[]
  lastActivity: string
  accent: string // hex-ish for tinting (via css var not needed)
  currentTask: string
}

export type Task = {
  id: string
  title: string
  description: string
  projectId: string
  status: TaskStatus
  priority: Priority
  tags: string[]
  deadline: string | null
  estimate: string
  created: string
  done: boolean
}

export const projects: Project[] = [
  {
    id: 'autohub',
    name: 'AutoHub',
    short: 'Personal vehicle management platform.',
    description:
      'A platform to manage vehicles, maintenance schedules, expenses and documents in one polished dashboard.',
    cover: '/covers/autohub.png',
    status: 'in-progress',
    progress: 72,
    tasksDone: 24,
    tasksTotal: 33,
    tech: ['React', 'TypeScript', 'NestJS'],
    lastActivity: 'Updated 2 hours ago',
    accent: 'var(--info)',
    currentTask: 'Fix mobile navigation',
  },
  {
    id: 'devspace',
    name: 'DevSpace',
    short: 'Personal developer workspace and project manager.',
    description:
      'A visual library for all your development projects with tasks, boards, notes and analytics in one place.',
    cover: '/covers/devspace.png',
    status: 'planning',
    progress: 18,
    tasksDone: 5,
    tasksTotal: 28,
    tech: ['React', 'TypeScript', 'PostgreSQL'],
    lastActivity: 'Updated yesterday',
    accent: 'var(--primary)',
    currentTask: 'Configure authentication',
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    short: 'Personal developer portfolio website.',
    description:
      'A refined personal portfolio showcasing projects, writing and experiments with fast, elegant pages.',
    cover: '/covers/portfolio.png',
    status: 'in-progress',
    progress: 55,
    tasksDone: 11,
    tasksTotal: 20,
    tech: ['React', 'TypeScript', 'SCSS'],
    lastActivity: 'Updated 4 days ago',
    accent: 'var(--warning)',
    currentTask: 'Write README',
  },
  {
    id: 'learning',
    name: 'Learning Platform',
    short: 'Platform for tracking learning and development.',
    description:
      'Track courses, skills and study streaks with progress visualizations and a personal learning roadmap.',
    cover: '/covers/learning.png',
    status: 'paused',
    progress: 36,
    tasksDone: 9,
    tasksTotal: 25,
    tech: ['React', 'Node.js'],
    lastActivity: 'Updated 2 weeks ago',
    accent: 'var(--success)',
    currentTask: 'Study WebSocket fundamentals',
  },
]

export const tasks: Task[] = [
  {
    id: 't1',
    title: 'Implement authentication',
    description: 'Email + password auth with sessions and protected routes.',
    projectId: 'devspace',
    status: 'in-progress',
    priority: 'high',
    tags: ['backend', 'security'],
    deadline: 'Today',
    estimate: '4h',
    created: 'Mar 12',
    done: false,
  },
  {
    id: 't2',
    title: 'Create vehicle filtering',
    description: 'Filter vehicles by type, status, and maintenance state.',
    projectId: 'autohub',
    status: 'in-progress',
    priority: 'medium',
    tags: ['frontend', 'ux'],
    deadline: 'Tomorrow',
    estimate: '3h',
    created: 'Mar 10',
    done: false,
  },
  {
    id: 't3',
    title: 'Fix mobile navigation',
    description: 'Drawer closes on route change and traps focus correctly.',
    projectId: 'autohub',
    status: 'review',
    priority: 'high',
    tags: ['frontend', 'bug'],
    deadline: 'Today',
    estimate: '2h',
    created: 'Mar 11',
    done: false,
  },
  {
    id: 't4',
    title: 'Configure RTK Query',
    description: 'Set up API slices and caching for the vehicles endpoint.',
    projectId: 'autohub',
    status: 'planned',
    priority: 'medium',
    tags: ['frontend', 'infra'],
    deadline: 'Mar 22',
    estimate: '2h',
    created: 'Mar 09',
    done: false,
  },
  {
    id: 't5',
    title: 'Create user profile page',
    description: 'Avatar, preferences, and connected accounts.',
    projectId: 'devspace',
    status: 'planned',
    priority: 'low',
    tags: ['frontend'],
    deadline: 'Mar 24',
    estimate: '5h',
    created: 'Mar 08',
    done: false,
  },
  {
    id: 't6',
    title: 'Write project documentation',
    description: 'README, contribution guide and architecture notes.',
    projectId: 'portfolio',
    status: 'ideas',
    priority: 'low',
    tags: ['docs'],
    deadline: null,
    estimate: '1h',
    created: 'Mar 05',
    done: false,
  },
  {
    id: 't7',
    title: 'Design landing hero',
    description: 'Cinematic hero with featured work and clear CTA.',
    projectId: 'portfolio',
    status: 'in-progress',
    priority: 'medium',
    tags: ['design'],
    deadline: 'Mar 21',
    estimate: '3h',
    created: 'Mar 07',
    done: false,
  },
  {
    id: 't8',
    title: 'Study WebSocket fundamentals',
    description: 'Real-time updates for the learning dashboard.',
    projectId: 'learning',
    status: 'planned',
    priority: 'medium',
    tags: ['learning'],
    deadline: 'Mar 25',
    estimate: '2h',
    created: 'Mar 06',
    done: false,
  },
  {
    id: 't9',
    title: 'Set up CI pipeline',
    description: 'Lint, type-check and test on every pull request.',
    projectId: 'devspace',
    status: 'completed',
    priority: 'medium',
    tags: ['infra'],
    deadline: 'Mar 04',
    estimate: '2h',
    created: 'Mar 01',
    done: true,
  },
  {
    id: 't10',
    title: 'Add maintenance reminders',
    description: 'Notify users before scheduled maintenance is due.',
    projectId: 'autohub',
    status: 'completed',
    priority: 'low',
    tags: ['feature'],
    deadline: 'Mar 03',
    estimate: '4h',
    created: 'Feb 27',
    done: true,
  },
  {
    id: 't11',
    title: 'Refine typography scale',
    description: 'Consistent type ramp across all pages.',
    projectId: 'portfolio',
    status: 'ideas',
    priority: 'low',
    tags: ['design'],
    deadline: null,
    estimate: '1h',
    created: 'Mar 02',
    done: false,
  },
  {
    id: 't12',
    title: 'Optimize course loading',
    description: 'Lazy-load lessons and cache progress locally.',
    projectId: 'learning',
    status: 'review',
    priority: 'high',
    tags: ['perf'],
    deadline: 'Mar 15',
    estimate: '3h',
    created: 'Feb 25',
    done: false,
  },
]

export const statusMeta: Record<
  ProjectStatus,
  { label: string; className: string; dot: string }
> = {
  'in-progress': {
    label: 'In Progress',
    className: 'bg-info/12 text-info border-info/25',
    dot: 'bg-info',
  },
  planning: {
    label: 'Planning',
    className: 'bg-primary/12 text-primary border-primary/25',
    dot: 'bg-primary',
  },
  paused: {
    label: 'Paused',
    className: 'bg-muted text-muted-foreground border-border',
    dot: 'bg-muted-foreground',
  },
  completed: {
    label: 'Completed',
    className: 'bg-success/12 text-success border-success/25',
    dot: 'bg-success',
  },
}

export const taskStatusMeta: Record<TaskStatus, { label: string; dot: string }> = {
  ideas: { label: 'Ideas', dot: 'bg-muted-foreground' },
  planned: { label: 'Planned', dot: 'bg-info' },
  'in-progress': { label: 'In Progress', dot: 'bg-primary' },
  review: { label: 'Review', dot: 'bg-warning' },
  completed: { label: 'Completed', dot: 'bg-success' },
}

export const priorityMeta: Record<
  Priority,
  { label: string; className: string; bar: string }
> = {
  high: {
    label: 'High',
    className: 'bg-destructive/12 text-destructive border-destructive/25',
    bar: 'bg-destructive',
  },
  medium: {
    label: 'Medium',
    className: 'bg-warning/12 text-warning border-warning/25',
    bar: 'bg-warning',
  },
  low: {
    label: 'Low',
    className: 'bg-muted text-muted-foreground border-border',
    bar: 'bg-muted-foreground',
  },
}

export function projectById(id: string) {
  return projects.find((p) => p.id === id)
}
