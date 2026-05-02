export type Priority = "High" | "Medium" | "Low";

export type Task = {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  dueDate: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string | null;
};

export const STORAGE_KEY = "productivity-organizer:tasks";

export const priorityWeight: Record<Priority, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
};

export function createTask(input: {
  title: string;
  description?: string;
  priority: Priority;
  dueDate: string;
}): Task {
  const now = new Date().toISOString();

  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: input.title.trim(),
    description: input.description?.trim() || undefined,
    priority: input.priority,
    dueDate: input.dueDate,
    completed: false,
    createdAt: now,
  };
}

export function formatDate(date: string) {
  if (!date) return "No due date";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

export function isToday(value?: string) {
  if (!value) return false;

  const date = new Date(value);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export type TaskFilter = "All" | "Active" | "Completed";

export type SortMode = "dueDate" | "priority";

export function filterTasks(tasks: Task[], filter: TaskFilter) {
  if (filter === "Active") {
    return tasks.filter((task) => !task.completed);
  }

  if (filter === "Completed") {
    return tasks.filter((task) => task.completed);
  }

  return tasks;
}

export function sortTasks(tasks: Task[], sortMode: SortMode) {
  return [...tasks].sort((firstTask, secondTask) => {
    if (sortMode === "priority") {
      return priorityWeight[secondTask.priority] - priorityWeight[firstTask.priority];
    }

    return firstTask.dueDate.localeCompare(secondTask.dueDate);
  });
}

export function getCompletedTodayCount(tasks: Task[]) {
  return tasks.filter((task) => task.completed && isToday(task.completedAt ?? undefined)).length;
}

export function getInProgressCount(tasks: Task[]) {
  return tasks.filter((task) => !task.completed).length;
}
