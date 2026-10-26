import { NextResponse } from "next/server";
import { getCurrentSession, type SessionPayload } from "./auth";
import { prisma } from "./prisma";

// Единая проверка авторизации для API-ручек.
// Использование:
//   const { session, error } = await requireSession();
//   if (error) return error;
export async function requireSession(): Promise<
  | { session: SessionPayload; error: null }
  | { session: null; error: NextResponse }
> {
  const session = await getCurrentSession();
  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ error: "Не авторизован" }, { status: 401 }),
    };
  }
  return { session, error: null };
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function notFound(message: string) {
  return NextResponse.json({ error: message }, { status: 404 });
}

// Безопасно читает JSON-тело: при кривом JSON возвращает null, а не бросает 500
export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await req.json();
    if (body && typeof body === "object" && !Array.isArray(body)) {
      return body as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

// Помечаем проект «обновлённым», когда меняются его задачи —
// от этого зависит сортировка "Last updated" и подпись "Updated 2h ago" в библиотеке
export async function touchProject(projectId: string) {
  await prisma.project.update({
    where: { id: projectId },
    data: { updatedAt: new Date() },
  });
}
