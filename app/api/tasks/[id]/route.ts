import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { badRequest, notFound, readJson, requireSession, touchProject } from "@/lib/api-helpers";
import { parseTaskBody, type TaskStatusValue } from "@/lib/validation";

const withProject = { project: { select: { id: true, name: true } } } as const;

// Задача должна существовать, не быть удалённой и лежать в проекте текущего юзера
async function getOwnedTask(id: string, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id },
    include: { project: { select: { id: true, name: true, userId: true } } },
  });
  if (!task || task.deletedAt || task.project.userId !== userId) return null;
  return task;
}

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { id } = await params;
  const existing = await getOwnedTask(id, session.userId);
  if (!existing) return notFound("Задача не найдена");

  const body = await readJson(req);
  if (!body) return badRequest("Некорректное тело запроса");

  const parsed = parseTaskBody(body, "update");
  if (!parsed.ok) return badRequest(parsed.error);
  const { done: doneInput, status: statusInput, ...rest } = parsed.data;

  // Держим status и done согласованными (done <=> status === "completed"):
  //  - пришёл status  -> done выводим из него
  //  - пришёл done    -> done=true двигает задачу в completed,
  //                      done=false возвращает completed-задачу в planned
  let status: TaskStatusValue | undefined = statusInput;
  if (status === undefined && doneInput !== undefined) {
    status = doneInput
      ? "completed"
      : existing.status === "completed"
        ? "planned"
        : existing.status;
  }

  const statusFields: { status?: TaskStatusValue; done?: boolean; completedAt?: Date | null } = {};
  if (status !== undefined) {
    const nowDone = status === "completed";
    statusFields.status = status;
    statusFields.done = nowDone;
    if (nowDone && !existing.done) statusFields.completedAt = new Date();
    if (!nowDone) statusFields.completedAt = null;
  }

  const task = await prisma.task.update({
    where: { id },
    data: { ...rest, ...statusFields },
    include: withProject,
  });

  await touchProject(existing.projectId);
  return NextResponse.json({ task });
}

// Мягкое удаление: ставим deletedAt, строка остаётся в БД
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { id } = await params;
  const existing = await getOwnedTask(id, session.userId);
  if (!existing) return notFound("Задача не найдена");

  await prisma.task.update({ where: { id }, data: { deletedAt: new Date() } });
  await touchProject(existing.projectId);
  return NextResponse.json({ ok: true });
}
