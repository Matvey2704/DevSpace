import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { badRequest, notFound, readJson, requireSession, touchProject } from "@/lib/api-helpers";
import { parseTaskBody } from "@/lib/validation";

const withProject = { project: { select: { id: true, name: true } } } as const;

// Все (не удалённые) задачи текущего юзера. ?projectId=... — только задачи одного проекта
export async function GET(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  const projectId = req.nextUrl.searchParams.get("projectId");

  const tasks = await prisma.task.findMany({
    where: {
      deletedAt: null,
      project: { userId: session.userId },
      ...(projectId ? { projectId } : {}),
    },
    include: withProject,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ tasks });
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  const body = await readJson(req);
  if (!body) return badRequest("Некорректное тело запроса");

  const parsed = parseTaskBody(body, "create");
  if (!parsed.ok) return badRequest(parsed.error);
  const d = parsed.data;

  const project = await prisma.project.findUnique({ where: { id: d.projectId! } });
  if (!project || project.userId !== session.userId) return notFound("Проект не найден");

  // Инвариант: done <=> status === "completed"
  const status = d.status ?? (d.done ? "completed" : "ideas");
  const done = status === "completed";

  const task = await prisma.task.create({
    data: {
      projectId: project.id,
      title: d.title!,
      description: d.description ?? null,
      status,
      priority: d.priority ?? "medium",
      tags: d.tags ?? [],
      deadline: d.deadline ?? null,
      estimate: d.estimate ?? null,
      myDayDate: d.myDayDate ?? null,
      done,
      completedAt: done ? new Date() : null,
    },
    include: withProject,
  });

  await touchProject(project.id);
  return NextResponse.json({ task }, { status: 201 });
}
