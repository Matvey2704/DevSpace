import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";

// Считаем прогресс проекта на лету из его задач,
// чтобы progress/tasksDone/tasksTotal никогда не рассинхронизировались с реальными задачами
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

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { userId: session.userId },
    include: { tasks: { select: { done: true, deletedAt: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ projects: projects.map(withProgress) });
}

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
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

  if (!name) {
    return NextResponse.json({ error: "Имя проекта обязательно" }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: {
      name,
      short: short ?? "",
      description: description ?? "",
      cover,
      tech: tech ?? [],
      accent,
      currentTask,
      status: status ?? "planning",
      userId: session.userId,
    },
    include: { tasks: { select: { done: true, deletedAt: true } } },
  });

  return NextResponse.json({ project: withProgress(project) }, { status: 201 });
}