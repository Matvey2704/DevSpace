import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";

function withProgress(project: {
  tasks: { done: boolean; deletedAt: Date | null }[];
  [key: string]: unknown;
}) {
  const activeTasks = project.tasks.filter((t) => !t.deletedAt);
  const tasksTotal = activeTasks.length;
  const tasksDone = activeTasks.filter((t) => t.done).length;
  const progress = tasksTotal === 0 ? 0 : Math.round((tasksDone / tasksTotal) * 100);
  const { tasks: _tasks, ...rest } = project;
  return { ...rest, tasksTotal, tasksDone, progress };
}

// Проверяет, что проект существует и принадлежит текущему юзеру.
// Используем во всех трёх ручках ниже, чтобы никто не мог трогать чужие проекты по id
async function getOwnedProject(id: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: { tasks: true },
  });
  if (!project || project.userId !== userId) return null;
  return project;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { id } = await params;
  const project = await getOwnedProject(id, session.userId);
  if (!project) {
    return NextResponse.json({ error: "Проект не найден" }, { status: 404 });
  }

  const activeTasks = project.tasks.filter((t) => !t.deletedAt);
  const tasksTotal = activeTasks.length;
  const tasksDone = activeTasks.filter((t) => t.done).length;
  const progress = tasksTotal === 0 ? 0 : Math.round((tasksDone / tasksTotal) * 100);

  return NextResponse.json({
    project: { ...project, tasksTotal, tasksDone, progress },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getOwnedProject(id, session.userId);
  if (!existing) {
    return NextResponse.json({ error: "Проект не найден" }, { status: 404 });
  }

  const body = await req.json();
  const { name, short, description, cover, tech, accent, currentTask, status } =
    body as {
      name?: string;
      short?: string;
      description?: string;
      cover?: string;
      tech?: string[];
      accent?: string;
      currentTask?: string;
      status?: "planning" | "in_progress" | "paused" | "completed";
    };

  const updated = await prisma.project.update({
    where: { id },
    data: { name, short, description, cover, tech, accent, currentTask, status },
    include: { tasks: { select: { done: true, deletedAt: true } } },
  });

  return NextResponse.json({ project: withProgress(updated) });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getOwnedProject(id, session.userId);
  if (!existing) {
    return NextResponse.json({ error: "Проект не найден" }, { status: 404 });
  }

  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}