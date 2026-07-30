import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";

// Вызывается фронтом, когда юзер заходит в проект (открывает Project Workspace).
// Запоминаем id проекта у юзера, чтобы на Home карточка "Continue working" сама
// подхватывала последний открытый проект, а не была захардкожена
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { id } = await params;

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project || project.userId !== session.userId) {
    return NextResponse.json({ error: "Проект не найден" }, { status: 404 });
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: { lastOpenedProjectId: id },
  });

  return NextResponse.json({ ok: true });
}