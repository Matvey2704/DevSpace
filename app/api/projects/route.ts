import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { badRequest, readJson, requireSession } from "@/lib/api-helpers";
import { withProgress } from "@/lib/projects-server";
import { parseProjectBody } from "@/lib/validation";

export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;

  const projects = await prisma.project.findMany({
    where: { userId: session.userId },
    include: { tasks: { select: { done: true, deletedAt: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ projects: projects.map(withProgress) });
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  const body = await readJson(req);
  if (!body) return badRequest("Некорректное тело запроса");

  const parsed = parseProjectBody(body, "create");
  if (!parsed.ok) return badRequest(parsed.error);
  const { name, short, description, cover, tech, accent, currentTask, status } = parsed.data;

  const project = await prisma.project.create({
    data: {
      name: name!,
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
