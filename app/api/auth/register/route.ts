import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signSession, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password, name } = body as {
    email?: string;
    password?: string;
    name?: string;
  };

  // Базовая валидация входных данных
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email и пароль обязательны" },
      { status: 400 }
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "Пароль должен быть не короче 6 символов" },
      { status: 400 }
    );
  }

  // Проверяем, не занят ли email
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Пользователь с таким email уже существует" },
      { status: 409 }
    );
  }

  // Хешируем пароль — в базе пароль в открытом виде никогда не хранится
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, passwordHash, name },
  });

  // Сразу логиним пользователя после регистрации
  const token = signSession({ userId: user.id, email: user.email });
  await setSessionCookie(token);

  return NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name },
  });
}