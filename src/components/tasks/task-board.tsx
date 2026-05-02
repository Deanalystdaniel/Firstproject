"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowDownUp,
  CalendarClock,
  CheckCircle2,
  CircleDotDashed,
  ListTodo,
  Plus,
  Trash2,
} from "lucide-react";

import { DailyTip } from "@/components/dashboard/daily-tip";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createTask,
  filterTasks,
  formatDate,
  getCompletedTodayCount,
  getInProgressCount,
  sortTasks,
  STORAGE_KEY,
  type Priority,
  type SortMode,
  type Task,
  type TaskFilter,
} from "@/lib/tasks";
import { cn } from "@/lib/utils";

const priorityStyles: Record<Priority, string> = {
  High: "border-red-400/30 bg-red-500/10 text-red-200",
  Medium: "border-amber-400/30 bg-amber-500/10 text-amber-100",
  Low: "border-emerald-400/30 bg-emerald-500/10 text-emerald-100",
};

const filterOptions: TaskFilter[] = ["All", "Active", "Completed"];
const priorityOptions: Priority[] = ["High", "Medium", "Low"];

export function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskFilter>("All");
  const [sortMode, setSortMode] = useState<SortMode>("dueDate");
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Medium" as Priority,
    dueDate: "",
  });
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const storedTasks = window.localStorage.getItem(STORAGE_KEY);

    if (storedTasks) {
      try {
        setTasks(JSON.parse(storedTasks) as Task[]);
      } catch {
        // If localStorage is manually edited, start safely with an empty list.
        setTasks([]);
      }
    }

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [isHydrated, tasks]);

  const visibleTasks = useMemo(
    () => sortTasks(filterTasks(tasks, filter), sortMode),
    [filter, sortMode, tasks],
  );

  const stats = useMemo(
    () => ({
      total: tasks.length,
      completedToday: getCompletedTodayCount(tasks),
      inProgress: getInProgressCount(tasks),
    }),
    [tasks],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim()) {
      return;
    }

    setTasks((currentTasks) => [
      createTask({
        title: form.title,
        description: form.description,
        priority: form.priority,
        dueDate: form.dueDate,
      }),
      ...currentTasks,
    ]);

    setForm({
      title: "",
      description: "",
      priority: "Medium",
      dueDate: "",
    });
  }

  function toggleTask(taskId: string) {
    const completedAt = new Date().toISOString();

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
              completedAt: task.completed ? null : completedAt,
            }
          : task,
      ),
    );
  }

  function deleteTask(taskId: string) {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <section className="grid gap-6 lg:grid-cols-[1.45fr_0.85fr] lg:items-stretch">
        <Card className="overflow-hidden">
          <CardContent className="relative p-6 sm:p-8">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />
            <div className="absolute bottom-0 left-12 h-32 w-32 rounded-full bg-sky-500/10 blur-3xl" />
            <div className="relative flex flex-col gap-5">
              <Badge className="w-fit border-white/10 bg-white/10 text-slate-200">
                Productivity Organizer
              </Badge>
              <div className="max-w-2xl space-y-3">
                <p className="text-sm font-medium uppercase tracking-[0.32em] text-slate-500">
                  Welcome back
                </p>
                <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Organize today with calm focus.
                </h1>
                <p className="max-w-xl text-base leading-7 text-slate-400">
                  Capture tasks, prioritize what matters, and keep momentum visible in a clean
                  workspace that stays on your device.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <DailyTip />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={ListTodo}
          label="Total Tasks"
          value={stats.total}
          detail="All items in your local planner"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed Today"
          value={stats.completedToday}
          detail="Finished since local midnight"
        />
        <StatCard
          icon={CircleDotDashed}
          label="In Progress"
          value={stats.inProgress}
          detail="Active tasks still moving"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-violet-300" />
              Add a task
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300" htmlFor="title">
                  Title
                </label>
                <Input
                  id="title"
                  placeholder="Draft weekly roadmap"
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300" htmlFor="description">
                  Description
                </label>
                <Textarea
                  id="description"
                  placeholder="Optional notes, context, or next action..."
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300" htmlFor="priority">
                    Priority
                  </label>
                  <select
                    className="flex h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-100 shadow-inner outline-none transition file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 hover:border-white/20 focus-visible:ring-2 focus-visible:ring-cyan-300/40"
                    id="priority"
                    value={form.priority}
                    onChange={(event) =>
                      setForm({ ...form, priority: event.target.value as Priority })
                    }
                  >
                    {priorityOptions.map((priority) => (
                      <option className="bg-slate-950 text-slate-100" key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300" htmlFor="dueDate">
                    Due date
                  </label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={form.dueDate}
                    onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
                    required
                  />
                </div>
              </div>

              <Button className="w-full" size="lg" type="submit">
                Add task
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="gap-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-sky-300" />
                Tasks
              </CardTitle>
              <Badge variant="outline">{visibleTasks.length} visible</Badge>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex rounded-xl border border-white/10 bg-slate-950/70 p-1">
                {filterOptions.map((option) => (
                  <Button
                    className={cn(
                      "h-9 flex-1 px-3 text-xs sm:flex-none",
                      filter === option
                        ? "bg-white text-slate-950 hover:bg-white"
                        : "bg-transparent text-slate-400 hover:bg-white/10 hover:text-white",
                    )}
                    key={option}
                    onClick={() => setFilter(option)}
                    type="button"
                  >
                    {option}
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <ArrowDownUp className="h-4 w-4 text-slate-500" />
                <Select
                  aria-label="Sort tasks"
                  className="h-9 min-w-36"
                  onValueChange={(value) => setSortMode(value as SortMode)}
                  options={[
                    { value: "dueDate", label: "Due date" },
                    { value: "priority", label: "Priority" },
                  ]}
                  value={sortMode}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {visibleTasks.length > 0 ? (
              <div className="space-y-3">
                {visibleTasks.map((task) => (
                  <article
                    className={cn(
                      "group rounded-2xl border border-white/10 bg-slate-950/55 p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-slate-900/70",
                      task.completed && "opacity-65",
                    )}
                    key={task.id}
                  >
                    <div className="flex gap-4">
                      <Checkbox
                        aria-label={`Mark ${task.title} as ${task.completed ? "active" : "complete"}`}
                        checked={task.completed}
                        onCheckedChange={() => toggleTask(task.id)}
                      />
                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <h3
                              className={cn(
                                "text-base font-medium text-slate-100",
                                task.completed && "line-through decoration-slate-500",
                              )}
                            >
                              {task.title}
                            </h3>
                            {task.description ? (
                              <p className="mt-1 text-sm leading-6 text-slate-500">
                                {task.description}
                              </p>
                            ) : null}
                          </div>

                          <Button
                            aria-label={`Delete ${task.title}`}
                            className="h-9 w-9 shrink-0 border border-white/10 bg-white/[0.03] p-0 text-slate-500 opacity-100 hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-200 sm:opacity-0 sm:group-hover:opacity-100"
                            onClick={() => deleteTask(task.id)}
                            type="button"
                            variant="ghost"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={priorityStyles[task.priority]} variant="outline">
                            {task.priority}
                          </Badge>
                          <Badge variant="secondary">Due {formatDate(task.dueDate)}</Badge>
                          {task.completed ? (
                            <Badge className="border-emerald-400/20 bg-emerald-500/10 text-emerald-100">
                              Completed
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-8 text-center">
                <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <ListTodo className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">No tasks here yet</h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Add a task or switch filters to see what is waiting for your attention.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
