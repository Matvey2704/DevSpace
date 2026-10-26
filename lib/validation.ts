// Лёгкая ручная валидация тел запросов (без внешних библиотек).
// Каждая функция возвращает { data } с очищенными полями либо { error } с текстом для юзера.

export const PROJECT_STATUSES = ["planning", "in_progress", "paused", "completed"] as const;
export const TASK_STATUSES = ["ideas", "planned", "in_progress", "review", "completed"] as const;
export const PRIORITIES = ["high", "medium", "low"] as const;

export type ProjectStatusValue = (typeof PROJECT_STATUSES)[number];
export type TaskStatusValue = (typeof TASK_STATUSES)[number];
export type PriorityValue = (typeof PRIORITIES)[number];

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

function isOneOf<T extends readonly string[]>(list: T, v: unknown): v is T[number] {
  return typeof v === "string" && (list as readonly string[]).includes(v);
}

function str(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s.length <= max ? s : null;
}

function stringArray(v: unknown, maxItems: number, maxLen: number): string[] | null {
  if (!Array.isArray(v) || v.length > maxItems) return null;
  const out: string[] = [];
  for (const item of v) {
    if (typeof item !== "string") return null;
    const s = item.trim();
    if (!s) continue;
    if (s.length > maxLen) return null;
    out.push(s);
  }
  return out;
}

// "YYYY-MM-DD" -> Date в UTC-полночь. Дедлайны храним как «дату без времени»,
// поэтому на клиенте сравниваем их по строке ключа, а не по таймзоне.
export function parseDateKey(v: unknown): Date | null | undefined {
  if (v === null) return null;
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return undefined;
  const d = new Date(`${v}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

// Обложка проекта: null (убрать), путь к пресету из /public/covers
// или data:image/... (загруженная картинка, уже сжатая на клиенте)
const MAX_COVER_LENGTH = 1_500_000;
const COVER_DATA_URL = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
const COVER_PRESET = /^\/covers\/[A-Za-z0-9._-]+\.(png|jpe?g|webp)$/;

export function parseCover(v: unknown): string | null | undefined {
  if (v === null || v === "") return null;
  if (typeof v !== "string") return undefined;
  if (COVER_PRESET.test(v)) return v;
  if (v.length <= MAX_COVER_LENGTH && COVER_DATA_URL.test(v)) return v;
  return undefined;
}

export type ProjectFields = {
  name?: string;
  short?: string;
  description?: string;
  cover?: string | null;
  tech?: string[];
  accent?: string | null;
  currentTask?: string | null;
  status?: ProjectStatusValue;
};

export function parseProjectBody(
  body: Record<string, unknown>,
  mode: "create" | "update",
): Result<ProjectFields> {
  const data: ProjectFields = {};

  if (body.name !== undefined || mode === "create") {
    const name = str(body.name, 100);
    if (!name) return { ok: false, error: "Имя проекта обязательно (до 100 символов)" };
    data.name = name;
  }
  if (body.short !== undefined) {
    const v = str(body.short, 200);
    if (v === null) return { ok: false, error: "Короткое описание — строка до 200 символов" };
    data.short = v;
  }
  if (body.description !== undefined) {
    const v = str(body.description, 2000);
    if (v === null) return { ok: false, error: "Описание — строка до 2000 символов" };
    data.description = v;
  }
  if (body.cover !== undefined) {
    const v = parseCover(body.cover);
    if (v === undefined) return { ok: false, error: "Некорректная обложка (допустимы JPEG/PNG/WebP до ~1 МБ)" };
    data.cover = v;
  }
  if (body.tech !== undefined) {
    const v = stringArray(body.tech, 20, 30);
    if (!v) return { ok: false, error: "Технологии — массив строк (до 20 шт.)" };
    data.tech = v;
  }
  if (body.accent !== undefined) {
    if (body.accent !== null && str(body.accent, 60) === null) {
      return { ok: false, error: "Некорректный accent" };
    }
    data.accent = body.accent === null ? null : (body.accent as string);
  }
  if (body.currentTask !== undefined) {
    if (body.currentTask !== null && str(body.currentTask, 200) === null) {
      return { ok: false, error: "Некорректная текущая задача" };
    }
    data.currentTask = body.currentTask === null ? null : (body.currentTask as string);
  }
  if (body.status !== undefined) {
    if (!isOneOf(PROJECT_STATUSES, body.status)) return { ok: false, error: "Некорректный статус проекта" };
    data.status = body.status;
  }
  return { ok: true, data };
}

export type TaskFields = {
  projectId?: string;
  title?: string;
  description?: string | null;
  status?: TaskStatusValue;
  priority?: PriorityValue;
  tags?: string[];
  deadline?: Date | null;
  estimate?: string | null;
  done?: boolean;
  myDayDate?: Date | null;
};

export function parseTaskBody(
  body: Record<string, unknown>,
  mode: "create" | "update",
): Result<TaskFields> {
  const data: TaskFields = {};

  if (mode === "create") {
    if (typeof body.projectId !== "string" || !body.projectId) {
      return { ok: false, error: "Не указан проект" };
    }
    data.projectId = body.projectId;
  }
  if (body.title !== undefined || mode === "create") {
    const title = str(body.title, 200);
    if (!title) return { ok: false, error: "Название задачи обязательно (до 200 символов)" };
    data.title = title;
  }
  if (body.description !== undefined) {
    if (body.description === null) data.description = null;
    else {
      const v = str(body.description, 4000);
      if (v === null) return { ok: false, error: "Описание — строка до 4000 символов" };
      data.description = v || null;
    }
  }
  if (body.status !== undefined) {
    if (!isOneOf(TASK_STATUSES, body.status)) return { ok: false, error: "Некорректный статус задачи" };
    data.status = body.status;
  }
  if (body.priority !== undefined) {
    if (!isOneOf(PRIORITIES, body.priority)) return { ok: false, error: "Некорректный приоритет" };
    data.priority = body.priority;
  }
  if (body.tags !== undefined) {
    const v = stringArray(body.tags, 10, 30);
    if (!v) return { ok: false, error: "Теги — массив строк (до 10 шт.)" };
    data.tags = v;
  }
  if (body.deadline !== undefined) {
    const v = parseDateKey(body.deadline);
    if (v === undefined) return { ok: false, error: "Дедлайн должен быть датой YYYY-MM-DD или null" };
    data.deadline = v;
  }
  if (body.myDayDate !== undefined) {
    const v = parseDateKey(body.myDayDate);
    if (v === undefined) return { ok: false, error: "myDayDate должен быть датой YYYY-MM-DD или null" };
    data.myDayDate = v;
  }
  if (body.estimate !== undefined) {
    if (body.estimate === null) data.estimate = null;
    else {
      const v = str(body.estimate, 20);
      if (v === null) return { ok: false, error: "Оценка времени — короткая строка, например 2h" };
      data.estimate = v || null;
    }
  }
  if (body.done !== undefined) {
    if (typeof body.done !== "boolean") return { ok: false, error: "done должен быть boolean" };
    data.done = body.done;
  }
  return { ok: true, data };
}
