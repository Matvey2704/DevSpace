-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "myDayDate" TIMESTAMP(3);

-- Уже выполненные задачи: считаем датой завершения момент последнего обновления
UPDATE "Task" SET "completedAt" = "updatedAt" WHERE "done" = true AND "completedAt" IS NULL;
