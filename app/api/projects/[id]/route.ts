import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { badRequest, notFound, readJson, requireSession } from "@/lib/api-helpers";
import { withProgress } from "@/lib/projects-server";
import { parseProjectBody } from "@/lib/validation";

// Проверяет, что проект существует и принадлежит текущему юзеру.
// Используем во всех ручках ниже, чтобы никто не мог трогать чужие проекты по id
async function getOwnedProject(id: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: { tasks: { select: { done: true, deletedAt: true } } },
  });
  if (!project || project.userId !== userId) return null;
  return project;
}

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { id } = await params;
  const project = await getOwnedProject(id, session.userId);
  if (!project) return notFound("Проект не найден");

  return NextResponse.json({ project: withProgress(project) });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { id } = await params;
  const existing = await getOwnedProject(id, session.userId);
  if (!existing) return notFound("Проект не найден");

  const body = await readJson(req);
  if (!body) return badRequest("Некорректное тело запроса");

  const parsed = parseProjectBody(body, "update");
  if (!parsed.ok) return badRequest(parsed.error);

  const updated = await prisma.project.update({
    where: { id },
    data: parsed.data,
    include: { tasks: { select: { done: true, deletedAt: true } } },
  });

  return NextResponse.json({ project: withProgress(updated) });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { id } = await params;
  const existing = await getOwnedProject(id, session.userId);
  if (!existing) return notFound("Проект не найден");

  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
