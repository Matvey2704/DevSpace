// Тонкая обёртка над fetch для работы с нашим API.
// Всё общение с БД идёт только через эти функции — компоненты не знают про Prisma/БД напрямую.

export type ApiProjectStatus = "planning" | "in_progress" | "paused" | "completed";

export type ApiProject = {
  id: string;
  name: string;
  short: string;
  description: string;
  cover: string | null;
  status: ApiProjectStatus;
  tech: string[];
  accent: string | null;
  currentTask: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  tasksTotal: number;
  tasksDone: number;
  progress: number;
};

export async function fetchProjects(): Promise<ApiProject[]> {
  const res = await fetch("/api/projects");
  if (!res.ok) throw new Error("Не удалось загрузить проекты");
  const data = await res.json();
  return data.projects;
}

export async function createProject(input: {
  name: string;
  short?: string;
  description?: string;
  tech?: string[];
  status?: ApiProjectStatus;
  accent?: string;
}): Promise<ApiProject> {
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Не удалось создать проект");
  const data = await res.json();
  return data.project;
}

export async function updateProject(
  id: string,
  input: Partial<{
    name: string;
    short: string;
    description: string;
    tech: string[];
    status: ApiProjectStatus;
    currentTask: string;
  }>
): Promise<ApiProject> {
  const res = await fetch(`/api/projects/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Не удалось обновить проект");
  const data = await res.json();
  return data.project;
}

export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Не удалось удалить проект");
}

export async function markProjectOpened(id: string): Promise<void> {
  await fetch(`/api/projects/${id}/open`, { method: "POST" });
}

// Переводим "in_progress" (формат БД) <-> "in-progress" (формат, который уже использует UI)
export function statusToUi(status: ApiProjectStatus): "in-progress" | "planning" | "paused" | "completed" {
  return status === "in_progress" ? "in-progress" : status;
}

export function statusToApi(status: "in-progress" | "planning" | "paused" | "completed"): ApiProjectStatus {
  return status === "in-progress" ? "in_progress" : status;
}

// "2 часа назад" из ISO-строки updatedAt
export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Updated just now";
  if (minutes < 60) return `Updated ${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Updated ${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Updated yesterday";
  if (days < 7) return `Updated ${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "Updated 1 week ago";
  return `Updated ${weeks} weeks ago`;
}
