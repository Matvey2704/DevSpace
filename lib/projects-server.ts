// Прогресс проекта считаем на лету из его задач, чтобы progress/tasksDone/tasksTotal
// никогда не рассинхронизировались с реальными задачами.
export function withProgress<
  T extends { tasks: { done: boolean; deletedAt: Date | null }[] },
>(project: T) {
  const activeTasks = project.tasks.filter((t) => !t.deletedAt);
  const tasksTotal = activeTasks.length;
  const tasksDone = activeTasks.filter((t) => t.done).length;
  const progress = tasksTotal === 0 ? 0 : Math.round((tasksDone / tasksTotal) * 100);

  const { tasks: _tasks, ...rest } = project;
  return { ...rest, tasksTotal, tasksDone, progress };
}
